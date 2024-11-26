import React, { useEffect, createContext, useContext, useReducer } from "react";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import _ from "lodash";

import { FilterProvider } from "./FilterContext";
import { ZarrDataProvider } from "./ZarrDataContext";
import {
  COLOR_ENCODINGS,
  DOTPLOT_SCALES,
  LOCAL_STORAGE_KEY,
  MATRIXPLOT_SCALES,
  OBS_TYPES,
  PSEUDOSPATIAL_CATEGORICAL_MODES,
  VAR_SORT,
  VAR_SORT_ORDER,
  VIOLINPLOT_SCALES,
} from "../constants/constants";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // store for a week
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(error, query);
    },
  }),
});
// Type of queries to store responses
const persistKeys = [
  "obs/cols",
  "var/names",
  "obsm/keys",
  "var/histograms",
  "obs/bins",
  "obs/distribution",
];
const persistOptions = {
  persister: createSyncStoragePersister({
    storage: window.localStorage,
  }),
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey, state }) => {
      if (state.status === "success") {
        return persistKeys.includes(queryKey?.[0]);
      }
      return false;
    },
  },
  // @TODO: add maxAge and buster (app and api version numbers as busters)
};

const initialDataset = {
  varNamesCol: null,
  selectedObs: null,
  selectedObsm: null,
  selectedVar: null,
  selectedMultiObs: [],
  selectedMultiVar: [],
  colorEncoding: null,
  labelObs: [],
  varSets: [],
  sliceBy: {
    obs: false,
    polygons: false,
  },
  controls: {
    colorScale: "Viridis",
    valueRange: [0, 1],
    range: [0, 1],
    colorAxis: {
      dmin: 0,
      dmax: 1,
      cmin: 0,
      cmax: 1,
    },
    scale: {
      dotplot: DOTPLOT_SCALES.NONE,
      matrixplot: MATRIXPLOT_SCALES.NONE,
      violinplot: VIOLINPLOT_SCALES.WIDTH,
    },
    meanOnlyExpressed: false,
    expressionCutoff: 0.0,
  },
  diseaseDatasets: [],
  selectedDisease: null,
  varSort: {
    var: {
      sort: VAR_SORT.NONE,
      sortOrder: VAR_SORT_ORDER.ASC,
    },
    disease: {
      sort: VAR_SORT.NONE,
      sortOrder: VAR_SORT_ORDER.ASC,
    },
  },
  obsCols: null, // @TODO: implement specifying groups/categories for dropdowns
  imageUrl: null,
  pseudospatial: {
    maskSet: null,
    maskValues: null,
    categoricalMode: PSEUDOSPATIAL_CATEGORICAL_MODES.ACROSS.value,
  },
  polygons: {},
};

const initializer = (initialState) => {
  const localObj =
    (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {})[
      initialState.url
    ] || {};
  const keys = _.keys(initialState);
  const localValues = _.pick(localObj, keys);
  return _.assign(initialState, localValues);
};

export function DatasetProvider({ dataset_url, children, ...dataset_params }) {
  const [dataset, dispatch] = useReducer(
    datasetReducer,
    _.assign(
      initializer({ url: dataset_url, ...initialDataset }),
      dataset_params
    )
  );

  useEffect(() => {
    try {
      const localObj =
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ ...localObj, [dataset.url]: dataset })
      );
    } catch (err) {
      if (
        err.code === 22 ||
        err.code === 1014 ||
        err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        console.log("Browser storage quota exceeded");
      } else {
        console.log(err);
      }
    }
  }, [dataset]);

  return (
    <DatasetContext.Provider value={dataset}>
      <DatasetDispatchContext.Provider value={dispatch}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <ZarrDataProvider>
            <FilterProvider>{children}</FilterProvider>
          </ZarrDataProvider>
        </PersistQueryClientProvider>
      </DatasetDispatchContext.Provider>
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}

export function useDatasetDispatch() {
  return useContext(DatasetDispatchContext);
}

function datasetReducer(dataset, action) {
  switch (action.type) {
    case "select.obs": {
      return {
        ...dataset,
        selectedObs: action.obs,
        controls: {
          ...dataset.controls,
          range:
            action.obs?.type === OBS_TYPES.CATEGORICAL
              ? [0, 1]
              : dataset.controls.range,
        },
        colorEncoding:
          dataset.colorEncoding === COLOR_ENCODINGS.OBS && !action.obs
            ? null
            : dataset.colorEncoding,
        sliceBy: {
          ...dataset.sliceBy,
          obs: action.obs ? dataset.sliceBy.obs : false,
        },
      };
    }
    case "select.obsm": {
      return { ...dataset, selectedObsm: action.obsm };
    }
    case "select.var": {
      return { ...dataset, selectedVar: action.var };
    }
    case "select.multivar": {
      if (
        dataset.selectedMultiVar.find((i) =>
          action.var.isSet
            ? i.name === action.var.name
            : i.matrix_index === action.var.matrix_index
        )
      ) {
        return dataset;
      } else {
        return {
          ...dataset,
          selectedMultiVar: [...dataset.selectedMultiVar, action.var],
        };
      }
    }
    case "deselect.multivar": {
      return {
        ...dataset,
        selectedMultiVar: dataset.selectedMultiVar.filter((a) =>
          action.var.isSet
            ? a.name !== action.var.name
            : a.matrix_index !== action.var.matrix_index
        ),
      };
    }
    case "update.multivar": {
      return {
        ...dataset,
        selelectedMultiVar: dataset.selectedMultiVar.map((i) => {
          if (i.isSet) {
            return action.vars.find((s) => s.name === i.name);
          }
          return i;
        }),
      };
    }
    case "set.colorEncoding": {
      return { ...dataset, colorEncoding: action.value };
    }
    case "reset.multiVar": {
      return {
        ...dataset,
        selectedMultiVar: [],
        colorEncoding:
          dataset.colorEncoding === COLOR_ENCODINGS.VAR
            ? null
            : dataset.colorEncoding,
      };
    }
    case "reset.var": {
      return {
        ...dataset,
        selectedVar: null,
        colorEncoding:
          dataset.colorEncoding === COLOR_ENCODINGS.VAR
            ? null
            : dataset.colorEncoding,
      };
    }
    case "add.varSet": {
      return {
        ...dataset,
        varSets: [...dataset.varSets, action.varSet],
      };
    }
    case "remove.varSet": {
      return {
        ...dataset,
        varSets: dataset.varSets.filter((a) => a.name !== action.varSet.name),
      };
    }
    case "reset.varSets": {
      return {
        ...dataset,
        varSets: [],
      };
    }
    case "add.varSet.var": {
      const varSet = dataset.varSets.find((s) => s.name === action.varSet.name);
      if (varSet.vars.find((v) => _.isEqual(v, action.var))) {
        return dataset;
      } else {
        return {
          ...dataset,
          varSets: dataset.varSets.map((s) => {
            if (s.name === varSet.name) {
              return {
                ...s,
                vars: [...s.vars, action.var],
              };
            } else {
              return s;
            }
          }),
        };
      }
    }
    case "remove.varSet.var": {
      const varSet = dataset.varSets.find((s) => s.name === action.varSet.name);
      return {
        ...dataset,
        varSets: dataset.varSets.map((s) => {
          if (s.name === varSet.name) {
            return {
              ...s,
              vars: s.vars.filter((v) => v.name !== action.var.name),
            };
          } else {
            return s;
          }
        }),
      };
    }
    case "select.disease": {
      return {
        ...dataset,
        selectedDisease: {
          id: action.id,
          name: action.name,
        },
      };
    }
    case "reset.disease": {
      return {
        ...dataset,
        selectedDisease: null,
      };
    }
    case "set.controls.colorScale": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorScale: action.colorScale,
        },
      };
    }
    case "set.controls.valueRange": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          valueRange: action.valueRange,
        },
      };
    }
    case "set.controls.range": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          range: action.range,
        },
      };
    }
    case "set.controls.colorAxis": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorAxis: action.colorAxis,
        },
      };
    }
    case "set.controls.colorAxis.crange": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorAxis: {
            ...dataset.controls.colorAxis,
            cmin: action.cmin,
            cmax: action.cmax,
          },
        },
      };
    }
    case "set.controls.colorAxis.cmin": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorAxis: {
            ...dataset.controls.colorAxis,
            cmin: action.cmin,
          },
        },
      };
    }
    case "set.controls.colorAxis.cmax": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorAxis: {
            ...dataset.controls.colorAxis,
            cmax: action.cmax,
          },
        },
      };
    }
    case "set.controls.scale": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          scale: {
            ...dataset.controls.scale,
            [action.plot]: action.scale,
          },
        },
      };
    }
    case "set.controls.meanOnlyExpressed": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          meanOnlyExpressed: action.meanOnlyExpressed,
        },
      };
    }
    case "set.controls.expressionCutoff": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          expressionCutoff: action.expressionCutoff,
        },
      };
    }
    case "toggle.slice.obs": {
      if (_.isEqual(dataset.selectedObs, action.obs)) {
        return {
          ...dataset,
          sliceBy: {
            ...dataset.sliceBy,
            obs: !dataset.sliceBy.obs,
          },
        };
      } else {
        return {
          ...dataset,
          selectedObs: action.obs,
          sliceBy: {
            ...dataset.sliceBy,
            obs: true,
          },
        };
      }
    }
    case "toggle.slice.polygons": {
      return {
        ...dataset,
        sliceBy: {
          ...dataset.sliceBy,
          polygons: !dataset.sliceBy.polygons,
        },
      };
    }
    case "disable.slice.polygons": {
      return {
        ...dataset,
        sliceBy: {
          ...dataset.sliceBy,
          polygons: false,
        },
      };
    }
    case "add.label.obs": {
      if (dataset.labelObs.find((i) => _.isEqual(i, action.obs))) {
        return dataset;
      } else {
        return {
          ...dataset,
          labelObs: [...dataset.labelObs, action.obs],
        };
      }
    }
    case "remove.label.obs": {
      return {
        ...dataset,
        labelObs: dataset.labelObs.filter((a) => a.name !== action.obsName),
      };
    }
    case "reset.label.obs": {
      return {
        ...dataset,
        labelObs: [],
      };
    }
    case "set.varSort": {
      return {
        ...dataset,
        varSort: {
          ...dataset.varSort,
          [action.var]: {
            sort: action.sort,
            sortOrder: action.sortOrder,
          },
        },
      };
    }
    case "set.varSort.sort": {
      return {
        ...dataset,
        varSort: {
          ...dataset.varSort,
          [action.var]: {
            ...dataset.varSort[action.var],
            sort: action.sort,
          },
        },
      };
    }
    case "set.varSort.sortOrder": {
      return {
        ...dataset,
        varSort: {
          ...dataset.varSort,
          [action.var]: {
            ...dataset.varSort[action.var],
            sortOrder: action.sortOrder,
          },
        },
      };
    }
    case "set.polygons": {
      return {
        ...dataset,
        polygons: {
          ...dataset.polygons,
          [action.obsm]: action.polygons,
        },
      };
    }
    case "set.pseudospatial.maskSet": {
      return {
        ...dataset,
        pseudospatial: {
          ...dataset.pseudospatial,
          maskSet: action.maskSet,
        },
      };
    }
    case "set.pseudospatial.maskValues": {
      return {
        ...dataset,
        pseudospatial: {
          ...dataset.pseudospatial,
          maskValues: action.maskValues,
        },
      };
    }
    case "set.pseudospatial.categoricalMode": {
      return {
        ...dataset,
        pseudospatial: {
          ...dataset.pseudospatial,
          categoricalMode: action.categoricalMode,
        },
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

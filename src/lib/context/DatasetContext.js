import React, { useEffect } from "react";
import _ from "lodash";
import { createContext, useContext, useReducer } from "react";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  COLOR_ENCODINGS,
  LOCAL_STORAGE_KEY,
  OBS_TYPES,
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
      console.error(error);
    },
  }),
});
// Type of queries to store responses
const persistKeys = ["obs/cols", "var/names", "obsm/keys"];
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
    standardScale: null,
    meanOnlyExpressed: false,
    expressionCutoff: 0.0,
  },
  diseaseDatasets: [],
  selectedDisease: {
    id: null,
    name: null,
    genes: [],
  },
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

export function DatasetProvider({
  dataset_url,
  dataset_params = null,
  children,
}) {
  const [dataset, dispatch] = useReducer(
    datasetReducer,
    _.assign(
      initializer({ url: dataset_url, ...initialDataset }),
      dataset_params
    )
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ [dataset.url]: dataset })
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
          {children}
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
            action.obs.type === OBS_TYPES.CATEGORICAL
              ? [0, 1]
              : dataset.controls.range,
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
      if (dataset.selectedMultiVar.find((i) => _.isEqual(i, action.var))) {
        return dataset;
      } else {
        return {
          ...dataset,
          selectedMultiVar: [...dataset.selectedMultiVar, action.var],
        };
      }
    }
    case "deselect.var": {
      return {
        ...dataset,
        selectedVar: null,
        colorEncoding:
          dataset.colorEncoding === COLOR_ENCODINGS.VAR
            ? null
            : dataset.colorEncoding,
      };
    }
    case "deselect.multivar": {
      return {
        ...dataset,
        selectedMultiVar: dataset.selectedMultiVar.filter(
          (a) => a.matrix_index !== action.var.matrix_index
        ),
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
    case "select.disease": {
      return {
        ...dataset,
        selectedDisease: {
          id: action.id,
          name: action.name,
          genes: [],
        },
      };
    }
    case "set.disease.genes": {
      return {
        ...dataset,
        selectedDisease: {
          ...dataset.selectedDisease,
          genes: action.genes,
        },
      };
    }
    case "reset.disease": {
      return {
        ...dataset,
        selectedDisease: {
          id: null,
          name: null,
          genes: [],
        },
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
    case "set.controls.standardScale": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          standardScale: action.standardScale,
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
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

import React, { useEffect } from "react";
import _ from "lodash";
import { createContext, useContext, useReducer } from "react";
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { LOCAL_STORAGE_KEY } from "../constants/constants";

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
  controls: {
    colorScale: "Viridis",
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
    case "obsSelected": {
      return { ...dataset, selectedObs: action.obs };
    }
    case "obsmSelected": {
      return { ...dataset, selectedObsm: action.obsm };
    }
    case "varSelected": {
      return { ...dataset, selectedVar: action.var };
    }
    case "multiVarSelected": {
      if (dataset.selectedMultiVar.find((i) => _.isEqual(i, action.var))) {
        return dataset;
      } else {
        return {
          ...dataset,
          selectedMultiVar: [...dataset.selectedMultiVar, action.var],
        };
      }
    }
    case "multiVarDeselected": {
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
      };
    }
    case "reset.var": {
      return {
        ...dataset,
        selectedVar: null,
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
        selectedObs: {
          ...dataset.selectedObs,
          scaleParams: {
            ...dataset.selectedObs?.scaleParams,
            scale: dataset.selectedObs?.scaleParams?.isCategorical
              ? dataset.selectedObs?.scaleParams?.scale
              : action.colorScale,
          },
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
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

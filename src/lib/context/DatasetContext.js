import React from "react";
import { createContext, useContext, useReducer } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});
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
};

export function DatasetProvider({ dataset_url, children }) {
  const [dataset, dispatch] = useReducer(datasetReducer, {
    url: dataset_url,
    obs: {},
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
    state: {
      obs: {},
    },
  });

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
    case "setDataset": {
      return action.dataset;
    }
    case "set.obs": {
      return { ...dataset, obs: action.value };
    }
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
      if (dataset.selectedMultiVar.find((i) => i === action.var)) {
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
          (a) => a !== action.var
        ),
      };
    }
    case "set.colorEncoding": {
      return { ...dataset, colorEncoding: action.value };
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

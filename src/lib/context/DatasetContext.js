import React from "react";
import { createContext, useContext, useReducer } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);
const queryClient = new QueryClient();

export function DatasetProvider({ dataset_url, children }) {
  const [dataset, dispatch] = useReducer(datasetReducer, {
    url: dataset_url,
    selectedObs: null,
    selectedVar: null,
    selectedMultiObs: [],
    selectedMultiVar: [],
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
  });

  return (
    <DatasetContext.Provider value={dataset}>
      <DatasetDispatchContext.Provider value={dispatch}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
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
    case "obsSelected": {
      return { ...dataset, selectedObs: action.obs };
    }
    case "varSelected": {
      return { ...dataset, selectedVar: action.var };
    }
    case "multiVarSelected": {
      return {
        ...dataset,
        selectedMultiVar: [...dataset.selectedMultiVar, action.var],
      };
    }
    case "multiVarDeselected": {
      return {
        ...dataset,
        selectedMultiVar: dataset.selectedMultiVar.filter(
          (a) => a !== action.var
        ),
      };
    }
    case "embeddingSelected": {
      return {
        ...dataset,
        embedding: action.embedding,
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

import React from "react";
import { createContext, useContext, useReducer } from "react";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);

export function DatasetProvider({ dataset_url, children }) {
  const [dataset, dispatch] = useReducer(datasetReducer, {
    url: dataset_url,
    selectedObs: null,
    selectedVar: null,
    selectedMultiObs: [],
    selectedMultiVar: [],
    controls: {
      colorScale: "Viridis",
      colorValueMin: null,
      colorValueMax: null,
      standardScale: null,
      meanOnlyExpressed: false,
      expressionCutoff: 0.0,
    }
  });

  return (
    <DatasetContext.Provider value={dataset}>
      <DatasetDispatchContext.Provider value={dispatch}>
        {children}
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
        }
      };
    }
    case "set.controls.colorValueMin": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorValueMin: action.colorValueMin,
        }
      };
    }
    case "set.controls.colorValueMax": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          colorValueMax: action.colorValueMax,
        }
      };
    }
    case "set.controls.standardScale": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          standardScale: action.standardScale,
        }
      };
    }
    case "set.controls.meanOnlyExpressed": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          meanOnlyExpressed: action.meanOnlyExpressed,
        }
      };
    }
    case "set.controls.expressionCutoff": {
      return {
        ...dataset,
        controls: {
          ...dataset.controls,
          expressionCutoff: action.expressionCutoff,
        }
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

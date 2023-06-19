import { createContext, useContext, useReducer } from "react";
import { DATASET_DEFAULTS } from "./constants";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);

export function DatasetProvider({ config, children }) {
  const [dataset, dispatch] = useReducer(datasetReducer, createDataset);

  function createDataset(config) {
    return { ...DATASET_DEFAULTS, ...config };
  }

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
      return { ...dataset, url: { ...dataset.url, [action.key]: action.url } };
    }
    case "obsSelected": {
      return {
        ...dataset,
        selectedObs: { ...dataset.obs, [action.key]: action.obs },
      };
    }
    case "varSelected": {
      return {
        ...dataset,
        selectedVar: { ...dataset.selectedVar, [action.key]: action.var },
      };
    }
    case "multiVarSelected": {
      return {
        ...dataset,
        selectedMultiVar: {
          ...dataset.selectedMultiVar,
          [action.key]: [...dataset.selectedMultiVar[action.key], action.var],
        },
      };
    }
    case "multiVarDeselected": {
      return {
        ...dataset,
        selectedMultiVar: {
          ...dataset.selectedMultiVar,
          [action.key]: dataset.selectedMultiVar[action.key].filter(
            (a) => a !== action.var
          ),
        },
      };
    }
    case "colorscaleSelected": {
      return {
        ...dataset,
        colorscale: { ...dataset.colorscale, [action.key]: action.colorscale },
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

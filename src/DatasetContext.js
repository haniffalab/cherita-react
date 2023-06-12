import { createContext, useContext, useReducer } from "react";

export const DatasetContext = createContext(null);
export const DatasetDispatchContext = createContext(null);

export function DatasetProvider({ dataset_url, children }) {
  const [dataset, dispatch] = useReducer(datasetReducer, {
    url: dataset_url,
    selectedObs: null,
    selectedVar: null,
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
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

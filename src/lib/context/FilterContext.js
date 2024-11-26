import React, { useReducer, createContext, useContext } from "react";

export const FilteredDataContext = createContext(null);
export const FilteredDataDispatchContext = createContext(null);

const initialFilterData = {
  obsIndices: null, // @TODO: split to byObs and byPolygons ?
  varIndices: null,
};

export function FilterProvider({ children }) {
  const [filteredData, dispatch] = useReducer(filterReducer, {
    ...initialFilterData,
  });

  return (
    <FilteredDataContext.Provider value={filteredData}>
      <FilteredDataDispatchContext.Provider value={dispatch}>
        {children}
      </FilteredDataDispatchContext.Provider>
    </FilteredDataContext.Provider>
  );
}

export function useFilteredData() {
  return useContext(FilteredDataContext);
}

export function useFilteredDataDispatch() {
  return useContext(FilteredDataDispatchContext);
}

function filterReducer(filteredData, action) {
  switch (action.type) {
    case "set.obs.indices": {
      return {
        ...filteredData,
        obsIndices: action.indices,
      };
    }
    case "reset.obs.indices": {
      return {
        ...filteredData,
        obsIndices: null,
      };
    }
    case "set.var.indices": {
      return {
        ...filteredData,
        varIndices: action.indices,
      };
    }
    case "reset.var.indices": {
      return {
        ...filteredData,
        varIndices: null,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

import React, { createContext, useContext } from "react";

import { useObsData, useObsmData, useXData } from "../utils/zarrData";

const ZarrDataContext = createContext(null);

export function ZarrDataProvider({ children }) {
  const obsmData = useObsmData();
  const obsData = useObsData();
  const xData = useXData();

  const data = {
    obsmData: obsmData,
    obsData: obsData,
    xData: xData,
    isPending: obsmData.isPending || obsData.isPending || xData.isPending,
    serverError:
      obsmData.serverError || obsData.serverError || xData.serverError,
  };

  return (
    <ZarrDataContext.Provider value={data}>{children}</ZarrDataContext.Provider>
  );
}

export function useZarrData() {
  return useContext(ZarrDataContext);
}

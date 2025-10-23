import { createContext, useContext } from "react";

import { useFilter } from "../utils/Filter";
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

  useFilter(data);

  return (
    <ZarrDataContext.Provider value={data}>{children}</ZarrDataContext.Provider>
  );
}

export function useZarrData() {
  return useContext(ZarrDataContext);
}

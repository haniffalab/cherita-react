import { useState } from "react";

import { useFetch } from "./requests";
import { useDataset } from "../context/DatasetContext";

export const useDiseaseSearch = () => {
  const ENDPOINT = "diseases";
  const dataset = useDataset();
  const [params, setParams] = useState({
    url: dataset.url,
    diseaseDatasets: dataset.diseaseDatasets,
    text: "",
  });

  const data = useFetch(ENDPOINT, params, {
    enabled: !!params.text.length,
    refetchOnMount: true,
  });

  return {
    params,
    setParams,
    data,
  };
};

export const useVarSearch = () => {
  const ENDPOINT = "var/names";
  const dataset = useDataset();
  const [params, setParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    text: "",
  });

  const data = useFetch(ENDPOINT, params, {
    enabled: !!params.text.length,
    refetchOnMount: true,
  });

  return {
    params,
    setParams,
    data,
  };
};

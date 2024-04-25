import { useState } from "react";
import { useDataset, useDatasetDispatch } from "../context/DatasetContext";
import { useFetch } from "./requests";

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
  });

  const onSelect = (item) => {
    console.log("! selected " + item);
  };

  return {
    params,
    setParams,
    data,
    onSelect,
  };
};

export const useVarSearch = () => {
  const ENDPOINT = "var/names";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [params, setParams] = useState({
    url: dataset.url,
    text: "",
  });

  const data = useFetch(ENDPOINT, params, {
    enabled: !!params.text.length,
  });

  const onSelect = (item) => {
    dispatch({
      type: "varSelected",
      var: item,
    });
    dispatch({
      type: "multiVarSelected",
      var: item,
    });
  };

  return {
    params,
    setParams,
    data,
    onSelect,
  };
};

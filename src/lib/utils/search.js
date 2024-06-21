import { useEffect, useState } from "react";

import { useFetch } from "./requests";
import { useDataset, useDatasetDispatch } from "../context/DatasetContext";

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

  return {
    params,
    setParams,
    data,
  };
};

export const useVarSearch = () => {
  const ENDPOINT = "var/names";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [params, setParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    text: "",
  });

  const data = useFetch(ENDPOINT, params, {
    enabled: !!params.text.length,
  });

  const onSelect = (item) => {
    dispatch({
      type: "select.var",
      var: item,
    });
    dispatch({
      type: "select.multivar",
      var: item,
    });
    dispatch({
      type: "set.colorEncoding",
      value: "var",
    });
  };

  return {
    params,
    setParams,
    data,
    onSelect,
  };
};

export const useGetDisease = () => {
  const ENDPOINT = "disease/genes";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [params, setParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    diseaseName: dataset.selectedDisease?.name,
    diseaseDatasets: dataset.diseaseDatasets,
  });

  useEffect(() => {
    setParams((p) => {
      return { ...p, diseaseName: dataset.selectedDisease.name };
    });
  }, [dataset.selectedDisease?.name]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    enabled: !!params.diseaseName?.length,
  });

  useEffect(() => {
    if (!isPending && !serverError) {
      dispatch({
        type: "set.disease.genes",
        genes: fetchedData,
      });
    }
  }, [dispatch, fetchedData, isPending, serverError]);

  return;
};

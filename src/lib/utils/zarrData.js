import { useEffect, useState } from "react";

import _ from "lodash";

import { OBS_TYPES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { GET_OPTIONS, useZarr, useMultipleZarr } from "../helpers/zarr-helper";

export const useObsmData = () => {
  const dataset = useDataset();

  const [obsmParams, setObsmParams] = useState({
    url: dataset.url,
    path: "obsm/" + dataset.selectedObsm,
  });

  useEffect(() => {
    setObsmParams({
      url: dataset.url,
      path: "obsm/" + dataset.selectedObsm,
    });
  }, [dataset.url, dataset.selectedObsm]);

  return useZarr(obsmParams, null, GET_OPTIONS);
};

const meanData = (_i, data) => {
  return _.zipWith(...data, (...values) => _.mean(values));
};

export const useXData = (agg = meanData) => {
  const dataset = useDataset();

  const [xParams, setXParams] = useState(
    !dataset.selectedVar
      ? []
      : !dataset.selectedVar?.isSet
      ? [
          {
            url: dataset.url,
            path: "X",
            s: [null, dataset.selectedVar?.matrix_index],
          },
        ]
      : _.map(dataset.selectedVar?.vars, (v) => {
          return {
            url: dataset.url,
            path: "X",
            s: [null, v.matrix_index],
          };
        })
  );

  useEffect(() => {
    setXParams(
      !dataset.selectedVar
        ? []
        : !dataset.selectedVar?.isSet
        ? [
            {
              url: dataset.url,
              path: "X",
              s: [null, dataset.selectedVar?.matrix_index],
            },
          ]
        : _.map(dataset.selectedVar?.vars, (v) => {
            return {
              url: dataset.url,
              path: "X",
              s: [null, v.matrix_index],
            };
          })
    );
  }, [dataset.url, dataset.selectedVar]);

  return useMultipleZarr(xParams, GET_OPTIONS, agg);
};

export const useObsData = () => {
  const dataset = useDataset();

  const [obsParams, setObsParams] = useState({
    url: dataset.url,
    path:
      "obs/" +
      dataset.selectedObs?.name +
      (dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
  });

  useEffect(() => {
    setObsParams({
      url: dataset.url,
      path:
        "obs/" +
        dataset.selectedObs?.name +
        (dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
    });
  }, [dataset.url, dataset.selectedObs]);

  return useZarr(obsParams, null, GET_OPTIONS);
};

export const useLabelObsData = () => {
  const dataset = useDataset();

  const [labelObsParams, setLabelObsParams] = useState(
    _.map(dataset.labelObs, (obs) => {
      return {
        url: dataset.url,
        path:
          "obs/" +
          obs.name +
          (obs.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
        key: obs.name,
      };
    })
  );

  useEffect(() => {
    setLabelObsParams(
      _.map(dataset.labelObs, (obs) => {
        return {
          url: dataset.url,
          path:
            "obs/" +
            obs.name +
            (obs.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
          key: obs.name,
        };
      })
    );
  }, [dataset.labelObs, dataset.url]);

  return useMultipleZarr(labelObsParams, GET_OPTIONS);
};

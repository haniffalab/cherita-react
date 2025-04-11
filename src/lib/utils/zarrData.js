import { useEffect, useState } from "react";

import _ from "lodash";
import { slice } from "zarr";

import { OBS_TYPES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { GET_OPTIONS, useZarr, useMultipleZarr } from "../helpers/zarr-helper";

// @TODO: support specifying slice to load from context
export const useObsmData = (obsm = null) => {
  const dataset = useDataset();

  obsm = obsm || dataset.selectedObsm;

  const [obsmParams, setObsmParams] = useState({
    url: dataset.url,
    path: "obsm/" + obsm,
    s: [null, slice(null, 2)], // load only [:, :2]
  });

  useEffect(() => {
    setObsmParams({
      url: dataset.url,
      path: "obsm/" + obsm,
      s: [null, slice(null, 2)],
    });
  }, [dataset.url, obsm]);

  return useZarr(obsmParams, GET_OPTIONS, { enabled: !!obsm });
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
            return { url: dataset.url, path: "X", s: [null, v.matrix_index] };
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
              return { url: dataset.url, path: "X", s: [null, v.matrix_index] };
            })
    );
  }, [dataset.url, dataset.selectedVar]);

  return useMultipleZarr(
    xParams,
    GET_OPTIONS,
    { enabled: !!xParams.length },
    agg
  );
};

export const useObsData = (obs = null) => {
  const dataset = useDataset();

  obs = obs || dataset.selectedObs;

  const [obsParams, setObsParams] = useState({
    url: dataset.url,
    path:
      "obs/" +
      obs?.name +
      (obs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
  });

  useEffect(() => {
    setObsParams({
      url: dataset.url,
      path:
        "obs/" +
        obs?.name +
        (obs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
    });
  }, [dataset.url, obs]);

  return useZarr(obsParams, GET_OPTIONS, { enabled: !!obs });
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

  return useMultipleZarr(labelObsParams, GET_OPTIONS, {
    enabled: !!labelObsParams.length,
  });
};

import { useMemo } from "react";

import _ from "lodash";
import { slice } from "zarr";

import { OBS_TYPES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useSettings } from "../context/SettingsContext";
import { GET_OPTIONS, useZarr, useMultipleZarr } from "../helpers/zarr-helper";

// @TODO: support specifying slice to load from context
export const useObsmData = (obsm = null) => {
  const dataset = useDataset();
  const settings = useSettings();

  obsm = obsm || settings.selectedObsm;

  const obsmParams = useMemo(
    () => ({
      url: dataset.url,
      path: "obsm/" + obsm,
      s: [null, slice(null, 2)], // load only [:, :2]
    }),
    [dataset.url, obsm]
  );

  return useZarr(obsmParams, GET_OPTIONS, { enabled: !!obsm });
};

const meanData = (_i, data) => {
  return _.zipWith(...data, (...values) => _.mean(values));
};

export const useXData = (agg = meanData) => {
  const dataset = useDataset();
  const settings = useSettings();

  const xParams = useMemo(
    () =>
      !settings.selectedVar
        ? []
        : !settings.selectedVar?.isSet
          ? [
              {
                url: dataset.url,
                path: "X",
                s: [null, settings.selectedVar?.matrix_index],
              },
            ]
          : _.map(settings.selectedVar?.vars, (v) => {
              return { url: dataset.url, path: "X", s: [null, v.matrix_index] };
            }),
    [dataset.url, settings.selectedVar]
  );

  return useMultipleZarr(
    xParams,
    GET_OPTIONS,
    { enabled: !!xParams.length },
    agg
  );
};

export const useObsData = (obs = null) => {
  const dataset = useDataset();
  const settings = useSettings();

  obs = obs || settings.data.obs[settings.selectedObs?.name] || null;

  const obsParams = useMemo(
    () => ({
      url: dataset.url,
      path:
        "obs/" +
        obs?.name +
        (obs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
    }),
    [dataset.url, obs?.name, obs?.type]
  );

  return useZarr(obsParams, GET_OPTIONS, { enabled: !!obs });
};

export const useLabelObsData = () => {
  const dataset = useDataset();
  const settings = useSettings();

  const labelObsParams = useMemo(
    () =>
      _.map(settings.labelObs, (obs) => {
        obs = obs || settings.data.obs[obs.name] || null;
        return {
          url: dataset.url,
          path:
            "obs/" +
            obs.name +
            (obs.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
          key: obs.name,
        };
      }),
    [dataset.url, settings.data.obs, settings.labelObs]
  );

  return useMultipleZarr(labelObsParams, GET_OPTIONS, {
    enabled: !!labelObsParams.length,
  });
};

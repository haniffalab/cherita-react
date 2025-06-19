import { useState, useEffect, useMemo } from "react";

import _ from "lodash";

import { useFetch } from "./requests";
import { useDataset } from "../context/DatasetContext";
import { useSettings } from "../context/SettingsContext";

export const useResolver = (initSettings) => {
  const dataset = useDataset();

  const [data, setData] = useState({
    obs: {},
    vars: {},
  });
  const [resolvedObs, setResolvedObs] = useState(false);
  const [resolvedVars, setResolvedVars] = useState(false);

  const [resolvedSettings, setResolvedSettings] = useState(null);

  // obs
  // all obs should be in initSettings.selectedObs and initSettings.labelObs
  const initObs = _.compact([
    initSettings.selectedObs,
    ...initSettings.labelObs,
  ]);
  const initObsNames = _.map(initObs, (o) => o.name);
  const [obsParams] = useState({
    url: dataset.url,
    cols: initObsNames,
    obsParams: _.fromPairs(_.map(initObs, (o) => [o.name, { bins: o.bins }])),
  });
  const {
    fetchedData: obsData,
    isPending: obsDataPending,
    serverError: obsDataError,
  } = useFetch("obs/cols", obsParams, {
    enabled: !!initObsNames.length,
  });

  // vars
  // all vars should be in initSettings.vars from validation
  const initVars = initSettings.vars;
  const initVarsNames = _.flatMap(initVars, (v) =>
    v.isSet ? _.map(v.vars, (vv) => vv.name) : v.name
  );
  const [varParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    names: initVarsNames,
  });

  const {
    fetchedData: varData,
    isPending: varDataPending,
    serverError: varDataError,
  } = useFetch("var/cols/names", varParams, {
    enabled: !!varParams.names.length,
  });

  useEffect(() => {
    if (!obsDataPending && !obsDataError) {
      if (obsData) {
        setData((d) => ({
          ...d,
          obs: _.fromPairs(_.map(obsData, (o) => [o.name, o])),
        }));
      }
      setResolvedObs(true);
    }
  }, [obsData, obsDataError, obsDataPending, initSettings.selectedObs.omit]);

  useEffect(() => {
    if (!varDataPending && !varDataError) {
      if (varData) {
        setData((d) => ({
          ...d,
          vars: _.fromPairs(_.map(varData, (v) => [v.name, v])),
        }));
      }
      setResolvedVars(true);
    }
  }, [initSettings.vars, varData, varDataError, varDataPending]);

  // @TODO: remove from settings the obs and vars not in dataset (not in response)
  useEffect(() => {
    if (resolvedObs && resolvedVars) {
      setResolvedSettings({
        ...initSettings,
        data: data,
      });
    }
  }, [data, initSettings, resolvedObs, resolvedVars, setResolvedSettings]);

  return resolvedSettings;
};

export const useSelectedObs = () => {
  const settings = useSettings();

  return useMemo(() => {
    return (
      {
        ...settings.selectedObs,
        ...settings.data.obs[settings.selectedObs?.name],
      } || null
    );
  }, [settings.data.obs, settings.selectedObs]);
};

export const useSelectedVar = () => {
  const settings = useSettings();

  return useMemo(() => {
    return (
      {
        ...settings.selectedVar,
        ...settings.data.vars[settings.selectedVar?.name],
        vars: settings.selectedVar?.isSet
          ? settings.selectedVar.vars.map((vv) => ({
              ...settings.data.vars[vv.name],
            }))
          : [],
      } || null
    );
  }, [settings.data.vars, settings.selectedVar]);
};

export const useSelectedMultiVar = () => {
  const settings = useSettings();

  return useMemo(() => {
    return _.map(settings.selectedMultiVar, (v) => {
      if (v.isSet) {
        return {
          ...v,
          vars: v.vars.map((vv) => ({
            ...settings.data.vars[vv.name],
          })),
        };
      } else {
        return {
          ...v,
          ...settings.data.vars[v.name],
        };
      }
    });
  }, [settings.data.vars, settings.selectedMultiVar]);
};

export const useSettingsVars = () => {
  const settings = useSettings();

  return useMemo(() => {
    return _.map(settings.vars, (v) => {
      if (v.isSet) {
        return {
          ...v,
          vars: v.vars.map((vv) => ({
            ...settings.data.vars[vv.name],
          })),
        };
      } else {
        return {
          ...v,
          ...settings.data.vars[v.name],
        };
      }
    });
  }, [settings.data.vars, settings.vars]);
};

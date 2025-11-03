import { useState, useEffect, useMemo } from 'react';

import _ from 'lodash';

import { useFetch } from './requests';
import { PSEUDOSPATIAL_CATEGORICAL_MODES } from '../constants/constants';
import { useDataset } from '../context/DatasetContext';
import { useSettings } from '../context/SettingsContext';

const cleanSettings = (settings) => {
  // Remove obs and vars from settings that are not in data

  const selectedObs =
    settings.selectedObs && settings.data.obs[settings.selectedObs.name]
      ? settings.selectedObs
      : null;

  const labelObs = _.filter(
    settings.labelObs,
    (obsName) => settings.data.obs[obsName],
  );

  const selectedVar =
    settings.selectedVar &&
    (settings.selectedVar.isSet
      ? _.every(settings.selectedVar.vars, (vv) => settings.data.vars[vv.name])
      : settings.data.vars[settings.selectedVar.name])
      ? settings.selectedVar
      : null;

  const selectedMultiVar = _.filter(settings.selectedMultiVar, (v) => {
    if (v.isSet) {
      return _.every(v.vars, (vv) => settings.data.vars[vv.name]);
    } else {
      return settings.data.vars[v.name];
    }
  });

  const vars = _.filter(settings.vars, (v) => {
    if (v.isSet) {
      return _.every(v.vars, (vv) => settings.data.vars[vv.name]);
    } else {
      return settings.data.vars[v.name];
    }
  });

  let pseudospatial = settings.pseudospatial;
  if (!_.keys(settings.data.pseudospatial).length) {
    pseudospatial = {
      maskSet: null,
      maskValues: null,
      categoricalMode: PSEUDOSPATIAL_CATEGORICAL_MODES.ACROSS.value,
    };
  }
  if (
    pseudospatial.maskSet &&
    !_.includes(_.keys(settings.data.pseudospatial), pseudospatial.maskSet)
  ) {
    pseudospatial = {
      ...pseudospatial,
      maskSet: null,
    };
  }
  if (
    pseudospatial.maskValues &&
    !!_.difference(
      pseudospatial.maskValues,
      settings.data.pseudospatial?.[pseudospatial.maskSet] || [],
    ).length
  ) {
    pseudospatial = {
      ...pseudospatial,
      maskValues: null,
    };
  }
  return {
    ...settings,
    selectedObs: selectedObs,
    labelObs: labelObs,
    selectedVar: selectedVar,
    selectedMultiVar: selectedMultiVar,
    vars: vars,
    pseudospatial: pseudospatial,
  };
};

export const useResolver = (initSettings) => {
  const dataset = useDataset();
  const { isPseudospatial = false } = dataset;

  const [isPending, setisPending] = useState(true);

  const [resolvedSettings, setResolvedSettings] = useState(null);

  // obs
  // all obs should be in initSettings.selectedObs and initSettings.labelObs
  const initObs = _.uniqBy(
    _.compact([
      initSettings.selectedObs,
      ..._.map(initSettings.labelObs, (o) => ({ name: o })),
    ]),
    'name',
  );
  const initObsNames = _.map(initObs, (o) => o.name);
  const [obsParams] = useState({
    url: dataset.url,
    cols: initObsNames,
    obsParams: _.fromPairs(
      _.map(initObs, (o) => [o.name, { bins: o.bins || {} }]),
    ),
  });
  const {
    fetchedData: obsData,
    isPending: obsDataPending,
    serverError: obsDataError,
  } = useFetch('obs/cols', obsParams, {
    enabled: !!initObsNames.length,
  });

  // vars
  // all vars should be in initSettings.vars from validation
  const initVars = initSettings.vars;
  const initVarsNames = _.flatMap(initVars, (v) =>
    v.isSet ? _.map(v.vars, (vv) => vv.name) : v.name,
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
  } = useFetch('var/cols/names', varParams, {
    enabled: !!varParams.names.length,
  });

  // pseudospatial
  const [pseudospatialParams] = useState({
    url: dataset.url,
  });
  const pseudospatialEnabled = isPseudospatial;

  const {
    fetchedData: pseudospatialData,
    isPending: pseudospatialDataPending,
    serverError: pseudospatialDataError,
  } = useFetch('masks', pseudospatialParams, {
    enabled: pseudospatialEnabled,
    retry: false,
  });

  // Use isPending to help set initial state to true
  useEffect(() => {
    setisPending(obsDataPending || varDataPending || pseudospatialDataPending);
  }, [obsDataPending, pseudospatialDataPending, varDataPending]);

  // Use isPending along with other pending states
  // to ensure they've all converged after state updates
  useEffect(() => {
    if (
      isPending ||
      obsDataPending ||
      varDataPending ||
      pseudospatialDataPending
    ) {
      return;
    }

    if (obsDataError) {
      console.error('Error fetching obs data:', obsDataError);
    }
    if (varDataError) {
      console.error('Error fetching var data:', varDataError);
    }
    if (pseudospatialDataError) {
      console.error(
        'Error fetching pseudospatial masks data:',
        pseudospatialDataError,
      );
    }

    const data = {
      obs: obsData ? _.fromPairs(_.map(obsData, (o) => [o.name, o])) : {},
      vars: varData ? _.fromPairs(_.map(varData, (v) => [v.name, v])) : {},
      pseudospatial: pseudospatialData || {},
    };

    const cleanedSettings = cleanSettings({
      ...initSettings,
      data: data,
    });

    setResolvedSettings(cleanedSettings);
  }, [
    initSettings,
    isPending,
    obsData,
    obsDataError,
    obsDataPending,
    pseudospatialData,
    pseudospatialDataError,
    pseudospatialDataPending,
    pseudospatialEnabled,
    varData,
    varDataError,
    varDataPending,
  ]);

  return resolvedSettings;
};

export const useSelectedObs = () => {
  const settings = useSettings();

  return useMemo(() => {
    return settings.selectedObs
      ? {
          ...settings.selectedObs,
          ...settings.data.obs[settings.selectedObs.name],
        }
      : null;
  }, [settings.data.obs, settings.selectedObs]);
};

export const useSelectedVar = () => {
  const settings = useSettings();

  return useMemo(() => {
    if (settings.selectedVar) {
      if (settings.selectedVar.isSet) {
        return {
          ...settings.selectedVar,
          vars: settings.selectedVar.vars.map((v) => ({
            ...settings.data.vars[v.name],
          })),
        };
      } else {
        return {
          ...settings.selectedVar,
          ...settings.data.vars[settings.selectedVar.name],
        };
      }
    } else {
      return null;
    }
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

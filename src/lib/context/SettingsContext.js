import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

import _ from "lodash";

import {
  COLOR_ENCODINGS,
  DOTPLOT_SCALES,
  LOCAL_STORAGE_KEY,
  MATRIXPLOT_SCALES,
  OBS_TYPES,
  PSEUDOSPATIAL_CATEGORICAL_MODES,
  VAR_SORT,
  VAR_SORT_ORDER,
  VIOLINPLOT_SCALES,
} from "../constants/constants";
import { useResolver } from "../utils/Resolver";

export const SettingsContext = createContext(null);
export const SettingsDispatchContext = createContext(null);

const initialSettings = {
  selectedObs: null, // { name: "obs_name", omit: ["obs_item"], bins: {} }
  selectedVar: null, // { name: "var_name", isSet: false } or { name: "var_set_name", isSet: true, vars: [{ name: "var1" }, { name: "var2" }] }
  selectedObsm: null, // "obsm_name" (e.g. "X_umap")
  selectedMultiVar: [], // [{ name: "var_name", isSet: false }, { name: "var_set_name", isSet: true, vars: [{ name: "var1" }, { name: "var2" }] }]
  labelObs: [], // [ "obs_name1", "obs_name2" ]
  vars: [], // [{ name: "var_name", isSet: false }, { name: "var_set_name", isSet: true, vars: [{ name: "var1" }, { name: "var2" }] }]
  colorEncoding: null,
  sliceBy: { obs: false, polygons: false },
  polygons: {},
  controls: {
    colorScale: "Viridis",
    range: [0, 1], // normalized
    colorAxis: { dmin: 0, dmax: 1, cmin: 0, cmax: 1 },
    scale: {
      dotplot: DOTPLOT_SCALES.NONE.value,
      matrixplot: MATRIXPLOT_SCALES.NONE.value,
      violinplot: VIOLINPLOT_SCALES.WIDTH.value,
    },
    meanOnlyExpressed: false,
    expressionCutoff: 0.0,
  },
  varSort: {
    var: { sort: VAR_SORT.NONE, sortOrder: VAR_SORT_ORDER.ASC },
    disease: { sort: VAR_SORT.NONE, sortOrder: VAR_SORT_ORDER.ASC },
  },
  pseudospatial: {
    maskSet: null,
    maskValues: null,
    categoricalMode: PSEUDOSPATIAL_CATEGORICAL_MODES.ACROSS.value,
  },
  // dataset resolved values
  data: {
    // store resolved obs and vars from selectedObs, selectedVar, selectedMultiVar, vars, labelObs
    // keys to be removed when not in any selection
    obs: {},
    vars: {},
  },
};

// validate on initialization and reducer
const validateSettings = (settings) => {
  // make sure selectedVar is in vars
  if (settings.selectedVar) {
    const inVars = _.some(
      settings.vars,
      (v) => v.name === settings.selectedVar.name
    );
    if (!inVars) {
      settings.vars = [...settings.vars, settings.selectedVar];
    }
  }

  // make sure selectedMultiVar are in vars
  if (settings.selectedMultiVar) {
    const notInVars = _.differenceBy(
      settings.selectedMultiVar,
      settings.vars,
      "name"
    );
    if (notInVars.length) {
      settings.vars = [...settings.vars, ...notInVars];
    }
  }

  // make sure there's a selectedVar if colorEncoding is VAR
  if (settings.colorEncoding === COLOR_ENCODINGS.VAR) {
    if (!settings.selectedVar) {
      settings.colorEncoding = null;
    } else if (
      settings.selectedVar.isSet &&
      !settings.selectedVar.vars.length
    ) {
      settings.selectedVar = null;
      settings.colorEncoding = null;
    }
  }

  // make sure there's a selectedObs if colorEncoding is OBS
  if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
    if (!settings.selectedObs) {
      settings.colorEncoding = null;
    }
  }

  // @TODO: validate pseudospatial settings

  // Keep only obs in use (selectedObs, labelObs) in data.obs
  const obsNames = _.uniq(
    _.compact([settings.selectedObs?.name, ...settings.labelObs])
  );
  const intersectionObs = _.intersection(_.keys(settings.data.obs), obsNames);
  settings.data.obs = _.pick(settings.data.obs, intersectionObs);

  // Keep only vars in use (settings.vars) in data.vars
  const varNames = _.flatMap(settings.vars, (v) =>
    v.isSet ? _.map(v.vars, (vv) => vv.name) : v.name
  );
  const intersectionVars = _.intersection(_.keys(settings.data.vars), varNames);
  settings.data.vars = _.pick(settings.data.vars, intersectionVars);

  return settings;
};

const initializer = ({
  canOverrideSettings,
  defaultSettings,
  localSettings,
}) => {
  const mergedSettings = canOverrideSettings
    ? _.defaultsDeep({}, localSettings, defaultSettings, initialSettings)
    : _.defaultsDeep({}, defaultSettings, initialSettings);
  return validateSettings(mergedSettings);
};

const validate = (settings) => {
  return settings ? validateSettings(settings) : null;
};

export function SettingsProvider({
  dataset_url,
  defaultSettings,
  canOverrideSettings,
  children,
}) {
  const DATASET_STORAGE_KEY = `${LOCAL_STORAGE_KEY}-${dataset_url}`;
  // Use localStorage directly instead of useLocalStorage due to unnecessary re-renders
  // https://github.com/uidotdev/usehooks/issues/157
  let { buster, timestamp, ...localSettings } =
    JSON.parse(localStorage.getItem(DATASET_STORAGE_KEY)) || {};

  // If the buster is not set or does not match the current package version,
  // reset localSettings to avoid stale data
  if (!buster || buster !== process.env.PACKAGE_VERSION) {
    localSettings = {};
  }

  const initSettings = useRef(
    initializer({
      canOverrideSettings,
      defaultSettings,
      localSettings,
    })
  );

  const resolvedSettings = useResolver(initSettings.current);

  const [settings, dispatch] = useReducer(
    settingsReducer,
    resolvedSettings,
    validate
  );

  useEffect(() => {
    // If resolvedSettings is null, do not update settings
    if (resolvedSettings) {
      const validatedSettings = validateSettings(resolvedSettings);
      console.log("Initial settings:", validatedSettings);
      dispatch({ type: "init", settings: validatedSettings });
    }
  }, [resolvedSettings]);

  useEffect(() => {
    if (canOverrideSettings) {
      try {
        localStorage.setItem(
          DATASET_STORAGE_KEY,
          JSON.stringify({
            buster: process.env.PACKAGE_VERSION || "0.0.0",
            timestamp: Date.now(),
            ..._.omit(settings, "data"),
            ...settings,
          })
        );
      } catch (err) {
        if (
          err.code === 22 ||
          err.code === 1014 ||
          err.name === "QuotaExceededError" ||
          err.name === "NS_ERROR_DOM_QUOTA_REACHED"
        ) {
          console.err("Browser storage quota exceeded");
        } else {
          console.err(err);
        }
      }
    }
  }, [DATASET_STORAGE_KEY, canOverrideSettings, settings]);

  return (
    <SettingsContext.Provider value={settings}>
      <SettingsDispatchContext.Provider value={dispatch}>
        {settings && children}
      </SettingsDispatchContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function useSettingsDispatch() {
  return useContext(SettingsDispatchContext);
}

const OBS_DATA_KEYS = [
  "name",
  "type",
  // categorical and numerical
  "codes",
  "codesMap",
  "values",
  "n_values",
  "value_counts",
  // numerical
  "bins",
  "min",
  "max",
  "mean",
  "median",
  "n_unique",
];

const splitObs = (obs) => {
  if (!obs) return { settings: null, data: {} };
  const settings = _.pick(obs, ["name", "omit", "bins"]);
  const data = obs ? { [obs.name]: _.pick(obs, OBS_DATA_KEYS) } : {};
  return { settings, data };
};

const splitVar = (v) => {
  if (!v) return { settings: null, data: {} };
  let settings, data;
  if (v.isSet) {
    settings = {
      ..._.pick(v, ["name", "isSet"]),
      vars: _.map(v.vars, (vv) => ({ name: vv.name })),
    };
    data = _.fromPairs(
      _.map(v.vars, (vv) => [
        vv.name,
        _.pick(vv, ["name", "index", "matrix_index"]),
      ])
    );
  } else {
    settings = _.pick(v, ["name", "isSet"]);
    data = { [v.name]: _.pick(v, ["name", "index", "matrix_index"]) };
  }
  return { settings, data };
};

function settingsReducer(settings, action) {
  switch (action.type) {
    case "init": {
      return action.settings;
    }
    case "select.obs": {
      const { settings: obsSettings, data: obsData } = splitObs(action.obs);
      return {
        ...settings,
        ...(action.obs
          ? {
              selectedObs: obsSettings,
              data: {
                ...settings.data,
                obs: {
                  ...settings.data.obs,
                  ...obsData,
                },
              },
            }
          : { selectedObs: null }),
        controls: {
          ...settings.controls,
          range:
            action.obs?.type === OBS_TYPES.CATEGORICAL
              ? [0, 1]
              : settings.controls.range,
        },
        colorEncoding:
          settings.colorEncoding === COLOR_ENCODINGS.OBS && !action.obs
            ? null
            : settings.colorEncoding,
        sliceBy: {
          ...settings.sliceBy,
          obs: action.obs ? settings.sliceBy.obs : false,
        },
      };
    }
    case "select.obsm": {
      return { ...settings, selectedObsm: action.obsm };
    }
    case "select.var": {
      const { settings: varSettings, data: varData } = splitVar(action.var);
      return validateSettings({
        ...settings,
        selectedVar: varSettings,
        data: {
          ...settings.data,
          vars: {
            ...settings.data.vars,
            ...varData,
          },
        },
      });
    }
    case "select.multivar": {
      const inMultiVar = settings.selectedMultiVar.some(
        (v) => v.name === action.var.name
      );
      if (inMultiVar) {
        return validateSettings({ ...settings });
      } else {
        const { settings: varSettings, data: varData } = splitVar(action.var);
        return validateSettings({
          ...settings,
          selectedMultiVar: [...settings.selectedMultiVar, varSettings],
          data: {
            ...settings.data,
            vars: {
              ...settings.data.vars,
              ...varData,
            },
          },
        });
      }
    }
    case "deselect.multivar": {
      return validateSettings({
        ...settings,
        selectedMultiVar: settings.selectedMultiVar.filter(
          (v) => v !== action.var.name
        ),
      });
    }
    case "toggle.multivar": {
      const inMultiVar = settings.selectedMultiVar.some(
        (v) => v.name === action.var.name
      );
      if (inMultiVar) {
        return validateSettings({
          ...settings,
          selectedMultiVar: settings.selectedMultiVar.filter(
            (v) => v.name !== action.var.name
          ),
        });
      } else {
        const { settings: varSettings, data: varData } = splitVar(action.var);
        return validateSettings({
          ...settings,
          selectedMultiVar: [...settings.selectedMultiVar, varSettings],
          data: {
            ...settings.data,
            vars: {
              ...settings.data.vars,
              ...varData,
            },
          },
        });
      }
    }
    case "set.colorEncoding": {
      return validateSettings({ ...settings, colorEncoding: action.value });
    }
    case "reset.vars": {
      return validateSettings({
        ...settings,
        vars: [],
        selectedVar: null,
        selectedMultiVar: [],
      });
    }
    case "reset.multiVar": {
      return validateSettings({
        ...settings,
        selectedMultiVar: [],
      });
    }
    case "reset.var": {
      return validateSettings({
        ...settings,
        selectedVar: null,
      });
    }
    case "add.var": {
      if (settings.vars.find((v) => v.name === action.var.name)) {
        return settings;
      } else {
        const { settings: varSettings, data: varData } = splitVar(action.var);
        return {
          ...settings,
          vars: [...settings.vars, varSettings],
          data: {
            ...settings.data,
            vars: {
              ...settings.data.vars,
              ...varData,
            },
          },
        };
      }
    }
    case "remove.var": {
      const selectedVar =
        settings.selectedVar?.name === action.var.name
          ? null
          : settings.selectedVar;
      const selectedMultiVar = settings.selectedMultiVar.filter(
        (v) => v.name !== action.var.name
      );
      return validateSettings({
        ...settings,
        vars: settings.vars.filter((a) => a.name !== action.var.name),
        selectedVar: selectedVar,
        selectedMultiVar: selectedMultiVar,
      });
    }
    case "add.varSet.var": {
      const varSet = settings.vars.find(
        (s) => s.isSet && s.name === action.varSet.name
      );
      if (!varSet) {
        return settings;
      }
      if (varSet.vars.some((v) => v.name === action.var.name)) {
        return settings;
      } else {
        const { settings: varSettings, data: varData } = splitVar(action.var);
        const varSetVars = [...varSet.vars, varSettings];
        const vars = settings.vars.map((v) => {
          if (v.name === varSet.name) {
            return { ...v, vars: varSetVars };
          } else {
            return v;
          }
        });
        const selectedVar =
          settings.selectedVar?.name === action.varSet.name
            ? { ...varSet, vars: varSetVars }
            : settings.selectedVar;
        const selectedMultiVar = settings.selectedMultiVar.map((v) => {
          if (v.name === varSet.name) {
            return { ...v, vars: varSetVars };
          } else {
            return v;
          }
        });
        return validateSettings({
          ...settings,
          vars: vars,
          selectedVar: selectedVar,
          selectedMultiVar: selectedMultiVar,
          data: {
            ...settings.data,
            vars: {
              ...settings.data.vars,
              ...varData,
            },
          },
        });
      }
    }
    case "remove.varSet.var": {
      const varSet = settings.vars.find(
        (s) => s.isSet && s.name === action.varSet.name
      );
      if (!varSet) {
        return settings;
      }
      if (!varSet.vars.some((v) => v.name === action.var.name)) {
        return settings;
      } else {
        const varSetVars = varSet.vars.filter(
          (v) => v.name !== action.var.name
        );
        const vars = settings.vars.map((v) => {
          if (v.name === varSet.name) {
            return { ...v, vars: varSetVars };
          } else {
            return v;
          }
        });
        // Remove from selected if varSet vars is empty
        if (!varSetVars.length) {
          const selectedVar =
            settings.selectedVar?.name === action.varSet.name
              ? null
              : settings.selectedVar;
          const selectedMultiVar = settings.selectedMultiVar.filter(
            (v) => v.name !== action.varSet.name
          );
          return validateSettings({
            ...settings,
            vars: vars,
            selectedVar: selectedVar,
            selectedMultiVar: selectedMultiVar,
          });
        } else {
          // Update selected if varSet is selected
          const selectedVar =
            settings.selectedVar?.name === action.varSet.name
              ? { ...varSet, vars: varSetVars }
              : settings.selectedVar;
          const selectedMultiVar = settings.selectedMultiVar.map((v) => {
            if (v.name === varSet.name) {
              return { ...v, vars: varSetVars };
            } else {
              return v;
            }
          });
          return validateSettings({
            ...settings,
            vars: vars,
            selectedVar: selectedVar,
            selectedMultiVar: selectedMultiVar,
          });
        }
      }
    }
    case "set.controls.colorScale": {
      return {
        ...settings,
        controls: { ...settings.controls, colorScale: action.colorScale },
      };
    }
    case "set.controls.range": {
      return {
        ...settings,
        controls: { ...settings.controls, range: action.range },
      };
    }
    case "set.controls.colorAxis": {
      return {
        ...settings,
        controls: { ...settings.controls, colorAxis: action.colorAxis },
      };
    }
    case "set.controls.colorAxis.crange": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          colorAxis: {
            ...settings.controls.colorAxis,
            cmin: action.cmin,
            cmax: action.cmax,
          },
        },
      };
    }
    case "set.controls.colorAxis.cmin": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          colorAxis: { ...settings.controls.colorAxis, cmin: action.cmin },
        },
      };
    }
    case "set.controls.colorAxis.cmax": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          colorAxis: { ...settings.controls.colorAxis, cmax: action.cmax },
        },
      };
    }
    case "set.controls.scale": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          scale: { ...settings.controls.scale, [action.plot]: action.scale },
        },
      };
    }
    case "set.controls.meanOnlyExpressed": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          meanOnlyExpressed: action.meanOnlyExpressed,
        },
      };
    }
    case "set.controls.expressionCutoff": {
      return {
        ...settings,
        controls: {
          ...settings.controls,
          expressionCutoff: action.expressionCutoff,
        },
      };
    }
    case "toggle.slice.obs": {
      if (
        settings.selectedObs &&
        settings.selectedObs.name === action.obs.name
      ) {
        return {
          ...settings,
          sliceBy: { ...settings.sliceBy, obs: !settings.sliceBy.obs },
        };
      } else {
        const { settings: obsSettings, data: obsData } = splitObs(action.obs);
        return {
          ...settings,
          selectedObs: obsSettings,
          data: {
            ...settings.data,
            obs: {
              ...settings.data.obs,
              ...obsData,
            },
          },
          sliceBy: { ...settings.sliceBy, obs: true },
        };
      }
    }
    case "toggle.slice.polygons": {
      return {
        ...settings,
        sliceBy: { ...settings.sliceBy, polygons: !settings.sliceBy.polygons },
      };
    }
    case "disable.slice.polygons": {
      return { ...settings, sliceBy: { ...settings.sliceBy, polygons: false } };
    }
    case "add.label.obs": {
      if (_.includes(settings.labelObs, action.obs.name)) {
        return settings;
      } else {
        const { settings: obsSettings, data: obsData } = splitObs(action.obs);
        return {
          ...settings,
          labelObs: [...settings.labelObs, obsSettings.name],
          data: {
            ...settings.data,
            obs: {
              ...settings.data.obs,
              ...obsData,
            },
          },
        };
      }
    }
    case "remove.label.obs": {
      return validateSettings({
        ...settings,
        labelObs: settings.labelObs.filter((a) => a !== action.obsName),
      });
    }
    case "reset.label.obs": {
      return validateSettings({ ...settings, labelObs: [] });
    }
    case "set.varSort": {
      return {
        ...settings,
        varSort: {
          ...settings.varSort,
          [action.var]: { sort: action.sort, sortOrder: action.sortOrder },
        },
      };
    }
    case "set.varSort.sort": {
      return {
        ...settings,
        varSort: {
          ...settings.varSort,
          [action.var]: { ...settings.varSort[action.var], sort: action.sort },
        },
      };
    }
    case "set.varSort.sortOrder": {
      return {
        ...settings,
        varSort: {
          ...settings.varSort,
          [action.var]: {
            ...settings.varSort[action.var],
            sortOrder: action.sortOrder,
          },
        },
      };
    }
    case "set.polygons": {
      return {
        ...settings,
        polygons: { ...settings.polygons, [action.obsm]: action.polygons },
      };
    }
    case "set.pseudospatial.maskSet": {
      return {
        ...settings,
        pseudospatial: { ...settings.pseudospatial, maskSet: action.maskSet },
      };
    }
    case "set.pseudospatial.maskValues": {
      return {
        ...settings,
        pseudospatial: {
          ...settings.pseudospatial,
          maskValues: action.maskValues,
        },
      };
    }
    case "set.pseudospatial.categoricalMode": {
      return {
        ...settings,
        pseudospatial: {
          ...settings.pseudospatial,
          categoricalMode: action.categoricalMode,
        },
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

import { createContext, useContext, useEffect, useReducer } from "react";

import { useLocalStorage } from "@uidotdev/usehooks";
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

export const SettingsContext = createContext(null);
export const SettingsDispatchContext = createContext(null);

const initialSettings = {
  selectedObs: null,
  selectedVar: null,
  selectedObsm: null,
  selectedMultiObs: [],
  selectedMultiVar: [],
  colorEncoding: null,
  labelObs: [],
  vars: [],
  sliceBy: { obs: false, polygons: false },
  polygons: {},
  controls: {
    colorScale: "Viridis",
    valueRange: [0, 1],
    range: [0, 1],
    colorAxis: { dmin: 0, dmax: 1, cmin: 0, cmax: 1 },
    scale: {
      dotplot: DOTPLOT_SCALES.NONE,
      matrixplot: MATRIXPLOT_SCALES.NONE,
      violinplot: VIOLINPLOT_SCALES.WIDTH,
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
};

export function SettingsProvider({
  dataset_url,
  defaultSettings,
  canOverrideSettings,
  children,
}) {
  const DATASET_STORAGE_KEY = `${LOCAL_STORAGE_KEY}-${dataset_url}`;
  const [localSettings, setLocalSettings] = useLocalStorage(
    DATASET_STORAGE_KEY,
    {}
  );
  const [settings, dispatch] = useReducer(
    settingsReducer,
    canOverrideSettings
      ? _.assign(initialSettings, defaultSettings, localSettings)
      : _.assign(initialSettings, defaultSettings)
  );

  useEffect(() => {
    if (canOverrideSettings) {
      try {
        setLocalSettings(settings);
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
  }, [canOverrideSettings, setLocalSettings, settings]);

  return (
    <SettingsContext.Provider value={settings}>
      <SettingsDispatchContext.Provider value={dispatch}>
        {children}
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

function settingsReducer(settings, action) {
  switch (action.type) {
    case "select.obs": {
      return {
        ...settings,
        selectedObs: action.obs,
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
      if (settings.vars.find((v) => _.isEqual(v, action.var))) {
        return { ...settings, selectedVar: action.var };
      } else {
        return {
          ...settings,
          selectedVar: action.var,
          vars: [...settings.vars, action.var],
        };
      }
    }
    case "select.multivar": {
      const vars = settings.vars.find((v) => _.isEqual(v, action.var))
        ? settings.vars
        : [...settings.vars, action.var];
      if (settings.selectedMultiVar.find((v) => _.isEqual(v, action.var))) {
        return { ...settings, vars: vars };
      } else {
        return {
          ...settings,
          selectedMultiVar: [...settings.selectedMultiVar, action.var],
          vars: vars,
        };
      }
    }
    case "deselect.multivar": {
      return {
        ...settings,
        selectedMultiVar: settings.selectedMultiVar.filter(
          (v) => v !== action.var.name
        ),
      };
    }
    case "toggle.multivar": {
      const inMultiVar = settings.selectedMultiVar.some(
        (v) => v.name === action.var.name
      );
      if (inMultiVar) {
        return {
          ...settings,
          selectedMultiVar: settings.selectedMultiVar.filter(
            (v) => v.name !== action.var.name
          ),
        };
      } else {
        return {
          ...settings,
          selectedMultiVar: [...settings.selectedMultiVar, action.var],
        };
      }
    }
    case "set.colorEncoding": {
      return { ...settings, colorEncoding: action.value };
    }
    case "reset.vars": {
      return {
        ...settings,
        vars: [],
        selectedVar: null,
        selectedMultiVar: [],
      };
    }
    case "reset.multiVar": {
      return {
        ...settings,
        selectedMultiVar: [],
        colorEncoding:
          settings.colorEncoding === COLOR_ENCODINGS.VAR
            ? null
            : settings.colorEncoding,
      };
    }
    case "reset.var": {
      return {
        ...settings,
        selectedVar: null,
        colorEncoding:
          settings.colorEncoding === COLOR_ENCODINGS.VAR
            ? null
            : settings.colorEncoding,
      };
    }
    case "add.var": {
      if (settings.vars.find((v) => _.isEqual(v, action.var))) {
        return settings;
      } else {
        return { ...settings, vars: [...settings.vars, action.var] };
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
      return {
        ...settings,
        vars: settings.vars.filter((a) => a.name !== action.var.name),
        selectedVar: selectedVar,
        selectedMultiVar: selectedMultiVar,
      };
    }
    case "add.varSet.var": {
      const varSet = settings.vars.find(
        (s) => s.isSet && s.name === action.varSet.name
      );
      if (varSet.vars.find((v) => _.isEqual(v, action.var))) {
        return settings;
      } else {
        return {
          ...settings,
          vars: settings.vars.map((s) => {
            if (s.name === varSet.name) {
              return { ...s, vars: [...s.vars, action.var] };
            } else {
              return s;
            }
          }),
        };
      }
    }
    case "remove.varSet.var": {
      const varSet = settings.vars.find(
        (s) => s.isSet && s.name === action.varSet.name
      );
      return {
        ...settings,
        vars: settings.vars.map((s) => {
          if (s.name === varSet.name) {
            return {
              ...s,
              vars: s.vars.filter((v) => v.name !== action.var.name),
            };
          } else {
            return s;
          }
        }),
      };
    }
    case "set.controls.colorScale": {
      return {
        ...settings,
        controls: { ...settings.controls, colorScale: action.colorScale },
      };
    }
    case "set.controls.valueRange": {
      return {
        ...settings,
        controls: { ...settings.controls, valueRange: action.valueRange },
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
      if (_.isEqual(settings.selectedObs, action.obs)) {
        return {
          ...settings,
          sliceBy: { ...settings.sliceBy, obs: !settings.sliceBy.obs },
        };
      } else {
        return {
          ...settings,
          selectedObs: action.obs,
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
      if (settings.labelObs.find((i) => _.isEqual(i, action.obs))) {
        return settings;
      } else {
        return { ...settings, labelObs: [...settings.labelObs, action.obs] };
      }
    }
    case "remove.label.obs": {
      return {
        ...settings,
        labelObs: settings.labelObs.filter((a) => a.name !== action.obsName),
      };
    }
    case "reset.label.obs": {
      return { ...settings, labelObs: [] };
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

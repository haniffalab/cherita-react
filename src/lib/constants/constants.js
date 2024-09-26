export const LOCAL_STORAGE_KEY = "CHERITA";

export const COLOR_ENCODINGS = {
  VAR: "var",
  OBS: "obs",
};

export const OBS_TYPES = {
  CATEGORICAL: "categorical",
  DISCRETE: "discrete",
  CONTINUOUS: "continuous",
};

export const SELECTED_POLYGON_FILLCOLOR = [107, 170, 209, 255 / 2];
export const UNSELECTED_POLYGON_FILLCOLOR = [167, 191, 211, 255 / 3];

export const SELECTION_MODES = {
  SINGLE: "single",
  MULTIPLE: "multiple",
};

export const VIOLIN_MODES = {
  MULTIKEY: "multikey",
  GROUPBY: "groupby",
};

export const MATRIXPLOT_STANDARDSCALES = [
  { value: null, name: "None" },
  { value: "group", name: "Group" },
  { value: "var", name: "Var" },
];

export const DOTPLOT_STANDARDSCALES = [
  { value: null, name: "None" },
  { value: "group", name: "Group" },
  { value: "var", name: "Var" },
];

export const VIOLINPLOT_STANDARDSCALES = [
  { value: "width", name: "Width" },
  { value: "count", name: "Count" },
];

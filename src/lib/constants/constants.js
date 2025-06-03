export const LOCAL_STORAGE_KEY = "CHERITA";

export const PLOT_TYPES = {
  SCATTERPLOT: "scatterplot",
  DOTPLOT: "dotplot",
  HEATMAP: "heatmap",
  MATRIXPLOT: "matrixplot",
  VIOLINPLOT: "violinplot",
};

export const COLOR_ENCODINGS = {
  VAR: "var",
  OBS: "obs",
};

export const OBS_TYPES = {
  CATEGORICAL: "categorical",
  DISCRETE: "discrete",
  CONTINUOUS: "continuous",
  BOOLEAN: "boolean",
};

export const VAR_SORT = {
  NONE: null,
  NAME: "name",
  MATRIX: "matrix",
};

export const VAR_SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
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

export const MATRIXPLOT_SCALES = {
  NONE: { value: null, name: "None" },
  GROUP: { value: "group", name: "Group" },
  VAR: { value: "var", name: "Var" },
};

export const DOTPLOT_SCALES = {
  NONE: { value: null, name: "None" },
  GROUP: { value: "group", name: "Group" },
  VAR: { value: "var", name: "Var" },
};

export const VIOLINPLOT_SCALES = {
  WIDTH: { value: "width", name: "Width" },
  COUNT: { value: "count", name: "Count" },
};

export const PSEUDOSPATIAL_PLOT_TYPES = {
  GENE: "gene",
  CATEGORICAL: "categorical",
  CONTINUOUS: "continuous",
  MASKS: "masks",
};

export const PSEUDOSPATIAL_CATEGORICAL_MODES = {
  ACROSS: { value: "across", name: "% across sections" },
  WITHIN: { value: "within", name: "% within section" },
};

// `default` cols to be shown out of accordion, at top of obslist
// default values from cellxgene schema
export const DEFAULT_OBS_GROUP = [
  "assay",
  "cell_type",
  "development_stage",
  "disease",
  "donor_id",
  "organism",
  "self_reported_ethnicity",
  "sex",
  "suspension_type",
  "tissue",
  "tissue_type",
];

export const PLOTLY_MODEBAR_BUTTONS = [
  "toImage",
  "zoom2d",
  "pan2d",
  "zoomIn2d",
  "zoomOut2d",
  "autoScale2d",
  "resetScale2d",
];

export const BREAKPOINTS = {
  LG: "(max-width: 991.98px)",
  XL: "(max-width: 1199.98px)",
};

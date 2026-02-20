---
sidebar_position: 1
---

# Settings

Several props can be passed to provide information about the dataset, enable or disable features, or provide elements to be pre-selected when the data is loaded.

The only required prop is `dataset_url` which indicates the location of the remote AnnData-Zarr dataset.

## DatasetProvider

The `DatasetProvider` is a React context provider that manages dataset configuration and state.
It provides four nested contexts to components: `DatasetContext`, `SettingsContext`, `FilterContext` and `ZarrDataContext`

- `DatasetContext` holds information about the dataset or enables/disables features and can not be changed by user interaction
- `SettingsContext` holds values that are updated by user interaction, such as the obs or feature selections, colorscale, plot controls, etc.
- `FilterContext` holds the indices of selected observations and their min and max values to allow data to be sliced
- `ZarrDataContext` holds data fetched from the AnnData-Zarr directly

Props passed to `DatasetProvider` define the values in `DatasetContext` and can define the default or initial values of the `SettingsContext`. Values in `FilterContext` in `ZarrDataContext` are only computed by components or hooks and cannot be externally set.

### Usage

```jsx
import { DatasetProvider, Scatterplot } from "@haniffalab/cherita-react";

<DatasetProvider
  dataset_url="https://remote-anndata.zarr"
  varNamesCol="HGNC"
  enableObsGroups={true}
>
  <Scatterplot />
</DatasetProvider>
```

When using views, props should be provided to the view component which are then passed to the `DatasetProvider`

```jsx
import { ObservationFeature } from "@haniffalab/cherita-react";

<ObservationFeature.StandardView
  dataset_url="https://remote-anndata.zarr"
  enableObsGroups={false}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataset_url` | `string` | required | URL to the AnnData-Zarr file |
| `varNamesCol` | `string` | `null` | Column name for variable names to show in the [VarNamesCol](../components/metadata.md#varnameslist) and to use in the [SearchBar](../components/metadata.md#searchbar). For cases where the index of the `var` table holds id's or values not clear to the user |
| `obsSearchCol` | `string` | `null` | Column for observation search. Used by [SearchBar](../components/metadata.md#searchbar) when it is set with `searchObs` as `true` |
| `diseaseDatasets` | `array` | `[]` | Disease dataset configurations |
| `obsGroups` | `object` | `null` | Custom observation groupings |
| `imageUrl` | `string` | `null` | URL for spatial image |
| `useUnsColors` | `boolean` | `false` | Use `uns` colors from AnnData |
| `isPseudospatial` | `boolean` | `false` | Enable pseudospatial mode |
| `obsExplorer` | `object` | `{ obsCols: [], dataUrl: null, dataFilterCols: null }` | Data to load in the [ObsExplorer](../components/metadata.md#obsexplorer) component. `obsCols` is a list of columns from the `obs` table in the dataset to be loaded and displayed in the component. If undefined or empty, all columns are displayed. `dataUrl` is the location of a remote Parquet file with additional data to load. `dataFilterCols` is a map between columns in the `obs` table of the dataset and columns in the Parquet file to filter the data to load from the Parquet file. e.g., `dataFilterCols: {obs_id: parquet_id}` will filter the Parquet data to only those rows where `parquet_id` matches the selected observation's `obs_id` value |
| `canOverrideSettings` | `boolean` | `true` | Allow settings updated by user selections to be stored in the browser. When set to `false` only the `defaultSettings` will be considered on initial load of the dataset |
| `defaultSettings` | `object` | `{}` | Default values for `SettingsContext`, useful to set pre-selected values when data loads |

#### `defaultSettings`

Initial settings values can be provided as an object so a dataset is loaded with customized pre-selected values. All values handled by `SettingsContext` (except for `data` which are values resolved when the dataset is loaded) can be set through `defaultSettings`, however it is most useful for selections like `selectedObs`, `selectedVar`, `selectedObsm`, `selectedMultiVar`, `colorEncoding`.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `selectedObs` | `object` | `null` | Selected `obs` column like ` {name: "obs_name" }` |
| `selectedVar` | `object` | `null` | Selected variable for visualization (can be single variable or variable set) |
| `selectedObsm` | `object` | `null` | Selected observation matrix for dimensional reduction plots (e.g., "X_umap") |
| `selectedMultiVar` | `array` | `[]` | Array of multiple selected variables for comparison |
| `labelObs` | `array` | `[]` | Array of observation column names to display in the tooltips in the [Scatterplot](../components/plots.md#scatterplot) |
| `vars` | `array` | `[]` | Array of variables available for selection |
| `colorEncoding` | `COLOR_ENCODINGS` | `null` | Type of color encoding (variable-based or observation-based) |
| `sliceBy` | `object` | `{ obs: false, polygons: false }` | Configuration for data slicing by observations or polygons |
| `polygons` | `object` | `{}` | Polygon selection configurations for spatial plots |
| `controls` | `object` | [See below](./settings.md#controls-default) | Plot controls |
| `varSort` | `object` | `{}` | Variable sorting configuration |
| `pseudospatial` | `object` | [See below](./settings.md#pseudospatial-default) | Pseudospatial plot controls |
| `selectedObsIndex` | `int` | `null` | Index of currently selected observation |

##### `controls` {#controls-default}

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `colorScale` | `string` | `'Viridis'` | Default color scale for visualization |
| `range` | `array` | `[0, 1]` | Normalized range for color mapping [min, max] |
| `colorAxis` | `object` | `{ dmin: 0, dmax: 1, cmin: 0, cmax: 1}` | Color axis configuration with data and color limits |
| `scale` | `object` | `{ dotplot: DOTPLOT_SCALES.NONE.value, matrixplot: MATRIXPLOT_SCALES.NONE.value, violinplot: VIOLINPLOT_SCALES.WIDTH.value}` | Scaling options for different plot types |
| `meanOnlyExpressed` | `bool` | `false` | Whether to calculate mean only from expressed cells |
| `expressionCutoff` | `float` | 0.0 | Minimum expression threshold for calculations |
| `radiusScale` | `string` | `{}` | Scale configuration for radius-based visualizations |

##### `pseudospatial` {#pseudospatial-default}

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `maskSet` | `string` | `null` | Selected mask set for pseudospatial visualization |
| `maskValues` | `string` | `null` | Selected mask values within the chosen mask set |
| `categoricalMode` | `PSEUDOSPATIAL_CATEGORICAL_MODES` | `PSEUDOSPATIAL_CATEGORICAL_MODES.ACROSS.value` | Mode for categorical pseudospatial visualization |
| `refImg` | `object` | `{ visible: false, opacity: 1 }` | Reference image configuration for spatial context |
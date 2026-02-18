---
sidebar_position: 1
---

# Plot Components

`cherita-react` provides several plot components for visualizing single-cell data.

Plots can be used with [ObservationFeature.EmbeddedPlot](../views/observationfeature.md#embeddedplot) using available [plot types](../config/constants.md#plot-types) like

```jsx
import { ObservationFeature, PLOT_TYPES } from "@haniffalab/cherita-react";

<ObservationFeature.EmbeddedPlot
    dataset_url="https://remote-anndata.zarr"
    plotType={PLOT_TYPES.SCATTERPLOT}
/>
```

or directly within a [DatasetProvider](../config/settings.md#datasetprovider)

```jsx
import { DatasetProvider, Scatterplot } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
    <Scatterplot/>
</DatasetProvider>
```


## Scatterplot

Displays cells in 2D based on dimensionality reduction (UMAP, t-SNE, PCA, etc.)

Uses [deck.gl's ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer) and [nebula's EditableGeoJSONLayer](https://nebula.gl/docs/api-reference/layers/editable-geojson-layer) for drawn polygons.

Zooming in or out and panning can be done by scrolling or clicking and dragging directly on the scatterplot itself. Additionally, zooming in or out, resetting the view, drawing polygons, and opening the controls to adjust colorscale and colorscale range can be done through the [SpatialControls](./controls.md#spatialcontrols) component if enabled with `showSpatialControls`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pointInteractionEnabled` | `boolean` | `false` | Enable point selection and interaction |
| `showSpatialControls` | `boolean` | `true` | Show/hide spatial visualization controls |

#### Forwarded props (passed to child components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setShowCategories` | `function` | `undefined` | Callback function to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback function to toggle search display |
| `setPlotType` | `function` | `undefined` | Callback function to change plot type |
| `isFullscreen` | `boolean` | `false` | Whether plot is displayed in fullscreen mode |


## Dotplot

Shows proportion and expression of genes across observation groups.

Uses [React Plotly.js](https://plotly.com/javascript/react/).

Through the toolbar the [DotplotControls](./controls.md#dotplotcontrols) can be opened to adjust expression cutoff, colorscale, colorscale range, and standard scale.

### Props

#### Forwarded props (passed to child components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setShowCategories` | `function` | `undefined` | Callback function to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback function to toggle search display |
| `setShowControls` | `function` | `undefined` | Callback function to toggle controls panel |
| `setPlotType` | `function` | `undefined` | Callback function to change plot type |
| `isFullscreen` | `boolean` | `false` | Whether plot is displayed in fullscreen mode |


## Heatmap

Visualizes gene expression as a color-coded matrix.

Uses [React Plotly.js](https://plotly.com/javascript/react/).

Through the toolbar the [HeatmapControls](./controls.md#heatmapcontrols) can be opened to change the colorscale.

### Props

#### Forwarded props (passed to child components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setShowCategories` | `function` | `undefined` | Callback function to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback function to toggle search display |
| `setShowControls` | `function` | `undefined` | Callback function to toggle controls panel |
| `setPlotType` | `function` | `undefined` | Callback function to change plot type |
| `isFullscreen` | `boolean` | `false` | Whether plot is displayed in fullscreen mode |


## Matrixplot

Shows mean expression values of genes across categories.

Uses [React Plotly.js](https://plotly.com/javascript/react/).

Through the toolbar the [MatrixplotControls](./controls.md#matrixplotcontrols) can be opened to change the colorscale and standard scale.

### Props

#### Forwarded props (passed to child components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setShowCategories` | `function` | `undefined` | Callback function to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback function to toggle search display |
| `setShowControls` | `function` | `undefined` | Callback function to toggle controls panel |
| `setPlotType` | `function` | `undefined` | Callback function to change plot type |
| `isFullscreen` | `boolean` | `false` | Whether plot is displayed in fullscreen mode |


## Violin Plot

Displays distribution of gene expression across categories.

Uses [React Plotly.js](https://plotly.com/javascript/react/).

Through the toolbar the [ViolinControls](./controls.md#violincontrols) can be opened to change the standard scale.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `VIOLIN_MODES` | `VIOLIN_MODES.MULTIKEY` | Violin plot display mode |

#### Forwarded props (passed to child components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setShowCategories` | `function` | `undefined` | Callback function to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback function to toggle search display |
| `setShowControls` | `function` | `undefined` | Callback function to toggle controls panel |
| `setPlotType` | `function` | `undefined` | Callback function to change plot type |
| `isFullscreen` | `boolean` | `false` | Whether plot is displayed in fullscreen mode |


### Violin Modes

The violin plot component supports two display modes:

```jsx
VIOLIN_MODES.MULTIKEY  // Multiple variables on a single plot
VIOLIN_MODES.GROUPBY   // Group variables by observation categories
```
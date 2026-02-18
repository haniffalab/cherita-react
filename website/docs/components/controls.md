---
sidebar_position: 4
---

# Control Components

Components for controlling plot settings and appearance. Each plot type has an associated controls component that provides specific configuration options for that visualization.

## SpatialControls

Provides comprehensive controls for spatial visualization interactions including drawing tools, zoom controls, and filtering options. Used specifically with [Scatterplot](./plots.md#scatterplot) components for spatial data interactions.

The component is part of the [Scatterplot](./plots.md#scatterplot) if enabled by its `showSpatialControls` prop.
Most of the SpatialControls props are computed and controlled by its parent Scatterplot component.
`setShowCategories`, `setShowSearch` and `isFullscreen` are props provided to the Scatterplot component and passed directly to this component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `nebula.gl mode` | `ViewMode` | Current drawing/interaction mode for spatial visualization |
| `setMode` | `function` | `undefined` | Callback to change the drawing mode (ViewMode, DrawPolygonMode, etc.) |
| `features` | `GeoJSON FeatureCollection` | `undefined` | Collection of drawn features (polygons, lines) |
| `setFeatures` | `function` | `undefined` | Callback to update the features collection |
| `selectedFeatureIndexes` | `array` | `undefined` | Array of indices for currently selected features |
| `resetBounds` | `function` | `undefined` | Callback to reset the view bounds to default |
| `increaseZoom` | `function` | `undefined` | Callback to increase zoom level |
| `decreaseZoom` | `function` | `undefined` | Callback to decrease zoom level |
| `setShowCategories` | `function` | `undefined` | Callback to toggle category display |
| `setShowSearch` | `function` | `undefined` | Callback to toggle search display |
| `isFullscreen` | `boolean` | `false` | Whether the control is displayed in fullscreen mode |

## ScatterplotControls

Provides controls for [Scatterplot](./plots.md#scatterplot) visualization including colorscale selection, colorscale range adjustment, and point size configuration.

### Props

Component has no props.

## DotplotControls

Provides controls for [Dotplot](./plots.md#dotplot) visualization including colorscale configuration, expression cutoff adjustment, and data range controls.

### Props

Component has no props.

## HeatmapControls

Provides basic colorscale selection for [Heatmap](./plots.md#heatmap) visualizations.

### Props

Component has no props.

## MatrixplotControls

Provides controls for [Matrixplot](./plots.md#matrixplot) visualization including colorscale and data scaling options.

### Props

Component has no props.

## ViolinControls

Provides standard scaling options for [Violinplot](./plots.md#violin-plot) visualizations.

### Props

Component has no props.
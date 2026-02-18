---
sidebar_position: 1
---

# ObservationFeature

The `ObservationFeature` view provides visualization components for exploring observation-feature relationships in single-cell data.

## Views

### StandardView

A full-page view with integrated [observation list](../components/list.md#obscolslist), [variable list](../components/list.md#varnameslist), and [plot visualization](../components/plots.md).

```jsx
import { ObservationFeature, PLOT_TYPES } from "@haniffalab/cherita-react";

<ObservationFeature.StandardView
  dataset_url="https://remote-anndata.zarr"
  defaultPlotType={PLOT_TYPES.SCATTERPLOT}
  searchDiseases={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataset_url` | `string` | required | URL to the remote AnnData-Zarr file |
| `defaultPlotType` | `PLOT_TYPES` | `PLOT_TYPES.SCATTERPLOT` | Initial plot type to display |
| `searchDiseases` | `boolean` | `true` | Enable disease search functionality when searching for features (if dataset has associated disease data) |
| `...props` | `object` | - | Additional props passed to settings and children components |

### EmbeddedPlot

A standalone [plot component](../components/plots.md) that can be embedded in any container.

```jsx
import { ObservationFeature, PLOT_TYPES } from "@haniffalab/cherita-react";

<ObservationFeature.EmbeddedPlot
  plotType={PLOT_TYPES.DOTPLOT}
  dataset_url="https://remote-anndata.zarr"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataset_url` | `string` | required | URL to the remote AnnData-Zarr file |
| `plotType` | `PLOT_TYPES` | `PLOT_TYPES.SCATTERPLOT` | Type of plot to display |
| `...props` | `object` | - | Additional props passed to settings and children components |

## Available Plot Types

```jsx
import { PLOT_TYPES } from "@haniffalab/cherita-react";

PLOT_TYPES.SCATTERPLOT  // 2D scatterplot with dimensionality reduction
PLOT_TYPES.DOTPLOT      // Dot plot showing proportion and expression
PLOT_TYPES.HEATMAP      // Color-coded expression matrix
PLOT_TYPES.MATRIXPLOT   // Expression values across categories
PLOT_TYPES.VIOLINPLOT   // Distribution of expression across categories
```

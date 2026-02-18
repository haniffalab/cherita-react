---
sidebar_position: 2
---

# PerturbationMap

The `PerturbationMap` view is designed for visualizing perturbation experiments and their effects, allowing direct interaction with individual data points.

## Views

### StandardView

A specialized view for exploring perturbation data with gene information and differential expression analysis.

```jsx
import { PerturbationMap } from "@haniffalab/cherita-react";

<PerturbationMap.StandardView
  dataset_url="https://remote-anndata.zarr"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataset_url` | `string` | required | URL to the remote AnnData-Zarr file |
| `enableObsGroups` | `boolean` | `true` | Enable observation grouping |

## Features

- Gene symbol and alias display
- Differential expression gene (DEG) tables
- Integration with observation explorer
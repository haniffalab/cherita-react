---
sidebar_position: 2
---

# Constants

Cherita React exports several constants for configuration.

## Plot Types

```jsx
import { PLOT_TYPES } from "@haniffalab/cherita-react";

PLOT_TYPES.SCATTERPLOT  // "scatterplot"
PLOT_TYPES.DOTPLOT      // "dotplot"
PLOT_TYPES.HEATMAP      // "heatmap"
PLOT_TYPES.MATRIXPLOT   // "matrixplot"
PLOT_TYPES.VIOLINPLOT   // "violinplot"
```

## Selection Modes

```jsx
import { SELECTION_MODES } from "@haniffalab/cherita-react";

SELECTION_MODES.SINGLE    // Single selection
SELECTION_MODES.MULTIPLE  // Multiple selection
```

## Color Encodings

```jsx
import { COLOR_ENCODINGS } from "@haniffalab/cherita-react";

COLOR_ENCODINGS.VAR  // Color by variable (gene expression)
COLOR_ENCODINGS.OBS  // Color by observation (metadata)
```

## Violin Modes

```jsx
import { VIOLIN_MODES } from "@haniffalab/cherita-react";

VIOLIN_MODES.MULTIKEY  // Multiple variables in one plot
```
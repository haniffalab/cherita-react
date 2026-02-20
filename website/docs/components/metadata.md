---
sidebar_position: 2
---

# Metadata Components

Components for displaying and selecting observations and variables.

## ObsColsList

Displays a list of observation columns (metadata) with selection capabilities.

The ObsColsList is part of [ObservationFeature](../views/observationfeature.md) and [PerturbationMap](../views/perturbationmap.md) views.

When used within views, below a specific breakpoint for fullscreen views, the list component is not be shown and the plot toolbar will include a button to open the list component in an Offcanvas element.

Alternatively, the component can be used directly

```jsx
import { ObsColsList, DatasetProvider } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
  <ObsColsList
    showColor={true}
    enableObsGroups={true}
    showSelectedAsActive={false}
    showHistograms={true}
  />
</DatasetProvider>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showColor` | `boolean` | `true` | Show color indicators |
| `enableObsGroups` | `boolean` | `true` | Enable observation grouping |
| `showSelectedAsActive` | `boolean` | `false` | Highlight selected items |
| `showHistograms` | `boolean` | `true` | Show distribution histograms |

## VarNamesList

Displays a list of variables (genes/features) with selection and set management.

The VarNamesList is part of [ObservationFeature](../views/observationfeature.md) views.

When used within views, below a specific breakpoint for fullscreen views, the list component is not be shown and the plot toolbar will include a button to open the list component in an Offcanvas element.

Alternatively, the component can be used directly

```jsx
import { VarNamesList, DatasetProvider, SELECTION_MODES } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
  <VarNamesList
    mode={SELECTION_MODES.SINGLE}
    displayName="genes"
  />
</DatasetProvider>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `SELECTION_MODES` | `SELECTION_MODES.SINGLE` | Selection mode |
| `displayName` | `string` | `"genes"` | Display name for the list |

### Selection Modes

```jsx
SELECTION_MODES.SINGLE    // Select one variable at a time
SELECTION_MODES.MULTIPLE  // Select multiple variables
```

## ObsmKeysList

Displays available embedding spaces (UMAP, t-SNE, PCA, etc.).

The ObsmKeysList component is part of the [Scatterplot](plots.md#scatterplot)'s toolbox.

Alternatively, the component can be used directly

```jsx
import { ObsmKeysList, DatasetProvider } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
  <ObsmKeysList />
</DatasetProvider>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `setHasObsm` | `function` | `undefined` | Callback function to set whether the dataset has data in `obsm` |

## SearchBar

The SearchBar component provides search functionality for genes and diseases.
Disease search results depend on the backend service accessing additional data to the AnnData-Zarr dataset.

In [ObservationFeature](../views/observationfeature.md) views the SearchBar component is part of the sidebar with the [VarNamesList](./metadata.md#varnameslist).

Alternatively, the component can be used directly

```jsx
import { SearchBar, DatasetProvider } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
  <SearchBar searchDiseases={true} />
</DatasetProvider>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchVar` | `boolean` | `true` | Enable var/gene search |
| `searchDiseases` | `boolean` | `false` | Enable disease search |
| `searchObs` | `boolean` | `false` | Enable obs search |

## ObsExplorer

The ObsExplorer component displays information of a single observation. It is used by the [PerturbationMap](../views/perturbationmap.md)

Additional information from a remote Parquet file can be loaded if specified in the [configuration](../config/settings.md#props)

Alternatively, the component can be used directly

```jsx
import { ObsExplorer, DatasetProvider } from "@haniffalab/cherita-react";

<DatasetProvider dataset_url="https://remote-anndata.zarr">
  <ObsExplorer/>
</DatasetProvider>
```

### Props

Component has no props.
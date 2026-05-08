---
sidebar_position: 1
---

# Introduction

`cherita-react` is a React component library designed for data visualization and exploration of AnnData-Zarr files. This library provides reusable and customizable components for building interactive study narratives.

## Data Sources

Cherita loads data from an AnnData-Zarr in two different ways:

1. **Backend API**: For summarized data and plots, it requires a [cherita-flask-api](https://github.com/haniffalab/cherita-flask-api) backend service.
2. **Direct Zarr Access**: For data that can be loaded directly from a remote AnnData-Zarr, it uses [zarrita.js](https://zarrita.dev/).

## Installation

```sh
npm install @haniffalab/cherita-react
```

For styling, the package provides an scss file that can be imported in either Javascript or Typescript files

```js
import "@haniffalab/cherita-react/dist/cherita.css";
```

or in another CSS or SCSS file

```css
@import '@haniffalab/cherita-react/scss/cherita';
```

## Quick Start

### Environment variables

Provide the URL of the backend service through the `REACT_APP_API_URL` environment variable.

### Using a Standard View

The easiest way to get started is with a pre-built view:

```jsx
import { ObservationFeature } from "@haniffalab/cherita-react";

function App() {
  return (
    <ObservationFeature.StandardView
      dataset_url="https://remote-anndata.zarr"
    />
  );
}
```

### Using an Embedded Plot

For more control, use embedded plots:

```jsx
import { ObservationFeature, PLOT_TYPES } from "@haniffalab/cherita-react";

function App() {
  return (
    <div className="cherita-container">
      <ObservationFeature.EmbeddedPlot
        plotType={PLOT_TYPES.SCATTERPLOT}
        dataset_url="https://remote-anndata.zarr"
      />
    </div>
  );
}
```

### Using Individual Components

For full customization, compose individual components:

```jsx
import {
  DatasetProvider,
  Scatterplot,
  ObsColsList,
  VarNamesList
} from "@haniffalab/cherita-react";

function App() {
  return (
    <DatasetProvider dataset_url="https://remote-anndata.zarr">
      <div className="d-flex">
        <div className="sidebar">
          <ObsColsList />
          <VarNamesList />
        </div>
        <div className="main">
          <Scatterplot />
        </div>
      </div>
    </DatasetProvider>
  );
}
```

## Available Plot Types

| Plot Type | Description |
|-----------|-------------|
| Scatterplot | 2D visualization of cells based on dimensionality reduction |
| Dotplot | Shows proportion and expression of genes across groups |
| Heatmap | Color-coded expression matrix |
| Matrixplot | Mean expression values across categories |
| Violin Plot | Distribution of expression across categories |


## Requirements

- React 18.2.0 or higher
- A [cherita-flask-api](https://github.com/haniffalab/cherita-flask-api) backend for full functionality
- AnnData stored in Zarr format

## Links

<!-- - [Demo](https://default-dot-haniffa-lab.nw.r.appspot.com/) -->
- [GitHub Repository](https://github.com/haniffalab/cherita-react)
- [npm Package](https://www.npmjs.com/package/@haniffalab/cherita-react)
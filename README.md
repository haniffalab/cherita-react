[![build](https://github.com/haniffalab/cherita-react/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/haniffalab/cherita-react/actions/workflows/npm-publish.yml)
[![build-dev](https://github.com/haniffalab/cherita-react/actions/workflows/npm-publish-dev.yml/badge.svg)](https://github.com/haniffalab/cherita-react/actions/workflows/npm-publish-dev.yml)
[![npm](https://img.shields.io/npm/v/@haniffalab/cherita-react)](https://www.npmjs.com/package/@haniffalab/cherita-react)
[![tests](https://github.com/haniffalab/cherita-react/actions/workflows/tests.yml/badge.svg)](https://github.com/haniffalab/cherita-react/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/haniffalab/cherita-react/graph/badge.svg?token=8RLSQP1FFB)](https://codecov.io/gh/haniffalab/cherita-react)

# Cherita React

[![demo](https://img.shields.io/badge/Demo-view-blue)](https://default-dot-haniffa-lab.nw.r.appspot.com/)
[![doi](https://zenodo.org/badge/DOI/10.5281/zenodo.14244809.svg)](https://doi.org/10.5281/zenodo.14244809)

React component library designed for data visualisation and analysis of single-cell and spatial multi-omics data. This library provides a set of reusable and customisable components that can be used to used to build study narratives.

## Development

Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Install packages

```sh
npm i
```

Create a ``.env`` file within ``sites/demo`` to store environment variables for Vite to use. Within it set ``REACT_APP_API_URL`` to the backend API url like

```sh
REACT_APP_API_URL=http://localhost:5000/api/
```

Run the demo app

```sh
npm run start-demo
```

The app will automatically reload when changes are made

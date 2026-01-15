# Changelog

# [1.5.0](https://github.com/haniffalab/cherita-react/compare/v1.4.6...v1.5.0) (2026-01-15)


### Bug Fixes

* add padding around alerts in obs box ([c49d5ef](https://github.com/haniffalab/cherita-react/commit/c49d5ef330a831397e26d11fed6a3cfe749b5d13))
* guard against null obsm keys to fix [#206](https://github.com/haniffalab/cherita-react/issues/206) ([5251435](https://github.com/haniffalab/cherita-react/commit/525143586f04d4af61c4b7b771dae96de307a4cb))
* in obs search results use 'matrix_index' ([f440912](https://github.com/haniffalab/cherita-react/commit/f4409121130f696e11f088d20d3f8a58552e8b30))
* linting ([fb5378f](https://github.com/haniffalab/cherita-react/commit/fb5378f632dd6d3d5fcb995e830e88a17cfdb86e))
* on select in obs search results use 'matrix_index' ([cacd1be](https://github.com/haniffalab/cherita-react/commit/cacd1be27278b6c941618777e1b98bf5850a17a6))
* remove perturbgen from fullpage dropdown ([2496031](https://github.com/haniffalab/cherita-react/commit/24960310cec68c65ac09dbc05b667638378a6b4f))
* use lodash map to ensure falsey values return empty array ([d3c6dd3](https://github.com/haniffalab/cherita-react/commit/d3c6dd3bdf800f231b5dd3cf6b5e59fa925210d9)), closes [#210](https://github.com/haniffalab/cherita-react/issues/210)


### Features

* add plot component to wrap plots+offcanvas, similar to using fullpage component ([a2f8844](https://github.com/haniffalab/cherita-react/commit/a2f8844c2700c22b02146451fe4704b9b6a5746b))
* replace zarrjs with zarrita ([ec79116](https://github.com/haniffalab/cherita-react/commit/ec79116e04848f34e8da06d3ab9bc5bc79cc426d)), closes [#202](https://github.com/haniffalab/cherita-react/issues/202)

## [1.4.6](https://github.com/haniffalab/cherita-react/compare/v1.4.5...v1.4.6) (2025-11-20)


### Bug Fixes

* show error on ObsmKeysList instead of setting hasObsm to false ([baa5bc3](https://github.com/haniffalab/cherita-react/commit/baa5bc31fca6dfbdd3a0315031c6b8e74fde07ee))

## [1.4.5](https://github.com/haniffalab/cherita-react/compare/v1.4.4...v1.4.5) (2025-11-07)


### Bug Fixes

* scatterplot bug showing no obsm ([5a8b59b](https://github.com/haniffalab/cherita-react/commit/5a8b59b5708533a1c013a5cc8d1097c8b08962fc)), closes [#192](https://github.com/haniffalab/cherita-react/issues/192)
* set var encoding button icon to minus when selected ([e2d5cb6](https://github.com/haniffalab/cherita-react/commit/e2d5cb68e724550d9b6070303c93f031f355d451)), closes [#194](https://github.com/haniffalab/cherita-react/issues/194)

## [1.4.4](https://github.com/haniffalab/cherita-react/compare/v1.4.3...v1.4.4) (2025-10-29)


### Bug Fixes

* add @semantic-release/exec ([fe40bed](https://github.com/haniffalab/cherita-react/commit/fe40bedafc4407469f21ffddae5cbbf5e1325892))

## [1.4.3](https://github.com/haniffalab/cherita-react/compare/v1.4.2...v1.4.3) (2025-10-29)


### Bug Fixes

* include CITATION.cff as release asset ([9a7d080](https://github.com/haniffalab/cherita-react/commit/9a7d080623a2eecf92af547ea9d3aef45305355c))

## [1.4.2](https://github.com/haniffalab/cherita-react/compare/v1.4.1...v1.4.2) (2025-10-29)


### Bug Fixes

* add repeats on release workflow ([f7414ca](https://github.com/haniffalab/cherita-react/commit/f7414ca82f4218a22bb6c055873c76edfd6f9107))
* add repeats on release workflow ([2938044](https://github.com/haniffalab/cherita-react/commit/2938044f05e0a01ecd40d627e51ee17d277b5507))
* bug setting ObsList active to empty array ([ccc684a](https://github.com/haniffalab/cherita-react/commit/ccc684aa1a5e1e2b2725bb64d8622b07d2e34002))
* bugfix merge ([f3148d6](https://github.com/haniffalab/cherita-react/commit/f3148d688cea501c497a22ef8c73760b9c7414fd))
* remove CHANGELOG.md ([1290e83](https://github.com/haniffalab/cherita-react/commit/1290e830bd7424c8069df88b3f22f5214932f956))
* request obs/cols of obsGroups only when enableObsGroups ([f616cde](https://github.com/haniffalab/cherita-react/commit/f616cdeb4627b57f5a6133661894f01ecc29c16b))
* use optional isEnabled function opt in useDebouncedFetch to compute enabled with debouncedParams ([d511dd6](https://github.com/haniffalab/cherita-react/commit/d511dd6d092bef205554f5668e9a9124ca49923c))

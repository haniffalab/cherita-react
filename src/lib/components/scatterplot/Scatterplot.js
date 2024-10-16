import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  useRef,
} from "react";

import { ScatterplotLayer } from "@deck.gl/layers";
import { DeckGL } from "@deck.gl/react";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ViewMode } from "@nebula.gl/edit-modes";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { booleanPointInPolygon, point } from "@turf/turf";
import _ from "lodash";
import { Alert } from "react-bootstrap";

import { Legend } from "./Legend";
import { SpatialControls } from "./SpatialControls";
import { Toolbox } from "./Toolbox";
import {
  COLOR_ENCODINGS,
  OBS_TYPES,
  SELECTED_POLYGON_FILLCOLOR,
  UNSELECTED_POLYGON_FILLCOLOR,
} from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredDataDispatch } from "../../context/FilterContext";
import { useColor } from "../../helpers/color-helper";
import { MapHelper } from "../../helpers/map-helper";
import {
  GET_OPTIONS,
  useMultipleZarr,
  useZarr,
} from "../../helpers/zarr-helper";
import { LoadingLinear, LoadingSpinner } from "../../utils/LoadingIndicators";
import { formatNumerical } from "../../utils/string";

window.deck.log.level = 1;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 0,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const EPSILON = 1e-6;

const meanData = (_i, data) => {
  return _.zipWith(...data, (...values) => _.mean(values));
};

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const filterDispatch = useFilteredDataDispatch();
  const { getColor } = useColor();
  const deckRef = useRef(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [isRendering, setIsRendering] = useState(true);
  const [data, setData] = useState({
    ids: [],
    positions: [],
    values: [],
    sliceValues: [],
  });

  // EditableGeoJsonLayer
  const [mode, setMode] = useState(() => ViewMode);
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);

  const [obsmParams, setObsmParams] = useState({
    url: dataset.url,
    path: "obsm/" + dataset.selectedObsm,
  });
  const [xParams, setXParams] = useState(
    !dataset.selectedVar
      ? []
      : !dataset.selectedVar?.isSet
        ? [
            {
              url: dataset.url,
              path: "X",
              s: [null, dataset.selectedVar?.matrix_index],
            },
          ]
        : _.map(dataset.selectedVar?.vars, (v) => {
            return {
              url: dataset.url,
              path: "X",
              s: [null, v.matrix_index],
            };
          })
  );
  const [obsParams, setObsParams] = useState({
    url: dataset.url,
    path:
      "obs/" +
      dataset.selectedObs?.name +
      (dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
  });

  const [labelObsParams, setLabelObsParams] = useState([]);

  const obsmData = useZarr(obsmParams, null, GET_OPTIONS);
  const xData = useMultipleZarr(xParams, GET_OPTIONS, meanData);
  const obsData = useZarr(obsParams, null, GET_OPTIONS);
  const labelObsData = useMultipleZarr(labelObsParams, GET_OPTIONS);

  useEffect(() => {
    setObsmParams((p) => {
      return {
        ...p,
        path: "obsm/" + dataset.selectedObsm,
      };
    });
  }, [dataset.selectedObsm]);

  useEffect(() => {
    setXParams(
      !dataset.selectedVar
        ? []
        : !dataset.selectedVar?.isSet
          ? [
              {
                url: dataset.url,
                path: "X",
                s: [null, dataset.selectedVar?.matrix_index],
              },
            ]
          : _.map(dataset.selectedVar?.vars, (v) => {
              return {
                url: dataset.url,
                path: "X",
                s: [null, v.matrix_index],
              };
            })
    );
  }, [dataset.selectedVar, dataset.url]);

  useEffect(() => {
    setObsParams((p) => {
      return {
        ...p,
        path:
          "obs/" +
          dataset.selectedObs?.name +
          (dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
      };
    });
  }, [dataset.selectedObs]);

  useEffect(() => {
    setLabelObsParams(
      _.map(dataset.labelObs, (obs) => {
        return {
          url: dataset.url,
          path:
            "obs/" +
            obs.name +
            (obs.type === OBS_TYPES.CATEGORICAL ? "/codes" : ""),
          key: obs.name,
        };
      })
    );
  }, [dataset.labelObs, dataset.url]);

  useEffect(() => {
    setObsmParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
    setObsParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
  }, [dataset.url]);

  // @TODO: assert length of obsmData, xData, obsData is equal

  useEffect(() => {
    if (!obsmData.isPending && !obsmData.serverError) {
      setIsRendering(true);
      setData((d) => {
        return { ...d, positions: obsmData.data };
      });
      const mapHelper = new MapHelper();
      const { latitude, longitude, zoom } = mapHelper.fitBounds(obsmData.data, {
        width: deckRef?.current?.deck?.width,
        height: deckRef?.current?.deck?.height,
      });
      setViewState((v) => {
        return {
          ...v,
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
        };
      });
    } else if (!obsmData.isPending && obsmData.serverError) {
      setIsRendering(true);
      setData((d) => {
        return { ...d, positions: [] };
      });
    }
  }, [
    dataset.selectedObsm,
    obsmData.data,
    obsmData.isPending,
    obsmData.serverError,
  ]);

  const getBounds = useCallback(() => {
    const { latitude, longitude, zoom } = new MapHelper().fitBounds(
      data.positions,
      {
        width: deckRef?.current?.deck?.width,
        height: deckRef?.current?.deck?.height,
      }
    );

    return { latitude, longitude, zoom };
  }, [data.positions]);

  useEffect(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.VAR) {
      setIsRendering(true);
      if (!xData.isPending && !xData.serverError) {
        // @TODO: add condition to check obs slicing
        setData((d) => {
          return { ...d, values: xData.data };
        });
      } else if (!xData.isPending && xData.serverError) {
        setData((d) => {
          return { ...d, values: [] };
        });
      }
    }
  }, [
    dataset.colorEncoding,
    xData.data,
    xData.isPending,
    xData.serverError,
    getColor,
  ]);

  useEffect(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      setIsRendering(true);
      if (!obsData.isPending && !obsData.serverError) {
        setData((d) => {
          return { ...d, values: obsData.data };
        });
      } else if (!obsData.isPending && obsData.serverError) {
        setData((d) => {
          return { ...d, values: [] };
        });
      }
    } else if (
      dataset.colorEncoding === COLOR_ENCODINGS.VAR &&
      dataset.sliceBy.obs
    ) {
      if (!obsData.isPending && !obsData.serverError) {
        setData((d) => {
          return { ...d, sliceValues: obsData.data };
        });
      } else if (!obsData.isPending && obsData.serverError) {
        setData((d) => {
          return { ...d, sliceValues: [] };
        });
      }
    }
  }, [
    dataset.colorEncoding,
    obsData.data,
    obsData.isPending,
    obsData.serverError,
    dataset.sliceBy.obs,
  ]);

  const isCategorical = useMemo(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      return (
        dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
        dataset.selectedObs?.type === OBS_TYPES.BOOLEAN
      );
    } else {
      return false;
    }
  }, [dataset.colorEncoding, dataset.selectedObs?.type]);

  const isInBins = (v, binEdges, indices) => {
    const lastEdge = _.last(binEdges);
    const allButLastEdges = _.initial(binEdges);
    // add epsilon to last edge to include the last value
    const modifiedBinEdges = [
      ...allButLastEdges,
      [lastEdge[0], lastEdge[1] + EPSILON],
    ];
    const binIndices = _.difference(_.range(binEdges.length), indices);
    const ranges = _.at(modifiedBinEdges, binIndices);
    return _.some(ranges, (range) => _.inRange(v, ...range));
  };

  const isInSlice = useCallback(
    (index, values, positions) => {
      let inSlice = true;

      if (isCategorical && values) {
        inSlice &= !_.includes(dataset.selectedObs?.omit, values[index]);
      } else if (
        (dataset.sliceBy.obs ||
          (dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
            dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS)) &&
        !!dataset.selectedObs?.omit.length &&
        values
      ) {
        if (dataset.selectedObs.type === OBS_TYPES.CATEGORICAL) {
          inSlice &= !_.includes(dataset.selectedObs.omit, values[index]);
        } else if (dataset.selectedObs.type === OBS_TYPES.CONTINUOUS) {
          if (isNaN(values[index])) {
            inSlice &= !_.includes(dataset.selectedObs.omit, -1);
          } else {
            inSlice &= isInBins(
              values[index],
              dataset.selectedObs.bins.binEdges,
              _.without(dataset.selectedObs.omit, -1)
            );
          }
        }
      }

      if (dataset.sliceBy.polygons && positions) {
        inSlice &= _.some(features?.features, (_f, i) => {
          return booleanPointInPolygon(
            point([positions[index][0], positions[index][1]]),
            features.features[i]
          );
        });
      }
      return inSlice;
    },
    [
      dataset.colorEncoding,
      dataset.selectedObs?.bins?.binEdges,
      dataset.selectedObs?.omit,
      dataset.selectedObs?.type,
      dataset.sliceBy.obs,
      dataset.sliceBy.polygons,
      features.features,
      isCategorical,
    ]
  );

  const { filteredIndices, valueMin, valueMax, slicedLength } = useMemo(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.VAR) {
      const { filtered, filteredIndices } = _.reduce(
        data.values,
        (acc, v, i) => {
          if (isInSlice(i, data.sliceValues, data.positions)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() }
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(filtered),
        valueMax: _.max(filtered),
        slicedLength: filtered.length,
      };
    } else if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      const isContinuous = dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS;
      const { filtered, filteredIndices } = _.reduce(
        data.values,
        (acc, v, i) => {
          if (isInSlice(i, data.values, data.positions)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() }
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(isContinuous ? filtered : data.values),
        valueMax: _.max(isContinuous ? filtered : data.values),
        slicedLength: filtered.length,
      };
    } else {
      return {
        filteredIndices: null,
        valueMin: _.min(data.values),
        valueMax: _.max(data.values),
        slicedLength: data.values.length,
      };
    }
  }, [
    data.positions,
    data.sliceValues,
    data.values,
    dataset.colorEncoding,
    dataset.selectedObs?.type,
    isInSlice,
  ]);

  useEffect(() => {
    filterDispatch({
      type: "set.obs.indices",
      indices:
        dataset.sliceBy.obs || dataset.sliceBy.polygons
          ? filteredIndices
          : null,
    });
  }, [
    dataset.sliceBy.obs,
    dataset.sliceBy.polygons,
    filterDispatch,
    filteredIndices,
  ]);

  useEffect(() => {
    dispatch({
      type: "set.controls.valueRange",
      valueRange: [valueMin, valueMax],
    });
  }, [dispatch, valueMax, valueMin]);

  const { min, max } = {
    min: dataset.controls.range[0] * (valueMax - valueMin) + valueMin,
    max: dataset.controls.range[1] * (valueMax - valueMin) + valueMin,
  };

  const getFillColor = useCallback(
    (_d, { index }) => {
      const grayOut = filteredIndices && !filteredIndices.has(index);
      return getColor(
        (data.values[index] - min) / (max - min),
        isCategorical,
        grayOut
      );
    },
    [data.values, filteredIndices, getColor, isCategorical, max, min]
  );

  const memoizedLayers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "cherita-layer-scatterplot",
        pickable: true,
        data: data.positions,
        radiusScale: radius,
        radiusMinPixels: 1,
        getPosition: (d) => d,
        getFillColor: getFillColor,
        getRadius: 1,
        updateTriggers: {
          getFillColor: getFillColor,
        },
      }),
      new EditableGeoJsonLayer({
        id: "cherita-layer-draw",
        data: features,
        mode: mode,
        selectedFeatureIndexes,
        onEdit: ({ updatedData, editType, editContext }) => {
          setFeatures(updatedData);
          let updatedSelectedFeatureIndexes = selectedFeatureIndexes;
          if (editType === "addFeature") {
            const { featureIndexes } = editContext;
            updatedSelectedFeatureIndexes = [
              ...selectedFeatureIndexes,
              ...featureIndexes,
            ];
          }
          setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
        },
        // getFillColor: POLYGON_FILLCOLOR,
        _subLayerProps: {
          geojson: {
            getFillColor: (feature) => {
              if (
                selectedFeatureIndexes.some(
                  (i) => features.features[i] === feature
                )
              ) {
                return SELECTED_POLYGON_FILLCOLOR;
              } else {
                return UNSELECTED_POLYGON_FILLCOLOR;
              }
            },
          },
        },
      }),
    ];
  }, [
    data.positions,
    features,
    getFillColor,
    mode,
    radius,
    selectedFeatureIndexes,
  ]);

  const layers = useDeferredValue(
    mode === ViewMode ? memoizedLayers.reverse() : memoizedLayers
  ); // draw scatterplot on top of polygons when in ViewMode

  useEffect(() => {
    if (!features?.features?.length) {
      dispatch({
        type: "disable.slice.polygons",
      });
    }
  }, [dispatch, features?.features?.length]);

  function onLayerClick(info) {
    if (mode !== ViewMode) {
      // don't change selection while editing
      return;
    }

    setSelectedFeatureIndexes((f) =>
      info.object
        ? info.layer.id === "cherita-layer-draw"
          ? [info.index]
          : f
        : []
    );
  }

  const getLabel = (o, v, isVar = false) => {
    if (isVar || o.type === OBS_TYPES.CONTINUOUS) {
      return `${o.name}: ${formatNumerical(parseFloat(v))}`;
    } else {
      return `${o.name}: ${o.codesMap[v]}`;
    }
  };

  const getTooltip = ({ object, index }) => {
    if (!object) return;
    const text = [];

    if (
      dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
      dataset.selectedObs &&
      !_.some(dataset.labelObs, { name: dataset.selectedObs.name })
    ) {
      text.push(getLabel(dataset.selectedObs, obsData.data?.[index]));
    }

    if (dataset.colorEncoding === COLOR_ENCODINGS.VAR && dataset.selectedVar) {
      text.push(getLabel(dataset.selectedVar, xData.data?.[index], true));
    }

    if (dataset.labelObs.length) {
      text.push(
        ..._.map(labelObsData.data, (v, k) => {
          const labelObs = _.find(dataset.labelObs, (o) => o.name === k);
          return getLabel(labelObs, v[index]);
        })
      );
    }

    if (!text.length) return;

    return {
      text: text.length ? _.compact(text).join("\n") : null,
    };
  };

  const isPending =
    (isRendering || xData.isPending || obsmData.isPending) &&
    !obsmData.isPending;

  const error =
    (dataset.selectedObsm && obsmData.serverError?.length) ||
    (dataset.colorEncoding === COLOR_ENCODINGS.VAR &&
      xData.serverError?.length) ||
    (dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
      obsData.serverError?.length) ||
    (dataset.labelObs.lengh && labelObsData.serverError?.length);

  return (
    <div className="cherita-scatterplot">
      {obsmData.isPending && <LoadingSpinner disableShrink={true} />}
      {isPending && <LoadingLinear />}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e) => setViewState(e.viewState)}
        controller={{ doubleClickZoom: mode === ViewMode }}
        layers={layers}
        onClick={onLayerClick}
        getTooltip={getTooltip}
        onAfterRender={() => {
          setIsRendering(false);
        }}
        useDevicePixels={false}
        getCursor={({ isDragging }) =>
          mode !== ViewMode ? "crosshair" : isDragging ? "grabbing" : "grab"
        }
        ref={deckRef}
      ></DeckGL>
      <SpatialControls
        mode={mode}
        setMode={setMode}
        features={features}
        setFeatures={setFeatures}
        selectedFeatureIndexes={selectedFeatureIndexes}
        resetBounds={() => setViewState(getBounds())}
        increaseZoom={() => setViewState((v) => ({ ...v, zoom: v.zoom + 1 }))}
        decreaseZoom={() => setViewState((v) => ({ ...v, zoom: v.zoom - 1 }))}
      />
      <div className="cherita-spatial-footer">
        <div className="cherita-toolbox-footer">
          {error && !isPending && (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              &nbsp;Error loading data
            </Alert>
          )}
          <Toolbox
            mode={
              dataset.colorEncoding === COLOR_ENCODINGS.VAR
                ? dataset.selectedVar.name
                : dataset.colorEncoding === COLOR_ENCODINGS.OBS
                  ? dataset.selectedObs.name
                  : null
            }
            obsLength={parseInt(obsmData.data?.length)}
            slicedLength={parseInt(slicedLength)}
          />
        </div>
        <Legend isCategorical={isCategorical} min={min} max={max} />
      </div>
    </div>
  );
}

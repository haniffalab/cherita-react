import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ScatterplotLayer } from "@deck.gl/layers";
import { DeckGL } from "@deck.gl/react";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ViewMode } from "@nebula.gl/edit-modes";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import _ from "lodash";
import { Alert } from "react-bootstrap";

import { SpatialControls } from "./SpatialControls";
import { Toolbox } from "./Toolbox";
import {
  COLOR_ENCODINGS,
  OBS_TYPES,
  SELECTED_POLYGON_FILLCOLOR,
  UNSELECTED_POLYGON_FILLCOLOR,
} from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { useZarrData } from "../../context/ZarrDataContext";
import { rgbToHex, useColor } from "../../helpers/color-helper";
import { MapHelper } from "../../helpers/map-helper";
import { Legend } from "../../utils/Legend";
import { LoadingLinear, LoadingSpinner } from "../../utils/LoadingIndicators";
import { formatNumerical } from "../../utils/string";
import { useLabelObsData } from "../../utils/zarrData";

window.deck.log.level = 1;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 0,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export function Scatterplot({
  radius = null,
  setShowObs,
  setShowVars,
  isFullscreen = false,
}) {
  const { useUnsColors } = useDataset();
  const settings = useSettings();
  const { obsIndices, valueMin, valueMax, slicedLength } = useFilteredData();
  const dispatch = useSettingsDispatch();
  const { getColor } = useColor();
  const deckRef = useRef(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [isRendering, setIsRendering] = useState(true);
  const [radiusScale, setRadiusScale] = useState(radius || 1);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState({
    positions: [],
    values: [],
  });
  const [coordsError, setCoordsError] = useState(null);
  const [hasObsm, setHasObsm] = useState(true);

  // EditableGeoJsonLayer
  const [mode, setMode] = useState(() => ViewMode);
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: settings.polygons[settings.selectedObsm] || [],
  });
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);

  const { obsmData, xData, obsData } = useZarrData();
  const labelObsData = useLabelObsData();
  // @TODO: assert length of obsmData, xData, obsData is equal

  const getRadiusScale = useCallback(
    (bounds) => {
      if (!!radius) return radius;
      // From 28 degrees ~= 30km -> 30m radius
      const lonDim = bounds[1][0] - bounds[0][0];
      const latDim = bounds[1][1] - bounds[0][1];
      const minDim = Math.min(lonDim, latDim);
      const rs = (0.01 / minDim) * 111111;
      return rs;
    },
    [radius]
  );

  useEffect(() => {
    if (
      obsmData.isPending ||
      (settings.colorEncoding === COLOR_ENCODINGS.VAR && xData.isPending) ||
      (settings.colorEncoding === COLOR_ENCODINGS.OBS && obsData.isPending)
    ) {
      setIsPending(true);
    } else {
      setIsPending(false);
      setData((d) => {
        let values = d.values;
        if (settings.colorEncoding === COLOR_ENCODINGS.VAR) {
          values = !xData.serverError ? xData.data : values;
        } else if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
          values = !obsData.serverError ? obsData.data : values;
        }
        if (!obsmData.serverError && obsmData.data) {
          if (obsmData.data[0].length !== 2) {
            setCoordsError("Invalid coordinates. Expected 2D coordinates");
            return { positions: [], values: [] };
          }
          setCoordsError(null);
          return {
            positions: obsmData.data,
            values: values,
          };
        }
        return {
          positions: d.positions,
          values: values,
        };
      });
    }
  }, [
    obsData.data,
    obsData.isPending,
    obsData.serverError,
    obsmData.data,
    obsmData.isPending,
    obsmData.serverError,
    settings.colorEncoding,
    xData.data,
    xData.isPending,
    xData.serverError,
  ]);

  useEffect(() => {
    if (data.positions && !!data.positions.length) {
      const mapHelper = new MapHelper();
      const { latitude, longitude, zoom, bounds } = mapHelper.fitBounds(
        data.positions,
        {
          width: deckRef?.current?.deck?.width,
          height: deckRef?.current?.deck?.height,
        }
      );
      setRadiusScale(getRadiusScale(bounds));
      setViewState((v) => {
        return { ...v, longitude: longitude, latitude: latitude, zoom: zoom };
      });
    }
  }, [
    getRadiusScale,
    obsmData.data,
    obsmData.isPending,
    obsmData.serverError,
    data.positions,
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

  // Make stable references for getOriginalIndex and sortedIndexMap
  const identityGetOriginalIndex = useCallback((i) => i, []);
  const identitySortedIndexMap = useMemo(() => ({ get: (key) => key }), []);

  const { sortedData, getOriginalIndex, sortedIndexMap } = useMemo(() => {
    if (
      (settings.colorEncoding === COLOR_ENCODINGS.VAR ||
        (settings.colorEncoding === COLOR_ENCODINGS.OBS &&
          settings.selectedObs?.type === OBS_TYPES.CONTINUOUS)) &&
      data.positions &&
      data.values &&
      data.positions.length === data.values.length
    ) {
      const sortedIndices = _.map(data.values, (_v, i) => i).sort(
        (a, b) => data.values[a] - data.values[b]
      );
      const sortedIndexMap = new Map(
        _.map(sortedIndices, (originalIndex, sortedIndex) => [
          originalIndex,
          sortedIndex,
        ])
      );
      return {
        sortedData: _.mapValues(data, (v, _k) => {
          return v ? _.at(v, sortedIndices) : v;
        }),
        getOriginalIndex: (i) => sortedIndices[i],
        sortedIndexMap: sortedIndexMap,
      };
    }
    return {
      sortedData: data,
      getOriginalIndex: identityGetOriginalIndex, // return original index
      sortedIndexMap: identitySortedIndexMap, // return original index
    };
  }, [
    data,
    identityGetOriginalIndex,
    identitySortedIndexMap,
    settings.colorEncoding,
    settings.selectedObs?.type,
  ]);

  const sortedObsIndices = useMemo(() => {
    return obsIndices
      ? new Set(Array.from(obsIndices, (i) => sortedIndexMap.get(i)))
      : obsIndices;
  }, [obsIndices, sortedIndexMap]);

  const isCategorical = useMemo(() => {
    if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
      return (
        settings.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
        settings.selectedObs?.type === OBS_TYPES.BOOLEAN
      );
    } else {
      return false;
    }
  }, [settings.colorEncoding, settings.selectedObs?.type]);

  useEffect(() => {
    dispatch({
      type: "set.controls.valueRange",
      valueRange: [valueMin, valueMax],
    });
  }, [dispatch, valueMax, valueMin]);

  const { min, max } = {
    min: settings.controls.range[0] * (valueMax - valueMin) + valueMin,
    max: settings.controls.range[1] * (valueMax - valueMin) + valueMin,
  };

  const getFillColor = useCallback(
    (_d, { index }) => {
      const grayOut =
        isPending || (sortedObsIndices && !sortedObsIndices.has(index));
      return (
        getColor({
          value: (sortedData.values[index] - min) / (max - min),
          categorical: isCategorical,
          grayOut: grayOut,
          ...(useUnsColors &&
          settings.colorEncoding === COLOR_ENCODINGS.OBS &&
          settings.selectedObs?.colors
            ? { colorscale: settings.selectedObs?.colors }
            : {}),
        }) || [0, 0, 0, 100]
      );
    },
    [
      isPending,
      sortedObsIndices,
      getColor,
      sortedData.values,
      min,
      max,
      isCategorical,
      useUnsColors,
      settings.colorEncoding,
      settings.selectedObs?.colors,
    ]
  );

  // @TODO: add support for pseudospatial hover to reflect in radius
  const getRadius = useCallback(
    (_d, { index }) => {
      const grayOut = sortedObsIndices && !sortedObsIndices.has(index);
      return grayOut ? 1 : 3;
    },
    [sortedObsIndices]
  );

  const memoizedLayers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "cherita-layer-scatterplot",
        pickable: true,
        data: sortedData.positions,
        radiusScale: radiusScale,
        radiusMinPixels: 1,
        getPosition: (d) => d,
        getFillColor: getFillColor,
        getRadius: getRadius,
        updateTriggers: { getFillColor: getFillColor, getRadius: getRadius },
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
    sortedData.positions,
    features,
    getFillColor,
    getRadius,
    mode,
    radiusScale,
    selectedFeatureIndexes,
  ]);

  const layers = useDeferredValue(
    mode === ViewMode ? memoizedLayers.reverse() : memoizedLayers
  ); // draw scatterplot on top of polygons when in ViewMode

  useEffect(() => {
    if (!features?.features?.length) {
      dispatch({ type: "disable.slice.polygons" });
    }
  }, [dispatch, features?.features?.length]);

  useEffect(() => {
    dispatch({
      type: "set.polygons",
      obsm: settings.selectedObsm,
      polygons: features?.features || [],
    });
  }, [settings.selectedObsm, dispatch, features.features]);

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
    if (!object || object?.type === "Feature") return;
    const text = [];

    if (
      settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      settings.selectedObs &&
      !_.some(settings.labelObs, { name: settings.selectedObs.name })
    ) {
      text.push(
        getLabel(settings.selectedObs, data.values?.[getOriginalIndex(index)])
      );
    }

    if (
      settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      settings.selectedVar
    ) {
      text.push(
        getLabel(
          settings.selectedVar,
          data.values?.[getOriginalIndex(index)],
          true
        )
      );
    }

    if (settings.labelObs.length) {
      text.push(
        ..._.map(labelObsData.data, (v, k) => {
          const labelObs = _.find(settings.labelObs, (o) => o.name === k);
          return getLabel(labelObs, v[getOriginalIndex(index)]);
        })
      );
    }

    if (!text.length) return;

    const grayOut = sortedObsIndices && !sortedObsIndices.has(index);

    return {
      text: text.length ? _.compact(text).join("\n") : null,
      className: grayOut ? "tooltip-grayout" : "deck-tooltip",
      style: !grayOut
        ? {
            "border-left": `3px solid ${rgbToHex(getFillColor(null, { index }))}`,
          }
        : { "border-left": "none" },
    };
  };

  const error =
    (settings.selectedObsm && obsmData.serverError?.length) ||
    (settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      xData.serverError?.length) ||
    (settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      obsData.serverError?.length) ||
    (settings.labelObs.length && labelObsData.serverError?.length) ||
    coordsError;

  if (!hasObsm) {
    return (
      <div className="cherita-container-scatterplot">
        <div className="cherita-scatterplot d-flex h-100 w-100 align-items-center justify-content-center">
          <Alert variant="warning">
            This dataset does not contain embeddings. Please use a different
            type of plot.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="cherita-container-scatterplot">
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
          setShowObs={setShowObs}
          setShowVars={setShowVars}
          isFullscreen={isFullscreen}
        />
        <div className="cherita-spatial-footer">
          <div className="cherita-toolbox-footer">
            {!!error && !isRendering && (
              <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                &nbsp;Error loading data
              </Alert>
            )}
            <Toolbox
              mode={
                settings.colorEncoding === COLOR_ENCODINGS.VAR
                  ? settings.selectedVar?.name
                  : settings.colorEncoding === COLOR_ENCODINGS.OBS
                    ? settings.selectedObs?.name
                    : null
              }
              obsLength={parseInt(data.positions?.length)}
              slicedLength={parseInt(slicedLength)}
              setHasObsm={setHasObsm}
            />
          </div>
          <Legend isCategorical={isCategorical} min={min} max={max} />
        </div>
      </div>
    </div>
  );
}

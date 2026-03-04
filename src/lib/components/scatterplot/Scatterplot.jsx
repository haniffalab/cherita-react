import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LinearInterpolator } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ViewMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
import _ from 'lodash';
import { Alert } from 'react-bootstrap';

import { SpatialControls } from './SpatialControls';
import { Toolbox } from './Toolbox';
import {
  COLOR_ENCODINGS,
  OBS_TYPES,
  PLOT_TYPES,
  SELECTED_POLYGON_FILLCOLOR,
  UNSELECTED_POLYGON_FILLCOLOR,
} from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { useFilteredData } from '../../context/FilterContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { useZarrData } from '../../context/ZarrDataContext';
import { rgbToHex, useColor } from '../../helpers/color-helper';
import { MapHelper } from '../../helpers/map-helper';
import { Legend } from '../../utils/Legend';
import { LoadingLinear, LoadingSpinner } from '../../utils/LoadingIndicators';
import { useSelectedObs } from '../../utils/Resolver';
import { formatNumerical } from '../../utils/string';
import usePlotVisibility from '../../utils/usePlotVisibility';
import { useLabelObsData } from '../../utils/zarrData';
import { PlotAlert } from '../plot/PlotAlert';

window.deck.log.level = 1;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 0,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const getRadiusScale = (bounds) => {
  // From 28 degrees ~= 30km -> 30m radius
  const lonDim = bounds[1][0] - bounds[0][0];
  const latDim = bounds[1][1] - bounds[0][1];
  const minDim = Math.min(lonDim, latDim);
  const rs = (0.01 / minDim) * 111111;
  return rs;
};

export function Scatterplot({
  pointInteractionEnabled = false,
  showSpatialControls = true,
  setShowCategories,
  setShowSearch,
  setPlotType,
  isFullscreen = false,
}) {
  const { useUnsColors } = useDataset();
  const settings = useSettings();
  const { obsIndices, valueMin, valueMax, slicedLength } = useFilteredData();
  const dispatch = useSettingsDispatch();
  const { getColor } = useColor();
  const deckRef = useRef(null);
  const [viewport, setViewport] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [isRendering, setIsRendering] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState({
    positions: [],
    values: [],
  });
  const [coordsError, setCoordsError] = useState(null);
  const [hasObsm, setHasObsm] = useState(true);
  const [dataError, setDataError] = useState(null);

  const radiusScale = settings.controls.radiusScale[settings.selectedObsm] || 1;

  const selectedObs = useSelectedObs();
  const selectedObsIndex = settings.selectedObsIndex;

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveringPoint, setIsHoveringPoint] = useState(false);
  const { showSearchBtn } = usePlotVisibility(isFullscreen);

  // EditableGeoJsonLayer
  const [mode, setMode] = useState(() => ViewMode);
  const [features, setFeatures] = useState({
    type: 'FeatureCollection',
    features: settings.polygons[settings.selectedObsm] || [],
  });
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);

  const { obsmData, xData, obsData } = useZarrData();
  const labelObsData = useLabelObsData();
  const clickedInsideRef = useRef(false);

  // @TODO: assert length of obsmData, xData, obsData is equal

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
          if (!xData.serverError) {
            values = xData.data;
            setDataError(null);
          } else {
            values = [];
            setDataError(xData.serverError);
          }
        } else if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
          if (!obsData.serverError) {
            values = obsData.data;
            setDataError(null);
          } else {
            values = [];
            setDataError(obsData.serverError);
          }
        }
        if (!obsmData.serverError && obsmData.data) {
          if (obsmData.data[0].length !== 2) {
            setCoordsError('Invalid coordinates. Expected 2D coordinates');
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
    if (data.positions && data.positions.length) {
      const mapHelper = new MapHelper();
      const { latitude, longitude, zoom, bounds } = mapHelper.fitBounds(
        data.positions,
        {
          width: deckRef?.current?.deck?.width,
          height: deckRef?.current?.deck?.height,
        },
      );
      setViewState((v) => ({
        ...v,
        latitude,
        longitude,
        zoom,
      }));
      setViewport({ latitude, longitude, zoom, bounds });
    }
  }, [data.positions]);

  useEffect(() => {
    if (
      viewport?.bounds &&
      !settings.controls.radiusScale[settings.selectedObsm]
    ) {
      dispatch({
        type: 'set.controls.radiusScale',
        obsm: settings.selectedObsm,
        radiusScale: getRadiusScale(viewport.bounds),
      });
    }
  }, [
    dispatch,
    settings.controls.radiusScale,
    settings.selectedObsm,
    viewport?.bounds,
  ]);

  useEffect(() => {
    if (!pointInteractionEnabled) return;
    if (selectedObsIndex == null) return;
    if (!data.positions?.length) return;

    // If the selection came from a click inside this plot, skip recentering
    if (clickedInsideRef.current) {
      clickedInsideRef.current = false;
      return;
    }

    const coords = data.positions[selectedObsIndex];
    if (!coords) return;

    // Update viewState to centre on this point
    setViewState((v) => ({
      ...v,
      longitude: coords[0],
      latitude: coords[1],
      zoom: Math.max(v.zoom, 6),
      transitionDuration: 500,
      transitionInterpolator: new LinearInterpolator([
        'longitude',
        'latitude',
        'zoom',
      ]), //@TODO: switch to easing interpolator
    }));
  }, [pointInteractionEnabled, selectedObsIndex, data.positions]);

  const getBounds = useCallback(() => {
    const { latitude, longitude, zoom } = new MapHelper().fitBounds(
      data.positions,
      {
        width: deckRef?.current?.deck?.width,
        height: deckRef?.current?.deck?.height,
      },
    );

    return { latitude, longitude, zoom };
  }, [data.positions]);

  // Make stable references for getOriginalIndex and sortedIndexMap
  const identityGetOriginalIndex = useCallback((i) => i, []);
  const identitySortedIndexMap = useMemo(() => ({ get: (key) => key }), []);

  const { sortedIndices, getOriginalIndex, sortedIndexMap } = useMemo(() => {
    const isNumericalColorEncoding =
      settings.colorEncoding === COLOR_ENCODINGS.VAR ||
      (settings.colorEncoding === COLOR_ENCODINGS.OBS &&
        selectedObs?.type === OBS_TYPES.CONTINUOUS);
    const isCategoricalColorEncoding =
      settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      (selectedObs?.type === OBS_TYPES.CATEGORICAL ||
        selectedObs?.type === OBS_TYPES.BOOLEAN);

    if (
      (isNumericalColorEncoding || isCategoricalColorEncoding) &&
      data.positions &&
      data.values &&
      data.positions.length === data.values.length
    ) {
      const n = data.values.length;
      // Use typed array for better performance with large datasets
      const indices = new Uint32Array(n);
      for (let i = 0; i < n; i++) indices[i] = i;

      const values = data.values;

      if (isCategoricalColorEncoding) {
        indices.sort((a, b) => {
          const va = values[a];
          const vb = values[b];
          if (va === vb) return 0;
          if (va === -1) return -1;
          if (vb === -1) return 1;
          return 0;
        });
      } else {
        indices.sort((a, b) => {
          const va = values[a];
          const vb = values[b];
          if (Number.isNaN(va) && Number.isNaN(vb)) return 0;
          if (Number.isNaN(va)) return -1;
          if (Number.isNaN(vb)) return 1;
          return va - vb;
        });
      }

      const reverseMap = new Uint32Array(n);
      for (let i = 0; i < n; i++) {
        reverseMap[indices[i]] = i;
      }

      return {
        sortedIndices: indices,
        getOriginalIndex: (i) => indices[i],
        sortedIndexMap: { get: (key) => reverseMap[key] },
      };
    }
    return {
      sortedIndices: null,
      getOriginalIndex: identityGetOriginalIndex,
      sortedIndexMap: identitySortedIndexMap,
    };
  }, [
    data,
    identityGetOriginalIndex,
    identitySortedIndexMap,
    selectedObs?.type,
    settings.colorEncoding,
  ]);

  // create sortedPositions as scatterplot layer expects data to be an array
  const sortedPositions = useMemo(() => {
    if (!sortedIndices || !data.positions?.length) return data.positions;
    const n = sortedIndices.length;
    const result = new Array(n);
    for (let i = 0; i < n; i++) {
      result[i] = data.positions[sortedIndices[i]];
    }
    return result;
  }, [data.positions, sortedIndices]);

  const sortedObsIndices = useMemo(() => {
    if (!obsIndices) return obsIndices;
    const result = new Set();
    for (const i of obsIndices) {
      result.add(sortedIndexMap.get(i));
    }
    return result;
  }, [obsIndices, sortedIndexMap]);

  const isCategorical = useMemo(() => {
    if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
      return (
        selectedObs?.type === OBS_TYPES.CATEGORICAL ||
        selectedObs?.type === OBS_TYPES.BOOLEAN
      );
    } else {
      return false;
    }
  }, [settings.colorEncoding, selectedObs?.type]);

  const { min, max } = {
    min: settings.controls.range[0] * (valueMax - valueMin) + valueMin,
    max: settings.controls.range[1] * (valueMax - valueMin) + valueMin,
  };

  const getFillColor = useCallback(
    (_d, { index }) => {
      const grayOut =
        isPending || (sortedObsIndices && !sortedObsIndices.has(index));

      const originalIndex = getOriginalIndex(index);

      if (pointInteractionEnabled && originalIndex === selectedObsIndex) {
        return [255, 215, 0, 255];
      }

      return (
        getColor({
          value: (data.values[originalIndex] - min) / (max - min),
          categorical: isCategorical,
          grayOut: grayOut,
          ...(useUnsColors &&
          settings.colorEncoding === COLOR_ENCODINGS.OBS &&
          selectedObs?.colors
            ? { colorscale: selectedObs?.colors }
            : {}),
        }) || [0, 0, 0, 100]
      );
    },
    [
      isPending,
      sortedObsIndices,
      pointInteractionEnabled,
      getOriginalIndex,
      selectedObsIndex,
      getColor,
      data.values,
      min,
      max,
      isCategorical,
      useUnsColors,
      settings.colorEncoding,
      selectedObs?.colors,
    ],
  );

  // @TODO: add support for pseudospatial hover to reflect in radius
  const getRadius = useCallback(
    (_d, { index }) => {
      const grayOut = sortedObsIndices && !sortedObsIndices.has(index);
      const isHovered = pointInteractionEnabled && index === hoveredIndex;

      if (
        pointInteractionEnabled &&
        getOriginalIndex(index) === selectedObsIndex
      ) {
        return 100;
      }

      return (
        (grayOut ? 1 : 3) *
        (pointInteractionEnabled ? 26 : 1) *
        (isHovered ? 1.5 : 1)
      );
    },
    [
      getOriginalIndex,
      hoveredIndex,
      pointInteractionEnabled,
      selectedObsIndex,
      sortedObsIndices,
    ],
  );

  const memoizedLayers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: 'cherita-layer-scatterplot',
        pickable: true,
        autoHighlight: pointInteractionEnabled,
        highlightColor: [255, 215, 0, 255],
        data: sortedPositions,
        radiusScale: radiusScale,
        radiusMinPixels: 1,
        getPosition: (d) => d,
        getFillColor: getFillColor,
        getRadius: getRadius,
        updateTriggers: {
          getFillColor: getFillColor,
          getRadius: [getRadius, hoveredIndex, selectedObsIndex],
        },
        transitions: {
          getRadius: 200,
          getFillColor: 200,
        },
      }),
      new EditableGeoJsonLayer({
        id: 'cherita-layer-draw',
        data: features,
        mode: mode,
        selectedFeatureIndexes,
        onEdit: ({ updatedData, editType, editContext }) => {
          setFeatures(updatedData);
          let updatedSelectedFeatureIndexes = selectedFeatureIndexes;
          if (editType === 'addFeature') {
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
                  (i) => features.features[i] === feature,
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
    pointInteractionEnabled,
    sortedPositions,
    radiusScale,
    getFillColor,
    getRadius,
    hoveredIndex,
    selectedObsIndex,
    features,
    mode,
    selectedFeatureIndexes,
  ]);

  const layers = useDeferredValue(
    mode === ViewMode ? memoizedLayers.reverse() : memoizedLayers,
  ); // draw scatterplot on top of polygons when in ViewMode

  useEffect(() => {
    if (!features?.features?.length) {
      dispatch({ type: 'disable.slice.polygons' });
    }
  }, [dispatch, features?.features?.length]);

  useEffect(() => {
    dispatch({
      type: 'set.polygons',
      obsm: settings.selectedObsm,
      polygons: features?.features || [],
    });
  }, [settings.selectedObsm, dispatch, features.features]);

  function onLayerClick(info) {
    if (mode !== ViewMode) return;

    if (!info.object) {
      // clicked empty space
      setSelectedFeatureIndexes([]);
      return;
    }

    if (info.layer.id === 'cherita-layer-draw') {
      // clicked a drawn polygon
      setSelectedFeatureIndexes([info.index]);
    } else if (
      info.layer.id === 'cherita-layer-scatterplot' &&
      pointInteractionEnabled
    ) {
      // clicked a scatterplot point
      clickedInsideRef.current = true;
      const originalIndex = getOriginalIndex(info.index);
      dispatch({ type: 'set.selectedObsIndex', index: originalIndex });
      // in collapsed view, open offcanvas
      if (pointInteractionEnabled && showSearchBtn) {
        setShowSearch(true);
      }
    }
  }

  const getLabel = (o, v, isVar = false) => {
    if (isVar || o.type === OBS_TYPES.CONTINUOUS) {
      return `${o.name}: ${formatNumerical(parseFloat(v))}`;
    } else if (o.type === OBS_TYPES.DISCRETE) {
      return `${o.name}: ${v}`;
    } else if (o.type === OBS_TYPES.BOOLEAN) {
      return `${o.name}: ${o.codesMap[+v]}`;
    } else {
      return `${o.name}: ${o.codesMap[v]}`;
    }
  };

  const getTooltip = ({ object, index }) => {
    if (!object || object?.type === 'Feature') return;
    const text = [];

    if (
      settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      selectedObs &&
      !_.includes(settings.labelObs, selectedObs.name)
    ) {
      text.push(getLabel(selectedObs, data.values?.[getOriginalIndex(index)]));
    }

    if (
      settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      settings.selectedVar
    ) {
      text.push(
        getLabel(
          settings.selectedVar,
          data.values?.[getOriginalIndex(index)],
          true,
        ),
      );
    }

    if (settings.labelObs.length) {
      text.push(
        ..._.map(labelObsData.data, (v, k) => {
          if (!v) return;
          const labelObs = settings.data.obs[k];
          return getLabel(labelObs, v[getOriginalIndex(index)]);
        }),
      );
    }

    if (!text.length) return;

    const grayOut = sortedObsIndices && !sortedObsIndices.has(index);

    return {
      text: text.length ? _.compact(text).join('\n') : null,
      className: grayOut ? 'tooltip-grayout' : 'deck-tooltip',
      style: !grayOut
        ? {
            'border-left': `3px solid ${rgbToHex(getFillColor(null, { index }))}`,
          }
        : { 'border-left': 'none' },
    };
  };

  const error =
    (settings.selectedObsm && obsmData.serverError?.length) ||
    dataError ||
    (settings.labelObs.length && labelObsData.serverError?.length) ||
    coordsError;

  if (!hasObsm) {
    return (
      <PlotAlert
        variant="info"
        heading="Scatterplot unavailable for this dataset"
        plotType={PLOT_TYPES.SCATTERPLOT}
        setPlotType={setPlotType}
      >
        This dataset does not include any embeddings, so a scatterplot cannot be
        displayed. Please choose a different plot type to explore the data.
      </PlotAlert>
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
          onHover={({ object, index }) => {
            const active = pointInteractionEnabled && !!object;
            setHoveredIndex(active ? index : null);
            setIsHoveringPoint(active);
          }}
          getCursor={({ isDragging }) => {
            if (mode !== ViewMode) return 'crosshair';
            if (isDragging) return 'grabbing';
            if (isHoveringPoint) return 'pointer';
            return 'grab';
          }}
          ref={deckRef}
        ></DeckGL>
        {showSpatialControls && (
          <SpatialControls
            mode={mode}
            setMode={setMode}
            features={features}
            setFeatures={setFeatures}
            selectedFeatureIndexes={selectedFeatureIndexes}
            resetBounds={() => setViewState(getBounds())}
            increaseZoom={() =>
              setViewState((v) => ({ ...v, zoom: v.zoom + 1 }))
            }
            decreaseZoom={() =>
              setViewState((v) => ({ ...v, zoom: v.zoom - 1 }))
            }
            setShowCategories={setShowCategories}
            setShowSearch={setShowSearch}
            isFullscreen={isFullscreen}
          />
        )}
        <div className="cherita-spatial-footer">
          <div className="cherita-toolbox-footer">
            {!!error && !isRendering && (
              <Alert variant="danger">
                <Alert.Heading>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  &nbsp;Error loading data
                </Alert.Heading>
                <p className="mb-0">{error.message}</p>
              </Alert>
            )}
            <Toolbox
              mode={
                settings.colorEncoding === COLOR_ENCODINGS.VAR
                  ? settings.selectedVar?.name
                  : settings.colorEncoding === COLOR_ENCODINGS.OBS
                    ? selectedObs?.name
                    : null
              }
              obsLength={parseInt(data.positions?.length)}
              slicedLength={parseInt(slicedLength)}
              setHasObsm={setHasObsm}
            />
          </div>
          {!error && (
            <Legend isCategorical={isCategorical} min={min} max={max} />
          )}
        </div>
      </div>
    </div>
  );
}

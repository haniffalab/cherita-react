import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LinearInterpolator } from '@deck.gl/core';
import { DeckGL } from '@deck.gl/react';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ViewMode } from '@nebula.gl/edit-modes';
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
import _ from 'lodash';
import { Alert } from 'react-bootstrap';

import { ScatterplotLayer } from './ScatterplotLayer';
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
      const grayOut = isPending || (obsIndices && !obsIndices.has(index));

      if (pointInteractionEnabled && index === selectedObsIndex) {
        return [255, 215, 0, 255];
      }

      return (
        getColor({
          value: (data.values[index] - min) / (max - min),
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
      obsIndices,
      pointInteractionEnabled,
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
      const grayOut = obsIndices && !obsIndices.has(index);

      if (pointInteractionEnabled && index === selectedObsIndex) {
        return 100;
      }

      return (grayOut ? 1 : 3) * (pointInteractionEnabled ? 26 : 1);
    },
    [obsIndices, pointInteractionEnabled, selectedObsIndex],
  );

  const memoizedLayers = useMemo(() => {
    const isCategorical =
      settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      selectedObs?.type === OBS_TYPES.CATEGORICAL;
    const numericValues = data.values?.filter(
      (v) => !Number.isNaN(v) && v !== undefined,
    );
    const zMin = numericValues?.length ? _.min(numericValues) : 0;
    const zMax = numericValues?.length ? _.max(numericValues) : 1;
    return [
      new ScatterplotLayer({
        id: 'cherita-layer-scatterplot',
        pickable: true,
        autoHighlight: true,
        highlightColor: pointInteractionEnabled
          ? [255, 215, 0, 255]
          : [0, 0, 0, 0],
        data: data.positions,
        radiusScale: radiusScale,
        radiusMinPixels: 1,
        getPosition: (d) => d,
        getFillColor: getFillColor,
        getRadius: getRadius,
        getSortValue: (_d, { index }) => {
          const v = data.values?.[index];
          // if categorical, only draw undefined at the back
          // draw others normally
          if (isCategorical) {
            if (v !== -1) return 0;
            else return v;
          }
          return Number.isNaN(v) || v === undefined ? zMin : v;
        },
        updateTriggers: {
          getFillColor: getFillColor,
          getRadius: [getRadius, selectedObsIndex],
          getSortValue: [data.values, zMin, zMax],
        },
        transitions: {
          getRadius: 200,
          getFillColor: 200,
        },
        zMin,
        zMax,
        highlightMultiplier: pointInteractionEnabled ? 1.5 : 1.0,
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
    settings.colorEncoding,
    selectedObs?.type,
    data.values,
    data.positions,
    pointInteractionEnabled,
    radiusScale,
    getFillColor,
    getRadius,
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
      const originalIndex = info.index;
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
      text.push(getLabel(selectedObs, data.values?.[index]));
    }

    if (
      settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      settings.selectedVar
    ) {
      text.push(getLabel(settings.selectedVar, data.values?.[index], true));
    }

    if (settings.labelObs.length) {
      text.push(
        ..._.map(labelObsData.data, (v, k) => {
          if (!v) return;
          const labelObs = settings.data.obs[k];
          return getLabel(labelObs, v[index]);
        }),
      );
    }

    if (!text.length) return;

    const grayOut = obsIndices && !obsIndices.has(index);

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
          onHover={({ object }) => {
            const active = pointInteractionEnabled && !!object;
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

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
// eslint-disable-next-line import/no-unresolved
import ScatterplotDataWorker from '../../workers/scatterplotData.js?worker';
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

  const workerRef = useRef(null);
  const [scatterplotAttributes, setScatterplotAttributes] = useState(null);

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

  const { colormap, getColor } = useColor({
    isCategorical,
    colorscale:
      useUnsColors &&
      settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      selectedObs?.colors
        ? { colorscale: selectedObs?.colors }
        : null,
  });

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
    if (data.positions?.length) {
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

  const { min, max } = useMemo(
    () => ({
      min: settings.controls.range[0] * (valueMax - valueMin) + valueMin,
      max: settings.controls.range[1] * (valueMax - valueMin) + valueMin,
    }),
    [settings.controls.range, valueMax, valueMin],
  );

  useEffect(() => {
    workerRef.current = new ScatterplotDataWorker();

    workerRef.current.onmessage = ({ data }) => {
      setScatterplotAttributes((p) => ({ ...p, ...data }));
    };

    workerRef.current.onerror = (e) => {
      console.error('Worker error:', e);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current && data.positions?.length) {
      workerRef.current.postMessage({ positions: data.positions });
    }
  }, [data.positions]);

  useEffect(() => {
    if (workerRef.current && data.values?.length) {
      workerRef.current.postMessage({ values: data.values });
    }
  }, [data.values]);

  useEffect(() => {
    if (
      workerRef.current &&
      data.positions?.length &&
      obsIndices !== undefined
    ) {
      workerRef.current.postMessage({
        obsIndices,
        length: data.positions.length,
      });
    }
  }, [obsIndices, data.positions?.length]);

  const getFillColor = useCallback(
    (_d, { index }) => {
      const grayOut = isPending || (obsIndices && !obsIndices.has(index));

      if (pointInteractionEnabled && index === selectedObsIndex) {
        return [255, 215, 0, 255];
      }

      return (
        getColor({
          value: (data.values[index] - min) / (max - min),
          grayOut: grayOut,
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
    ],
  );

  const memoizedLayers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: 'cherita-layer-scatterplot',
        pickable: true,
        autoHighlight: true,
        highlightColor: pointInteractionEnabled
          ? [255, 215, 0, 255]
          : [0, 0, 0, 0],
        data: {
          length: scatterplotAttributes?.count || 0,
          attributes: {
            getPosition: {
              value: scatterplotAttributes?.positions || new Float32Array(0),
              size: 2,
            },
            getValues: {
              value: scatterplotAttributes?.values || new Float32Array(0),
              size: 1,
            },
            getEnabled: {
              value:
                scatterplotAttributes?.indexEnabledBitmask || new Uint8Array(0),
              size: 1,
            },
          },
        },
        radiusScale: radiusScale,
        radiusMinPixels: 1,
        updateTriggers: {
          colormap: [colormap],
        },
        colormap,
        isCategorical,
        valueMin: min,
        valueMax: max,
        selectedIndex: pointInteractionEnabled ? selectedObsIndex : -1,
        pointInteractionEnabled,
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
    pointInteractionEnabled,
    scatterplotAttributes?.count,
    scatterplotAttributes?.positions,
    scatterplotAttributes?.values,
    scatterplotAttributes?.indexEnabledBitmask,
    radiusScale,
    colormap,
    isCategorical,
    min,
    max,
    selectedObsIndex,
    features,
    mode,
    selectedFeatureIndexes,
  ]);

  const layers = useDeferredValue(
    mode === ViewMode ? [...memoizedLayers].reverse() : memoizedLayers,
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

    if (!info.index) {
      // clicked empty space
      setSelectedFeatureIndexes([]);
      return;
    }

    if (info.layer?.id === 'cherita-layer-draw') {
      // clicked a drawn polygon
      setSelectedFeatureIndexes([info.index]);
    } else if (
      info.layer?.id === 'cherita-layer-scatterplot' &&
      pointInteractionEnabled
    ) {
      // clicked a scatterplot point
      clickedInsideRef.current = true;
      dispatch({ type: 'set.selectedObsIndex', index: info.index });
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
    if (object?.type === 'Feature') return;
    if (index < 0 || index === null) return;
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
          getCursor={({ isDragging, isHovering }) => {
            if (mode !== ViewMode) return 'crosshair';
            if (isDragging) return 'grabbing';
            if (isHovering && pointInteractionEnabled) return 'pointer';
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

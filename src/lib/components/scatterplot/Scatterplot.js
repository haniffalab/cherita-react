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
  radius = 30,
  setShowObs,
  setShowVars,
  isFullscreen = false,
}) {
  const settings = useSettings();
  const { obsIndices, valueMin, valueMax, slicedLength } = useFilteredData();
  const dispatch = useSettingsDispatch();
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
    features: settings.polygons[settings.selectedObsm] || [],
  });
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);

  const { obsmData, xData, obsData } = useZarrData();
  const labelObsData = useLabelObsData();
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
        return { ...v, longitude: longitude, latitude: latitude, zoom: zoom };
      });
    } else if (!obsmData.isPending && obsmData.serverError) {
      setIsRendering(true);
      setData((d) => {
        return { ...d, positions: [] };
      });
    }
  }, [
    settings.selectedObsm,
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
    if (settings.colorEncoding === COLOR_ENCODINGS.VAR) {
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
    settings.colorEncoding,
    xData.data,
    xData.isPending,
    xData.serverError,
    getColor,
  ]);

  useEffect(() => {
    if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
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
      settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      settings.sliceBy.obs
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
    settings.colorEncoding,
    obsData.data,
    obsData.isPending,
    obsData.serverError,
    settings.sliceBy.obs,
  ]);

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
      const grayOut = obsIndices && !obsIndices.has(index);
      return (
        getColor({
          value: (data.values[index] - min) / (max - min),
          categorical: isCategorical,
          grayOut: grayOut,
        }) || [0, 0, 0, 100]
      );
    },
    [data.values, obsIndices, getColor, isCategorical, max, min]
  );

  // @TODO: add support for pseudospatial hover to reflect in radius
  const getRadius = useCallback(
    (_d, { index }) => {
      const grayOut = obsIndices && !obsIndices.has(index);
      return grayOut ? 1 : 3;
    },
    [obsIndices]
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
    data.positions,
    features,
    getFillColor,
    getRadius,
    mode,
    radius,
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
      text.push(getLabel(settings.selectedObs, obsData.data?.[index]));
    }

    if (
      settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      settings.selectedVar
    ) {
      text.push(getLabel(settings.selectedVar, xData.data?.[index], true));
    }

    if (settings.labelObs.length) {
      text.push(
        ..._.map(labelObsData.data, (v, k) => {
          const labelObs = _.find(settings.labelObs, (o) => o.name === k);
          return getLabel(labelObs, v[index]);
        })
      );
    }

    if (!text.length) return;

    const grayOut = obsIndices && !obsIndices.has(index);

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

  const isPending =
    (isRendering || xData.isPending || obsmData.isPending) &&
    !obsmData.isPending;

  const error =
    (settings.selectedObsm && obsmData.serverError?.length) ||
    (settings.colorEncoding === COLOR_ENCODINGS.VAR &&
      xData.serverError?.length) ||
    (settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      obsData.serverError?.length) ||
    (settings.labelObs.lengh && labelObsData.serverError?.length);

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
            {error && !isPending && (
              <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                &nbsp;Error loading data
              </Alert>
            )}
            <Toolbox
              mode={
                settings.colorEncoding === COLOR_ENCODINGS.VAR
                  ? settings.selectedVar.name
                  : settings.colorEncoding === COLOR_ENCODINGS.OBS
                    ? settings.selectedObs.name
                    : null
              }
              obsLength={parseInt(obsmData.data?.length)}
              slicedLength={parseInt(slicedLength)}
            />
          </div>
          <Legend isCategorical={isCategorical} min={min} max={max} />
        </div>
      </div>
    </div>
  );
}

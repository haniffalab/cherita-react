import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode } from "@nebula.gl/edit-modes";
import { booleanPointInPolygon, point } from "@turf/turf";
import { Alert } from "react-bootstrap";
import { Toolbox } from "./Toolbox";
import { SpatialControls } from "./SpatialControls";
import { Legend } from "./Legend";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map-helper";
import {
  GET_OPTIONS,
  useMultipleZarr,
  useZarr,
} from "../../helpers/zarr-helper";
import { useColor } from "../../helpers/color-helper";
import { LoadingLinear, LoadingSpinner } from "../../utils/LoadingIndicators";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";

window.deck.log.level = 1;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 0,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const { getColor } = useColor();
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
  const [xParams, setXParams] = useState({
    url: dataset.url,
    path: "X",
  });
  const [obsParams, setObsParams] = useState({
    url: dataset.url,
    path:
      "obs/" +
      dataset.selectedObs?.name +
      (dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS ? "" : "/codes"),
  });

  const [labelObsParams, setLabelObsParams] = useState([]);

  // needs to be wrapped in useMemo as it is an array an could cause an infinite loop otherwise
  const xSelection = useMemo(
    () => [null, dataset.selectedVar?.matrix_index],
    [dataset.selectedVar]
  );

  const obsmData = useZarr(obsmParams, null, GET_OPTIONS);
  const xData = useZarr(xParams, xSelection, GET_OPTIONS);
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
    setXParams((p) => {
      return {
        ...p,
        s: [null, dataset.selectedVar?.matrix_index],
      };
    });
  }, [dataset.selectedVar]);

  useEffect(() => {
    setObsParams((p) => {
      return {
        ...p,
        path:
          "obs/" +
          dataset.selectedObs?.name +
          (dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS ? "" : "/codes"),
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
            (obs.type === OBS_TYPES.CONTINUOUS ? "" : "/codes"),
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
    setXParams((p) => {
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
      const { latitude, longitude, zoom } = mapHelper.fitBounds(obsmData.data);
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

  const bounds = useMemo(() => {
    const { latitude, longitude, zoom } = new MapHelper().fitBounds(
      data.positions
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
      return dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL;
    } else {
      return false;
    }
  }, [dataset.colorEncoding, dataset.selectedObs?.type]);

  const isInSlice = useCallback(
    (index, values, positions) => {
      let inSlice = true;
      if (dataset.sliceBy.obs && values) {
        inSlice &= !_.includes(dataset.selectedObs?.omit, values[index]);
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
      dataset.selectedObs?.omit,
      dataset.sliceBy.obs,
      dataset.sliceBy.polygons,
      features?.features,
    ]
  );

  const { valueMin, valueMax, slicedLength } = useMemo(() => {
    if (
      dataset.colorEncoding === COLOR_ENCODINGS.VAR &&
      !!dataset.sliceBy.obs
    ) {
      const filtered = _.filter(data.values, (_v, i) => {
        return isInSlice(i, data.sliceValues, data.positions);
      });
      return {
        valueMin: _.min(filtered),
        valueMax: _.max(filtered),
        slicedLength: filtered.length,
      };
    } else if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      const filtered = _.filter(data.values, (_v, i) => {
        return isInSlice(i, data.values, data.positions);
      });
      return {
        valueMin: _.min(data.values),
        valueMax: _.max(data.values),
        slicedLength: filtered.length,
      };
    } else {
      return {
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
    dataset.sliceBy.obs,
    isInSlice,
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
      const grayOut =
        dataset.colorEncoding === COLOR_ENCODINGS.OBS
          ? !isInSlice(index, data.values, data.positions)
          : dataset.colorEncoding === COLOR_ENCODINGS.VAR
          ? !isInSlice(index, data.sliceValues, data.positions)
          : false;
      return getColor(
        (data.values[index] - min) / (max - min),
        isCategorical,
        grayOut
      );
    },
    [
      data.positions,
      data.sliceValues,
      data.values,
      dataset.colorEncoding,
      getColor,
      isCategorical,
      isInSlice,
      max,
      min,
    ]
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
            // when a drawing is complete, the value of editType becomes addFeature
            const { featureIndexes } = editContext; //extracting indexes of current features selected
            updatedSelectedFeatureIndexes = [
              ...selectedFeatureIndexes,
              ...featureIndexes,
            ];
          }
          setSelectedFeatureIndexes(updatedSelectedFeatureIndexes); //now update your state
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

  const layers = useDeferredValue(memoizedLayers);

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

    setSelectedFeatureIndexes(info.object ? [info.index] : []);
  }

  const getTooltip = ({ object, index }) =>
    object &&
    dataset.labelObs.length && {
      text: _.map(labelObsData, (v, k) => {
        const labelObs = _.find(dataset.labelObs, (o) => o.name === k);
        if (labelObs.type === OBS_TYPES.CONTINUOUS) {
          return `${k}: ${parseFloat(v?.[index]).toLocaleString()}`;
        } else {
          return `${k}: ${labelObs.codesMap[v?.[index]]}`;
        }
      }).join("\n"),
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
      ></DeckGL>
      <SpatialControls
        mode={mode}
        setMode={setMode}
        features={features}
        setFeatures={setFeatures}
        resetBounds={() => setViewState(bounds)}
        increaseZoom={() => setViewState((v) => ({ ...v, zoom: v.zoom + 1 }))}
        decreaseZoom={() => setViewState((v) => ({ ...v, zoom: v.zoom - 1 }))}
      />
      {error && !isPending && (
        <div className="cherita-alert">
          <Alert variant="danger">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            Error loading data
          </Alert>
        </div>
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
      <Legend isCategorical={isCategorical} min={min} max={max} />
    </div>
  );
}

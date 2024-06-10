import React, { useEffect, useState, useMemo, useCallback } from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode } from "@nebula.gl/edit-modes";
import { Alert, Dropdown } from "react-bootstrap";

import { Toolbox } from "./Toolbox";
import { SpatialControls } from "./SpatialControls";
import { Legend } from "./Legend";
import { COLORSCALES } from "../../constants/colorscales";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map-helper";
import {
  GET_OPTIONS,
  useMultipleZarr,
  useZarr,
} from "../../helpers/zarr-helper";
import { useColor } from "../../helpers/color-helper";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

window.deck.log.level = 1;

export function ScatterplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colormapList = _.keys(COLORSCALES).map((key) => (
    <Dropdown.Item
      key={key}
      active={dataset.controls.colorScale === key}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: key,
        });
      }}
    >
      {key}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {dataset.controls.colorScale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

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
  const { getColor } = useColor();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = useState(() => ViewMode);
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState([]);
  const [isRendering, setIsRendering] = useState(true);
  const [data, setData] = useState({
    ids: [],
    positions: [],
    values: [],
    sliceValues: [],
  });

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
      (dataset.selectedObs?.type === "continuous" ? "" : "/codes"),
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
          (dataset.selectedObs?.type === "continuous" ? "" : "/codes"),
      };
    });
  }, [dataset.selectedObs]);

  useEffect(() => {
    setLabelObsParams(
      _.map(dataset.labelObs, (obs) => {
        return {
          url: dataset.url,
          path: "obs/" + obs.name + (obs.type === "continuous" ? "" : "/codes"),
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

  useEffect(() => {
    if (dataset.colorEncoding === "var") {
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
    if (dataset.colorEncoding === "obs") {
      if (!obsData.isPending && !obsData.serverError) {
        setData((d) => {
          return { ...d, values: obsData.data };
        });
      } else if (!obsData.isPending && obsData.serverError) {
        setData((d) => {
          return { ...d, values: [] };
        });
      }
    } else if (dataset.colorEncoding === "var" && dataset.sliceByObs) {
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
    dataset.sliceByObs,
  ]);

  const isCategorical = useMemo(() => {
    if (dataset.colorEncoding === "obs") {
      return dataset.selectedObs?.type === "categorical";
    } else {
      return false;
    }
  }, [dataset.colorEncoding, dataset.selectedObs?.type]);

  const { min, max, slicedLength } = useMemo(() => {
    if (dataset.colorEncoding === "var" && !!dataset.sliceByObs) {
      const filtered = _.filter(data.values, (_v, i) => {
        return !_.includes(dataset.selectedObs?.omit, data.sliceValues[i]);
      });
      return {
        min: _.min(filtered),
        max: _.max(filtered),
        slicedLength: filtered.length,
      };
    } else if (dataset.colorEncoding === "obs") {
      const filtered = _.filter(data.values, (_v, i) => {
        return !_.includes(dataset.selectedObs?.omit, data.values[i]);
      });
      return {
        min: _.min(data.values),
        max: _.max(data.values),
        slicedLength: filtered.length,
      };
    } else {
      return {
        min: _.min(data.values),
        max: _.max(data.values),
        slicedLength: data.values.length,
      };
    }
  }, [
    data.sliceValues,
    data.values,
    dataset.colorEncoding,
    dataset.selectedObs?.omit,
    dataset.sliceByObs,
  ]);

  const getFillColor = useCallback(
    (_d, { index }) => {
      const grayOut =
        dataset.colorEncoding === "obs"
          ? _.includes(dataset.selectedObs?.omit, data.values[index])
          : dataset.colorEncoding === "var" && !!dataset.sliceByObs
          ? _.includes(dataset.selectedObs?.omit, data.sliceValues[index])
          : false;
      return getColor(
        (data.values[index] - min) / (max - min),
        isCategorical,
        grayOut
      );
    },
    [
      data.sliceValues,
      data.values,
      dataset.colorEncoding,
      dataset.selectedObs?.omit,
      dataset.sliceByObs,
      getColor,
      isCategorical,
      max,
      min,
    ]
  );

  const layers = useMemo(() => {
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
          setFeatureState({
            data: updatedData,
          });
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
        if (labelObs.type === "continuous") {
          return `${k}: ${parseFloat(v?.[index]).toLocaleString()}`;
        } else {
          return `${k}: ${labelObs.codesMap[v?.[index]]}`;
        }
      }).join("\n"),
    };

  const isPending =
    isRendering || obsmData.isPending || xData.isPending || obsmData.isPending;

  const error =
    (dataset.selectedObsm && obsmData.serverError?.length) ||
    (dataset.colorEncoding === "var" && xData.serverError?.length) ||
    (dataset.colorEncoding === "obs" && obsData.serverError?.length) ||
    (dataset.labelObs.lengh && labelObsData.serverError?.length);

  return (
    <div className="cherita-scatterplot">
      {isPending && <LoadingSpinner />}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e) => setViewState(e.viewState)}
        controller
        layers={layers}
        onClick={onLayerClick}
        getTooltip={getTooltip}
        onAfterRender={() => {
          setIsRendering(false);
        }}
        useDevicePixels={false}
      ></DeckGL>
      <SpatialControls
        mode={mode}
        setMode={setMode}
        features={mode}
        setFeatures={setFeatures}
      />
      {error && (
        <div className="cherita-alert">
          <Alert variant="danger">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            Error loading data
          </Alert>
        </div>
      )}
      <Toolbox
        mode={
          dataset.colorEncoding === "var"
            ? dataset.selectedVar.name
            : dataset.colorEncoding === "obs"
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

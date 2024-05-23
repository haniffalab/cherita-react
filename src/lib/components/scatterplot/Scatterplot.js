import React, { useEffect, useState, useMemo } from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode } from "@nebula.gl/edit-modes";
import Dropdown from "react-bootstrap/Dropdown";

import { Toolbox } from "./Toolbox";
import { SpatialControls } from "./SpatialControls";
import { Legend } from "./Legend";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map-helper";
import { GET_OPTIONS, useZarr } from "../../helpers/zarr-helper";
import { useColor } from "../../helpers/color-helper";
import { LoadingSpinner } from "../../utils/LoadingSpinner";

window.deck.log.level = 1;

export function ScatterplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={dataset.controls.colorScale === item}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: item,
        });
      }}
    >
      {item}
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

const DEFAULT_DATA_POINT = {
  value: null,
  position: null,
  color: null,
};

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const { getScale, getColor } = useColor();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = useState(() => ViewMode);
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  const [featureState, setFeatureState] = useState([]);
  const [scale, setScale] = useState(() => getScale());
  const [data, setData] = useState([]);

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

  // needs to be wrapped in useMemo as it is an array an could cause an infinite loop otherwise
  const xSelection = useMemo(
    () => [null, dataset.selectedVar?.matrix_index],
    [dataset.selectedVar]
  );

  const obsmData = useZarr(obsmParams, null, GET_OPTIONS);
  const xData = useZarr(xParams, xSelection, GET_OPTIONS);
  const obsData = useZarr(obsParams, null, GET_OPTIONS);

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
      setData((d) => {
        return _.map(obsmData.data, (p, index) => {
          return _.defaults({ position: p }, d?.[index], DEFAULT_DATA_POINT);
        });
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
      setData((d) => {
        return _.map(d, (e) => {
          return _.defaults({ position: null }, e, DEFAULT_DATA_POINT);
        });
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
      if (!xData.isPending && !xData.serverError) {
        const s = getScale(xData.data);
        setScale(() => s);
        setData((d) => {
          return _.map(xData.data, (v, index) => {
            return _.defaults(
              {
                value: v,
                color: getColor(s, v),
              },
              d?.[index],
              DEFAULT_DATA_POINT
            );
          });
        });
      } else if (!xData.isPending && xData.serverError) {
        const s = getScale();
        setScale(() => s);
        setData((d) => {
          return _.map(d, (e) => {
            return _.defaults(
              { value: null, color: null },
              e,
              DEFAULT_DATA_POINT
            );
          });
        });
      }
    }
  }, [
    dataset.colorEncoding,
    xData.data,
    xData.isPending,
    xData.serverError,
    getScale,
    getColor,
  ]);

  useEffect(() => {
    if (dataset.colorEncoding === "obs") {
      if (!obsData.isPending && !obsData.serverError) {
        const s = getScale(obsData.data);
        setScale(() => s);
        setData((d) => {
          return _.map(obsData.data, (v, index) => {
            return _.defaults(
              {
                value: v,
                color: getColor(s, v),
              },
              d?.[index],
              DEFAULT_DATA_POINT
            );
          });
        });
      } else if (!obsData.isPending && obsData.serverError) {
        const s = getScale();
        setScale(() => s);
        setData((d) => {
          return _.map(d, (e) => {
            return _.defaults(
              { value: null, color: null },
              e,
              DEFAULT_DATA_POINT
            );
          });
        });
      }
    }
  }, [
    dataset.colorEncoding,
    obsData.data,
    obsData.isPending,
    obsData.serverError,
    getScale,
    getColor,
  ]);

  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "cherita-layer-scatterplot",
        data: data,
        radiusScale: radius,
        radiusMinPixels: 1,
        getPosition: (d) => d.position,
        getFillColor: (d) => d.color,
        getRadius: 1,
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
  }, [data, features, mode, radius, selectedFeatureIndexes]);

  function onLayerClick(info) {
    if (mode !== ViewMode) {
      // don't change selection while editing
      return;
    }

    setSelectedFeatureIndexes(info.object ? [info.index] : []);
  }

  // @TODO: add error message
  return (
    <div className="cherita-scatterplot">
      {(obsmData.isPending || xData.isPending || obsmData.isPending) && (
        <LoadingSpinner />
      )}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(e) => setViewState(e.viewState)}
        controller
        layers={layers}
        onClick={onLayerClick}
      ></DeckGL>
      <SpatialControls
        mode={mode}
        setMode={setMode}
        features={mode}
        setFeatures={setFeatures}
      />
      <Toolbox
        mode={mode}
        setMode={setMode}
        features={mode}
        setFeatures={setFeatures}
      />
      <Legend scale={scale} />
    </div>
  );
}

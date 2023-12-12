import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useCallback, useEffect, useState } from "react";
import _ from "lodash";
import chroma from "chroma-js";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map";
import { ZarrHelper, GET_OPTIONS } from "../../helpers/zarr";
import Button from "react-bootstrap/Button";

import { EditableGeoJsonLayer, DrawPolygonMode } from "@nebula.gl/layers";

import {
  ViewMode,
  DrawPolygonByDraggingMode,
  ModifyMode,
} from "@nebula.gl/edit-modes";

import { Toolbox } from "@nebula.gl/editor";
import { Toolbox2 } from "./Toolbox";

window.deck.log.level = 1;

export function ScatterplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  return <></>;
}

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = useState(() => ViewMode);
  const [modeConfig, setModeConfig] = useState({});
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  let [data, setData] = useState([]);
  let [position, setPosition] = useState([]);
  let [values, setValues] = useState([]);
  let [viewport, setViewport] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 0,
    maxZoom: 16,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    setData(function (prevState, props) {
      var colorScale = chroma
        .scale(["yellow", "008ae5"])
        .domain([_.min(values), _.max(values)]);
      var data = position.map(function (e, i) {
        return {
          index: i,
          position: [position[i][0], position[i][1]],
          value: values[i],
          color: colorScale(values[i]).rgb(),
        };
      });
      return data;
    });
  }, [position, values]);

  useEffect(() => {
    if (dataset.selectedObsm) {
      const helper = new MapHelper();
      const zarrHelper = new ZarrHelper();
      const fetchObsm = async () => {
        const z = await zarrHelper.open(
          dataset.url,
          "obsm/" + dataset.selectedObsm
        );
        await z.get(null, GET_OPTIONS).then((result) => {
          const { latitude, longitude, zoom } = helper.fitBounds(result.data);
          setViewport({
            longitude: latitude,
            latitude: longitude,
            zoom: zoom,
            maxZoom: 16,
            pitch: 0,
            bearing: 0,
          });
          setPosition(result.data);
        });
      };

      fetchObsm().catch(console.error);
    }
  }, [dataset.url, dataset.selectedObsm]);

  useEffect(() => {
    if (dataset.selectedVar) {
      const zarrHelper = new ZarrHelper();
      const fetchData = async () => {
        const z = await zarrHelper.open(dataset.url, "X");
        await z
          .get([null, dataset.selectedVar.matrix_index], GET_OPTIONS)
          .then((result) => {
            setValues(result.data);
          });
      };

      fetchData().catch(console.error);
    }
  }, [dataset.url, dataset.selectedObs, dataset.selectedVar]);

  const layers = [
    new ScatterplotLayer({
      id: "scatter-plot",
      data,
      radiusScale: radius,
      radiusMinPixels: 1,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: 1,
    }),
    new EditableGeoJsonLayer({
      // id: "geojson-layer",
      data: features,
      mode,
      modeConfig,
      selectedFeatureIndexes,

      onEdit: ({ updatedData }) => {
        setFeatures(updatedData);
      },
    }),
  ];

  function onLayerClick(info) {
    if (mode !== ViewMode) {
      // don't change selection while editing
      return;
    }

    setSelectedFeatureIndexes(info.object ? [info.index] : []);
  }

  return (
    <>
      <div className="cherita-scatterplot">
        <DeckGL
          layers={layers}
          initialViewState={viewport}
          controller={true}
          onClick={onLayerClick}
        ></DeckGL>
        {/* <Toolbox
          mode={mode}
          onSetMode={(m) => {
            setModeConfig(null);
            setMode(m);
          }}
          modeConfig={modeConfig}
          onSetModeConfig={setModeConfig}
          geoJson={features}
          onSetGeoJson={setFeatures}
          onImport={setFeatures}
        /> */}
        <Toolbox2
          mode={mode}
          setMode={setMode}
          modeConfig={modeConfig}
          setModeConfig={setModeConfig}
          features={mode}
          setFeatures={setFeatures}
        />
      </div>
    </>
  );
}

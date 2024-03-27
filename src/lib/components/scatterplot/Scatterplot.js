import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";
import chroma from "chroma-js";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode } from "@nebula.gl/edit-modes";
import Dropdown from "react-bootstrap/Dropdown";

import { Toolbox } from "./Toolbox";
import { Legend } from "./Legend";
import {
  PLOTLY_COLORSCALES,
  CHROMA_COLORSCALES,
} from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { MapHelper } from "../../helpers/map-helper";
import { ZarrHelper, GET_OPTIONS } from "../../helpers/zarr-helper";
import { ColorHelper } from "../../helpers/color-helper";

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

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [features, setFeatures] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mode, setMode] = useState(() => ViewMode);
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  let [featureState, setFeatureState] = useState([]);
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
      const colorHelper = new ColorHelper();
      let scale =
        dataset.colorEncoding === "var"
          ? colorHelper.getScale(dataset, values)
          : null;

      var data = position.map(function (e, i) {
        return {
          index: i,
          position: [position[i][0], position[i][1]],
          value: values[i],
          color: colorHelper.getColor(dataset, values[i], scale),
        };
      });
      return data;
    });
  }, [position, values, dataset.controls.colorScale]);

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

            dispatch({
              type: "set.colorEncoding",
              value: "var",
            });
          });
      };

      fetchData().catch(console.error);
    }
  }, [dataset.url, dataset.selectedVar]);

  useEffect(() => {
    if (dataset.selectedObs) {
      const zarrHelper = new ZarrHelper();
      const fetchData = async () => {
        const z = await zarrHelper.open(
          dataset.url,
          "obs/" + dataset.selectedObs.name + "/codes"
        );

        await z.get().then((result) => {
          setValues(result.data);
          dispatch({
            type: "set.colorEncoding",
            value: "obs",
          });
        });
      };

      fetchData().catch(console.error);
    }
  }, [dataset.url, dataset.selectedObs]);

  const layers = [
    new ScatterplotLayer({
      id: "cherita-layer-scatterplot",
      data,
      radiusScale: radius,
      radiusMinPixels: 1,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: 1,
    }),
    new EditableGeoJsonLayer({
      id: "cherita-layer-draw",
      data: features,
      mode,
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
        <Toolbox
          mode={mode}
          setMode={setMode}
          features={mode}
          setFeatures={setFeatures}
        />
        <Legend values={values} />
      </div>
    </>
  );
}

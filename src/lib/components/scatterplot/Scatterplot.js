import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { EMBEDDINGS } from "../../constants/constants";

import chroma from "chroma-js";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { MapHelper } from "../../helpers/map";
import { ZarrHelper, GET_OPTIONS } from "../../helpers/zarr";

window.deck.log.level = 1;

export function ScatterplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [active, setActive] = useState(dataset.embedding);

  useEffect(() => {
    setActive(dataset.embedding);
  }, [dataset.embedding]);

  const colormapList = EMBEDDINGS.map((item) => (
    <Dropdown.Item
      key={item}
      active={active === item}
      onClick={() => {
        setActive(item);
        dispatch({
          type: "embeddingSelected",
          embedding: item,
        });
      }}
    >
      {item}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownEmbedding" variant="light">
        {dataset.embedding}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

export function Scatterplot({ radius = 30 }) {
  const dataset = useDataset();
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
        .domain([Math.min(...values), Math.max(...values)]);
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
    if (dataset.embedding) {
      const helper = new MapHelper();
      const zarrHelper = new ZarrHelper();
      const fetchObsm = async () => {
        const z = await zarrHelper.open(
          dataset.url,
          "obsm/" + dataset.embedding
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
  }, [dataset.url, dataset.embedding]);

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
  ];

  return (
    <>
      <div className="cherita-scatterplot">
        <DeckGL
          layers={layers}
          initialViewState={viewport}
          controller={true}
        ></DeckGL>
      </div>
    </>
  );
}

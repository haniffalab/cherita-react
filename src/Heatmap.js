import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "./DatasetContext";
import { PLOTLY_COLORSCALES } from "./constants";

export function HeatmapControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [active, setActive] = useState(dataset.colorscale);

  useEffect(() => {
    setActive(dataset.colorscale);
  }, [dataset.colorscale]);

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={active === item}
      onClick={() => {
        dispatch({
          type: "colorscaleSelected",
          colorscale: item,
        });
      }}
    >
      {item}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {dataset.colorscale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

export function Heatmap() {
  const dataset = useDataset();
  let [data, setData] = useState([]);
  let [layout, setLayout] = useState({});
  let [hasSelections, setHasSelections] = useState(false);
  let [colorscale, setColorscale] = useState(dataset.colorscale);

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar.length) {
      setHasSelections(true);
      fetch(new URL("heatmap", process.env.REACT_APP_API_URL), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          url: dataset.url,
          selectedObs: dataset.selectedObs,
          selectedMultiVar: dataset.selectedMultiVar,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setData(data.data);
          setLayout(data.layout);
          setColorscale(null);
        });
    } else {
      setHasSelections(false);
    }
  }, [dataset.url, dataset.selectedObs, dataset.selectedMultiVar]);

  useEffect(() => {
    console.log("update colorscale");
    setColorscale(dataset.colorscale);
    setData((d) =>
      d.map((i) => {
        return { ...i, colorscale: dataset.colorscale };
      })
    );
  }, [colorscale, dataset.colorscale]);

  if (hasSelections) {
    return (
      <div className="container text-center">
        <h5>{dataset.url}</h5>
        <HeatmapControls />
        <Plot
          data={data}
          layout={layout}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
  return (
    <div className="h-100">
      <h5>{dataset.url}</h5>
      <p>Select OBS and VAR</p>
    </div>
  );
}

import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "./DatasetContext";
import { PLOTLY_COLORSCALES } from "./constants";

export function HeatmapControls({ config = null, group = "default" }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const colorscale = dataset.colorscale[config?.url || group];
  let [active, setActive] = useState(colorscale);

  useEffect(() => {
    setActive(colorscale);
  }, [colorscale]);

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={active === item}
      onClick={() => {
        dispatch({
          type: "colorscaleSelected",
          key: config?.colorscale || group,
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
        {colorscale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

export function Heatmap({ config = null, group = "default" }) {
  const dataset = useDataset();
  let [data, setData] = useState([]);
  let [layout, setLayout] = useState({});
  let [hasSelections, setHasSelections] = useState(false);
  const configDataset = {
    url: dataset.url[config?.url || group],
    selectedObs: dataset.selectedObs[config?.selectedObs || group],
    selectedMultiVar:
      dataset.selectedMultiVar[config?.selectedMultiVar || group],
    colorscale: dataset.colorscale[config?.colorscale || group],
  };
  let [colorscale, setColorscale] = useState(configDataset.colorscale);

  useEffect(() => {
    if (configDataset.selectedObs && configDataset.selectedMultiVar.length) {
      setHasSelections(true);
      fetch(new URL("heatmap", process.env.REACT_APP_API_URL), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          url: configDataset.url,
          selectedObs: configDataset.selectedObs,
          selectedMultiVar: configDataset.selectedMultiVar,
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
  }, [
    configDataset.url,
    configDataset.selectedObs,
    configDataset.selectedMultiVar,
  ]);

  useEffect(() => {
    setColorscale(configDataset.colorscale);
    setData((d) =>
      d.map((i) => {
        return { ...i, colorscale: configDataset.colorscale };
      })
    );
  }, [colorscale, configDataset.colorscale]);

  if (hasSelections) {
    return (
      <div className="container text-center">
        <h5>{configDataset.url}</h5>
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
      <h5>{configDataset.url}</h5>
      <p>Select OBS and VAR</p>
    </div>
  );
}

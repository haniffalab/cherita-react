import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { fetchData } from "../../utils/requests";

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
  const colorscale = useRef(dataset.colorscale);
  let [data, setData] = useState([]);
  let [layout, setLayout] = useState({});
  let [hasSelections, setHasSelections] = useState(false);

  const updateColorscale = useCallback((colorscale) => {
    setData((d) =>
      d.map((i) => {
        return { ...i, colorscale: colorscale };
      })
    );
  }, []);

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar.length) {
      setHasSelections(true);
      fetchData("heatmap", {
        url: dataset.url,
        selectedObs: dataset.selectedObs.name,
        selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
      })
        .then((data) => {
          setData(data.data);
          setLayout(data.layout);
          updateColorscale(colorscale.current);
        })
        .catch((response) => {
          response.json().then((json) => {
            console.log(json.message);
          });
        });
    } else {
      setHasSelections(false);
    }
  }, [
    dataset.url,
    dataset.selectedObs,
    dataset.selectedMultiVar,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.colorscale;
    updateColorscale(colorscale.current);
  }, [dataset.colorscale, updateColorscale]);

  if (hasSelections) {
    return (
      <div className="cherita-heatmap">
        <Plot
          data={data}
          layout={layout}
          useResizeHandler={true}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
    );
  }
  return (
    <div className="cherita-heatmap">
      <p>Select OBS and VAR</p>
    </div>
  );
}

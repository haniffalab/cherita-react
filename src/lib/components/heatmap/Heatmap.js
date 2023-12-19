import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { useDebouncedFetch } from "../../utils/requests";

export function HeatmapControls() {
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

export function Heatmap() {
  const ENDPOINT = "heatmap";
  const dataset = useDataset();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    selectedObs: dataset.selectedObs,
    selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
  });

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar.length) {
      setHasSelections(true);
    } else {
      setHasSelections(false);
    }
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
        selectedObs: dataset.selectedObs,
        selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
      };
    });
  }, [dataset.selectedMultiVar, dataset.selectedObs, dataset.url]);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500,
    { enabled: !!params.selectedObs && !!params.selectedMultiVar.length }
  );

  useEffect(() => {
    if (hasSelections && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      updateColorscale(colorscale.current);
    }
  }, [fetchedData, hasSelections, isPending, serverError, updateColorscale]);

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

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

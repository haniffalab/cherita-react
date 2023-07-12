import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { PLOTLY_COLORSCALES, MATRIXPLOT_STANDARDSCALES } from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

export function MatrixplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colorScaleList = PLOTLY_COLORSCALES.map((item) => (
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

  const standardScaleList = MATRIXPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={dataset.controls.standardScale === item.name}
      onClick={() => {
        dispatch({
          type: "set.controls.standardScale",
          standardScale: item.value,
        });
      }}
    >
      {item.name}
    </Dropdown.Item>
  ));

  return (
    <ButtonToolbar>
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle id="dropdownColorscale" variant="light">
            {dataset.controls.colorScale}
          </Dropdown.Toggle>
          <Dropdown.Menu>{colorScaleList}</Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroup.Text>Standard scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {dataset.controls.standardScale}
            </Dropdown.Toggle>
            <Dropdown.Menu>{standardScaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

export function Matrixplot() {
  const dataset = useDataset();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar.length) {
      setHasSelections(true);
      fetchData("matrixplot", {
        url: dataset.url,
        selectedObs: dataset.selectedObs.name,
        selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
        standardScale: dataset.controls.standardScale,
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
    dataset.controls.standardScale,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

  if (hasSelections) {
    return (
      <div className="cherita-matrixplot">
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
    <div className="cherita-matrixplot">
      <p>Select OBS and VAR</p>
    </div>
  );
}

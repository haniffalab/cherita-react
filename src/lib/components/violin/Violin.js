import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { VIOLIN_MODES, VIOLINPLOT_STANDARDSCALES } from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

export function ViolinControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [activeStandardScale, setActiveStandardScale] = useState(dataset.controls.standardScale);

  useEffect(() => {
    setActiveStandardScale(dataset.controls.standardScale);
  }, [dataset.controls.standardScale]);

  const standardScaleList = VIOLINPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={activeStandardScale === item.name}
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

export function Violin({ mode = VIOLIN_MODES.MULTIKEY }) {
  const dataset = useDataset();
  const colorscale = useRef(dataset.colorscale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  useEffect(() => {
    if (mode === VIOLIN_MODES.MULTIKEY) {
      if (dataset.selectedMultiVar.length) {
        setHasSelections(true);
        fetchData("violin", {
          url: dataset.url,
          keys: dataset.selectedMultiVar.map((i) => i.name),
          scale: dataset.controls.standardScale,
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
    } else if (mode === VIOLIN_MODES.GROUPBY) {
      if (dataset.selectedObs && dataset.selectedVar) {
        setHasSelections(true);
        fetchData("violin", {
          url: dataset.url,
          keys: dataset.selectedVar.name,
          selectedObs: dataset.selectedObs.name,
          scale: scale,
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
    }
  }, [
    mode,
    dataset.url,
    dataset.selectedObs,
    dataset.selectedVar,
    dataset.selectedMultiVar,
    dataset.controls.standardScale,
  ]);

  if (hasSelections) {
    return (
      <div className="cherita-violin">
        <h5>{mode}</h5>
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
    <div className="cherita-violin">
      <p>Select variables to plot</p>
    </div>
  );
}

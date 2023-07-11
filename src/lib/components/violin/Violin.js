import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset } from "../../context/DatasetContext";
import { VIOLIN_MODES } from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

export function ViolinControls({ setScale }) {
  const [activeScale, setActiveScale] = useState("width");

  const standardScaleOptions = [
    { value: "width", name: "Width" },
    { value: "count", name: "Count" },
  ];

  const standardScaleList = standardScaleOptions.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={activeScale === item.name}
      onClick={() => {
        setActiveScale(item.name);
        setScale(item.value);
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
              {activeScale}
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
  const [scale, setScale] = useState(null);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  useEffect(() => {
    if (mode === VIOLIN_MODES.MULTIKEY) {
      if (dataset.selectedMultiVar.length) {
        setHasSelections(true);
        fetchData("violin", {
          url: dataset.url,
          keys: dataset.selectedMultiVar.map((i) => i.name),
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
    scale,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.colorscale;
    updateColorscale(colorscale.current);
  }, [dataset.colorscale, updateColorscale]);

  if (hasSelections) {
    return (
      <div className="cherita-violin">
        <h5>{mode}</h5>
        <ViolinControls setScale={setScale} />
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

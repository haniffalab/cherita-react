import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

export function MatrixplotControls({ setStandardScale }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [activeColorscale, setActiveColorscale] = useState(dataset.colorscale);
  const [activeStandardScale, setActiveStandardScale] = useState("None");

  const standardScaleOptions = [
    { value: null, name: "None" },
    { value: "group", name: "Group" },
    { value: "var", name: "Var" },
  ];

  useEffect(() => {
    setActiveColorscale(dataset.colorscale);
  }, [dataset.colorscale]);

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={activeColorscale === item}
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

  const standardScaleList = standardScaleOptions.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={activeStandardScale === item.name}
      onClick={() => {
        setActiveStandardScale(item.name);
        setStandardScale(item.value);
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
            {dataset.colorscale}
          </Dropdown.Toggle>
          <Dropdown.Menu>{colormapList}</Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroup.Text>Standard scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {activeStandardScale}
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
  const colorscale = useRef(dataset.colorscale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [standardScale, setStandardScale] = useState(null);

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
      fetchData("matrixplot", {
        url: dataset.url,
        selectedObs: dataset.selectedObs.name,
        selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
        standardScale: standardScale,
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
    standardScale,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.colorscale;
    updateColorscale(colorscale.current);
  }, [dataset.colorscale, updateColorscale]);

  if (hasSelections) {
    return (
      <div className="cherita-matrixplot">
        <MatrixplotControls setStandardScale={setStandardScale} />
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

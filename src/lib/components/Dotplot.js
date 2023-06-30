import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../context/DatasetContext";
import { PLOTLY_COLORSCALES } from "../constants/constants";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Form,
  ToggleButton,
  InputGroup,
} from "react-bootstrap";

export function DotplotControls({
  scaleRange,
  expressionCutoff,
  meanOnlyExpressed,
  dataRange,
  setScaleRange,
  setExpressionCutoff,
  setMeanOnlyExpressed,
  setStandardScale,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [activeColorscale, setActiveColorscale] = useState(dataset.colorscale);
  const [activeStandardScale, setActiveStandardScale] = useState("None");
  const [cutoff, setCutoff] = useState(expressionCutoff);
  const scaleMinRef = useRef(null);
  const scaleMaxRef = useRef(null);

  const standardScaleOptions = [
    { value: null, name: "None" },
    { value: "group", name: "Group" },
    { value: "var", name: "Var" },
  ];

  useEffect(() => {
    setActiveColorscale(dataset.colorscale);
  }, [dataset.colorscale]);

  useEffect(() => {
    scaleMinRef.current.value = scaleRange.min;
    scaleMaxRef.current.value = scaleRange.max;
  }, [scaleRange]);

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
      <ButtonGroup>
        <ToggleButton
          id="toggleMeanOnlyExpressed"
          type="checkbox"
          variant="outline-primary"
          checked={meanOnlyExpressed}
          onChange={() => {
            setMeanOnlyExpressed((c) => !c);
          }}
        >
          Average only above cutoff
        </ToggleButton>
      </ButtonGroup>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setExpressionCutoff(parseFloat(cutoff));
        }}
      >
        <InputGroup>
          <InputGroup.Text>Expression Cutoff</InputGroup.Text>
          <Form.Control
            size="sm"
            type="number"
            step={"0.1"}
            min={0.0}
            value={cutoff}
            onChange={(e) => {
              setCutoff(e.target.value);
            }}
          ></Form.Control>
          <Button type="submit" variant="outline-primary">
            Apply
          </Button>
        </InputGroup>
      </Form>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target),
            formDataObj = Object.fromEntries(formData.entries());
          setScaleRange({
            min: parseFloat(formDataObj.scaleMin),
            max: parseFloat(formDataObj.scaleMax),
          });
        }}
      >
        <InputGroup>
          <InputGroup.Text>Colorscale</InputGroup.Text>
          <InputGroup.Text>min</InputGroup.Text>
          <Form.Control
            ref={scaleMinRef}
            name="scaleMin"
            size="sm"
            type="number"
            step={"0.1"}
            min={0.0}
            max={scaleRange.max}
            defaultValue={scaleRange.min}
          ></Form.Control>
          <InputGroup.Text>max</InputGroup.Text>
          <Form.Control
            ref={scaleMaxRef}
            name="scaleMax"
            size="sm"
            type="number"
            step={"0.1"}
            min={scaleRange.min}
            max={dataRange.max}
            defaultValue={scaleRange.max}
            onChange={(e) => {
              if (parseFloat(e.target.value) > dataRange.max) {
                e.target.value = dataRange.max.toFixed(1);
              }
            }}
          ></Form.Control>
          <Button type="submit" variant="outline-primary">
            Apply
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              const scale = { min: 0.0, max: dataRange.max.toFixed(1) };
              setScaleRange(scale);
            }}
          >
            Autoscale
          </Button>
        </InputGroup>
      </Form>
    </ButtonToolbar>
  );
}

export function Dotplot() {
  const dataset = useDataset();
  const colorscale = useRef(dataset.colorscale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [expressionCutoff, setExpressionCutoff] = useState(0.0);
  const [meanOnlyExpressed, setMeanOnlyExpressed] = useState(false);
  const [standardScale, setStandardScale] = useState(null);
  const [dataRange, setDataRange] = useState({ min: 0.0, max: 0.0 });
  const [scaleRange, setScaleRange] = useState({ min: null, max: null });

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
      fetch(new URL("dotplot", import.meta.env.VITE_API_URL), {
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
          expressionCutoff: expressionCutoff,
          meanOnlyExpressed: meanOnlyExpressed,
          standardScale: standardScale,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setData(data.data);
          setLayout(data.layout);
          setDataRange(data.range);
          setScaleRange((s) => {
            return {
              min: 0.0,
              max: data.range.max.toFixed(1),
            };
          });
          updateColorscale(colorscale.current);
        });
    } else {
      setHasSelections(false);
    }
  }, [
    dataset.url,
    dataset.selectedObs,
    dataset.selectedMultiVar,
    expressionCutoff,
    meanOnlyExpressed,
    standardScale,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.colorscale;
    updateColorscale(colorscale.current);
  }, [dataset.colorscale, updateColorscale]);

  useEffect(() => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: {
          ...l.coloraxis,
          cmin: scaleRange.min,
          cmax: scaleRange.max,
        },
      };
    });
  }, [scaleRange]);

  if (hasSelections) {
    return (
      <div className="container text-center">
        <h5>{dataset.url}</h5>
        <DotplotControls
          scaleRange={scaleRange}
          expressionCutoff={expressionCutoff}
          meanOnlyExpressed={meanOnlyExpressed}
          dataRange={dataRange}
          setScaleRange={setScaleRange}
          setExpressionCutoff={setExpressionCutoff}
          setMeanOnlyExpressed={setMeanOnlyExpressed}
          setStandardScale={setStandardScale}
        />
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
    <div className="h-100">
      <h5>{dataset.url}</h5>
      <p>Select OBS and VAR</p>
    </div>
  );
}

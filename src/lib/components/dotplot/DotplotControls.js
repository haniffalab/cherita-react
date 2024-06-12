import "bootstrap/dist/css/bootstrap.min.css";
import _ from "lodash";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { DOTPLOT_STANDARDSCALES } from "../../constants/constants";
import { COLORSCALES } from "../../constants/colorscales";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Form,
  ToggleButton,
  InputGroup,
} from "react-bootstrap";

export function DotplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [controls, setControls] = useState({
    standardScale: dataset.controls.standardScale,
    expressionCutoff: dataset.controls.expressionCutoff,
    colorAxis: {
      cmin: dataset.controls.colorAxis.cmin,
      cmax: dataset.controls.colorAxis.cmax,
    },
  });

  useEffect(() => {
    setControls((c) => ({
      ...c,
      colorAxis: {
        cmin: dataset.controls.colorAxis.cmin,
        cmax: dataset.controls.colorAxis.cmax,
      },
    }));
  }, [dataset.controls.colorAxis.cmin, dataset.controls.colorAxis.cmax]);

  const colorScaleList = _.keys(COLORSCALES).map((key) => (
    <Dropdown.Item
      key={key}
      active={dataset.controls.colorScale === key}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: key,
        });
      }}
    >
      {key}
    </Dropdown.Item>
  ));

  const standardScaleList = DOTPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={dataset.controls.standardScale === item.value}
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
      <ButtonGroup>
        <ToggleButton
          id="toggleMeanOnlyExpressed"
          type="checkbox"
          variant="outline-primary"
          checked={dataset.controls.meanOnlyExpressed}
          onChange={() => {
            dispatch({
              type: "set.controls.meanOnlyExpressed",
              meanOnlyExpressed: !dataset.controls.meanOnlyExpressed,
            });
          }}
        >
          Average only above cutoff
        </ToggleButton>
      </ButtonGroup>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({
            type: "set.controls.expressionCutoff",
            expressionCutoff: parseFloat(controls.expressionCutoff),
          });
        }}
      >
        <InputGroup>
          <InputGroup.Text>Expression Cutoff</InputGroup.Text>
          <Form.Control
            size="sm"
            type="number"
            step={"0.1"}
            min={0.0}
            value={controls.expressionCutoff}
            onChange={(e) => {
              setControls({ ...controls, expressionCutoff: e.target.value });
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
          dispatch({
            type: "set.controls.colorAxis.crange",
            cmin: controls.colorAxis.cmin,
            cmax: controls.colorAxis.cmax,
          });
        }}
      >
        <InputGroup>
          <InputGroup.Text>Colorscale</InputGroup.Text>
          <InputGroup.Text>min</InputGroup.Text>
          <Form.Control
            name="scaleMin"
            size="sm"
            type="number"
            value={controls.colorAxis.cmin}
            step={0.1}
            min={Math.min(dataset.controls.colorAxis.dmin, 0.0)}
            max={dataset.controls.colorAxis.dmax}
            onChange={(e) => {
              setControls({
                ...controls,
                colorAxis: { ...controls.colorAxis, cmin: e.target.value },
              });
            }}
          ></Form.Control>
          <InputGroup.Text>max</InputGroup.Text>
          <Form.Control
            name="scaleMax"
            size="sm"
            type="number"
            value={controls.colorAxis.cmax}
            step={0.1}
            min={controls.colorAxis.cmin}
            max={dataset.controls.colorAxis.dmax}
            onChange={(e) => {
              if (
                parseFloat(e.target.value) > dataset.controls.colorAxis.dmax
              ) {
                e.target.value = dataset.controls.colorAxis.dmax.toFixed(1);
              }
              setControls({
                ...controls,
                colorAxis: { ...controls.colorAxis, cmax: e.target.value },
              });
            }}
          ></Form.Control>
          <Button type="submit" variant="outline-primary">
            Apply
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              dispatch({
                type: "set.controls.colorAxis.crange",
                cmin: dataset.controls.colorAxis.dmin,
                cmax: dataset.controls.colorAxis.dmax,
              });
            }}
          >
            Autoscale
          </Button>
        </InputGroup>
      </Form>
    </ButtonToolbar>
  );
}

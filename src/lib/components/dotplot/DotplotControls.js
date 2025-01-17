import React, { useEffect, useState } from "react";

import _ from "lodash";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Form,
  ToggleButton,
  InputGroup,
} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import { COLORSCALES } from "../../constants/colorscales";
import { DOTPLOT_SCALES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function DotplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [controls, setControls] = useState({
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
      expressionCutoff: dataset.controls.expressionCutoff,
    }));
  }, [
    dataset.controls.colorAxis.cmin,
    dataset.controls.colorAxis.cmax,
    dataset.controls.expressionCutoff,
  ]);

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

  const standardScaleList = _.values(DOTPLOT_SCALES).map((scale) => (
    <Dropdown.Item
      key={scale.value}
      active={dataset.controls.scale.dotplot === scale}
      onClick={() => {
        dispatch({
          type: "set.controls.scale",
          plot: "dotplot",
          scale: scale,
        });
      }}
    >
      {scale.name}
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
              {dataset.controls.scale.dotplot.name}
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

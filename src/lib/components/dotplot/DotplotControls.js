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
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function DotplotControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [controls, setControls] = useState({
    expressionCutoff: settings.controls.expressionCutoff,
    colorAxis: {
      cmin: settings.controls.colorAxis.cmin,
      cmax: settings.controls.colorAxis.cmax,
    },
  });

  useEffect(() => {
    setControls((c) => ({
      ...c,
      colorAxis: {
        cmin: settings.controls.colorAxis.cmin,
        cmax: settings.controls.colorAxis.cmax,
      },
      expressionCutoff: settings.controls.expressionCutoff,
    }));
  }, [
    settings.controls.colorAxis.cmin,
    settings.controls.colorAxis.cmax,
    settings.controls.expressionCutoff,
  ]);

  const colorScaleList = _.keys(COLORSCALES).map((key) => (
    <Dropdown.Item
      key={key}
      active={settings.controls.colorScale === key}
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
      active={settings.controls.scale.dotplot === scale}
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
            {settings.controls.colorScale}
          </Dropdown.Toggle>
          <Dropdown.Menu>{colorScaleList}</Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroup.Text>Standard scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {settings.controls.scale.dotplot.name}
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
          checked={settings.controls.meanOnlyExpressed}
          onChange={() => {
            dispatch({
              type: "set.controls.meanOnlyExpressed",
              meanOnlyExpressed: !settings.controls.meanOnlyExpressed,
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
            min={Math.min(settings.controls.colorAxis.dmin, 0.0)}
            max={settings.controls.colorAxis.dmax}
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
            max={settings.controls.colorAxis.dmax}
            onChange={(e) => {
              if (
                parseFloat(e.target.value) > settings.controls.colorAxis.dmax
              ) {
                e.target.value = settings.controls.colorAxis.dmax.toFixed(1);
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
                cmin: settings.controls.colorAxis.dmin,
                cmax: settings.controls.colorAxis.dmax,
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

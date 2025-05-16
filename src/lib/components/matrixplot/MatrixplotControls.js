import React from "react";

import _ from "lodash";
import {
  Dropdown,
  ButtonGroup,
  ButtonToolbar,
  InputGroup,
} from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import { MATRIXPLOT_SCALES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function MatrixplotControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

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

  const standardScaleList = _.values(MATRIXPLOT_SCALES).map((scale) => (
    <Dropdown.Item
      key={scale.value}
      active={settings.controls.scale.matrixplot.name === scale.name}
      onClick={() => {
        dispatch({
          type: "set.controls.scale",
          plot: "matrixplot",
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
              {settings.controls.scale.matrixplot.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>{standardScaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

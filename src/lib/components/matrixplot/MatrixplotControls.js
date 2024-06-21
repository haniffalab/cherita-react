import React from "react";

import _ from "lodash";
import {
  Dropdown,
  ButtonGroup,
  ButtonToolbar,
  InputGroup,
} from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import { MATRIXPLOT_STANDARDSCALES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function MatrixplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

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

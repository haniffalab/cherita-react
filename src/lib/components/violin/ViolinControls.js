import React from "react";

import _ from "lodash";
import {
  Dropdown,
  ButtonGroup,
  ButtonToolbar,
  InputGroup,
} from "react-bootstrap";

import { VIOLINPLOT_SCALES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function ViolinControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const scaleList = _.values(VIOLINPLOT_SCALES).map((scale) => (
    <Dropdown.Item
      key={scale.value}
      active={dataset.controls.scale.violinplot === scale}
      onClick={() => {
        dispatch({
          type: "set.controls.scale",
          plot: "violinplot",
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
        <InputGroup>
          <InputGroup.Text>Scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {dataset.controls.scale.violinplot.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>{scaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

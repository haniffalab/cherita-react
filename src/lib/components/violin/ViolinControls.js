import React from "react";

import _ from "lodash";
import {
  Dropdown,
  ButtonGroup,
  ButtonToolbar,
  InputGroup,
} from "react-bootstrap";

import { VIOLINPLOT_SCALES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function ViolinControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  const scaleList = _.values(VIOLINPLOT_SCALES).map((scale) => (
    <Dropdown.Item
      key={scale.value}
      active={settings.controls.scale.violinplot === scale}
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
              {settings.controls.scale.violinplot.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>{scaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

import React from "react";

import _ from "lodash";
import { Dropdown } from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function HeatmapControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  const colormapList = _.keys(COLORSCALES).map((key) => (
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

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {settings.controls.colorScale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

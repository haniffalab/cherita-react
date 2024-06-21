import React from "react";

import _ from "lodash";
import { Dropdown } from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function HeatmapControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colormapList = _.keys(COLORSCALES).map((key) => (
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

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {dataset.controls.colorScale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

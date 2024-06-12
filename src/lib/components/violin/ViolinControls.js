import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { VIOLINPLOT_STANDARDSCALES } from "../../constants/constants";
import {
  Dropdown,
  ButtonGroup,
  ButtonToolbar,
  InputGroup,
} from "react-bootstrap";

export function ViolinControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [activeStandardScale, setActiveStandardScale] = useState(
    dataset.controls.standardScale
  );

  useEffect(() => {
    if (dataset.controls.standardScale) {
      setActiveStandardScale(
        VIOLINPLOT_STANDARDSCALES.find(
          (obs) => obs.value === dataset.controls.standardScale
        ).name
      );
    }
  }, [dataset.controls.standardScale]);

  const standardScaleList = VIOLINPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={activeStandardScale === item.value}
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
    </ButtonToolbar>
  );
}

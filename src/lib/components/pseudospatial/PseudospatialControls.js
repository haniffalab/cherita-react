import React from "react";

import _ from "lodash";
import { ButtonGroup, Dropdown } from "react-bootstrap";

import {
  PSEUDOSPATIAL_CATEGORICAL_MODES as MODES,
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
} from "../../constants/constants";

function CategoricalMode({ mode, setMode }) {
  const modeList = _.map(MODES, (value, key) => (
    <Dropdown.Item
      key={key}
      active={mode === value}
      onClick={() => {
        setMode(value);
      }}
    >
      {_.capitalize(value.name)}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light">
        Mode: {_.capitalize(mode.name)}
      </Dropdown.Toggle>
      <Dropdown.Menu>{modeList}</Dropdown.Menu>
    </Dropdown>
  );
}

// @TODO: add mask set selection, mask selection, colormap, colorbar slider
export function PseudospatialControls({ plotType, mode, setMode }) {
  return (
    <>
      <ButtonGroup>
        {plotType === PLOT_TYPES.CATEGORICAL && (
          <CategoricalMode mode={mode} setMode={setMode} />
        )}
      </ButtonGroup>
    </>
  );
}

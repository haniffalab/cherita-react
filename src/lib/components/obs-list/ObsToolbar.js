import React from "react";

import { faDroplet, faEye, faFont } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Form, ButtonGroup, Button } from "react-bootstrap";

import { COLOR_ENCODINGS } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";

export function ObsToolbar({
  item,
  showToggleAllObs = true,
  showLabel = true,
  showSlice = true,
  showColor = true,
  onToggleAllObs,
  onToggleLabel,
  onToggleSlice,
  onToggleColor,
}) {
  const dataset = useDataset();

  const allToggledOn = !item.omit.length;
  const inLabelObs = _.some(dataset.labelObs, (i) => i.name === item.name);
  const inSliceObs =
    dataset.sliceBy.obs && dataset.selectedObs?.name === item.name;
  const isColorEncoding =
    dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
    dataset.selectedObs?.name === item.name;

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        {showToggleAllObs && (
          <Form.Check // prettier-ignore
            type="switch"
            id="custom-switch"
            label="Toggle all"
            checked={allToggledOn}
            onChange={onToggleAllObs}
          />
        )}
      </div>
      <div>
        <ButtonGroup>
          {showLabel && (
            <Button
              variant={inLabelObs ? "primary" : "outline-primary"}
              size="sm"
              onClick={onToggleLabel}
              title="Add to tooltip"
            >
              <FontAwesomeIcon icon={faFont} />
            </Button>
          )}
          {showSlice && (
            <Button
              variant={inSliceObs ? "primary" : "outline-primary"}
              size="sm"
              onClick={onToggleSlice}
              title="Slice to selected"
            >
              <FontAwesomeIcon icon={faEye} />
            </Button>
          )}
          {showColor && (
            <Button
              variant={isColorEncoding ? "primary" : "outline-primary"}
              size="sm"
              onClick={onToggleColor}
              title="Set as color encoding"
            >
              <FontAwesomeIcon icon={faDroplet} />
            </Button>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}

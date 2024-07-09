import React from "react";

import { faDroplet, faEye, faFont } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, ButtonGroup, Button } from "react-bootstrap";

import { COLOR_ENCODINGS } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";

export function ObsToolbar({
  item,
  showToggleAllObs,
  showLabel,
  showSlice,
  showColor,
  onToggleAllObs,
  onToggleLabel,
  onToggleSlice,
  onToggleColor,
  inLabelObs,
}) {
  const dataset = useDataset();

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        {showToggleAllObs && (
          <Form.Check // prettier-ignore
            type="switch"
            id="custom-switch"
            label="Toggle all"
            checked={!item.omit.length}
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
              variant={
                dataset.sliceBy.obs && dataset.selectedObs?.name === item.name
                  ? "primary"
                  : "outline-primary"
              }
              size="sm"
              onClick={onToggleSlice}
              title="Slice to selected"
            >
              <FontAwesomeIcon icon={faEye} />
            </Button>
          )}
          {showColor && (
            <Button
              variant={
                dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
                dataset.selectedObs?.name === item.name
                  ? "primary"
                  : "outline-primary"
              }
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

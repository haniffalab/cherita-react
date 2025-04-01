import React from "react";

import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap";

import { formatNumerical } from "../../utils/string";
import { ObsmKeysList } from "../obsm-list/ObsmList";

export function Toolbox({ mode, obsLength, slicedLength }) {
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <ObsmKeysList />
        {mode && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip-dropped-mode">
                The color scale is currently set to {mode}
              </Tooltip>
            }
          >
            <Button
              size="sm"
              variant="primary"
              style={{ cursor: "default" }}
              aria-disabled="true"
            >
              <FontAwesomeIcon icon={faDroplet} className="me-1" /> {mode}
            </Button>
          </OverlayTrigger>
        )}

        {(mode || !isNaN(obsLength)) &&
          (mode !== null &&
          !isNaN(slicedLength) &&
          slicedLength !== obsLength ? (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You have selected {formatNumerical(slicedLength)} out of{" "}
                  {formatNumerical(obsLength)} cells
                </Tooltip>
              }
            >
              <Button
                size="sm"
                variant="primary"
                style={{ cursor: "default" }}
                aria-disabled="true"
              >
                {formatNumerical(slicedLength)} of {formatNumerical(obsLength)}{" "}
                cells
              </Button>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You are viewing {formatNumerical(obsLength)} cells
                </Tooltip>
              }
            >
              <Button
                size="sm"
                variant="primary"
                style={{ cursor: "default" }}
                aria-disabled="true"
              >
                {formatNumerical(obsLength)} cells
              </Button>
            </OverlayTrigger>
          ))}
      </ButtonGroup>
    </div>
  );
}

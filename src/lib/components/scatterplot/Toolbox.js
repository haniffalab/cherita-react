import { React } from "react";

import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { prettyNumerical } from "../../utils/string";
import { ObsmKeysList } from "../obsm-list/ObsmList";

export function Toolbox({ mode, obsLength, slicedLength }) {
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <ObsmKeysList />
        <Button size="sm">
          <FontAwesomeIcon icon={faDroplet} /> {mode}
        </Button>
        {(mode || !Number.isNaN(obsLength)) &&
          (mode !== null &&
          !Number.isNaN(slicedLength) &&
          slicedLength !== obsLength ? (
            <Button size="sm">
              {prettyNumerical(slicedLength)} out of{" "}
              {prettyNumerical(obsLength)} cells
            </Button>
          ) : (
            <Button size="sm">{prettyNumerical(obsLength)} cells</Button>
          ))}
      </ButtonGroup>
    </div>
  );
}

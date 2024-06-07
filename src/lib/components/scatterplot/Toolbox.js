import "bootstrap/dist/css/bootstrap.min.css";
import { React } from "react";

import { ObsmKeysList } from "@haniffalab/cherita-react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";

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
              {slicedLength.toLocaleString()} out of{" "}
              {obsLength.toLocaleString()} cells
            </Button>
          ) : (
            <Button size="sm">{obsLength.toLocaleString()} cells</Button>
          ))}
      </ButtonGroup>
    </div>
  );
}

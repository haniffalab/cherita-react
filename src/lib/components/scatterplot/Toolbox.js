import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

import {
  DrawPolygonMode,
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawRectangleMode,
  ViewMode,
  ModifyMode,
} from "@nebula.gl/edit-modes";

import {
  ObsColsList,
  ObsmKeysList,
  VarNamesList,
  SELECTION_MODES,
} from "@haniffalab/cherita-react";

import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";

export function Toolbox({ mode, setMode, features, setFeatures }) {
  const dataset = useDataset();
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <ObsmKeysList />
        <Button size="sm">
          <FontAwesomeIcon icon={faDroplet} /> CD14
        </Button>
        <Button size="sm">Cells XXXX</Button>
      </ButtonGroup>
    </div>
  );
}

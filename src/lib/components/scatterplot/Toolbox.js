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

export function Toolbox({ mode, setMode, features, setFeatures }) {
  const dataset = useDataset();
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <ObsmKeysList />
        <Button>Cells XXXX</Button>
      </ButtonGroup>
    </div>
  );
}

import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React } from "react";

import {
  DrawPolygonMode,
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawRectangleMode,
  ViewMode,
  ModifyMode,
} from "@nebula.gl/edit-modes";

import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";

export function Toolbox({ mode, setMode, features, setFeatures }) {
  const onSelect = (eventKey, event) => {
    console.log(eventKey); // selected event will trigger
    switch (eventKey) {
      case "DrawPolygonMode":
        setMode(() => DrawPolygonMode);
        break;
      case "DrawLineStringMode":
        setMode(() => DrawLineStringMode);
        break;
      case "DrawPolygonByDraggingMode":
        setMode(() => DrawPolygonByDraggingMode);
        break;
      case "DrawRectangleMode":
        setMode(() => DrawRectangleMode);
        break;
      case "ModifyMode":
        setMode(() => ModifyMode);
        break;
      default:
        setMode(() => ViewMode);
    }
  };

  const deleteFeatures = (eventKey, event) => {
    console.log(eventKey); // selected event will trigger
    setFeatures({
      type: "FeatureCollection",
      features: [],
    });
  };

  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <DropdownButton
          as={ButtonGroup}
          title={
            <>
              <FontAwesomeIcon icon={faArrowPointer} /> Mode
            </>
          }
          id="bg-nested-dropdown"
          onSelect={onSelect}
        >
          <Dropdown.Item eventKey="DrawPolygonMode">
            DrawPolygonMode
          </Dropdown.Item>
          <Dropdown.Item eventKey="DrawLineStringMode">
            DrawLineStringMode
          </Dropdown.Item>
          <Dropdown.Item eventKey="DrawPolygonByDraggingMode">
            DrawPolygonByDraggingMode
          </Dropdown.Item>
          <Dropdown.Item eventKey="DrawRectangleMode">
            DrawRectangleMode
          </Dropdown.Item>
          <Dropdown.Item eventKey="ModifyMode">ModifyMode</Dropdown.Item>
          <Dropdown.Item eventKey="ViewMode">ViewMode</Dropdown.Item>
        </DropdownButton>
        <Button variant="primary" onClick={deleteFeatures}>
          Delete
        </Button>
      </ButtonGroup>
    </div>
  );
}

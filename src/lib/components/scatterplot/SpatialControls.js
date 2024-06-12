import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import {
  DrawPolygonMode,
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawRectangleMode,
  ViewMode,
  ModifyMode,
} from "@nebula.gl/edit-modes";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faCrosshairs,
  faHand,
  faDrawPolygon,
  faTrash,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";

import {
  ScatterplotControls,
  OffcanvasControls,
} from "@haniffalab/cherita-react";

export function SpatialControls({
  mode,
  setMode,
  features,
  setFeatures,
  resetBounds,
  increaseZoom,
  decreaseZoom,
}) {
  const [showControls, setShowControls] = useState(false);

  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);

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
    <div className="cherita-spatial-controls">
      <ButtonGroup vertical>
        <Button onClick={increaseZoom} title="Increase zoom">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button onClick={decreaseZoom} title="Decrease zoom">
          <FontAwesomeIcon icon={faMinus} />
        </Button>
        <Button onClick={resetBounds} title="Reset zoom and center">
          <FontAwesomeIcon icon={faCrosshairs} />
        </Button>
        <Button title="Set dragging mode">
          <FontAwesomeIcon icon={faHand} />
        </Button>
        <DropdownButton
          as={ButtonGroup}
          title={
            <>
              <FontAwesomeIcon icon={faDrawPolygon} />
            </>
          }
          drop="end"
          id="bg-vertical-dropdown-1"
          className="caret-off"
          onSelect={onSelect}
        >
          <Dropdown.Header>Selection tools</Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item eventKey="DrawPolygonMode">
            Draw a polygon
          </Dropdown.Item>
          <Dropdown.Item eventKey="DrawPolygonByDraggingMode">
            Draw a Polygon by Dragging
          </Dropdown.Item>
          <Dropdown.Item eventKey="ModifyMode">Modify polygons</Dropdown.Item>
          <Dropdown.Item eventKey="ViewMode">ViewMode</Dropdown.Item>
          <Dropdown.Item onClick={deleteFeatures}>
            <FontAwesomeIcon icon={faTrash} /> Delete Plydons
          </Dropdown.Item>
        </DropdownButton>
        <Button onClick={handleShowControls}>
          <FontAwesomeIcon icon={faSliders} />
        </Button>
      </ButtonGroup>
      <OffcanvasControls
        show={showControls}
        handleClose={handleCloseControls}
        Controls={ScatterplotControls}
      />
    </div>
  );
}

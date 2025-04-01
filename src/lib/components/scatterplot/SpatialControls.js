import React, { useState } from "react";

import {
  faCrosshairs,
  faDrawPolygon,
  faHand,
  faMinus,
  faPen,
  faPlus,
  faSliders,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JoinInner } from "@mui/icons-material";
import {
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawPolygonMode,
  DrawRectangleMode,
  ModifyMode,
  ViewMode,
} from "@nebula.gl/edit-modes";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";

import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { OffcanvasControls } from "../offcanvas";
import { ScatterplotControls } from "./ScatterplotControls";

export function SpatialControls({
  mode,
  setMode,
  features,
  setFeatures,
  selectedFeatureIndexes,
  resetBounds,
  increaseZoom,
  decreaseZoom,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [showControls, setShowControls] = useState(false);

  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);

  const onSelect = (eventKey, event) => {
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

  const deleteFeatures = (_eventKey, _event) => {
    setFeatures({
      type: "FeatureCollection",
      features: [],
    });
  };

  const polygonControls = (
    <>
      <Button
        active={dataset.sliceBy.polygons}
        title="Filter data with polygons"
        onClick={() => {
          setMode(() => ViewMode);
          dispatch({
            type: "toggle.slice.polygons",
          });
        }}
      >
        <JoinInner />
      </Button>
      <Button
        title="Delete selected polygons"
        onClick={() => {
          const newFeatures = features.features.filter(
            (_f, i) => !selectedFeatureIndexes.includes(i)
          );
          setFeatures({
            type: "FeatureCollection",
            features: newFeatures,
          });
        }}
        disabled={!selectedFeatureIndexes.length}
      >
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </>
  );

  return (
    <div className="cherita-spatial-controls">
      <ButtonGroup vertical className="w-100 mb-1">
        <Button onClick={increaseZoom} title="Increase zoom">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button onClick={decreaseZoom} title="Decrease zoom">
          <FontAwesomeIcon icon={faMinus} />
        </Button>
        <Button onClick={resetBounds} title="Reset zoom and center">
          <FontAwesomeIcon icon={faCrosshairs} />
        </Button>
        <Button onClick={handleShowControls}>
          <FontAwesomeIcon icon={faSliders} />
        </Button>
      </ButtonGroup>
      <ButtonGroup vertical className="w-100">
        <Button
          onClick={() => setMode(() => ViewMode)}
          title="Set dragging mode"
          active={mode === ViewMode}
        >
          <FontAwesomeIcon icon={faHand} />
        </Button>
        <Dropdown
          as={ButtonGroup}
          className="caret-off"
          drop="end"
          onSelect={onSelect}
        >
          <Dropdown.Toggle
            id="dropdown-autoclose-outside"
            className={`caret-off ${mode === DrawPolygonByDraggingMode || mode === ModifyMode ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={faDrawPolygon} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>Polygon tools</Dropdown.Header>
            <Dropdown.Item eventKey="DrawPolygonByDraggingMode">
              <FontAwesomeIcon icon={faDrawPolygon} className="nav-icon" />
              Draw a polygon
            </Dropdown.Item>
            <Dropdown.Item eventKey="ModifyMode">
              <FontAwesomeIcon icon={faPen} className="nav-icon" />
              Modify polygons
            </Dropdown.Item>
            <Dropdown.Item onClick={deleteFeatures}>
              <FontAwesomeIcon icon={faTrash} className="nav-icon" />
              Delete polygons
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {!!features?.features?.length && polygonControls}
      </ButtonGroup>
      <OffcanvasControls
        show={showControls}
        handleClose={handleCloseControls}
        Controls={ScatterplotControls}
      />
    </div>
  );
}

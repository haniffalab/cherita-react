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
import { JoinInner } from "@mui/icons-material";

import {
  ScatterplotControls,
  OffcanvasControls,
} from "@haniffalab/cherita-react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

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
    <div className="mt-2">
      <ButtonGroup vertical className="w-100">
        <Button
          variant={dataset.sliceBy.polygons ? "primary" : "outline-primary"}
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
          variant="outline-primary"
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
      </ButtonGroup>
    </div>
  );

  return (
    <div className="cherita-spatial-controls">
      <ButtonGroup vertical className="w-100">
        <Button onClick={increaseZoom} title="Increase zoom">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button onClick={decreaseZoom} title="Decrease zoom">
          <FontAwesomeIcon icon={faMinus} />
        </Button>
        <Button onClick={resetBounds} title="Reset zoom and center">
          <FontAwesomeIcon icon={faCrosshairs} />
        </Button>
        <Button
          onClick={() => setMode(() => ViewMode)}
          title="Set dragging mode"
          variant={mode === ViewMode ? "primary" : "outline-primary"}
        >
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
          <Dropdown.Item eventKey="DrawPolygonMode">
            Draw a polygon
          </Dropdown.Item>
          <Dropdown.Item eventKey="DrawPolygonByDraggingMode">
            Draw a Polygon by Dragging
          </Dropdown.Item>
          <Dropdown.Item eventKey="ModifyMode">Modify polygons</Dropdown.Item>
          <Dropdown.Item eventKey="ViewMode">Viewing mode</Dropdown.Item>
          <Dropdown.Item onClick={deleteFeatures}>
            <FontAwesomeIcon icon={faTrash} /> Delete polygons
          </Dropdown.Item>
        </DropdownButton>
        <Button onClick={handleShowControls}>
          <FontAwesomeIcon icon={faSliders} />
        </Button>
      </ButtonGroup>
      {!!features?.features?.length && polygonControls}
      <OffcanvasControls
        show={showControls}
        handleClose={handleCloseControls}
        Controls={ScatterplotControls}
      />
    </div>
  );
}

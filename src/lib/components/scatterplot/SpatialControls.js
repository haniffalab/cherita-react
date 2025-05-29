import React, { useState } from "react";

import {
  faCrosshairs,
  faDrawPolygon,
  faHand,
  faList,
  faMinus,
  faPen,
  faPlus,
  faSearch,
  faSliders,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JoinInner } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawPolygonMode,
  DrawRectangleMode,
  ModifyMode,
  ViewMode,
} from "@nebula.gl/edit-modes";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";

import { useDataset } from "../../context/DatasetContext";
import { OffcanvasControls } from "../offcanvas";
import { ScatterplotControls } from "./ScatterplotControls";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function SpatialControls({
  mode,
  setMode,
  features,
  setFeatures,
  selectedFeatureIndexes,
  resetBounds,
  increaseZoom,
  decreaseZoom,
  setShowObs,
  setShowVars,
  isFullscreen,
}) {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [showControls, setShowControls] = useState(false);

  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);

  const LgBreakpoint = useMediaQuery("(max-width: 991.98px)");
  const XlBreakpoint = useMediaQuery("(max-width: 1199.98px)");
  const showObsBtn = isFullscreen ? LgBreakpoint : true;
  const showVarsBtn = isFullscreen ? XlBreakpoint : true;

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
        active={settings.sliceBy.polygons}
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
      {(showObsBtn || showVarsBtn) && (
        <ButtonGroup vertical className="w-100 mb-1">
          {showObsBtn && (
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip id="tooltip-obs">Browse categories</Tooltip>}
            >
              <Button onClick={() => setShowObs(true)}>
                <FontAwesomeIcon icon={faList} />
              </Button>
            </OverlayTrigger>
          )}
          {showVarsBtn && (
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip id="tooltip-vars">Search features</Tooltip>}
            >
              <Button onClick={() => setShowVars(true)}>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </OverlayTrigger>
          )}
        </ButtonGroup>
      )}
      <ButtonGroup vertical className="w-100">
        <Button
          onClick={() => setMode(() => ViewMode)}
          title="Set dragging mode"
          active={mode === ViewMode}
        >
          <FontAwesomeIcon icon={faHand} />
        </Button>
        <Button onClick={increaseZoom} title="Increase zoom">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button onClick={decreaseZoom} title="Decrease zoom">
          <FontAwesomeIcon icon={faMinus} />
        </Button>
        <div className="border-bottom"></div> {/* Divider */}
        <Button onClick={resetBounds} title="Reset zoom and center">
          <FontAwesomeIcon icon={faCrosshairs} />
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

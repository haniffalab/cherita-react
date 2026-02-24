import { useState } from 'react';

import {
  faCrosshairs,
  faDrawPolygon,
  faHand,
  faBars,
  faMinus,
  faPen,
  faPlus,
  faSearch,
  faSliders,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JoinInner } from '@mui/icons-material';
import {
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawPolygonMode,
  DrawRectangleMode,
  ModifyMode,
  ViewMode,
} from '@nebula.gl/edit-modes';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import { ScatterplotControls } from './ScatterplotControls';
import { useDataset } from '../../context/DatasetContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import usePlotVisibility from '../../utils/usePlotVisibility';
import { OffcanvasControls } from '../offcanvas/OffCanvas';

export function SpatialControls({
  mode,
  setMode,
  features,
  setFeatures,
  selectedFeatureIndexes,
  resetBounds,
  increaseZoom,
  decreaseZoom,
  setShowCategories,
  setShowSearch,
  isFullscreen,
}) {
  const dataset = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [showControls, setShowControls] = useState(false);

  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);

  const { showCategoriesBtn, showSearchBtn, isCompact } =
    usePlotVisibility(isFullscreen);

  const onSelect = (eventKey, event) => {
    switch (eventKey) {
      case 'DrawPolygonMode':
        setMode(() => DrawPolygonMode);
        break;
      case 'DrawLineStringMode':
        setMode(() => DrawLineStringMode);
        break;
      case 'DrawPolygonByDraggingMode':
        setMode(() => DrawPolygonByDraggingMode);
        break;
      case 'DrawRectangleMode':
        setMode(() => DrawRectangleMode);
        break;
      case 'ModifyMode':
        setMode(() => ModifyMode);
        break;
      default:
        setMode(() => ViewMode);
    }
  };

  const deleteFeatures = (_eventKey, _event) => {
    setFeatures({
      type: 'FeatureCollection',
      features: [],
    });
  };

  const polygonControls = (
    <>
      <Button
        active={settings.sliceBy.polygons}
        size={isCompact && 'sm'}
        title="Filter data with polygons"
        onClick={() => {
          setMode(() => ViewMode);
          dispatch({
            type: 'toggle.slice.polygons',
          });
        }}
      >
        <JoinInner
          fontSize={isCompact ? 'small' : 'medium'}
          sx={{ display: 'block' }}
        />
      </Button>
      <Button
        title="Delete selcted polygons"
        size={isCompact && 'sm'}
        onClick={() => {
          const newFeatures = features.features.filter(
            (_f, i) => !selectedFeatureIndexes.includes(i),
          );
          setFeatures({
            type: 'FeatureCollection',
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
    <div
      className={`cherita-spatial-controls ${isCompact ? 'is-compact' : ''}`}
    >
      {(showCategoriesBtn || showSearchBtn) && (
        <ButtonGroup vertical className="mb-1 w-100">
          {showCategoriesBtn && (
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip id="tooltip-obs">Explore categories</Tooltip>}
            >
              <Button
                size={isCompact && 'sm'}
                onClick={() => setShowCategories(true)}
              >
                <FontAwesomeIcon icon={faBars} />
              </Button>
            </OverlayTrigger>
          )}
          {showSearchBtn && (
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tooltip-vars">
                  Search {dataset.varLabel.plural}
                </Tooltip>
              }
            >
              <Button
                size={isCompact && 'sm'}
                onClick={() => setShowSearch(true)}
              >
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
          size={isCompact && 'sm'}
        >
          <FontAwesomeIcon icon={faHand} />
        </Button>
        <Button
          size={isCompact && 'sm'}
          onClick={increaseZoom}
          title="Increase zoom"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button
          size={isCompact && 'sm'}
          onClick={decreaseZoom}
          title="Decrease zoom"
        >
          <FontAwesomeIcon icon={faMinus} />
        </Button>
        <Button
          size={isCompact && 'sm'}
          onClick={resetBounds}
          title="Reset zoom and center"
        >
          <FontAwesomeIcon icon={faCrosshairs} />
        </Button>
        <Dropdown
          as={ButtonGroup}
          className="caret-off"
          drop="end"
          onSelect={onSelect}
          size={isCompact && 'sm'}
        >
          <Dropdown.Toggle
            id="dropdown-autoclose-outside"
            className={`w-100 caret-off ${mode === DrawPolygonByDraggingMode || mode === ModifyMode ? 'active' : ''}`}
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
        <Button size={isCompact && 'sm'} onClick={handleShowControls}>
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

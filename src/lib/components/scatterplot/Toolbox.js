import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { React, useCallback, useEffect, useState } from "react";
import _ from "lodash";
import chroma from "chroma-js";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { EMBEDDINGS } from "../../constants/constants";
import { MapHelper } from "../../helpers/map";
import { ZarrHelper, GET_OPTIONS } from "../../helpers/zarr";

import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { ViewMode, DrawPolygonMode, DrawPolygonByDraggingMode, ModifyMode } from "@nebula.gl/edit-modes";
import { Toolbox } from "@nebula.gl/editor";

import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons'


window.deck.log.level = 1;

export function Toolbox2() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [active, setActive] = useState(dataset.embedding);

  useEffect(() => {
    setActive(dataset.embedding);
  }, [dataset.embedding]);

  return (
    <div className="cherita-toolbox">
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Dropdown Button
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <ButtonGroup>
        <Button><FontAwesomeIcon icon={faArrowPointer} /> Mode</Button>
        <Button>2</Button>
        <DropdownButton as={ButtonGroup} title={"test" + <FontAwesomeIcon icon={faArrowPointer} />} id="bg-nested-dropdown">
          <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
          <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
        </DropdownButton>
      </ButtonGroup>
    </div >
  );
}

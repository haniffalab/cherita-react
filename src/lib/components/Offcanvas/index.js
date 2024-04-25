import { React } from "react";

import Offcanvas from "react-bootstrap/Offcanvas";

import {
  ObsColsList,
  ObsmKeysList,
  VarNamesList,
  SELECTION_MODES,
} from "@haniffalab/cherita-react";
import { SearchBar } from "../search-bar/SearchBar";

export function OffcanvasObs({ show, handleClose }) {
  return (
    <Offcanvas show={show} onHide={handleClose} scroll={true} backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Categories</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ObsColsList />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export function OffcanvasObsm({ show, handleClose }) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Embedding space</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ObsmKeysList />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export function OffcanvasVars({
  show,
  handleClose,
  mode = SELECTION_MODES.MULTIPLE,
}) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Features</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <SearchBar searchDiseases={true} />
        <VarNamesList mode={mode} />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export function OffcanvasControls({ show, handleClose, Controls }) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Controls</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Controls />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export function OffcanvasInfo({ show, handleClose }) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Info</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        Some text as placeholder. In real life you can have the elements you
        have chosen. Like, text, images, lists, etc.
      </Offcanvas.Body>
    </Offcanvas>
  );
}

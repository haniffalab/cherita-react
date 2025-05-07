import React from "react";

import Offcanvas from "react-bootstrap/Offcanvas";

import { SELECTION_MODES } from "../../constants/constants";
import { ObsColsList } from "../obs-list/ObsList";
import { ObsmKeysList } from "../obsm-list/ObsmList";
import { SearchBar } from "../search-bar/SearchBar";
import { VarNamesList } from "../var-list/VarList";

export function OffcanvasObs({ show, handleClose, ...props }) {
  return (
    <Offcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Categories</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <ObsColsList {...props} />
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

export function OffcanvasControls({ show, handleClose, Controls, ...props }) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Controls</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Controls {...props} />
      </Offcanvas.Body>
    </Offcanvas>
  );
}

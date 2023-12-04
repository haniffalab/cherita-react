import { React, useState, useEffect } from "react";

import Offcanvas from "react-bootstrap/Offcanvas";

import {
  ObsColsList,
  VarNamesList,
  SELECTION_MODES,
} from "@haniffalab/cherita-react";

function PersistentOffcanvas({ show, onHide, scroll, children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (show && !initialized) {
      setInitialized(true);
    }
  }, [show, initialized]);

  return (
    <Offcanvas
      className={show ? "" : "d-none"}
      backdropClassName={show ? "" : "d-none"}
      show={initialized}
      onHide={onHide}
      scroll={scroll}
    >
      {children}
    </Offcanvas>
  );
}

export function OffcanvasObs({ show, handleClose }) {
  return (
    <PersistentOffcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Categories</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ObsColsList />
      </Offcanvas.Body>
    </PersistentOffcanvas>
  );
}

export function OffcanvasObsm({ show, handleClose }) {
  return (
    <PersistentOffcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Embedding space</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>UMAP</Offcanvas.Body>
    </PersistentOffcanvas>
  );
}

export function OffcanvasVars({ show, handleClose }) {
  return (
    <PersistentOffcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Features</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <VarNamesList mode={SELECTION_MODES.MULTIPLE} />
      </Offcanvas.Body>
    </PersistentOffcanvas>
  );
}

export function OffcanvasControls({ show, handleClose, Controls }) {
  return (
    <PersistentOffcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Controls</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Controls />
      </Offcanvas.Body>
    </PersistentOffcanvas>
  );
}

export function OffcanvasInfo({ show, handleClose }) {
  return (
    <PersistentOffcanvas show={show} onHide={handleClose} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Info</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        Some text as placeholder. In real life you can have the elements you
        have chosen. Like, text, images, lists, etc.
      </Offcanvas.Body>
    </PersistentOffcanvas>
  );
}

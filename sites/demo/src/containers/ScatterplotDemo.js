import { React, useState } from "react";

import {
  DatasetProvider,
  Scatterplot,
  ScatterplotControls,
  SELECTION_MODES,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
  OffcanvasControls,
  OffcanvasInfo,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function ScatterplotDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCloseObs = () => setShowObs(false);
  const handleShowObs = () => setShowObs(true);
  const handleCloseObsm = () => setShowObsm(false);
  const handleShowObsm = () => setShowObsm(true);
  const handleCloseVars = () => setShowVars(false);
  const handleShowVars = () => setShowVars(true);
  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowInfo = () => setShowInfo(true);
  return (
    <Container>
      <div className="cherita-container">
        <DatasetProvider {...props}>
          <Navbar expand="lg" bg="primary" className="cherita-navbar">
            <Container fluid>
              <Navbar.Toggle aria-controls="navbarScroll" />
              <Navbar.Collapse id="navbarScroll">
                <Nav className="me-auto my-2 my-lg-0" navbarScroll>
                  <Nav.Item>
                    <Nav.Link onClick={handleShowObs}>Categories</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link onClick={handleShowVars}>Features</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link onClick={handleShowObsm}>Embedding</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Nav className="d-flex">
                  <Nav.Item>
                    <Nav.Link onClick={handleShowControls}>Controls</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link onClick={handleShowInfo}>Info</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <div className="cherita-container-scatterplot">
            <Scatterplot />
          </div>
          <OffcanvasObs show={showObs} handleClose={handleCloseObs} />
          <OffcanvasObsm show={showObsm} handleClose={handleCloseObsm} />
          <OffcanvasVars
            show={showVars}
            handleClose={handleCloseVars}
            mode={SELECTION_MODES.SINGLE}
          />
          <OffcanvasControls
            show={showControls}
            handleClose={handleCloseControls}
            Controls={ScatterplotControls}
          />
          <OffcanvasInfo show={showInfo} handleClose={handleCloseInfo} />
        </DatasetProvider>
      </div>
    </Container>
  );
}

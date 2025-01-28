import { React, useState } from "react";

import {
  DatasetProvider,
  Dotplot,
  DotplotControls,
  OffcanvasObs,
  OffcanvasVars,
  OffcanvasControls,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function DotplotDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleCloseObs = () => setShowObs(false);
  const handleShowObs = () => setShowObs(true);
  const handleCloseVars = () => setShowVars(false);
  const handleShowVars = () => setShowVars(true);
  const handleCloseControls = () => setShowControls(false);
  const handleShowControls = () => setShowControls(true);
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
                </Nav>
                <Nav className="d-flex">
                  <Nav.Item>
                    <Nav.Link onClick={handleShowControls}>Controls</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <div className="cherita-container-plot">
            <Dotplot />
          </div>
          <OffcanvasObs
            show={showObs}
            handleClose={handleCloseObs}
            showColor={false}
          />
          <OffcanvasVars show={showVars} handleClose={handleCloseVars} />
          <OffcanvasControls
            show={showControls}
            handleClose={handleCloseControls}
            Controls={DotplotControls}
          />
        </DatasetProvider>
      </div>
    </Container>
  );
}

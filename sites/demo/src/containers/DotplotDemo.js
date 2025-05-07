import React, { useState } from "react";

import { faList, faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DatasetProvider,
  Dotplot,
  DotplotControls,
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasVars,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function DotplotDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  return (
    <Container>
      <div className="cherita-container">
        <DatasetProvider {...props}>
          <Navbar
            expand="lg"
            bg="primary"
            variant="dark"
            className="cherita-navbar"
          >
            <Container fluid>
              <Navbar.Toggle aria-controls="navbarScroll" />
              <Navbar.Collapse id="navbarScroll">
                <Nav navbarScroll>
                  <Nav.Item className="me-2">
                    <Nav.Link onClick={() => setShowObs(true)}>
                      <FontAwesomeIcon icon={faList} className="me-2" />
                      Explore Categories
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="me-2">
                    <Nav.Link onClick={() => setShowVars(true)}>
                      <FontAwesomeIcon icon={faSearch} className="me-2" />
                      Search Genes
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="me-2">
                    <Nav.Link onClick={() => setShowControls(true)}>
                      <FontAwesomeIcon icon={faSliders} className="me-2" />
                      Controls
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <div className="cherita-container-plot">
            <Dotplot />
          </div>
          <OffcanvasObs show={showObs} handleClose={() => setShowObs(false)} />
          <OffcanvasVars
            show={showVars}
            handleClose={() => setShowVars(false)}
          />
          <OffcanvasControls
            show={showControls}
            handleClose={() => setShowControls(false)}
            Controls={DotplotControls}
          />
        </DatasetProvider>
      </div>
    </Container>
  );
}

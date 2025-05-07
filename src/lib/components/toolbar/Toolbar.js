import React from "react";

import { faList, faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Nav, Navbar } from "react-bootstrap";

export const Toolbar = ({
  showObsBtn = true,
  showVarsBtn = true,
  showCtrlsBtn = true,
  setShowObs,
  setShowVars,
  setShowControls,
}) => {
  return (
    <Navbar expand="md" bg="primary" variant="dark" className="cherita-navbar">
      <Container fluid>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav navbarScroll>
            {showObsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowObs(true)}>
                  <FontAwesomeIcon icon={faList} className="me-2" />
                  Explore Categories
                </Nav.Link>
              </Nav.Item>
            )}
            {showVarsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowVars(true)}>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search Genes
                </Nav.Link>
              </Nav.Item>
            )}
            {showCtrlsBtn && (
              <Nav.Item className="me-2">
                <Nav.Link onClick={() => setShowControls(true)}>
                  <FontAwesomeIcon icon={faSliders} className="me-2" />
                  Controls
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

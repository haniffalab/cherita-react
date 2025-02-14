import React, { useLayoutEffect, useRef, useState } from "react";

import {
  faChartArea,
  faChartLine,
  faChartPie,
  faChartSimple,
  faChevronDown,
  faChevronUp,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Card,
  Collapse,
  Container,
  Modal,
  Nav,
  Navbar,
} from "react-bootstrap";

import { SELECTION_MODES } from "../../constants/constants";
import { DatasetProvider } from "../../context/DatasetContext";
import { ObsColsList } from "../obs-list/ObsList";
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
} from "../offcanvas";
import { Pseudospatial } from "../pseudospatial/Pseudospatial";
import { PseudospatialToolbar } from "../pseudospatial/PseudospatialToolbar";
import { Scatterplot } from "../scatterplot/Scatterplot";
import { ScatterplotControls } from "../scatterplot/ScatterplotControls";
import { SearchBar } from "../search-bar/SearchBar";
import { VarNamesList } from "../var-list/VarList";

export function FullPage({
  children,
  varMode = SELECTION_MODES.SINGLE,
  ...props
}) {
  const targetRef = useRef();

  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showModal, setShowModal] = useState(false);
  useLayoutEffect(() => {
    function updateDimensions() {
      if (targetRef.current) {
        // Get the distance from the top of the page to the target element
        const rect = targetRef.current.getBoundingClientRect();
        const distanceFromTop = rect.top + window.scrollY;

        // Calculate the available height for the Cherita app
        const availableHeight = window.innerHeight - distanceFromTop;

        // Update the dimensions to fit the viewport minus the navbar height
        setDimensions({
          width: targetRef.current.offsetWidth,
          height: availableHeight,
        });
      }
    }

    window.addEventListener("resize", updateDimensions);
    updateDimensions(); // Initial update
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      ref={targetRef}
      className="cherita-app"
      style={{ height: dimensions.height }}
    >
      <DatasetProvider {...props}>
        <Container
          fluid
          className="d-flex g-0"
          style={{ height: dimensions.height }}
        >
          <Navbar expand="sm" bg="primary" className="cherita-navbar">
            <div className="container-fluid">
              <Navbar.Toggle aria-controls="navbarScroll" />
              <Navbar.Collapse id="navbarScroll">
                <Nav className="me-auto my-0" navbarScroll>
                  <Nav.Item className="d-block d-lg-none">
                    <Nav.Link onClick={() => setShowObs(true)}>
                      Observations
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link onClick={() => setShowVars(true)}>
                      Features
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Nav className="d-flex">
                  <Nav.Item>
                    <Nav.Link onClick={() => setShowControls(true)}>
                      Controls
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </div>
          </Navbar>
          <div className="cherita-app-obs modern-scrollbars border-end d-flex flex-column h-100">
            <ObsColsList />
          </div>
          <div className="cherita-app-canvas flex-grow-1">{children}</div>
          <div className="cherita-app-sidebar p-3 border-end d-flex flex-column h-100">
            <Card className="sidebar-card-features flex-grow-1 mb-3">
              <Card.Header className="d-flex justify-content-evenly align-items-center">
                <Button variant="link" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faChartSimple} />
                </Button>
                <Button variant="link" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faChartLine} />
                </Button>
                <Button variant="link" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faChartPie} />
                </Button>
                <Button variant="link" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faChartArea} />
                </Button>
              </Card.Header>
              <Card.Body>
                <SearchBar searchDiseases={true} searchVar={true} />
                <VarNamesList mode={varMode} />
              </Card.Body>
            </Card>
            <Card
              className="sidebar-card-pseudospatial"
              style={{ height: isCollapsed ? "auto" : "500px" }}
            >
              <Card.Header className="d-flex justify-content-between align-items-center">
                Pseudospatial
                <Button
                  variant="link"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="ms-auto"
                >
                  <FontAwesomeIcon
                    icon={isCollapsed ? faChevronUp : faChevronDown}
                  />
                </Button>
                {!isCollapsed && (
                  <Button
                    variant="link"
                    onClick={() => setShowPseudospatialControls(!isCollapsed)}
                  >
                    <FontAwesomeIcon icon={faSliders} />
                  </Button>
                )}
              </Card.Header>
              <Collapse in={!isCollapsed}>
                <Card.Body>
                  <Pseudospatial />
                </Card.Body>
              </Collapse>
            </Card>
          </div>
        </Container>
        <div>
          {/* Modal Component */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>My Modal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Pseudospatial />
            </Modal.Body>
          </Modal>
          <OffcanvasObs show={showObs} handleClose={() => setShowObs(false)} />
          <OffcanvasVars
            show={showVars}
            handleClose={() => setShowVars(false)}
          />
          <OffcanvasControls
            show={showControls}
            handleClose={() => setShowControls(false)}
            Controls={ScatterplotControls}
          />
          <OffcanvasControls
            show={showPseudospatialControls}
            handleClose={() => setShowPseudospatialControls(false)}
            Controls={PseudospatialToolbar}
          />
          <OffcanvasObsm
            show={showObsm}
            handleClose={() => setShowObsm(false)}
          />
        </div>
      </DatasetProvider>
    </div>
  );
}

export function FullPagePseudospatial(props) {
  return (
    <FullPage {...props}>
      <Scatterplot />
    </FullPage>
  );
}

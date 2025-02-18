import React, { useContext, useLayoutEffect, useRef, useState } from "react";

import {
  faChartArea,
  faChartLine,
  faChartPie,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Container, Modal, Nav, Navbar } from "react-bootstrap";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import AccordionContext from "react-bootstrap/AccordionContext";
import ButtonGroup from "react-bootstrap/ButtonGroup";

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
  const appRef = useRef();
  const [appDimensions, setAppDimensions] = useState({ width: 0, height: 0 });

  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
  const [showModal, setShowModal] = useState(false);
  useLayoutEffect(() => {
    function updateDimensions() {
      if (appRef.current) {
        // Get the distance from the top of the page to the target element
        const rect = appRef.current.getBoundingClientRect();
        const distanceFromTop = rect.top + window.scrollY;

        // Calculate the available height for the Cherita app
        const availableHeight = window.innerHeight - distanceFromTop;

        // Update the dimensions to fit the viewport minus the navbar height
        setAppDimensions({
          width: appRef.current.offsetWidth,
          height: availableHeight,
        });
      }
    }

    // Initial calculation
    updateDimensions();

    // Event listener for resize
    window.addEventListener("resize", updateDimensions);

    // Handle dimension recalculation when accordion expands/collapses
    const accordionItems = document.querySelectorAll(".accordion-item");
    accordionItems.forEach((item) => {
      item.addEventListener("transitionend", updateDimensions);
    });

    // Clean up event listeners
    return () => {
      window.removeEventListener("resize", updateDimensions);
      accordionItems.forEach((item) => {
        item.removeEventListener("transitionend", updateDimensions);
      });
    };
  }, []); // Dependency array to run only on mount/unmount

  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function ObsAccordionToggle({ title, eventKey, buttons }) {
    const { activeEventKey } = useContext(AccordionContext);
    // console.log("activeEventKey:", activeEventKey);

    const decoratedOnClick = useAccordionButton(eventKey, () => {
      console.log("Clicked accordion:", eventKey);
    });

    const isCurrentEventKey = Array.isArray(activeEventKey)
      ? activeEventKey.includes(eventKey)
      : activeEventKey === eventKey;

    return (
      <div className="accordion-header" onClick={decoratedOnClick}>
        <div
          className={`accordion-header-wrapper d-flex align-items-center ${isCurrentEventKey ? "" : "collapsed"}`}
        >
          <span className="accordion-title flex-grow-1">{title}</span>
          <div className="accordion-buttons ms-auto">
            <ButtonGroup>{buttons}</ButtonGroup>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={appRef}
      className="cherita-app"
      style={{ height: appDimensions.height }}
    >
      <DatasetProvider {...props}>
        <Container
          fluid
          className="d-flex g-0"
          style={{ height: appDimensions.height }}
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
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList />
          </div>
          <div className="cherita-app-canvas flex-grow-1">{children}</div>
          <div className="cherita-app-sidebar p-3">
            <Card>
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
              <Card.Body className="d-flex flex-column p-0">
                <div className="sidebar-pseudospatial">
                  <Pseudospatial
                    className="sidebar-pseudospatial"
                    setShowPseudospatialControls={setShowPseudospatialControls}
                  />
                </div>

                <div className="sidebar-features modern-scrollbars">
                  <SearchBar searchDiseases={true} searchVar={true} />
                  <VarNamesList mode={varMode} />
                </div>

                {/* <Accordion
                  defaultActiveKey={["features"]}
                  flush
                  alwaysOpen
                  className="flex-grow-1 flex-shrink-1 modern-scrollbars"
                  style={{ overflowY: "auto" }}
                >
                  <Accordion.Item
                    as="div"
                    eventKey="features"
                    className="sidebar-features"
                  >
                    <ObsAccordionToggle
                      eventKey="features"
                      title="Features"
                      buttons={
                        !isCollapsed && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVars(!isCollapsed);
                            }}
                          >
                            <FontAwesomeIcon icon={faSearch} />
                          </Button>
                        )
                      }
                    />
                    <Accordion.Collapse eventKey="features">
                      <Accordion.Body>
                        <SearchBar searchDiseases={true} searchVar={true} />
                        <VarNamesList mode={varMode} />
                      </Accordion.Body>
                    </Accordion.Collapse>
                  </Accordion.Item>
                </Accordion> */}
              </Card.Body>
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

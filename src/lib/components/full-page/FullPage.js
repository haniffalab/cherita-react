import React, { useLayoutEffect, useRef, useState } from "react";
import { Card, Nav, Navbar } from "react-bootstrap";

import { SELECTION_MODES, VIOLIN_MODES } from "../../constants/constants";
import { DatasetProvider } from "../../context/DatasetContext";
import { Dotplot } from "../dotplot/Dotplot";
import { Heatmap } from "../heatmap/Heatmap";
import { Matrixplot } from "../matrixplot/Matrixplot";
import { ObsColsList } from "../obs-list/ObsList";
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
} from "../offcanvas";
import { Scatterplot } from "../scatterplot/Scatterplot";
import { ScatterplotControls } from "../scatterplot/ScatterplotControls";
import { SearchBar } from "../search-bar/SearchBar";
import { VarNamesList } from "../var-list/VarList";
import { Violin } from "../violin/Violin";

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  return (
    <div
      ref={targetRef}
      className="cherita-app"
      style={{ height: dimensions.height }}
    >
      <DatasetProvider {...props}>
        <div className="row g-0">
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList />
          </div>
          <div className="cherita-app-plot">
            <div className="position-relative">
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
            </div>
            {children}
          </div>
          <div className="cherita-app-var">
            <Card className="cherita-app-features">
              <Card.Body>
                <SearchBar searchDiseases={true} searchVar={true} />
                <VarNamesList mode={varMode} />
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <OffcanvasObs
              show={showObs}
              handleClose={() => setShowObs(false)}
            />
            <OffcanvasVars
              show={showVars}
              handleClose={() => setShowVars(false)}
            />
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={ScatterplotControls}
            />
            <OffcanvasObsm
              show={showObsm}
              handleClose={() => setShowObsm(false)}
            />
          </div>
        </div>
      </DatasetProvider>
    </div>
  );
}

export function FullPageScatterplot(props) {
  return (
    <FullPage {...props}>
      <Scatterplot />
    </FullPage>
  );
}

export function FullPagePlots(props) {
  return (
    <FullPage {...props} varMode={SELECTION_MODES.MULTIPLE}>
      <div className="container-fluid w-100 h-100 d-flex flex-column overflow-y-auto">
        <div className="row flex-grow-1">
          <Heatmap />
        </div>
        <div className="row flex-grow-1">
          <Matrixplot />
        </div>
        <div className="row flex-grow-1">
          <Dotplot />
        </div>
        <div className="row flex-grow-1">
          <Violin mode={VIOLIN_MODES.GROUPBY} />
        </div>
      </div>
    </FullPage>
  );
}

import React, { useState, useRef, useLayoutEffect } from "react";

import { Navbar, Nav, Card } from "react-bootstrap";

import { SELECTION_MODES, VIOLIN_MODES } from "../../constants/constants";
import { DatasetProvider } from "../../context/DatasetContext";
import { Dotplot } from "../dotplot/Dotplot";
import { Heatmap } from "../heatmap/Heatmap";
import { Matrixplot } from "../matrixplot/Matrixplot";
import { ObsColsList } from "../obs-list/ObsList";
import {
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
  OffcanvasControls,
} from "../offcanvas";
import {
  Pseudospatial,
  PseudospatialImage,
} from "../pseudospatial/Pseudospatial";
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
        setDimensions({
          width: targetRef.current.offsetWidth,
          height: window.innerHeight - targetRef.current.offsetTop,
        });
      }
    }
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
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
          <div className="cherita-app-obs">
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

export function FullPagePseudospatial(props) {
  return (
    <FullPage {...props}>
      <div className="container-fluid h-100">
        <div className="row">
          <div className="col-12 col-lg-7">
            <Scatterplot />
          </div>
          <div className="col-12 col-lg-5">
            <div className="container-fluid h-100 d-flex align-itemms-center justify-content-center">
              <div className="row w-100 py-3">
                <div className="col-12">
                  <div className="p-2">
                    <Pseudospatial />
                  </div>
                </div>
                <div className="col-12">
                  <PseudospatialImage />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

import React, { useEffect, useRef, useState } from "react";

import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Container, Modal } from "react-bootstrap";

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
  searchDiseases = false,
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
  const [pseudospatialPlotType, setpseudospatialPlotType] = useState(null);

  useEffect(() => {
    const updateDimensions = () => {
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
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions(); // Initial update
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList {...props} />
          </div>
          <div className="cherita-app-canvas flex-grow-1">
            {children({
              setShowObs,
              setShowVars,
            })}
          </div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Header className="d-flex justify-content-evenly align-items-center">
                <Button variant="link" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </Button>
              </Card.Header>
              <Card.Body className="d-flex flex-column p-0">
                <div className="sidebar-pseudospatial">
                  <Pseudospatial
                    className="sidebar-pseudospatial"
                    plotType={pseudospatialPlotType}
                    setPlotType={setpseudospatialPlotType}
                    setShowControls={setShowPseudospatialControls}
                  />
                </div>

                <div className="sidebar-features modern-scrollbars">
                  <SearchBar searchDiseases={searchDiseases} searchVar={true} />
                  <VarNamesList mode={varMode} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <div>
          {/* Modal Component */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              {/* @TODO: controls are inaccessible from modal */}
              <Pseudospatial
                plotType={pseudospatialPlotType}
                setPlotType={setpseudospatialPlotType}
                setShowControls={setShowPseudospatialControls}
                height={500}
              />
            </Modal.Body>
          </Modal>
          <OffcanvasObs show={showObs} handleClose={() => setShowObs(false)} />
          <OffcanvasVars
            show={showVars}
            handleClose={() => setShowVars(false)}
            mode={varMode}
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
            plotType={pseudospatialPlotType}
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
  const { setShowObs, setShowVars } = props;
  return (
    <FullPage {...props} varMode={SELECTION_MODES.SINGLE}>
      <Scatterplot
        setShowObs={setShowObs}
        setShowVars={setShowVars}
        isFullscreen={true}
      />
    </FullPage>
  );
}

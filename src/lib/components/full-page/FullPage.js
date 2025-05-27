import React, { useEffect, useRef, useState } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import { Card, Container, Modal } from "react-bootstrap";

import { SELECTION_MODES, VIOLIN_MODES } from "../../constants/constants";
import { DatasetProvider } from "../../context/DatasetContext";
import { Dotplot } from "../dotplot/Dotplot";
import { DotplotControls } from "../dotplot/DotplotControls";
import { Heatmap } from "../heatmap/Heatmap";
import { HeatmapControls } from "../heatmap/HeatmapControls";
import { Matrixplot } from "../matrixplot/Matrixplot";
import { MatrixplotControls } from "../matrixplot/MatrixplotControls";
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
import { ViolinControls } from "../violin/ViolinControls";

export function FullPage({
  renderItem,
  varMode = SELECTION_MODES.SINGLE,
  searchDiseases = true,
  Controls = null,
  ...props
}) {
  const appRef = useRef();
  const [appDimensions, setAppDimensions] = useState({ width: 0, height: 0 });

  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const LgBreakpoint = useMediaQuery("(max-width: 991.98px)");
  const XlBreakpoint = useMediaQuery("(max-width: 1199.98px)");
  const showObsBtn = LgBreakpoint;
  const showVarsBtn = XlBreakpoint;

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
          className="cherita-app-container"
          style={{ height: appDimensions.height }}
        >
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList {...props} />
          </div>
          <div className="cherita-app-canvas">
            {renderItem({
              showObsBtn,
              showVarsBtn,
              showCtrlsBtn: !!Controls,
              setShowObs,
              setShowVars,
              setShowControls,
            })}
          </div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Body className="d-flex flex-column p-0">
                <div className="sidebar-features modern-scrollbars">
                  <SearchBar searchDiseases={searchDiseases} searchVar={true} />
                  <VarNamesList mode={varMode} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <div>
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body></Modal.Body>
          </Modal>
          <OffcanvasObs show={showObs} handleClose={() => setShowObs(false)} />
          <OffcanvasVars
            show={showVars}
            handleClose={() => setShowVars(false)}
            mode={varMode}
          />
          {Controls && (
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={Controls}
            />
          )}
          <OffcanvasObsm
            show={showObsm}
            handleClose={() => setShowObsm(false)}
          />
        </div>
      </DatasetProvider>
    </div>
  );
}

export function FullPageScatterplot(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.SINGLE}
      Controls={ScatterplotControls}
      renderItem={({ setShowObs, setShowVars }) => (
        <Scatterplot
          setShowObs={setShowObs}
          setShowVars={setShowVars}
          isFullscreen={true}
        />
      )}
    />
  );
}

export function FullPagePlots(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
      renderItem={() => (
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
            <Violin mode={VIOLIN_MODES.MULTIKEY} />
          </div>
        </div>
      )}
    />
  );
}

export function FullPageDotplot(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
      Controls={DotplotControls}
      renderItem={(props) => <Dotplot {...props} />}
    />
  );
}

export function FullPageHeatmap(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
      Controls={HeatmapControls}
      renderItem={(props) => <Heatmap {...props} />}
    />
  );
}

export function FullPageMatrixplot(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
      Controls={MatrixplotControls}
      renderItem={(props) => <Matrixplot {...props} />}
    />
  );
}

export function FullPageViolin(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      Controls={ViolinControls}
      renderItem={(props) => <Violin mode={VIOLIN_MODES.MULTIKEY} {...props} />}
    />
  );
}

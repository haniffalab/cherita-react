import React, { useEffect, useRef, useState } from "react";

import { Card, Container, Modal } from "react-bootstrap";

import { SELECTION_MODES, VIOLIN_MODES } from "../../constants/constants";
import { DatasetProvider } from "../../context/DatasetContext";
import { Dotplot } from "../dotplot/Dotplot";
import { DotplotControls } from "../dotplot/DotplotControls";
import { PlotTypeSelector } from "../full-page/PlotTypeSelector";
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
import { Pseudospatial } from "../pseudospatial/Pseudospatial";
import { PseudospatialToolbar } from "../pseudospatial/PseudospatialToolbar";
import { Scatterplot } from "../scatterplot/Scatterplot";
import { ScatterplotControls } from "../scatterplot/ScatterplotControls";
import { SearchBar } from "../search-bar/SearchBar";
import { VarNamesList } from "../var-list/VarList";
import { Violin } from "../violin/Violin";
import { ViolinControls } from "../violin/ViolinControls";

export function FullPage({
  varMode = SELECTION_MODES.SINGLE,
  isPseudospatial = false,
  searchDiseases = true,
  ...props
}) {
  const appRef = useRef();
  const [appDimensions, setAppDimensions] = useState({ width: 0, height: 0 });

  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [plotType, setPlotType] = useState(
    props.defaultPlotType || "scatterplot"
  );
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
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
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const renderPlot = () => {
    const commonProps = {
      setShowObs,
      setShowVars,
      isFullscreen: true,
    };

    switch (plotType) {
      case "dotplot":
        return <Dotplot {...commonProps} />;
      case "matrixplot":
        return <Matrixplot {...commonProps} />;
      case "heatmap":
        return <Heatmap {...commonProps} />;
      case "violin":
        return <Violin mode={VIOLIN_MODES.MULTIKEY} {...commonProps} />;
      case "scatterplot":
      default:
        return <Scatterplot {...commonProps} />;
    }
  };

  const plotControls = {
    scatterplot: ScatterplotControls,
    dotplot: DotplotControls,
    matrixplot: MatrixplotControls,
    heatmap: HeatmapControls,
    violin: ViolinControls,
  }[plotType];

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
          <div className="cherita-app-canvas">{renderPlot()}</div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Body className="d-flex flex-column p-0">
                <div className="sidebar-plotselector">
                  <PlotTypeSelector
                    currentType={plotType}
                    onChange={(type) => setPlotType(type)}
                  />
                </div>
                {isPseudospatial ? (
                  <div className="sidebar-pseudospatial">
                    <Pseudospatial
                      plotType={pseudospatialPlotType}
                      setPlotType={setpseudospatialPlotType}
                      setShowControls={setShowPseudospatialControls}
                    />
                  </div>
                ) : (
                  <></>
                )}
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
          {plotControls && (
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={plotControls}
            />
          )}
          <OffcanvasObsm
            show={showObsm}
            handleClose={() => setShowObsm(false)}
          />
          <OffcanvasControls
            show={showPseudospatialControls}
            handleClose={() => setShowPseudospatialControls(false)}
            Controls={PseudospatialToolbar}
            plotType={pseudospatialPlotType}
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
      defaultPlotType="scatterplot"
      varMode={SELECTION_MODES.SINGLE}
    />
  );
}

export function FullPageDotplot(props) {
  return (
    <FullPage
      {...props}
      defaultPlotType="dotplot"
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
    />
  );
}

export function FullPageHeatmap(props) {
  return (
    <FullPage
      {...props}
      defaultPlotType="heatmap"
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
    />
  );
}

export function FullPageMatrixplot(props) {
  return (
    <FullPage
      {...props}
      defaultPlotType="matrixplot"
      varMode={SELECTION_MODES.MULTIPLE}
      showSelectedAsActive={true}
    />
  );
}

export function FullPageViolin(props) {
  return (
    <FullPage
      {...props}
      defaultPlotType="violin"
      varMode={SELECTION_MODES.MULTIPLE}
    />
  );
}

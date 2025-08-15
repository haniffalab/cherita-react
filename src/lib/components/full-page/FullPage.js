import React, { useEffect, useMemo, useState } from "react";

import { useMediaQuery } from "@mui/material";
import { Card, Container, Modal } from "react-bootstrap";

import {
  BREAKPOINTS,
  PLOT_TYPES,
  SELECTION_MODES,
  VIOLIN_MODES,
} from "../../constants/constants";
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
  isPseudospatial = false,
  searchDiseases = true,
  defaultPlotType = PLOT_TYPES.SCATTERPLOT,
  ...props
}) {
  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [plotType, setPlotType] = useState(
    defaultPlotType || PLOT_TYPES.SCATTERPLOT
  );
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
  const [pseudospatialPlotType, setpseudospatialPlotType] = useState(null);

  useEffect(() => {
    setPlotType(defaultPlotType || PLOT_TYPES.SCATTERPLOT);
  }, [defaultPlotType]);

  const LgBreakpoint = useMediaQuery(BREAKPOINTS.LG);
  const XlBreakpoint = useMediaQuery(BREAKPOINTS.XL);
  const showObsBtn = LgBreakpoint;
  const showVarsBtn = XlBreakpoint;
  const showPlotBtn = showVarsBtn;

  const { plotControls, varMode, showSelectedAsActive } = {
    [PLOT_TYPES.SCATTERPLOT]: {
      plotControls: ScatterplotControls,
      varMode: SELECTION_MODES.SINGLE,
      showSelectedAsActive: false,
    },
    [PLOT_TYPES.DOTPLOT]: {
      plotControls: DotplotControls,
      varMode: SELECTION_MODES.MULTIPLE,
      showSelectedAsActive: true,
    },
    [PLOT_TYPES.MATRIXPLOT]: {
      plotControls: MatrixplotControls,
      varMode: SELECTION_MODES.MULTIPLE,
      showSelectedAsActive: true,
    },
    [PLOT_TYPES.HEATMAP]: {
      plotControls: HeatmapControls,
      varMode: SELECTION_MODES.MULTIPLE,
      showSelectedAsActive: true,
    },
    [PLOT_TYPES.VIOLINPLOT]: {
      plotControls: ViolinControls,
      varMode: SELECTION_MODES.MULTIPLE,
      showSelectedAsActive: false,
    },
  }[plotType];

  const plot = useMemo(() => {
    const commonProps = {
      showObsBtn,
      showVarsBtn,
      showCtrlsBtn: true,
      setShowObs,
      setShowVars,
      setShowControls,
    };

    switch (plotType) {
      case PLOT_TYPES.DOTPLOT:
        return <Dotplot {...commonProps} />;
      case PLOT_TYPES.MATRIXPLOT:
        return <Matrixplot {...commonProps} />;
      case PLOT_TYPES.HEATMAP:
        return <Heatmap {...commonProps} />;
      case PLOT_TYPES.VIOLINPLOT:
        return <Violin mode={VIOLIN_MODES.MULTIKEY} {...commonProps} />;
      case PLOT_TYPES.SCATTERPLOT:
      default:
        return <Scatterplot {...commonProps} isFullscreen={true} />;
    }
  }, [plotType, showObsBtn, showVarsBtn]);

  return (
    <div className="cherita-app">
      <DatasetProvider {...props}>
        <Container fluid className="cherita-app-container">
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsColsList
              {...props}
              showSelectedAsActive={showSelectedAsActive}
              showHistograms={varMode === SELECTION_MODES.SINGLE}
              showColor={varMode === SELECTION_MODES.SINGLE}
            />
          </div>
          <div className="cherita-app-canvas">
            {showPlotBtn && (
              <div className="px-3 py-2">
                <PlotTypeSelector
                  currentType={plotType}
                  onChange={(type) => setPlotType(type)}
                />
              </div>
            )}
            {plot}
          </div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Body>
                <div className="sidebar-plotselector">
                  <PlotTypeSelector
                    currentType={plotType}
                    onChange={(type) => setPlotType(type)}
                  />
                </div>
                {plotType === PLOT_TYPES.SCATTERPLOT && isPseudospatial ? (
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
                <div className="sidebar-features">
                  <SearchBar searchDiseases={searchDiseases} searchVar={true} />
                  <div className="sidebar-features-list">
                    <VarNamesList mode={varMode} />
                  </div>
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
          <OffcanvasObs
            {...props}
            showSelectedAsActive={showSelectedAsActive}
            show={showObs}
            handleClose={() => setShowObs(false)}
          />
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

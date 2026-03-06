import { useEffect, useMemo, useState } from 'react';

import { Card, Container, Modal } from 'react-bootstrap';

import { Dotplot } from '../../components/dotplot/Dotplot';
import { DotplotControls } from '../../components/dotplot/DotplotControls';
import { Heatmap } from '../../components/heatmap/Heatmap';
import { HeatmapControls } from '../../components/heatmap/HeatmapControls';
import { Matrixplot } from '../../components/matrixplot/Matrixplot';
import { MatrixplotControls } from '../../components/matrixplot/MatrixplotControls';
import {
  OffcanvasControls,
  OffcanvasObsm,
} from '../../components/offcanvas/OffCanvas';
import { PlotTypeSelector } from '../../components/plot/PlotTypeSelector';
import { Pseudospatial } from '../../components/pseudospatial/Pseudospatial';
import { PseudospatialToolbar } from '../../components/pseudospatial/PseudospatialToolbar';
import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { ScatterplotControls } from '../../components/scatterplot/ScatterplotControls';
import { Violin } from '../../components/violin/Violin';
import { ViolinControls } from '../../components/violin/ViolinControls';
import {
  PLOT_TYPES,
  SELECTION_MODES,
  VIOLIN_MODES,
} from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { useObsSideBar, useVarSideBar } from '../../utils/hooks';

export function StandardView({
  searchDiseases = true,
  defaultPlotType = PLOT_TYPES.SCATTERPLOT,
  isPseudospatial = false,
  ...props
}) {
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [plotType, setPlotType] = useState(
    defaultPlotType || PLOT_TYPES.SCATTERPLOT,
  );
  const [showPseudospatialControls, setShowPseudospatialControls] =
    useState(false);
  const [pseudospatialPlotType, setpseudospatialPlotType] = useState(null);

  useEffect(() => {
    setPlotType(defaultPlotType || PLOT_TYPES.SCATTERPLOT);
  }, [defaultPlotType]);

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

  const {
    ObsSideBar,
    showCategoriesBtn,
    setShowOffcanvas: setShowCategories,
  } = useObsSideBar({
    isFullscreen: true,
    showSelectedAsActive,
    showHistograms: varMode === SELECTION_MODES.SINGLE,
    showColor: varMode === SELECTION_MODES.SINGLE,
    ...props,
  });

  const {
    VarSideBar,
    showSearchBtn,
    setShowOffcanvas: setShowSearch,
  } = useVarSideBar({
    isFullscreen: true,
    searchVar: true,
    searchDiseases,
    mode: varMode,
    ...props,
  });

  const plot = useMemo(() => {
    const commonProps = {
      plotType,
      isFullscreen: true,
      setShowCategories,
      setShowSearch,
      setShowControls,
      setPlotType,
      showCategoriesBtn,
      showSearchBtn,
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
        return <Scatterplot {...commonProps} />;
    }
  }, [
    plotType,
    setShowCategories,
    setShowSearch,
    showCategoriesBtn,
    showSearchBtn,
  ]);

  return (
    <div className="cherita-app">
      <DatasetProvider {...props}>
        <Container fluid className="cherita-app-container">
          <div className="cherita-app-obs modern-scrollbars border-end h-100">
            <ObsSideBar />
          </div>
          <div className="cherita-app-canvas">{plot}</div>
          <div className="cherita-app-sidebar p-3">
            <Card>
              <Card.Body>
                <div className="plotselector">
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
                <VarSideBar />
              </Card.Body>
            </Card>
          </div>
        </Container>
        <div>
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body></Modal.Body>
          </Modal>
          {plotControls && (
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={plotControls}
            />
          )}
          <OffcanvasObsm
            show={showEmbeddings}
            handleClose={() => setShowEmbeddings(false)}
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

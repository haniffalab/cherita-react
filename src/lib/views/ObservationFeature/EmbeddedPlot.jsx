import { useState, useMemo } from 'react';

import { Dotplot } from '../../components/dotplot/Dotplot';
import { DotplotControls } from '../../components/dotplot/DotplotControls';
import { Heatmap } from '../../components/heatmap/Heatmap';
import { HeatmapControls } from '../../components/heatmap/HeatmapControls';
import { Matrixplot } from '../../components/matrixplot/Matrixplot';
import { MatrixplotControls } from '../../components/matrixplot/MatrixplotControls';
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
  OffcanvasObsExplorer,
} from '../../components/offcanvas/OffCanvas';
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

export function EmbeddedPlot({
  plotType = PLOT_TYPES.SCATTERPLOT,
  canOverrideSettings = false,
  showCategoriesBtn = true,
  showSearchBtn = true,
  showCtrlsBtn = true,
  ...props
}) {
  const [showCategories, setShowCategories] = useState(false);
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showObsExplorer, setShowObsExplorer] = useState(false);

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
      plotType,
      setShowCategories,
      setShowSearch,
      setShowControls,
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
  }, [plotType, showCategoriesBtn, showSearchBtn]);

  return (
    <DatasetProvider canOverrideSettings={false} {...props}>
      {plot}
      <OffcanvasObs
        {...props}
        showSelectedAsActive={showSelectedAsActive}
        show={showCategories}
        handleClose={() => setShowCategories(false)}
      />
      <OffcanvasVars
        {...props}
        show={showSearch}
        handleClose={() => setShowSearch(false)}
        mode={varMode}
      />
      <OffcanvasObsExplorer
        show={showObsExplorer}
        handleClose={() => setShowObsExplorer(false)}
        mode={SELECTION_MODES.SINGLE}
      />
      {plotControls && (
        <OffcanvasControls
          {...props}
          show={showControls}
          handleClose={() => setShowControls(false)}
          Controls={plotControls}
        />
      )}
      <OffcanvasObsm
        {...props}
        show={showEmbeddings}
        handleClose={() => setShowEmbeddings(false)}
      />
    </DatasetProvider>
  );
}

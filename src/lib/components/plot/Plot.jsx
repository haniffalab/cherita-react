import { useState } from 'react';

import {
  PLOT_TYPES,
  SELECTION_MODES,
  VIOLIN_MODES,
} from '../../constants/constants';
import { DatasetProvider } from '../../context/DatasetContext';
import { Dotplot } from '../dotplot/Dotplot';
import { DotplotControls } from '../dotplot/DotplotControls';
import { Heatmap } from '../heatmap/Heatmap';
import { HeatmapControls } from '../heatmap/HeatmapControls';
import { Matrixplot } from '../matrixplot/Matrixplot';
import { MatrixplotControls } from '../matrixplot/MatrixplotControls';
import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsm,
  OffcanvasVars,
} from '../offcanvas';
import { Scatterplot } from '../scatterplot/Scatterplot';
import { ScatterplotControls } from '../scatterplot/ScatterplotControls';
import { Violin } from '../violin/Violin';
import { ViolinControls } from '../violin/ViolinControls';

export function Plot({
  plotType = PLOT_TYPES.SCATTERPLOT,
  showObsBtn = true,
  showVarsBtn = true,
  showCtrlsBtn = true,
  ...props
}) {
  const [showObs, setShowObs] = useState(false);
  const [showObsm, setShowObsm] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);

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

  const commonProps = {
    showObsBtn,
    showVarsBtn,
    showCtrlsBtn,
    plotType,
    setShowObs,
    setShowVars,
    setShowControls,
  };

  const plot = () => {
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
  };

  return (
    <DatasetProvider canOverrideSettings={false} {...props}>
      {plot()}
      <OffcanvasObs
        {...props}
        showSelectedAsActive={showSelectedAsActive}
        show={showObs}
        handleClose={() => setShowObs(false)}
      />
      <OffcanvasVars
        {...props}
        show={showVars}
        handleClose={() => setShowVars(false)}
        mode={varMode}
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
        show={showObsm}
        handleClose={() => setShowObsm(false)}
      />
    </DatasetProvider>
  );
}

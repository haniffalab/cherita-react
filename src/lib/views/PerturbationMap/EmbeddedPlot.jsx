import { useState } from 'react';

import {
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasObsExplorer,
  OffcanvasObsm,
} from '../../components/offcanvas/OffCanvas';
import { Scatterplot } from '../../components/scatterplot/Scatterplot';
import { ScatterplotControls } from '../../components/scatterplot/ScatterplotControls';
import { DatasetProvider } from '../../context/DatasetContext';

export function EmbeddedPlot({ showCtrlsBtn = true, ...props }) {
  const [showCategories, setShowCategories] = useState(false);
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const commonProps = {
    setShowCategories,
    setShowSearch,
    setShowControls,
    ...props,
  };

  return (
    <DatasetProvider canOverrideSettings={false} {...props}>
      <Scatterplot {...commonProps} />
      <OffcanvasObs
        {...props}
        showSelectedAsActive={false}
        show={showCategories}
        handleClose={() => setShowCategories(false)}
      />
      <OffcanvasObsExplorer
        {...props}
        show={showSearch}
        handleClose={() => setShowSearch(false)}
      />
      <OffcanvasControls
        {...props}
        show={showControls}
        handleClose={() => setShowControls(false)}
        Controls={ScatterplotControls}
      />
      <OffcanvasObsm
        {...props}
        show={showEmbeddings}
        handleClose={() => setShowEmbeddings(false)}
      />
    </DatasetProvider>
  );
}

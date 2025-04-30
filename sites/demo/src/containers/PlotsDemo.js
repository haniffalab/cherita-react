import React from "react";

import {
  FullPage,
  FullPagePlots,
  Dotplot,
  Heatmap,
  Matrixplot,
  Violin,
  SELECTION_MODES,
  VIOLIN_MODES,
} from "@haniffalab/cherita-react";

export function PlotsDemo(props) {
  return <FullPagePlots {...props} />;
}

export function FullPageDotplot(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      renderItem={() => <Dotplot />}
    />
  );
}

export function FullPageHeatmap(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      renderItem={() => <Heatmap />}
    />
  );
}

export function FullPageMatrixplot(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      renderItem={() => <Matrixplot />}
    />
  );
}

export function FullPageViolin(props) {
  return (
    <FullPage
      {...props}
      varMode={SELECTION_MODES.MULTIPLE}
      renderItem={() => <Violin mode={VIOLIN_MODES.MULTIKEY} />}
    />
  );
}

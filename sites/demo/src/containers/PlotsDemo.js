import React from "react";

import {
  FullPage,
  FullPagePlots,
  Dotplot,
  SELECTION_MODES,
} from "@haniffalab/cherita-react";

export function PlotsDemo(props) {
  return <FullPagePlots {...props} />;
}

export function FullPageDotplot(props) {
  return (
    <FullPage {...props} varMode={SELECTION_MODES.MULTIPLE}>
      <Dotplot />
    </FullPage>
  );
}

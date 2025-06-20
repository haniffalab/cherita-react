import React, { useState } from "react";

import {
  DatasetProvider,
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasVars,
  Scatterplot,
  ScatterplotControls,
  SELECTION_MODES,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";

export default function ScatterplotDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="h-100">
      <Container>
        <div className="cherita-container">
          <DatasetProvider {...props}>
            <div className="cherita-container-scatterplot">
              <Scatterplot
                setShowObs={setShowObs}
                setShowVars={setShowVars}
                isFullscreen={false}
              />
            </div>
            <OffcanvasObs
              show={showObs}
              handleClose={() => setShowObs(false)}
            />
            <OffcanvasVars
              show={showVars}
              handleClose={() => setShowVars(false)}
              mode={SELECTION_MODES.SINGLE}
            />
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={ScatterplotControls}
            />
          </DatasetProvider>
        </div>
      </Container>
    </div>
  );
}

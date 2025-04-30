import React, { useState } from "react";

import {
  DatasetProvider,
  OffcanvasControls,
  OffcanvasObs,
  OffcanvasVars,
  Scatterplot,
  ScatterplotControls,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";

export default function ScatterplotDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
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
          <OffcanvasObs show={showObs} handleClose={() => setShowObs(false)} />
          <OffcanvasVars
            show={showVars}
            handleClose={() => setShowVars(false)}
            mode="single"
          />
          <OffcanvasControls
            show={showControls}
            handleClose={() => setShowControls(false)}
            Controls={ScatterplotControls}
          />
        </DatasetProvider>
      </div>
    </Container>
  );
}

import React, { useState } from "react";

import {
  DatasetProvider,
  Violin,
  ViolinControls,
  OffcanvasObs,
  OffcanvasVars,
  OffcanvasControls,
  Toolbar,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";

export default function ViolinDemo(props) {
  const [showObs, setShowObs] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="h-100">
      <Container>
        <div className="cherita-container">
          <DatasetProvider {...props}>
            <Toolbar
              setShowObs={setShowObs}
              setShowVars={setShowVars}
              setShowControls={setShowControls}
            />
            <div className="cherita-container-plot">
              <Violin />
            </div>
            <OffcanvasObs
              show={showObs}
              handleClose={() => setShowObs(false)}
              showColor={false}
            />
            <OffcanvasVars
              show={showVars}
              handleClose={() => setShowVars(false)}
            />
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={ViolinControls}
            />
          </DatasetProvider>
        </div>
      </Container>
    </div>
  );
}

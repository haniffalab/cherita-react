import { useState } from "react";

import {
  DatasetProvider,
  Matrixplot,
  MatrixplotControls,
  OffcanvasObs,
  OffcanvasVars,
  OffcanvasControls,
  Toolbar,
} from "@haniffalab/cherita-react";
import Container from "react-bootstrap/Container";

export default function MatrixplotDemo(props) {
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
              <Matrixplot />
            </div>
            <OffcanvasObs
              show={showObs}
              handleClose={() => setShowObs(false)}
              showColor={false}
              showSelectedAsActive={true}
            />
            <OffcanvasVars
              show={showVars}
              handleClose={() => setShowVars(false)}
            />
            <OffcanvasControls
              show={showControls}
              handleClose={() => setShowControls(false)}
              Controls={MatrixplotControls}
            />
          </DatasetProvider>
        </div>
      </Container>
    </div>
  );
}

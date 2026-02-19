import { PerturbationMap } from '@haniffalab/cherita-react';
import Container from 'react-bootstrap/Container';

export default function PerturbationMapEmbeddedPlotDemo(props) {
  return (
    <div className="h-100">
      <Container>
        <div className="cherita-container">
          <PerturbationMap.EmbeddedPlot {...props} />
        </div>
      </Container>
    </div>
  );
}

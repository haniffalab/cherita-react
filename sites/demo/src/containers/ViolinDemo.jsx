import { ObservationFeature, PLOT_TYPES } from '@haniffalab/cherita-react';
import Container from 'react-bootstrap/Container';

export default function ViolinDemo(props) {
  const plotType = PLOT_TYPES.VIOLINPLOT;
  return (
    <div className="h-100">
      <Container>
        <div className="cherita-container">
          <ObservationFeature.EmbeddedPlot plotType={plotType} {...props} />
        </div>
      </Container>
    </div>
  );
}

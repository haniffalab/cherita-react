import { ObservationFeature, PLOT_TYPES } from '@haniffalab/cherita-react';
import Container from 'react-bootstrap/Container';

export default function DotplotDemo(props) {
  const plotType = PLOT_TYPES.DOTPLOT;
  return (
    <div className="h-100">
      <Container>
        <div className="cherita-container">
          <ObservationFeature.EmbeddedPlot
            plotType={plotType}
            showPlotControls={false}
            {...props}
          />
        </div>
      </Container>
    </div>
  );
}

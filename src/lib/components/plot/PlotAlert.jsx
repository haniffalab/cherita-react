import { useMediaQuery } from '@mui/material';
import { Alert } from 'react-bootstrap';

import { PlotTypeSelector } from './PlotTypeSelector';
import { BREAKPOINTS, PLOT_TYPES } from '../../constants/constants';

export function PlotAlert({
  variant = 'warning',
  plotType = PLOT_TYPES.SCATTERPLOT,
  setPlotType,
  heading,
  children,
}) {
  const XlBreakpoint = useMediaQuery(BREAKPOINTS.XL);
  const showPlotSelector = XlBreakpoint;

  return (
    <>
      {showPlotSelector && (
        <div className="plotselector">
          <PlotTypeSelector
            currentType={plotType}
            onChange={(type) => {
              if (setPlotType) setPlotType(type);
            }}
          />
        </div>
      )}
      <div className="cherita-plot-alert h-100">
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <Alert
            variant={variant}
            className="m-0 my-3 w-75 w-lg-50 text-center"
          >
            {heading && <Alert.Heading>{heading}</Alert.Heading>} {children}
          </Alert>
        </div>
      </div>
    </>
  );
}

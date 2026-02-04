// utils/usePlotlySetup.js
import { useMemo } from 'react';

export default function usePlotlySetup({
  layout,
  showPlotControls = true,
  colorscale,
  modeBarButtons,
}) {
  return useMemo(() => {
    // Adjust layout margins if controls are hidden
    const updatedLayout = {
      ...layout,
      margin: {
        ...layout.margin,
        t: showPlotControls ? (layout.margin?.t ?? 100) : 24,
      },
      coloraxis: {
        ...(layout.coloraxis || {}),
        ...(colorscale ? { colorscale } : {}),
      },
    };

    // Plotly config
    const config = {
      displaylogo: false,
      displayModeBar: showPlotControls,
      ...(showPlotControls && modeBarButtons ? { modeBarButtons } : {}),
    };

    return { layout: updatedLayout, config };
  }, [layout, showPlotControls, colorscale, modeBarButtons]);
}

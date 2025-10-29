import {
  SparkLineChart,
  mangoFusionPalette,
  blueberryTwilightPalette,
} from '@mui/x-charts';
import _ from 'lodash';

import { LoadingLinear } from './LoadingIndicators';
import { formatNumerical, FORMATS } from './string';

export function Histogram({ data, isPending, altColor = false }) {
  return (
    <div className="feature-histogram-container">
      {isPending ? (
        <LoadingLinear />
      ) : data ? (
        <div className="feature-histogram m-1">
          <SparkLineChart
            plotType="bar"
            data={data.log10}
            margin={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
            colors={altColor ? mangoFusionPalette : blueberryTwilightPalette}
            showHighlight={true}
            showTooltip={true}
            valueFormatter={(v, { dataIndex }) =>
              `${formatNumerical(data.hist[dataIndex])}`
            }
            xAxis={{
              data: _.range(data.bin_edges?.length) || null,
              valueFormatter: (v) =>
                `Bin [${formatNumerical(
                  data.bin_edges[v][0],
                  FORMATS.EXPONENTIAL,
                )}, ${formatNumerical(data.bin_edges[v][1], FORMATS.EXPONENTIAL)}${
                  v === data.bin_edges.length - 1 ? ']' : ')'
                }`,
            }}
            slotProps={{
              popper: {
                className: 'feature-histogram-tooltip',
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

import React from "react";

import { SparkLineChart } from "@mui/x-charts";
import Table from "react-bootstrap/Table";

import { useDataset } from "../../context/DatasetContext";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

function ObsDistribution({ item }) {
  const ENDPOINT = "obs/distribution";
  const dataset = useDataset();
  const params = {
    url: dataset.url,
    obs_colname: item.name,
  };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params);

  return (
    <>
      {isPending && <LoadingLinear />}
      {!serverError && fetchedData && (
        <div className="obs-distribution">
          <SparkLineChart
            data={fetchedData.kde_values[1]}
            showHighlight={true}
            showTooltip={true}
            margin={{
              top: 10,
              right: 20,
              bottom: 10,
              left: 20,
            }}
            xAxis={{
              data: fetchedData.kde_values[0],
              valueFormatter: (v) => `${v.toLocaleString()}`,
            }}
            valueFormatter={(v) => `${v.toLocaleString()}`}
            slotProps={{
              popper: {
                className: "feature-histogram-tooltip",
              },
            }}
          />
        </div>
      )}
    </>
  );
}

export function ObsContinuousItem({ item }) {
  return (
    <>
      <ObsDistribution item={item} />
      <div className="flex w-100">
        <div className="row">
          <div className="col-6">
            <Table
              striped
              borderless
              size="sm"
              className="obs-continuous-stats"
            >
              <tbody>
                <tr>
                  <td>Min</td>
                  <td className="text-end">{item.min.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Max</td>
                  <td className="text-end">{item.max.toLocaleString()}</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="col-6">
            <Table
              striped
              borderless
              size="sm"
              className="obs-continuous-stats"
            >
              <tbody>
                <tr>
                  <td>Mean</td>
                  <td className="text-end">{item.mean.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Median</td>
                  <td className="text-end">{item.median.toLocaleString()}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

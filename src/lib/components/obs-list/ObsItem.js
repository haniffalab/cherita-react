import React, { useEffect } from "react";

import { Tooltip } from "@mui/material";
import { Gauge, SparkLineChart } from "@mui/x-charts";
import _ from "lodash";
import { ListGroup, Form, Badge, Table } from "react-bootstrap";

import { ObsToolbar } from "./ObsToolbar";
import { OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useColor } from "../../helpers/color-helper";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";
import { VirtualizedList } from "../../utils/VirtualizedList";

const N_BINS = 5;

function binContinuous(data, nBins = N_BINS) {
  const binSize = (data.max - data.min) * (1 / nBins);
  const thresholds = _.range(nBins + 1).map((b) => {
    return data.min + binSize * b;
  });
  const binEdges = _.range(thresholds.length - 1).map((i) => [
    thresholds[i],
    thresholds[i + 1],
  ]);
  const bins = {
    nBins: nBins,
    binSize: binSize,
    thresholds: thresholds,
    binEdges: binEdges,
  };
  return { ...data, bins: bins };
}

function binDiscrete(data, nBins = N_BINS) {
  const binSize = _.round(data.n_values * (1 / nBins));
  const bins = {
    nBins: nBins,
    binSize: binSize,
  };
  return { ...data, bins: bins };
}

function CategoricalItem({
  data,
  index,
  totalCounts,
  min,
  max,
  onChange,
  showColor = true,
}) {
  const value = data.values[index];
  const pct = (data.value_counts[value] / totalCounts) * 100;
  let label = value;
  if (data.type === OBS_TYPES.CONTINUOUS && data.codes[value] !== -1) {
    label = `[ ${data.bins.binEdges[
      data.codes[value]
    ][0].toLocaleString()}, ${data.bins.binEdges[
      data.codes[value]
    ][1].toLocaleString()}${
      data.codes[value] === data.bins.binEdges.length - 1 ? " ]" : " )"
    }`;
  }

  const { getColor } = useColor();

  return (
    <ListGroup.Item key={value}>
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <Form.Check
            className="obs-value-list-check"
            type="switch"
            label={label}
            checked={!_.includes(data.omit, data.codes[value])}
            onChange={() => onChange(value)}
          />
        </div>
        <div className="d-flex align-items-center">
          <div className="pl-1 m-0">
            <Tooltip title={`${pct.toLocaleString()}%`} placement="left" arrow>
              <div className="d-flex align-items-center">
                <Badge
                  className="value-count-badge"
                  style={{ fontWeight: "lighter" }}
                >
                  {parseInt(data.value_counts[value]).toLocaleString()}
                </Badge>
                <div className="value-pct-gauge-container">
                  <Gauge
                    value={pct}
                    text={null}
                    innerRadius={"50%"}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  />
                </div>
              </div>
            </Tooltip>
          </div>
          {showColor && (
            <div className="pl-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="currentColor"
                viewBox="0 0 10 10"
              >
                <rect
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  fill={`rgb(${getColor(
                    (data.codes[value] - min) / (max - min),
                    true,
                    _.includes(data.omit, data.codes[value]),
                    { alpha: 1 },
                    "obs"
                  )})`}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
}

export function CategoricalObs({
  obs,
  updateObs,
  toggleAll,
  toggleObs,
  toggleLabel,
  toggleSlice,
  toggleColor,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const totalCounts = _.sum(_.values(obs.value_counts));
  const min = _.min(_.values(obs.codes));
  const max = _.max(_.values(obs.codes));

  useEffect(() => {
    if (dataset.selectedObs?.name === obs.name) {
      const selectedObsData = _.omit(dataset.selectedObs, ["omit"]);
      const obsData = _.omit(obs, ["omit"]);
      if (!_.isEqual(selectedObsData, obsData)) {
        // outdated selectedObs
        dispatch({
          type: "select.obs",
          obs: obs,
        });
      } else if (!_.isEqual(dataset.selectedObs.omit, obs.omit)) {
        updateObs({ ...obs, omit: dataset.selectedObs.omit });
      }
    }
  }, [dataset.selectedObs, dispatch, obs, obs.name, updateObs]);

  return (
    <ListGroup>
      <ListGroup.Item>
        <ObsToolbar
          item={obs}
          onToggleAllObs={toggleAll}
          onToggleLabel={toggleLabel}
          onToggleSlice={toggleSlice}
          onToggleColor={toggleColor}
        />
      </ListGroup.Item>
      <VirtualizedList
        data={obs}
        count={obs.values.length}
        ItemComponent={CategoricalItem}
        totalCounts={totalCounts}
        min={min}
        max={max}
        onChange={toggleObs}
      />
    </ListGroup>
  );
}

function ObsContinuousStats({ obs }) {
  const ENDPOINT = "obs/distribution";
  const dataset = useDataset();
  const params = {
    url: dataset.url,
    obs_colname: obs.name,
  };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params);

  // @TODO: fix width issue when min/max/etc values are too large
  return (
    <>
      <div className="d-flex justify-content-between mt-3 align-items-center">
        <Table size="sm" className="obs-continuous-stats" striped>
          <tbody>
            <tr>
              <td>Min</td>
              <td className="text-end">{obs.min.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Max</td>
              <td className="text-end">{obs.max.toLocaleString()}</td>
            </tr>
          </tbody>
        </Table>
        <Table size="sm" className="obs-continuous-stats" striped>
          <tbody>
            <tr>
              <td>Mean</td>
              <td className="text-end">{obs.mean.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Median</td>
              <td className="text-end">{obs.median.toLocaleString()}</td>
            </tr>
          </tbody>
        </Table>
        {isPending && <LoadingLinear />}
        {!isPending && !serverError && (
          <div className="obs-distribution">
            <SparkLineChart
              data={fetchedData.kde_values[1]}
              showHighlight={true}
              showTooltip={true} // throws Maximum update depth exceeded error. Documented here: https://github.com/mui/mui-x/issues/13450
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
              valueFormatter={(v) =>
                `${
                  v !== 0 && v < 0.0001
                    ? v.toExponential(2)
                    : v.toLocaleString()
                }`
              }
              slotProps={{
                popper: {
                  className: "feature-histogram-tooltip",
                },
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export function ContinuousObs({
  obs,
  updateObs,
  toggleAll,
  toggleObs,
  toggleLabel,
  toggleSlice,
  toggleColor,
}) {
  const ENDPOINT = "obs/bins";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const binnedObs = binContinuous(obs);
  const params = {
    url: dataset.url,
    obs_col: binnedObs.name,
    thresholds: binnedObs.bins.thresholds,
    nBins: binnedObs.bins.nBins,
  };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  const updatedObs = fetchedData && _.isMatch(obs, fetchedData);

  useEffect(() => {
    // Update ObsList obsCols with bin data
    // after update -> re-render -> obs will already be updated
    if (!isPending && !serverError && !_.isMatch(obs, fetchedData)) {
      updateObs({ ...binnedObs, ...fetchedData });
    }
  }, [binnedObs, fetchedData, isPending, obs, serverError, updateObs]);

  useEffect(() => {
    if (updatedObs && dataset.selectedObs?.name === obs.name) {
      const selectedObsData = _.omit(dataset.selectedObs, ["omit"]);
      const obsData = _.omit(obs, ["omit"]);
      if (!_.isEqual(selectedObsData, obsData)) {
        // outdated selectedObs
        dispatch({
          type: "select.obs",
          obs: obs,
        });
      } else if (!_.isEqual(dataset.selectedObs.omit, obs.omit)) {
        updateObs({ ...obs, omit: dataset.selectedObs.omit });
      }
    }
  }, [dataset.selectedObs, dispatch, obs, obs.name, updateObs, updatedObs]);

  const totalCounts = _.sum(_.values(obs?.value_counts));
  const min = _.min(_.values(obs?.codes));
  const max = _.max(_.values(obs?.codes));

  return (
    <>
      {isPending && <LoadingLinear />}
      {!serverError && updatedObs && (
        <>
          <ListGroup>
            <ListGroup.Item>
              <ObsToolbar
                item={obs}
                onToggleAllObs={toggleAll}
                onToggleLabel={toggleLabel}
                onToggleSlice={toggleSlice}
                onToggleColor={toggleColor}
              />
            </ListGroup.Item>
            <VirtualizedList
              data={obs}
              count={obs.values.length}
              ItemComponent={CategoricalItem}
              totalCounts={totalCounts}
              min={min}
              max={max}
              onChange={toggleObs}
              showColor={false}
            />
          </ListGroup>
          <ObsContinuousStats obs={obs} />
        </>
      )}
    </>
  );
}

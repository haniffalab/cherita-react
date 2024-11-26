import React, { useCallback, useEffect, useState } from "react";

import { Tooltip } from "@mui/material";
import { Gauge, SparkLineChart } from "@mui/x-charts";
import _ from "lodash";
import { ListGroup, Form, Badge, Table } from "react-bootstrap";

import { ObsToolbar } from "./ObsToolbar";
import { COLOR_ENCODINGS } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { useColor } from "../../helpers/color-helper";
import { Histogram } from "../../utils/Histogram";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";
import { formatNumerical, FORMATS } from "../../utils/string";
import { VirtualizedList } from "../../utils/VirtualizedList";

const N_BINS = 5;

function binContinuous(data, nBins) {
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

function getContinuousLabel(code, binEdges) {
  return `[ ${formatNumerical(binEdges[code][0])}, ${formatNumerical(
    binEdges[code][1],
    FORMATS.EXPONENTIAL
  )}${code === binEdges.length - 1 ? " ]" : " )"}`;
}

const useObsHistogram = (obs) => {
  const ENDPOINT = "obs/histograms";
  const dataset = useDataset();
  const { obsIndices } = useFilteredData();
  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;
  const [params, setParams] = useState({
    url: dataset.url,
    obsCol: _.omit(obs, "omit"), // avoid re-rendering when toggling unselected obs
    varKey: dataset.selectedVar?.isSet
      ? {
          name: dataset.selectedVar?.name,
          indices: dataset.selectedVar?.vars.map((v) => v.index),
        }
      : dataset.selectedVar?.index,
    obsIndices: isSliced ? [...(obsIndices || [])] : null,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        obsCol: _.omit(obs, "omit"),
        varKey: dataset.selectedVar?.isSet
          ? {
              name: dataset.selectedVar?.name,
              indices: dataset.selectedVar?.vars.map((v) => v.index),
            }
          : dataset.selectedVar?.index,
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
      };
    });
  }, [
    dataset.selectedVar?.index,
    dataset.selectedVar?.isSet,
    dataset.selectedVar?.name,
    dataset.selectedVar?.vars,
    obsIndices,
    isSliced,
    obs,
  ]);

  return useFetch(ENDPOINT, params, {
    enabled:
      !!dataset.selectedVar && dataset.colorEncoding === COLOR_ENCODINGS.VAR,
    refetchOnMount: false,
  });
};

function CategoricalItem({
  value,
  label,
  code,
  value_counts,
  pct,
  isOmitted,
  min,
  max,
  onChange,
  histogramData = { data: null, isPending: false, altColor: false },
  showColor = true,
}) {
  const { getColor } = useColor();

  return (
    <ListGroup.Item key={value} className="obs-item">
      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <Form.Check
            className="obs-value-list-check"
            type="switch"
            label={label}
            checked={!isOmitted}
            onChange={() => onChange(value)}
          />
        </div>
        <div className="d-flex align-items-center">
          <Histogram
            data={histogramData.data}
            isPending={histogramData.isPending}
            altColor={histogramData.altColor}
          />
          <div className="pl-1 m-0">
            <Tooltip
              title={`${formatNumerical(pct, FORMATS.EXPONENTIAL)}%`}
              placement="left"
              arrow
            >
              <div className="d-flex align-items-center">
                <Badge
                  className="value-count-badge"
                  style={{ fontWeight: "lighter" }}
                >
                  {formatNumerical(parseInt(value_counts), FORMATS.EXPONENTIAL)}
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
          {showColor ? (
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
                  fill={`rgb(${getColor({
                    value: (code - min) / (max - min),
                    categorical: true,
                    grayOut: isOmitted,
                    grayParams: { alpha: 1 },
                    colorEncoding: "obs",
                  })})`}
                />
              </svg>
            </div>
          ) : null}
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
  showColor = true,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const totalCounts = _.sum(_.values(obs.value_counts));
  const min = _.min(_.values(obs.codes));
  const max = _.max(_.values(obs.codes));

  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;

  const obsHistograms = useObsHistogram(obs);

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

  const getDataAtIndex = useCallback(
    (index) => {
      return {
        value: obs.values[index],
        code: obs.codes[obs.values[index]],
        value_counts: obs.value_counts[obs.values[index]],
        pct: (obs.value_counts[obs.values[index]] / totalCounts) * 100,
        isOmitted: _.includes(obs.omit, obs.codes[obs.values[index]]),
        label: obs.values[index],
        histogramData:
          dataset.colorEncoding === COLOR_ENCODINGS.VAR
            ? {
                data: obsHistograms.fetchedData?.[obs.values[index]],
                isPending: obsHistograms.isPending,
                altColor: isSliced,
              }
            : { data: null, isPending: false },
      };
    },
    [
      dataset.colorEncoding,
      isSliced,
      obs.codes,
      obs.omit,
      obs.value_counts,
      obs.values,
      obsHistograms.fetchedData,
      obsHistograms.isPending,
      totalCounts,
    ]
  );

  showColor &= dataset.colorEncoding === COLOR_ENCODINGS.OBS;

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
        getDataAtIndex={getDataAtIndex}
        count={obs.values.length}
        ItemComponent={CategoricalItem}
        totalCounts={totalCounts}
        min={min}
        max={max}
        onChange={toggleObs}
        showColor={showColor}
      />
    </ListGroup>
  );
}

function ObsContinuousStats({ obs }) {
  const ENDPOINT = "obs/distribution";
  const dataset = useDataset();
  const params = {
    url: dataset.url,
    obsColname: obs.name,
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
              <td className="text-end">
                {formatNumerical(obs.min, FORMATS.EXPONENTIAL)}
              </td>
            </tr>
            <tr>
              <td>Max</td>
              <td className="text-end">
                {formatNumerical(obs.max, FORMATS.EXPONENTIAL)}
              </td>
            </tr>
          </tbody>
        </Table>
        <Table size="sm" className="obs-continuous-stats" striped>
          <tbody>
            <tr>
              <td>Mean</td>
              <td className="text-end">
                {formatNumerical(obs.mean, FORMATS.EXPONENTIAL)}
              </td>
            </tr>
            <tr>
              <td>Median</td>
              <td className="text-end">
                {formatNumerical(obs.median, FORMATS.EXPONENTIAL)}
              </td>
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
                valueFormatter: (v) =>
                  `${formatNumerical(v, FORMATS.EXPONENTIAL)}`,
              }}
              valueFormatter={(v) =>
                `${formatNumerical(v, FORMATS.EXPONENTIAL)}`
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
  const binnedObs = binContinuous(obs, _.min([N_BINS, obs.n_unique]));
  const params = {
    url: dataset.url,
    obsCol: binnedObs.name,
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
      updateObs({
        ...binnedObs,
        ...fetchedData,
        codesMap: _.invert(fetchedData.codes),
      });
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

  const getDataAtIndex = (index) => {
    return {
      value: obs.values[index],
      code: obs.codes[obs.values[index]],
      value_counts: obs.value_counts[obs.values[index]],
      pct: (obs.value_counts[obs.values[index]] / totalCounts) * 100,
      isOmitted: _.includes(obs.omit, obs.codes[obs.values[index]]),
      label: isNaN(obs.values[index])
        ? "NaN"
        : getContinuousLabel(obs.codes[obs.values[index]], obs.bins.binEdges),
    };
  };

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
              getDataAtIndex={getDataAtIndex}
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

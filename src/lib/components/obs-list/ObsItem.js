import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Tooltip } from "@mui/material";
import { Gauge, SparkLineChart } from "@mui/x-charts";
import _ from "lodash";
import { Badge, Form, ListGroup } from "react-bootstrap";

import { ObsToolbar } from "./ObsToolbar";
import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { useColor } from "../../helpers/color-helper";
import { Histogram } from "../../utils/Histogram";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";
import { formatNumerical, FORMATS } from "../../utils/string";
import { VirtualizedList } from "../../utils/VirtualizedList";
import { useObsData } from "../../utils/zarrData";

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
  const { obsIndices, isSliced } = useFilteredData();
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

const getBinIndex = (v, binEdges) => {
  const EPSILON = 1e-6;
  const lastEdge = _.last(binEdges);
  const allButLastEdges = _.initial(binEdges);
  const modifiedBinEdges = [
    ...allButLastEdges,
    [lastEdge[0], lastEdge[1] + EPSILON],
  ];

  return _.findIndex(modifiedBinEdges, (range) => _.inRange(v, ...range));
};

const useFilteredObsData = (obs) => {
  const { obsIndices } = useFilteredData();
  const obsData = useObsData(obs);

  const isCategorical =
    obs.type === OBS_TYPES.CATEGORICAL || obs.type === OBS_TYPES.BOOLEAN;

  const { valueCounts, pct } = useMemo(() => {
    const filteredObsValues = _.at(obsData.data, [...(obsIndices || [])]);
    let valueCounts = {};
    if (isCategorical) {
      valueCounts = _.countBy(filteredObsValues);
    } else {
      valueCounts = _.countBy(filteredObsValues, (v) => {
        return getBinIndex(v, obs.bins?.binEdges || [[null, null]]);
      });
    }

    valueCounts = _.mapKeys(valueCounts, (_v, i) => {
      return obs.codesMap[i];
    });

    const totalCounts = obsIndices?.size;
    const pct = _.mapValues(valueCounts, (v) => (v / totalCounts) * 100);

    return { valueCounts, pct };
  }, [
    isCategorical,
    obs.bins?.binEdges,
    obs.codesMap,
    obsData.data,
    obsIndices,
  ]);

  return { value_counts: valueCounts, pct: pct };
};

function CategoricalItem({
  value,
  label,
  code,
  stats = { value_counts: null, pct: null },
  isOmitted,
  min,
  max,
  onChange,
  histogramData = { data: null, isPending: false, altColor: false },
  filteredStats = { value_counts: null, pct: null },
  isSliced,
  showColor = true,
}) {
  const { getColor } = useColor();

  return (
    <div className="virtualized-list-wrapper">
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
            <div className="pl-1 m-0 flex-grow-1">
              <Histogram
                data={histogramData.data}
                isPending={histogramData.isPending}
                altColor={histogramData.altColor}
              />
            </div>
            <div className="pl-1 m-0">
              <Tooltip
                title={
                  isSliced ? (
                    <>
                      Filtered:{" "}
                      {formatNumerical(filteredStats.pct, FORMATS.EXPONENTIAL)}%
                      <br />
                      Total: {formatNumerical(stats.pct, FORMATS.EXPONENTIAL)}%
                    </>
                  ) : (
                    `${formatNumerical(stats.pct, FORMATS.EXPONENTIAL)}%`
                  )
                }
                placement="left"
                arrow
              >
                <div className="d-flex align-items-center">
                  <Badge className="value-count-badge">
                    {" "}
                    {isSliced && (
                      <>
                        {formatNumerical(parseInt(filteredStats.value_counts))}{" "}
                        out of{" "}
                      </>
                    )}
                    {formatNumerical(
                      parseInt(stats.value_counts),
                      FORMATS.EXPONENTIAL
                    )}
                  </Badge>
                  <div className="value-pct-gauge-container">
                    {isSliced ? (
                      <>
                        <Gauge
                          className="pct-gauge filtered-pct-gauge"
                          value={filteredStats.pct}
                          text={null}
                          innerRadius={"50%"}
                          outerRadius={"75%"}
                          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        />
                        <Gauge
                          className="pct-gauge"
                          value={stats.pct}
                          text={null}
                          innerRadius={"75%"}
                          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        />
                      </>
                    ) : (
                      <Gauge
                        value={stats.pct}
                        text={null}
                        innerRadius={"50%"}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                      />
                    )}
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
    </div>
  );
}

export function CategoricalObs({
  obs,
  toggleAll,
  toggleObs,
  showColor = true,
}) {
  const dataset = useDataset();
  const { isSliced } = useFilteredData();
  const totalCounts = _.sum(_.values(obs.value_counts));
  const min = _.min(_.values(obs.codes));
  const max = _.max(_.values(obs.codes));

  const obsHistograms = useObsHistogram(obs);
  const filteredObsData = useFilteredObsData(obs);

  const getDataAtIndex = useCallback(
    (index) => {
      return {
        value: obs.values[index],
        code: obs.codes[obs.values[index]],
        stats: {
          value_counts: obs.value_counts[obs.values[index]],
          pct: (obs.value_counts[obs.values[index]] / totalCounts) * 100,
        },
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
        filteredStats: {
          value_counts: filteredObsData?.value_counts[obs.values[index]] || 0,
          pct: filteredObsData?.pct[obs.values[index]] || 0,
        },
        isSliced: isSliced,
      };
    },
    [
      dataset.colorEncoding,
      filteredObsData?.pct,
      filteredObsData?.value_counts,
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
    <ListGroup variant="flush" className="cherita-list">
      <ListGroup.Item className="unstyled">
        <ObsToolbar item={obs} onToggleAllObs={toggleAll} />
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
        estimateSize={42}
      />
    </ListGroup>
  );
}

function ObsContinuousStats({ obs }) {
  const ENDPOINT = "obs/distribution";
  const dataset = useDataset();
  const params = { url: dataset.url, obsColname: obs.name };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params);

  // @TODO: fix width issue when min/max/etc values are too large
  return (
    <div className="obs-statistics">
      <h5 className="mb-2">Statistics</h5>
      <div className="row">
        <div className="col-md-7">
          <p className="mb-1 small">Distribution of continuous values</p>
          {isPending && <LoadingLinear />}
          {!isPending && !serverError && (
            <div className="obs-distribution">
              <SparkLineChart
                data={fetchedData.kde_values[1]}
                showHighlight={true}
                showTooltip={true}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                xAxis={{
                  data: fetchedData.kde_values[0],
                  valueFormatter: (v) =>
                    `${formatNumerical(v, FORMATS.EXPONENTIAL)}`,
                }}
                valueFormatter={(v) =>
                  `${formatNumerical(v, FORMATS.EXPONENTIAL)}`
                }
                slotProps={{
                  popper: { className: "feature-histogram-tooltip" },
                }}
              />
            </div>
          )}
        </div>
        <div className="col-md-5 d-flex flex-column text-end">
          <div className="d-flex justify-content-between">
            <span>Min</span>{" "}
            <span>{formatNumerical(obs.min, FORMATS.EXPONENTIAL)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Max</span>{" "}
            <span>{formatNumerical(obs.max, FORMATS.EXPONENTIAL)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Mean</span>{" "}
            <span>{formatNumerical(obs.mean, FORMATS.EXPONENTIAL)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Median</span>{" "}
            <span>{formatNumerical(obs.median, FORMATS.EXPONENTIAL)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// @TODO: add bin controls
// @TODO: add histogram
export function ContinuousObs({ obs, toggleAll, toggleObs }) {
  const { isSliced } = useFilteredData();
  const totalCounts = _.sum(_.values(obs.value_counts));
  const min = _.min(_.values(obs.codes));
  const max = _.max(_.values(obs.codes));

  const filteredObsData = useFilteredObsData(obs);

  const getDataAtIndex = (index) => {
    return {
      value: obs.values[index],
      code: obs.codes[obs.values[index]],
      stats: {
        value_counts: obs.value_counts[obs.values[index]],
        pct: (obs.value_counts[obs.values[index]] / totalCounts) * 100,
      },
      isOmitted: _.includes(obs.omit, obs.codes[obs.values[index]]),
      label: isNaN(obs.values[index])
        ? "NaN"
        : getContinuousLabel(obs.codes[obs.values[index]], obs.bins.binEdges),
      filteredStats: {
        value_counts: filteredObsData?.value_counts[obs.values[index]] || 0,
        pct: filteredObsData?.pct[obs.values[index]] || 0,
      },
      isSliced: isSliced,
    };
  };

  return (
    <>
      <ListGroup variant="flush" className="cherita-list">
        <ListGroup.Item className="unstyled">
          <ObsToolbar item={obs} onToggleAllObs={toggleAll} />
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
  );
}

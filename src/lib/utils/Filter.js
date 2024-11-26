import { useEffect, useCallback, useMemo } from "react";

import { booleanPointInPolygon, point } from "@turf/turf";
import _ from "lodash";

import { COLOR_ENCODINGS, OBS_TYPES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useFilteredDataDispatch } from "../context/FilterContext";

const EPSILON = 1e-6;

const isInBins = (v, binEdges, indices) => {
  const lastEdge = _.last(binEdges);
  const allButLastEdges = _.initial(binEdges);
  // add epsilon to last edge to include the last value
  const modifiedBinEdges = [
    ...allButLastEdges,
    [lastEdge[0], lastEdge[1] + EPSILON],
  ];
  const binIndices = _.difference(_.range(binEdges.length), indices);
  const ranges = _.at(modifiedBinEdges, binIndices);
  return _.some(ranges, (range) => _.inRange(v, ...range));
};

const isInPolygons = (polygons, positions, index) => {
  if (!polygons?.length || !positions?.length) {
    return false;
  }
  return _.some(polygons, (_f, i) => {
    return booleanPointInPolygon(
      point([positions[index][0], positions[index][1]]),
      polygons[i]
    );
  });
};

const isInValues = (omit, value) => {
  if (!omit?.length) {
    return true;
  }
  return !_.includes(omit, value);
};

export const useFilter = (data) => {
  const dataset = useDataset();
  const filterDataDispatch = useFilteredDataDispatch();

  const { obsmData, xData, obsData, isPending, serverError } = data;

  const isCategorical =
    dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
    dataset.selectedObs?.type === OBS_TYPES.BOOLEAN;

  const isContinuous = dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS;

  const isInObsSlice = useCallback(
    (index, values) => {
      let inSlice = true;
      const shouldSlice =
        dataset.colorEncoding === COLOR_ENCODINGS.OBS || dataset.sliceBy.obs;

      if (values && shouldSlice) {
        if (isCategorical) {
          inSlice &= isInValues(dataset.selectedObs?.omit, values[index]);
        } else if (isContinuous) {
          if (isNaN(values[index])) {
            inSlice &= isInValues(dataset.selectedObs?.omit, -1);
          } else {
            inSlice &= isInBins(
              values[index],
              dataset.selectedObs.bins.binEdges,
              _.without(dataset.selectedObs.omit, -1)
            );
          }
        }
      }
      return inSlice;
    },
    [
      dataset.colorEncoding,
      dataset.selectedObs?.bins?.binEdges,
      dataset.selectedObs?.omit,
      dataset.sliceBy.obs,
      isCategorical,
      isContinuous,
    ]
  );

  const isInPolygonsSlice = useCallback(
    (index, positions) => {
      let inSlice = true;

      if (dataset.sliceBy.polygons && positions) {
        inSlice &= isInPolygons(
          dataset.polygons[dataset.selectedObsm],
          positions,
          index
        );
      }
      return inSlice;
    },
    [dataset.polygons, dataset.selectedObsm, dataset.sliceBy.polygons]
  );

  const isInSlice = useCallback(
    (index, values, positions) => {
      return isInObsSlice(index, values) && isInPolygonsSlice(index, positions);
    },
    [isInObsSlice, isInPolygonsSlice]
  );

  const { filteredIndices, valueMin, valueMax, slicedLength } = useMemo(() => {
    if (isPending || serverError) {
      return {
        filteredIndices: null,
        valueMin: null,
        valueMax: null,
        slicedLength: null,
      };
    }
    if (dataset.colorEncoding === COLOR_ENCODINGS.VAR) {
      const { filtered, filteredIndices } = _.reduce(
        xData.data,
        (acc, v, i) => {
          if (isInSlice(i, obsData.data, obsmData.data)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() }
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(filtered),
        valueMax: _.max(filtered),
        slicedLength: filtered.length,
      };
    } else if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      const { filtered, filteredIndices } = _.reduce(
        obsData.data,
        (acc, v, i) => {
          if (isInSlice(i, obsData.data, obsmData.data)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() }
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(isContinuous ? filtered : obsData.data),
        valueMax: _.max(isContinuous ? filtered : obsData.data),
        slicedLength: filtered.length,
      };
    } else {
      return {
        filteredIndices: null,
        valueMin: _.min(obsData.data),
        valueMax: _.max(obsData.data),
        slicedLength: obsData.data.length,
      };
    }
  }, [
    dataset.colorEncoding,
    isContinuous,
    isInSlice,
    isPending,
    obsData.data,
    obsmData.data,
    serverError,
    xData.data,
  ]);

  const isSliced =
    dataset.colorEncoding === COLOR_ENCODINGS.OBS ||
    dataset.sliceBy.obs ||
    dataset.sliceBy.polygons;

  useEffect(() => {
    if (!isPending && !serverError) {
      filterDataDispatch({
        type: "set.obs.indices",
        indices: isSliced ? filteredIndices : null,
        valueMin: valueMin,
        valueMax: valueMax,
        slicedLength: slicedLength,
      });
    }
  }, [
    dataset.sliceBy.obs,
    dataset.sliceBy.polygons,
    filterDataDispatch,
    filteredIndices,
    isPending,
    isSliced,
    serverError,
    slicedLength,
    valueMax,
    valueMin,
  ]);
};

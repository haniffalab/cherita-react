import { useEffect, useCallback, useMemo } from "react";

import { booleanPointInPolygon, point } from "@turf/turf";
import _ from "lodash";

import { COLOR_ENCODINGS, OBS_TYPES } from "../constants/constants";
import { useDataset } from "../context/DatasetContext";
import { useFilteredDataDispatch } from "../context/FilterContext";

const EPSILON = 1e-6;

// @TODO: polish hook
export const useFilter = (data, features) => {
  const dataset = useDataset();
  const filterDataDispatch = useFilteredDataDispatch();

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

  const isCategorical = useMemo(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.OBS) {
      return (
        dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
        dataset.selectedObs?.type === OBS_TYPES.BOOLEAN
      );
    } else {
      return false;
    }
  }, [dataset.colorEncoding, dataset.selectedObs?.type]);

  const isInSlice = useCallback(
    (index, values, positions) => {
      let inSlice = true;

      if (isCategorical && values) {
        inSlice &= !_.includes(dataset.selectedObs?.omit, values[index]);
      } else if (
        (dataset.sliceBy.obs ||
          (dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
            dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS)) &&
        !!dataset.selectedObs?.omit.length &&
        values
      ) {
        if (dataset.selectedObs.type === OBS_TYPES.CATEGORICAL) {
          inSlice &= !_.includes(dataset.selectedObs.omit, values[index]);
        } else if (dataset.selectedObs.type === OBS_TYPES.CONTINUOUS) {
          if (isNaN(values[index])) {
            inSlice &= !_.includes(dataset.selectedObs.omit, -1);
          } else {
            inSlice &= isInBins(
              values[index],
              dataset.selectedObs.bins.binEdges,
              _.without(dataset.selectedObs.omit, -1)
            );
          }
        }
      }

      if (dataset.sliceBy.polygons && positions) {
        inSlice &= _.some(features?.features, (_f, i) => {
          return booleanPointInPolygon(
            point([positions[index][0], positions[index][1]]),
            features.features[i]
          );
        });
      }
      return inSlice;
    },
    [
      dataset.colorEncoding,
      dataset.selectedObs?.bins?.binEdges,
      dataset.selectedObs?.omit,
      dataset.selectedObs?.type,
      dataset.sliceBy.obs,
      dataset.sliceBy.polygons,
      features?.features,
      isCategorical,
    ]
  );

  const { filteredIndices, valueMin, valueMax, slicedLength } = useMemo(() => {
    if (dataset.colorEncoding === COLOR_ENCODINGS.VAR) {
      const { filtered, filteredIndices } = _.reduce(
        data.values,
        (acc, v, i) => {
          if (isInSlice(i, data.sliceValues, data.positions)) {
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
      const isContinuous = dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS;
      const { filtered, filteredIndices } = _.reduce(
        data.values,
        (acc, v, i) => {
          if (isInSlice(i, data.values, data.positions)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() }
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(isContinuous ? filtered : data.values),
        valueMax: _.max(isContinuous ? filtered : data.values),
        slicedLength: filtered.length,
      };
    } else {
      return {
        filteredIndices: null,
        valueMin: _.min(data.values),
        valueMax: _.max(data.values),
        slicedLength: data.values.length,
      };
    }
  }, [
    data.positions,
    data.sliceValues,
    data.values,
    dataset.colorEncoding,
    dataset.selectedObs?.type,
    isInSlice,
  ]);

  // @TODO: consider moving dispatch outside of hook, only return values
  useEffect(() => {
    filterDataDispatch({
      type: "set.obs.indices",
      indices:
        dataset.sliceBy.obs || dataset.sliceBy.polygons
          ? filteredIndices
          : null,
    });
  }, [
    dataset.sliceBy.obs,
    dataset.sliceBy.polygons,
    filterDataDispatch,
    filteredIndices,
  ]);

  return { filteredIndices, valueMin, valueMax, slicedLength };
};

import { useEffect, useCallback, useMemo } from 'react';

import { booleanPointInPolygon, point } from '@turf/turf';
import _ from 'lodash';

import { useSelectedObs } from './Resolver';
import { COLOR_ENCODINGS, OBS_TYPES } from '../constants/constants';
import { useFilteredDataDispatch } from '../context/FilterContext';
import { useSettings } from '../context/SettingsContext';

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
      polygons[i],
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
  const settings = useSettings();
  const filterDataDispatch = useFilteredDataDispatch();

  const selectedObs = useSelectedObs();
  const omitCodes = _.map(
    selectedObs?.omit || [],
    (o) => selectedObs?.codes?.[o],
  );

  const { obsmData, xData, obsData, isPending, serverError } = data;

  const isCategorical =
    selectedObs?.type === OBS_TYPES.CATEGORICAL ||
    selectedObs?.type === OBS_TYPES.BOOLEAN;

  const isContinuous = selectedObs?.type === OBS_TYPES.CONTINUOUS;

  const sliceByObs =
    (settings.colorEncoding === COLOR_ENCODINGS.OBS &&
      !!selectedObs?.omit?.length) ||
    settings.sliceBy.obs;

  const isInObsSlice = useCallback(
    (index, values) => {
      let inSlice = true;
      if (values && sliceByObs) {
        if (isCategorical) {
          inSlice &= isInValues(omitCodes, values[index]);
        } else if (isContinuous) {
          if (isNaN(values[index])) {
            inSlice &= isInValues(omitCodes, -1);
          } else {
            inSlice &= isInBins(
              values[index],
              selectedObs?.bins?.binEdges,
              _.without(omitCodes, -1),
            );
          }
        }
      }
      return inSlice;
    },
    [
      sliceByObs,
      isCategorical,
      isContinuous,
      omitCodes,
      selectedObs?.bins?.binEdges,
    ],
  );

  const isInPolygonsSlice = useCallback(
    (index, positions) => {
      let inSlice = true;

      if (settings.sliceBy.polygons && positions) {
        inSlice &= isInPolygons(
          settings.polygons[settings.selectedObsm],
          positions,
          index,
        );
      }
      return inSlice;
    },
    [settings.polygons, settings.selectedObsm, settings.sliceBy.polygons],
  );

  const isInSlice = useCallback(
    (index, values, positions) => {
      return isInObsSlice(index, values) && isInPolygonsSlice(index, positions);
    },
    [isInObsSlice, isInPolygonsSlice],
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
    if (settings.colorEncoding === COLOR_ENCODINGS.VAR) {
      const { filtered, filteredIndices } = _.reduce(
        xData.data,
        (acc, v, i) => {
          if (isInSlice(i, obsData.data, obsmData.data)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() },
      );
      return {
        filteredIndices: filteredIndices,
        valueMin: _.min(filtered),
        valueMax: _.max(filtered),
        slicedLength: filtered.length,
      };
    } else if (settings.colorEncoding === COLOR_ENCODINGS.OBS) {
      const { filtered, filteredIndices } = _.reduce(
        obsData.data,
        (acc, v, i) => {
          if (isInSlice(i, obsData.data, obsmData.data)) {
            acc.filtered.push(v);
            acc.filteredIndices.add(i);
          }
          return acc;
        },
        { filtered: [], filteredIndices: new Set() },
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
        slicedLength: obsData.data?.length,
      };
    }
  }, [
    settings.colorEncoding,
    isContinuous,
    isInSlice,
    isPending,
    obsData.data,
    obsmData.data,
    serverError,
    xData.data,
  ]);

  const isSliced = sliceByObs || settings.sliceBy.polygons;
  // const isSliced = settings.sliceBy.obs || settings.sliceBy.polygons;

  useEffect(() => {
    if (!isPending && !serverError) {
      filterDataDispatch({
        type: 'set.obs.indices',
        indices: isSliced ? filteredIndices : null,
        valueMin: valueMin,
        valueMax: valueMax,
        slicedLength: slicedLength,
        isSliced: isSliced,
      });
    }
  }, [
    settings.sliceBy.obs,
    settings.sliceBy.polygons,
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

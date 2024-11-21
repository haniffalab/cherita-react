import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import _ from "lodash";
import { Alert } from "react-bootstrap";
import Plot from "react-plotly.js";

import { PseudospatialToolbar } from "./PseudospatialToolbar";
import {
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
  COLOR_ENCODINGS,
  OBS_TYPES,
} from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { rgbToHex, useColor } from "../../helpers/color-helper";
import { ImageViewer } from "../../utils/ImageViewer";
import { Legend } from "../../utils/Legend";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";

function usePseudospatialData(plotType) {
  const ENDPOINT = "pseudospatial";
  const dataset = useDataset();
  const filteredData = useFilteredData();
  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;

  const baseParams = useMemo(() => {
    return {
      url: dataset.url,
      maskSet: dataset.pseudospatial.maskSet,
      maskValues: dataset.pseudospatial.maskValues,
      obsIndices: isSliced ? [...(filteredData.obsIndices || [])] : null,
      varNamesCol: dataset.varNamesCol,
      showColorbar: false,
      format: "json",
    };
  }, [
    dataset.url,
    dataset.pseudospatial.maskSet,
    dataset.pseudospatial.maskValues,
    dataset.varNamesCol,
    isSliced,
    filteredData.obsIndices,
  ]);

  const getPlotParams = useCallback(() => {
    if (plotType === PLOT_TYPES.GENE) {
      return {
        varKey: dataset.selectedVar?.isSet
          ? {
              name: dataset.selectedVar?.name,
              indices: dataset.selectedVar?.vars.map((v) => v.index),
            }
          : dataset.selectedVar?.index,
        ...(dataset.sliceBy.obs
          ? {
              obsCol: dataset.selectedObs,
              obsValues: !dataset.selectedObs?.omit.length
                ? null
                : _.difference(
                    _.values(dataset.selectedObs?.codes),
                    dataset.selectedObs?.omit
                  ).map((c) => dataset.selectedObs?.codesMap[c]),
            }
          : {}),
      };
    } else if (plotType === PLOT_TYPES.CATEGORICAL) {
      return {
        obsCol: dataset.selectedObs,
        obsValues: !dataset.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(dataset.selectedObs?.codes),
              dataset.selectedObs?.omit
            ).map((c) => dataset.selectedObs?.codesMap[c]),
        mode: dataset.pseudospatial.categoricalMode,
      };
    } else if (plotType === "continuous") {
      return {
        obsCol: dataset.selectedObs,
        obsValues: !dataset.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(dataset.selectedObs?.codes),
              dataset.selectedObs?.omit
            ).map((c) => dataset.selectedObs?.codesMap[c]),
      };
    }
  }, [
    dataset.pseudospatial.categoricalMode,
    dataset.selectedObs,
    dataset.selectedVar?.index,
    dataset.selectedVar?.isSet,
    dataset.selectedVar?.name,
    dataset.selectedVar?.vars,
    dataset.sliceBy.obs,
    plotType,
  ]);

  const params = useMemo(() => {
    return {
      ...baseParams,
      ...getPlotParams(),
    };
  }, [baseParams, getPlotParams]);

  return useDebouncedFetch(ENDPOINT + "/" + plotType, params, 500, {
    enabled: !!plotType && !!dataset.pseudospatial.maskSet,
  });
}

export function Pseudospatial({ showLegend = true, sharedScaleRange = false }) {
  const dataset = useDataset();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const { getColor } = useColor();
  const colorscale = useRef(dataset.controls.colorScale);

  const plotType =
    dataset.colorEncoding === COLOR_ENCODINGS.VAR
      ? PLOT_TYPES.GENE
      : dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
          dataset.selectedObs?.type === OBS_TYPES.BOOLEAN
        ? PLOT_TYPES.CATEGORICAL
        : dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS
          ? PLOT_TYPES.CONTINUOUS
          : PLOT_TYPES.MASKS;

  const updateColorscale = useCallback(
    (colorscale) => {
      setLayout((l) => {
        return {
          ...l,
          coloraxis: { ...l.coloraxis, colorscale: colorscale },
        };
      });

      setData((d) => {
        const min = layout?.coloraxis?.cmin;
        const max = layout?.coloraxis?.cmax;
        return _.map(d, (trace) => {
          const v = trace.meta.value;
          if (v === null) {
            return trace;
          }
          const color = rgbToHex(getColor({ value: (v - min) / (max - min) }));
          return {
            ...trace,
            fillcolor: color,
            line: { ...trace.line, color: color },
          };
        });
      });
    },
    [getColor, layout?.coloraxis?.cmax, layout?.coloraxis?.cmin]
  );

  const { fetchedData, isPending, serverError } =
    usePseudospatialData(plotType);

  useEffect(() => {
    if (!isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      updateColorscale(colorscale.current);
    }
  }, [fetchedData, isPending, serverError, sharedScaleRange, updateColorscale]);

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

  useEffect(() => {
    if (sharedScaleRange) {
      const { min, max } = {
        min:
          dataset.controls.range[0] *
            (dataset.controls.valueRange[1] - dataset.controls.valueRange[0]) +
          dataset.controls.valueRange[0],
        max:
          dataset.controls.range[1] *
            (dataset.controls.valueRange[1] - dataset.controls.valueRange[0]) +
          dataset.controls.valueRange[0],
      };

      setData((d) => {
        return _.map(d, (trace) => {
          const v = trace.meta.value;
          if (v === null) {
            return trace;
          }
          const color = rgbToHex(getColor({ value: (v - min) / (max - min) }));
          return {
            ...trace,
            fillcolor: color,
            line: { ...trace.line, color: color },
          };
        });
      });

      setLayout((l) => {
        return {
          ...l,
          coloraxis: {
            ...l.coloraxis,
            cmin: min,
            cmax: max,
          },
        };
      });
    }
  }, [
    dataset.controls.range,
    dataset.controls.valueMax,
    dataset.controls.valueMin,
    dataset.controls.valueRange,
    getColor,
    sharedScaleRange,
  ]);

  const hasSelections = !!plotType && !!dataset.pseudospatial.maskSet;

  if (!serverError) {
    return (
      <div className="cherita-pseudospatial position-relative">
        <PseudospatialToolbar plotType={plotType} />
        <>
          {hasSelections && isPending && <LoadingSpinner />}
          {hasSelections && (
            <Plot
              data={data}
              layout={layout}
              useResizeHandler={true}
              className="cherita-pseudospatial-plot"
              config={{ displaylogo: false }}
            />
          )}
          {hasSelections && showLegend && (
            <Legend
              min={layout?.coloraxis?.cmin}
              max={layout?.coloraxis?.cmax}
            />
          )}
        </>
      </div>
    );
  } else {
    return (
      <>
        <Alert variant="danger">{serverError.message}</Alert>
      </>
    );
  }
}

// @TODO: explore making it a minimap
export function PseudospatialImage() {
  const dataset = useDataset();

  if (dataset.imageUrl) {
    return (
      <ImageViewer src={dataset.imageUrl} alt="Pseudospatial reference image" />
    );
  } else {
    return <></>;
  }
}

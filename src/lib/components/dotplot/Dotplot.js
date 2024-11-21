import React, { useCallback, useEffect, useRef, useState } from "react";

import _ from "lodash";
import { Alert } from "react-bootstrap";
import Plot from "react-plotly.js";

import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";

export function Dotplot() {
  const ENDPOINT = "dotplot";
  const dataset = useDataset();
  const filteredData = useFilteredData();
  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;
  const dispatch = useDatasetDispatch();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    obsCol: dataset.selectedObs,
    obsValues: !dataset.selectedObs?.omit.length
      ? null
      : _.difference(
          _.values(dataset.selectedObs?.codes),
          dataset.selectedObs?.omit
        ).map((c) => dataset.selectedObs?.codesMap[c]),
    varKeys: dataset.selectedMultiVar.map((i) =>
      i.isSet ? { name: i.name, indices: i.vars.map((v) => v.index) } : i.index
    ),
    obsIndices: isSliced ? [...(filteredData.obsIndices || [])] : null,
    standardScale: dataset.controls.standardScale,
    meanOnlyExpressed: dataset.controls.meanOnlyExpressed,
    expressionCutoff: dataset.controls.expressionCutoff,
    varNamesCol: dataset.varNamesCol,
  });
  // @TODO: set default scale

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar.length) {
      setHasSelections(true);
    } else {
      setHasSelections(false);
    }
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
        obsCol: dataset.selectedObs,
        obsValues: !dataset.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(dataset.selectedObs?.codes),
              dataset.selectedObs?.omit
            ).map((c) => dataset.selectedObs?.codesMap[c]),
        varKeys: dataset.selectedMultiVar.map((i) =>
          i.isSet
            ? { name: i.name, indices: i.vars.map((v) => v.index) }
            : i.index
        ),
        obsIndices: isSliced ? [...(filteredData.obsIndices || [])] : null,
        standardScale: dataset.controls.standardScale,
        meanOnlyExpressed: dataset.controls.meanOnlyExpressed,
        expressionCutoff: dataset.controls.expressionCutoff,
        varNamesCol: dataset.varNamesCol,
      };
    });
  }, [
    dataset.url,
    dataset.selectedObs,
    dataset.selectedMultiVar,
    dataset.controls.standardScale,
    dataset.controls.meanOnlyExpressed,
    dataset.controls.expressionCutoff,
    dataset.varNamesCol,
    isSliced,
    filteredData.obsIndices,
  ]);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500,
    { enabled: !!params.obsCol && !!params.varKeys.length }
  );

  useEffect(() => {
    if (hasSelections && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      dispatch({
        type: "set.controls.colorAxis",
        colorAxis: {
          dmin: fetchedData.range.min.toFixed(1),
          dmax: fetchedData.range.max.toFixed(1),
          cmin: fetchedData.range.min.toFixed(1),
          cmax: fetchedData.range.max.toFixed(1),
        },
      });
      updateColorscale(colorscale.current);
    }
  }, [
    fetchedData,
    isPending,
    serverError,
    hasSelections,
    dispatch,
    updateColorscale,
  ]);

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

  useEffect(() => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: {
          ...l.coloraxis,
          cmin: dataset.controls.colorAxis.cmin,
          cmax: dataset.controls.colorAxis.cmax,
        },
      };
    });
  }, [dataset.controls.colorAxis.cmin, dataset.controls.colorAxis.cmax]);

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-dotplot position-relative">
          {isPending && <LoadingSpinner />}
          <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
      );
    }
    return (
      <div className="cherita-dotplot">
        <Alert variant="light">Select features and a category</Alert>
      </div>
    );
  } else {
    return (
      <div>
        <Alert variant="danger">{serverError.message}</Alert>
      </div>
    );
  }
}

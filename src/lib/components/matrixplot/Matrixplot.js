import React, { useCallback, useEffect, useRef, useState } from "react";

import _ from "lodash";
import { Alert } from "react-bootstrap";
import Plot from "react-plotly.js";

import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";

export function Matrixplot() {
  const ENDPOINT = "matrixplot";
  const dataset = useDataset();
  const { obsIndices, isSliced } = useFilteredData();
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
    obsIndices: isSliced ? [...(obsIndices || [])] : null,
    standardScale: dataset.controls.standardScale,
    varNamesCol: dataset.varNamesCol,
  });

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
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
        standardScale: dataset.controls.standardScale,
        varNamesCol: dataset.varNamesCol,
      };
    });
  }, [
    dataset.controls.standardScale,
    dataset.selectedMultiVar,
    dataset.selectedObs,
    dataset.url,
    dataset.varNamesCol,
    obsIndices,
    isSliced,
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
      updateColorscale(colorscale.current);
    }
  }, [fetchedData, hasSelections, isPending, serverError, updateColorscale]);

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-matrixplot position-relative">
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
      <div className="cherita-matrixplot">
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

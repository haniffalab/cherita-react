import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset } from "../../context/DatasetContext";
import { Alert } from "react-bootstrap";
import { useDebouncedFetch } from "../../utils/requests";
import { LoadingSpinner } from "../../utils/LoadingIndicators";

export function Matrixplot() {
  const ENDPOINT = "matrixplot";
  const dataset = useDataset();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    selectedObs: dataset.selectedObs,
    selectedMultiVar: dataset.selectedMultiVar.map((i) => i.index),
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
        selectedObs: dataset.selectedObs,
        selectedMultiVar: dataset.selectedMultiVar.map((i) => i.index),
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
    { enabled: !!params.selectedObs && !!params.selectedMultiVar.length }
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

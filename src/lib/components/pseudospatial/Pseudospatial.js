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

import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";

const PLOT_TYPES = {
  GENE: "gene",
  CATEGORICAL: "categorical",
  CONTINUOUS: "continuous",
  MASKS: "masks",
};

export function Pseudospatial() {
  const ENDPOINT = "pseudospatial"; // /categorical, /gene or /continuous
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const plotType =
    dataset.colorEncoding === COLOR_ENCODINGS.VAR
      ? PLOT_TYPES.GENE
      : dataset.selectedObs?.type === OBS_TYPES.CATEGORICAL ||
          dataset.selectedObs?.type === OBS_TYPES.BOOLEAN
        ? PLOT_TYPES.CATEGORICAL
        : dataset.selectedObs?.type === OBS_TYPES.CONTINUOUS
          ? PLOT_TYPES.CONTINUOUS
          : PLOT_TYPES.MASKS;

  const baseParams = useMemo(() => {
    return {
      url: dataset.url,
      maskSet: "12_sections", // @TODO: get from anndata uns in controls
      maskValues: [],
      varNamesCol: dataset.varNamesCol,
      showColorbar: false,
      format: "json",
    };
  }, [dataset.url, dataset.varNamesCol]);

  const getModeParams = useCallback(() => {
    if (plotType === PLOT_TYPES.GENE) {
      return {
        varKey: dataset.selectedVar?.isSet
          ? {
              name: dataset.selectedVar?.name,
              indices: dataset.selectedVar?.vars.map((v) => v.index),
            }
          : dataset.selectedVar?.index,
      };
    } else if (plotType === PLOT_TYPES.CATEGORICAL) {
      return {
        obsColName: dataset.selectedObs?.name,
        obsValues: [],
        mode: "counts", // "counts", "across" or "within"
      };
    } else if (plotType === "continuous") {
      return {
        obsColName: dataset.selectedObs?.name,
      };
    }
  }, [
    dataset.selectedObs?.name,
    dataset.selectedVar?.index,
    dataset.selectedVar?.isSet,
    dataset.selectedVar?.name,
    dataset.selectedVar?.vars,
    plotType,
  ]);

  const [params, setParams] = useState({
    ...baseParams,
    ...getModeParams(),
  });

  useEffect(() => {
    if (plotType === PLOT_TYPES.GENE && dataset.selectedVar) {
      setHasSelections(true);
    } else if (
      (plotType === PLOT_TYPES.CATEGORICAL ||
        plotType === PLOT_TYPES.CONTINUOUS) &&
      _.difference(dataset.selectedObs.omit, _.keys(dataset.selectedObs.codes))
        .length
    ) {
      setHasSelections(true);
    }
    setParams({ ...baseParams, ...getModeParams() });
  }, [
    baseParams,
    dataset.selectedObs.codes,
    dataset.selectedObs.omit,
    dataset.selectedVar,
    getModeParams,
    plotType,
  ]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT + "/" + plotType,
    params,
    500
  );

  useEffect(() => {
    if (!isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
    }
  }, [fetchedData, isPending, serverError]);

  if (!serverError) {
    return (
      <div className="cherita-pseudospatial position-relative">
        {isPending && <LoadingSpinner />}
        <Plot
          data={data}
          layout={layout}
          useResizeHandler={true}
          style={{ maxWidth: "100%", height: "100%" }}
        />
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

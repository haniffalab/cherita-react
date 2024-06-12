import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Plot from "react-plotly.js";
import { useDataset } from "../../context/DatasetContext";
import { VIOLIN_MODES } from "../../constants/constants";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDebouncedFetch } from "../../utils/requests";
import { LoadingSpinner } from "../../utils/LoadingIndicators";

export function Violin({ mode = VIOLIN_MODES.MULTIKEY }) {
  const ENDPOINT = "violin";
  const dataset = useDataset();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    keys: [],
    scale: dataset.controls.standardScale,
    varNamesCol: dataset.varNamesCol,
  });
  // @TODO: set default scale

  useEffect(() => {
    if (mode === VIOLIN_MODES.MULTIKEY) {
      if (dataset.selectedMultiVar.length) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          keys: dataset.selectedMultiVar.map((i) => i.index),
          scale: dataset.controls.standardScale,
          varNamesCol: dataset.varNamesCol,
        };
      });
    } else if (mode === VIOLIN_MODES.GROUPBY) {
      if (dataset.selectedObs && dataset.selectedVar) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          keys: dataset.selectedVar.index,
          selectedObs: dataset.selectedObs,
          scale: dataset.controls.standardScale,
          varNamesCol: dataset.varNamesCol,
        };
      });
    }
  }, [
    dataset.controls.standardScale,
    dataset.selectedMultiVar,
    dataset.selectedObs,
    dataset.selectedVar,
    dataset.url,
    dataset.varNamesCol,
    mode,
  ]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500,
    {
      enabled:
        (mode === VIOLIN_MODES.MULTIKEY && !!params.keys) ||
        (mode === VIOLIN_MODES.GROUPBY &&
          !!params.keys.length &&
          !!params.selectedObs),
    }
  );

  useEffect(() => {
    if (hasSelections && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
    }
  }, [fetchedData, hasSelections, isPending, serverError]);

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-violin position-relative">
          {isPending && <LoadingSpinner />}
          <h5>{mode}</h5>
          <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          {fetchedData?.resampled && (
            <Alert variant="warning">
              <b>Warning:</b> For performance reasons this plot was generated
              with resampled data. It will not be exactly the same as one
              produced with the entire dataset. &nbsp;
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip>
                    Resampled to 100K values following a Monte Carlo style
                    approach to help ensure resampled data is a good
                    representation of the original dataset's distribution.
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon>
              </OverlayTrigger>
            </Alert>
          )}
        </div>
      );
    }
    return (
      <div className="cherita-violin">
        {mode === VIOLIN_MODES.MULTIKEY && (
          <Alert variant="light">Select features</Alert>
        )}
        {mode === VIOLIN_MODES.GROUPBY && (
          <Alert variant="light">Select categories and a feature</Alert>
        )}
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

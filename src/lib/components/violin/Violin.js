import React, { useEffect, useState } from "react";

import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import Plot from "react-plotly.js";

import { VIOLIN_MODES } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";
import {
  ControlsPlotlyToolbar,
  ObsPlotlyToolbar,
  VarPlotlyToolbar,
} from "../toolbar/Toolbar";

export function Violin({
  mode = VIOLIN_MODES.MULTIKEY,
  showObsBtn = false,
  showVarsBtn = false,
  showCtrlsBtn = false,
  setShowObs,
  setShowVars,
  setShowControls,
}) {
  const ENDPOINT = "violin";
  const dataset = useDataset();
  const { obsIndices, isSliced } = useFilteredData();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    mode: mode,
    scale: dataset.controls.scale.violinplot.value,
    varNamesCol: dataset.varNamesCol,
    ...{
      [VIOLIN_MODES.MULTIKEY]: {
        varKeys: dataset.selectedMultiVar.map((i) =>
          i.isSet
            ? { name: i.name, indices: i.vars.map((v) => v.index) }
            : i.index
        ),
        obsKeys: [], // @TODO: implement
      },
      [VIOLIN_MODES.GROUPBY]: {
        varKey: dataset.selectedVar?.isSet
          ? {
              name: dataset.selectedVar?.name,
              indices: dataset.selectedVar?.vars.map((v) => v.index),
            }
          : dataset.selectedVar?.index,
        obsCol: dataset.selectedObs,
        obsValues: !dataset.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(dataset.selectedObs?.codes),
              dataset.selectedObs?.omit
            ).map((c) => dataset.selectedObs?.codesMap[c]),
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
      },
    }[mode],
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
          mode: mode,
          varKeys: dataset.selectedMultiVar.map((i) =>
            i.isSet
              ? { name: i.name, indices: i.vars.map((v) => v.index) }
              : i.index
          ),
          scale: dataset.controls.scale.violinplot.value,
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
          mode: mode,
          varKey: dataset.selectedVar?.isSet
            ? {
                name: dataset.selectedVar?.name,
                indices: dataset.selectedVar?.vars.map((v) => v.index),
              }
            : dataset.selectedVar?.index,
          obsCol: dataset.selectedObs,
          obsValues: !dataset.selectedObs?.omit.length
            ? null
            : _.difference(
                _.values(dataset.selectedObs?.codes),
                dataset.selectedObs?.omit
              ).map((c) => dataset.selectedObs?.codesMap[c]),
          obsIndices: isSliced ? [...(obsIndices || [])] : null,
          scale: dataset.controls.scale.violinplot.value,
          varNamesCol: dataset.varNamesCol,
        };
      });
    }
  }, [
    dataset.controls.scale.violinplot.value,
    dataset.selectedMultiVar,
    dataset.selectedObs,
    dataset.selectedVar,
    dataset.url,
    dataset.varNamesCol,
    obsIndices,
    isSliced,
    mode,
  ]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500,
    {
      enabled:
        (mode === VIOLIN_MODES.MULTIKEY &&
          (!!params.varKeys.length || !!params.obsKeys.length)) ||
        (mode === VIOLIN_MODES.GROUPBY && !!params.varKey && !!params.obsCol),
    }
  );

  useEffect(() => {
    if (hasSelections && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
    }
  }, [fetchedData, hasSelections, isPending, serverError]);

  const customModeBarButtons = _.compact([
    showObsBtn && ObsPlotlyToolbar({ onClick: setShowObs }),
    showVarsBtn && VarPlotlyToolbar({ onClick: setShowVars }),
    showCtrlsBtn && ControlsPlotlyToolbar({ onClick: setShowControls }),
  ]);

  const plotlyModeBarButtons = [
    "toImage",
    "zoom2d",
    "pan2d",
    "zoomIn2d",
    "zoomOut2d",
    "autoScale2d",
    "resetScale2d",
  ];

  const modeBarButtons = customModeBarButtons.length
    ? [customModeBarButtons, plotlyModeBarButtons]
    : [plotlyModeBarButtons];

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-plot cherita-violin position-relative">
          {isPending && <LoadingSpinner />}
          <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            config={{
              displaylogo: false,
              modeBarButtons: modeBarButtons,
            }}
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

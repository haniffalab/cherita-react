import React, { useCallback, useEffect, useRef, useState } from "react";

import _ from "lodash";
import { Alert } from "react-bootstrap";
import Plot from "react-plotly.js";

import { PLOTLY_MODEBAR_BUTTONS } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { useSettings } from "../../context/SettingsContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";
import {
  ControlsPlotlyToolbar,
  ObsPlotlyToolbar,
  VarPlotlyToolbar,
} from "../toolbar/Toolbar";

export function Heatmap({
  showObsBtn = false,
  showVarsBtn = false,
  showCtrlsBtn = false,
  setShowObs,
  setShowVars,
  setShowControls,
}) {
  const ENDPOINT = "heatmap";
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();
  const colorscale = useRef(settings.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    obsCol: settings.selectedObs,
    obsValues: !settings.selectedObs?.omit.length
      ? null
      : _.difference(
          _.values(settings.selectedObs?.codes),
          settings.selectedObs?.omit
        ).map((c) => settings.selectedObs?.codesMap[c]),
    varKeys: settings.selectedMultiVar.map((i) =>
      i.isSet ? { name: i.name, indices: i.vars.map((v) => v.index) } : i.index
    ),
    obsIndices: isSliced ? [...(obsIndices || [])] : null,
    varNamesCol: dataset.varNamesCol,
  });

  useEffect(() => {
    if (settings.selectedObs && settings.selectedMultiVar.length) {
      setHasSelections(true);
    } else {
      setHasSelections(false);
    }
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
        obsCol: settings.selectedObs,
        obsValues: !settings.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(settings.selectedObs?.codes),
              settings.selectedObs?.omit
            ).map((c) => settings.selectedObs?.codesMap[c]),
        varKeys: settings.selectedMultiVar.map((i) =>
          i.isSet
            ? { name: i.name, indices: i.vars.map((v) => v.index) }
            : i.index
        ),
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
        varNamesCol: dataset.varNamesCol,
      };
    });
  }, [
    settings.selectedMultiVar,
    settings.selectedObs,
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
    colorscale.current = settings.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [settings.controls.colorScale, updateColorscale]);

  const customModeBarButtons = _.compact([
    showObsBtn && ObsPlotlyToolbar({ onClick: setShowObs }),
    showVarsBtn && VarPlotlyToolbar({ onClick: setShowVars }),
    showCtrlsBtn && ControlsPlotlyToolbar({ onClick: setShowControls }),
  ]);

  const modeBarButtons = customModeBarButtons.length
    ? [customModeBarButtons, PLOTLY_MODEBAR_BUTTONS]
    : [PLOTLY_MODEBAR_BUTTONS];

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-plot cherita-heatmap position-relative">
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
        </div>
      );
    }
    return (
      <div className="cherita-heatmap">
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

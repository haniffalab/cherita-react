import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import _ from "lodash";
import { Alert, Button } from "react-bootstrap";
import Plot from "react-plotly.js";

import { PLOTLY_MODEBAR_BUTTONS } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";
import { useSelectedMultiVar, useSelectedObs } from "../../utils/Resolver";
import {
  ControlsPlotlyToolbar,
  ObsPlotlyToolbar,
  VarPlotlyToolbar,
} from "../toolbar/Toolbar";

export function Dotplot({
  showObsBtn = false,
  showVarsBtn = false,
  showCtrlsBtn = false,
  setShowObs,
  setShowVars,
  setShowControls,
}) {
  const ENDPOINT = "dotplot";
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();
  const dispatch = useSettingsDispatch();
  const colorscale = useRef(settings.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const selectedObs = useSelectedObs();
  const selectedMultiVar = useSelectedMultiVar();

  const params = useMemo(
    () => ({
      url: dataset.url,
      obsCol: selectedObs,
      obsValues: !selectedObs?.omit.length
        ? null
        : _.difference(selectedObs?.values, selectedObs?.omit),
      varKeys: selectedMultiVar.map((i) =>
        i.isSet
          ? { name: i.name, indices: i.vars.map((v) => v.index) }
          : i.index
      ),
      obsIndices: isSliced ? [...(obsIndices || [])] : null,
      standardScale: settings.controls.scale.dotplot,
      meanOnlyExpressed: settings.controls.meanOnlyExpressed,
      expressionCutoff: settings.controls.expressionCutoff,
      varNamesCol: dataset.varNamesCol,
    }),
    [
      dataset.url,
      dataset.varNamesCol,
      isSliced,
      obsIndices,
      selectedMultiVar,
      selectedObs,
      settings.controls.expressionCutoff,
      settings.controls.meanOnlyExpressed,
      settings.controls.scale.dotplot,
    ]
  );
  // @TODO: set default scale

  useEffect(() => {
    if (selectedObs && selectedMultiVar.length) {
      setHasSelections(true);
    } else {
      setHasSelections(false);
    }
  }, [
    dataset.url,
    selectedObs,
    settings.controls.scale.dotplot,
    settings.controls.meanOnlyExpressed,
    settings.controls.expressionCutoff,
    dataset.varNamesCol,
    isSliced,
    obsIndices,
    selectedMultiVar,
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
    { isEnabled: (params) => !!params.obsCol && !!params.varKeys.length }
  );

  useEffect(() => {
    if (hasSelections && !!fetchedData && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
      // @TODO: keep colorAxis range from settings
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
    } else {
      setData([]);
      setLayout({});
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
    colorscale.current = settings.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [settings.controls.colorScale, updateColorscale]);

  useEffect(() => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: {
          ...l.coloraxis,
          cmin: settings.controls.colorAxis.cmin,
          cmax: settings.controls.colorAxis.cmax,
        },
      };
    });
  }, [settings.controls.colorAxis.cmin, settings.controls.colorAxis.cmax]);

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
        <div className="cherita-plot cherita-dotplot position-relative">
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
      <div className="cherita-dotplot">
        <Alert variant="light">
          Select{" "}
          {showVarsBtn ? (
            <Button
              variant="link"
              className="border-0 p-0 align-baseline"
              onClick={setShowVars}
            >
              features
            </Button>
          ) : (
            "features"
          )}{" "}
          and a{" "}
          {showObsBtn ? (
            <Button
              variant="link"
              className="border-0 p-0 align-baseline"
              onClick={setShowObs}
            >
              category
            </Button>
          ) : (
            "category"
          )}
        </Alert>
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

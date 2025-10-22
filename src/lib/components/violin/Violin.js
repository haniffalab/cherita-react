import { useEffect, useState } from "react";

import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Button } from "react-bootstrap";
import Plot from "react-plotly.js";

import {
  PLOTLY_MODEBAR_BUTTONS,
  VIOLIN_MODES,
} from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { useSettings } from "../../context/SettingsContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";
import {
  useSelectedMultiVar,
  useSelectedObs,
  useSelectedVar,
} from "../../utils/Resolver";
import { StyledTooltip } from "../../utils/StyledTooltip";
import { PlotAlert } from "../full-page/PlotAlert";
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
  plotType,
  setPlotType,
}) {
  const ENDPOINT = "violin";
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const selectedMultiVar = useSelectedMultiVar();
  const selectedVar = useSelectedVar();
  const selectedObs = useSelectedObs();

  const [params, setParams] = useState({
    url: dataset.url,
    mode: mode,
    scale: settings.controls.scale.violinplot,
    varNamesCol: dataset.varNamesCol,
    ...{
      [VIOLIN_MODES.MULTIKEY]: {
        varKeys: selectedMultiVar.map((i) =>
          i.isSet
            ? { name: i.name, indices: i.vars.map((v) => v.index) }
            : i.index
        ),
        obsKeys: [], // @TODO: implement
      },
      [VIOLIN_MODES.GROUPBY]: {
        varKey: selectedVar?.isSet
          ? {
              name: selectedVar?.name,
              indices: selectedVar?.vars.map((v) => v.index),
            }
          : selectedVar?.index,
        obsCol: selectedObs,
        obsValues: !selectedObs?.omit.length
          ? null
          : _.difference(selectedObs?.values, selectedObs?.omit),
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
      },
    }[mode],
  });
  // @TODO: set default scale

  useEffect(() => {
    if (mode === VIOLIN_MODES.MULTIKEY) {
      if (selectedMultiVar.length) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          mode: mode,
          varKeys: selectedMultiVar.map((i) =>
            i.isSet
              ? { name: i.name, indices: i.vars.map((v) => v.index) }
              : i.index
          ),
          scale: settings.controls.scale.violinplot,
          varNamesCol: dataset.varNamesCol,
        };
      });
    } else if (mode === VIOLIN_MODES.GROUPBY) {
      if (selectedObs && selectedVar) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          mode: mode,
          varKey: selectedVar?.isSet
            ? {
                name: selectedVar?.name,
                indices: selectedVar?.vars.map((v) => v.index),
              }
            : selectedVar?.index,
          obsCol: selectedObs,
          obsValues: !selectedObs?.omit.length
            ? null
            : _.difference(selectedObs?.values, selectedObs?.omit),
          obsIndices: isSliced ? [...(obsIndices || [])] : null,
          scale: settings.controls.scale.violinplot,
          varNamesCol: dataset.varNamesCol,
        };
      });
    }
  }, [
    settings.controls.scale.violinplot,
    selectedMultiVar,
    selectedObs,
    selectedVar,
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

  const modeBarButtons = customModeBarButtons.length
    ? [customModeBarButtons, PLOTLY_MODEBAR_BUTTONS]
    : [PLOTLY_MODEBAR_BUTTONS];

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-plot cherita-violin">
          {isPending && <LoadingSpinner />}
          <div className="d-flex flex-column h-100">
            <div
              className="flex-grow-1 position-relative"
              style={{ minHeight: "0" }}
            >
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
            {fetchedData?.resampled && (
              <div className="resampled-tooltip-container">
                <StyledTooltip
                  title={
                    <>
                      <strong>Note:</strong> This plot uses resampled data to
                      improve performance, so values may differ slightly from
                      the full dataset. Data were randomly resampled (up to 100K
                      points) to provide a representative view of the full
                      distribution while reducing processing time.
                    </>
                  }
                  placement="bottom"
                >
                  <Button variant="light">
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span className="d-none d-lg-inline ms-2">Resampled</span>
                  </Button>
                </StyledTooltip>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <PlotAlert
        variant="info"
        heading="Set up your violin plot"
        plotType={plotType}
        setPlotType={setPlotType}
      >
        {mode === VIOLIN_MODES.MULTIKEY && (
          <p className="p-0 m-0">
            Select one or more{" "}
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
            to display their expression distributions across all observations.
          </p>
        )}
        {mode === VIOLIN_MODES.GROUPBY && (
          <p className="p-0 m-0">
            Select a{" "}
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
            )}{" "}
            to group observations, and choose a{" "}
            {showVarsBtn ? (
              <Button
                variant="link"
                className="border-0 p-0 align-baseline"
                onClick={setShowVars}
              >
                feature
              </Button>
            ) : (
              "feature"
            )}{" "}
            to view its distribution within each group.
          </p>
        )}
      </PlotAlert>
    );
  } else {
    return (
      <PlotAlert
        variant="danger"
        heading="Error displaying the violin plot"
        plotType={plotType}
        setPlotType={setPlotType}
      >
        {serverError.message ||
          "An unexpected error occurred while generating the plot."}
      </PlotAlert>
    );
  }
}

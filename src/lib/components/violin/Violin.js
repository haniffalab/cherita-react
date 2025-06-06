import React, { useEffect, useState } from "react";

import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import Plot from "react-plotly.js";

import { VIOLIN_MODES } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { useSettings } from "../../context/SettingsContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useDebouncedFetch } from "../../utils/requests";

export function Violin({ mode = VIOLIN_MODES.MULTIKEY }) {
  const ENDPOINT = "violin";
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices, isSliced } = useFilteredData();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  const [params, setParams] = useState({
    url: dataset.url,
    mode: mode,
    scale: settings.controls.scale.violinplot,
    varNamesCol: dataset.varNamesCol,
    ...{
      [VIOLIN_MODES.MULTIKEY]: {
        varKeys: settings.selectedMultiVar.map((i) =>
          i.isSet
            ? { name: i.name, indices: i.vars.map((v) => v.index) }
            : i.index
        ),
        obsKeys: [], // @TODO: implement
      },
      [VIOLIN_MODES.GROUPBY]: {
        varKey: settings.selectedVar?.isSet
          ? {
              name: settings.selectedVar?.name,
              indices: settings.selectedVar?.vars.map((v) => v.index),
            }
          : settings.selectedVar?.index,
        obsCol: settings.selectedObs,
        obsValues: !settings.selectedObs?.omit.length
          ? null
          : _.difference(
              _.values(settings.selectedObs?.codes),
              settings.selectedObs?.omit
            ).map((c) => settings.selectedObs?.codesMap[c]),
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
      },
    }[mode],
  });
  // @TODO: set default scale

  useEffect(() => {
    if (mode === VIOLIN_MODES.MULTIKEY) {
      if (settings.selectedMultiVar.length) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          mode: mode,
          varKeys: settings.selectedMultiVar.map((i) =>
            i.isSet
              ? { name: i.name, indices: i.vars.map((v) => v.index) }
              : i.index
          ),
          scale: settings.controls.scale.violinplot,
          varNamesCol: dataset.varNamesCol,
        };
      });
    } else if (mode === VIOLIN_MODES.GROUPBY) {
      if (settings.selectedObs && settings.selectedVar) {
        setHasSelections(true);
      } else {
        setHasSelections(false);
      }
      setParams((p) => {
        return {
          ...p,
          url: dataset.url,
          mode: mode,
          varKey: settings.selectedVar?.isSet
            ? {
                name: settings.selectedVar?.name,
                indices: settings.selectedVar?.vars.map((v) => v.index),
              }
            : settings.selectedVar?.index,
          obsCol: settings.selectedObs,
          obsValues: !settings.selectedObs?.omit.length
            ? null
            : _.difference(
                _.values(settings.selectedObs?.codes),
                settings.selectedObs?.omit
              ).map((c) => settings.selectedObs?.codesMap[c]),
          obsIndices: isSliced ? [...(obsIndices || [])] : null,
          scale: settings.controls.scale.violinplot,
          varNamesCol: dataset.varNamesCol,
        };
      });
    }
  }, [
    settings.controls.scale.violinplot,
    settings.selectedMultiVar,
    settings.selectedObs,
    settings.selectedVar,
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

  if (!serverError) {
    if (hasSelections) {
      return (
        <div className="cherita-violin position-relative">
          {isPending && <LoadingSpinner />}
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

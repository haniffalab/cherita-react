import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import {
  VIOLIN_MODES,
  VIOLINPLOT_STANDARDSCALES,
} from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { useDebouncedFetch } from "../../utils/requests";

export function ViolinControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [activeStandardScale, setActiveStandardScale] = useState(
    dataset.controls.standardScale
  );

  useEffect(() => {
    if (dataset.controls.standardScale) {
      setActiveStandardScale(
        VIOLINPLOT_STANDARDSCALES.find(
          (obs) => obs.value === dataset.controls.standardScale
        ).name
      );
    }
  }, [dataset.controls.standardScale]);

  const standardScaleList = VIOLINPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={activeStandardScale === item.value}
      onClick={() => {
        dispatch({
          type: "set.controls.standardScale",
          standardScale: item.value,
        });
      }}
    >
      {item.name}
    </Dropdown.Item>
  ));

  return (
    <ButtonToolbar>
      <ButtonGroup>
        <InputGroup>
          <InputGroup.Text>Standard scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {activeStandardScale}
            </Dropdown.Toggle>
            <Dropdown.Menu>{standardScaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

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
          keys: dataset.selectedMultiVar.map((i) => i.name),
          scale: dataset.controls.standardScale,
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
          keys: dataset.selectedVar.name,
          selectedObs: dataset.selectedObs,
          scale: dataset.controls.standardScale,
        };
      });
    }
  }, [
    dataset.controls.standardScale,
    dataset.selectedMultiVar,
    dataset.selectedObs,
    dataset.selectedVar,
    dataset.url,
    mode,
  ]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    500
  );

  useEffect(() => {
    if (hasSelections && !isPending && !serverError) {
      setData(fetchedData.data);
      setLayout(fetchedData.layout);
    }
  }, [fetchedData, hasSelections, isPending, serverError]);

  if (hasSelections) {
    return (
      <div className="cherita-violin">
        <h5>{mode}</h5>
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
    <div className="cherita-violin">
      <p>Select variables to plot</p>
    </div>
  );
}

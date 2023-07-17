import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import _ from "lodash";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import {
  VIOLIN_MODES,
  VIOLINPLOT_STANDARDSCALES,
} from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

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
  const dataset = useDataset();
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);
  // @TODO: set default scale

  const update = useMemo(() => {
    const func = (abortController) => {
      if (mode === VIOLIN_MODES.MULTIKEY) {
        if (dataset.selectedMultiVar.length) {
          setHasSelections(true);
          fetchData(
            "violin",
            {
              url: dataset.url,
              keys: dataset.selectedMultiVar.map((i) => i.name),
              scale: dataset.controls.standardScale,
            },
            abortController.signal
          )
            .then((data) => {
              setData(data.data);
              setLayout(data.layout);
            })
            .catch((response) => {
              if (response.name !== "AbortError") {
                response.json().then((json) => {
                  console.log(json.message);
                });
              }
            });
        } else {
          setHasSelections(false);
        }
      } else if (mode === VIOLIN_MODES.GROUPBY) {
        if (dataset.selectedObs && dataset.selectedVar) {
          setHasSelections(true);
          fetchData("violin", {
            url: dataset.url,
            keys: dataset.selectedVar.name,
            selectedObs: dataset.selectedObs,
            scale: dataset.controls.standardScale,
          })
            .then((data) => {
              setData(data.data);
              setLayout(data.layout);
            })
            .catch((response) => {
              if (response.name !== "AbortError") {
                response.json().then((json) => {
                  console.log(json.message);
                });
              }
            });
        } else {
          setHasSelections(false);
        }
      }
    };
    // delay invoking the fetch function to avoid firing requests
    // while dependencies might still be getting updated by the user
    return _.debounce(func, 500);
  }, [
    mode,
    dataset.url,
    dataset.selectedObs,
    dataset.selectedVar,
    dataset.selectedMultiVar,
    dataset.controls.standardScale,
  ]);

  useEffect(() => {
    // create an abort controller to pass into each fetch function
    // to abort previous incompleted requests when a new request is fired
    const abortController = new AbortController();
    update(abortController);
    return () => {
      abortController.abort();
    };
  }, [update]);

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

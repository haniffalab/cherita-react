import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import Plot from "react-plotly.js";
import _ from "lodash";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import {
  PLOTLY_COLORSCALES,
  MATRIXPLOT_STANDARDSCALES,
} from "../../constants/constants";
import { ButtonGroup, ButtonToolbar, InputGroup } from "react-bootstrap";
import { fetchData } from "../../utils/requests";

export function MatrixplotControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colorScaleList = PLOTLY_COLORSCALES.map((item) => (
    <Dropdown.Item
      key={item}
      active={dataset.controls.colorScale === item}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: item,
        });
      }}
    >
      {item}
    </Dropdown.Item>
  ));

  const standardScaleList = MATRIXPLOT_STANDARDSCALES.map((item) => (
    <Dropdown.Item
      key={item.value}
      active={dataset.controls.standardScale === item.name}
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
        <Dropdown>
          <Dropdown.Toggle id="dropdownColorscale" variant="light">
            {dataset.controls.colorScale}
          </Dropdown.Toggle>
          <Dropdown.Menu>{colorScaleList}</Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroup.Text>Standard scale</InputGroup.Text>
          <Dropdown>
            <Dropdown.Toggle id="dropdownStandardScale" variant="light">
              {dataset.controls.standardScale}
            </Dropdown.Toggle>
            <Dropdown.Menu>{standardScaleList}</Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </ButtonGroup>
    </ButtonToolbar>
  );
}

export function Matrixplot() {
  const dataset = useDataset();
  const colorscale = useRef(dataset.controls.colorScale);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({});
  const [hasSelections, setHasSelections] = useState(false);

  const updateColorscale = useCallback((colorscale) => {
    setLayout((l) => {
      return {
        ...l,
        coloraxis: { ...l.coloraxis, colorscale: colorscale },
      };
    });
  }, []);

  const update = useMemo(() => {
    const func = (abortController) => {
      if (dataset.selectedObs && dataset.selectedMultiVar.length) {
        setHasSelections(true);
        fetchData(
          "matrixplot",
          {
            url: dataset.url,
            selectedObs: dataset.selectedObs,
            selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
            standardScale: dataset.controls.standardScale,
          },
          abortController.signal
        )
          .then((data) => {
            setData(data.data);
            setLayout(data.layout);
            updateColorscale(colorscale.current);
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
    };
    // delay invoking the fetch function to avoid firing requests
    // while dependencies might still be getting updated by the user
    return _.debounce(func, 500);
  }, [
    dataset.url,
    dataset.selectedObs,
    dataset.selectedMultiVar,
    dataset.controls.standardScale,
    updateColorscale,
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

  useEffect(() => {
    colorscale.current = dataset.controls.colorScale;
    updateColorscale(colorscale.current);
  }, [dataset.controls.colorScale, updateColorscale]);

  if (hasSelections) {
    return (
      <div className="cherita-matrixplot">
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
      <p>Select OBS and VAR</p>
    </div>
  );
}

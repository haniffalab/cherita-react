import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Plot from "react-plotly.js";
import _ from "lodash";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { PLOTLY_COLORSCALES } from "../../constants/constants";
import { fetchData } from "../../utils/requests";

export function HeatmapControls() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const colormapList = PLOTLY_COLORSCALES.map((item) => (
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

  return (
    <Dropdown>
      <Dropdown.Toggle id="dropdownColorscale" variant="light">
        {dataset.controls.colorScale}
      </Dropdown.Toggle>
      <Dropdown.Menu>{colormapList}</Dropdown.Menu>
    </Dropdown>
  );
}

export function Heatmap() {
  const dataset = useDataset();
  const colorscale = useRef(dataset.controls.colorScale);
  let [data, setData] = useState([]);
  let [layout, setLayout] = useState({});
  let [hasSelections, setHasSelections] = useState(false);

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
          "heatmap",
          {
            url: dataset.url,
            selectedObs: dataset.selectedObs,
            selectedMultiVar: dataset.selectedMultiVar.map((i) => i.name),
          },
          abortController.signal
        )
          .then((data) => {
            setData(data.data);
            setLayout(data.layout);
            updateColorscale(colorscale.current);
          })
          .catch((response) => {
            response.json().then((json) => {
              console.log(json.message);
            });
          });
      } else {
        setHasSelections(false);
      }
    };
    // delay invoking the fetch function to avoid firing requests
    // while dependencies might still be getting updated by the user
    return _.debounce(func, 500);
  }, [
    dataset.selectedMultiVar,
    dataset.selectedObs,
    dataset.url,
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
      <div className="cherita-heatmap">
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
    <div className="cherita-heatmap">
      <p>Select OBS and VAR</p>
    </div>
  );
}

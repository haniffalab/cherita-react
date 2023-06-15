import { React, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useDataset } from "./DatasetContext";

export function Heatmap() {
  const dataset = useDataset();
  let [data, setData] = useState([]);
  let [layout, setLayout] = useState({});
  let [hasSelections, setHasSelections] = useState(false);

  useEffect(() => {
    if (dataset.selectedObs && dataset.selectedMultiVar) {
      setHasSelections(true);
      fetch(new URL("heatmap", process.env.REACT_APP_API_URL), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dataset),
      })
        .then((response) => response.json())
        .then((data) => {
          setData(data.data);
          setLayout(data.layout);
        });
    } else {
      setHasSelections(false);
    }
  }, [dataset]);

  if (hasSelections) {
    return (
      <div className="container text-center">
        <h5>{dataset.url}</h5>
        <Plot
          data={data}
          layout={layout}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
  return (
    <div>
      <h5>{dataset.url}</h5>
      <p>Select OBS and VAR</p>
    </div>
  );
}

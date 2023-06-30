import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../context/DatasetContext";

export function ObsColsList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsColsList, setObsColsList] = useState([]);
  let [active, setActive] = useState(null);

  useEffect(() => {
    fetch(new URL("obs/cols", import.meta.env.VITE_API_URL), {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: dataset.url }),
    })
      .then((response) => response.json())
      .then((data) => {
        setObsColsList(data);
      });
  }, [dataset.url]);

  useEffect(() => {
    setActive(dataset.selectedObs);
  }, [dataset.selectedObs]);

  const obsList = obsColsList.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active === item && "active"
      }`}
      onClick={() => {
        dispatch({
          type: "obsSelected",
          obs: item,
        });
      }}
    >
      {item}
    </button>
  ));

  return (
    <div className="h-100">
      <h5>{dataset.url}</h5>
      <div className="list-group overflow-auto mh-100">{obsList}</div>
    </div>
  );
}

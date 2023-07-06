import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { fetchData } from "../../utils/requests";

export function ObsColsList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsColsList, setObsColsList] = useState([]);
  let [active, setActive] = useState(null);

  useEffect(() => {
    fetchData("obs/cols", { url: dataset.url })
      .then((data) => {
        setObsColsList(data);
      })
      .catch((response) => {
        response.json().then((json) => {
          console.log(json.message);
        });
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

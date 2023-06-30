import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "../context/DatasetContext";

export function VarNamesList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState([]);

  useEffect(() => {
    fetch(new URL("var/names", import.meta.env.VITE_API_URL), {
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
        setVarNames(data);
      });
  }, [dataset.url]);

  useEffect(() => {
    setActive(dataset.selectedVar);
  }, [dataset.selectedVar]);

  const varList = varNames.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active === item && "active"
      }`}
      onClick={() => {
        dispatch({
          type: "varSelected",
          var: item,
        });
      }}
    >
      {item}
    </button>
  ));

  return (
    <div className="h-100">
      <h5>{dataset.url}</h5>
      <div className="list-group overflow-auto mh-100">{varList}</div>
    </div>
  );
}

export function MultiVarNamesList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState([]);

  useEffect(() => {
    fetch(new URL("var/names", import.meta.env.VITE_API_URL), {
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
        setVarNames(data);
      });
  }, [dataset.url]);

  useEffect(() => {
    setActive(dataset.selectedMultiVar);
  }, [dataset.selectedMultiVar]);

  const varList = varNames.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active.includes(item) && "active"
      }`}
      onClick={() => {
        if (active.includes(item)) {
          dispatch({
            type: "multiVarDeselected",
            var: item,
          });
        } else {
          dispatch({
            type: "multiVarSelected",
            var: item,
          });
        }
      }}
    >
      {item}
    </button>
  ));

  return (
    <div className="h-100">
      <h5>{dataset.url}</h5>
      <div className="list-group overflow-auto mh-100">{varList}</div>
    </div>
  );
}

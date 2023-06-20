import "bootstrap/dist/css/bootstrap.min.css";
import { React, useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "./DatasetContext";

export function VarNamesList({ config = null, group = "default" }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState([]);

  const { url, selectedVar } = {
    url: dataset.url[config?.url || group],
    selectedVar: dataset.selectedVar[config?.selectedVar || group],
  };

  useEffect(() => {
    fetch(new URL("var/names", process.env.REACT_APP_API_URL), {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: url }),
    })
      .then((response) => response.json())
      .then((data) => {
        setVarNames(data);
      });
  }, [url]);

  useEffect(() => {
    setActive(selectedVar);
  }, [selectedVar]);

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
          key: config?.selectedVar || group,
          var: item,
        });
      }}
    >
      {item}
    </button>
  ));

  return (
    <div className="h-100">
      <h5>{url}</h5>
      <div className="list-group overflow-auto mh-100">{varList}</div>
    </div>
  );
}

export function MultiVarNamesList({ config = null, group = "default" }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState([]);

  const { url, selectedMultiVar } = {
    url: dataset.url[config?.url || group],
    selectedMultiVar:
      dataset.selectedMultiVar[config?.selectedMultiVar || group],
  };

  useEffect(() => {
    fetch(new URL("var/names", process.env.REACT_APP_API_URL), {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url: url }),
    })
      .then((response) => response.json())
      .then((data) => {
        setVarNames(data);
      });
  }, [url]);

  useEffect(() => {
    setActive(selectedMultiVar);
  }, [selectedMultiVar]);

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
            key: config?.selectedMultiVar || group,
            var: item,
          });
        } else {
          dispatch({
            type: "multiVarSelected",
            key: config?.selectedMultiVar || group,
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
      <h5>{url}</h5>
      <div className="list-group overflow-auto mh-100">{varList}</div>
    </div>
  );
}

import "bootstrap/dist/css/bootstrap.min.css";
import { React, useEffect, useState } from "react";
import { useDataset, useDatasetDispatch } from "./DatasetContext";

export function VarNamesList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState([]);

  useEffect(() => {
    fetch(new URL("var/names", process.env.REACT_APP_API_URL), {
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

  const varList = varNames.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active === item && "active"
      }`}
      onClick={() => {
        setActive(item);
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
    fetch(new URL("var/names", process.env.REACT_APP_API_URL), {
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

  const varList = varNames.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active.includes(item) && "active"
      }`}
      onClick={() => {
        if (active.includes(item)) {
          setActive(active.filter((a) => a !== item));
          dispatch({
            type: "multiVarDeselected",
            var: item,
          });
        } else {
          setActive([...active, item]);
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

export function VarColsList() {
  const dataset = useDataset();
  let [varColsList, setVarColsList] = useState([]);
  let [active, setActive] = useState([]);

  useEffect(() => {
    fetch(new URL("var/cols", process.env.REACT_APP_API_URL), {
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
        setVarColsList(data);
      });
  }, [dataset]);

  const varList = varColsList.map((item) => (
    <button
      type="button"
      key={item}
      className={`list-group-item list-grou-item-action ${
        active === item && "active"
      }`}
      onClick={() => {
        setActive(item);
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

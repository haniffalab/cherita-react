import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { fetchData } from "../../utils/requests";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SELECTION_MODES } from "../../constants/constants";

export function VarNamesList({ mode = SELECTION_MODES.SINGLE }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  let [varNames, setVarNames] = useState([]);
  let [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE ? null : []
  );

  useEffect(() => {
    fetchData("var/names", { url: dataset.url })
      .then((data) => {
        setVarNames(data);
      })
      .catch((response) => {
        response.json().then((json) => {
          console.log(json.message);
        });
      });
  }, [dataset.url]);

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE && dataset.selectedVar) {
      setActive(dataset.selectedVar.matrix_index);
    }
  }, [mode, dataset.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index));
    }
  }, [mode, dataset.selectedMultiVar]);

  const varList = varNames.map((item) => {
    if (mode === SELECTION_MODES.SINGLE) {
      return (
        <button
          type="button"
          key={item.matrix_index}
          className={`list-group-item list-grou-item-action ${
            active === item.matrix_index && "active"
          }`}
          onClick={() => {
            dispatch({
              type: "varSelected",
              var: item,
            });
          }}
        >
          {item.name}
        </button>
      );
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      return (
        <button
          type="button"
          key={item.matrix_index}
          className={`list-group-item list-grou-item-action ${
            active.includes(item.matrix_index) && "active"
          }`}
          onClick={() => {
            if (active.includes(item.matrix_index)) {
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
          {item.name}
        </button>
      );
    } else {
      return null;
    }
  });

  return (
    <div className="">
      <h4>{mode}</h4>
      <div className="list-group overflow-auto mh-100">{varList}</div>
    </div>
  );
}

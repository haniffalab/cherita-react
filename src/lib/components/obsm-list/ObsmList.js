import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { fetchData } from "../../utils/requests";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function ObsmKeysList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsmKeysList, setObsmKeysList] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetchData("obsm/keys", { url: dataset.url })
      .then((data) => {
        setObsmKeysList(data);
      })
      .catch((response) => {
        response.json().then((json) => {
          console.log(json.message);
        });
      });
  }, [dataset.url]);

  useEffect(() => {
    if (dataset.selectedObsm) {
      setActive(dataset.selectedObsm);
    }
  }, [dataset.selectedObsm]);

  const obsmList = obsmKeysList.map((item) => {
    return (
      <button
        type="button"
        key={item}
        className={`list-group-item list-grou-item-action ${
          active === item && "active"
        }`}
        onClick={() => {
          dispatch({
            type: "obsmSelected",
            obsm: item,
          });
        }}
      >
        {item}
      </button>
    );
  });

  return (
    <div className="">
      <div className="list-group overflow-auto mh-100">{obsmList}</div>
    </div>
  );
}

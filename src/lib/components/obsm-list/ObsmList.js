import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useFetch } from "../../utils/requests";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import { Alert } from "react-bootstrap";

export function ObsmKeysList() {
  const ENDPOINT = "obsm/keys";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsmKeysList, setObsmKeysList] = useState([]);
  const [active, setActive] = useState(null);
  const [params, setParams] = useState({
    url: dataset.url,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
  }, [dataset.url]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && !serverError) {
      setObsmKeysList(fetchedData);
    }
  }, [fetchedData, isPending, serverError]);

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

  if (!serverError) {
    return (
      <div className="">
        {isPending && <LoadingSpinner />}
        <div className="list-group overflow-auto mh-100">{obsmList}</div>
      </div>
    );
  } else {
    return (
      <div>
        <Alert variant="danger">{serverError.message}</Alert>
      </div>
    );
  }
}

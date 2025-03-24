import React, { useEffect, useState } from "react";

import {
  Dropdown,
  Button,
  DropdownButton,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

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
    if (!isPending && !serverError && fetchedData) {
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
      <Dropdown.Item
        key={item}
        className={`custom ${active === item && "active"}`}
        onClick={() => {
          dispatch({
            type: "select.obsm",
            obsm: item,
          });
        }}
      >
        {item}
      </Dropdown.Item>
    );
  });

  if (!serverError) {
    return (
      <>
        {isPending && <LoadingSpinner />}
        <DropdownButton
          as={ButtonGroup}
          title={dataset.selectedObsm || "Select an embedding"}
          variant={dataset.selectedObsm ? "primary" : "outline-primary"}
          id="bg-nested-dropdown"
          size="sm"
        >
          {obsmList}
        </DropdownButton>
      </>
    );
  } else {
    return (
      <OverlayTrigger
        placement="top"
        delay={{ show: 100, hide: 200 }}
        overlay={<Tooltip>{serverError.message}</Tooltip>}
      >
        <Button variant="danger">Error</Button>
      </OverlayTrigger>
    );
  }
}

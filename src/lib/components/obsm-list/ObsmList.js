import React, { useEffect, useState } from "react";

import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";
import { ObsmKeysListBtn } from "../../utils/Skeleton";

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
    if (isPending) {
      return <ObsmKeysListBtn />;
    }

    return (
      <DropdownButton
        as={ButtonGroup}
        title={dataset.selectedObsm || "Select an embedding"}
        variant={dataset.selectedObsm ? "primary" : "warning"}
        id="bg-nested-dropdown"
        size="sm"
      >
        <Dropdown.Header>Embeddings</Dropdown.Header>
        {obsmList}
      </DropdownButton>
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

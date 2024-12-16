import React, { useState } from "react";

import {
  faArrowDownAZ,
  faArrowUpZA,
  faArrowDown19,
  faArrowUp91,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Navbar, InputGroup } from "react-bootstrap";

import { VAR_SORT, VAR_SORT_ORDER } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

// @TODO: set option for "var" and "disease"
export function VarListToolbar({ varType = "var" }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [sort, setSort] = useState(dataset.varSort.var.sort);
  const [nameSortOrder, setNameSortOrder] = useState(
    dataset.varSort.var.sortOrder
  );
  const [matrixSortOrder, setMatrixSortOrder] = useState(
    dataset.varSort.var.sortOrder
  );

  const handleSort = (sortValue, sortOrder, setSortOrder) => {
    if (sort !== sortValue) {
      setSort(sortValue);
      dispatch({
        type: "set.varSort",
        var: varType,
        sort: sortValue,
        sortOrder: sortOrder,
      });
    } else {
      const newSortOrder =
        sortOrder === VAR_SORT_ORDER.ASC
          ? VAR_SORT_ORDER.DESC
          : VAR_SORT_ORDER.ASC;
      setSortOrder(newSortOrder);
      dispatch({
        type: "set.varSort",
        var: varType,
        sort: sortValue,
        sortOrder: newSortOrder,
      });
    }
  };

  return (
    <Navbar className="var-list-toolbar">
      <InputGroup>
        <InputGroup.Text>Sort by:</InputGroup.Text>

        <ToggleButtonGroup
          aria-label="Sort feature by"
          size="small"
          className="mh-100"
        >
          <ToggleButton
            value={VAR_SORT.NAME}
            aria-label="alphabetical"
            title="Sort alphabetically"
            selected={sort === VAR_SORT.NAME}
            onChange={() => {
              handleSort(VAR_SORT.NAME, nameSortOrder, setNameSortOrder);
            }}
          >
            {nameSortOrder === VAR_SORT_ORDER.ASC ? (
              <FontAwesomeIcon icon={faArrowDownAZ} />
            ) : (
              <FontAwesomeIcon icon={faArrowUpZA} />
            )}
          </ToggleButton>

          <ToggleButton
            value={VAR_SORT.MATRIX}
            aria-label="matrix value"
            title="Sort by matrix value"
            selected={sort === VAR_SORT.MATRIX}
            onChange={() => {
              handleSort(VAR_SORT.MATRIX, matrixSortOrder, setMatrixSortOrder);
            }}
          >
            {matrixSortOrder === VAR_SORT_ORDER.ASC ? (
              <FontAwesomeIcon icon={faArrowDown19} />
            ) : (
              <FontAwesomeIcon icon={faArrowUp91} />
            )}
          </ToggleButton>
          <ToggleButton
            value="none"
            aria-label="none"
            title="No sorting"
            onClick={() => {
              setSort(VAR_SORT.NONE);
              dispatch({
                type: "set.varSort.sort",
                var: varType,
                sort: VAR_SORT.NONE,
              });
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </ToggleButton>
        </ToggleButtonGroup>
      </InputGroup>
    </Navbar>
  );
}

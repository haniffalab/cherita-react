import React, { useState } from 'react';

import {
  faArrowDown19,
  faArrowDownAZ,
  faArrowUp91,
  faArrowUpZA,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { VAR_SORT, VAR_SORT_ORDER } from '../../constants/constants';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';

// @TODO: set option for "var" and "disease"
export function VarListToolbar({ varType = 'var' }) {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [sort, setSort] = useState(settings.varSort.var.sort);
  const [nameSortOrder, setNameSortOrder] = useState(
    settings.varSort.var.sortOrder,
  );
  const [matrixSortOrder, setMatrixSortOrder] = useState(
    settings.varSort.var.sortOrder,
  );

  const handleSort = (sortValue, sortOrder, setSortOrder) => {
    if (sort !== sortValue) {
      setSort(sortValue);
      dispatch({
        type: 'set.varSort',
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
        type: 'set.varSort',
        var: varType,
        sort: sortValue,
        sortOrder: newSortOrder,
      });
    }
  };

  return (
    <div className="d-flex justify-content-end align-items-center mb-2">
      <ToggleButtonGroup
        name="sortfeatures"
        aria-label="Sort features by"
        size="sm"
        type="radio"
      >
        <ToggleButton
          id={VAR_SORT.NAME}
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
          id={VAR_SORT.MATRIX}
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
          id="none"
          value="none"
          aria-label="none"
          title="No sorting"
          onClick={() => {
            setSort(VAR_SORT.NONE);
            dispatch({
              type: 'set.varSort.sort',
              var: varType,
              sort: VAR_SORT.NONE,
            });
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

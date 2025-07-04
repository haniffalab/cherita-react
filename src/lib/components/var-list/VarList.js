import React, { useEffect, useState } from "react";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Alert, Button, ListGroup } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { VarItem } from "./VarItem";
import { VarListToolbar } from "./VarListToolbar";
import { VarSet } from "./VarSet";
import { SELECTION_MODES, VAR_SORT } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

export const useVarMean = (varKeys, enabled = false) => {
  const ENDPOINT = "matrix/mean";
  const dataset = useDataset();
  const { obsIndices } = useFilteredData();
  const [params, setParams] = useState({
    url: dataset.url,
    varKeys: _.map(varKeys, (v) =>
      v.isSet ? { name: v.name, indices: v.vars.map((v) => v.index) } : v.index
    ),
    obsIndices: obsIndices,
    varNamesCol: dataset.varNamesCol,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        varKeys: _.map(varKeys, (v) =>
          v.isSet
            ? { name: v.name, indices: v.vars.map((v) => v.index) }
            : v.index
        ),
        obsIndices: obsIndices,
      };
    });
  }, [obsIndices, varKeys]);

  return useFetch(ENDPOINT, params, {
    enabled: enabled,
    refetchOnMount: false,
  });
};

// ensure nulls are lowest values
export const sortMeans = (i, means) => {
  return means[i.name] || _.min(_.values(means)) - 1;
};

export function VarNamesList({
  mode = SELECTION_MODES.SINGLE,
  displayName = "genes",
}) {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE
      ? settings.selectedVar?.matrix_index || settings.selectedVar?.name
      : settings.selectedMultiVar.map((i) => i.matrix_index || i.name)
  );
  const [sortedVars, setSortedVars] = useState([]);

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE) {
      setActive(
        settings.selectedVar?.matrix_index || settings.selectedVar?.name
      );
    }
  }, [mode, settings.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setActive(settings.selectedMultiVar.map((i) => i.matrix_index || i.name));
    }
  }, [mode, settings.selectedMultiVar]);

  const varMeans = useVarMean(
    settings.vars,
    settings.varSort.var.sort === VAR_SORT.MATRIX
  );

  // @TODO: deferr sortedVars ?
  useEffect(() => {
    if (settings.varSort.var.sort === VAR_SORT.MATRIX) {
      if (
        !varMeans.isPending &&
        !varMeans.serverError &&
        varMeans.fetchedData
      ) {
        setSortedVars(
          _.orderBy(
            settings.vars,
            (o) => {
              return sortMeans(o, varMeans.fetchedData);
            },
            settings.varSort.var.sortOrder
          )
        );
      }
    } else if (settings.varSort.var.sort === VAR_SORT.NAME) {
      setSortedVars(
        _.orderBy(settings.vars, "name", settings.varSort.var.sortOrder)
      );
    } else {
      setSortedVars(settings.vars);
    }
  }, [
    settings.varSort.var.sort,
    settings.varSort.var.sortOrder,
    varMeans.isPending,
    varMeans.serverError,
    varMeans.fetchedData,
    settings.vars,
  ]);

  const makeListItem = (item) => {
    return (
      <ListGroup.Item key={item.matrix_index}>
        <VarItem item={item} active={active} mode={mode} />
      </ListGroup.Item>
    );
  };

  const makeSetListItem = (set) => {
    return (
      <ListGroup.Item key={set.name}>
        <VarSet set={set} active={active} mode={mode} />
      </ListGroup.Item>
    );
  };

  const varList = _.map(sortedVars, (item) => {
    if (item.isSet) {
      return makeSetListItem(item);
    } else {
      return makeListItem(item);
    }
  });

  const newSetName = () => {
    let n = 1;
    let setName = `Set ${n}`;
    const nameExists = (name) => {
      return settings.vars.some((v) => v.name === name);
    };
    while (nameExists(setName)) {
      n++;
      setName = `Set ${n}`;
    }
    return setName;
  };

  const isPending =
    varMeans.isPending && settings.varSort.var.sort === VAR_SORT.MATRIX;

  return (
    <div className="mt-3 d-flex flex-column h-100">
      <div className="d-flex justify-content-between mb-2">
        <h5>{_.capitalize(displayName)}</h5>
        <ButtonGroup aria-label="Feature options" size="sm">
          <Button
            variant="info"
            onClick={() => {
              dispatch({
                type: "add.var",
                var: {
                  name: newSetName(),
                  vars: [],
                  isSet: true,
                },
              });
            }}
          >
            New set
          </Button>
          <Button
            variant="info"
            onClick={() => {
              dispatch({
                type: "reset.vars",
              });
            }}
          >
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            Clear
          </Button>
        </ButtonGroup>
      </div>
      <>
        {!varList.length ? (
          <Alert variant="light">Search for a feature.</Alert>
        ) : (
          <>
            <VarListToolbar />
            <div className="overflow-auto flex-grow-1 modern-scrollbars">
              {isPending && <LoadingSpinner />}
              <ListGroup variant="flush" className="cherita-list">
                {varList}
              </ListGroup>
            </div>
          </>
        )}
      </>
    </div>
  );
}

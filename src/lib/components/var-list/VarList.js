import React, { useEffect, useState } from "react";

import {
  faArrowDownAZ,
  faArrowUpZA,
  faArrowDown19,
  faArrowUp91,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Add } from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import _ from "lodash";
import { ListGroup, Button, Alert, Navbar, InputGroup } from "react-bootstrap";

import { VarItem } from "./VarItem";
import { VarSet } from "./VarSet";
import {
  SELECTION_MODES,
  VAR_SORT,
  VAR_SORT_ORDER,
} from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

const useVarMean = (varKeys, enabled = false) => {
  const ENDPOINT = "matrix/mean";
  const dataset = useDataset();
  const [params, setParams] = useState({
    url: dataset.url,
    varKeys: _.map(varKeys, (v) =>
      v.isSet ? { name: v.name, indices: v.vars.map((v) => v.index) } : v.index
    ),
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
      };
    });
  }, [varKeys]);

  return useFetch(ENDPOINT, params, { enabled: enabled });
};

// @TODO: display where disease data comes from
// add to disease dataset metadata
function DiseaseVarList({ makeListItem }) {
  const ENDPOINT = "disease/genes";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [diseaseVars, setDiseaseVars] = useState([]);
  const [params, setParams] = useState({
    url: dataset.url,
    col: dataset.varNamesCol,
    diseaseId: dataset.selectedDisease?.id,
    diseaseDatasets: dataset.diseaseDatasets,
  });

  useEffect(() => {
    setParams((p) => {
      return { ...p, diseaseId: dataset.selectedDisease?.id };
    });
  }, [dataset.selectedDisease]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    enabled: !!params.diseaseId,
  });

  useEffect(() => {
    if (!isPending && !serverError) {
      setDiseaseVars(fetchedData);
    }
  }, [fetchedData, isPending, serverError]);

  const diseaseVarList = _.map(diseaseVars, (item) => {
    return makeListItem(item, true);
  });

  return (
    <>
      {dataset.selectedDisease &&
        (!isPending && !fetchedData?.length ? (
          <>
            <div className="d-flex justify-content-between mt-3">
              <h5>Disease genes</h5>
            </div>
            <Alert variant="light">No disease genes found.</Alert>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between mt-3">
              <h5>Disease genes</h5>
              <Button
                variant="link"
                onClick={() => {
                  dispatch({
                    type: "reset.disease",
                  });
                }}
              >
                clear
              </Button>
            </div>
            <p>{dataset.selectedDisease?.name}</p>
            <ListGroup>
              {isPending ? <LoadingSpinner /> : diseaseVarList}
            </ListGroup>
          </>
        ))}
    </>
  );
}

function VarListToolbar() {
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
        var: "var",
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
        var: "var",
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
                var: "var",
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

export function VarNamesList({
  mode = SELECTION_MODES.SINGLE,
  displayName = "genes",
  showDiseaseVarList = true,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [varButtons, setVarButtons] = useState(
    mode === SELECTION_MODES.SINGLE
      ? dataset.selectedVar
        ? _.unionWith([dataset.selectedVar], dataset.varSets, _.isEqual)
        : [...dataset.varSets]
      : [...dataset.selectedMultiVar, ...dataset.varSets]
  );
  const [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE
      ? dataset.selectedVar?.matrix_index || dataset.selectedVar?.name
      : dataset.selectedMultiVar.map((i) => i.matrix_index || i.name)
  );
  const [sortedVarButtons, setSortedVarButtons] = useState([]);

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE) {
      setVarButtons((v) => {
        if (dataset.selectedVar) {
          return _.unionWith(v, [dataset.selectedVar], _.isEqual);
        } else {
          return v;
        }
      });
      setActive(dataset.selectedVar?.matrix_index || dataset.selectedVar?.name);
    }
  }, [mode, dataset.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setVarButtons((v) => {
        if (dataset.selectedMultiVar.length) {
          return _.unionWith(v, dataset.selectedMultiVar, _.isEqual);
        } else {
          return v;
        }
      });
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index || i.name));
    }
  }, [mode, dataset.selectedMultiVar]);

  useEffect(() => {
    setVarButtons((v) => {
      const updated = _.map(v, (i) => {
        if (i.isSet) {
          return dataset.varSets.find((s) => s.name === i.name);
        } else return i;
      });
      const newSets = _.difference(dataset.varSets, updated);
      return [...updated, ...newSets];
    });

    if (mode === SELECTION_MODES.SINGLE) {
      if (dataset.selectedVar?.isSet) {
        const selectedSet = dataset.varSets.find(
          (s) => s.name === dataset.selectedVar.name
        );
        dispatch({
          type: "select.var",
          var: selectedSet,
        });
      }
    } else {
      dispatch({
        type: "update.multivar",
        vars: dataset.varSets,
      });
    }
  }, [
    mode,
    dataset.varSets,
    dataset.selectedVar?.isSet,
    dataset.selectedVar?.name,
    dispatch,
  ]);

  const varMeans = useVarMean(
    varButtons,
    dataset.varSort.var.sort === VAR_SORT.MATRIX
  );

  // @TODO: deferr sortedVarButtons ?
  useEffect(() => {
    if (dataset.varSort.var.sort === VAR_SORT.MATRIX) {
      if (!varMeans.isPending && !varMeans.serverError) {
        setSortedVarButtons(
          _.orderBy(
            varButtons,
            (o) => {
              return varMeans.fetchedData[o.name];
            },
            dataset.varSort.var.sortOrder
          )
        );
      }
    } else if (dataset.varSort.var.sort === VAR_SORT.NAME) {
      setSortedVarButtons(
        _.orderBy(varButtons, "name", dataset.varSort.var.sortOrder)
      );
    } else {
      setSortedVarButtons(varButtons);
    }
  }, [
    dataset.varSort.var.sort,
    dataset.varSort.var.sortOrder,
    varButtons,
    varMeans.isPending,
    varMeans.serverError,
    varMeans.fetchedData,
  ]);

  const makeListItem = (item, isDiseaseGene = false) => {
    return (
      <ListGroup.Item key={item.matrix_index}>
        <VarItem
          item={item}
          active={active}
          setVarButtons={setVarButtons}
          mode={mode}
          isDiseaseGene={isDiseaseGene}
        />
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

  const varList = _.map(sortedVarButtons, (item) => {
    if (item.isSet) {
      return makeSetListItem(item);
    } else {
      return makeListItem(item);
    }
  });

  const newSetName = () => {
    let n = 1;
    let setName = `Set ${n}`;
    const setNameExists = (name) => {
      return dataset.varSets.some((set) => set.name === name);
    };
    while (setNameExists(setName)) {
      n++;
      setName = `Set ${n}`;
    }
    return setName;
  };

  return (
    <div className="position-relative">
      <div className="overflow-auto mt-3">
        <div className="d-flex justify-content-between">
          <h5>{_.capitalize(displayName)}</h5>
          <div>
            <Button
              variant="light"
              className="p-1"
              onClick={() => {
                dispatch({
                  type: "add.varSet",
                  varSet: {
                    name: newSetName(),
                    vars: [],
                    isSet: true,
                  },
                });
              }}
            >
              <Add />
              New set
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setVarButtons([]);
                dispatch({
                  type:
                    mode === SELECTION_MODES.SINGLE
                      ? "reset.var"
                      : "reset.multiVar",
                });
                dispatch({
                  type: "reset.varSets",
                });
              }}
            >
              clear
            </Button>
          </div>
        </div>
        {!varList.length ? (
          <Alert variant="light">Search for a feature.</Alert>
        ) : (
          <>
            <VarListToolbar />
            <>
              {dataset.varSort.var.sort !== VAR_SORT.NONE &&
                varMeans.isPending && <LoadingSpinner />}
              <ListGroup>{varList}</ListGroup>
            </>
          </>
        )}
        {showDiseaseVarList && <DiseaseVarList makeListItem={makeListItem} />}
      </div>
    </div>
  );
}

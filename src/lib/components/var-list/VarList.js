import "bootstrap/dist/css/bootstrap.min.css";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import _ from "lodash";
import { Button } from "react-bootstrap";
import { ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SELECTION_MODES } from "../../constants/constants";

export function VarNamesList({
  mode = SELECTION_MODES.SINGLE,
  displayName = "genes",
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [varButtons, setVarButtons] = useState(
    mode === SELECTION_MODES.SINGLE
      ? [dataset.selectedVar]
      : dataset.selectedMultiVar
  );
  const [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE
      ? dataset.selectedVar?.matrix_index
      : dataset.selectedMultiVar.map((i) => i.matrix_index)
  );

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE) {
      setVarButtons((v) => {
        if (dataset.selectedVar) {
          return _.unionWith(v, [dataset.selectedVar], _.isEqual);
        } else {
          return [];
        }
      });
      setActive(dataset.selectedVar?.matrix_index);
    }
  }, [mode, dataset.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setVarButtons((v) => {
        if (dataset.selectedMultiVar.length) {
          return _.unionWith(v, dataset.selectedMultiVar, _.isEqual);
        } else {
          return [];
        }
      });
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index));
    }
  }, [mode, dataset.selectedMultiVar]);

  const selectVar = useCallback(
    (item) => {
      if (mode === SELECTION_MODES.SINGLE) {
        dispatch({
          type: "varSelected",
          var: item,
        });
      } else if (mode === SELECTION_MODES.MULTIPLE) {
        dispatch({
          type: "multiVarSelected",
          var: item,
        });
      }
    },
    [dispatch, mode]
  );

  const makeList = useCallback(
    (vars) => {
      return vars.map((item) => {
        if (item && mode === SELECTION_MODES.SINGLE) {
          return (
            <ListGroup.Item key={item}>
              <div class="d-flex gap-1">
                <div class="flex-grow-1">{item.name}</div>

                <div>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </div>
                <div>
                  <Button
                    type="button"
                    key={item.matrix_index}
                    className={`m-0 p-0 px-1 btn-link ${
                      active === item.matrix_index && "active"
                    }`}
                    onClick={() => {
                      selectVar(item);
                    }}
                    disabled={item.matrix_index === -1}
                    title={
                      item.matrix_index === -1 ? "Not present in data" : ""
                    }
                  >
                    <FontAwesomeIcon icon={faDroplet} />
                  </Button>
                </div>
                <div>
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              </div>
            </ListGroup.Item>
          );
        } else if (mode === SELECTION_MODES.MULTIPLE) {
          return (
            <ListGroup.Item key={item}>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <Button
                    type="button"
                    key={item.matrix_index}
                    variant={
                      item.matrix_index !== -1
                        ? "outline-primary"
                        : "outline-secondary"
                    }
                    className={`${
                      active.includes(item.matrix_index) && "active"
                    } m-1`}
                    onClick={() => {
                      if (active.includes(item.matrix_index)) {
                        dispatch({
                          type: "multiVarDeselected",
                          var: item,
                        });
                      } else {
                        selectVar(item);
                      }
                    }}
                    disabled={item.matrix_index === -1}
                    title={
                      item.matrix_index === -1 ? "Not present in data" : ""
                    }
                  >
                    {item.name}
                  </Button>
                </div>
                <div>
                  {" "}
                  <FontAwesomeIcon icon={faPlus} />
                </div>
              </div>
            </ListGroup.Item>
          );
        } else {
          return null;
        }
      });
    },
    [active, dispatch, mode, selectVar]
  );

  const varList = useMemo(() => {
    return makeList(varButtons);
  }, [makeList, varButtons]);

  const diseaseVarList = useMemo(() => {
    return makeList(dataset.selectedDisease.genes);
  }, [makeList, dataset.selectedDisease.genes]);

  return (
    <div className="position-relative">
      <div className="overflow-auto mt-2">
        <div>
          <div className="d-flex justify-content-between">
            <h5>{_.capitalize(displayName)}</h5>
            <Button
              variant="link"
              onClick={() => {
                dispatch({
                  type:
                    mode === SELECTION_MODES.SINGLE
                      ? "reset.var"
                      : "reset.multiVar",
                });
              }}
            >
              clear
            </Button>
          </div>
          <ListGroup>{varList}</ListGroup>
        </div>
        <div>
          {dataset.selectedDisease?.id &&
            dataset.selectedDisease?.genes?.length > 0 && (
              <div>
                <div className="d-flex justify-content-between">
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
                {diseaseVarList}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

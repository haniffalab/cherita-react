import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useMemo } from "react";
import _ from "lodash";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SELECTION_MODES } from "../../constants/constants";
import { Button } from "react-bootstrap";
import { useCallback } from "react";

export function VarNamesList({ mode = SELECTION_MODES.SINGLE }) {
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
    if (mode === SELECTION_MODES.SINGLE && dataset.selectedVar) {
      setVarButtons((v) => {
        return _.unionWith(v, [dataset.selectedVar], _.isEqual);
      });
      setActive(dataset.selectedVar.matrix_index);
    }
  }, [mode, dataset.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setVarButtons((v) => {
        return _.unionWith(v, dataset.selectedMultiVar, _.isEqual);
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

  const varList = useMemo(() => {
    return varButtons.map((item) => {
      if (item && mode === SELECTION_MODES.SINGLE) {
        return (
          <Button
            type="button"
            key={item.matrix_index}
            variant="outline-primary"
            className={`${active === item.matrix_index && "active"} m-1`}
            onClick={() => {
              selectVar(item);
            }}
          >
            {item.name}
          </Button>
        );
      } else if (mode === SELECTION_MODES.MULTIPLE) {
        return (
          <Button
            type="button"
            key={item.matrix_index}
            variant="outline-primary"
            className={`${active.includes(item.matrix_index) && "active"} m-1`}
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
          >
            {item.name}
          </Button>
        );
      } else {
        return null;
      }
    });
  }, [active, dispatch, mode, selectVar, varButtons]);

  return (
    <div className="position-relative">
      <div className="overflow-auto mt-2">{varList}</div>
    </div>
  );
}

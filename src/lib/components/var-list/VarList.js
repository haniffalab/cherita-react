import React, { useCallback, useEffect, useState, useMemo } from "react";

import _ from "lodash";
import { ListGroup, Button } from "react-bootstrap";

import { VarItem } from "./VarItem";
import { SELECTION_MODES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";

export function VarNamesList({
  mode = SELECTION_MODES.SINGLE,
  displayName = "genes",
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [varButtons, setVarButtons] = useState(
    mode === SELECTION_MODES.SINGLE
      ? dataset.selectedVar
        ? [dataset.selectedVar]
        : []
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
          return v;
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
          return v;
        }
      });
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index));
    }
  }, [mode, dataset.selectedMultiVar]);

  const makeList = useCallback(
    (vars, isDiseaseGene = false) => {
      return vars.map((item) => (
        <ListGroup.Item key={item.matrix_index}>
          <VarItem
            item={item}
            active={active}
            setVarButtons={setVarButtons}
            mode={mode}
            isDiseaseGene={isDiseaseGene}
          />
        </ListGroup.Item>
      ));
    },
    [active, mode]
  );

  const varList = useMemo(() => {
    return makeList(varButtons);
  }, [makeList, varButtons]);

  const diseaseVarList = useMemo(() => {
    return makeList(dataset.selectedDisease.genes, true);
  }, [makeList, dataset.selectedDisease.genes]);

  return (
    <div className="position-relative">
      <div className="overflow-auto mt-3">
        <div className="d-flex justify-content-between">
          <h5>{_.capitalize(displayName)}</h5>
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
            }}
          >
            clear
          </Button>
        </div>
        <ListGroup>{varList}</ListGroup>
        {dataset.selectedDisease?.id &&
          dataset.selectedDisease?.genes?.length > 0 && (
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
              <ListGroup>{diseaseVarList}</ListGroup>
            </>
          )}
      </div>
    </div>
  );
}

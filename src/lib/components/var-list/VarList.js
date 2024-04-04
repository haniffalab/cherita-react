import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import _ from "lodash";
import { useFetch } from "../../utils/requests";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SELECTION_MODES } from "../../constants/constants";
import { Alert, Button } from "react-bootstrap";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import { SearchBar } from "../search-bar/SearchBar";

export function VarNamesList({ mode = SELECTION_MODES.SINGLE }) {
  const ENDPOINT = "var/names";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [varNames, setVarNames] = useState([]);
  const [updatedVarNames, setUpdatedVarNames] = useState(false);
  const [varButtons, setVarButtons] = useState(
    mode
      ? mode === SELECTION_MODES.SINGLE
        ? [dataset.selectVar]
        : dataset.selectedMultiVar
      : []
  );
  const [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE
      ? dataset.selectVar
      : dataset.selectedMultiVar
  );
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

  const validateSelection = useCallback(
    (selectedVar, mode) => {
      if (updatedVarNames) {
        if (mode === SELECTION_MODES.SINGLE) {
          if (selectedVar && !_.some(varNames, selectedVar)) {
            setActive(null);
            dispatch({
              type: "varSelected",
              var: null,
            });
          }
        } else {
          if (
            selectedVar.length &&
            !_.every(selectedVar, (v) => _.some(varNames, v))
          ) {
            setActive([]);
            dispatch({
              type: "multiVarReset",
              var: [],
            });
          }
        }
      }
    },
    [dispatch, varNames, updatedVarNames]
  );

  useEffect(() => {
    if (!isPending && !serverError) {
      setVarNames(fetchedData);
      setUpdatedVarNames(true);
    }
  }, [fetchedData, isPending, serverError]);

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE && dataset.selectedVar) {
      validateSelection(dataset.selectVar, mode);
      setActive(dataset.selectedVar.matrix_index);
    }
  }, [mode, dataset.selectedVar, dataset.selectVar, validateSelection]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      validateSelection(dataset.selectedMultiVar, mode);
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index));
    }
  }, [mode, dataset.selectedMultiVar, validateSelection]);

  const selectVar = (item) => {
    setVarButtons(() => {
      if (
        varButtons[0] &&
        varButtons.find((v) => v.matrix_index === item.matrix_index)
      ) {
        return varButtons;
      } else {
        return [...varButtons, item];
      }
    });
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
  };

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
              dispatch({
                type: "varSelected",
                var: item,
              });
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
                dispatch({
                  type: "multiVarSelected",
                  var: item,
                });
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
  }, [active, dispatch, mode, varButtons]);

  if (!serverError) {
    return (
      <div className="position-relative">
        <h4>{mode}</h4>
        {isPending && <LoadingSpinner />}
        <SearchBar
          data={varNames}
          displayName="features"
          onSelect={selectVar}
        />
        <div className="overflow-auto mt-2">{varList}</div>
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

import React, { useCallback } from "react";

import {
  faDroplet,
  faPlus,
  faCircleInfo,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SparkLineChart } from "@mui/x-charts";
import _ from "lodash";
import { ListGroup, Button } from "react-bootstrap";

import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

function VarHistogram({ item }) {
  const ENDPOINT = "var/histograms";
  const dataset = useDataset();
  const params = {
    url: dataset.url,
    matrix_index: item.matrix_index,
  };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  return (
    <div className="feature-histogram-container m-2">
      {isPending ? (
        <LoadingLinear />
      ) : !serverError && fetchedData ? (
        <div className="feature-histogram">
          <SparkLineChart
            plotType="bar"
            data={fetchedData.noscale}
            margin={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function VarItem({
  item,
  active,
  setVarButtons,
  mode = SELECTION_MODES.SINGLE,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const selectVar = useCallback(
    (item) => {
      if (mode === SELECTION_MODES.SINGLE) {
        dispatch({
          type: "select.var",
          var: item,
        });
        dispatch({
          type: "set.colorEncoding",
          value: "var",
        });
      } else if (mode === SELECTION_MODES.MULTIPLE) {
        dispatch({
          type: "select.multivar",
          var: item,
        });
      }
    },
    [dispatch, mode]
  );

  const removeVar = useCallback(
    (v) => {
      setVarButtons((b) => {
        return b.filter((i) => i.name !== v.name);
      });
      if (mode === SELECTION_MODES.SINGLE) {
        if (active === v.matrix_index) {
          dispatch({
            type: "deselect.var",
          });
        }
      } else if (mode === SELECTION_MODES.MULTIPLE) {
        if (active.includes(v.matrix_index)) {
          dispatch({
            type: "deselect.multivar",
            var: v,
          });
        }
      }
    },
    [active, dispatch, mode, setVarButtons]
  );

  if (item && mode === SELECTION_MODES.SINGLE) {
    return (
      <ListGroup.Item key={item.matrix_index}>
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.name}</div>
            <VarHistogram item={item} />
          </div>

          <div className="d-flex align-items-center gap-1">
            <FontAwesomeIcon icon={faCircleInfo} />
            <Button
              type="button"
              key={item.matrix_index}
              variant={
                dataset.colorEncoding === COLOR_ENCODINGS.VAR &&
                active === item.matrix_index
                  ? "primary"
                  : "outline-primary"
              }
              className="m-0 p-0 px-1"
              onClick={() => {
                selectVar(item);
              }}
              disabled={item.matrix_index === -1}
              title={
                item.matrix_index === -1
                  ? "Not present in data"
                  : "Set as color encoding"
              }
            >
              <FontAwesomeIcon icon={faDroplet} />
            </Button>
            <Button
              type="button"
              className="m-0 p-0 px-1"
              variant="outline-secondary"
              title="Remove from list"
              onClick={() => removeVar(item)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        </div>
      </ListGroup.Item>
    );
  } else if (mode === SELECTION_MODES.MULTIPLE) {
    return (
      <ListGroup.Item key={item.matrix_index}>
        <div className="d-flex">
          <div className="flex-grow-1">
            <Button
              type="button"
              key={item.matrix_index}
              variant={
                item.matrix_index !== -1 &&
                _.includes(active, item.matrix_index)
                  ? "primary"
                  : "outline-primary"
              }
              className="m-0 p-0 px-1"
              onClick={() => {
                if (active.includes(item.matrix_index)) {
                  dispatch({
                    type: "deselect.multivar",
                    var: item,
                  });
                } else {
                  selectVar(item);
                }
              }}
              disabled={item.matrix_index === -1}
              title={item.matrix_index === -1 ? "Not present in data" : ""}
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
}

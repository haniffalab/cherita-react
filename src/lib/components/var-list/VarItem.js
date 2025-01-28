import React, { useEffect, useState } from "react";

import { faDroplet, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MoreVert } from "@mui/icons-material";
import _ from "lodash";
import { Button, Collapse, ListGroup, Table } from "react-bootstrap";

import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { Histogram } from "../../utils/Histogram";
import { useFetch, useDebouncedFetch } from "../../utils/requests";
import { VirtualizedList } from "../../utils/VirtualizedList";

function VarHistogram({ item }) {
  const ENDPOINT = "var/histograms";
  const dataset = useDataset();
  const { obsIndices } = useFilteredData();
  // @TODO: consider using Filter's isSliced; would trigger more re-renders/requests
  // const { obsIndices, isSliced } = useFilteredData();
  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;
  const [params, setParams] = useState({
    url: dataset.url,
    varKey: item.matrix_index,
    obsIndices: isSliced ? [...(obsIndices || [])] : null,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        obsIndices: isSliced ? [...(obsIndices || [])] : null,
      };
    });
  }, [obsIndices, isSliced]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    {
      refetchOnMount: false,
    }
  );

  return (
    !serverError && (
      <Histogram data={fetchedData} isPending={isPending} altColor={isSliced} />
    )
  );
}

function VarDiseaseInfoItem(item) {
  const dispatch = useDatasetDispatch();
  return (
    <ListGroup.Item key={item.disease_name} className="feature-disease-info">
      <div>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => {
            dispatch({
              type: "select.disease",
              id: item.disease_id,
              name: item.disease_name,
            });
          }}
        >
          {item.disease_name}
        </button>
        <br />
        <Table striped>
          <tbody>
            <tr>
              <td>Confidence</td>
              <td>{item.confidence || "unknown"}</td>
            </tr>
            <tr>
              <td>Organ{item.organs.length > 1 ? "s" : ""}</td>
              <td>{item.organs.map((o) => o.name).join(", ")}</td>
            </tr>
            {!_.isEmpty(item.metadata) &&
              _.map(item.metadata, (value, key) => {
                if (value !== null && value !== undefined) {
                  return (
                    <tr>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  );
                }
              })}
          </tbody>
        </Table>
      </div>
    </ListGroup.Item>
  );
}

function VarDiseaseInfo({ data }) {
  return (
    <>
      <ListGroup>
        <VirtualizedList
          getDataAtIndex={(index) => data[index]}
          count={data.length}
          estimateSize={140}
          maxHeight="100%"
          ItemComponent={VarDiseaseInfoItem}
        />
      </ListGroup>
    </>
  );
}

export function SingleSelectionItem({
  item,
  isActive,
  selectVar,
  removeVar,
  isDiseaseGene = false,
  showSetColorEncoding = true,
  showRemove = true,
}) {
  const ENDPOINT = "disease/gene";
  const [openInfo, setOpenInfo] = useState(false);
  const dataset = useDataset();
  const params = {
    geneName: item.name,
    diseaseDatasets: dataset.diseaseDatasets,
  };
  const isNotInData = item.matrix_index === -1;

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
    enabled: !!dataset.diseaseDatasets.length,
  });

  const hasDiseaseInfo = !isPending && !serverError && !!fetchedData.length;

  return (
    <>
      <div
        className={`d-flex justify-content-between ${
          hasDiseaseInfo ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          setOpenInfo((o) => !o);
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>{item.name}</div>

          <div className="d-flex align-items-center gap-1">
            {hasDiseaseInfo && <MoreVert />}
            {!isDiseaseGene && <VarHistogram item={item} />}
            {showSetColorEncoding && (
              <Button
                type="button"
                key={item.matrix_index}
                variant={
                  isActive
                    ? "primary"
                    : isNotInData
                      ? "outline-secondary"
                      : "outline-primary"
                }
                className="m-0 p-0 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  selectVar();
                }}
                disabled={isNotInData}
                title={
                  isNotInData ? "Not present in data" : "Set as color encoding"
                }
              >
                <FontAwesomeIcon icon={faDroplet} />
              </Button>
            )}
            {(!isDiseaseGene || !showRemove) && (
              <Button
                type="button"
                className="m-0 p-0 px-1"
                variant="outline-secondary"
                title="Remove from list"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVar();
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        </div>
      </div>
      {hasDiseaseInfo && (
        <Collapse in={openInfo}>
          <div className="mt-2 var-disease-info-collapse">
            <VarDiseaseInfo data={fetchedData} />
          </div>
        </Collapse>
      )}
    </>
  );
}

function MultipleSelectionItem({ item, isActive, toggleVar }) {
  const isNotInData = item.matrix_index === -1;
  return (
    <>
      <div className="d-flex">
        <div className="flex-grow-1">
          <Button
            type="button"
            key={item.matrix_index}
            variant={isActive ? "primary" : "outline-primary"}
            className="m-0 p-0 px-1"
            onClick={toggleVar}
            disabled={isNotInData}
            title={isNotInData ? "Not present in data" : item.name}
          >
            {item.name}
          </Button>
        </div>
      </div>
    </>
  );
}

export function VarItem({
  item,
  active,
  setVarButtons,
  mode = SELECTION_MODES.SINGLE,
  isDiseaseGene = false,
}) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const selectVar = () => {
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
  };

  const removeVar = () => {
    setVarButtons((b) => {
      return b.filter((i) => i.name !== item.name);
    });
    if (mode === SELECTION_MODES.SINGLE) {
      if (active === item.matrix_index) {
        dispatch({
          type: "reset.var",
        });
      }
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      if (active.includes(item.matrix_index)) {
        dispatch({
          type: "deselect.multivar",
          var: item,
        });
      }
    }
  };

  const toggleVar = () => {
    if (active.includes(item.matrix_index)) {
      dispatch({
        type: "deselect.multivar",
        var: item,
      });
    } else {
      selectVar(item);
    }
  };

  if (item && mode === SELECTION_MODES.SINGLE) {
    return (
      <SingleSelectionItem
        item={item}
        isActive={
          dataset.colorEncoding === COLOR_ENCODINGS.VAR &&
          active === item.matrix_index
        }
        selectVar={selectVar}
        removeVar={removeVar}
        isDiseaseGene={isDiseaseGene}
      />
    );
  } else if (mode === SELECTION_MODES.MULTIPLE) {
    return (
      <MultipleSelectionItem
        item={item}
        isActive={
          item.matrix_index !== -1 && _.includes(active, item.matrix_index)
        }
        toggleVar={toggleVar}
      />
    );
  } else {
    return null;
  }
}

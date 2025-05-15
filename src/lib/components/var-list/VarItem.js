import React, { useEffect, useState } from "react";

import { faDroplet, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MoreVert } from "@mui/icons-material";
import _ from "lodash";
import { Button, Collapse, ListGroup, Table } from "react-bootstrap";

import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { Histogram } from "../../utils/Histogram";
import { useDebouncedFetch, useFetch } from "../../utils/requests";
import { VirtualizedList } from "../../utils/VirtualizedList";

function VarHistogram({ item }) {
  const ENDPOINT = "var/histograms";
  const dataset = useDataset();
  const settings = useSettings();
  const { obsIndices } = useFilteredData();
  // @TODO: consider using Filter's isSliced; would trigger more re-renders/requests
  // const { obsIndices, isSliced } = useFilteredData();
  const isSliced = settings.sliceBy.obs || settings.sliceBy.polygons;
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
  return (
    <ListGroup.Item key={item.disease_id} className="feature-disease-info">
      <button type="button" className="btn btn-link disease-link">
        {item.disease_name}
      </button>
      <Table striped size="sm" responsive>
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
                  <tr key={key}>
                    <td>{_.upperFirst(key)}</td>
                    <td>{value}</td>
                  </tr>
                );
              }
            })}
        </tbody>
      </Table>
    </ListGroup.Item>
  );
}

export function VarDiseaseInfo({ data }) {
  return (
    <VirtualizedList
      getDataAtIndex={(index) => data[index]}
      count={data.length}
      estimateSize={140}
      maxHeight="40vh"
      ItemComponent={VarDiseaseInfoItem}
    />
  );
}

export function SelectionItem({
  item,
  isActive,
  selectVar,
  removeVar,
  isDiseaseGene = false,
  showSetColorEncoding = true,
  showRemove = true,
  isMultiple = false,
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
    enabled: !!dataset.diseaseDatasets.length && isDiseaseGene,
  });

  const hasDiseaseInfo = !isPending && !serverError && !!fetchedData?.length;

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
                {isMultiple && (
                  <FontAwesomeIcon
                    icon={faPlus}
                    size="xs"
                    className="ps-xs-1"
                  />
                )}
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

export function VarItem({
  item,
  active,
  mode = SELECTION_MODES.SINGLE,
  isDiseaseGene = false,
}) {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  const selectVar = () => {
    if (mode === SELECTION_MODES.SINGLE) {
      dispatch({
        type: "select.var",
        var: item,
      });
      dispatch({
        type: "set.colorEncoding",
        value: COLOR_ENCODINGS.VAR,
      });
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      dispatch({
        type: "select.multivar",
        var: item,
      });
      dispatch({
        type: "set.colorEncoding",
        value: COLOR_ENCODINGS.VAR,
      });
    }
  };

  const removeVar = () => {
    dispatch({
      type: "remove.var",
      var: item,
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
    dispatch({
      type: "toggle.multivar",
      var: item,
    });
  };

  if (item && mode === SELECTION_MODES.SINGLE) {
    return (
      <SelectionItem
        item={item}
        isActive={
          settings.colorEncoding === COLOR_ENCODINGS.VAR &&
          active === item.matrix_index
        }
        selectVar={selectVar}
        removeVar={removeVar}
        isDiseaseGene={isDiseaseGene}
      />
    );
  } else if (mode === SELECTION_MODES.MULTIPLE) {
    return (
      <SelectionItem
        item={item}
        isActive={
          item.matrix_index !== -1 && _.includes(active, item.matrix_index)
        }
        selectVar={toggleVar}
        removeVar={removeVar}
        isDiseaseGene={isDiseaseGene}
        isMultiple={true}
      />
    );
  } else {
    return null;
  }
}

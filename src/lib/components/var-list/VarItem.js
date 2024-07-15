import React, { useEffect, useState } from "react";

import {
  faDroplet,
  faCircleInfo,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SparkLineChart } from "@mui/x-charts";
import {
  blueberryTwilightPalette,
  mangoFusionPalette,
} from "@mui/x-charts/colorPalettes";
import _ from "lodash";
import { Button, Collapse, ListGroup, Table } from "react-bootstrap";

import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFilteredData } from "../../context/FilterContext";
import { LoadingLinear } from "../../utils/LoadingIndicators";
import { useFetch, useDebouncedFetch } from "../../utils/requests";
import { VirtualizedList } from "../../utils/VirtualizedList";

function VarHistogram({ item }) {
  const ENDPOINT = "var/histograms";
  const dataset = useDataset();
  const filteredData = useFilteredData();
  const isSliced = dataset.sliceBy.obs || dataset.sliceBy.polygons;
  const [params, setParams] = useState({
    url: dataset.url,
    var_index: item.matrix_index,
    obs_indices: isSliced && Array.from(filteredData.obsIndices || []),
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        obs_indices: isSliced && Array.from(filteredData.obsIndices || []),
      };
    });
  }, [filteredData.obsIndices, isSliced]);

  const { fetchedData, isPending, serverError } = useDebouncedFetch(
    ENDPOINT,
    params,
    {
      refetchOnMount: false,
    }
  );

  return (
    <div className="feature-histogram-container m-2">
      {isPending ? (
        <LoadingLinear />
      ) : !serverError && fetchedData ? (
        <div className="feature-histogram">
          <SparkLineChart
            plotType="bar"
            data={fetchedData.log10}
            margin={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
            colors={isSliced ? mangoFusionPalette : blueberryTwilightPalette}
            showHighlight={true}
            showTooltip={true}
            valueFormatter={(v, { dataIndex }) =>
              `${fetchedData.hist[dataIndex].toLocaleString()}`
            }
            xAxis={{
              data: _.range(fetchedData.bin_edges?.length) || null,
              valueFormatter: (v) =>
                `Bin [${fetchedData.bin_edges[
                  v
                ][0].toLocaleString()}, ${fetchedData.bin_edges[
                  v
                ][1].toLocaleString()}${
                  v === fetchedData.bin_edges.length - 1 ? "]" : ")"
                }`,
            }}
            slotProps={{
              popper: {
                className: "feature-histogram-tooltip",
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function VarDiseaseInfoItem({ data, index }) {
  const item = data[index];

  return (
    <ListGroup.Item className="feature-disease-info">
      <div>
        {item.disease_name} <br />
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
            {!!item.metadata?.length &&
              item.metadata.map((m) => {
                return (
                  <tr>
                    <td>{m.key}</td>
                    <td>{m.value}</td>
                  </tr>
                );
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
          data={data}
          count={data.length}
          estimateSize={70}
          maxHeight="40vh"
          ItemComponent={VarDiseaseInfoItem}
        />
      </ListGroup>
    </>
  );
}

function SingleSelectionItem({
  item,
  isActive,
  selectVar,
  removeVar,
  isDiseaseGene,
}) {
  const ENDPOINT = "disease/gene";
  const [openInfo, setOpenInfo] = useState(false);
  const dataset = useDataset();
  const params = {
    geneName: item.name,
    diseaseDatasets: dataset.diseaseDatasets,
  };

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params);

  return (
    <>
      <div
        className="d-flex justify-content-between cursor-pointer"
        onClick={() => {
          setOpenInfo((o) => !o);
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>{item.name}</div>
          {!isDiseaseGene && <VarHistogram item={item} />}
        </div>

        <div className="d-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCircleInfo} />
          <Button
            type="button"
            key={item.matrix_index}
            variant={isActive ? "primary" : "outline-primary"}
            className="m-0 p-0 px-1"
            onClick={(e) => {
              e.stopPropagation();
              selectVar();
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
          {!isDiseaseGene && (
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
      {!isPending && !serverError && !!fetchedData.length && (
        <Collapse in={openInfo}>
          <div className="mt-2">
            <VarDiseaseInfo data={fetchedData} />
          </div>
        </Collapse>
      )}
    </>
  );
}

function MultipleSelectionItem({ item, isActive, toggleVar }) {
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
            disabled={item.matrix_index === -1}
            title={item.matrix_index === -1 ? "Not present in data" : ""}
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

  const selectVar = (v) => {
    if (mode === SELECTION_MODES.SINGLE) {
      dispatch({
        type: "select.var",
        var: v,
      });
      dispatch({
        type: "set.colorEncoding",
        value: "var",
      });
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      dispatch({
        type: "select.multivar",
        var: v,
      });
    }
  };

  const removeVar = (v) => {
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
  };

  const toggleVar = (v) => {
    if (active.includes(v.matrix_index)) {
      dispatch({
        type: "deselect.multivar",
        var: v,
      });
    } else {
      selectVar(v);
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
        selectVar={() => selectVar(item)}
        removeVar={() => removeVar(item)}
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
        toggleVar={() => toggleVar(item)}
      />
    );
  } else {
    return null;
  }
}

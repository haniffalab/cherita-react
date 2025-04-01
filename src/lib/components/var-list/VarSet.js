import React, { useState } from "react";

import {
  faCircleInfo,
  faDroplet,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { List } from "@mui/icons-material";
import _ from "lodash";
import {
  Button,
  Collapse,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SearchBar } from "../search-bar/SearchBar";
import { SingleSelectionItem } from "./VarItem";

// @TODO: add button to score genes and plot

const addVarToSet = (dispatch, set, v) => {
  dispatch({
    type: "add.varSet.var",
    varSet: set,
    var: v,
  });
};

function SingleSelectionSet({
  set,
  isActive,
  selectSet,
  removeSet,
  removeSetVar,
  showSearchBar = true,
}) {
  const [openSet, setOpenSet] = useState(false);

  const varList = set.vars.length ? (
    _.map(set.vars, (v) => {
      return (
        <ListGroup.Item key={v.name}>
          <SingleSelectionItem
            item={v}
            showSetColorEncoding={false}
            removeVar={() => removeSetVar(v)}
          />
        </ListGroup.Item>
      );
    })
  ) : (
    <ListGroup.Item>
      <div className="text-muted">No features in this set</div>
    </ListGroup.Item>
  );

  return (
    <>
      <div
        className="d-flex justify-content-between cursor-pointer"
        onClick={() => {
          setOpenSet((o) => !o);
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>{set.name}</div>

          <div className="d-flex align-items-center gap-1">
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  This set represents the mean value of its features
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon>
            </OverlayTrigger>
            <List />
            {/* <VarHistogram set={set} /> */}
            <Button
              type="button"
              key={set.name}
              variant={isActive ? "primary" : "outline-primary"}
              className="m-0 p-0 px-1"
              onClick={(e) => {
                e.stopPropagation();
                selectSet();
              }}
              disabled={!set.vars.length}
              title="Set as color encoding"
            >
              <FontAwesomeIcon icon={faDroplet} />
            </Button>
            <Button
              type="button"
              className="m-0 p-0 px-1"
              variant="outline-secondary"
              title="Remove from list"
              onClick={(e) => {
                e.stopPropagation();
                removeSet();
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        </div>
      </div>
      <Collapse in={openSet}>
        <div className="mt-2">
          {showSearchBar && ( // @TODO: fix how results are displayed, should be placed on top of parent components
            <SearchBar handleSelect={(d, i) => addVarToSet(d, set, i)} />
          )}
          <div className="mx-2">
            <ListGroup variant="flush" className="cherita-list">
              {varList}
            </ListGroup>
          </div>
        </div>
      </Collapse>
    </>
  );
}

function MultipleSelectionSet({ set, isActive, toggleSet }) {
  return (
    <>
      <div className="d-flex">
        <div className="flex-grow-1">
          <Button
            type="button"
            key={set.name}
            variant={isActive ? "primary" : "outline-primary"}
            className="m-0 p-0 px-1"
            onClick={toggleSet}
            title={set.name}
          >
            {set.name}
          </Button>
        </div>
      </div>
    </>
  );
}

export function VarSet({ set, active, mode = SELECTION_MODES.SINGLE }) {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();

  const selectSet = () => {
    if (mode === SELECTION_MODES.SINGLE) {
      dispatch({
        type: "select.var",
        var: set,
      });
      dispatch({
        type: "set.colorEncoding",
        value: "var",
      });
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      dispatch({
        type: "select.multivar",
        var: set,
      });
    }
  };

  const removeSet = () => {
    if (mode === SELECTION_MODES.SINGLE) {
      if (active === set.name) {
        dispatch({
          type: "reset.var",
        });
      }
    } else if (mode === SELECTION_MODES.MULTIPLE) {
      if (active.includes(set.name)) {
        dispatch({
          type: "deselect.multivar",
          var: set,
        });
      }
    }
    dispatch({
      type: "remove.varSet",
      varSet: set,
    });
  };

  const removeSetVar = (v) => {
    dispatch({
      type: "remove.varSet.var",
      varSet: set,
      var: v,
    });
  };

  const toggleSet = () => {
    if (active.includes(set.name)) {
      dispatch({
        type: "deselect.multivar",
        var: set,
      });
    } else {
      selectSet();
    }
  };

  if (set && mode === SELECTION_MODES.SINGLE) {
    return (
      <SingleSelectionSet
        set={set}
        isActive={
          dataset.colorEncoding === COLOR_ENCODINGS.VAR && active === set.name
        }
        selectSet={selectSet}
        removeSet={removeSet}
        removeSetVar={(v) => removeSetVar(v)}
      />
    );
  } else if (mode === SELECTION_MODES.MULTIPLE) {
    return (
      <MultipleSelectionSet
        set={set}
        isActive={_.includes(active, set.name)}
        toggleSet={() => toggleSet(set)}
      />
    );
  } else {
    return null;
  }
}

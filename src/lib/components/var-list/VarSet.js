import React, { useState } from "react";

import {
  faChevronDown,
  faChevronUp,
  faCircleInfo,
  faDroplet,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import {
  Button,
  Collapse,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import { SelectionItem } from "./VarItem";
import { COLOR_ENCODINGS, SELECTION_MODES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { SearchModal } from "../search-bar/SearchBar";

// @TODO: add button to score genes and plot

const addVarToSet = (dispatch, set, v) => {
  dispatch({
    type: "add.varSet.var",
    varSet: set,
    var: v,
  });
};

function SelectionSet({
  set,
  isActive,
  selectSet,
  removeSet,
  removeSetVar,
  isMultiple = false,
}) {
  const [openSet, setOpenSet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  const varList = set.vars.length ? (
    _.map(set.vars, (v) => {
      return (
        <ListGroup.Item key={v.name}>
          <SelectionItem
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
          <div className="ellipsis-text" title={set.name}>
            {set.name}
          </div>

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
            <Button
              type="button"
              variant="outline-primary"
              className="m-0 p-0 px-1"
              disabled={!set.vars.length}
              title="Open set"
            >
              <FontAwesomeIcon icon={openSet ? faChevronUp : faChevronDown} />
            </Button>
            {/* <VarHistogram set={set} /> */}
            <Button
              type="button"
              variant="outline-primary"
              className="m-0 p-0 px-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              title="Add to set"
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button
              type="button"
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
              {isMultiple && (
                <FontAwesomeIcon icon={faPlus} size="xs" className="ps-xs-1" />
              )}
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
          <ListGroup variant="flush" className="cherita-list var-set-list">
            {varList}
          </ListGroup>
        </div>
      </Collapse>
      <SearchModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        text={searchText}
        setText={setSearchText}
        displayText={"features"}
        handleSelect={(d, i) => {
          addVarToSet(d, set, i);
        }}
        searchVar={true}
        searchDiseases={false}
      />
    </>
  );
}

export function VarSet({ set, active, mode = SELECTION_MODES.SINGLE }) {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

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
      type: "remove.var",
      var: set,
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
    dispatch({
      type: "toggle.multivar",
      var: set,
    });
  };

  if (set && mode === SELECTION_MODES.SINGLE) {
    return (
      <SelectionSet
        set={set}
        isActive={
          settings.colorEncoding === COLOR_ENCODINGS.VAR && active === set.name
        }
        selectSet={selectSet}
        removeSet={removeSet}
        removeSetVar={(v) => removeSetVar(v)}
      />
    );
  } else if (mode === SELECTION_MODES.MULTIPLE) {
    return (
      <SelectionSet
        set={set}
        isActive={_.includes(active, set.name)}
        selectSet={toggleSet}
        removeSet={removeSet}
        removeSetVar={(v) => removeSetVar(v)}
        isMultiple={true}
      />
    );
  } else {
    return null;
  }
}

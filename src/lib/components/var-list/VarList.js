import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useMemo } from "react";
import _ from "lodash";
import { useFetch } from "../../utils/requests";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { SELECTION_MODES } from "../../constants/constants";
import { Form, FormGroup, Dropdown, Button } from "react-bootstrap";

export function VarSearchBar({ varNames = [], onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState("");

  const getSuggestions = useMemo(() => {
    const filter = (text) => {
      if (text.length > 0) {
        const regex = new RegExp(`^${text}`, `i`);
        const filter = varNames.sort().filter((v) => regex.test(v.name));
        setSuggestions(filter);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };
    return _.debounce(filter, 300);
  }, [varNames]);

  useEffect(() => {
    getSuggestions(text);
  }, [getSuggestions, text]);

  const suggestionsList = suggestions.map((item) => (
    <Dropdown.Item
      key={item.name}
      as="button"
      onClick={() => {
        onSelect(item);
      }}
    >
      {item.name}
    </Dropdown.Item>
  ));

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <Form.Label>Feature:</Form.Label>
          <Form.Control
            onFocus={() => {
              setShowSuggestions(text.length > 0);
            }}
            onBlur={() => {
              _.delay(() => {
                setShowSuggestions(false);
              }, 150);
            }}
            type="text"
            placeholder="Search for a feature"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Dropdown.Menu
            style={{ width: "90%", maxHeight: "25vh", overflowY: "scroll" }}
            show={showSuggestions}
          >
            {suggestionsList}
          </Dropdown.Menu>
        </FormGroup>
      </Form>
    </div>
  );
}

export function VarNamesList({ mode = SELECTION_MODES.SINGLE }) {
  const ENDPOINT = "var/names";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [varNames, setVarNames] = useState([]);
  const [varButtons, setVarButtons] = useState(
    mode
      ? mode === SELECTION_MODES.SINGLE
        ? [dataset.selectVar]
        : dataset.selectedMultiVar
      : []
  );
  const [active, setActive] = useState(
    mode === SELECTION_MODES.SINGLE ? null : []
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

  const { fetchedData, isPending, serverError } = useFetch(
    ENDPOINT,
    params,
    []
  );

  useEffect(() => {
    if (!isPending && !serverError) {
      setVarNames(fetchedData);
    }
  }, [fetchedData, isPending, serverError]);

  useEffect(() => {
    if (mode === SELECTION_MODES.SINGLE && dataset.selectedVar) {
      setActive(dataset.selectedVar.matrix_index);
    }
  }, [mode, dataset.selectedVar]);

  useEffect(() => {
    if (mode === SELECTION_MODES.MULTIPLE) {
      setActive(dataset.selectedMultiVar.map((i) => i.matrix_index));
    }
  }, [mode, dataset.selectedMultiVar]);

  const selectVar = (item) => {
    setVarButtons(() => {
      if (varButtons.find((v) => v.matrix_index === item.matrix_index)) {
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
      if (mode === SELECTION_MODES.SINGLE) {
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

  return (
    <div className="">
      <h4>{mode}</h4>
      <VarSearchBar varNames={varNames} onSelect={selectVar} />
      <div className="overflow-auto mt-2">{varList}</div>
    </div>
  );
}

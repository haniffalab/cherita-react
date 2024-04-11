import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { Dropdown, Form, FormGroup } from "react-bootstrap";
import { useVarSearch } from "../../utils/search";
import { useDeferredValue } from "react";

export function SearchBar() {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [text, setText] = useState("");
  const displayName = "features";

  const {
    setParams,
    data: { fetchedData = [], isPending, serverError },
    onSelect,
  } = useVarSearch();
  const deferredData = useDeferredValue(suggestions);
  const isStale = deferredData !== fetchedData;

  const updateParams = useMemo(() => {
    const setData = (text) => {
      if (text.length) {
        setParams((p) => {
          return { ...p, text: text };
        });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    return _.debounce(setData, 300);
  }, [setParams]);

  useEffect(() => {
    updateParams(text);
  }, [setParams, text, updateParams]);

  useEffect(() => {
    if (!isPending && !serverError) {
      setSuggestions(fetchedData);
      setShowSuggestions(true);
    }
  }, [fetchedData, isPending, serverError]);

  const suggestionsList = useMemo(() => {
    return deferredData?.map((item) => (
      <Dropdown.Item
        key={item.name}
        as="button"
        disabled={isStale}
        onClick={() => {
          onSelect(item);
        }}
      >
        {item.name}
      </Dropdown.Item>
    ));
  }, [deferredData, isStale, onSelect]);

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup>
          <Form.Label>{"Search " + displayName}</Form.Label>
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
            placeholder={"Search " + displayName}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <Dropdown.Menu
            style={{ width: "90%", maxHeight: "25vh", overflowY: "scroll" }}
            show={showSuggestions}
          >
            {deferredData?.length ? (
              suggestionsList
            ) : (
              <Dropdown.Item key="not-found" as="button" disabled>
                {isStale || isPending ? "Loading..." : "No items found"}
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </FormGroup>
      </Form>
    </div>
  );
}

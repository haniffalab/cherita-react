import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { Dropdown } from "react-bootstrap";
import { useDiseaseSearch, useVarSearch } from "../../utils/search";
import { useDeferredValue } from "react";

export function VarSearchResults({
  text,
  showSuggestions,
  setShowSuggestions,
}) {
  const [suggestions, setSuggestions] = useState([]);

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
  }, [setParams, setShowSuggestions]);

  useEffect(() => {
    updateParams(text);
  }, [text, updateParams]);

  useEffect(() => {
    if (!isPending && !serverError) {
      setSuggestions(fetchedData);
      setShowSuggestions(true);
    }
  }, [fetchedData, isPending, serverError, setShowSuggestions]);

  const suggestionsList = useMemo(() => {
    return deferredData?.map((item) => {
      return (
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
      );
    });
  }, [deferredData, isStale, onSelect]);

  return (
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
  );
}

export function DiseasesSearchResults({
  text,
  showSuggestions,
  setShowSuggestions,
}) {
  const [suggestions, setSuggestions] = useState([]);

  const {
    setParams,
    data: { fetchedData = [], isPending, serverError },
    onSelect,
  } = useDiseaseSearch();

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
  }, [setParams, setShowSuggestions]);

  useEffect(() => {
    updateParams(text);
  }, [text, updateParams]);

  useEffect(() => {
    if (!isPending && !serverError) {
      setSuggestions(fetchedData);
      setShowSuggestions(true);
    }
  }, [fetchedData, isPending, serverError, setShowSuggestions]);

  const suggestionsList = useMemo(() => {
    return deferredData?.map((item) => {
      return (
        <Dropdown.Item
          key={item.id}
          as="button"
          disabled={isStale}
          onClick={() => {
            onSelect(item);
          }}
        >
          {item.disease_name}
        </Dropdown.Item>
      );
    });
  }, [deferredData, isStale, onSelect]);

  return (
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
  );
}

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";

import _ from "lodash";
import { Dropdown } from "react-bootstrap";

import { useDatasetDispatch } from "../../context/DatasetContext";
import { useDiseaseSearch, useVarSearch } from "../../utils/search";

export function VarSearchResults({ text, setShowSuggestions, handleSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const dispatch = useDatasetDispatch();

  const {
    setParams,
    data: { fetchedData = [], isPending, serverError },
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
            handleSelect(dispatch, item);
            _.delay(() => {
              setShowSuggestions(false);
            }, 150);
          }}
        >
          {item.name}
        </Dropdown.Item>
      );
    });
  }, [deferredData, dispatch, handleSelect, isStale, setShowSuggestions]);

  return (
    <div>
      <h5>Genes</h5>
      <div className="search-results">
        {deferredData?.length ? (
          suggestionsList
        ) : (
          <Dropdown.Item key="empty" as="button" disabled>
            {!serverError
              ? isStale || isPending
                ? "Loading..."
                : "No items found"
              : "Failed to fetch data"}
          </Dropdown.Item>
        )}
      </div>
    </div>
  );
}

export function DiseasesSearchResults({ text, setShowSuggestions }) {
  const [suggestions, setSuggestions] = useState([]);
  const dispatch = useDatasetDispatch();

  const {
    setParams,
    data: { fetchedData = [], isPending, serverError },
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
      }
    };
    return _.debounce(setData, 300);
  }, [setParams]);

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
            dispatch({
              type: "select.disease",
              id: item.disease_id,
              name: item.disease_name,
            });
            _.delay(() => {
              setShowSuggestions(false);
            }, 150);
          }}
        >
          {item.disease_name}
        </Dropdown.Item>
      );
    });
  }, [deferredData, dispatch, isStale, setShowSuggestions]);

  return (
    <div>
      <Dropdown.Header>Diseases</Dropdown.Header>
      <div className="search-results">
        {deferredData?.length ? (
          suggestionsList
        ) : (
          <Dropdown.Item key="empty" as="button" disabled>
            {!serverError
              ? isStale || isPending
                ? "Loading..."
                : "No items found"
              : "Failed to fetch data"}
          </Dropdown.Item>
        )}
      </div>
    </div>
  );
}

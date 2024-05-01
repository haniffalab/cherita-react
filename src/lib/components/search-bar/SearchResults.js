import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { Dropdown } from "react-bootstrap";
import { useDatasetDispatch } from "../../context/DatasetContext";
import {
  useGetDisease,
  useDiseaseSearch,
  useVarSearch,
} from "../../utils/search";
import { useDeferredValue } from "react";

export function VarSearchResults({ text, setShowSuggestions }) {
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
            _.delay(() => {
              setShowSuggestions(false);
            }, 150);
          }}
        >
          {item.name}
        </Dropdown.Item>
      );
    });
  }, [deferredData, isStale, onSelect, setShowSuggestions]);

  return (
    <div>
      <Dropdown.Header>Features</Dropdown.Header>
      <div style={{ maxHeight: "25vh", overflowY: "scroll" }}>
        {deferredData?.length ? (
          suggestionsList
        ) : (
          <Dropdown.Item key="not-found" as="button" disabled>
            {isStale || isPending ? "Loading..." : "No items found"}
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

  useGetDisease();

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
              id: item?.disease_id,
              name: item?.disease_name,
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
      <div style={{ maxHeight: "25vh", overflowY: "scroll" }}>
        {deferredData?.length ? (
          suggestionsList
        ) : (
          <Dropdown.Item key="not-found" as="button" disabled>
            {isStale || isPending ? "Loading..." : "No items found"}
          </Dropdown.Item>
        )}
      </div>
    </div>
  );
}

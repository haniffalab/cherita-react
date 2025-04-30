import React, { useDeferredValue, useEffect, useMemo, useState } from "react";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Button, Dropdown, ListGroup } from "react-bootstrap";

import { useDatasetDispatch } from "../../context/DatasetContext";
import { useDiseaseSearch, useVarSearch } from "../../utils/search";
import { VirtualizedList } from "../../utils/VirtualizedList";

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

  const getDataAtIndex = (index) => deferredData[index];
  const ItemComponent = (item) => (
    <>
      <div className="virtualized-list-wrapper">
        <ListGroup.Item key={item}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.name}</div>
            <div className="d-flex align-items-center gap-1">
              <Button
                type="button"
                className="m-0 p-0 px-1"
                variant="outline-secondary"
                title="Remove from list"
                disabled={isStale}
                onClick={() => {
                  handleSelect(dispatch, item);
                  _.delay(() => {
                    setShowSuggestions(false);
                  }, 150);
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
          </div>
        </ListGroup.Item>
      </div>
    </>
  );

  return (
    <div>
      <h5>Genes</h5>
      <div className="search-results">
        <ListGroup variant="flush" className="cherita-list">
          {deferredData?.length ? (
            <VirtualizedList
              getDataAtIndex={getDataAtIndex}
              count={deferredData.length}
              ItemComponent={ItemComponent}
              overscan={500}
              estimateSize={42}
              maxHeight="70vh"
            />
          ) : (
            <Dropdown.Item key="empty" as="button" disabled>
              {!serverError
                ? isStale || isPending
                  ? "Loading..."
                  : "No items found"
                : "Failed to fetch data"}
            </Dropdown.Item>
          )}
        </ListGroup>
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

  const getDataAtIndex = (index) => deferredData[index];
  const ItemComponent = (item) => (
    <Dropdown.Item
      key={item.name}
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

  return (
    <div>
      <Dropdown.Header>Diseases</Dropdown.Header>
      <div className="search-results">
        {deferredData?.length ? (
          <VirtualizedList
            getDataAtIndex={getDataAtIndex}
            count={deferredData.length}
            ItemComponent={ItemComponent}
            overscan={250}
            estimateSize={32}
            maxHeight="70vh"
          />
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

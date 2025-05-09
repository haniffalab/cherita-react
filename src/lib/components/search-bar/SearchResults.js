import React, { useDeferredValue, useEffect, useMemo, useState } from "react";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Button, ListGroup } from "react-bootstrap";

import { useDatasetDispatch } from "../../context/DatasetContext";
import { useDiseaseSearch, useVarSearch } from "../../utils/search";
import { VirtualizedList } from "../../utils/VirtualizedList";

export function VarSearchResults({
  text,
  handleSelect,
  selectedResult,
  setSelectedResult,
  setResultsLength,
}) {
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
      setResultsLength(fetchedData?.length);
    }
  }, [fetchedData, isPending, serverError, setResultsLength]);

  const getDataAtIndex = (index) => deferredData[index];
  const ItemComponent = (item) => (
    <>
      <div className="virtualized-list-wrapper">
        <ListGroup.Item
          key={item}
          onClick={() => {
            setSelectedResult(item);
          }}
          active={selectedResult?.index === item.index}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.name}</div>
            <div className="d-flex align-items-center gap-1">
              <Button
                type="button"
                className="m-0 p-0 px-1"
                variant="outline-secondary"
                title="Add to list"
                disabled={isStale}
                onClick={() => {
                  handleSelect(dispatch, item);
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
            <ListGroup.Item key="empty" as="button" disabled>
              {!text.length
                ? "Search features"
                : !serverError
                  ? isStale || isPending
                    ? "Loading..."
                    : "No items found"
                  : "Failed to fetch data"}
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>
    </div>
  );
}

export function DiseasesSearchResults({
  text,
  selectedResult,
  setSelectedResult,
  setResultsLength,
}) {
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
      setResultsLength(fetchedData?.length);
    }
  }, [fetchedData, isPending, serverError, setResultsLength]);

  const getDataAtIndex = (index) => deferredData[index];
  const ItemComponent = (item) => (
    <>
      <div className="virtualized-list-wrapper">
        <ListGroup.Item
          key={item.name}
          onClick={() => {
            setSelectedResult(item);
            dispatch({
              type: "select.disease",
              id: item.disease_id,
              name: item.disease_name,
            });
          }}
          active={selectedResult?.id === item.id}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.disease_name}</div>
          </div>
        </ListGroup.Item>
      </div>
    </>
  );

  return (
    <div>
      <div className="search-results">
        <ListGroup variant="flush" className="cherita-list">
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
            <ListGroup.Item key="empty" as="button" disabled>
              {!text.length
                ? "Search diseases"
                : !serverError
                  ? isStale || isPending
                    ? "Loading..."
                    : "No items found"
                  : "Failed to fetch data"}
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>
    </div>
  );
}

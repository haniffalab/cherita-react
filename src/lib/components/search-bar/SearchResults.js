import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Button, ListGroup } from "react-bootstrap";

import { useSettingsDispatch } from "../../context/SettingsContext";
import {
  useDiseaseSearch,
  useObsSearch,
  useVarSearch,
} from "../../utils/search";
import { VirtualizedList } from "../../utils/VirtualizedList";

function SearchResultsBase({
  text,
  handleSelect,
  selectedResult,
  setSelectedResult,
  setResultsLength,
  handleClose,
  searchHook,
  itemRenderer,
  emptyLabel = "Search",
  overscan = 500,
  estimateSize = () => 42,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const dispatch = useSettingsDispatch();

  const {
    setParams,
    data: { fetchedData = [], isPending, serverError },
  } = searchHook();

  const deferredData = useDeferredValue(suggestions);
  const isStale = deferredData !== fetchedData;

  const updateParams = useMemo(() => {
    const setData = (text) => {
      if (text.length) {
        setParams((p) => ({ ...p, text }));
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
      setResultsLength?.(fetchedData?.length || 0);
    }
  }, [fetchedData, isPending, serverError, setResultsLength]);

  const getDataAtIndex = (index) => deferredData[index];

  return (
    <div className="search-results">
      <ListGroup variant="flush" className="cherita-list">
        {deferredData?.length ? (
          <VirtualizedList
            getDataAtIndex={getDataAtIndex}
            count={deferredData.length}
            ItemComponent={(item) =>
              itemRenderer({
                item,
                dispatch,
                handleSelect,
                handleClose,
                selectedResult,
                setSelectedResult,
                isStale,
              })
            }
            overscan={overscan}
            estimateSize={estimateSize}
            maxHeight="70vh"
          />
        ) : (
          <ListGroup.Item key="empty" as="button" disabled>
            {!text.length
              ? emptyLabel
              : !serverError
                ? isStale || isPending
                  ? "Loading..."
                  : "No items found"
                : "Failed to fetch data"}
          </ListGroup.Item>
        )}
      </ListGroup>
    </div>
  );
}

export function VarSearchResults(props) {
  return (
    <SearchResultsBase
      {...props}
      searchHook={useVarSearch}
      emptyLabel="Search features"
      itemRenderer={({
        item,
        dispatch,
        handleSelect,
        selectedResult,
        setSelectedResult,
        isStale,
      }) => (
        <ListGroup.Item
          key={item.index ?? item.name}
          onClick={() => setSelectedResult(item)}
          active={selectedResult?.index === item.index}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.name}</div>
            <Button
              type="button"
              className="m-0 p-0 px-1"
              variant="outline-secondary"
              title="Add to list"
              disabled={isStale}
              onClick={() => handleSelect(dispatch, item)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>
        </ListGroup.Item>
      )}
    />
  );
}

export function ObsSearchResults(props) {
  return (
    <SearchResultsBase
      {...props}
      searchHook={useObsSearch}
      emptyLabel="Search observations"
      itemRenderer={({
        item,
        dispatch,
        handleClose,
        selectedResult,
        setSelectedResult,
        isStale,
      }) => {
        const onObsSelect = (dispatch, item, closeModal) => {
          dispatch({ type: "set.selectedObsIndex", index: item.index });
          if (closeModal) closeModal();
        };

        return (
          <ListGroup.Item
            key={item.index}
            onClick={() => setSelectedResult(item)}
            active={selectedResult?.index === item.index}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <div>{item.name}</div>
              <Button
                type="button"
                className="m-0 p-0 px-1"
                variant="outline-secondary"
                title="Add to list"
                disabled={isStale}
                onClick={() => onObsSelect(dispatch, item, props.handleClose)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
          </ListGroup.Item>
        );
      }}
    />
  );
}

export function DiseasesSearchResults(props) {
  return (
    <SearchResultsBase
      {...props}
      searchHook={useDiseaseSearch}
      emptyLabel="Search diseases"
      overscan={250}
      estimateSize={() => 32}
      itemRenderer={({ item, setSelectedResult, selectedResult }) => (
        <ListGroup.Item
          key={item.id ?? item.name}
          onClick={() => setSelectedResult(item)}
          active={selectedResult?.id === item.id}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>{item.disease_name}</div>
          </div>
        </ListGroup.Item>
      )}
    />
  );
}

import React, { useContext, useEffect, useState } from "react";

import {
  faDroplet,
  faFilter,
  faMessage,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Alert, Badge } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import AccordionContext from "react-bootstrap/AccordionContext";

import { CategoricalObs, ContinuousObs } from "./ObsItem";
import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

export function ObsColsList({ showColor = true }) {
  const ENDPOINT = "obs/cols";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsCols, setObsCols] = useState(null);
  const [active, setActive] = useState(dataset.selectedObs?.name);
  const [expandedItems, setExpandedItems] = useState(
    active ? { [active]: true } : {}
  );
  const [params, setParams] = useState({ url: dataset.url });

  useEffect(() => {
    setParams((p) => {
      return { ...p, url: dataset.url };
    });
  }, [dataset.url]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && !serverError) {
      let filteredData = fetchedData;

      if (dataset.obsCols) {
        filteredData = _.filter(filteredData, (d) => {
          return _.includes(dataset.obsCols, d.name);
        });
      }

      setObsCols(
        _.keyBy(
          _.map(filteredData, (d) => {
            return { ...d, codesMap: _.invert(d.codes), omit: [] };
          }),
          "name"
        )
      );
    }
  }, [dataset.obsCols, fetchedData, isPending, serverError]);

  // @TODO: fix re-rendering performance issue
  useEffect(() => {
    if (obsCols) {
      if (obsCols[dataset.selectedObs?.name]) {
        setActive(dataset.selectedObs?.name);
      } else {
        setActive(null);
      }
    }
  }, [dataset.selectedObs, obsCols]);

  const updateObs = (updatedObs) => {
    setObsCols((o) => {
      return { ...o, [updatedObs.name]: updatedObs };
    });
  };

  const handleAccordionToggle = (itemName) => {
    _.delay(
      // to avoid contents of accordion disappearing while closing
      () => {
        setExpandedItems((prev) => {
          return { ...prev, [itemName]: !prev[itemName] };
        });
      },
      expandedItems[itemName] ? 250 : 0
    );
  };

  const toggleAll = (item) => {
    const omit = item.omit.length
      ? []
      : _.map(item.values, (v) => item.codes[v]);
    setObsCols((o) => {
      return { ...o, [item.name]: { ...item, omit: omit } };
    });
    if (active === item.name) {
      dispatch({ type: "select.obs", obs: { ...item, omit: omit } });
    }
  };

  const toggleLabel = (item) => {
    const inLabelObs = _.some(dataset.labelObs, (i) => i.name === item.name);
    if (inLabelObs) {
      dispatch({ type: "remove.label.obs", obsName: item.name });
    } else {
      dispatch({
        type: "add.label.obs",
        obs: { name: item.name, type: item.type, codesMap: item.codesMap },
      });
    }
  };

  const toggleSlice = (item) => {
    dispatch({ type: "toggle.slice.obs", obs: item });
  };

  const toggleColor = (item) => {
    dispatch({ type: "select.obs", obs: item });
    dispatch({ type: "set.colorEncoding", value: "obs" });
  };

  const toggleObs = (item, value) => {
    let omit;
    if (_.includes(item.omit, item.codes[value])) {
      omit = item.omit.filter((i) => i !== item.codes[value]);
    } else {
      omit = [...item.omit, item.codes[value]];
    }
    setObsCols((o) => {
      return { ...o, [item.name]: { ...item, omit: omit } };
    });
    if (active === item.name) {
      dispatch({ type: "select.obs", obs: { ...item, omit: omit } });
    }
  };

  function ObsAccordionToggle({ children, eventKey }) {
    const { activeEventKey } = useContext(AccordionContext);
    // console.log("activeEventKey:", activeEventKey);

    const decoratedOnClick = useAccordionButton(eventKey, () => {
      console.log("Clicked accordion:", eventKey);
      handleAccordionToggle(eventKey);
    });

    const isCurrentEventKey = Array.isArray(activeEventKey)
      ? activeEventKey.includes(eventKey)
      : activeEventKey === eventKey;

    return (
      <div
        className={`obs-accordion-header ${isCurrentEventKey ? "active" : ""}`}
        onClick={decoratedOnClick}
      >
        <span className="obs-accordion-header-chevron">
          <FontAwesomeIcon
            icon={isCurrentEventKey ? faChevronDown : faChevronRight}
          />
        </span>
        <span className="obs-accordion-header-title">{children}</span>
      </div>
    );
  }

  const obsList = _.map(obsCols, (item, index) => {
    if (item.type === OBS_TYPES.DISCRETE) {
      return null;
    }
    const inLabelObs = _.some(dataset.labelObs, (i) => i.name === item.name);
    const inSliceObs =
      dataset.sliceBy.obs && dataset.selectedObs?.name === item.name;
    const isColorEncoding =
      dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
      dataset.selectedObs?.name === item.name;
    return (
      <div>
        <ObsAccordionToggle eventKey={item.name}>
          <div className="d-flex justify-content-between w-100 me-2 mr-2">
            <div>{item.name}</div>
            <Badge pill>
              {inLabelObs && (
                <FontAwesomeIcon
                  className="mx-1"
                  icon={faMessage}
                  title="In tooltip"
                />
              )}
              {inSliceObs && (
                <FontAwesomeIcon
                  className="mx-1"
                  icon={faFilter}
                  title="Filter applied"
                />
              )}
              {isColorEncoding && (
                <FontAwesomeIcon
                  className="mx-1"
                  icon={faDroplet}
                  title="Is color encoding"
                />
              )}
            </Badge>
          </div>
        </ObsAccordionToggle>
        <Accordion.Collapse eventKey={item.name}>
          <div className="obs-accordion-body">
            {expandedItems[item.name] &&
              (item.type === OBS_TYPES.CATEGORICAL ||
              item.type === OBS_TYPES.BOOLEAN ? (
                <CategoricalObs
                  key={item.name}
                  obs={item}
                  updateObs={updateObs}
                  toggleAll={() => toggleAll(item)}
                  toggleObs={(value) => toggleObs(item, value)}
                  toggleLabel={() => toggleLabel(item)}
                  toggleSlice={() => toggleSlice(item)}
                  toggleColor={() => toggleColor(item)}
                  showColor={showColor}
                />
              ) : (
                <ContinuousObs
                  key={item.name}
                  obs={item}
                  updateObs={updateObs}
                  toggleAll={() => toggleAll(item)}
                  toggleObs={(value) => toggleObs(item, value)}
                  toggleLabel={() => toggleLabel(item)}
                  toggleSlice={() => toggleSlice(item)}
                  toggleColor={() => toggleColor(item)}
                />
              ))}
          </div>
        </Accordion.Collapse>
      </div>
    );
  });

  if (!serverError) {
    return (
      <div>
        {isPending && <LoadingSpinner />}
        <Accordion
          flush
          defaultActiveKey={[active]}
          alwaysOpen
          className="obs-accordion"
        >
          {obsList}
        </Accordion>
      </div>
    );
  } else {
    return (
      <div>
        <Alert variant="danger">{serverError.message}</Alert>
      </div>
    );
  }
}

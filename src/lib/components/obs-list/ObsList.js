import React, { useContext, useEffect, useState } from "react";

import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CommentIcon from "@mui/icons-material/Comment";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import _ from "lodash";
import { Alert } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import AccordionContext from "react-bootstrap/AccordionContext";

import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";
import { CategoricalObs, ContinuousObs } from "./ObsItem";

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
    dispatch({ type: "set.colorEncoding", value: COLOR_ENCODINGS.OBS });
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

    const decoratedOnClick = useAccordionButton(eventKey, () => {
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
      <div className="accordion-item" key={item.name}>
        <ObsAccordionToggle eventKey={item.name}>
          <div>{item.name}</div>
          <div>
            <span
              className={`mx-1 cursor-pointer ${inLabelObs ? "active-icon" : "text-muted opacity-50"}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleLabel(item);
              }}
              title="Add to tooltip"
            >
              <CommentIcon />
            </span>
            <span
              className={`mx-1 cursor-pointer ${inSliceObs ? "active-icon" : "text-muted opacity-50"}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleSlice(item);
              }}
              title="Filter applied"
            >
              <JoinInnerIcon />
            </span>
            <span
              className={`mx-1 cursor-pointer ${isColorEncoding ? "active-icon" : "text-muted opacity-50"}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleColor(item);
              }}
              title="Is color encoding"
            >
              <WaterDropIcon />
            </span>
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
      <div className="position-relative h-100">
        {isPending ? (
          <LoadingSpinner />
        ) : (
          <Accordion
            flush
            defaultActiveKey={[active]}
            alwaysOpen
            className="obs-accordion"
          >
            {obsList}
          </Accordion>
        )}
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

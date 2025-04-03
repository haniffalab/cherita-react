import React, { useContext, useEffect, useMemo, useState } from "react";

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

import { CategoricalObs, ContinuousObs } from "./ObsItem";
import {
  COLOR_ENCODINGS,
  DEFAULT_OBS_GROUP,
  OBS_TYPES,
} from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

const ObsAccordionToggle = ({ children, eventKey, handleAccordionToggle }) => {
  const { activeEventKey } = useContext(AccordionContext);

  const isCurrentEventKey = (activeEventKey || []).includes(eventKey);

  const decoratedOnClick = useAccordionButton(eventKey, () => {
    handleAccordionToggle(eventKey, isCurrentEventKey);
  });

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
};

export function ObsColsList({ showColor = true, enableObsGroups = true }) {
  const ENDPOINT = "obs/cols";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [enableGroups, setEnableGroups] = useState(enableObsGroups);
  const [obsCols, setObsCols] = useState(null);
  const [active, setActive] = useState([...[dataset.selectedObs?.name]]);
  const [params, setParams] = useState({ url: dataset.url });
  const obsGroups = useMemo(
    () => ({
      default: _.union(DEFAULT_OBS_GROUP, dataset.obsGroups?.default),
      ..._.omit(dataset.obsGroups, "default"),
    }),
    [dataset.obsGroups]
  );

  useEffect(() => {
    setParams((p) => {
      return { ...p, url: dataset.url };
    });
  }, [dataset.url]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && !serverError && fetchedData) {
      let filteredData = fetchedData;

      // filter to only obs within an obsGroup
      if (enableGroups) {
        const groupFiltered = _.filter(filteredData, (d) => {
          return _.some(obsGroups, (g) => _.includes(g, d.name));
        });
        if (!!filteredData.length && !groupFiltered.length) {
          setEnableGroups(false);
          console.warn(
            `No obs found in obsGroups ${JSON.stringify(obsGroups)}, disabling obsGroups`
          );
        } else {
          filteredData = groupFiltered;
        }
      }

      // filter out discrete obs
      filteredData = _.filter(filteredData, (d) => {
        return d.type !== OBS_TYPES.DISCRETE;
      });

      setObsCols(
        _.keyBy(
          _.map(filteredData, (d) => {
            return { ...d, codesMap: _.invert(d.codes), omit: [] };
          }),
          "name"
        )
      );
    }
  }, [fetchedData, isPending, obsGroups, serverError, enableGroups]);

  useEffect(() => {
    if (obsCols) {
      if (!obsCols[dataset.selectedObs?.name]) {
        setActive([]);
        dispatch({ type: "select.obs", obs: null });
      }
    }
  }, [dataset.selectedObs, dispatch, obsCols]);

  const updateObs = (updatedObs) => {
    setObsCols((o) => {
      return { ...o, [updatedObs.name]: updatedObs };
    });
  };

  const handleAccordionToggle = (itemName, isCurrentEventKey) => {
    if (isCurrentEventKey) {
      _.delay(() => setActive((prev) => _.without(prev, itemName)), 250);
    } else {
      setActive((prev) => [...prev, itemName]);
    }
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

  const obsItem = (item) => {
    if (!item) {
      return null;
    }
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
        <ObsAccordionToggle
          eventKey={item.name}
          handleAccordionToggle={handleAccordionToggle}
        >
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
            {active.includes(item.name) &&
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
                  showColor={showColor && isColorEncoding}
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
  };

  const groupList = _.map(_.keys(obsGroups), (group) => {
    const key = `group-${group}`;
    const groupItems = _.compact(
      _.map(
        _.sortBy(obsGroups[group], (o) => _.lowerCase(o.name)),
        (item) => {
          return obsItem(obsCols?.[item]);
        }
      )
    );
    if (group === "default") {
      return groupItems;
    } else {
      return (
        <Accordion.Item
          key={key}
          eventKey={key}
          className="obs-group-accordion-item"
        >
          <Accordion.Header className="obs-group-accordion-header">
            {group}
          </Accordion.Header>
          <Accordion.Body className="obs-group-accordion-body">
            {groupItems}
          </Accordion.Body>
        </Accordion.Item>
      );
    }
  });

  const obsList = enableGroups ? (
    <Accordion className="obs-group-accordion" flush alwaysOpen>
      {groupList}
    </Accordion>
  ) : (
    _.map(
      _.sortBy(obsCols, (o) => _.lowerCase(o.name)),
      (item) => obsItem(item)
    )
  );

  if (!serverError) {
    return (
      <div className="position-relative h-100">
        {isPending ? (
          <LoadingSpinner />
        ) : !!obsCols && !_.size(obsCols) ? (
          <Alert variant="danger">No observations found.</Alert>
        ) : (
          <Accordion
            flush
            defaultActiveKey={active}
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

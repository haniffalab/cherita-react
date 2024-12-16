import React, { useEffect, useState } from "react";

import _ from "lodash";
import { Accordion, Alert } from "react-bootstrap";

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
  const [params, setParams] = useState({
    url: dataset.url,
  });

  useEffect(() => {
    setParams((p) => {
      return {
        ...p,
        url: dataset.url,
      };
    });
  }, [dataset.url]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isPending && !serverError) {
      setObsCols(
        _.keyBy(
          _.map(fetchedData, (d) => {
            return { ...d, codesMap: _.invert(d.codes), omit: [] };
          }),
          "name"
        )
      );
    }
  }, [fetchedData, isPending, serverError]);

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

  const toggleAll = (item) => {
    const omit = item.omit.length
      ? []
      : _.map(item.values, (v) => item.codes[v]);
    setObsCols((o) => {
      return { ...o, [item.name]: { ...item, omit: omit } };
    });
    if (active === item.name) {
      dispatch({
        type: "select.obs",
        obs: { ...item, omit: omit },
      });
    }
  };

  const toggleLabel = (item) => {
    const inLabelObs = _.some(dataset.labelObs, (i) => i.name === item.name);
    if (inLabelObs) {
      dispatch({
        type: "remove.label.obs",
        obsName: item.name,
      });
    } else {
      dispatch({
        type: "add.label.obs",
        obs: {
          name: item.name,
          type: item.type,
          codesMap: item.codesMap,
        },
      });
    }
  };

  const toggleSlice = (item) => {
    dispatch({
      type: "toggle.slice.obs",
      obs: item,
    });
  };

  const toggleColor = (item) => {
    dispatch({
      type: "select.obs",
      obs: item,
    });
    dispatch({
      type: "set.colorEncoding",
      value: "obs",
    });
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
      dispatch({
        type: "select.obs",
        obs: { ...item, omit: omit },
      });
    }
  };

  const obsList = _.map(obsCols, (item) => {
    if (item.type === OBS_TYPES.DISCRETE) {
      return null;
    }
    return (
      <Accordion.Item
        key={item.name}
        eventKey={item.name}
        className={
          active === item.name &&
          dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
          "cherita-accordion-active"
        }
      >
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>
          {item.type === OBS_TYPES.CATEGORICAL ||
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
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  if (!serverError) {
    return (
      <div className="position-relative h-100">
        <div className="list-group overflow-auto h-100">
          {isPending && <LoadingSpinner />}
          <Accordion flush defaultActiveKey={active} alwaysOpen>
            {obsList}
          </Accordion>
        </div>
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

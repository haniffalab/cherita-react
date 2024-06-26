import React, { useEffect, useState, useMemo, useCallback } from "react";

import { faDroplet, faEye, faFont } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import {
  Accordion,
  ListGroup,
  Alert,
  Form,
  ButtonGroup,
  Button,
} from "react-bootstrap";

import { ObsValueList } from "./ObsValueList";
import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useColor } from "../../helpers/color-helper";
import { LoadingSpinner } from "../../utils/LoadingIndicators";
import { useFetch } from "../../utils/requests";

const N_BINS = 5;

function binContinuous(data, nBins = N_BINS) {
  const binSize = (data.max - data.min) * (1 / nBins);
  const thresholds = _.range(nBins + 1).map((b) => {
    return data.min + binSize * b;
  });
  const bins = {
    nBins: nBins,
    binSize: binSize,
    thresholds: thresholds,
  };
  return { ...data, ...bins };
}

function binDiscrete(data, nBins = N_BINS) {
  const binSize = _.round(data.n_values * (1 / nBins));
  const bins = {
    nBins: nBins,
    binSize: binSize,
  };
  return { ...data, ...bins };
}

export function ObsColsList() {
  const ENDPOINT = "obs/cols";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsCols, setObsCols] = useState({});
  const [updatedObsCols, setupdatedObsCols] = useState(false);
  const [active, setActive] = useState(dataset.selectedObs?.name);
  const [params, setParams] = useState({
    url: dataset.url,
  });

  const { getColor } = useColor();

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

  const validateSelection = useCallback(
    (obs) => {
      if (
        !_.isEqual(_.omit(obsCols[obs.name], ["omit"]), _.omit(obs, ["omit"]))
      )
        return false;
      if (!_.isEqual(obsCols[obs.name].omit, obs.omit)) {
        setObsCols((o) => {
          return {
            ...o,
            [obs.name]: { ...o[obs.name], omit: obs.omit },
          };
        });
      }
      return true;
    },
    [obsCols]
  );

  useEffect(() => {
    if (updatedObsCols) {
      if (dataset.selectedObs) {
        if (validateSelection(dataset.selectedObs)) {
          setActive(dataset.selectedObs.name);
        } else {
          dispatch({
            type: "select.obs",
            obs: null,
          });
          setActive(null);
        }
      } else {
        setActive(null);
      }
    }
  }, [dataset.selectedObs, dispatch, updatedObsCols, validateSelection]);

  // @TODO: change api to return all obs and truncate here
  useEffect(() => {
    if (!isPending && !serverError) {
      setObsCols(
        _.keyBy(
          _.map(fetchedData, (d) => {
            if (d.type === OBS_TYPES.CONTINUOUS) {
              d = binContinuous(d);
            } else if (d.type === OBS_TYPES.DISCRETE) {
              d = binDiscrete(d);
            }
            return { ...d, omit: [] };
          }),
          "name"
        )
      );
      setupdatedObsCols(true);
    }
  }, [fetchedData, isPending, serverError]);

  const toggleAll = useCallback(
    (item, checked, active) => {
      const omit = checked ? [] : _.map(item.values, (v) => item.codes[v]);
      setObsCols((o) => {
        return {
          ...o,
          [item.name]: { ...item, omit: omit },
        };
      });
      if (active === item.name) {
        dispatch({
          type: "select.obs",
          obs: { ...item, omit: omit },
        });
      }
    },
    [dispatch]
  );

  const categoricalList = useCallback(
    (item, active = null) => {
      const codesMap = _.invert(item.codes);
      item.codesMap = codesMap;
      const inLabelObs = _.some(dataset.labelObs, (i) =>
        _.isEqual(i, {
          name: item.name,
          type: item.type,
          codesMap: item.codesMap,
        })
      );
      const min = _.min(_.values(item.codes));
      const max = _.max(_.values(item.codes));
      return (
        <Accordion.Item
          key={item.name}
          eventKey={item.name}
          className={item.name === active ? "cherita-accordion-active" : ""}
        >
          <Accordion.Header>{item.name}</Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              <ListGroup.Item>
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="Toggle all"
                      checked={!item.omit.length}
                      onChange={() => {
                        toggleAll(item, !!item.omit.length, active);
                      }}
                    />
                  </div>
                  <div>
                    <ButtonGroup>
                      <Button
                        variant={inLabelObs ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => {
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
                        }}
                        title="Add to tooltip"
                      >
                        <FontAwesomeIcon icon={faFont} />
                      </Button>
                      <Button
                        variant={
                          dataset.sliceBy.obs &&
                          dataset.selectedObs?.name === item.name
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "toggle.slice.obs",
                            obs: item,
                          });
                        }}
                        title="Slice to selected"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button
                        variant={
                          dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
                          dataset.selectedObs?.name === item.name
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "select.obs",
                            obs: item,
                          });
                          dispatch({
                            type: "set.colorEncoding",
                            value: "obs",
                          });
                        }}
                        title="Set as color encoding"
                      >
                        <FontAwesomeIcon icon={faDroplet} />
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </ListGroup.Item>
              <ObsValueList
                item={item}
                onChange={(value) => {
                  const newItem = {
                    ...item,
                    omit: !_.includes(item.omit, item.codes[value])
                      ? [...item.omit, item.codes[value]]
                      : _.filter(item.omit, (o) => o !== item.codes[value]),
                  };
                  setObsCols((o) => {
                    return {
                      ...o,
                      [item.name]: newItem,
                    };
                  });
                  if (active === item.name) {
                    dispatch({
                      type: "select.obs",
                      obs: newItem,
                    });
                  }
                }}
                getFillColor={(value) => {
                  return `rgb(${getColor(
                    (item.codes[value] - min) / (max - min),
                    true,
                    _.includes(item.omit, item.codes[value]),
                    {
                      alpha: 1,
                    },
                    "obs"
                  )})`;
                }}
              />
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [
      dataset.labelObs,
      dataset.sliceBy.obs,
      dataset.selectedObs?.name,
      dataset.colorEncoding,
      toggleAll,
      dispatch,
      getColor,
    ]
  );

  const continuousList = useCallback(
    (item, active = null) => {
      const inLabelObs = _.some(dataset.labelObs, (i) =>
        _.isEqual(i, {
          name: item.name,
          type: item.type,
        })
      );
      return (
        <Accordion.Item
          key={item.name}
          eventKey={item.name}
          className={item.name === active ? "cherita-accordion-active" : ""}
        >
          <Accordion.Header>{item.name}</Accordion.Header>
          <Accordion.Body>
            <ListGroup>
              <ListGroup.Item>
                <div className="d-flex justify-content-end">
                  <ButtonGroup>
                    <Button
                      variant={inLabelObs ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => {
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
                            },
                          });
                        }
                      }}
                      title="Add to tooltip"
                    >
                      <FontAwesomeIcon icon={faFont} />
                    </Button>
                    <Button
                      variant={
                        dataset.colorEncoding === COLOR_ENCODINGS.OBS &&
                        dataset.selectedObs?.name === item.name
                          ? "primary"
                          : "outline-primary"
                      }
                      size="sm"
                      onClick={(key) => {
                        if (key != null) {
                          dispatch({
                            type: "select.obs",
                            obs: item,
                          });
                          dispatch({
                            type: "set.colorEncoding",
                            value: "obs",
                          });
                        }
                      }}
                      title="Set as color encoding"
                    >
                      <FontAwesomeIcon icon={faDroplet} />
                    </Button>
                  </ButtonGroup>
                </div>
              </ListGroup.Item>
            </ListGroup>
            <p>Min: {item.min}</p>
            <p>Max: {item.max}</p>
            <p>Mean: {item.mean}</p>
            <p>Median: {item.median}</p>
            <p>NBins: {item.nBins}</p>
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [
      dataset.colorEncoding,
      dataset.labelObs,
      dataset.selectedObs?.name,
      dispatch,
    ]
  );

  const otherList = useCallback((item, active = null) => {
    return (
      <Accordion.Item
        key={item.name}
        eventKey={item.name}
        className={item.name === active ? "cherita-accordion-active" : ""}
      >
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>{item.type}</Accordion.Body>
      </Accordion.Item>
    );
  }, []);

  const obsList = useMemo(
    () =>
      _.keys(obsCols).map((o) => {
        const item = obsCols[o];
        if (
          item.type === OBS_TYPES.CATEGORICAL ||
          item.type === OBS_TYPES.BOOLEAN
        ) {
          return categoricalList(item, active);
        } else if (item.type === OBS_TYPES.CONTINUOUS) {
          return continuousList(item, active);
        } else {
          return otherList(item, active);
        }
      }),
    [obsCols, categoricalList, active, continuousList, otherList]
  );

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

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import _ from "lodash";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import {
  Accordion,
  ListGroup,
  Alert,
  Form,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import { useColor } from "../../helpers/color-helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faEye, faFont } from "@fortawesome/free-solid-svg-icons";

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

// @TODO: add "slice" button
export function ObsColsList() {
  const ENDPOINT = "obs/cols";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsColsList, setObsColsList] = useState([]);
  const [updatedObsColsList, setUpdatedObsColsList] = useState(false);
  const [active, setActive] = useState(dataset.selectedObs?.name);
  const [params, setParams] = useState({
    url: dataset.url,
  });

  const { getScaleParams, getScale, getColor } = useColor();

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
    (selectedObs) => {
      if (updatedObsColsList) {
        const selection = _.find(obsColsList, (item) =>
          _.isEqual(
            _.omit(item, ["scaleParams", "omit"]),
            _.omit(selectedObs, ["scaleParams", "omit"])
          )
        );
        if (!selection) {
          setActive(null);
          dispatch({
            type: "obsSelected",
            obs: null,
          });
        }
        if (
          !_.isEqual(selectedObs.scaleParams, selection.scaleParams) ||
          !_.isEqual(selectedObs.omit, selection.omit)
        ) {
          dispatch({
            type: "obsSelected",
            obs: selection,
          });
        }
      }
    },
    [dispatch, obsColsList, updatedObsColsList]
  );

  // @TODO: change api to return all obs and truncate here
  useEffect(() => {
    if (!isPending && !serverError) {
      setObsColsList(
        _.map(fetchedData, (d) => {
          if (d.type === "continuous") {
            d = binContinuous(d);
            d = { ...d, scaleParams: getScaleParams(d), omit: [] };
          } else if (d.type === "discrete") {
            d = binDiscrete(d);
            d = { ...d, scaleParams: getScaleParams(d), omit: [] };
          } else if (d.type === "categorical") {
            d = {
              ...d,
              scaleParams: getScaleParams(
                { ...d, values: _.values(d.codes) },
                true
              ),
              omit: [],
            };
          }
          return d;
        })
      );
      setUpdatedObsColsList(true);
    }
  }, [fetchedData, getScaleParams, isPending, serverError]);

  useEffect(() => {
    if (dataset.selectedObs) {
      validateSelection(dataset.selectedObs);
      setActive(dataset.selectedObs.name);
    } else {
      setActive(null);
    }
  }, [dataset.selectedObs, validateSelection]);

  const toggleAll = (name, checked) => {
    setObsColsList((l) => {
      return _.map(l, (i) => {
        return i.name === name
          ? { ...i, omit: checked ? [] : _.map(i.values, (v) => i.codes[v]) }
          : i;
      });
    });
  };

  const categoricalList = useCallback(
    (item, active = null) => {
      const codesMap = _.invert(item.codes);
      const inLabelObs = _.some(dataset.labelObs, (i) =>
        _.isEqual(i, {
          name: item.name,
          type: item.type,
          codesMap: codesMap,
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
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="Toggle all"
                      checked={!item.omit.length}
                      onChange={() => {
                        toggleAll(item.name, !!item.omit.length);
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
                                codesMap: codesMap,
                              },
                            });
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faFont} />
                      </Button>
                      <Button
                        variant={
                          dataset.sliceByObs &&
                          dataset.selectedObs?.name === item.name
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "obsSelected",
                            obs: obsColsList.find(
                              (obs) => obs.name === item.name
                            ),
                          });
                          dispatch({
                            type: "toggle.slice.obs",
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                      <Button
                        variant={
                          dataset.colorEncoding === "obs" &&
                          dataset.selectedObs?.name === item.name
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "obsSelected",
                            obs: obsColsList.find(
                              (obs) => obs.name === item.name
                            ),
                          });
                          dispatch({
                            type: "set.colorEncoding",
                            value: "obs",
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faDroplet} />
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </ListGroup.Item>
              {_.map(item.values, (value) => (
                <ListGroup.Item key={value}>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <Form.Check // prettier-ignore
                        type="switch"
                        id="custom-switch"
                        label={value}
                        checked={!_.includes(item.omit, item.codes[value])}
                        onChange={() => {
                          setObsColsList((l) => {
                            return _.map(l, (i) => {
                              return i.name === item.name
                                ? {
                                    ...i,
                                    omit: !_.includes(
                                      item.omit,
                                      item.codes[value]
                                    )
                                      ? [...i.omit, item.codes[value]]
                                      : _.filter(
                                          i.omit,
                                          (o) => o !== item.codes[value]
                                        ),
                                  }
                                : i;
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 10 10"
                      >
                        <rect
                          x="0"
                          y="0"
                          width="10"
                          height="10"
                          fill={`rgb(${getColor(
                            getScale(item.scaleParams),
                            item.codes[value],
                            _.includes(item.omit, item.codes[value]),
                            {
                              alpha: 1,
                            }
                          )})`}
                        />
                      </svg>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [
      dataset.labelObs,
      dataset.sliceByObs,
      dataset.selectedObs?.name,
      dataset.colorEncoding,
      dispatch,
      obsColsList,
      getColor,
      getScale,
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
                              },
                            });
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faFont} />
                      </Button>
                      <Button
                        variant={
                          dataset.colorEncoding === "obs" &&
                          dataset.selectedObs?.name === item.name
                            ? "primary"
                            : "outline-primary"
                        }
                        size="sm"
                        onClick={(key) => {
                          if (key != null) {
                            dispatch({
                              type: "obsSelected",
                              obs: obsColsList.find(
                                (obs) => obs.name === item.name
                              ),
                            });
                            dispatch({
                              type: "set.colorEncoding",
                              value: "obs",
                            });
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faDroplet} />
                      </Button>
                    </ButtonGroup>
                  </div>
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
      obsColsList,
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
      obsColsList.map((item) => {
        if (item.type === "categorical") {
          return categoricalList(item, active);
        } else if (item.type === "continuous") {
          return continuousList(item, active);
        } else {
          return otherList(item, active);
        }
      }),
    [obsColsList, categoricalList, active, continuousList, otherList]
  );

  if (!serverError) {
    return (
      <div className="position-relative">
        <div className="list-group overflow-auto">
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

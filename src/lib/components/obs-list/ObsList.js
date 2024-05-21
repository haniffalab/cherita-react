import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import _ from "lodash";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";
import chroma from "chroma-js";
import { LoadingSpinner } from "../../utils/LoadingSpinner";
import { Accordion, ListGroup, Alert } from "react-bootstrap";

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
  const [obsColsList, setObsColsList] = useState([]);
  const [obs, setObs] = useState([]);
  const [updatedObsColsList, setUpdatedObsColsList] = useState(false);
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

  const validateSelection = useCallback(
    (selectedObs) => {
      if (updatedObsColsList) {
        if (!_.some(obsColsList, selectedObs)) {
          setActive(null);
          dispatch({
            type: "obsSelected",
            obs: null,
          });
        }
      }
    },
    [dispatch, obsColsList, updatedObsColsList]
  );

  useEffect(() => {
    if (!isPending && !serverError) {
      setObs(
        fetchedData.reduce((result, key) => {
          const colors = chroma.scale("Accent").colors(key.n_values, "rgb");
          result[key.name] = {
            type: key.type,
          };
          if (key.type === "categorical") {
            result[key.name]["is_truncated"] = key.is_truncated;
            result[key.name]["n_values"] = key.n_values;
            result[key.name]["values"] = key.values;
            result[key.name]["state"] = key.values.map((value, index) => {
              return {
                value: value,
                color: chroma(colors[index]).rgb(),
                checked: true,
              };
            });
          }
          return result;
        }, {})
      );
      setObsColsList(
        fetchedData.map((d) => {
          if (d.type === "continuous") {
            d = binContinuous(d);
          }
          if (d.type === "discrete") {
            d = binDiscrete(d);
          }
          return d;
        })
      );
      setUpdatedObsColsList(true);
    }
  }, [fetchedData, isPending, serverError]);

  useEffect(() => {
    if (dataset.selectedObs) {
      validateSelection(dataset.selectedObs);
      setActive(dataset.selectedObs.name);
    } else {
      setActive(null);
    }
  }, [dataset.selectedObs, validateSelection]);

  useEffect(() => {
    dispatch({
      type: "set.obs",
      value: obs,
    });
  }, [obs, dispatch]);

  const categoricalList = useCallback(
    (item, active = null) => {
      return (
        <Accordion.Item
          key={item.name}
          eventKey={item.name}
          className={item.name === active ? "cherita-accordion-active" : ""}
        >
          <Accordion.Header>{item.name}</Accordion.Header>
          <Accordion.Body>
            <ListGroup variant="flush">
              {item.values.map((value, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <div className="text-wrap text-break">{value}</div>
                    <span
                      className="cm-string cm-color"
                      style={{
                        backgroundColor: `rgb(${
                          obs[item.name]["state"][index]["color"]
                        })`,
                      }}
                    ></span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [obs]
  );

  const continuousList = useCallback((item, active = null) => {
    return (
      <Accordion.Item
        key={item.name}
        eventKey={item.name}
        className={item.name === active ? "cherita-accordion-active" : ""}
      >
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>
          <p>Min: {item.min}</p>
          <p>Max: {item.max}</p>
          <p>Mean: {item.mean}</p>
          <p>Median: {item.median}</p>
          <p>NBins: {item.nBins}</p>
        </Accordion.Body>
      </Accordion.Item>
    );
  }, []);

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
          <Accordion
            flush
            defaultActiveKey={active}
            onSelect={(key) => {
              if (key != null) {
                dispatch({
                  type: "obsSelected",
                  obs: obsColsList.find((obs) => obs.name === key),
                });
                dispatch({
                  type: "set.colorEncoding",
                  value: "obs",
                });
              }
            }}
          >
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

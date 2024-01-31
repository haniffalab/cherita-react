import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import _ from "lodash";
import React, { useEffect, useState, useMemo } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";
import { Accordion, ListGroup } from "react-bootstrap";
import chroma from "chroma-js";
import { ColorHelper } from "../../helpers/color";

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
  const [active, setActive] = useState(null);
  const [params, setParams] = useState({
    url: dataset.url,
  });
  const colorHelper = new ColorHelper();

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
      setObs(
        fetchedData.reduce((result, key) => {
          const colors = chroma.scale("Accent").colors(key.n_values, "rgb");
          result[key.name] = {
            is_truncated: key.is_truncated,
            n_values: key.n_values,
            type: key.type,
            values: key.values,
            state: key.values.map((value, index) => {
              return {
                value: value,
                color: chroma(colors[index]).rgb(),
                checked: true,
              };
            }),
          };
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
    }
  }, [fetchedData, isPending, serverError]);

  useEffect(() => {
    if (dataset.selectedObs) {
      setActive(dataset.selectedObs.name);
    }
  }, [dataset.selectedObs]);

  useEffect(() => {
    dispatch({
      type: "set.obs",
      value: obs,
    });
  }, [obs, dispatch]);

  function categoricalList(item) {
    console.log(obs);

    return (
      <Accordion.Item key={item.name} eventKey={item.name}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>
          <ListGroup>
            {item.values.map((value, index) => (
              <ListGroup.Item key={index}>
                {value}
                <span
                  className="cm-string cm-color"
                  style={{
                    backgroundColor: `rgb(${
                      obs[item.name]["state"][index]["color"]
                    })`,
                  }}
                ></span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    );
  }

  function continuousList(item) {
    return (
      <Accordion.Item key={item.name} eventKey={item.name}>
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
  }

  function otherList(item) {
    return (
      <Accordion.Item key={item.name} eventKey={item.name}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>{item.type}</Accordion.Body>
      </Accordion.Item>
    );
  }

  const obsList = useMemo(
    () =>
      obsColsList.map((item) => {
        if (item.type === "categorical") {
          return categoricalList(item);
        } else if (item.type === "continuous") {
          return continuousList(item);
        } else {
          return otherList(item);
        }
      }),
    [obsColsList]
  );

  return (
    <div className="">
      <div className="list-group overflow-auto">
        <Accordion
          activeKey={active}
          onSelect={(key) => {
            dispatch({
              type: "obsSelected",
              obs: obsColsList.find((obs) => obs.name === key),
            });
          }}
        >
          {obsList}
        </Accordion>
      </div>
    </div>
  );
}

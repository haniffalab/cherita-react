import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { useEffect, useState, useMemo } from "react";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { fetchData } from "../../utils/requests";
import { Accordion, ListGroup } from "react-bootstrap";

export function ObsColsList() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [obsColsList, setObsColsList] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetchData("obs/cols", { url: dataset.url })
      .then((data) => {
        setObsColsList(data);
      })
      .catch((response) => {
        response.json().then((json) => {
          console.log(json.message);
        });
      });
  }, [dataset.url]);

  useEffect(() => {
    if (dataset.selectedObs) {
      setActive(dataset.selectedObs.name);
    }
  }, [dataset.selectedObs]);

  function categoricalList(item) {
    return (
      <Accordion.Item key={item.name} eventKey={item.name}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body>
          <ListGroup>
            {item.values.map((val) => (
              <ListGroup.Item key={val}>{val}</ListGroup.Item>
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

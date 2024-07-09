import React, { useEffect, useState, useMemo, useCallback } from "react";

import _ from "lodash";
import { Accordion, ListGroup, Alert } from "react-bootstrap";

import { ObsCategoryList } from "./ObsCategoryList";
import { ObsContinuousItem } from "./ObsContinuousItem";
import { ObsToolbar } from "./ObsToolbar";
import { OBS_TYPES } from "../../constants/constants";
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

  const toggleLabel = useCallback(
    (item, inLabelObs) => {
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
    },
    [dispatch]
  );

  const toggleSlice = useCallback(
    (item) => {
      dispatch({
        type: "toggle.slice.obs",
        obs: item,
      });
    },
    [dispatch]
  );

  const toggleColor = useCallback(
    (item) => {
      dispatch({
        type: "select.obs",
        obs: item,
      });
      dispatch({
        type: "set.colorEncoding",
        value: "obs",
      });
    },
    [dispatch]
  );

  const toggleObs = useCallback(
    (item, value) => {
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
    },
    [active, dispatch]
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
                <ObsToolbar
                  item={item}
                  inLabelObs={inLabelObs}
                  showToggleAllObs={true}
                  showLabel={true}
                  showSlice={true}
                  showColor={true}
                  onToggleAllObs={() => {
                    toggleAll(item, !!item.omit.length, active);
                  }}
                  onToggleLabel={() => {
                    toggleLabel(item, inLabelObs);
                  }}
                  onToggleSlice={() => {
                    toggleSlice(item);
                  }}
                  onToggleColor={() => {
                    toggleColor(item);
                  }}
                />
              </ListGroup.Item>
              <ObsCategoryList
                item={item}
                onChange={(value) => {
                  toggleObs(item, value);
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
                totalCounts={_.sum(_.values(item.value_counts))}
              />
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [
      dataset.labelObs,
      toggleAll,
      toggleLabel,
      toggleSlice,
      toggleColor,
      toggleObs,
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
                <ObsToolbar
                  item={item}
                  inLabelObs={inLabelObs}
                  showToggleAllObs={false}
                  showLabel={true}
                  showSlice={false}
                  showColor={true}
                  onToggleLabel={() => {
                    toggleLabel(item, inLabelObs);
                  }}
                  onToggleColor={(key) => {
                    toggleColor(item);
                  }}
                />
              </ListGroup.Item>
            </ListGroup>
            <ObsContinuousItem item={item} />
          </Accordion.Body>
        </Accordion.Item>
      );
    },
    [dataset.labelObs, toggleColor, toggleLabel]
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

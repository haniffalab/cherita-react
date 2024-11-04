import React, { useEffect, useState } from "react";

import _ from "lodash";
import { ButtonGroup, Dropdown } from "react-bootstrap";

import {
  PSEUDOSPATIAL_CATEGORICAL_MODES as MODES,
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
} from "../../constants/constants";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";

function CategoricalMode() {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const modeList = _.map(MODES, (m, key) => (
    <Dropdown.Item
      key={key}
      active={dataset.pseudospatial.categoricalMode === m}
      onClick={() => {
        dispatch({
          type: "set.pseudospatial.categoricalMode",
          categoricalMode: m.value,
        });
      }}
    >
      {_.capitalize(m.name)}
    </Dropdown.Item>
  ));

  const mode = _.find(MODES, { value: dataset.pseudospatial.categoricalMode });

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light">
        {_.capitalize(mode.name)}
      </Dropdown.Toggle>
      <Dropdown.Menu>{modeList}</Dropdown.Menu>
    </Dropdown>
  );
}

function MaskSet() {
  const ENDPOINT = "masks";
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [maskSets, setMaskSets] = useState(null);

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

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params);

  useEffect(() => {
    if (!isPending && !serverError) {
      setMaskSets(fetchedData);
    }
  }, [fetchedData, isPending, serverError]);

  const maskSetList = _.map(maskSets, (ms, key) => (
    <Dropdown.Item
      key={key}
      active={dataset.pseudospatial.maskSet === key}
      onClick={() => {
        dispatch({
          type: "set.pseudospatial.maskSet",
          maskSet: key,
        });
      }}
    >
      {_.capitalize(key)}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light">
        {_.capitalize(dataset.pseudospatial.maskSet)}
      </Dropdown.Toggle>
      <Dropdown.Menu>{maskSetList}</Dropdown.Menu>
    </Dropdown>
  );
}

// @TODO: add mask selection, colormap, colorbar slider
export function PseudospatialControls({ plotType }) {
  return (
    <>
      <ButtonGroup>
        {plotType === PLOT_TYPES.CATEGORICAL && <CategoricalMode />}
        <MaskSet />
      </ButtonGroup>
    </>
  );
}

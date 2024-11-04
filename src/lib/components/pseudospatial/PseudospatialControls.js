import React, { useEffect, useState } from "react";

import _ from "lodash";
import { ButtonGroup, Dropdown } from "react-bootstrap";

import {
  PSEUDOSPATIAL_CATEGORICAL_MODES as MODES,
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
} from "../../constants/constants";
import { useDataset } from "../../context/DatasetContext";
import { useFetch } from "../../utils/requests";

function CategoricalMode({ mode, setMode }) {
  const modeList = _.map(MODES, (value, key) => (
    <Dropdown.Item
      key={key}
      active={mode === value}
      onClick={() => {
        setMode(value);
      }}
    >
      {_.capitalize(value.name)}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light">
        {_.capitalize(mode.name)}
      </Dropdown.Toggle>
      <Dropdown.Menu>{modeList}</Dropdown.Menu>
    </Dropdown>
  );
}

function MaskSet({ maskSet, setMaskSet }) {
  const ENDPOINT = "masks";
  const dataset = useDataset();
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
      active={maskSet === key}
      onClick={() => {
        setMaskSet(key);
      }}
    >
      {_.capitalize(key)}
    </Dropdown.Item>
  ));

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light">{_.capitalize(maskSet)}</Dropdown.Toggle>
      <Dropdown.Menu>{maskSetList}</Dropdown.Menu>
    </Dropdown>
  );
}

// @TODO: add mask selection, colormap, colorbar slider
export function PseudospatialControls({
  plotType,
  maskSet,
  setMaskSet,
  mode,
  setMode,
}) {
  return (
    <>
      <ButtonGroup>
        {plotType === PLOT_TYPES.CATEGORICAL && (
          <CategoricalMode mode={mode} setMode={setMode} />
        )}
        <MaskSet maskSet={maskSet} setMaskSet={setMaskSet} />
      </ButtonGroup>
    </>
  );
}

import React, { useEffect, useMemo } from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { COLORSCALES } from "../../constants/colorscales";
import { Box, Slider } from "@mui/material";

export const ScatterplotControls = () => {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  const [sliderValue, setSliderValue] = React.useState(
    dataset.controls.range || [0, 1]
  );

  const isCategorical =
    dataset.colorEncoding === "obs"
      ? dataset.selectedObs?.type === "categorical"
      : false;

  const colormapList = _.keys(COLORSCALES).map((key) => (
    <Dropdown.Item
      key={key}
      active={dataset.controls.colorScale === key}
      onClick={() => {
        dispatch({
          type: "set.controls.colorScale",
          colorScale: key,
        });
      }}
    >
      {key}
    </Dropdown.Item>
  ));

  const valueLabelFormat = (value) => {
    return (
      value *
        (dataset.controls.valueRange[1] - dataset.controls.valueRange[0]) +
      dataset.controls.valueRange[0]
    ).toFixed(2);
  };

  const updateRange = (_e, value) => {
    setSliderValue(value);
    dispatch({
      type: "set.controls.range",
      range: value,
    });
  };

  useEffect(() => {
    setSliderValue(dataset.controls.range);
  }, [dataset.controls.range]);

  const rangeSlider = (
    <Box className="w-100">
      <Slider
        getAriaLabel={() => "Colorscale range"}
        min={0}
        max={1}
        step={0.001}
        value={sliderValue}
        onChange={updateRange}
        valueLabelDisplay="auto"
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        disabled={isCategorical}
      />
    </Box>
  );

  return (
    <div>
      <Dropdown>
        <Dropdown.Toggle id="dropdownColorscale" variant="light">
          {dataset.controls.colorScale}
        </Dropdown.Toggle>
        <Dropdown.Menu>{colormapList}</Dropdown.Menu>
      </Dropdown>
      <div className="m-4">{rangeSlider}</div>
    </div>
  );
};

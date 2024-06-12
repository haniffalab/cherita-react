import React, { useEffect } from "react";
import _ from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";
import { useDataset, useDatasetDispatch } from "../../context/DatasetContext";
import { COLORSCALES } from "../../constants/colorscales";
import { Box, Slider, Typography } from "@mui/material";

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

  const marks = [
    { value: 0, label: valueLabelFormat(0) },
    { value: 1, label: valueLabelFormat(1) },
  ];

  const updateSlider = (_e, value) => {
    setSliderValue(value);
  };

  const updateRange = (_e, value) => {
    setSliderValue(value);
    dispatch({
      type: "set.controls.range",
      range: sliderValue,
    });
  };

  useEffect(() => {
    setSliderValue(dataset.controls.range);
  }, [dataset.controls.range]);

  const rangeSlider = (
    <Box className="w-100">
      <Typography id="colorscale-range" gutterBottom>
        Colorscale range
      </Typography>
      <Slider
        aria-labelledby="colorscale-range"
        min={0}
        max={1}
        step={0.001}
        value={sliderValue}
        onChange={updateSlider}
        onChangeCommitted={updateRange}
        valueLabelDisplay="auto"
        getAriaValueText={valueLabelFormat}
        valueLabelFormat={valueLabelFormat}
        marks={marks}
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

import React, { useEffect } from "react";

import { Box, Slider, Typography } from "@mui/material";
import _ from "lodash";
import { Dropdown } from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export const ScatterplotControls = () => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [sliderValue, setSliderValue] = React.useState(
    settings.controls.range || [0, 1]
  );

  const isCategorical =
    settings.colorEncoding === COLOR_ENCODINGS.OBS
      ? settings.selectedObs?.type === OBS_TYPES.CATEGORICAL
      : false;

  const colormapList = _.keys(COLORSCALES).map((key) => (
    <Dropdown.Item
      key={key}
      active={settings.controls.colorScale === key}
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
        (settings.controls.valueRange[1] - settings.controls.valueRange[0]) +
      settings.controls.valueRange[0]
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
    setSliderValue(settings.controls.range);
  }, [settings.controls.range]);

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
          {settings.controls.colorScale}
        </Dropdown.Toggle>
        <Dropdown.Menu>{colormapList}</Dropdown.Menu>
      </Dropdown>
      <div className="m-4">{rangeSlider}</div>
    </div>
  );
};

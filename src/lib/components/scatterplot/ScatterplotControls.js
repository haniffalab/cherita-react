import React, { useEffect } from "react";

import { Box, Slider, Typography } from "@mui/material";
import { Form } from "react-bootstrap";

import { COLOR_ENCODINGS, OBS_TYPES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";
import { ColorscaleSelect } from "../controls/Controls";

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
      <div className="px-4">
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
      </div>
    </Box>
  );

  return (
    <>
      <Form>
        <ColorscaleSelect />
        <Form.Group className="mb-2">{rangeSlider}</Form.Group>
      </Form>
    </>
  );
};

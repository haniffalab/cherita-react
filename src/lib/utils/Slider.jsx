import { useState, useEffect } from 'react';

import { Slider } from '@mui/material';

export const NormalizedRangeSlider = ({
  value,
  valueMin,
  valueMax,
  disabled,
  onChangeCommitted = () => {},
  ...props
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const valueLabelFormat = (value) => {
    return (value * (valueMax - valueMin) + valueMin).toFixed(2);
  };

  const marks = [
    { value: 0, label: valueLabelFormat(0) },
    { value: 1, label: valueLabelFormat(1) },
  ];

  const updateSlider = (_e, value) => {
    setSliderValue(value);
  };

  const updateRange = (_e, value) => {
    onChangeCommitted(value);
  };

  return (
    <Slider
      min={0}
      max={1}
      step={0.001}
      value={sliderValue}
      onChange={updateSlider}
      onChangeCommitted={updateRange}
      valueLabelDisplay="auto"
      getAriaValueText={valueLabelFormat}
      valueLabelFormat={valueLabelFormat}
      marks={!disabled && marks}
      disabled={disabled}
      {...props}
    />
  );
};

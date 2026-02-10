import { useState, useEffect } from 'react';

import { Box, Slider, Typography } from '@mui/material';
import { Form } from 'react-bootstrap';

import { COLOR_ENCODINGS, OBS_TYPES } from '../../constants/constants';
import { useFilteredData } from '../../context/FilterContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { useSelectedObs } from '../../utils/Resolver';
import { NormalizedRangeSlider } from '../../utils/Slider';
import { ColorscaleSelect } from '../controls/Controls';

const ColorscaleRange = () => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const { valueMin, valueMax } = useFilteredData();

  const selectedObs = useSelectedObs();

  const isCategorical =
    settings.colorEncoding === COLOR_ENCODINGS.OBS
      ? selectedObs?.type === OBS_TYPES.CATEGORICAL
      : false;

  const onChangeCommitted = (value) => {
    dispatch({
      type: 'set.controls.range',
      range: value,
    });
  };

  const disabled = !settings.colorEncoding || isCategorical;

  return (
    <Box className="w-100">
      <Typography id="colorscale-range" gutterBottom>
        Colorscale range
      </Typography>
      <div className="px-4">
        <NormalizedRangeSlider
          aria-labelledby="colorscale-range"
          value={settings.controls.range}
          valueMin={valueMin}
          valueMax={valueMax}
          disabled={disabled}
          onChangeCommitted={onChangeCommitted}
        />
      </div>
    </Box>
  );
};

const RadiusScaleRange = ({ min = 1, max = 5000 }) => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  const { selectedObsm } = settings;
  const [sliderValue, setSliderValue] = useState(
    settings.controls.radiusScale?.[selectedObsm] || 1,
  );

  useEffect(() => {
    setSliderValue(settings.controls.radiusScale?.[selectedObsm] || 1);
  }, [settings.controls.radiusScale, selectedObsm]);

  const valueLabelFormat = (value) => {
    return value.toFixed(0);
  };

  const marks = [
    { value: min, label: 'smaller' },
    { value: max, label: 'larger' },
  ];

  const onChange = (_e, value) => {
    setSliderValue(value);
  };

  const onChangeCommitted = (_e, value) => {
    dispatch({
      type: 'set.controls.radiusScale',
      obsm: selectedObsm,
      radiusScale: value,
    });
  };

  const disabled = !selectedObsm;

  return (
    <Box className="w-100">
      <Typography id="radius-scale-range" gutterBottom>
        Point size
      </Typography>
      <div className="px-4">
        <Slider
          aria-labelledby="radius-scale-range"
          min={min}
          max={max}
          step={1}
          value={sliderValue}
          onChange={onChange}
          onChangeCommitted={onChangeCommitted}
          valueLabelDisplay="off"
          getAriaValueText={valueLabelFormat}
          valueLabelFormat={valueLabelFormat}
          marks={!disabled && marks}
          disabled={disabled}
          track={false}
        />
      </div>
    </Box>
  );
};

export const ScatterplotControls = () => {
  return (
    <>
      <Form>
        <ColorscaleSelect />
        <Form.Group className="mb-2">
          <ColorscaleRange />
        </Form.Group>
        <Form.Group className="mb-2">
          <RadiusScaleRange />
        </Form.Group>
      </Form>
    </>
  );
};

import { useState } from 'react';

import { Box, Slider, Typography } from '@mui/material';
import _ from 'lodash';
import { ButtonGroup, Dropdown, Form } from 'react-bootstrap';

import {
  PSEUDOSPATIAL_CATEGORICAL_MODES as MODES,
  PSEUDOSPATIAL_PLOT_TYPES as PLOT_TYPES,
} from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';

function CategoricalMode() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const modeList = _.map(MODES, (m, key) => (
    <Dropdown.Item
      key={key}
      active={settings.pseudospatial.categoricalMode === m}
      onClick={() => {
        dispatch({
          type: 'set.pseudospatial.categoricalMode',
          categoricalMode: m.value,
        });
      }}
    >
      {_.capitalize(m.name)}
    </Dropdown.Item>
  ));

  const mode = _.find(MODES, { value: settings.pseudospatial.categoricalMode });

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
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const { pseudospatial: maskSets } = settings.data;

  const maskSetList = _.map(maskSets, (ms, key) => (
    <Dropdown.Item
      key={key}
      active={settings.pseudospatial.maskSet === key}
      onClick={() => {
        dispatch({ type: 'set.pseudospatial.maskSet', maskSet: key });
      }}
    >
      {_.capitalize(key)}
    </Dropdown.Item>
  ));

  const handleMaskChange = (mask) => {
    let newMasks =
      settings.pseudospatial.maskValues ||
      maskSets?.[settings.pseudospatial?.maskSet];

    newMasks = newMasks.includes(mask)
      ? newMasks.filter((m) => m !== mask)
      : [...newMasks, mask];

    if (
      !_.difference(maskSets?.[settings.pseudospatial?.maskSet], newMasks)
        .length
    ) {
      newMasks = null;
    }

    dispatch({ type: 'set.pseudospatial.maskValues', maskValues: newMasks });
  };

  const toggleMasks = () => {
    if (
      !settings.pseudospatial.maskValues ||
      settings.pseudospatial.maskValues?.length ===
        maskSets?.[settings.pseudospatial?.maskSet]?.length
    ) {
      dispatch({ type: 'set.pseudospatial.maskValues', maskValues: [] });
    } else {
      dispatch({ type: 'set.pseudospatial.maskValues', maskValues: null });
    }
  };

  const masksList = _.map(
    maskSets?.[settings.pseudospatial?.maskSet],
    (mask) => (
      <Dropdown.ItemText key={mask}>
        <Form.Check
          type="checkbox"
          label={mask}
          checked={
            !settings.pseudospatial.maskValues ||
            settings.pseudospatial.maskValues.includes(mask)
          }
          onChange={() => handleMaskChange(mask)}
        />
      </Dropdown.ItemText>
    ),
  );

  const nMasks = settings.pseudospatial.maskValues
    ? settings.pseudospatial.maskValues?.length
    : maskSets?.[settings.pseudospatial?.maskSet]?.length || 'No';

  const toggleAllChecked =
    !settings.pseudospatial.maskValues ||
    settings.pseudospatial.maskValues?.length ===
      maskSets?.[settings.pseudospatial?.maskSet]?.length;

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="light">
          {_.capitalize(settings.pseudospatial.maskSet || 'Select a mask set')}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Header>Mask set</Dropdown.Header>
          {maskSetList}
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant="light">
          {nMasks} masks selected
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Header>Masks</Dropdown.Header>
          <Dropdown.ItemText key="toggle-all">
            <Form.Check
              type="checkbox"
              label="Toggle all"
              checked={toggleAllChecked}
              onChange={toggleMasks}
            />
          </Dropdown.ItemText>
          {masksList}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}

function OpacitySlider({ opacity, setOpacity }) {
  const [sliderValue, setSliderValue] = useState(opacity);

  return (
    <Box className="w-100">
      <Typography id="opacity-range" gutterBottom>
        Reference image opacity
      </Typography>
      <div className="px-4">
        <Slider
          aria-labelledby="opacity-range"
          min={0}
          max={1}
          step={0.05}
          value={sliderValue}
          onChange={(_e, value) => setSliderValue(value)}
          onChangeCommitted={(_e, value) => setOpacity(value)}
          valueLabelDisplay="auto"
          getAriaValueText={(value) => `${value * 100}%`}
          valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
          marks={[
            { value: 0, label: '0%' },
            { value: 1, label: '100%' },
          ]}
        />
      </div>
    </Box>
  );
}

// @TODO: add colormap, colorbar slider
export function PseudospatialToolbar({ plotType }) {
  const { imageUrl } = useDataset();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  return (
    <div className="cherita-pseudospatial-toolbar">
      <ButtonGroup>
        <MaskSet />
      </ButtonGroup>
      <ButtonGroup>
        {plotType === PLOT_TYPES.CATEGORICAL && <CategoricalMode />}
      </ButtonGroup>
      {imageUrl && (
        <OpacitySlider
          opacity={settings.pseudospatial.refImg.opacity}
          setOpacity={(opacity) => {
            dispatch({
              type: 'set.pseudospatial.refImg.opacity',
              opacity: opacity,
            });
          }}
        />
      )}
    </div>
  );
}

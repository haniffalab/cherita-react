import React from 'react';

import _ from 'lodash';
import { Form } from 'react-bootstrap';

import { COLORSCALES } from '../../constants/colorscales';
import {
  DOTPLOT_SCALES,
  MATRIXPLOT_SCALES,
  VIOLINPLOT_SCALES,
} from '../../constants/constants';
import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';

export const ColorscaleSelect = () => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  return (
    <Form.Group className="mb-2">
      <Form.Label>Colorscale</Form.Label>
      <Form.Select
        value={settings.controls.colorScale}
        onChange={(e) => {
          dispatch({
            type: 'set.controls.colorScale',
            colorScale: e.target.value,
          });
        }}
      >
        {_.keys(COLORSCALES).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export const ScaleSelect = ({ plot }) => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const SCALES = {
    dotplot: DOTPLOT_SCALES,
    matrixplot: MATRIXPLOT_SCALES,
    violinplot: VIOLINPLOT_SCALES,
  };

  return (
    <Form.Group className="mb-2">
      <Form.Label>Standard scale</Form.Label>
      <Form.Select
        value={settings.controls.scale[plot] || ''}
        onChange={(e) => {
          dispatch({
            type: 'set.controls.scale',
            plot: plot,
            scale: !e.target.value.length ? null : e.target.value,
          });
        }}
      >
        {_.values(SCALES[plot]).map((scale) => (
          <option key={scale.value} value={scale.value || ''}>
            {scale.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

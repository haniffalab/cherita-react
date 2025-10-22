import React, { useEffect, useState } from 'react';

import { Button, Form, InputGroup } from 'react-bootstrap';

import {
  useSettings,
  useSettingsDispatch,
} from '../../context/SettingsContext';
import { ColorscaleSelect, ScaleSelect } from '../controls/Controls';

export function DotplotControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [controls, setControls] = useState({
    expressionCutoff: settings.controls.expressionCutoff,
    colorAxis: {
      cmin: settings.controls.colorAxis.cmin,
      cmax: settings.controls.colorAxis.cmax,
    },
  });

  useEffect(() => {
    setControls((c) => ({
      ...c,
      colorAxis: {
        cmin: settings.controls.colorAxis.cmin,
        cmax: settings.controls.colorAxis.cmax,
      },
      expressionCutoff: settings.controls.expressionCutoff,
    }));
  }, [
    settings.controls.colorAxis.cmin,
    settings.controls.colorAxis.cmax,
    settings.controls.expressionCutoff,
  ]);

  return (
    <>
      <Form>
        <ColorscaleSelect />
        <Form.Group className="mb-2">
          <InputGroup>
            <InputGroup.Text>min</InputGroup.Text>
            <Form.Control
              name="scaleMin"
              size="sm"
              type="number"
              value={controls.colorAxis.cmin}
              step={0.1}
              min={Math.min(settings.controls.colorAxis.dmin, 0.0)}
              max={settings.controls.colorAxis.dmax}
              onChange={(e) => {
                setControls({
                  ...controls,
                  colorAxis: { ...controls.colorAxis, cmin: e.target.value },
                });
              }}
            ></Form.Control>
            <InputGroup.Text>max</InputGroup.Text>
            <Form.Control
              name="scaleMax"
              size="sm"
              type="number"
              value={controls.colorAxis.cmax}
              step={0.1}
              min={controls.colorAxis.cmin}
              max={settings.controls.colorAxis.dmax}
              onChange={(e) => {
                if (
                  parseFloat(e.target.value) > settings.controls.colorAxis.dmax
                ) {
                  e.target.value = settings.controls.colorAxis.dmax.toFixed(1);
                }
                setControls({
                  ...controls,
                  colorAxis: { ...controls.colorAxis, cmax: e.target.value },
                });
              }}
            ></Form.Control>
            <Button
              variant="outline-primary"
              onClick={() =>
                dispatch({
                  type: 'set.controls.colorAxis.crange',
                  cmin: controls.colorAxis.cmin,
                  cmax: controls.colorAxis.cmax,
                })
              }
            >
              Apply
            </Button>
            <Button
              variant="outline-primary"
              onClick={() =>
                dispatch({
                  type: 'set.controls.colorAxis.crange',
                  cmin: settings.controls.colorAxis.dmin,
                  cmax: settings.controls.colorAxis.dmax,
                })
              }
            >
              Reset
            </Button>
          </InputGroup>
        </Form.Group>
        <ScaleSelect plot="dotplot" />
        <Form.Group className="mb-2">
          <Form.Label>Expression Cutoff</Form.Label>
          <InputGroup>
            <Form.Control
              size="sm"
              type="number"
              step={'0.1'}
              min={0.0}
              value={controls.expressionCutoff}
              onChange={(e) => {
                setControls({ ...controls, expressionCutoff: e.target.value });
              }}
            ></Form.Control>
            <Button
              variant="outline-primary"
              onClick={() =>
                dispatch({
                  type: 'set.controls.expressionCutoff',
                  expressionCutoff: parseFloat(controls.expressionCutoff),
                })
              }
            >
              Apply
            </Button>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Check
            type="switch"
            id="meanOnlyExpressed"
            label="Average only above cutoff"
            checked={settings.controls.meanOnlyExpressed}
            onChange={() => {
              dispatch({
                type: 'set.controls.meanOnlyExpressed',
                meanOnlyExpressed: !settings.controls.meanOnlyExpressed,
              });
            }}
          />
        </Form.Group>
      </Form>
    </>
  );
}

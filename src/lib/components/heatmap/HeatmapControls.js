import React from "react";

import _ from "lodash";
import { Form } from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function HeatmapControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  return (
    <>
      <Form>
        <Form.Group className="mb-1">
          <Form.Label>Colorscale</Form.Label>
          <Form.Select
            value={settings.controls.colorScale}
            onChange={(e) => {
              dispatch({
                type: "set.controls.colorScale",
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
      </Form>
    </>
  );
}

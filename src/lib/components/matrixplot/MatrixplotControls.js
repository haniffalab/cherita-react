import React from "react";

import _ from "lodash";
import { Form } from "react-bootstrap";

import { COLORSCALES } from "../../constants/colorscales";
import { MATRIXPLOT_SCALES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function MatrixplotControls() {
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
        <Form.Group className="mb-2">
          <Form.Label>Standard scale</Form.Label>
          <Form.Select
            value={settings.controls.scale.matrixplot || ""}
            onChange={(e) => {
              dispatch({
                type: "set.controls.scale",
                plot: "matrixplot",
                scale: !e.target.value.length ? null : e.target.value,
              });
            }}
          >
            {_.values(MATRIXPLOT_SCALES).map((scale) => (
              <option key={scale.value} value={scale.value || ""}>
                {scale.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Form>
    </>
  );
}

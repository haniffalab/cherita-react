import React from "react";

import _ from "lodash";
import { Form } from "react-bootstrap";

import { VIOLINPLOT_SCALES } from "../../constants/constants";
import {
  useSettings,
  useSettingsDispatch,
} from "../../context/SettingsContext";

export function ViolinControls() {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();

  return (
    <>
      <Form>
        <Form.Group className="mb-2">
          <Form.Select
            value={settings.controls.scale.violinplot || ""}
            onChange={(e) => {
              dispatch({
                type: "set.controls.scale",
                plot: "violinplot",
                scale: !e.target.value.length ? null : e.target.value,
              });
            }}
          >
            {_.values(VIOLINPLOT_SCALES).map((scale) => (
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

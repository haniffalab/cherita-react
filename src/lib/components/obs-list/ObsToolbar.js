import React from "react";

import { Form } from "react-bootstrap";

export function ObsToolbar({ item, showToggleAllObs = true, onToggleAllObs }) {
  const allToggledOn = !item.omit.length;

  return (
    showToggleAllObs && (
      <Form.Check
        type="switch"
        id="custom-switch"
        label="Toggle all"
        checked={allToggledOn}
        onChange={onToggleAllObs}
      />
    )
  );
}

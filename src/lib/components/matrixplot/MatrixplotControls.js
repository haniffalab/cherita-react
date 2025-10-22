import React from 'react';

import { Form } from 'react-bootstrap';

import { ColorscaleSelect, ScaleSelect } from '../controls/Controls';

export function MatrixplotControls() {
  return (
    <>
      <Form>
        <ColorscaleSelect />
        <ScaleSelect plot="matrixplot" />
      </Form>
    </>
  );
}

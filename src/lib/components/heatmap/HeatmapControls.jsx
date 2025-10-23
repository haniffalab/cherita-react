import { Form } from 'react-bootstrap';

import { ColorscaleSelect } from '../controls/Controls';

export function HeatmapControls() {
  return (
    <>
      <Form>
        <ColorscaleSelect />
      </Form>
    </>
  );
}

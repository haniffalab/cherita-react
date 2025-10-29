import { Form } from 'react-bootstrap';

import { ScaleSelect } from '../controls/Controls';

export function ViolinControls() {
  return (
    <>
      <Form>
        <ScaleSelect plot="violinplot" />
      </Form>
    </>
  );
}

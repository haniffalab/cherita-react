import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { useDataset } from '../../context/DatasetContext';
import { formatNumerical } from '../../utils/string';
import { ObsmKeysList } from '../obsm-list/ObsmList';

export function Toolbox({ mode, obsLength, slicedLength, setHasObsm }) {
  const { obsLabel } = useDataset();
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        <ObsmKeysList setHasObsm={setHasObsm} />
        {(mode || !isNaN(obsLength)) &&
          (mode !== null &&
          !isNaN(slicedLength) &&
          slicedLength !== obsLength ? (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You have selected {formatNumerical(slicedLength)} out of{' '}
                  {formatNumerical(obsLength)} {obsLabel.plural}
                </Tooltip>
              }
            >
              <Button
                size="sm"
                variant="primary"
                style={{ cursor: 'default' }}
                aria-disabled="true"
              >
                {formatNumerical(slicedLength)} of {formatNumerical(obsLength)}{' '}
                {obsLabel.plural}
              </Button>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You are viewing {formatNumerical(obsLength)} {obsLabel.plural}
                </Tooltip>
              }
            >
              <Button
                size="sm"
                variant="primary"
                style={{ cursor: 'default' }}
                aria-disabled="true"
              >
                {formatNumerical(obsLength)} {obsLabel.plural}
              </Button>
            </OverlayTrigger>
          ))}
      </ButtonGroup>
    </div>
  );
}

import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { formatNumerical } from '../../utils/string';
import { ObsmKeysList } from '../obsm-list/ObsmList';

export function Toolbox({
  mode,
  obsLength,
  slicedLength,
  setHasObsm,
  showPlotControls,
}) {
  return (
    <div className="cherita-toolbox">
      <ButtonGroup>
        {showPlotControls && <ObsmKeysList setHasObsm={setHasObsm} />}
        {(mode || !isNaN(obsLength)) &&
          (mode !== null &&
          !isNaN(slicedLength) &&
          slicedLength !== obsLength ? (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You have selected {formatNumerical(slicedLength)} out of{' '}
                  {formatNumerical(obsLength)} cells
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
                cells
              </Button>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-dropped-mode">
                  You are viewing {formatNumerical(obsLength)} cells
                </Tooltip>
              }
            >
              <Button
                size="sm"
                variant="primary"
                style={{ cursor: 'default' }}
                aria-disabled="true"
              >
                {formatNumerical(obsLength)} cells
              </Button>
            </OverlayTrigger>
          ))}
      </ButtonGroup>
    </div>
  );
}

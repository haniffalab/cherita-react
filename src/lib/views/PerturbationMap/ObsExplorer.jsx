import _ from 'lodash';
import { Table } from 'react-bootstrap';

import { OBS_TYPES } from '../../constants/constants';
import { useSettings } from '../../context/SettingsContext';
import { formatNumerical } from '../../utils/string';
import { useObsColsData } from '../../utils/zarrData';

export function ObsExplorer() {
  const { selectedObsIndex, explorerObs } = useSettings();

  const { obsCols, data, isPending, serverError } = useObsColsData(explorerObs);

  if (selectedObsIndex == null) {
    return <div className="my-3">No selection</div>;
  }

  if (isPending) {
    return <div className="my-3">Loading...</div>;
  }
  if (serverError) {
    return <div className="my-3">Error loading data</div>;
  }
  return (
    <Table striped size="sm" responsive>
      <tbody>
        {_.map(data, (value, colName) => {
          const col = obsCols?.[colName] || {};
          let v;
          if (col.type === OBS_TYPES.CONTINUOUS) {
            v = formatNumerical(parseFloat(value));
          } else if (col.type === OBS_TYPES.DISCRETE) {
            v = value;
          } else if (col.type === OBS_TYPES.BOOLEAN) {
            v = col.codesMap?.[+value] || value;
          } else {
            v = col.codesMap?.[value] || value;
          }
          return (
            <tr key={colName}>
              <td>{colName}</td>
              <td>{v}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

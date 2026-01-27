import { useMemo } from 'react';

import _ from 'lodash';
import { Table } from 'react-bootstrap';

import { OBS_TYPES } from '../../constants/constants';
import { useSettings } from '../../context/SettingsContext';
import { useParquetQuery } from '../../utils/parquetData';
import { formatNumerical } from '../../utils/string';
import { useObsColsData } from '../../utils/zarrData';

import { VirtualizedTable } from '../../utils/VirtualizedTable';

const DataTable = ({ query }) => {
  const { data, isLoading, error } = useParquetQuery(query);
  const { fields } = data?.schema || [];

  const result = data?.toArray().map((row) => row.toJSON());

  if (isLoading) {
    return <div className="my-3">Loading...</div>;
  }
  if (error) {
    return <div className="my-3">Error loading data</div>;
  }
  if (!result || result.length === 0) {
    return null;
  }

  return <VirtualizedTable fields={fields} data={result} />;
};

export function ObsExplorer() {
  const { selectedObsIndex, obsExplorer = {} } = useSettings();

  const {
    obsCols,
    data: colsData,
    isPending,
    serverError,
  } = useObsColsData(obsExplorer.obsCols);

  const query = useMemo(() => {
    if (!selectedObsIndex || !obsExplorer.dataUrl || !colsData) return null;

    const where = _.map(_.keys(obsExplorer.dataFilterCols), (colName) => {
      return `${obsExplorer.dataFilterCols[colName]}='${colsData?.[colName]}'`;
    }).join(' AND ');

    return `
      SELECT *
      FROM read_parquet('${obsExplorer.dataUrl}')
      WHERE ${where}
    `;
  }, [
    selectedObsIndex,
    obsExplorer.dataUrl,
    obsExplorer.dataFilterCols,
    colsData,
  ]);

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
    <div>
      <Table striped size="sm" responsive>
        <tbody>
          {_.map(colsData, (value, colName) => {
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
      <DataTable query={query} />
    </div>
  );
}

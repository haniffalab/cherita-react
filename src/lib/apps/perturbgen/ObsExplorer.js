import { useMemo, useState, useEffect, useCallback } from 'react';

import _ from 'lodash';
import { Table } from 'react-bootstrap';

import { OBS_TYPES } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { useSettings } from '../../context/SettingsContext';
import { useParquetQuery } from '../../utils/parquetData';
import { formatNumerical } from '../../utils/string';
import { VirtualizedTable } from '../../utils/VirtualizedTable';
import { useObsColsData } from '../../utils/zarrData';

const DataTable = ({ query: baseQuery, pageSize = 100 }) => {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    setData([]);
    setOffset(0);
  }, [baseQuery]);

  const query = useMemo(() => {
    if (!baseQuery) return null;
    return `
      ${baseQuery}
      LIMIT ${pageSize} OFFSET ${offset}
    `;
  }, [baseQuery, offset, pageSize]);

  const { data: queryData, isLoading, error } = useParquetQuery(query);

  useEffect(() => {
    if (queryData) {
      const newData = queryData.toArray().map((row) => row.toJSON());
      setData((prevData) => [...prevData, ...newData]);
      setFields(queryData.schema?.fields || []);
    }
  }, [queryData]);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    setOffset((prev) => prev + pageSize);
  }, [isLoading, pageSize]);

  if (isLoading && offset === 0) {
    return <div className="my-3">Loading...</div>;
  }
  if (error) {
    return <div className="my-3">Error loading data</div>;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <VirtualizedTable
      fields={fields}
      data={data}
      loadMore={loadMore}
      isLoading={isLoading}
    />
  );
};

export function ObsExplorer() {
  const { selectedObsIndex } = useSettings();
  const { obsExplorer = {} } = useDataset();

  const {
    obsCols,
    data: colsData,
    isPending,
    serverError,
  } = useObsColsData(obsExplorer?.obsCols);

  const query = useMemo(() => {
    if (!selectedObsIndex || !obsExplorer?.dataUrl || !colsData) return null;

    const where = _.map(_.keys(obsExplorer?.dataFilterCols), (colName) => {
      return `${obsExplorer?.dataFilterCols[colName]}='${colsData?.[colName]}'`;
    }).join(' AND ');

    return (
      `
      SELECT *
      FROM read_parquet('${obsExplorer?.dataUrl}')
    ` + (where ? `WHERE ${where}` : '')
    );
  }, [
    selectedObsIndex,
    obsExplorer?.dataUrl,
    obsExplorer?.dataFilterCols,
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

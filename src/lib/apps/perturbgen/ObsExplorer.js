import { useMemo, useState, useEffect, useCallback } from 'react';

import _ from 'lodash';
import { Alert, Table } from 'react-bootstrap';

import { OBS_TYPES } from '../../constants/constants';
import { useDataset } from '../../context/DatasetContext';
import { useSettings } from '../../context/SettingsContext';
import { useParquet, useParquetQuery } from '../../utils/parquetData';
import { DataTableSkeleton } from '../../utils/Skeleton';
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
    if (queryData && !queryData.numRows) return;
    setOffset((prev) => prev + pageSize);
  }, [isLoading, pageSize, queryData]);

  if (isLoading && offset === 0) {
    return <DataTableSkeleton />;
  }
  if (error) {
    return <Alert variant="danger">Error loading data</Alert>;
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

const ObsExplorerTable = ({ colsData }) => {
  const { selectedObsIndex } = useSettings();
  const { obsExplorer = {} } = useDataset();
  const { dataUrl, dataFilterCols } = obsExplorer;

  const query = useMemo(() => {
    if (!selectedObsIndex || !dataUrl || (dataFilterCols && !colsData))
      return null;

    const where = _.map(_.keys(dataFilterCols), (colName) => {
      return `${dataFilterCols[colName]}='${colsData?.[colName]}'`;
    }).join(' AND ');

    return (
      `
      SELECT *
      FROM read_parquet('${dataUrl}')
    ` + (where ? `WHERE ${where}` : '')
    );
  }, [selectedObsIndex, dataUrl, dataFilterCols, colsData]);

  return <DataTable query={query} />;
};

export function ObsExplorer() {
  const { selectedObsIndex } = useSettings();
  const { obsExplorer = {} } = useDataset();
  useParquet(); // initialize duckdb instance

  const {
    obsCols,
    data: colsData,
    isPending,
    serverError,
  } = useObsColsData(obsExplorer?.obsCols);

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
      <ObsExplorerTable colsData={colsData} />
    </div>
  );
}

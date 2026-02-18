import { useMemo, useState, useEffect, useCallback } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';
import { Alert, Modal } from 'react-bootstrap';

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
  const [showModal, setShowModal] = useState(false);

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
    return (
      <div className="my-4 text-muted">
        Select a point in the scatterplot to view details about the gene
        perturbation.
      </div>
    );
  }
  if (isPending) {
    return <div className="my-3">Loading...</div>;
  }
  if (serverError) {
    return <div className="my-3">Error loading data</div>;
  }
  return (
    <div className="mt-3 d-flex flex-column h-100">
      <div className="overflow-auto flex-grow-1 modern-scrollbars">
        <h2 className="fw-bold mb-2">
          <Tooltip
            title={
              <>
                This panel shows metadata and predicted downstream effects for
                the selected gene perturbation across the atlas.
              </>
            }
            placement="right"
            arrow
          >
            GENE
          </Tooltip>
        </h2>
        <p className="mb-3">Gene description</p>
        <div className="mb-0">
          <h5 className="fw-bold mb-2">
            <Tooltip
              title={
                <>
                  These values describe how the selected gene perturbation is
                  annotated in the atlas, including lineage, biological context,
                  and summary scores used in the perturbation landscape.
                </>
              }
              placement="right"
              arrow
            >
              Perturbation metadata <InfoOutlinedIcon fontSize="small" />
            </Tooltip>
          </h5>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              marginBottom: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Table size="small" aria-label="perturbation metadata">
              <TableBody>
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
                    <TableRow hover key={colName}>
                      <TableCell scope="row">
                        {col.displayName || colName}
                      </TableCell>
                      <TableCell>{v}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="mb-3">
          <h5 className="fw-bold mb-2 d-flex align-items-center justify-content-between">
            <Tooltip
              title={
                <>
                  This table shows genes predicted to change exp ression i
                  response to the selected perturbation. Re sults can be sor and
                  explored to identify affect ed pathways and regulatory
                  programs.
                </>
              }
              placement="right"
              arrow
            >
              <span
                className="d-i{' '}
               nline-flex align-items-center"
              >
                Predicted downstream effects{' '}
                <InfoOutlinedIcon fontSize="small" className="ms-1" />
              </span>
            </Tooltip>

            {/* MUI expand icon */}
            <IconButton
              size="small"
              onClick={() => setShowModal(true)}
              aria-label="Expand full table"
            >
              <OpenInFullIcon fontSize="small" />
            </IconButton>
          </h5>

          <ObsExplorerTable colsData={colsData} />
        </div>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Full downstream effects table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ObsExplorerTable colsData={colsData} />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

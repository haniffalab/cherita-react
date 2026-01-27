import { forwardRef, Fragment } from 'react';

import {
  Table as MuiTable,
  Paper,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';
import _ from 'lodash';
import { TableVirtuoso } from 'react-virtuoso';

export const VirtualizedTable = ({ fields, data, height = 400 }) => {
  const TableComponents = {
    Scroller: forwardRef((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <MuiTable
        {...props}
        style={{ borderCollapse: 'separate' }}
        size="small"
      />
    ),
    TableHead: TableHead,
    TableRow: TableRow,
    TableBody: forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        {fields?.map((field) => (
          <TableCell
            key={field.name}
            variant="head"
            style={{
              backgroundColor: 'white',
            }}
          >
            {field.name}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(_index, row) {
    return (
      <Fragment>
        {_.map(fields, (field) => (
          <TableCell key={field.name}>{row[field.name]}</TableCell>
        ))}
      </Fragment>
    );
  }

  return (
    <TableVirtuoso
      style={{ height: height }}
      data={data}
      components={TableComponents}
      fixedHeaderContent={fixedHeaderContent}
      itemContent={rowContent}
    />
  );
};

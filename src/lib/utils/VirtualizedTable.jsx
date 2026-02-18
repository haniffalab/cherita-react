import { forwardRef, Fragment, useCallback } from 'react';

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

import { TableRowSkeleton } from './Skeleton';

const TableComponents = {
  Scroller: forwardRef((props, ref) => {
    const { sx, ...rest } = props;

    return (
      <TableContainer
        component={Paper}
        ref={ref}
        {...rest}
        sx={[
          {
            marginBottom: 2,
            border: 1,
            borderColor: 'divider',
          },
          sx,
        ]}
      />
    );
  }),
  Table: (props) => (
    <MuiTable {...props} style={{ borderCollapse: 'separate' }} size="small" />
  ),
  TableHead: TableHead,
  TableRow: TableRow,
  TableBody: forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

export const VirtualizedTable = ({
  fields,
  data,
  height = 400,
  loadMore = null,
  increaseViewportBy = 100,
  isLoading = false,
}) => {
  const fixedHeaderContent = useCallback(() => {
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
  }, [fields]);

  const fixedFooterContent = useCallback(() => {
    if (!isLoading) return null;
    return <TableRowSkeleton cols={fields.length} />;
  }, [isLoading, fields.length]);

  const rowContent = useCallback(
    (_index, row) => {
      return (
        <Fragment>
          {_.map(fields, (field) => (
            <TableCell key={`${field.name}`}>{row[field.name]}</TableCell>
          ))}
        </Fragment>
      );
    },
    [fields],
  );

  return (
    <TableVirtuoso
      style={{ height: height }}
      data={data}
      components={TableComponents}
      fixedHeaderContent={fixedHeaderContent}
      fixedFooterContent={fixedFooterContent}
      itemContent={rowContent}
      endReached={loadMore}
      increaseViewportBy={increaseViewportBy}
    />
  );
};

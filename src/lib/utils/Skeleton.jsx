import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import { Button, Placeholder } from 'react-bootstrap';

export const ObsmKeysListBtn = () => {
  return (
    <Placeholder as={Button} animation="glow">
      <Placeholder
        xs={6}
        style={{
          width: '40px',
        }}
      />
    </Placeholder>
  );
};

export const TableRowSekeleton = ({ cols = 3 }) => {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  );
};

export const DataTableSkeleton = ({ rows = 2, cols = 3 }) => {
  return (
    <Table>
      <TableHead>
        <TableRowSekeleton cols={cols} />
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRowSekeleton key={rowIndex} cols={cols} />
        ))}
      </TableBody>
    </Table>
  );
};

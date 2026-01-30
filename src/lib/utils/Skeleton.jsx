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

export const DataTableSkeleton = ({ rows = 2, cols = 3 }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: cols }).map((_, index) => (
            <TableCell key={index}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

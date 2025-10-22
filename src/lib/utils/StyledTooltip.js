import React from 'react';

import { styled, Tooltip, tooltipClasses } from '@mui/material';

export const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#000',
    color: '#fff',
    maxWidth: 220,
    fontSize: 13,
    borderRadius: 4,
    padding: theme.spacing(0.5, 1),
    whiteSpace: 'pre-line',
    textAlign: 'center',
    boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
  },
}));

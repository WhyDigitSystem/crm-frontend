import React from 'react';
import { Box, Typography } from '@mui/material';

function CompanyDetails() {
  return (
    <Box
      sx={{
        py: 2,
        textAlign: 'center',
        backgroundColor: 'background.default',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 WHYDIGIT SYSTEM PRIVATE LIMITED
      </Typography>
    </Box>
  );
}

export default CompanyDetails;

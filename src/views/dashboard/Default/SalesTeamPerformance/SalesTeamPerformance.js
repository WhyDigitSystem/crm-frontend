import React from 'react';
import { Box, Typography, Card, CardContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ShowChartIcon from '@mui/icons-material/ShowChart'; // Chart icon

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: '12px',
  boxShadow: theme.shadows[1],
  padding: theme.spacing(1.5, 2),
}));

const SalesTeamPerformanceBox = () => {
  return (
    <StyledCard>
      <IconButton disableRipple sx={{ color: 'primary.main', mr: 1 }}>
        <ShowChartIcon />
      </IconButton>
      <CardContent sx={{ padding: '0 !important' }}>
        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Sales & Team's Performance
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default SalesTeamPerformanceBox;

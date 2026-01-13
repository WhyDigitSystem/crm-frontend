import {
  Stack,
  Chip,
  Card,
  CardContent,
  Divider,
  Avatar,
  Button,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
} from '@mui/material';

import KPIBox from 'views/basicMaster/KPIBox';
import SectionCard from './SectionCard';
import ScreenGate from './ScreenGate';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';


import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import KPICardsDashboard from '../KPICardsDashboard';
import SalesPerformance from '../SalesPerformance';
import LeadSource from '../LeadSource';
import CustomerGrouthDashboard from '../CustomerGrouthDashboard';
import LoseGraph from '../LoseGraph';
import StuckDeals from '../StuckDeals';

export default function Dashboard() {
  const today = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const stuckOpp = 0, stuckQuotes = 0;
  const companyTarget = 100000;
  const totalSales = 70000;
  const expectedByToday = (companyTarget / daysInMonth) * today;
  const projectedPercent = Math.round((totalSales / expectedByToday) * 100);

  let color = 'success';
  let label = 'On Track';

  if (projectedPercent < 80) {
    color = 'error';
    label = 'High Risk';
  } else if (projectedPercent < 100) {
    color = 'warning';
    label = 'Slight Risk';
  }

  return (
    <Box p={3}>
      {/* KPI CARDS */}
      {/* SALES & TODAY'S TASKS */}
      <KPICardsDashboard />
      <Grid container spacing={2} mt={2}>
        <SalesPerformance />
        <LeadSource />
        <ScreenGate screen="DASH">
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* ================= STUCK DEALS ================= */}
              <StuckDeals />
              {/* ================= FIELD STAFF SUMMARY ================= */}
              <SectionCard title="Field Staff Summary">
                <Stack spacing={3}>

                  <Stack direction="row" spacing={2} justifyContent="space-between">

                    <Stack alignItems="center">
                      <GroupsOutlinedIcon color="primary" />
                      <Typography variant="h6">18</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active Today
                      </Typography>
                    </Stack>

                    <Stack alignItems="center">
                      <CheckCircleOutlineOutlinedIcon color="success" />
                      <Typography variant="h6">42</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Visits Completed
                      </Typography>
                    </Stack>

                    <Stack alignItems="center">
                      <PauseCircleOutlineOutlinedIcon color="warning" />
                      <Typography variant="h6" color="warning.main">
                        3
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Idle Staff
                      </Typography>
                    </Stack>

                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    View Staff Details
                  </Button>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>
        </ScreenGate>
      {/* </Grid>
      <Grid container spacing={2} mt={2}> */}
        <CustomerGrouthDashboard />
        <LoseGraph />
      </Grid>
    </Box>
  );
}

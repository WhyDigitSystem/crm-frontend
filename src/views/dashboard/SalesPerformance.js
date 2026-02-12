import { useEffect, useState } from 'react';
import ScreenGate from './Default/ScreenGate';
import {
  Stack,
  Chip,
  Divider,
  Grid,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import apiCalls from 'apicall';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SectionCard from './Default/SectionCard';
import AnnouncementListDashboard from 'views/Announcement/AnnouncementListDashboard';

const SalesPerformance = () => {
  const orgId = localStorage.getItem('orgId');
  const branchCode = localStorage.getItem('branchcode');
  const finYear = localStorage.getItem('finYear');

  const [targetBasis, setTargetBasis] = useState('Amount');
  const [targetBasisList, setTargetBasisList] = useState([{ listOfValues: 'Amount' }]);

  const [performanceType, setPerformanceType] = useState('top'); // top | risk
  const [empPerformance, setEmpPerformance] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const [companyTarget, setCompanyTarget] = useState({
    totalAmount: 0,
    targetValue: 0,
    percentage: 0
  });

  /* ------------------ API CALLS ------------------ */

  useEffect(() => {
    getTargetBasis();
  }, []);

  useEffect(() => {
    if (targetBasis && performanceType) {
      getCompanyTarget();
      getEmployeePerformance();
    }
  }, [targetBasis, performanceType]);

  const getTargetBasis = async () => {
    try {
      const res = await apiCalls('get', `/master/getAllListValues?listDescription=targetBasis&orgId=${orgId}`);
      if (res?.status) {
        setTargetBasisList(res.paramObjectsMap.listValues || []);
      }
    } catch {
      setTargetBasisList([{ listOfValues: 'Amount' }]);
    }
  };

  const getCompanyTarget = async () => {
    const res = await apiCalls(
      'get',
      `/commonmaster/getCompanyTargetDetails?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&periodType=monthly&type=${targetBasis}`
    );

    if (res?.status) {
      const d = res.paramObjectsMap.CompanyTargetInformation[0];
      setCompanyTarget({
        totalAmount: Number(d.totalAmount),
        targetValue: Number(d.targetValue),
        percentage: Number(d.percentage)
      });
    }
  };

  const getEmployeePerformance = async () => {
    const res = await apiCalls(
      'get',
      `/commonmaster/getEmployeePerformanceDetails?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&performance=${performanceType}&periodType=monthly&type=${targetBasis}`
    );

    if (res?.status) {
      setEmpPerformance(res.paramObjectsMap.performanceInformation || []);
    } else {
      setEmpPerformance([]);
    }
  };
  const topCount = empPerformance.filter((p) => Number(p.percentage) >= 100).length;
  const atRiskCount = empPerformance.filter((p) => Number(p.percentage) < 60).length;

  const title = performanceType === 'top' ? '🏆 Top Performers' : '🔴 At Risk Performers';

  /* ------------------ EXPORT ------------------ */

  const exportAtRiskExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('At Risk');

    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = 'At Risk Sales Performers';
    sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' }
    };

    sheet.addRow([]);

    const header = sheet.addRow(['S.No', 'Employee', 'Code', 'Department', 'Amount', 'Percentage']);

    header.eachCell((c) => {
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
    });

    empPerformance.forEach((e, i) => {
      sheet.addRow([i + 1, e.employeeName, e.employeeCode, e.department || '-', Number(e.totalAmount), Number(e.percentage)]);
    });

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `At_Risk_${finYear}.xlsx`);
  };

  /* ------------------ UI ------------------ */

  return (
    <Grid item xs={12} md={4}>
      <Stack spacing={2}>
        {/* ================= Sales Performance ================= */}
        <ScreenGate screen="SLP">
          <SectionCard title="📊 Sales Performance">
            {/* ================= SALES PERFORMANCE ================= */}

            {/* Header controls */}
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">
                ₹{companyTarget.totalAmount.toLocaleString()} of ₹{companyTarget.targetValue.toLocaleString()} · {companyTarget.percentage}%
                Achieved
              </Typography>

              <Autocomplete
                options={targetBasisList}
                size="small"
                sx={{ width: 140 }}
                getOptionLabel={(o) => o.listOfValues || ''}
                value={targetBasisList.find((i) => i.listOfValues === targetBasis) || null}
                onChange={(_, v) => setTargetBasis(v?.listOfValues || 'Amount')}
                renderInput={(params) => <TextField {...params} label="Target Basis" />}
              />
            </Stack>

            {/* Progress bar */}
            <Box
              sx={{
                width: '100%',
                height: 10,
                borderRadius: 6,
                bgcolor: '#e5e7eb',
                overflow: 'hidden',
                mt: 1
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(companyTarget.percentage, 100)}%`,
                  height: '100%',
                  bgcolor: companyTarget.percentage >= 90 ? '#22c55e' : companyTarget.percentage >= 70 ? '#f59e0b' : '#ef4444'
                }}
              />
            </Box>

            {/* Chips */}
            <Stack direction="row" spacing={1} mt={2}>
              <Chip
                label={`Top (${topCount})`}
                clickable
                onClick={() => setPerformanceType('top')}
                color={performanceType === 'top' ? 'success' : 'default'}
                variant={performanceType === 'top' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label={`At Risk (${atRiskCount})`}
                clickable
                onClick={() => setPerformanceType('risk')}
                color={performanceType === 'risk' ? 'error' : 'default'}
                variant={performanceType === 'risk' ? 'filled' : 'outlined'}
                size="small"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* List */}
            <Typography fontWeight={600} fontSize={14} mb={1}>
              {title}
            </Typography>

            {empPerformance.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No Data Found
              </Typography>
            ) : (
              empPerformance.slice(0, 2).map((emp, i) => (
                <Stack key={emp.employeeCode} direction="row" justifyContent="space-between" mb={1}>
                  <Typography>
                    {i + 1}. {emp.employeeName} - {emp.employeeCode}
                  </Typography>

                  <Typography fontWeight={600}>₹{Number(emp.totalAmount).toLocaleString()}</Typography>
                </Stack>
              ))
            )}
            {performanceType === 'risk' && empPerformance.length > 2 && (
              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={() => setOpenDialog(true)}>
                View More →
              </Typography>
            )}
          </SectionCard>
        </ScreenGate>

        {/* ================= ANNOUNCEMENTS ================= */}
        <SectionCard
          title="📢 Announcements & Alerts"
          sx={{
            bgcolor: '#f8fafc',
            borderLeft: '4px solid #2563eb'
          }}
        >
          <Stack alignItems="flex-end">
            <Button variant="outlined" size="small" startIcon={<CampaignOutlinedIcon />} onClick={() => setOpen(true)}>
              View Announcements
            </Button>
          </Stack>
        </SectionCard>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xl">
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #1e3c72, #2a5298)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '18px'
          }}
        >
          📢 Announcements & Alerts
        </DialogTitle>

        <DialogContent dividers>
          {/* 👇 Wrapped component */}
          {/* <AnnouncementList /> */}
          <AnnouncementListDashboard />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <ScreenGate screen="SLP">
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>🔴 At Risk Performers</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1}>
              {empPerformance.map((emp, i) => (
                <Stack key={emp.employeeCode} direction="row" justifyContent="space-between">
                  <Typography>
                    {i + 1}. {emp.employeeName}
                  </Typography>
                  <Typography color="error.main">₹{Number(emp.totalAmount).toLocaleString()}</Typography>
                </Stack>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={exportAtRiskExcel}>
              Export Excel
            </Button>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </ScreenGate>
    </Grid>
  );
};

export default SalesPerformance;

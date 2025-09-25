import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DATA = [
  { sl: 1, region: 'Bagalkot', name: 'AZHAR', role: 'Cluster', converted: 0, qty: 0 },
  { sl: 2, region: 'Bagalkot', name: 'KIRAN', role: 'FSO', converted: 0, qty: 0 },
  { sl: 3, region: 'Bagalkot', name: 'MALLAPPA', role: 'FSO', converted: 4, qty: 20 },
  { sl: 4, region: 'Bagalkot', name: 'SADIQ', role: 'FSO', converted: 0, qty: 0 },
  { sl: 5, region: 'Bagalkot', name: 'AKASH', role: 'FSO', converted: 4, qty: 17 },
  { sl: 6, region: 'Bagalkot', name: 'PRAJWA', role: 'FSO', converted: 0, qty: 0 },
  { sl: 7, region: 'Bagalkot', name: 'PRAVEEN', role: 'Cluster', converted: 0, qty: 0 },
  { sl: 8, region: 'Bagalkot', name: 'RAJATH', role: 'FSO', converted: 0, qty: 0 },
  { sl: 9, region: 'Belgaum', name: 'SAGAR', role: 'FSO', converted: 6, qty: 16.7 },
  { sl: 10, region: 'Belgaum', name: 'GURUD', role: 'FSO', converted: 0, qty: 0 },
  { sl: 11, region: 'Belgaum', name: 'MAHESH', role: 'FSO', converted: 0, qty: 0 },
  { sl: 12, region: 'Belgaum', name: 'RAMESH', role: 'FSO', converted: 0, qty: 0 },
  { sl: 13, region: 'Belgaum', name: 'SHANTHI', role: 'Cluster', converted: 0, qty: 0 },
  { sl: 14, region: 'Belgaum', name: 'ABHISHE', role: 'FSO', converted: 0, qty: 0 },
  { sl: 15, region: 'Belgaum', name: 'ANAND', role: 'FSO', converted: 0, qty: 0 },
  { sl: 16, region: 'Belgaum', name: 'FAYAZ', role: 'Cluster', converted: 0, qty: 0 },
  { sl: 17, region: 'Belgaum', name: 'KIRAN S', role: 'FSO', converted: 0, qty: 0 },
  { sl: 18, region: 'Bijapur', name: 'NAWAZ', role: 'FSO', converted: 5, qty: 17.5 },
  { sl: 19, region: 'Bijapur', name: 'VISHWA', role: 'FSO', converted: 0, qty: 0 },
  { sl: 20, region: 'Dharwad', name: 'RUTESH', role: 'Project', converted: 0, qty: 0 }
];

export default function StaticReport() {
  // overall totals
  const totals = useMemo(() => {
    const totalConverted = DATA.reduce((s, r) => s + (Number(r.converted) || 0), 0);
    const totalQty = DATA.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    return { totalConverted, totalQty };
  }, []);

  // region -> sum(qty)
  const regionTotals = useMemo(() => {
    return DATA.reduce((acc, r) => {
      acc[r.region] = (acc[r.region] || 0) + (Number(r.qty) || 0);
      return acc;
    }, {});
  }, []);

  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Static Report');

    // Header (including Region Tot QTY Convt)
    const headers = ['Sl No', 'Region', 'Name', 'Role', 'No. of Converted', 'QTY Converted', 'Region Tot QTY Convt'];
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };

    // Data rows - show region total only on first occurrence of region
    for (let i = 0; i < DATA.length; i++) {
      const r = DATA[i];
      const isFirstOfRegion = i === 0 || DATA[i - 1].region !== r.region;
      const regionVal = isFirstOfRegion ? regionTotals[r.region] : '';
      ws.addRow([r.sl, r.region, r.name, r.role, r.converted, r.qty, regionVal]);
    }

    // Totals row
    const totalsRow = ws.addRow(['', '', '', 'TOTAL', totals.totalConverted, totals.totalQty, totals.totalQty]);
    totalsRow.font = { bold: true };

    // Column widths
    ws.columns = [
      { width: 6 }, // Sl No
      { width: 16 }, // Region
      { width: 20 }, // Name
      { width: 18 }, // Role
      { width: 14 }, // No. Converted
      { width: 14 }, // QTY Converted
      { width: 18 } // Region Tot QTY
    ];

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'StaticReport.xlsx');
  };

  const exportToPdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const title = 'Static Report - QTY Converted Summary';
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const headers = ['Sl No', 'Region', 'Name', 'Role', 'Converted', 'QTY', 'Region Tot QTY'];

    // Build body: include region total only on first occurrence (same rule)
    const body = DATA.map((r, i) => {
      const isFirstOfRegion = i === 0 || DATA[i - 1].region !== r.region;
      const regionVal = isFirstOfRegion ? regionTotals[r.region] : '';
      return [r.sl, r.region, r.name, r.role, r.converted, r.qty, regionVal];
    });

    // Add grand totals row at the end (matching Excel)
    body.push(['', '', '', 'TOTAL', totals.totalConverted, totals.totalQty, totals.totalQty]);

    doc.autoTable({
      startY: 60,
      head: [headers],
      body,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 68, 155], textColor: 255 },
      margin: { left: 10, right: 10 }
    });

    doc.save('StaticReport.pdf');
  };

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Report</Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={exportToExcel} sx={{ mr: 1 }}>
                Export Excel
              </Button>
              <Button variant="outlined" onClick={exportToPdf}>
                Export PDF
              </Button>
            </Grid>
          </Grid>

          <TableContainer sx={{ mt: 2 }}>
            <table className="table table-bordered table-striped">
              <thead className="thead-light">
                <tr>
                  <th>Sl No</th>
                  <th>Region</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>No. Converted</th>
                  <th>QTY Converted</th>
                  <th>Region Tot QTY Convt</th>
                </tr>
              </thead>
              <tbody>
                {DATA.map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{row.region}</td>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.noConverted ?? 0}</td>
                    <td>{row.qtyConverted ?? 0}</td>
                    <td>{row.regionTotQty ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

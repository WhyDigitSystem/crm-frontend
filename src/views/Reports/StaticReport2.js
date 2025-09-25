import React from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";

const reportData = [
  {
    sl: 1, region: "Belgaum Rural", name: "ABHISHEK PATIL", role: "FSO",
    dealer: 6, nsv: 60, architect: 3, contractor: 7, houseDecor: 1,
    deptStore: 2, visitsPre: 23, visitsNew: 6, clients: 41
  },
  {
    sl: 2, region: "Belgaum Rural", name: "AKASH", role: "FSO",
    dealer: 3, nsv: 33, architect: 1, contractor: 2, houseDecor: 1,
    deptStore: 1, visitsPre: 8, visitsNew: 5, clients: 17
  },
  {
    sl: 3, region: "Bijapur", name: "ANAND A", role: "FSO",
    dealer: 8, nsv: 100, architect: 2, contractor: 5, houseDecor: 0,
    deptStore: 0, visitsPre: 13, visitsNew: 4, clients: 24
  },
  // Continue adding rows from the image...
];

// Calculate totals
const totals = reportData.reduce(
  (acc, row) => {
    acc.dealer += row.dealer || 0;
    acc.nsv += row.nsv || 0;
    acc.architect += row.architect || 0;
    acc.contractor += row.contractor || 0;
    acc.houseDecor += row.houseDecor || 0;
    acc.deptStore += row.deptStore || 0;
    acc.visitsPre += row.visitsPre || 0;
    acc.visitsNew += row.visitsNew || 0;
    acc.clients += row.clients || 0;
    return acc;
  },
  { dealer: 0, nsv: 0, architect: 0, contractor: 0, houseDecor: 0, deptStore: 0, visitsPre: 0, visitsNew: 0, clients: 0 }
);

export default function StaticReport2() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sl No</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Dealers</TableCell>
            <TableCell>Non JSW Dealers</TableCell>
            <TableCell>Architect</TableCell>
            <TableCell>Dept</TableCell>
            <TableCell>Jecs</TableCell>
            <TableCell>Visits</TableCell>
            <TableCell>Pre</TableCell>
            <TableCell>Visits Per</TableCell>
            <TableCell>New Clients</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.sl}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.dealer}</TableCell>
              <TableCell>{row.nsv}</TableCell>
              <TableCell>{row.architect}</TableCell>
              <TableCell>{row.contractor}</TableCell>
              <TableCell>{row.houseDecor}</TableCell>
              <TableCell>{row.deptStore}</TableCell>
              <TableCell>{row.visitsPre}</TableCell>
              <TableCell>{row.visitsNew}</TableCell>
              <TableCell>{row.clients}</TableCell>
            </TableRow>
          ))}
          {/* Totals Row */}
          <TableRow style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
            <TableCell colSpan={4} align="center">TOTAL</TableCell>
            <TableCell>{totals.dealer}</TableCell>
            <TableCell>{totals.nsv}</TableCell>
            <TableCell>{totals.architect}</TableCell>
            <TableCell>{totals.contractor}</TableCell>
            <TableCell>{totals.houseDecor}</TableCell>
            <TableCell>{totals.deptStore}</TableCell>
            <TableCell>{totals.visitsPre}</TableCell>
            <TableCell>{totals.visitsNew}</TableCell>
            <TableCell>{totals.clients}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

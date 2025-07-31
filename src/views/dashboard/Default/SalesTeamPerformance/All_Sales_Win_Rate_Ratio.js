import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Stack
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';

const salesData = [
  { name: 'Manager User', opportunities: 0, revenueUSD: 0, revenueINR: 0, winRate: 0 },
  { name: 'Simba Well', opportunities: 0, revenueUSD: 0, revenueINR: 0, winRate: 0 },
  { name: 'Sales User', opportunities: 0, revenueUSD: 0, revenueINR: 0, winRate: 0 },
  { name: 'Marshall Well', opportunities: 0, revenueUSD: 0, revenueINR: 0, winRate: 0 },
  { name: 'Akki Well', opportunities: 0, revenueUSD: 0, revenueINR: 0, winRate: 0 }
];

function AnimatedProgress({ value }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 8,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        transition: 'all 0.8s ease',
        '& .MuiLinearProgress-bar': {
          backgroundColor: value > 0 ? '#4caf50' : '#ccc',
        },
      }}
    />
  );
}

function All_Sales_Win_Rate_Ratio() {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Avatar>
            <PeopleIcon />
          </Avatar>
          <Typography variant="h6">All Sales Win Rate Ratio</Typography>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>SALES REP</strong></TableCell>
              <TableCell><strong>OPPORTUNITIES</strong></TableCell>
              <TableCell><strong>WON REVENUE</strong></TableCell>
              <TableCell><strong>WIN RATE</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.opportunities}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold">${row.revenueUSD.toLocaleString()}</Typography>
                  <Typography fontWeight="bold">₹{row.revenueINR.toLocaleString()}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box flex={1} mr={1}>
                      <AnimatedProgress value={row.winRate} />
                    </Box>
                    <Typography>{row.winRate}%</Typography>
                  </Box>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default All_Sales_Win_Rate_Ratio;

// install if not already:
// npm install framer-motion

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

// sample data; you can pass this in as a prop instead
const defaultSalesData = [
    {
        name: 'Manager User',
        wonRevenueUSD: 0,
        wonRevenueINR: 0,
        pipelineUSD: 0,
        pipelineINR: 0,
        conversion: 0
    },
    {
        name: 'Simba Well',
        wonRevenueUSD: 0,
        wonRevenueINR: 0,
        pipelineUSD: 0,
        pipelineINR: 0,
        conversion: 0
    },
    {
        name: 'Sales User',
        wonRevenueUSD: 0,
        wonRevenueINR: 0,
        pipelineUSD: 0,
        pipelineINR: 0,
        conversion: 0
    },
    {
        name: 'Marshall Well',
        wonRevenueUSD: 0,
        wonRevenueINR: 0,
        pipelineUSD: 0,
        pipelineINR: 0,
        conversion: 0
    },
    {
        name: 'Akki Well',
        wonRevenueUSD: 0,
        wonRevenueINR: 0,
        pipelineUSD: 0,
        pipelineINR: 0,
        conversion: 0
    }
];

function AnimatedProgress({ value }) {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setProgress(value);
        }, 200); // slight delay for entrance
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
                    backgroundColor: value > 0 ? '#1976d2' : '#ccc' // blue when >0
                }
            }}
        />
    );
}

function formatCurrency(value) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const All_Sales_Performance = ({ salesData = defaultSalesData }) => {
    return (
        <Card sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Avatar >
                        <PeopleIcon />
                    </Avatar>
                    <Typography variant="h6">All Sales Performance</Typography>
                </Stack>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>TEAM MEMBER</strong></TableCell>
                                <TableCell><strong>WON REVENUE</strong></TableCell>
                                <TableCell><strong>PIPELINE REVENUE</strong></TableCell>
                                <TableCell><strong>CONVERSION</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salesData.map((row, idx) => (
                                <motion.tr
                                    key={row.name + idx}
                                    initial={{ opacity: 0, y: 2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.12, ease: 'easeOut' }}
                                    style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                                >
                                    <TableCell sx={{ py: 2 }}>{row.name}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold" component="div">
                                            ${formatCurrency(row.wonRevenueUSD)}
                                        </Typography>
                                        <Typography fontWeight="bold" component="div">
                                            ₹{formatCurrency(row.wonRevenueINR)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold" component="div">
                                            ${formatCurrency(row.pipelineUSD)}
                                        </Typography>
                                        <Typography fontWeight="bold" component="div">
                                            ₹{formatCurrency(row.pipelineINR)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Box flex={1} mr={1}>
                                                <AnimatedProgress value={row.conversion} />
                                            </Box>
                                            <Typography>{row.conversion.toFixed(1)}%</Typography>
                                        </Box>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </CardContent>
        </Card>
    );
};

export default All_Sales_Performance;

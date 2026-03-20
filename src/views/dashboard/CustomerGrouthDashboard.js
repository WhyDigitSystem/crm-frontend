import { useEffect, useState } from 'react';
import ScreenGate from './Default/ScreenGate';
import SectionCard from './Default/SectionCard';
import {
    Stack,
    Grid,
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import apiCalls from 'apicall';

const CustomerGrowthDashboard = () => {
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');
    const finYear = localStorage.getItem('finYear');

    const [view, setView] = useState('monthly'); // monthly | yearly
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCustomerGrowth();
    }, [view]);

    const getCustomerGrowth = async () => {
        setLoading(true);
        try {
            const res = await apiCalls(
                'get',
                `/userdashboard/getCustomerGrowthDetails?branchCode=${branchCode}&finYear=${finYear || 0}&orgId=${orgId}&type=${view}`
            );

            if (res?.status) {
                const data = res.paramObjectsMap.customerGrowthDetails || [];

                // normalize API response for recharts
                const formatted = data.map(item => ({
                    period: item.period,
                    customers: Number(item.count)
                }));

                setChartData(formatted);
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error('Customer growth API failed', error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenGate screen="CGD">
            <Grid item xs={12} md={8}>
                <SectionCard title="📈 Customer Growth Trend">

                    {/* HEADER CONTROLS */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {view === 'yearly'
                                ? 'Financial year (Apr – Mar) Customer growth'
                                : 'Week-wise Customers gained this month'}
                        </Typography>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={view}
                            onChange={(e, val) => val && setView(val)}
                        >
                            <ToggleButton value="monthly">Monthly</ToggleButton>
                            <ToggleButton value="yearly">Yearly</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    {/* CHART */}
                    <Box height={260} mt={2}>
                        {chartData.length === 0 && !loading ? (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                align="center"
                            >
                                No customer growth data available
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="period" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        formatter={(v) => [`${v} Customers`, 'Gained']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="customers"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Box>

                </SectionCard>
            </Grid>
        </ScreenGate>
    );
};

export default CustomerGrowthDashboard;

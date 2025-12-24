import { useEffect, useState } from 'react';
import ScreenGate from './Default/ScreenGate';
import {
    Grid,
    Stack,
    Typography,
    Box
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import apiCalls from 'apicall';
import SectionCard from './Default/SectionCard';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#6366f1'];

const LeadSource = () => {
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');
    const finYear = localStorage.getItem('finYear');

    const [chartData, setChartData] = useState([]);
    const [totalLeads, setTotalLeads] = useState(0);

    useEffect(() => {
        getLeadSourceData();
    }, []);

    const getLeadSourceData = async () => {
        try {
            const res = await apiCalls(
                'get',
                `/userdashboard/getSourceCountDetails?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&type=monthly`
            );

            if (res?.status) {
                const info = res.paramObjectsMap?.sourceInformation?.[0];
                const sources = info?.sources || [];

                setChartData(
                    sources.map((s) => ({
                        source: s.source,
                        value: Number(s.count),
                        label: `${s.source} (${s.count})`
                    }))
                );

                setTotalLeads(Number(info?.totalcount || 0));
            } else {
                setChartData([]);
                setTotalLeads(0);
            }
        } catch (error) {
            console.error('Lead source API failed', error);
            setChartData([]);
            setTotalLeads(0);
        }
    };

    return (
        <ScreenGate screen="DASH">
            <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                    <SectionCard title="📍 Lead Source">
                       
                        {/* <Typography variant="caption" color="text.secondary">
                            Where leads are coming from (this month)
                        </Typography> */}

                        {/* SMALLER DONUT (NO FIXED HEIGHT) */}
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: '4 / 5',   // 👈 makes donut visually smaller
                                position: 'relative',
                                mt: 1
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="source"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="50%"
                                        outerRadius="72%"
                                        paddingAngle={3}
                                        label={({ label }) => label}
                                        labelLine={false}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value, name) => [`${value} Leads`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* CENTER TOTAL */}
                            <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                sx={{
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    pointerEvents: 'none'
                                }}
                            >
                                <Typography fontWeight={700} fontSize={16}>
                                    {totalLeads}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total
                                </Typography>
                            </Box>
                        </Box>
                    </SectionCard>
                </Stack>
            </Grid>
        </ScreenGate>
    );
};

export default LeadSource;

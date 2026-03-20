import { useEffect, useState } from 'react';
import {
    Stack,
    Divider,
    Grid,
    Typography,
    Box
} from '@mui/material';
import ScreenGate from './Default/ScreenGate';
import SectionCard from './Default/SectionCard';
import apiCalls from 'apicall';

const LoseGraph = () => {
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');
    const finYear = localStorage.getItem('finYear');

    const [lossData, setLossData] = useState([]);
    const [totalLost, setTotalLost] = useState(0);

    useEffect(() => {
        getLoseDeals();
    }, []);

    const getLoseDeals = async () => {
        try {
            const res = await apiCalls(
                'get',
                `/userdashboard/getLoseDealsDetails?branchCode=${branchCode}&finYear=${finYear || 0}&orgId=${orgId}&type=monthly`
            );

            if (res?.status) {
                const info = res.paramObjectsMap.remarksInformation?.[0];
                setLossData(info?.sources || []);
                setTotalLost(Number(info?.totalcount || 0));
            } else {
                setLossData([]);
                setTotalLost(0);
            }
        } catch (error) {
            console.error('Lose deals API failed', error);
            setLossData([]);
            setTotalLost(0);
        }
    };

    return (
        <ScreenGate screen="DASH">
            <Grid item xs={12} md={4}>
                <SectionCard title="❌ Where We Lose Deals">

                    <Stack spacing={2}>

                        {/* TOTAL */}
                        <Typography variant="caption" color="text.secondary">
                            {totalLost} Deals Lost this Month
                        </Typography>

                        {/* BARS */}
                        {lossData.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                No loss data available
                            </Typography>
                        ) : (
                            lossData.map((item, index) => {
                                const percent = totalLost
                                    ? Math.round((item.count / totalLost) * 100)
                                    : 0;

                                return (
                                    <Stack key={index} spacing={0.5}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2">
                                                {item.remarks}
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                {item.count}
                                            </Typography>
                                        </Stack>

                                        {/* PROGRESS BAR */}
                                        <Box
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: '#e5e7eb',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${percent}%`,
                                                    height: '100%',
                                                    bgcolor: '#ef4444',
                                                    transition: 'width 0.4s ease'
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                );
                            })
                        )}
                        <Divider />

                        <Typography variant="caption" color="text.secondary">
                            Based on lost opportunities (monthly)
                        </Typography>

                    </Stack>
                </SectionCard>
            </Grid>
        </ScreenGate>
    );
};

export default LoseGraph;

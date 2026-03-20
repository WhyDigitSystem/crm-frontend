import {
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCalls from 'apicall';

/* ================== HELPERS ================== */

const getAging = (createdOn) => {
    const createdDate = dayjs(createdOn, 'DD-MM-YYYY hh:mm:ss A');
    const days = dayjs().diff(createdDate, 'day');

    if (days <= 14)
        return { label: `${days}d`, color: 'success' };
    if (days <= 30)
        return { label: `${days}d`, color: 'warning' };

    return { label: `${days}d`, color: 'error' };
};

const routeMap = {
    OP: '/opportunity/view',
    QA: '/quotation/view',
    SO: '/salesorder/view'
};

/* ================== COMPONENT ================== */

export default function StuckDeals() {
    const navigate = useNavigate();
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');
    const finYear = localStorage.getItem('finYear');
    const [stuckData, setStuckData] = useState([]);
    const [summary, setSummary] = useState({
        opportunity: 0,
        quotation: 0,
        salesorder: 0
    });

    useEffect(() => {
        fetchStuckDeals();
    }, []);

    const fetchStuckDeals = async () => {
        const res = await apiCalls('get', `/userdashboard/getStuckDetails?branchCode=${branchCode}&finYear=${finYear || 0}&orgId=${orgId}`);

        const list = res.data?.paramObjectsMap?.stuckDetailsInformation || [];

        setStuckData(list);

        setSummary({
            opportunity:
                list.find(i => i.Head.includes('Opportunity'))?.Details.length || 0,
            quotation:
                list.find(i => i.Head.includes('Quotation'))?.Details.length || 0,
            salesorder:
                list.find(i => i.Head.includes('Salesorder'))?.Details.length || 0
        });
    };

    const navigateTo = (item) => {
        navigate(`${routeMap[item.screenCode]}?docid=${item.docid}`);
    };

    /* ================== UI ================== */

    return (
        <Card>
            <CardContent>
                {/* ===== HEADER ===== */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight={600}>
                        ⏳ Stuck Deals
                    </Typography>
                    <Chip
                        label="Needs Attention"
                        color="warning"
                        size="small"
                    />
                </Stack>

                {/* ===== SUMMARY ===== */}
                <Stack spacing={1.5} mt={2}>
                    <SummaryRow
                        label="Opportunities"
                        value={summary.opportunity}
                        color="error"
                    />
                    <SummaryRow
                        label="Quotations"
                        value={summary.quotation}
                        color="warning"
                    />
                    <SummaryRow
                        label="Sales Orders"
                        value={summary.salesorder}
                        color="error"
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* ===== DETAILS ===== */}
                {stuckData.map((group, idx) => (
                    <Accordion key={idx} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography fontWeight={600}>
                                    {group.Head}
                                </Typography>
                                <Chip
                                    label={group.Details.length}
                                    size="small"
                                    color="error"
                                />
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Stack spacing={1}>
                                {group.Details.map((item, i) => {
                                    const aging = getAging(item.createdon);

                                    return (
                                        <Stack
                                            key={i}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{
                                                p: 1.2,
                                                borderRadius: 1,
                                                bgcolor: 'grey.50',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'grey.100'
                                                }
                                            }}
                                            onClick={() => navigateTo(item)}
                                        >
                                            {/* LEFT */}
                                            <Stack>
                                                <Typography fontWeight={600}>
                                                    {item.clientName}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {item.docid} • {item.contactName}
                                                </Typography>
                                            </Stack>

                                            {/* RIGHT */}
                                            <Stack alignItems="flex-end" spacing={0.5}>
                                                <Chip
                                                    label={aging.label}
                                                    color={aging.color}
                                                    size="small"
                                                />
                                                <Typography variant="caption">
                                                    {item.createdon}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Button
                    size="small"
                    sx={{ mt: 1, px: 0 }}
                >
                    View All Deals
                </Button>
            </CardContent>
        </Card>
    );
}

/* ================== SUB COMPONENT ================== */

const SummaryRow = ({ label, value, color }) => (
    <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">
            {label}
        </Typography>
        <Typography fontWeight={600} color={`${color}.main`}>
            {value}
        </Typography>
    </Stack>
);

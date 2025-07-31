import PropTypes from 'prop-types';
import { useState } from 'react';
import {
    Avatar,
    Box,
    Grid,
    Menu,
    MenuItem,
    Typography,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    padding: theme.spacing(2),
    background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
    color: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const LabelChip = styled('span')(({ bg }) => ({
    backgroundColor: bg || '#ffffff33',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    display: 'inline-block',
    marginBottom: 4
}));

const CurrentMonthRevenue = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <StyledCard>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Current Month Revenue
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                            <AttachMoneyIcon sx={{ color: '#fff', mr: 1 }} />
                            <Box>
                                <LabelChip bg="#ffffff33">USD</LabelChip>
                                <Typography variant="h6" fontWeight={700}>$405,000</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                            <CurrencyRupeeIcon sx={{ color: '#fff', mr: 1 }} />
                            <Box>
                                <LabelChip bg="#ffffff33">INR</LabelChip>
                                <Typography variant="h6" fontWeight={700}>₹27,000</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Previous Month: $0 | ₹0
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Overall: $405,000 | ₹27,000
                        </Typography>

                        <Box display="flex" alignItems="center" mt={1} color="#00ffcc">
                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" fontWeight={600}>
                                100.0% vs last month
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={handleClose}>View Details</MenuItem>
                    <MenuItem onClick={handleClose}>Export</MenuItem>
                </Menu>
            </CardContent>
        </StyledCard>
    );
};

CurrentMonthRevenue.propTypes = {
    isLoading: PropTypes.bool
};

export default CurrentMonthRevenue;

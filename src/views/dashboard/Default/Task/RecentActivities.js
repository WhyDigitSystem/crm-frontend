import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import {
    Avatar,
    Box,
    Grid,
    Menu,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TaskIcon from '@mui/icons-material/TaskAltOutlined';

// animation
import { motion } from 'framer-motion';

const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.secondary[800],
        borderRadius: '50%',
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.secondary[800],
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

// Sample recent activities
const activityList = [
    { title: 'Followed up with Client A', due: '2 days ago' },
    { title: 'Sent proposal for Project X', due: 'Yesterday' },
    { title: 'Completed call with Sales Team', due: 'Today' }
];

const RecentActivities = ({ isLoading }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            {/* Header */}
                            <Grid item>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                backgroundColor: theme.palette.secondary[800],
                                                color: '#fff',
                                                width: 36,
                                                height: 36
                                            }}
                                        >
                                            <TaskIcon fontSize="small" />
                                        </Avatar>
                                    </Grid>
                                    <Grid item sx={{ mt: 2, mb: 1, pl: 1 }}>
                                        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.secondary[100] }}>
                                            Recent Activities
                                        </Typography>
                                    </Grid>
                                    <Grid item sx={{ ml: 'auto' }}>
                                        <MoreHorizIcon
                                            aria-controls="menu-activity"
                                            aria-haspopup="true"
                                            onClick={handleClick}
                                            sx={{ color: '#fff', cursor: 'pointer' }}
                                        />
                                        <Menu
                                            id="menu-activity"
                                            anchorEl={anchorEl}
                                            keepMounted
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            PaperProps={{
                                                sx: {
                                                    backgroundColor: theme.palette.secondary[700],
                                                    color: '#fff'
                                                }
                                            }}
                                        >
                                            <MenuItem onClick={handleClose}>View All</MenuItem>
                                            <MenuItem onClick={handleClose}>Add Activity</MenuItem>
                                        </Menu>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }} />

                            {/* Activity List */}
                            <Grid item>
                                {activityList.length === 0 ? (
                                    <Typography sx={{ color: '#b2dfdb', fontSize: '0.9rem', textAlign: 'center', mt: 2 }}>
                                        No recent activities
                                    </Typography>
                                ) : (
                                    <List dense>
                                        {activityList.map((activity, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <ListItem disablePadding>
                                                    <ListItemText
                                                        primary={activity.title}
                                                        secondary={activity.due}
                                                        primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 500 } }}
                                                        secondaryTypographyProps={{ sx: { color: '#b2dfdb', fontSize: '0.8rem' } }}
                                                    />
                                                </ListItem>
                                            </motion.div>
                                        ))}
                                    </List>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

RecentActivities.propTypes = {
    isLoading: PropTypes.bool
};

export default RecentActivities;

import React, { useState, useRef } from 'react';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ActionButton from 'utils/ActionButton';
import Transitions from 'ui-component/extended/Transitions';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Paper,
    Popper,
    useMediaQuery,
    Grid,
    IconButton,
    ClickAwayListener,
    Divider,
    Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import Email from '../../../../assets/images/email.png';

// Apps list
const apps = [
    {
        id: 'bulkEmail',
        title: 'Email',
        type: 'group',
        url: '/Crm/BulkEmail',
        icon: Email
    }
];

const MenuBar = () => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const navigate = useNavigate();

    const handleToggle = () => {
        setOpen((prev) => !prev);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <Box>
            {/* Action Button */}
            <ClickAwayListener onClickAway={handleClose}>
                <Box ref={anchorRef} display="inline-block">
                    <ActionButton title="" icon={MenuOutlinedIcon} onClick={handleToggle} />
                </Box>
            </ClickAwayListener>

            {/* Popper Dropdown */}
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement={matchesXs ? 'bottom' : 'bottom-end'}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps} position={matchesXs ? 'top' : 'top-right'}>
                        <Paper sx={{ width: 300 }}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard
                                    border={false}
                                    elevation={16}
                                    content={false}
                                    boxShadow
                                    shadow={theme.shadows[16]}
                                    sx={{
                                        borderTop: `4px solid ${theme.palette.primary.main}`
                                    }}
                                >
                                    {/* Header */}
                                    <Grid container direction="column" spacing={2}>
                                        {/* Apps */}
                                        <Grid item xs={12}>
                                            <Grid container spacing={2} sx={{ px: 2, pt: 0.25 }}>
                                                {apps.map((app) => {
                                                    const Icon = app.icon;
                                                    return (
                                                        <Grid item xs={3} key={app.id} textAlign="center">
                                                            <IconButton
                                                                onClick={() => {
                                                                    navigate(app.url);
                                                                    setOpen(false);
                                                                }}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    p: 1
                                                                }}
                                                            >
                                                                {typeof Icon === 'string' ? (
                                                                    <img src={Icon} alt={app.title} width={30} height={30} />
                                                                ) : (
                                                                    <Icon size={30} color="green" />
                                                                )}
                                                                <span style={{ fontSize: '12px', color: '#ffffffff' }}>{app.title}</span>
                                                            </IconButton>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Grid>

                                        {/* Divider */}
                                        <Grid item xs={12} p={0}>
                                            <Divider sx={{ my: 0 }} />
                                        </Grid>
                                    </Grid>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </Box>
    );
};

export default MenuBar;

import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import PerfectScrollbar from 'react-perfect-scrollbar';
import { motion } from 'framer-motion';

import NotificationList from './NotificationList';
import Transitions from 'ui-component/extended/Transitions';

import { IconBell } from '@tabler/icons-react';
import ClearIcon from '@mui/icons-material/Clear';

import apiCalls from 'apicall';

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) return;
    setOpen(false);
  };


  const employeeCode = localStorage.getItem('employeeCode');
  const orgId = localStorage.getItem('orgId');

  const fetchNotifications = async () => {
    try {
      const res = await apiCalls(
        'get',
        `notification/getNotifictionByEmployeeCode?employeeCode=${employeeCode}&orgId=${orgId}`
      );
      setNotifications(res?.paramObjectsMap?.notificationVO || []);
    } catch (err) {
      setNotifications([]);
    }
  };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  useEffect(() => {
  // first call immediately
  fetchNotifications();
  const interval = setInterval(() => {
    fetchNotifications();
  }, 60000);
  return () => clearInterval(interval);
}, []);

 
  const handleClearAll = async () => {
    try{
    const response = await apiCalls('put',`/notification/clearNotification?employeeCode=${employeeCode}&orgId=${orgId}&status=ClearALL`);
    if(response?.status === true){
     console.log(response.paramObjectsMap.message)
    }
    setNotifications([]);   
    fetchNotifications();
    }catch(error){
      console.log(error)
    }
  };

  return (
    <>
      {/* 🔔 Notification Icon */}
      <Box>
        <ButtonBase>
          <Badge badgeContent={notifications?.length || 0} color="error">
            <Avatar
              ref={anchorRef}
              onClick={handleToggle}
             sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .3s ease-in-out',
                  // backgroundColor: theme.palette.primary.light,
                  // color: theme.palette.primary.dark,
                   backgroundColor: '#3B82F6',
                   color: 'white',
                  '&:hover': {
                    // backgroundColor: theme.palette.primary.dark,
                    // color: theme.palette.primary.light
                       backgroundColor: "#1D4ED8",
                  },
                    '&:hover .menu-icon': {
                    transform: 'rotate(360deg)',
      }
                }}
            >
              <IconBell  className="menu-icon" stroke={1.5} size="1.3rem"   style={{
                transition: 'transform 0.3s ease'
      }} />
            </Avatar>
          </Badge>
        </ButtonBase>
      </Box>

      {/* 🔽 Dropdown */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, 16] } }]
        }}

      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              sx={{
                width: 320,
                borderRadius: 4,
                // overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                borderTop: `4px solid ${theme.palette.primary.main}`
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography fontWeight={700} fontSize={14}>
                      Notifications
                    </Typography>

                    <Button
                      size="small"
                      startIcon={<ClearIcon fontSize="small" />}
                      onClick={handleClearAll}
                      sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        color: '#ef4444',
                        borderRadius: 2,
                        background: '#fef2f2',
                        '&:hover': {
                          background: '#fee2e2'
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Box>

                  <Divider />

                  {/* List */}
                  <PerfectScrollbar style={{ maxHeight: 300, overflowY: 'auto', }}>
                    {!notifications?.length ? (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          color: '#94a3b8'
                        }}
                      >
                        <IconBell size={28} />
                        <Typography mt={1} fontSize={13}>
                          No notifications
                        </Typography>
                      </Box>
                    ) : (
                      <NotificationList notifications={notifications} />
                    )}
                  </PerfectScrollbar>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;
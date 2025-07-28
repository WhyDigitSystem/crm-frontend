import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { motion } from 'framer-motion';

import User1 from 'assets/images/users/user-round.svg';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

import {
  IconLogout,
  IconUser
} from '@tabler/icons-react';

const ProfileSection = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/pages/login/login3');
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);
    handleClose(event);
    if (route) navigate(route);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const employeeName = localStorage.getItem('employeeName') || 'User';
  const employeeCode = localStorage.getItem('employeeCode') || 'N/A';

  return (
    <>
      <Avatar
        src={User1}
        sx={{
          ...theme.typography.mediumAvatar,
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      />

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 14] } }]}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: 'top right' }}
            >
              <Paper
                elevation={16}
                sx={{
                  backdropFilter: 'blur(6px)',
                  borderRadius: '12px',
                  minWidth: 300,
                  maxWidth: 350,
                  borderTop: `4px solid ${theme.palette.primary.main}`
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard border={false} elevation={0} content={false}>
                    <Box sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={User1}
                          sx={{
                            width: 60,
                            height: 60,
                            border: `2px solid ${theme.palette.primary.main}`
                          }}
                        />
                        <Stack spacing={0.5}>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {employeeName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Employee Code: {employeeCode}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            Project Admin
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    <PerfectScrollbar
                      style={{
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden'
                      }}
                    >
                      <Box sx={{ p: 1 }}>
                        <List
                          component="nav"
                          sx={{
                            '& .MuiListItemButton-root': {
                              mt: 0,
                              borderRadius: `${customization.borderRadius}px`,
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                bgcolor: theme.palette.primary.lighter
                              }
                            }
                          }}
                        >
                          <ListItemButton
                            selected={selectedIndex === 0}
                            onClick={(e) => handleListItemClick(e, 0, '/profile')}
                          >
                            <ListItemIcon>
                              <IconUser stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={<Typography variant="body2">Profile</Typography>}
                            />
                          </ListItemButton>

                          <ListItemButton
                            selected={selectedIndex === 1}
                            onClick={(e) => handleListItemClick(e, 1, '/document')}
                          >
                            <ListItemIcon>
                              <IconUser stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={<Typography variant="body2">Document</Typography>}
                            />
                          </ListItemButton>

                          <ListItemButton
                            selected={selectedIndex === 2}
                            onClick={(e) => handleListItemClick(e, 2, '/change-password')}
                          >
                            <ListItemIcon>
                              <IconUser stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={<Typography variant="body2">Change Password</Typography>}
                            />
                          </ListItemButton>

                          <Divider sx={{ my: 1 }} />

                          <ListItemButton
                            selected={selectedIndex === 3}
                            onClick={handleLogout}
                          >
                            <ListItemIcon>
                              <IconLogout stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" color="error">
                                  Logout
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </List>
                      </Box>
                    </PerfectScrollbar>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            </motion.div>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;

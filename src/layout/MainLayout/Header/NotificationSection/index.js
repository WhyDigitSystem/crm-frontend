import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconBell, IconX } from '@tabler/icons-react';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const anchorRef = useRef(null);

  const orgId = localStorage.getItem('orgId');
  const loginUserName = localStorage.getItem('userName');

  useEffect(() => {
    getAllNotifications();
  }, []);

  const getAllNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiCalls('get', `ticketcontroller/getTicketNotification?orgId=${orgId}&userName=${loginUserName}`);
      if (response.status === true) {
        setNotificationList(response.paramObjectsMap.ticketVOs || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleClear = async (ticketId, clear) => {
    try {
      setIsLoading(true);
      const response = await apiCalls(
        'put',
        `ticketcontroller/updateNotification?orgId=${orgId}&userName=${loginUserName}&status=${clear === 'clear' ? 'clear' : 'clearAll'}&ticketId=${ticketId ? ticketId : 0}`
      );
      if (response.status === true) {
        getAllNotifications();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => handleClear();

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ ml: 1, [theme.breakpoints.down('md')]: { mr: 0 } }}>
        <IconButton ref={anchorRef} onClick={handleToggle} size="large">
          <Badge color="error" badgeContent={notificationList.length}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.dark,
                // transition: 'all 0.3s ease',
                '&:hover': {
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.light
                }
              }}
            >
              <IconBell stroke={1.5} size="1.3rem" />
            </Avatar>
          </Badge>
        </IconButton>
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 5 : 0, 20] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ width: 350, borderRadius: 2, boxShadow: 6 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={0} content={false}>
                  <Box sx={{ px: 2, pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Notifications</Typography>
                      {notificationList.length > 0 && (
                        <Button color="error" size="small" onClick={handleClearAll}>
                          Clear All
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  <Divider sx={{ mt: 1 }} />

                  <Box sx={{ maxHeight: 300, overflowY: 'auto', px: 2 }}>
                    {isLoading ? (
                      <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
                        <CircularProgress size={24} />
                      </Stack>
                    ) : notificationList.length === 0 ? (
                      <Typography variant="body2" align="center" sx={{ py: 5 }}>
                        No new notifications
                      </Typography>
                    ) : (
                      notificationList.map((item) => (
                        <Box
                          key={item.ticketId}
                          sx={{
                            background: theme.palette.grey[100],
                            p: 1.5,
                            mb: 1.2,
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            boxShadow: 1,
                            '&:hover': { background: theme.palette.grey[200] }
                          }}
                        >
                          <Box sx={{ flex: 1, pr: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {item.subject}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                              {item.description}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={item.status}
                                color={item.status === 'Open' ? 'primary' : item.status === 'Closed' ? 'success' : 'warning'}
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                by {item.createdBy}
                              </Typography>
                            </Stack>
                          </Box>
                          <Tooltip title="Clear">
                            <IconButton size="small" color="error" onClick={() => handleClear(item.ticketId, 'clear')}>
                              <IconX size="1rem" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))
                    )}
                  </Box>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;

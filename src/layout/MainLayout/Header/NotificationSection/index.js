import { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  CardActions,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { motion } from 'framer-motion';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import NotificationList from './NotificationList';
import Transitions from 'ui-component/extended/Transitions';

// icons
import { IconBell } from '@tabler/icons-react';

// mock notifications
const notifications = [
  {
    name: 'John Doe',
    expenceId: 'EXP123',
    docDate: '2024-11-12',
    amount: 2500.5,
    currency: 'USD',
    heading: 'TAX INVOICE'
  },
  {
    name: 'Jane Smith',
    expenceId: 'EXP124',
    docDate: '2024-11-13',
    amount: 1500.0,
    currency: 'USD',
    heading: 'PURCHASE ORDER'
  }
];

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleViewAll = () => {
    setViewAllOpen(true);
  };

  const handleModalClose = () => {
    setViewAllOpen(false);
  };

  const handleApprove = (item) => {
    console.log('Approved:', item);
  };

  const handleReject = (item) => {
    console.log('Rejected:', item);
  };

  const handleCardClick = (item) => {
    console.log('Card Clicked:', item);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box
        sx={{
          ml: 2,
          [theme.breakpoints.down('md')]: {
            mr: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Badge badgeContent={notifications.length} color="error">
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                transition: 'all .3s ease-in-out',
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.dark,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.primary.light
                }
              }}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
              color="inherit"
            >
              <IconBell stroke={1.5} size="1.3rem" />
            </Avatar>
          </Badge>
        </ButtonBase>
      </Box>

      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 16]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              elevation={16}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={0} content={false} boxShadow shadow={theme.shadows[16]} sx={{
                  borderTop: `4px solid ${theme.palette.primary.main}`
                }}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">Notification</Typography>
                            {/* <Chip
                              size="small"
                              label="1"
                              sx={{
                                color: theme.palette.background.default,
                                bgcolor: theme.palette.warning.dark
                              }}
                            /> */}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <PerfectScrollbar style={{ maxHeight: 250, overflowX: 'hidden' }}>
                        <Grid container direction="column" spacing={2}>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 0 }} />
                          </Grid>
                        </Grid>
                        <NotificationList
                          notifications={[notifications[0]]}
                          handleApprove={handleApprove}
                          handleReject={handleReject}
                          handleCardClick={handleCardClick}
                        />
                      </PerfectScrollbar>
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      onClick={handleViewAll}
                      disableElevation
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: theme.palette.primary.light
                        }
                      }}
                    >
                      View All
                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {/* Modal for "View All" */}
      <Dialog open={viewAllOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>All Notifications</DialogTitle>
        <DialogContent dividers>
          <PerfectScrollbar style={{ maxHeight: '400px' }}>
            <NotificationList
              notifications={notifications}
              handleApprove={handleApprove}
              handleReject={handleReject}
              handleCardClick={handleCardClick}
            />
          </PerfectScrollbar>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationSection;

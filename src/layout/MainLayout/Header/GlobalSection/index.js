import { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CardActions,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

// assets

import { IconWorld } from '@tabler/icons-react';
import apiCalls from 'apicall';
import { ToastContainer } from 'react-toastify';
import { showToast } from 'utils/toast-component';

const GlobalSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [finYearValue, setFinYearValue] = useState('');
  const [companyValue, setCompanyValue] = useState('');
  const [customerValue, setCustomerValue] = useState('');
  const [clientValue, setClientValue] = useState('');
  const [branchValue, setBranchValue] = useState('');
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [branchVO, setBranchVO] = useState([]);
  const [finVO, setFinVO] = useState([]);
  const [warehouseVO, setWarehouseVO] = useState([]);
  const [customerVO, setCustomerVO] = useState([]);
  const [clientVO, setClientVO] = useState([]);
  const [globalParameter, setGlobalParameter] = useState([]);
  const [branchName, setBranchName] = useState('');

  const [branchList, setBranchList] = useState([]);

  const anchorRef = useRef(null);

  useEffect(() => {
    getGlobalParameter();
    getAccessBranch();
    getFinYear();
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [selectedBranch, setSelectedBranch] = useState({ branch: '', branchcode: '' });

  const handleBranchChange = (event) => {
    const selectedCode = event.target.value;

    const selectedBranch = branchList.find(
      (item) => item.value === selectedCode
    );

    console.log("Selected Branch:", selectedBranch); // DEBUG

    if (selectedBranch) {
      setBranchValue(selectedCode);
      setBranchName(selectedBranch.label);
    }
  };

  const getAccessBranch = async () => {
    try {
      const result = await apiCalls(
        'get',
        `/GlobalParam/globalparam/username?orgid=${orgId}&userid=${userId}`
      );

      const rawBranches = result.paramObjectsMap.globalParam || [];

      const formattedBranches = rawBranches.map((item) => ({
        label: item.branch,
        value: item.branchcode
      }));

      setBranchVO(rawBranches);
      setBranchList(formattedBranches);

      console.log('Formatted Branches:', formattedBranches);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getFinYear = async () => {
    try {
      const result = await apiCalls('get', `/commonmaster/getAllAciveFInYear?orgId=${orgId}`);
      let finYears = result.paramObjectsMap.financialYearVOs || [];
      finYears.sort((a, b) => parseInt(b.finYear, 10) - parseInt(a.finYear, 10));
      setFinVO(finYears);
      console.log('Sorted Fin Years:', finYears);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getGlobalParameter = async () => {
    try {
      const result = await apiCalls(
        'get',
        `GlobalParam/getGlobalParamByOrgId?orgId=${orgId}&userId=${userId}`
      );

      const globalParameterVO = result.paramObjectsMap.globalParameterVO || {};

      console.log('Saved Global Param:', globalParameterVO);

      // ✅ Restore values into state
      setFinYearValue(globalParameterVO.finYear || '');
      setBranchValue(globalParameterVO.branchcode || '');
      setBranchName(globalParameterVO.branch || '');

      // optional localStorage
      localStorage.setItem('finYear', globalParameterVO.finYear || '');
      localStorage.setItem('branchcode', globalParameterVO.branchcode || '');
      localStorage.setItem('branch', globalParameterVO.branch || '');

    } catch (err) {
      console.log('error', err);
    }
  };

  const handleSubmit = async () => {
    console.log("branchValue:", branchValue);
    console.log("branchName:", branchName);
    console.log("finYearValue:", finYearValue);

    if (!branchValue || !finYearValue) {
      showToast('error', 'Please select Branch and Financial Year');
      return;
    }

    const formData = {
      branch: branchName,
      branchcode: branchValue,
      finYear: Number(finYearValue),
      userid: Number(userId),
      orgId
    };

    console.log("FINAL PAYLOAD:", formData); // 🔥 CHECK THIS

    try {
      const result = await apiCalls('put', `GlobalParam/globalparam`, formData);
      showToast('success', 'Global Parameter updated successfully');
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err) {
      console.log('error', err);
      showToast('error', 'Failed to update Global Parameter');
    }
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleChange = (event) => {
    if (event?.target.value) setValue(event?.target.value);
  };

  const handleFinYearChange = (event) => {
    setFinYearValue(event.target.value);
  };

  return (
    <>
      <Box
        sx={{
          ml: 2,
          // mr: 2,
          [theme.breakpoints.down('md')]: {
            // mr: 2
          }
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              // background: theme.palette.primary.light, 
              // color: theme.palette.primary.main, 
              backgroundColor: '#3B82F6',
              color: 'white',
              '&[aria-controls="menu-list-grow"],&:hover': {
                // background: theme.palette.primary.main, 
                // color: theme.palette.primary.contrastText 
                backgroundColor: "#1D4ED8",
              },
              '&:hover .menu-icon': {
                transform: 'rotate(360deg)',
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconWorld className="menu-icon" stroke={1.5} size="1.3rem" style={{
              transition: 'transform 0.3s ease'
            }} />
          </Avatar>
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
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
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
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">Global Parameter</Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container direction="column" spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              fullWidth
                              label="Fin Year"
                              value={finYearValue}
                              onChange={handleFinYearChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled>
                                {/* Select FinYear */}
                              </option>
                              {finVO?.map((option) => (
                                <option key={option.id} value={Number(option.finYear)}>
                                  {option.finYear}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ px: 2, pt: 0.25 }}>
                            <TextField
                              id="outlined-select-currency-native"
                              select
                              small
                              fullWidth
                              label="Branch"
                              value={branchValue}
                              onChange={handleBranchChange}
                              SelectProps={{
                                native: true
                              }}
                              size="small"
                            >
                              <option value="" disabled>
                                {/* Select Branch */}
                              </option>
                              {branchList.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </TextField>
                          </Box>
                        </Grid>

                        <Grid item xs={12} p={0}>
                          <Divider sx={{ my: 0 }} />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      disableElevation
                      onClick={handleSubmit}
                      disabled={!branchValue || !finYearValue}
                    >
                      change
                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <ToastContainer />
    </>
  );
};

export default GlobalSection;

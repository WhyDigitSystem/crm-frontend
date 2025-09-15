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
    const branchcode = event.target.value;
    const branch = branchVO.find((option) => option.branchcode === branchcode);

    if (branch) {
      setSelectedBranch({ branch: branch.branch, branchcode: branchcode });
      setBranchName(branch.branch); // Set the branchName state
    }

    setBranchValue(branchcode);

    // getCustomer(branchcode);
  };
  const getAccessBranch = async () => {
    try {
      const result = await apiCalls('get', `/GlobalParam/globalparamBranchByUserName?orgid=${orgId}&userName=${userName}`);
      setBranchVO(result.paramObjectsMap.GlopalParameters || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  // const getFinYear = async () => {
  //   try {
  //     const result = await apiCalls('get', `/commonmaster/getAllAciveFInYear?orgId=${orgId}`);
  //     setFinVO(result.paramObjectsMap.financialYearVOs || []);
  //     console.log('Test', result);
  //   } catch (err) {
  //     console.log('error', err);
  //   }
  // };
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
      const result = await apiCalls('get', `GlobalParam/globalparam/username?orgid=${orgId}&userid=${userId}`);
      const globalParameterVO = result.paramObjectsMap.globalParam;
      setGlobalParameter(globalParameterVO);
      // setCustomerValue(globalParameterVO.customer);
      // setClientValue(globalParameterVO.client);
      setFinYearValue(globalParameterVO.finYear);
      // setWarehouseValue(globalParameterVO.warehouse);
      setBranchValue(globalParameterVO.branchcode);
      setBranchName(globalParameterVO.branch);
      console.log('Test', result);

      // localStorage.setItem('customer', globalParameterVO.customer);
      // localStorage.setItem('client', globalParameterVO.client);
      localStorage.setItem('finYear', globalParameterVO.finYear);
      // localStorage.setItem('warehouse', globalParameterVO.warehouse);
      localStorage.setItem('branchcode', globalParameterVO.branchcode);
      localStorage.setItem('branch', globalParameterVO.branch);

      // getCustomer(globalParameterVO.branchcode);
      // getClient(globalParameterVO.customer, globalParameterVO.branchcode);
      // getWareHouse(globalParameterVO.branchcode);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleSubmit = async () => {
    const formData = {
      branch: branchName,
      branchcode: branchValue,
      finYear: finYearValue,
      // warehouse: warehouseValue,
      userid: parseInt(userId),
      orgId
    };
    try {
      const result = await apiCalls('put', `GlobalParam/globalparam`, formData);
      showToast('success', 'Global Parameter updated successfully');
      setTimeout(() => {
        window.location.reload();
      }, 400);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
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
          mr: 2,
          [theme.breakpoints.down('md')]: {
            mr: 2
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
              background: theme.palette.primary.light, // ✅ use theme instead of hex
              color: theme.palette.primary.main, // ✅ theme primary
              '&[aria-controls="menu-list-grow"],&:hover': {
                background: theme.palette.primary.main, // ✅ main on hover
                color: theme.palette.primary.contrastText // ✅ auto contrast text
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconWorld stroke={1.5} size="1.3rem" />
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
                                <option key={option.id} value={option.finYear}>
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
                              {branchVO.map((option) => (
                                <option key={option.branchcode} value={option.branchcode}>
                                  {option.branch}
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
                    <Button size="small" disableElevation onClick={handleSubmit}>
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

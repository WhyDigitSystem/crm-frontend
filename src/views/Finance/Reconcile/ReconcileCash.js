import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';
import PhysicalCountComponent from './PhysicalCount';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const ReconcileCash = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [value, setValue] = useState('1');
  const [editId, setEditId] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginBranchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [formData, setFormData] = useState({
    active: true,
    balanceAsPerBooks: 0,
    cashAccount: '',
    createdBy: loginUserName,
    differenceAmount: 0,
    dn1: 0,
    dn1Amt: 0,
    dn2: 0,
    dn2Amt: 0,
    dn3: 0,
    dn3Amt: 0,
    dn4: 0,
    dn4Amt: 0,
    dn5: 0,
    dn5Amt: 0,
    dn6: 0,
    dn6Amt: 0,
    dn7: 0,
    dn7Amt: 0,
    dn8: 0,
    dn8Amt: 0,
    docDate: dayjs(),
    docId: '',
    orgId: orgId,
    remarks: '',
    totalPhyAmount: 0,
    branch: branch,
    branchCode: loginBranchCode,
    finYear: finYear
  });

  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState([]);

  useEffect(() => {
    getAllReconsileCash();
    getNewCashpDocId();
    getAllBankName();
  }, []);

  // Handle tab changes
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  // Handle field changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const getAllBankName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getBankNameForGroupLedger?orgId=${orgId}`);
      setBankName(response.paramObjectsMap.accountName);

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAllReconsileCash = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllReconcileCashByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.reconcileCashVO.reverse() || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  // Placeholder action handlers
  const handleSearch = () => {
    console.log('Search action');
  };

  const handleSave = async () => {
    console.log('FormData=>', formData);

    const newFormdata = {
      docId: formData.docId,
      docDate: formData.docDate ? dayjs(formData.docDate).format('YYYY-MM-DD') : null,
      ...(editId && { id: editId }),
      active: true,
      balanceAsPerBooks: formData.balanceAsPerBooks,
      cashAccount: formData.cashAccount,
      createdBy: loginUserName,
      differenceAmount: formData.differenceAmount,
      dn1: formData.dn1,
      dn1Amt: formData.dn1Amt,
      dn2: formData.dn2,
      dn2Amt: formData.dn2Amt,
      dn3: formData.dn3,
      dn3Amt: formData.dn3Amt,
      dn4: formData.dn4,
      dn4Amt: formData.dn4Amt,
      dn5: formData.dn5,
      dn5Amt: formData.dn5Amt,
      dn6: formData.dn6,
      dn6Amt: formData.dn6Amt,
      dn7: formData.dn7,
      dn7Amt: formData.dn7Amt,
      dn8: formData.dn8,
      dn8Amt: formData.dn8Amt,
      orgId: orgId,
      remarks: formData.remarks,
      totalPhyAmount: formData.totalPhyAmount,
      branch: branch,
      branchCode: loginBranchCode,
      finYear: finYear
    };
    try {
      const response = await apiCalls('put', '/transaction/updateCreateReconcileCash', newFormdata);
      if (response.status === true) {
        console.log('Response:', response);
        showToast('success', editId ? 'Reconcile Cash updated successfully' : 'Reconcile Cash created successfully');
        getAllReconsileCash();
        getNewCashpDocId();
        handleClear();
        setLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Reconcile Cash creation failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Reconcile Cash creation failed');
      setLoading(false);
    }
  };

  const getReconcileById = async (row) => {
    console.log('first', row);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/transaction/getAllReconcileCashById?id=${row.original.id}`);

      if (result) {
        const listValueVO = result.paramObjectsMap.reconcileCashVO[0];
        setEditId(row.original.id);

        console.log('Raw docDate:', listValueVO.docDate);

        // Parse docDate if available and valid
        let parsedDocDate = null;
        if (listValueVO.docDate) {
          parsedDocDate = dayjs(listValueVO.docDate, 'DD-MM-YYYY');
          console.log('Parsed Doc Date:', parsedDocDate); // Debugging log
          console.log('Is Doc Date Valid:', parsedDocDate.isValid());
        }
        // Map the returned values to formData, ensuring all fields are updated
        setFormData({
          active: listValueVO.active !== undefined ? listValueVO.active : true, // Default to true if not provided
          balanceAsPerBooks: listValueVO.balanceAsPerBooks || 0,
          cashAccount: listValueVO.cashAccount || '',
          createdBy: listValueVO.createdBy || 'string',
          differenceAmount: listValueVO.differenceAmount || 0,
          dn1: listValueVO.dn1 || 0,
          dn1Amt: listValueVO.dn1Amt || 0,
          dn2: listValueVO.dn2 || 0,
          dn2Amt: listValueVO.dn2Amt || 0,
          dn3: listValueVO.dn3 || 0,
          dn3Amt: listValueVO.dn3Amt || 0,
          dn4: listValueVO.dn4 || 0,
          dn4Amt: listValueVO.dn4Amt || 0,
          dn5: listValueVO.dn5 || 0,
          dn5Amt: listValueVO.dn5Amt || 0,
          dn6: listValueVO.dn6 || 0,
          dn6Amt: listValueVO.dn6Amt || 0,
          dn7: listValueVO.dn7 || 0,
          dn7Amt: listValueVO.dn7Amt || 0,
          dn8: listValueVO.dn8 || 0,
          dn8Amt: listValueVO.dn8Amt || 0,
          docId: listValueVO.docId,
          docDate: parsedDocDate && parsedDocDate.isValid() ? parsedDocDate : null,
          id: listValueVO.id || 0,
          orgId: listValueVO.orgId || 0,
          remarks: listValueVO.remarks || '',
          totalPhyAmount: listValueVO.totalPhyAmount || 0
        });

        console.log('DataToEdit', listValueVO);
      } else {
        // Handle error or empty data
        console.error('No data returned');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClear = () => {
    setFormData({
      active: true,
      balanceAsPerBooks: 0,
      cashAccount: '',
      createdBy: '',
      differenceAmount: 0,
      dn1: 0,
      dn1Amt: 0,
      dn2: 0,
      dn2Amt: 0,
      dn3: 0,
      dn3Amt: 0,
      dn4: 0,
      dn4Amt: 0,
      dn5: 0,
      dn5Amt: 0,
      dn6: 0,
      dn6Amt: 0,
      dn7: 0,
      dn7Amt: 0,
      dn8: 0,
      dn8Amt: 0,
      docDate: dayjs(),
      docId: '',
      id: 0,
      orgId: 0,
      remarks: '',
      totalPhyAmount: 0
    });
    setEditId('');
    getNewCashpDocId();
  };

  const columns = [
    { accessorKey: 'docId', header: 'Doc No', size: 140 },
    { accessorKey: 'docDate', header: 'reconcileDate', size: 140 },
    { accessorKey: 'cashAccount', header: 'Cash Account', size: 140 },
    { accessorKey: 'balanceAsPerBooks', header: 'Balance As Per Books', size: 140 }
    // { accessorKey: 'totalDeposit', header: 'Total Deposit', size: 140 },
    // { accessorKey: 'totalWithdrawal', header: 'Total Withdrawal', size: 140 }
  ];

  const handleList = () => {
    setShowForm(!showForm);
  };

  const getNewCashpDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getReconcileCashDocId?branchCode=${loginBranchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.reconcileCashDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <Grid container spacing={2} alignItems="center">
          <div className="d-flex flex-wrap justify-content-start p-2">
            <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} loading={loading} />
          </div>
        </Grid>
        {showForm ? (
          <>
            {/* Form Section */}
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Doc No"
                  size="small"
                  value={formData.docId}
                  disabled
                  fullWidth
                  required
                  placeholder="Auto"
                  onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Reconcile Date"
                    disabled
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="DD-MM-YYYY"
                    value={formData.docDate || null}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                {/* <TextField
                  label="Cash Account"
                  size="small"
                  fullWidth
                  required
                  name="cashAccount"
                  value={formData.cashAccount}
                  onChange={handleFieldChange}
                /> */}
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Cash Account
                  </InputLabel>
                  <Select
                    labelId="cashAccount"
                    value={formData.cashAccount}
                    onChange={(e) => setFormData({ ...formData, cashAccount: e.target.value })}
                    label="Cash Account"
                    required
                    // error={!!errors.cashAccount}
                    // helperText={errors.cashAccount}
                  >
                    {bankName &&
                      bankName.map((bank, index) => (
                        <MenuItem key={index} value={bank.accountgroupname}>
                          {bank.accountgroupname}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Balance as per Books"
                  size="small"
                  fullWidth
                  required
                  name="balanceAsPerBooks"
                  value={formData.balanceAsPerBooks}
                  onChange={handleFieldChange}
                />
              </Grid>
            </Grid>

            {/* Tabs Section */}
            <div className="card w-full p-6 bg-base-100 shadow-xl mt-2" style={{ padding: '20px' }}>
              <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChangeTab} textColor="secondary" indicatorColor="secondary">
                      <Tab label="Withdrawals" value="1" />
                      {/* <Tab label="Deposits" value="2" />
                <Tab label="Summary" value="3" /> */}
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    <PhysicalCountComponent formData={formData} setFormData={setFormData} />
                  </TabPanel>
                </TabContext>
              </Box>
            </div>
            <br></br>
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getReconcileById} />
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default ReconcileCash;

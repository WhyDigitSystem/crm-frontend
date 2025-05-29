import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, FormHelperText } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from '../../basicMaster/CommonListViewTable';

const ApBillBalance = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [currencies, setCurrencies] = useState([]);
  const [branchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [branch, setLoginBranch] = useState(localStorage.getItem('branch'));
  const [partyList, setPartyList] = useState([]);

  const [formData, setFormData] = useState({
    active: true,
    // docNo: '',
    accName: '',
    partyName: '',
    partyCode: '',
    creditDays: '',
    docType: '',
    currency: '',
    yearEndExRate: '',
    billExRate: '',
    postBillExRate: true,
    billNo: '',
    suppRefNo: '',
    dueDate: null,
    billDate: null,
    suppRefDate: null,
    debitAmt: '',
    creditAmt: '',
    voucherNo: '',
    adjustmentDone: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    // docNo: '',
    accName: '',
    partyName: '',
    partyCode: '',
    creditDays: '',
    docType: '',
    currency: '',
    yearEndExRate: '',
    billExRate: '',
    postBillExRate: true,
    billNo: '',
    suppRefNo: '',
    dueDate: null,
    billDate: null,
    suppRefDate: null,
    debitAmt: '',
    creditAmt: '',
    voucherNo: '',
    adjustmentDone: true
  });

  const listViewColumns = [
    // { accessorKey: 'docNo', header: 'Doc ID', size: 140 },
    { accessorKey: 'accName', header: 'Account Name', size: 140 },
    { accessorKey: 'partyName', header: 'Party Name', size: 140 },
    { accessorKey: 'creditDays', header: 'Credit Days', size: 140 },
    { accessorKey: 'billNo', header: 'Bill No', size: 140 },
    { accessorKey: 'dueDate', header: 'Due Date', size: 140 },
    { accessorKey: 'debitAmt', header: 'Db Amount', size: 140 },
    { accessorKey: 'creditAmt', header: 'Cr Amount', size: 140 }
  ];

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;
  //   setFormData({ ...formData, [name]: inputValue });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let inputValue = type === 'checkbox' ? checked : value;

    // Fields that should allow only numbers
    const numberFields = ['billExRate', 'billNo', 'creditAmt', 'creditDays', 'debitAmt', 'yearEndExRate'];

    if (numberFields.includes(name)) {
      // Validate for numeric input only
      const numericRegex = /^[0-9]*$/;
      if (!numericRegex.test(inputValue)) {
        setFieldErrors({ ...fieldErrors, [name]: 'Only numbers are allowed' });
        return;
      }
    } else {
      // For other fields: Allow alphabets, numbers, hyphen, and space
      const alphaNumericRegex = /^[A-Za-z0-9\s\-]*$/;
      if (!alphaNumericRegex.test(inputValue)) {
        setFieldErrors({ ...fieldErrors, [name]: 'Only alphabets, numbers, hyphen, and spaces are allowed' });
        return;
      }
    }

    // Update form data and clear error for the field
    setFormData({ ...formData, [name]: inputValue });
    setFieldErrors({ ...fieldErrors, [name]: false });

    // Handle partyName selection and partyCode mapping
    if (name === 'partyName') {
      const selectedParty = partyList.find((party) => party.partyName === value);
      if (selectedParty) {
        setFormData({
          ...formData,
          partyName: value,
          partyCode: selectedParty.partyCode // Set the corresponding partyCode
          // partyType: selectedParty.partyType // Set the corresponding party Type
        });

        // Clear any errors related to partyName if input is valid
        setFieldErrors({
          ...fieldErrors,
          partyName: false,
          partyCode: false,
        });
      }
    } else {
      // Handle other fields
      setFormData({ ...formData, [name]: inputValue });

      // Clear error when input is valid
      setFieldErrors({ ...fieldErrors, [name]: false });
    }
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClear = () => {
    setFormData({
      active: true,
      // docNo: '',
      accName: '',
      partyName: '',
      partyCode: '',
      creditDays: '',
      docType: '',
      currency: '',
      yearEndExRate: '',
      billExRate: '',
      postBillExRate: true,
      billNo: '',
      suppRefNo: '',
      dueDate: null,
      billDate: null,
      suppRefDate: null,
      debitAmt: '',
      creditAmt: '',
      voucherNo: '',
      adjustmentDone: true
    });
    setFieldErrors({
      // docNo: '',
      accName: '',
      partyName: '',
      partyCode: '',
      creditDays: '',
      docType: '',
      currency: '',
      yearEndExRate: '',
      billExRate: '',
      postBillExRate: true,
      billNo: '',
      suppRefNo: '',
      dueDate: null,
      billDate: null,
      suppRefDate: null,
      debitAmt: '',
      creditAmt: '',
      voucherNo: '',
      adjustmentDone: true
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your orgId or fetch it from somewhere
        const currencyData = await getAllActiveCurrency(orgId);
        setCurrencies(currencyData);

        console.log('currency', currencyData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    fetchData();
    // getGroup();
  }, []);

  useEffect(() => {
    getAllPartyName();
  }, []);

  const getAllPartyName = async () => {
    try {
      const response = await apiCalls('get', `payable/getPartyNameAndCodeForApBillBalance?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setPartyList(response.paramObjectsMap.PartyMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllApBillBalance();
  }, []);

  const getAllApBillBalance = async () => {
    try {
      const response = await apiCalls('get', `payable/getAllApBillBalanceByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.PartyMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getArApBillBalanceById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `payable/getAllApBillBalanceById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularEmp = response.paramObjectsMap.apBillBalanceVO[0];

        setFormData({
          // docNo: particularEmp.docNo,
          accName: particularEmp.accName,
          partyName: particularEmp.partyName,
          partyCode: particularEmp.partyCode,
          creditDays: particularEmp.creditDays,
          docType: particularEmp.docType,
          currency: particularEmp.currency,
          yearEndExRate: particularEmp.yearEndExRate,
          billExRate: particularEmp.billExRate,
          postBillExRate: particularEmp.postBillExRate,
          billNo: particularEmp.billNo,
          suppRefNo: particularEmp.suppRefNo,
          dueDate: dayjs(particularEmp.dueDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
          billDate: dayjs(particularEmp.billDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
          suppRefDate: dayjs(particularEmp.suppRefDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
          debitAmt: particularEmp.debitAmt,
          creditAmt: particularEmp.creditAmt,
          voucherNo: particularEmp.voucherNo,
          adjustmentDone: particularEmp.adjustmentDone
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    const errors = {};

    // Check for empty fields and set error messages
    // if (!formData.docNo) {
    //   errors.docNo = 'Doc Id is required';
    // }

    if (!formData.accName) {
      errors.accName = 'Account name is required';
    }

    if (!formData.partyName) {
      errors.partyName = 'Party Name is required';
    }

    if (!formData.partyCode) {
      errors.partyCode = 'Party Code is required';
    }

    if (!formData.creditDays) {
      errors.creditDays = 'Credit Days is required';
    }

    if (!formData.docType) {
      errors.docType = 'Doc Type is required';
    }

    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }

    if (!formData.yearEndExRate) {
      errors.yearEndExRate = 'Year End Ex Rate is required';
    }

    if (!formData.billExRate) {
      errors.billExRate = 'Bill Ex Rate is required';
    }

    if (!formData.billNo) {
      errors.billNo = 'Bill No is required';
    }

    if (!formData.suppRefNo) {
      errors.suppRefNo = 'Supp Ref No is required';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Due Date is required';
    }

    if (!formData.billDate) {
      errors.billDate = 'Bill Date is required';
    }

    if (!formData.suppRefDate) {
      errors.suppRefDate = 'Supp Ref Date is required';
    }

    if (!formData.debitAmt) {
      errors.debitAmt = 'Db Amount is required';
    }

    if (!formData.creditAmt) {
      errors.creditAmt = 'Cr Amount is required';
    }

    if (!formData.voucherNo) {
      errors.voucherNo = 'Voucher No is required';
    }

    // If errors exist, update fieldErrors state and don't proceed with save
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    // Proceed with saving the data if no errors
    const saveFormData = {
      ...(editId && { id: editId }),
      active: formData.active,
      postBillExRate: formData.postBillExRate,
      adjustmentDone: formData.adjustmentDone,
      // docNo: formData.docNo,
      accName: formData.accName,
      partyName: formData.partyName,
      partyCode: formData.partyCode,
      creditDays: parseInt(formData.creditDays),
      docType: formData.docType,
      currency: formData.currency,
      yearEndExRate: parseInt(formData.yearEndExRate),
      billExRate: parseInt(formData.billExRate),
      billNo: parseInt(formData.billNo),
      suppRefNo: formData.suppRefNo,
      dueDate: formatDate(new Date(formData.dueDate)),
      billDate: formatDate(new Date(formData.billDate)),
      suppRefDate: formatDate(new Date(formData.suppRefDate)),
      debitAmt: parseInt(formData.debitAmt),
      creditAmt: parseInt(formData.creditAmt),
      voucherNo: formData.voucherNo,
      orgId: parseInt(orgId),
      createdBy: loginUserName,
      branch: branch,
      branchCode: branchCode,
      finYear: finYear,
      cancel: true,
      cancelRemarks: ''
    };

    try {
      const response = await apiCalls('put', `payable/updateCreateApBillBalance`, saveFormData);
      if (response.status === true) {
        showToast('success', editId ? 'AP Bill Balance Updated Successfully' : 'AP Bill Balance created successfully');
        handleClear();
        getAllApBillBalance();
        setIsLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'AP Bill Balance creation failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'AP Bill Balance creation failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml" style={{ marginBottom: '20px' }}>
          <div className="d-flex flex-wrap justify-content-start mb-2 " style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
          </div>
        </div>
        {listView ? (
          <div className="">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getArApBillBalanceById} />
          </div>
        ) : (
          <>
            <div className="row">
              {/* <div className="col-md-3 mb-3">
                <TextField
                  id="docNo"
                  label="Doc ID"
                  name="docNo"
                  variant="outlined"
                  size="small"
                  value={formData.docNo}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.docNo}
                  helperText={fieldErrors.docNo ? fieldErrors.docNo : ''}
                />
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.accName}>
                  <InputLabel id="accName" required>
                    Account Name
                  </InputLabel>
                  <Select
                    labelId="accName"
                    id="accName"
                    name="accName"
                    required
                    value={formData.accName}
                    label="Account Name"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="HEAD OFFICE">HEAD OFFICE</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                  </Select>
                  {fieldErrors.accName && <FormHelperText>{fieldErrors.accName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={partyList}
                  getOptionLabel={(option) => option.partyName}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.partyName ? partyList.find((c) => c.partyName === formData.partyName) : null}
                  onChange={(event, newValue) => {
                    // Wrapped in an arrow function
                    handleInputChange({
                      target: {
                        name: 'partyName',
                        value: newValue ? newValue.partyName : '' // Passes 'partyName' value or empty string
                      }
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Party Name"
                      name="partyName"
                      error={!!fieldErrors.partyName}
                      helperText={fieldErrors.partyName}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="partyCode"
                    name="partyCode"
                    label="Party Code"
                    size="small"
                    value={formData.partyCode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.partyCode}
                    helperText={fieldErrors.partyCode}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="creditDays"
                  label="Credit Days"
                  name="creditDays"
                  variant="outlined"
                  size="small"
                  value={formData.creditDays}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.creditDays}
                  helperText={fieldErrors.creditDays ? fieldErrors.creditDays : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.docType}>
                  <InputLabel id="docType" required>
                    Doc Type
                  </InputLabel>
                  <Select
                    labelId="docType"
                    id="docType"
                    name="docType"
                    required
                    value={formData.docType}
                    label="Doc Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="TYPE 1">TYPE 1</MenuItem>
                    <MenuItem value="TYPE 2">TYPE 2</MenuItem>
                  </Select>
                  {fieldErrors.docType && <FormHelperText>{fieldErrors.docType}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency">Currency</InputLabel>
                  <Select
                    labelId="currency"
                    id="currency"
                    label="Currency"
                    onChange={handleInputChange}
                    name="currency"
                    value={formData.currency}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.currency}>
                        {currency.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText>{fieldErrors.currency}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="yearEndExRate"
                  label="Year End Ex. Rate"
                  name="yearEndExRate"
                  variant="outlined"
                  size="small"
                  value={formData.yearEndExRate}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.yearEndExRate}
                  helperText={fieldErrors.yearEndExRate ? fieldErrors.yearEndExRate : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="billExRate"
                  label="Bill Ex. Rate"
                  name="billExRate"
                  variant="outlined"
                  size="small"
                  value={formData.billExRate}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.billExRate}
                  helperText={fieldErrors.billExRate ? fieldErrors.billExRate : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.postBillExRate}
                        onChange={handleInputChange}
                        name="postBillExRate"
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Post Bill Ex. Rate"
                  />
                </FormGroup>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="billNo"
                  label="Bill No"
                  name="billNo"
                  variant="outlined"
                  size="small"
                  value={formData.billNo}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.billNo}
                  helperText={fieldErrors.billNo ? fieldErrors.billNo : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="suppRefNo"
                  label="Supp. Ref. No"
                  name="suppRefNo"
                  variant="outlined"
                  size="small"
                  value={formData.suppRefNo}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.suppRefNo}
                  helperText={fieldErrors.suppRefNo ? fieldErrors.suppRefNo : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={formData.dueDate ? dayjs(formData.dueDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dueDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.dueDate}
                      helperText={fieldErrors.dueDate ? fieldErrors.dueDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Bill Date"
                      value={formData.billDate ? dayjs(formData.billDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('billDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.billDate}
                      helperText={fieldErrors.billDate ? fieldErrors.billDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Supp. Ref Date"
                      value={formData.suppRefDate ? dayjs(formData.suppRefDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('suppRefDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.suppRefDate}
                      helperText={fieldErrors.suppRefDate ? fieldErrors.suppRefDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="debitAmt"
                  label="Db Amount"
                  name="debitAmt"
                  variant="outlined"
                  size="small"
                  value={formData.debitAmt}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.debitAmt}
                  helperText={fieldErrors.debitAmt ? fieldErrors.debitAmt : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="creditAmt"
                  label="Cr Amount"
                  name="creditAmt"
                  variant="outlined"
                  size="small"
                  value={formData.creditAmt}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.creditAmt}
                  helperText={fieldErrors.creditAmt ? fieldErrors.creditAmt : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="voucherNo"
                  label="Voucher No"
                  name="voucherNo"
                  variant="outlined"
                  size="small"
                  value={formData.voucherNo}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.voucherNo}
                  helperText={fieldErrors.voucherNo ? fieldErrors.voucherNo : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.adjustmentDone}
                        onChange={handleInputChange}
                        name="adjustmentDone"
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Adjustments Done"
                  />
                </FormGroup>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default ApBillBalance;

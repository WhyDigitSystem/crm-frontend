import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';
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
import CommonListViewTable from '../basicMaster/CommonListViewTable';

const FundTransfer = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setBranch] = useState(localStorage.getItem('userName'));
  const [branch, setLoginUserName] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [currencies, setCurrencies] = useState([]);
  const [docId, setDocId] = useState('');

  const [formData, setFormData] = useState({
    mode: '',
    docNo: '',
    corpAccount: '',
    currency: '',
    exRate: '',
    transferTo: '',
    branchAcc: '',
    amount: '',
    amtBase: '',
    narration: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    mode: '',
    docNo: '',
    corpAccount: '',
    currency: '',
    exRate: '',
    transferTo: '',
    branchAcc: '',
    amount: '',
    amtBase: '',
    narration: ''
  });

  const listViewColumns = [
    { accessorKey: 'mode', header: 'Mode', size: 140 },
    { accessorKey: 'docId', header: 'Doc No', size: 140 },
    { accessorKey: 'branchAcc', header: 'Branch A/C', size: 140 },
    { accessorKey: 'exRate', header: 'Ex Rate', size: 140 },
    { accessorKey: 'corpAccount', header: 'Corporate A/C', size: 140 },
    { accessorKey: 'transferTo', header: 'Transfer To', size: 140 },
    { accessorKey: 'amount', header: 'Amount', size: 140 }
  ];

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;
  //   setFormData({ ...formData, [name]: inputValue });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };
  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;

  //   // Validation for "amount" and "amtBase" fields to allow only numbers
  //   if ((name === 'amount' || name === 'amtBase') && !/^\d*$/.test(value)) {
  //     setFieldErrors({
  //       ...fieldErrors,
  //       [name]: 'Only numbers are allowed for this field'
  //     });
  //     return; // Exit the function without setting the value
  //   }

  //   // Prevent selecting the same bank in "Transfer To" and "Corporate A/C"
  //   if (name === 'transferTo' && value === formData.corpAccount) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Cannot select the same bank as Corporate A/C' });
  //     setFormData({ ...formData, [name]: '' });
  //   } else if (name === 'corpAccount' && value === formData.transferTo) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Cannot select the same bank as Transfer To' });
  //     setFormData({ ...formData, [name]: '' });
  //   } else {
  //     // Clear any existing error and set the field value normally
  //     setFormData({ ...formData, [name]: inputValue });
  //     setFieldErrors({ ...fieldErrors, [name]: false });
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
  
    // Validation for "amount" and "amtBase" fields to allow only numbers
    if ((name === 'amount' || name === 'amtBase') && !/^\d*$/.test(value)) {
      setFieldErrors((prevFieldErrors) => ({
        ...prevFieldErrors,
        [name]: 'Only numbers are allowed for this field',
      }));
      return; // Exit the function without setting the value
    }
  
    // Prevent selecting the same bank in "Transfer To" and "Corporate A/C"
    if (name === 'transferTo' && value === formData.corpAccount) {
      setFieldErrors((prevFieldErrors) => ({
        ...prevFieldErrors,
        [name]: 'Cannot select the same bank as Corporate A/C',
      }));
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: '',
      }));
      return;
    } else if (name === 'corpAccount' && value === formData.transferTo) {
      setFieldErrors((prevFieldErrors) => ({
        ...prevFieldErrors,
        [name]: 'Cannot select the same bank as Transfer To',
      }));
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: '',
      }));
      return;
    }
  
    // Set exRate when currency changes
    if (name === 'currency') {
      const selectedCurrency = currencies.find((currency) => currency.currency === value);
      if (selectedCurrency) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          currency: value,
          exRate: selectedCurrency.sellingExRate,
        }));
        setFieldErrors((prevFieldErrors) => ({
          ...prevFieldErrors,
          currency: false,
        }));
        return;
      }
    }
  
    // Clear any existing error and set the field value normally
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      [name]: false,
    }));
  };
  

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleClear = () => {
    setFormData({
      mode: '',
      docNo: '',
      corpAccount: '',
      currency: '',
      exRate: '',
      transferTo: '',
      branchAcc: '',
      amount: '',
      amtBase: '',
      narration: ''
    });
    setFieldErrors({
      mode: '',
      docNo: '',
      corpAccount: '',
      currency: '',
      exRate: '',
      transferTo: '',
      branchAcc: '',
      amount: '',
      amtBase: '',
      narration: ''
    });
    getFundTransferDocId();
  };

  const handleView = () => {
    setListView(!listView);
  };

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     // Replace with your orgId or fetch it from somewhere
    //     const currencyData = await getAllActiveCurrency(orgId);
    //     setCurrencies(currencyData);

    //     console.log('currency', currencyData);
    //   } catch (error) {
    //     console.error('Error fetching country data:', error);
    //   }
    // };

    // fetchData();
    // getGroup();
    getAllCurrency();
  }, []);

  const getAllCurrency = async () => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getCurrencyAndExrateDetails?orgId=${orgId}`);
      setCurrencies(response.paramObjectsMap.currencyVO);

      console.log('Test===>', response.paramObjectsMap.currencyVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  useEffect(() => {
    getAllFundTransfer();
    getFundTransferDocId();
  }, []);

  const getAllFundTransfer = async () => {
    try {
      const response = await apiCalls('get', `transaction/getAllFundTransferByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.fundTransferVO);
     
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFundTransferDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `transaction/getFundTranferDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      console.log('API Response:', response);

      if (response.status === true) {
        setDocId(response.paramObjectsMap.fundTransferDocId);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFundTransferById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `transaction/getAllFundTransferById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularEmp = response.paramObjectsMap.fundTransferVO[0];

        setDocId(particularEmp.docId);

        setFormData({
          mode: particularEmp.mode,
          docNo: particularEmp.docNo,
          branchAcc: particularEmp.branchAcc,
          currency: particularEmp.currency,
          exRate: particularEmp.exRate,
          corpAccount: particularEmp.corpAccount,
          transferTo: particularEmp.transferTo,
          amount: particularEmp.amount,
          amtBase: particularEmp.amtBase,
          narration: particularEmp.exRate
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};

    // Check for empty fields and set error messages
    if (!formData.mode) {
      errors.mode = 'Mode is required';
    }

    if (!formData.corpAccount) {
      errors.corpAccount = 'Corporate A/C is required';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'Ex Rate is required';
    }
    if (!formData.transferTo) {
      errors.transferTo = 'Transfer To is required';
    }
    if (!formData.branchAcc) {
      errors.branchAcc = 'Branch A/C is required';
    }
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    }
    if (!formData.amtBase) {
      errors.amtBase = 'Amount (Base) is required';
    }
    if (!formData.narration) {
      errors.narration = 'Narration is required';
    }

    // If errors exist, update fieldErrors state and don't proceed with save
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    // Prepare the API payload with the necessary fields
    const saveFormData = {
      ...(editId && { id: editId }),
      mode: formData.mode,
      docNo: formData.docNo,
      corpAccount: formData.corpAccount,
      currency: formData.currency,
      exRate: formData.exRate,
      transferTo: formData.transferTo,
      branchAcc: formData.branchAcc,
      amount: parseInt(formData.amount),
      amtBase: parseInt(formData.amtBase),
      narration: formData.narration,
      createdBy: loginUserName,
      orgId: parseInt(orgId),
      branch: branch,
      branchCode: branchCode,
      finYear: finYear,
      cancelRemarks: '',
      ipNo: '',
      latitude: ''
    };

    try {
      const response = await apiCalls('put', `transaction/updateCreateFundTransfer`, saveFormData);
      if (response.status === true) {
        showToast('success', editId ? 'Fund Transfer Updated Successfully' : 'Fund Transfer created successfully');
        handleClear();
        getAllFundTransfer();
        getFundTransferDocId();
        setIsLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Fund Transfer creation failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Fund Transfer creation failed');
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getFundTransferById} />
          </div>
        ) : (
          <>
            <div className="row"></div>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.mode}>
                  <InputLabel id="mode" required>
                    Mode
                  </InputLabel>
                  <Select labelId="mode" id="mode" name="mode" required value={formData.mode} label="Mode" onChange={handleInputChange}>
                    <MenuItem value="HEAD OFFICE">HEAD OFFICE</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                  </Select>
                  {fieldErrors.mode && <FormHelperText>{fieldErrors.mode}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="docNo"
                  label="Doc No"
                  name="docNo"
                  variant="outlined"
                  size="small"
                  value={docId}
                  disabled
                  required
                  fullWidth
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={dayjs()}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      readOnly
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branchAcc}>
                  <InputLabel id="branchAcc" required>
                    Branch A/C
                  </InputLabel>
                  <Select
                    labelId="branchAcc"
                    id="branchAcc"
                    name="branchAcc"
                    required
                    value={formData.branchAcc}
                    label="Branch A/C"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="HEAD OFFICE">HEAD OFFICE</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                  </Select>
                  {fieldErrors.branchAcc && <FormHelperText>{fieldErrors.branchAcc}</FormHelperText>}
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
                  type="number"
                  id="exRate"
                  label="Ex Rate"
                  name="exRate"
                  variant="outlined"
                  size="small"
                  value={formData.exRate}
                  onChange={handleInputChange}
                  disabled
                  fullWidth
                  error={!!fieldErrors.exRate}
                  helperText={fieldErrors.exRate ? fieldErrors.exRate : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.corpAccount}>
                  <InputLabel id="corpAccount" required>
                    Corporate A/C
                  </InputLabel>
                  <Select
                    labelId="corpAccount"
                    id="corpAccount"
                    name="corpAccount"
                    required
                    value={formData.corpAccount}
                    label="Corporate A/C"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Indian Bank">Indian Bank</MenuItem>
                    <MenuItem value="SBI">SBI</MenuItem>
                    <MenuItem value="Union">Union</MenuItem>
                    <MenuItem value="ICICI">ICICI</MenuItem>
                  </Select>
                  {fieldErrors.corpAccount && <FormHelperText>{fieldErrors.corpAccount}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.transferTo}>
                  <InputLabel id="transferTo" required>
                    Transfer To
                  </InputLabel>
                  <Select
                    labelId="transferTo"
                    id="transferTo"
                    name="transferTo"
                    required
                    value={formData.transferTo}
                    label="Transfer To"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Indian Bank">Indian Bank</MenuItem>
                    <MenuItem value="SBI">SBI</MenuItem>
                    <MenuItem value="Union">Union</MenuItem>
                    <MenuItem value="ICICI">ICICI</MenuItem>
                  </Select>
                  {fieldErrors.transferTo && <FormHelperText>{fieldErrors.transferTo}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  id="amount"
                  label="Amount"
                  name="amount"
                  variant="outlined"
                  size="small"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.amount}
                  helperText={fieldErrors.amount ? fieldErrors.amount : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="amtBase"
                  label="Amount (Base)"
                  name="amtBase"
                  variant="outlined"
                  size="small"
                  value={formData.amtBase}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.amtBase}
                  helperText={fieldErrors.amtBase ? fieldErrors.amtBase : ''}
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  id="narration"
                  label="Narration"
                  name="narration"
                  variant="outlined"
                  size="small"
                  value={formData.narration}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.narration}
                  helperText={fieldErrors.narration ? fieldErrors.narration : ''}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};
export default FundTransfer;

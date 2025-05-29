import ClearIcon from '@mui/icons-material/Clear';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
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
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
// import sampleFile from '../../assets/sample-files/BrsOpeningExcel';
import { FormHelperText } from '@mui/material';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import BrsOpeningExcel from '../../assets/sample-files/BrsOpeningExcel.xlsx';

const BRSOpening = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [branchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));

  const [formData, setFormData] = useState({
    active: true,
    branch: '',
    billNo: '',
    billDate: null,
    chqNo: '',
    chqDate: null,
    bank: '',
    currency: '',
    exRate: '',
    paymentAmount: '',
    receiptAmount: '',
    reconcile: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    branch: '',
    billNo: '',
    billDate: null,
    chqNo: '',
    chqDate: null,
    bank: '',
    currency: '',
    exRate: '',
    paymentAmount: '',
    receiptAmount: '',
    reconcile: true
  });

  const listViewColumns = [
    { accessorKey: 'billNo', header: 'Bill No', size: 140 },
    { accessorKey: 'billDate', header: 'Bill Date', size: 140 },
    { accessorKey: 'bank', header: 'Bank', size: 140 },
    { accessorKey: 'receiptAmount', header: 'Receipt Amount', size: 140 },
    { accessorKey: 'paymentAmount', header: 'Payment Amount', size: 140 }
    // { accessorKey: 'active', header: 'Active', size: 140 }
  ];

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

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;
  //   setFormData({ ...formData, [name]: inputValue });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
  
    // Update the formData with the new value
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));
  
    // Reset the field error for the current field
    setFieldErrors((prevFieldErrors) => ({
      ...prevFieldErrors,
      [name]: false,
    }));
  
    // If the currency field is being changed, update exRate based on the selected currency's sellingExRate
    if (name === 'currency') {
      const selectedCurrency = currencies.find((currency) => currency.currency === value);
      if (selectedCurrency) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          exRate: selectedCurrency.sellingExRate,
        }));
      }
    }
  };
  

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleClear = () => {
    setFormData({
      active: true,
      branch: '',
      billNo: '',
      billDate: null,
      chqNo: '',
      chqDate: null,
      bank: '',
      currency: '',
      exRate: '',
      paymentAmount: '',
      receiptAmount: '',
      reconcile: true
    });
    setFieldErrors({
      branch: '',
      billNo: '',
      billDate: null,
      chqNo: '',
      chqDate: null,
      bank: '',
      currency: '',
      exRate: '',
      paymentAmount: '',
      receiptAmount: ''
    });
  };

  const handleView = () => {
    setListView(!listView);
  };

  useEffect(() => {
    getAllBrsOpenings();
  }, []);

  const getAllBrsOpenings = async () => {
    try {
      const response = await apiCalls('get', `transaction/getAllBrsOpeningByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.brsOpeningVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getBrsOpeningsById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `transaction/getAllBrsOpeningById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularEmp = response.paramObjectsMap.brsOpeningVO[0];

        setFormData({
          branch: particularEmp.branch,
          billNo: particularEmp.billNo,
          billDate: particularEmp.billDate,
          chqNo: particularEmp.chqNo,
          chqDate: particularEmp.chqDate,
          bank: particularEmp.bank,
          currency: particularEmp.currency,
          exRate: particularEmp.exRate,
          receiptAmount: particularEmp.receiptAmount,
          paymentAmount: particularEmp.paymentAmount,
          reconcile: particularEmp.reconcile
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
    if (!formData.billNo) {
      errors.billNo = 'Bill No is required';
    }

    if (!formData.branch) {
      errors.branch = 'Branch is required';
    }

    if (!formData.billDate) {
      errors.billDate = 'Bill Date is required';
    }

    if (!formData.chqNo) {
      errors.chqNo = 'Ref./Chq.No is required';
    }

    if (!formData.chqDate) {
      errors.chqDate = 'Ref./Chq.Date is required';
    }

    if (!formData.bank) {
      errors.bank = 'Bank/Cash/A/C is required';
    }

    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }

    if (!formData.exRate) {
      errors.exRate = 'Exchange Rate is required';
    }

    if (!formData.paymentAmount) {
      errors.paymentAmount = 'Payment Amount is required';
    }

    if (!formData.receiptAmount) {
      errors.receiptAmount = 'Receipt Amount is required';
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
      branch: formData.branch,
      billNo: formData.billNo,
      billDate: formData.billDate,
      chqNo: formData.chqNo,
      chqDate: formData.chqDate,
      bank: formData.bank,
      currency: formData.currency,
      exRate: formData.exRate,
      paymentAmount: formData.paymentAmount,
      receiptAmount: formData.receiptAmount,
      reconcile: formData.reconcile,
      orgId: orgId,
      createdBy: loginUserName
    };

    try {
      const response = await apiCalls('put', `transaction/updateCreateBrsOpening`, saveFormData);
      if (response.status === true) {
        showToast('success', editId ? 'BRS Opening Updated Successfully' : 'BRS Opening created successfully');
        handleClear();
        getAllBrsOpenings();
        setIsLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'BRS Opening creation failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'BRS Opening creation failed');
      setIsLoading(false);
    }
  };

  const handleBulkUploadOpen = () => {
    setUploadOpen(true); // Open dialog
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false); // Close dialog
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };

  const handleSubmit = () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-2 " style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
            <ActionButton title="Upload" icon={CloudUploadIcon} onClick={handleBulkUploadOpen} />
          </div>
        </div>
        {uploadOpen && (
          <CommonBulkUpload
            open={uploadOpen}
            handleClose={handleBulkUploadClose}
            title="Upload Files"
            uploadText="Upload file"
            downloadText="Sample File"
            onSubmit={handleSubmit}
            sampleFileDownload={BrsOpeningExcel}
            handleFileUpload={handleFileUpload}
            // apiUrl={`transaction/excelUploadForBrs?branch="CHENNAI"&branchCode="MAAW"&client="CASIO"&createdBy=${loginUserName}&customer="UNI"&finYear="2024"&orgId=${orgId}`}
            apiUrl={`transaction/excelUploadForBrs?branch=${branch}&branchCode=${branchCode}&createdBy=${loginUserName}&orgId=${orgId}`}
            screen="PutAway"
          ></CommonBulkUpload>
        )}
        {listView ? (
          <div className="">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getBrsOpeningsById} />
          </div>
        ) : (
          <>
            <div className="row d-flex mt-3">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                  <InputLabel id="branch">Branch/Location</InputLabel>
                  <Select
                    labelId="branch"
                    id="branch"
                    label="Branch/Location"
                    onChange={handleInputChange}
                    name="branch"
                    value={formData.branch}
                  >
                    <MenuItem value="Head Office">Head Office</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                  </Select>
                  {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="billNo"
                  label="Bill No."
                  name="billNo"
                  value={formData.billNo}
                  placeholder="Bill No."
                  variant="outlined"
                  size="small"
                  required
                  fullWidth
                  onChange={handleInputChange}
                  error={!!fieldErrors.billNo}
                  helperText={fieldErrors.billNo ? fieldErrors.billNo : ''}
                />
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
                <TextField
                  id="chqNo"
                  name="chqNo"
                  value={formData.chqNo}
                  label="Ref./Chq.No"
                  placeholder="Ref./Chq.No"
                  variant="outlined"
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  error={!!fieldErrors.chqNo}
                  helperText={fieldErrors.chqNo ? fieldErrors.chqNo : ''}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ref./chq.Date"
                      value={formData.chqDate ? dayjs(formData.chqDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('chqDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.chqDate}
                      helperText={fieldErrors.chqDate ? fieldErrors.chqDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="bank"
                  label="Bank/Cash/A/C"
                  name="bank"
                  placeholder="Bank/Cash/A/C"
                  variant="outlined"
                  size="small"
                  value={formData.bank}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  error={!!fieldErrors.bank}
                  helperText={fieldErrors.bank ? fieldErrors.bank : ''}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <TextField
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  label="Currency"
                  placeholder="Currency"
                  variant="outlined"
                  size="small"
                  onChange={handleInputChange}
                  fullWidth
                  error={!!fieldErrors.currency}
                  helperText={fieldErrors.currency ? fieldErrors.currency : ''}
                />
              </div> */}
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
                  name="exRate"
                  value={formData.exRate}
                  label="Ex.rate"
                  placeholder="Ex.rate"
                  variant="outlined"
                  size="small"
                  onChange={handleInputChange}
                  fullWidth
                  disabled
                  error={!!fieldErrors.exRate}
                  helperText={fieldErrors.exRate ? fieldErrors.exRate : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="receiptAmount"
                  name="receiptAmount"
                  label="Receipt Amount"
                  placeholder="Receipt Amount"
                  variant="outlined"
                  size="small"
                  value={formData.receiptAmount}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!fieldErrors.receiptAmount}
                  helperText={fieldErrors.receiptAmount ? fieldErrors.receiptAmount : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="paymentAmount"
                  name="paymentAmount"
                  label="Payment Amount"
                  placeholder="Payment Amount"
                  variant="outlined"
                  size="small"
                  value={formData.paymentAmount}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!fieldErrors.paymentAmount}
                  helperText={fieldErrors.paymentAmount ? fieldErrors.paymentAmount : ''}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.reconcile}
                        onChange={handleInputChange}
                        name="reconcile"
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Reconcile"
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

export default BRSOpening;

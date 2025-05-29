import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import CommonReportTable from 'utils/CommonReportTable';

import { showToast } from 'utils/toast-component';

export const ReceiptRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginClient, setLoginClient] = useState(localStorage.getItem('client'));

  const [loginCustomer, setLoginCustomer] = useState(localStorage.getItem('customer'));
  const [loginWarehouse, setLoginWarehouse] = useState(localStorage.getItem('warehouse'));
  const [branchList, setBranchList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [branchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [branch, setLoginBranch] = useState(localStorage.getItem('branch'));

  const [formData, setFormData] = useState({
    startDate: dayjs(),
    endDate: dayjs(),
    customerName: '',
    branchCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    startDate: '',
    endDate: '',
    customerName: '',
    branchCode: ''
  });
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const reportColumns = [
    { accessorKey: 'docId', header: 'Doc Id', size: 140 },
    { accessorKey: 'docDate',header: 'Doc Date',size: 140,Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString('en-GB').split('/').join('-')},
    { accessorKey: 'subLedgerName', header: 'Sub Ledger Name', size: 140 },
    { accessorKey: 'bankCash', header: 'Bank/Cash A/C', size: 140 },
    { accessorKey: 'receiptAmount', header: 'Receipt Amount', size: 140 },
    { accessorKey: 'bankCharges', header: 'Bank Charges', size: 140 },
    { accessorKey: 'taxAmount', header: 'S. Tax Amount', size: 140 },
    { accessorKey: 'tdsAmount', header: 'TDS Amount', size: 140 },
    { accessorKey: 'invoiceNo', header: 'Invoice No', size: 140 },
    { accessorKey: 'invoiceDate', header: 'Invoice Date', size: 140 , Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString('en-GB').split('/').join('-')},
    { accessorKey: 'refNo', header: 'Ref No', size: 140 },
    { accessorKey: 'refDate', header: 'Ref Date', size: 140 , Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString('en-GB').split('/').join('-')},
    { accessorKey: 'chequeBank', header: 'Cheque Bank', size: 140 },
    { accessorKey: 'chequeNo', header: 'Cheque No', size: 140 },
    { accessorKey: 'amount', header: 'Amount', size: 140 },
    { accessorKey: 'outstanding', header: 'Outstanding', size: 140 },
    { accessorKey: 'setteled', header: 'Settled', size: 140 },
    { accessorKey: 'createdOn', header: 'Created On', size: 140 },
    { accessorKey: 'createdBy', header: 'Created By', size: 140 }
  ];
  useEffect(() => {
    getAllBranches();
    getAllCustomerName();
  }, []);

  const handleInputChange = (fieldName) => (event, value) => {
    if (value) {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value[fieldName] // Dynamically set the correct field
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: '' // Clear the field if no value is selected
      }));
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '' // Reset error for the field
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date ? dayjs(date).format('YYYY-MM-DD') : null // Format to 'YYYY-MM-DD'
    }));
  };

  const handleSearch = async () => {
    const errors = {};
    if (!formData.customerName) {
      errors.customerName = 'Sub ledger name is required';
    }
    if (!formData.branchCode) {
      errors.branchCode = 'Branch Code is required';
    }
    const saveFormData = {
      subLedgerName: formData.customerName,
      branchCode: formData.branchCode,
      fromDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
      toDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null
    };
    console.log('THE SAVE FORM DATA IS:', saveFormData);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await apiCalls(
          'get',
          `/arreceivable/getAllReceiptRegister?orgId=${orgId}&fromDate=${saveFormData.fromDate}&toDate=${saveFormData.toDate}&subLedgerName=${saveFormData.subLedgerName}`
        );
        if (response.status === true) {
          console.log('Response:', response);
          setRowData(response.paramObjectsMap.PartyMasterVO);
          setIsLoading(false);
          setListView(true);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Report Fetch failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Report Fetch failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleClear = () => {
    setFormData({
      startDate: dayjs(),
      endDate: dayjs(),
      customerName: '',
      branchCode: ''
    });
    setFieldErrors({
      startDate: '',
      customerName: '',
      branchCode: ''
    });
    setListView(false);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllCustomerName = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/arreceivable/getCustomerNameAndCodeForReceipt?orgId=${orgId}`
      );
      console.log('API Response:', response);

      if (response.status === true) {
        setCustomerList(response.paramObjectsMap.PartyMasterVO);
        console.log('Test===>', response.paramObjectsMap.PartyMasterVO);
      } else {
        // Handle error
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} isLoading={isLoading} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate ? dayjs(formData.startDate, 'YYYY-MM-DD') : null}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{
                    textField: { size: 'small', clearable: true }
                  }}
                  format="DD-MM-YYYY"
                  error={fieldErrors.startDate}
                  helperText={fieldErrors.startDate && 'Required'}
                  maxDate={dayjs()}
                />
              </LocalizationProvider>
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled" size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate ? dayjs(formData.endDate, 'YYYY-MM-DD') : null}
                  slotProps={{
                    textField: { size: 'small', clearable: true }
                  }}
                  format="DD-MM-YYYY"
                  // disabled
                />
              </LocalizationProvider>
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              disablePortal
              options={customerList}
              getOptionLabel={(option) => option.customerName}
              sx={{ width: '100%' }}
              size="small"
              value={formData.customerName ? customerList.find((p) => p.customerName === formData.customerName) : null}
              onChange={handleInputChange('customerName')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="SubLedger Name"
                  error={!!fieldErrors.customerName}
                  helperText={fieldErrors.customerName}
                  InputProps={{
                    ...params.InputProps,
                    style: { height: 40 }
                  }}
                />
              )}
            />
          </div>
          <div className="col-md-3 mb-3">
            <Autocomplete
              disablePortal
              options={branchList}
              getOptionLabel={(option) => option.branchCode}
              sx={{ width: '100%' }}
              size="small"
              value={formData.branchCode ? branchList.find((c) => c.branchCode === formData.branchCode) : null}
              onChange={handleInputChange('branchCode')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Branch Code"
                  error={!!fieldErrors.branchCode}
                  helperText={fieldErrors.branchCode}
                  InputProps={{
                    ...params.InputProps,
                    style: { height: 40 }
                  }}
                />
              )}
            />
          </div>
        </div>
        {listView && (
          <div className="mt-4">
            <CommonReportTable data={rowData} columns={reportColumns} />
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default ReceiptRegister;

import { useEffect, useState } from 'react';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import CommonTable from 'views/basicMaster/CommonTable';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete, FormHelperText } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import CommonListViewTable from '../basicMaster/CommonListViewTable';

import axios from 'axios';
export const JobCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();
  const [data, setData] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [salesPerson, setSalesPerson] = useState([]);
  const [listView, setListView] = useState(false);
  const [allAccountName, setAllAccountName] = useState([]);
  const [docId, setDocId] = useState('');

  const [timer, setTimer] = useState(null);

  const [listViewData, setListViewData] = useState([]);

  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [detailsTableData, setDetailsTableData] = useState([{
    id: '',
    accountName: '',
    amount: ''
  }]);
  const [detailsTableErrors, setDetailsTableErrors] = useState([{
    id: '',
    accountName: '',
    amount: ''
  }]);
  const [formData, setFormData] = useState({
    customer: '',
    operationClosed: '',
    financeClosed: '',
    date: dayjs(),
    salesCategory: '',
    salesPerson: '',
    closedOn: null,
    closed: false,
    income: '',
    expense: '',
    profit: '',
    remarks: '',
    active: true
  })
  const [fieldErrors, setFieldErrors] = useState({
    customer: '',
    operationClosed: '',
    date: new Date(),
    financeClosed: '',
    salesPerson: '',
    closedOn: null,
    closed: false,
    income: '',
    expense: '',
    profit: '',
    remarks: ''
  })


  const listViewColumns = [
    { accessorKey: 'jobNo', header: 'DocId', size: 140 },
    { accessorKey: 'customer', header: 'Customer', size: 140 },
    { accessorKey: 'date', header: 'Data', size: 140 },
    { accessorKey: 'closedOn', header: 'ClosedOn', size: 140 }
  ];

  useEffect(() => {
    getAllJobCard();
    getAllAccountName();
  }, []);
  const getAllAccountName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getAccountNameFromGroup?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllAccountName(response.paramObjectsMap.generalJournalVO);
        console.log('Account Name', response.paramObjectsMap.generalJournalVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllJobCard = async () => {
    try {
      const response = await apiCalls('get', `transaction/getAllTmsJobCardByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.jobCardVO.reverse());
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const getAllTmsJobCardById = async (row) => {
    console.log('Row selected:', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/transaction/getAllTmsJobCardById?id=${row.original.id}`);
      if (result) {
        const jnVo = result.paramObjectsMap.jobCardVO[0];
        console.log('DataToEdit', jnVo);
        setEditId(row.original.id);
        // setDocId(jnVo.docId);
        getSalesPerson(jnVo.customer);
        setFormData({
          docId:jnVo.docId,
          customer: jnVo.customer || '',
          salesPerson: jnVo.salesPerson || '',
          date: jnVo.date ? dayjs(jnVo.date, 'YYYY-MM-DD') : dayjs(),
          income: jnVo.income || '',
          expense: jnVo.expense || '',
          profit: jnVo.profit || '',
          closed: jnVo.closedOn ? true : false,
          remarks: jnVo.remarks || '', 
          closedOn: jnVo.closedOn ? dayjs(jnVo.closedOn, 'YYYY-MM-DDTHH:mm:ss') : null,
          active: jnVo.active 
        });
        setDetailsTableData(
          jnVo.costCenterJobCardVO?.map((row) => ({
            id: row.id,
            accountName: row.accountName,
            amount: row.amount || 0,
          })) || []
        );
      } else {
        console.error('No data found for the selected ID');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    console.log('docId updated:', docId);
  }, [docId]);

  const handleClear = async () => {
    setFormData({
      customer: '',
      operationClosed: '',
      financeClosed: '',
      salesCategory: '',
      salesPerson: '',
      closed: false,
      income: '',
      expense: '',
      profit: '',
      remarks: '',
      date: dayjs(),
      closedOn: null,
    });

    setDetailsTableData([
      {
        id: 1,
        accountsName: '',
        amount: '',
      },
    ]);

    setFieldErrors({
      customer: '',
      operationClosed: '',
      financeClosed: '',
      closedOn: null,
      closed: false,
      income: '',
      expense: '',
      profit: '',
      remarks: '',
    });
    setDetailsTableErrors([{ accountName: '', amount: '' }]);
    setEditId('');

    // Ensure getTmsJobCardDocId updates docId
    try {
      await getTmsJobCardDocId();
      console.log('DocId updated after clearing form.');
    } catch (error) {
      console.error('Error updating docId on clear:', error);
    }

    getAllCustomers();
  };
  const handleList = () => {
    setShowForm(!showForm);
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.customer) {
      errors.customer = 'customer is required';
    }
    if (!formData.income) {
      errors.income = 'InCome is required';
    }
    if (!formData.expense) {
      errors.expense = 'Expense is required';
    }
    if (!formData.profit) {
      errors.profit = 'Profit is required';
    }
    // if (!formData.closedOn) {
    //   errors.closedOn = 'Closed On is required';
    // }
    if (!formData.remarks) {
      errors.remarks = 'Remarks is required';
    }


    let detailTableDataValid = true;
    const newTableErrors = detailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.accountName) {
        rowErrors.accountName = 'Account Name is required';
        detailTableDataValid = false;
      }
      if (!row.amount) {
        rowErrors.amount = 'Amount is required';
        detailTableDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors)

    setDetailsTableErrors(newTableErrors);


    if (Object.keys(errors).length === 0 && detailTableDataValid) {
      const glOpeningVO = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        accountName: row.accountName,
        amount: row.amount,
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active || false,
        customer: formData.customer || '',
        salesPerson: formData.salesPerson || '',
        salesCategory: formData.salesCategory || '',
        income: formData.income || 0,
        expense: formData.expense || 0,
        profit: formData.profit || 0,
        remarks: formData.remarks || '',
        closed: formData.closed,
        // closedOn: formData.closedOn,
        closedOn: formData.closedOn
          ? dayjs(formData.closedOn).format('YYYY-MM-DDTHH:mm:ss') // Format datetime
          : null,
        orgId: orgId,
        branch: branch,
        branchCode: branchCode,
        cancelRemarks: FormDataEvent.cancelRemarks || '',
        createdBy: loginUserName,
        finYear: finYear,
        financeClosed: FormDataEvent.financeClosed || false,
        operationClosed: FormDataEvent.operationClosed || false,
        costCenterTmsJobCardDTO: glOpeningVO,
      };


      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', `transaction/updateCreateTmsJobCard`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'Job Card Updated Successfully' : 'Job Card created successfully');
          handleClear();
          setIsLoading(false);
          getAllJobCard();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Job Card creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Job Card creation failed');
        setIsLoading(false);
      }

    } else {
      setFieldErrors(errors);
    }
  }





  const getAllJobCardById = async (row) => {
    console.log('first', row);
    setShowForm(true);

  };

  const handleCostTypeChange = (type) => {
    setFormData((prevData) => ({
      ...prevData,
      costType: type
    }));
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      costType: '' // Clear any errors for costType
    }));
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };



  useEffect(() => {
    getTmsJobCardDocId();
    getAllCustomers();
  }, []);

  const handleAddRow = () => {
    if (isLastRowEmpty(detailsTableData)) {
      displayRowError(detailsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      accountName: '',
      amount: '',
    };
    setDetailsTableData([...detailsTableData, newRow]);
    setDetailsTableErrors([...detailsTableErrors, { accountName: '', amount: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === detailsTableData) {
      return !lastRow.accountName || !lastRow.amount;
    }
    return false;
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    // If the row exists, proceed to delete
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const displayRowError = (table) => {
    if (table === detailsTableData) {
      setDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          accountName: !table[table.length - 1].accountName ? 'Value Code is required' : '',
          amount: !table[table.length - 1].amount ? 'Value Desc is required' : '',
        };
        return newErrors;
      });
    }
  };




  const getTmsJobCardDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `transaction/getTmsJobCardDocId?branchCode=${branchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.paramObjectsMap?.tmsJobCardDocId) {
        console.log('Fetched docId:', response.paramObjectsMap.tmsJobCardDocId);
        setDocId(response.paramObjectsMap.tmsJobCardDocId);
      } else {
        console.error('No docId found in response');
      }
    } catch (error) {
      console.error('Error fetching docId:', error);
    }
  };


  const getAllCustomers = async () => {
    try {
      const response = await apiCalls(
        'get', `/transaction/getAllCustomersFromPartyMaster?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setPartyList(response.paramObjectsMap.customer);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const getSalesPerson = async (customerName) => {
    try {
      const response = await apiCalls(
        'get', `/transaction/getSalesPersonFromPartyMaster?orgId=${orgId}&partyName=${customerName}`
      );
      console.log('API Response:', response);

      if (response.status === true) {
        setSalesPerson(response.paramObjectsMap.salesperson || []); // Make sure salesPerson is set to an array
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'income' || name === 'expense' || name === 'profit') {

      if (isNaN(value) || value === '') {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: 'Invalid format. Only numbers are allowed.',
        }));
        return;
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: '', // Clear error if input is valid
        }));
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'closed' && {
        closedOn: checked ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null,
      }),
    }));
  };



  // Date change handler for DatePicker
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prevData) => ({
      ...prevData,
      [field]: formattedDate,
    }));
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} margin="0 10px 0 10px" />
        </div>
        {showForm ? (
          <>
            <div className="row d-flex">
              <div className="col-md-3 mb-3">
                <TextField id="docId" label="Doc No" variant="outlined" size="small" fullWidth name="docId" value={docId} disabled />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={partyList.map((option, index) => ({ ...option, key: index }))}
                  getOptionLabel={(option) => option.partyname || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.customer ? partyList.find((c) => c.partyname === formData.customer) : null}
                  onChange={(event, newValue) => {
                    // Handle customer selection change
                    handleInputChange({
                      target: {
                        name: 'customer',
                        value: newValue ? newValue.partyname : '', // Adjusted to 'partyname'
                      }
                    });

                    // Call getSalesPerson with the selected customer
                    if (newValue) {
                      getSalesPerson(newValue.partyname); // Fetch sales persons based on customer name
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      name="customer"
                      error={!!fieldErrors.customer}
                      helperText={fieldErrors.customer}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.salesPerson}>
                  <InputLabel id="salesPerson">Sales Person</InputLabel>
                  <Select
                    labelId="salesPerson"
                    label="Sales Person"
                    value={formData.salesPerson}
                    onChange={handleInputChange}
                    name="salesPerson"
                  >
                    {salesPerson && salesPerson.length > 0 ? (
                      salesPerson.map((sales, index) => (
                        <MenuItem key={index} value={sales.salesperson}>{sales.salesperson}</MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>No sales person available</MenuItem>
                    )}
                  </Select>
                  {fieldErrors.salesPerson && <FormHelperText>{fieldErrors.salesPerson}</FormHelperText>}
                </FormControl>
              </div>


              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={formData.date ? dayjs(formData.date, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('date', date)}
                      disabled
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.adjustmentType}>
                  <InputLabel id="salesCategory">Sales Category</InputLabel>
                  <Select
                    labelId="AdjustmentType-label"
                    label="salesCategory"
                    value={formData.salesCategory}
                    onChange={handleInputChange}
                    name="salesCategory"
                    disabled
                  >
                    <MenuItem value="GENERAL">GENERAL</MenuItem>
                    <MenuItem value="EXPENSE">EXPENSE</MenuItem>
                  </Select>
                  {fieldErrors.adjustmentType && <FormHelperText>{fieldErrors.adjustmentType}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  id="income"
                  label="Income"
                  placeholder="Income"
                  variant="outlined"
                  size="small"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.income}
                  helperText={fieldErrors.income}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="expense"
                  label="Expense"
                  placeholder="Expense"
                  variant="outlined"
                  size="small"
                  name="expense"
                  value={formData.expense}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.expense}
                  helperText={fieldErrors.expense}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="profit"
                  label="Profit"
                  placeholder="Profit"
                  variant="outlined"
                  size="small"
                  name="profit"
                  value={formData.profit}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.profit}
                  helperText={fieldErrors.profit}
                />
              </div>

              <div className="col-md-8 mb-3">
                <div className="d-flex flex-row">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.costType === 'Regular'}
                        onChange={(e) => handleCostTypeChange('Regular')}
                        name="Regular"
                        color="primary"
                        disabled
                      />
                    }
                    label="OperationClosed"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.costType === 'Accrual'}
                        onChange={(e) => handleCostTypeChange('Accrual')}
                        name="Accrual"
                        color="primary"
                        disabled
                      />
                    }
                    label="FinanceClosed"
                  />

                </div>
              </div>

            </div>

            <div className="row d-flex">
              {/* Always show DateTimePicker */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="ClosedOn"
                      value={formData.closedOn ? dayjs(formData.closedOn) : null}
                      onChange={(date) =>
                        setFormData((prevData) => ({
                          ...prevData,
                          closedOn: date ? date.format('YYYY-MM-DD HH:mm:ss') : null,
                        }))
                      }
                      slotProps={{
                        textField: { size: 'small', clearable: true },
                      }}
                      format="DD-MM-YYYY HH:mm:ss" // Format with date and time
                      disabled
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Checkbox to set 'closed' state */}
              <div className="col-md-2 mb-3 ml-4">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.closed}
                        onChange={handleInputChange}
                        name="closed"
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Closed"
                  />
                </FormGroup>
              </div>
              <div className="col-md-3 mb-3"   style={{ margin: '0 -50px', }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>

            <div className="row d-flex">
              <div className="col-md-8">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="remarks"
                    label="Remarks"
                    size="small"
                    name="remarks"
                    value={formData.remarks}
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 30 }}
                    onChange={handleInputChange}
                    error={!!fieldErrors.remarks}
                    helperText={fieldErrors.remarks}
                  />
                </FormControl>
              </div>

            </div>

            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="Cost Center" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-7">
                          <div className="table-responsive">
                            <table className="table table-bordered ">
                              <thead>
                                <tr style={{ backgroundColor: '#673AB7' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    S.No
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                    Acount Name
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                    Amount
                                  </th>

                                </tr>
                              </thead>
                              <tbody>
                                {detailsTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(
                                            row.id,
                                            detailsTableData,
                                            setDetailsTableData,
                                            detailsTableErrors,
                                            setDetailsTableErrors
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>
                                    {/* <td className="border px-2 py-2">
                                      <Autocomplete
                                        disablePortal
                                        options={allAccountName}
                                        getOptionLabel={(option) => option.accountName}
                                        size="small"
                                        value={row.accountName ? allAccountName.find((a) => a.accountName === row.accountName) : null}
                                        onChange={(event, newValue) => {
                                          const value = newValue ? newValue.accountName : '';
                                          setDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, accountName: value } : r))
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="Account Name"
                                            variant="outlined"
                                            error={!!detailsTableErrors[index]?.accountName}
                                            helperText={detailsTableErrors[index]?.accountName}
                                            InputProps={{
                                              ...params.InputProps,
                                              className: detailsTableErrors[index]?.accountName ? 'error form-control' : 'form-control',
                                              style: { background: 'white' }
                                            }}
                                          />
                                        )}
                                      />
                                    </td> */}

                                    <td>
                                      <Autocomplete
                                        options={allAccountName}
                                        getOptionLabel={(option) => option.accountName || ''}
                                        groupBy={(option) => (option.accountName ? option.accountName[0].toUpperCase() : '')}
                                        value={row.accountName ? allAccountName.find((a) => a.accountName === row.accountName) : null}
                                        onChange={(event, newValue) => {
                                          const value = newValue ? newValue.accountName : '';
                                          setDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, accountName: value } : r))
                                          );
                                          setDetailsTableErrors((prevErrors) =>
                                            prevErrors.map((err, idx) => (idx === index ? { ...err, accountName: '' } : err))
                                          );
                                        }}
                                        size="small"
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="Account Name"
                                            variant="outlined"
                                            error={!!detailsTableErrors[index]?.accountName}
                                            helperText={detailsTableErrors[index]?.accountName}
                                          />
                                        )}
                                        sx={{ width: 250 }}
                                      />
                                    </td>


                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.amount}
                                        onChange={(e) => {
                                          const value = e.target.value;

                                          // Allow only numeric input (digits only)
                                          if (/^\d*\.?\d*$/.test(value)) {
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, amount: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                amount: !value ? 'Amount is required' : '',
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={detailsTableErrors[index]?.amount ? 'error form-control' : 'form-control'}
                                      />
                                      {detailsTableErrors[index]?.amount && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {detailsTableErrors[index].amount}
                                        </div>
                                      )}
                                    </td>


                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        ) : (
          <CommonTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getAllTmsJobCardById} />
        )}
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  )
};
export default JobCard;
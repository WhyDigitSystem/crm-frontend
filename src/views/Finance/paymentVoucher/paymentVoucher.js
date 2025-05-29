import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import apiCalls from 'apicall';
import { getAllActiveCurrency } from 'utils/CommonFunctions';

const PaymentVoucher = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [accountNames, setAccountNames] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    currency: 'INR',
    chequeBank: '',
    chequeDate: null,
    chequeNo: '',
    docDate: dayjs(),
    docId: '',
    exRate: 1,
    orgId: orgId,
    referenceDate: null,
    referenceNo: '',
    remarks: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0,
    vehicleSubType: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    currency: '',
    chequeBank: '',
    chequeDate: null,
    chequeNo: '',
    docDate: new Date(),
    exRate: '',
    orgId: orgId,
    referenceDate: null,
    referenceNo: '',
    remarks: '',
    suppRefNo: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0
  });

  const listViewColumns = [
    { accessorKey: 'docId', header: 'Document Id', size: 140 },
    { accessorKey: 'vehicleSubType', header: 'Vehicle Sub Type', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    { accessorKey: 'exRate', header: 'Ex.Rate', size: 140 },
    { accessorKey: 'referenceNo', header: 'Ref No', size: 140 }
  ];

  const [detailsTableData, setDetailsTableData] = useState([
    {
      id: 1,
      accountName: '',
      credit: '',
      debit: '',
      narration: '',
      subLedgerCode: '',
      subLedgerName: ''
    }
  ]);
  const [detailsTableErrors, setDetailsTableErrors] = useState([
    {
      accountName: '',
      credit: '',
      debit: '',
      narration: '',
      subLedgerCode: '',
      subLedgerName: ''
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currencyData = await getAllActiveCurrency(orgId);
        setCurrencies(currencyData);
        console.log('currency', currencyData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    fetchData();
    getAllPaymentVoucherByOrgId();
    getPaymentVoucherDocId();
    getAccountNameFromGroup();
  }, []);

  useEffect(() => {
    const totalDebit = detailsTableData.reduce((sum, row) => sum + Number(row.debit || 0), 0);
    const totalCredit = detailsTableData.reduce((sum, row) => sum + Number(row.credit || 0), 0);

    setFormData((prev) => ({
      ...prev,
      totalDebitAmount: totalDebit,
      totalCreditAmount: totalCredit
    }));
  }, [detailsTableData]);

  const getAllPaymentVoucherByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllPaymentVoucherByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.paymentVoucherVO || []);
      // showForm(true);
      console.log('paymentVoucherVO', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getPaymentVoucherDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getpaymentVoucherDocId?branchCode=${branchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.paymentVoucherDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAllPaymentVoucherById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/transaction/getAllPaymentVoucherById?id=${row.original.id}`);

      if (result) {
        const paymentVO = result.paramObjectsMap.paymentVoucherVO[0];
        setEditId(row.original.id);

        setFormData({
          vehicleSubType: paymentVO.vehicleSubType || '',
          id: paymentVO.id || '',
          docDate: paymentVO.docDate ? dayjs(paymentVO.docDate, 'YYYY-MM-DD') : dayjs(),
          docId: paymentVO.docId || '',
          chequeBank: paymentVO.chequeBank || '',
          chequeDate: paymentVO.chequeDate ? dayjs(paymentVO.chequeDate, 'YYYY-MM-DD') : dayjs(),
          chequeNo: paymentVO.chequeNo || '',
          currency: paymentVO.currency || '',
          exRate: paymentVO.exRate || '',
          referenceNo: paymentVO.referenceNo || '',
          referenceDate: paymentVO.referenceDate ? dayjs(paymentVO.referenceDate, 'YYYY-MM-DD') : dayjs(),
          remarks: paymentVO.remarks || '',
          orgId: paymentVO.orgId || '',
          totalDebitAmount: paymentVO.totalDebitAmount || '',
          totalCreditAmount: paymentVO.totalCreditAmount || ''
          // active: paymentVO.active || false,
        });
        setDetailsTableData(
          paymentVO.particularsPaymentVoucherVO.map((row) => ({
            id: row.id,
            accountName: row.accountName,
            credit: row.credit,
            debit: row.debit,
            narration: row.narration,
            subLedgerCode: row.subLedgerCode,
            subLedgerName: row.subLedgerName
          }))
        );

        console.log('DataToEdit', paymentVO);
      } else {
        // Handle erro
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAccountNameFromGroup = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getAccountNameFromGroup?orgId=${orgId}`);
      setAccountNames(response.paramObjectsMap.generalJournalVO);
      console.log('generalJournalVO', response.paramObjectsMap.generalJournalVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const handleDebitChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, debit: value, credit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          debit: !value ? 'Debit Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleCreditChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, credit: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          credit: !value ? 'Credit Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });

      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Preserve the cursor position for text-based inputs
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement && inputElement.setSelectionRange) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date);
    console.log('formattedDate', formattedDate);
    // const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const handleClear = () => {
    setFormData({
      chequeBank: '',
      chequeDate: null,
      chequeNo: '',
      docDate: dayjs(),
      exRate: '',
      orgId: orgId,
      referenceDate: null,
      referenceNo: '',
      remarks: '',
      totalCreditAmount: 0,
      totalDebitAmount: 0,
      vehicleSubType: ''
    });
    getAllActiveCurrency(orgId);
    setFieldErrors({
      chequeBank: '',
      chequeDate: null,
      chequeNo: '',
      currency: 'INR',
      docDate: null,
      exRate: 1,
      orgId: orgId,
      referenceDate: '',
      referenceNo: '',
      remarks: '',
      vehicleSubType: ''
    });
    setDetailsTableData([{ id: 1, accountName: '', subLedgerCode: '', narration: '', subLedgerName: '' }]);
    setDetailsTableErrors('');
    setEditId('');
    getPaymentVoucherDocId();
  };

  // const handleKeyDown = (e, row, table) => {
  //   if (e.key === 'Tab' && row.id === table[table.length - 1].id) {
  //     e.preventDefault();
  //     if (isLastRowEmpty(table)) {
  //       displayRowError(table);
  //     } else {
  //       if (table === roleTableData) handleAddRow();
  //       // else handleAddRow1();
  //     }
  //   }
  // };

  const handleAddRow = () => {
    if (isLastRowEmpty(detailsTableData)) {
      displayRowError(detailsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      accountName: '',
      subLedgerCode: '',
      // debit: '',
      // credit: '',
      narration: '',
      subLedgerName: ''
    };
    setDetailsTableData([...detailsTableData, newRow]);
    setDetailsTableErrors([
      ...detailsTableErrors,
      { accountName: '', subLedgerCode: '', debit: '', credit: '', narration: '', subLedgerName: '' }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === detailsTableData) {
      return !lastRow.accountName || !lastRow.narration || !lastRow.subLedgerCode || !lastRow.subLedgerName;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === detailsTableData) {
      setDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          accountName: !table[table.length - 1].accountName ? 'Account Name is required' : '',
          // credit: !table[table.length - 1].credit ? 'Credit is required' : '',
          // debit: !table[table.length - 1].debit ? 'Debit is required' : '',
          narration: !table[table.length - 1].narration ? 'Narration is required' : '',
          subLedgerCode: !table[table.length - 1].subLedgerCode ? 'Sub Ledger Code is required' : '',
          subLedgerName: !table[table.length - 1].subLedgerName ? 'Sub Ledger Name is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const handleView = () => {
    setShowForm(!showForm);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'Ex Rate is required';
    }
    if (!formData.referenceNo) {
      errors.referenceNo = 'Ref No is required';
    }
    if (!formData.referenceDate) {
      errors.referenceDate = 'Ref Date is required';
    }
    if (!formData.vehicleSubType) {
      errors.vehicleSubType = 'Vehicle Sub Type is required';
    }
    if (!formData.chequeNo) {
      errors.chequeNo = 'Cheque No is required';
    }
    if (!formData.chequeDate) {
      errors.chequeDate = 'Cheque Date is required';
    }
    if (!formData.chequeBank) {
      errors.chequeBank = 'Cheque Bank is required';
    }

    let detailTableDataValid = true;
    const newTableErrors = detailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.accountName) {
        rowErrors.accountName = 'Account Name is required';
        detailTableDataValid = false;
      }
      if (!row.credit) {
        rowErrors.credit = 'Credit is required';
        detailTableDataValid = false;
      }
      if (!row.debit) {
        rowErrors.debit = 'Debit is required';
        detailTableDataValid = false;
      }
      if (!row.narration) {
        rowErrors.narration = 'Narration is required';
        detailTableDataValid = false;
      }
      if (!row.subLedgerCode) {
        rowErrors.subLedgerCode = 'Sub Ledger Code is required';
        detailTableDataValid = false;
      }
      if (!row.subLedgerName) {
        rowErrors.subLedgerName = 'Sub Ledger Name is required';
        detailTableDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors);

    setDetailsTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && detailTableDataValid) {
      const paymentVoucherVO = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        accountName: row.accountName,
        credit: row.credit,
        debit: row.debit,
        narration: row.narration,
        subLedgerCode: row.subLedgerCode,
        subLedgerName: row.subLedgerName
      }));
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branch: branch,
        branchCode: branchCode,
        chequeBank: formData.chequeBank,
        chequeDate: dayjs(formData.chequeDate).format('YYYY-MM-DD'),
        chequeNo: formData.chequeNo,
        createdBy: loginUserName,
        currency: formData.currency,
        exRate: formData.exRate,
        finyear: finYear,
        orgId: orgId,
        particularsPaymentVoucherDTO: paymentVoucherVO,
        referenceDate: dayjs(formData.referenceDate).format('YYYY-MM-DD'),
        referenceNo: formData.referenceNo,
        remarks: formData.remarks,
        totalCreditAmount: formData.totalCreditAmount,
        totalDebitAmount: formData.totalDebitAmount,
        vehicleSubType: formData.vehicleSubType
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/transaction/updateCreatePaymentVoucher`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Payment Voucher Updated Successfully' : 'Payment Voucher Created successfully');
          getAllPaymentVoucherByOrgId();
          handleClear();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Payment Voucher creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Payment Voucher creation failed');
      }
    } else {
      setFieldErrors(errors);
    }
  };

  return (
    <>
      <div>
        <ToastComponent />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
          </div>

          {showForm ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Document Id"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="docId"
                    value={formData.docId}
                    onChange={handleInputChange}
                    disabled
                    inputProps={{ maxLength: 10 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Document Date"
                        value={formData.docDate}
                        onChange={(date) => handleDateChange('docDate', date)}
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
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.vehicleSubType}>
                    <InputLabel id="vehicleSubType-label">Vehicle Sub Type</InputLabel>
                    <Select
                      labelId="vehicleSubType-label"
                      label="Vehicle Sub Type"
                      value={formData.vehicleSubType}
                      onChange={handleInputChange}
                      name="vehicleSubType"
                    >
                      <MenuItem value="VEHICLESUBTYPE1">VEHICLESUBTYPE1</MenuItem>
                      <MenuItem value="VEHICLESUBTYPE2">VEHICLESUBTYPE2</MenuItem>
                    </Select>
                    {fieldErrors.vehicleSubType && <FormHelperText>{fieldErrors.vehicleSubType}</FormHelperText>}
                  </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                    <InputLabel id="demo-simple-select-label">
                      {
                        <span>
                          Currency <span className="asterisk">*</span>
                        </span>
                      }
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Currency"
                      onChange={handleInputChange}
                      name="currency"
                      disabled
                      value={formData.currency}
                    >
                      {currencies.map((item) => (
                        <MenuItem key={item.id} value={item.currency}>
                          {item.currency}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.currency && <FormHelperText style={{ color: 'red' }}>Currency is required</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label={
                      <span>
                        Ex. Rate <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    type="number"
                    fullWidth
                    name="exRate"
                    disabled
                    value={formData.exRate}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.exRate ? 'Ex. Rate is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label={
                      <span>
                        Reference No <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="referenceNo"
                    value={formData.referenceNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.referenceNo ? 'Ref No is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Reference Date"
                        value={formData.referenceDate}
                        onChange={(date) => handleDateChange('referenceDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {fieldErrors.referenceDate && <p className="dateErrMsg">Ref Date is required</p>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label={
                      <span>
                        Cheque No <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="chequeNo"
                    value={formData.chequeNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.chequeNo ? 'Cheque No is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Cheque Date"
                        value={formData.chequeDate}
                        onChange={(date) => handleDateChange('chequeDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {fieldErrors.chequeDate && <p className="dateErrMsg">Cheque Date is required</p>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label={
                      <span>
                        Cheque Bank <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="chequeBank"
                    value={formData.chequeBank}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.chequeBank ? 'Cheque Bank is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
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
                    <Tab value={0} label="Account Particulars" />
                    <Tab value={1} label="Total Summary" />
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
                          <div className="col-lg-12">
                            <div className="table-responsive">
                              <table className="table table-bordered ">
                                <thead>
                                  <tr style={{ backgroundColor: '#673AB7' }}>
                                    <th className="table-header">Action</th>
                                    <th className="table-header">S.No</th>
                                    <th className="table-header">Account Name</th>
                                    <th className="table-header">Sub Ledger Name</th>
                                    <th className="table-header">Sub Ledger Code</th>
                                    <th className="table-header">Debit</th>
                                    <th className="table-header">Credit</th>
                                    <th className="table-header">Narration</th>
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
                                      <td className="border px-2 py-2">
                                        <select
                                          value={row.accountName}
                                          style={{ width: '150px' }}
                                          className={detailsTableErrors[index]?.accountName ? 'error form-control' : 'form-control'}
                                          onChange={(e) =>
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, accountName: e.target.value } : r))
                                            )
                                          }
                                        >
                                          <option value="">-- Select --</option>
                                          {accountNames.map((item) => (
                                            <option key={item.id} value={item.accountName}>
                                              {item.accountName}
                                            </option>
                                          ))}
                                        </select>
                                        {detailsTableErrors[index]?.accountName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].accountName}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.subLedgerName}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, subLedgerName: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                subLedgerName: !value ? 'Sub Ledger Name is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.subLedgerName ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.subLedgerName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].subLedgerName}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.subLedgerCode}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, subLedgerCode: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                subLedgerCode: !value ? 'Sub Ledger Code is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.subLedgerCode ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.subLedgerCode && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].subLedgerCode}
                                          </div>
                                        )}
                                      </td>
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="number"
                                          value={row.debit}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, debit: value } : r)));
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                debit: !value ? 'Debit is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.debit ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.debit && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].debit}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="number"
                                          value={row.credit}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, credit: value } : r)));
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                credit: !value ? 'Credit is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.credit ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.credit && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].credit}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.debit}
                                          onChange={(e) => handleDebitChange(e, row, index)}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.debit ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.debit && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].debit}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.credit}
                                          onChange={(e) => handleCreditChange(e, row, index)}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.credit ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.credit && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].credit}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.narration}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, narration: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                narration: !value ? 'Narration is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.narration ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.narration && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].narration}
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
                  {value === 1 && (
                    <>
                      <div className="row mt-2">
                        <div className="col-md-3 mb-3">
                          <TextField
                            id="outlined-textarea-zip"
                            label="Total Debit Amount"
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="totalDebitAmount"
                            value={formData.totalDebitAmount}
                            onChange={handleInputChange}
                            disabled
                            helperText={
                              <span style={{ color: 'red' }}>{fieldErrors.totalDebitAmount ? 'Total Debit Amount is required' : ''}</span>
                            }
                            inputProps={{ maxLength: 40 }}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <TextField
                            id="outlined-textarea-zip"
                            label="Total Credit Amount"
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="totalCreditAmount"
                            value={formData.totalCreditAmount}
                            onChange={handleInputChange}
                            disabled
                            helperText={
                              <span style={{ color: 'red' }}>{fieldErrors.totalCreditAmount ? 'Total Credit Amount is required' : ''}</span>
                            }
                            inputProps={{ maxLength: 40 }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </Box>
              </div>
            </>
          ) : (
            <CommonTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getAllPaymentVoucherById} />
          )}
        </div>
      </div>
    </>
  );
};
export default PaymentVoucher;

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

const GeneralJournal = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [accountNames, setAccountNames] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    currency: '',
    docDate: dayjs(),
    docId: '',
    exRate: '',
    orgId: orgId,
    refDate: null,
    refNo: '',
    remarks: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0,
    voucherSubType: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    currency: '',
    docDate: new Date(),
    exRate: '',
    orgId: orgId,
    refDate: null,
    refNo: '',
    remarks: '',
    suppRefNo: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0
  });

  const listViewColumns = [
    { accessorKey: 'voucherSubType', header: 'Voucher Sub Type', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    { accessorKey: 'exRate', header: 'Ex.Rate', size: 140 },
    { accessorKey: 'refNo', header: 'Ref No', size: 140 },
    { accessorKey: 'docId', header: 'Document Id', size: 140 }
  ];

  const [detailsTableData, setDetailsTableData] = useState([
    {
      id: 1,
      accountsName: '',
      creditAmount: '',
      debitAmount: '',
      narration: '',
      subLedgerCode: '',
      subledgerName: ''
    }
  ]);
  const [detailsTableErrors, setDetailsTableErrors] = useState([
    {
      accountsName: '',
      creditAmount: '',
      debitAmount: '',
      narration: '',
      subLedgerCode: '',
      subledgerName: ''
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
    getGeneralJournalDocId();
    getAllGeneralJournalByOrgId();
    getAccountNameFromGroup();
  }, []);

  useEffect(() => {
    const totalDebit = detailsTableData.reduce((sum, row) => sum + Number(row.debitAmount || 0), 0);
    const totalCredit = detailsTableData.reduce((sum, row) => sum + Number(row.creditAmount || 0), 0);

    setFormData((prev) => ({
      ...prev,
      totalDebitAmount: totalDebit,
      totalCreditAmount: totalCredit
    }));
  }, [detailsTableData]);

  const getGeneralJournalDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getGeneralJournalDocId?branchCode=${branchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.generalJournalDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAllGeneralJournalByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllGeneralJournalByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.generalJournalVO || []);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getGeneralJournalById = async (row) => {
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/transaction/getGeneralJournalById?id=${row.original.id}`);

      if (result) {
        const glVO = result.paramObjectsMap.generalJournalVO[0];
        setEditId(row.original.id);

        setFormData({
          voucherSubType: glVO.voucherSubType || '',
          id: glVO.id || '',
          docDate: glVO.docDate ? dayjs(glVO.docDate, 'YYYY-MM-DD') : dayjs(),
          docId: glVO.docId || '',
          currency: glVO.currency || '',
          exRate: glVO.exRate || '',
          refNo: glVO.refNo || '',
          refDate: glVO.refDate ? dayjs(glVO.refDate, 'YYYY-MM-DD') : dayjs(),
          remarks: glVO.remarks || '',
          orgId: glVO.orgId || '',
          totalDebitAmount: glVO.totalDebitAmount || '',
          totalCreditAmount: glVO.totalCreditAmount || ''
          // active: glVO.active || false,
        });
        setDetailsTableData(
          glVO.particularsJournalVO.map((row) => ({
            id: row.id,
            accountsName: row.accountsName,
            creditAmount: row.creditAmount,
            debitAmount: row.debitAmount,
            narration: row.narration,
            subLedgerCode: row.subLedgerCode,
            subledgerName: row.subledgerName
          }))
        );

        console.log('DataToEdit', glVO);
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
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, debitAmount: value, creditAmount: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          debitAmount: !value ? 'Debit Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleCreditChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, creditAmount: value, debitAmount: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          creditAmount: !value ? 'Credit Amount is required' : ''
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
      docDate: dayjs(),
      exRate: '',
      orgId: orgId,
      refDate: null,
      refNo: '',
      remarks: '',
      totalCreditAmount: 0,
      totalDebitAmount: 0,
      voucherSubType: ''
    });
    getAllActiveCurrency(orgId);
    setFieldErrors({
      currency: '',
      docDate: null,
      exRate: '',
      orgId: orgId,
      refDate: '',
      refNo: '',
      remarks: '',
      voucherSubType: ''
    });
    setDetailsTableData([
      { id: 1, accountsName: '', subLedgerCode: '', debitAmount: '', creditAmount: '', narration: '', subledgerName: '' }
    ]);
    setDetailsTableErrors('');
    setEditId('');
    getGeneralJournalDocId();
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
      accountsName: '',
      subLedgerCode: '',
      debitAmount: '',
      creditAmount: '',
      narration: '',
      subledgerName: ''
    };
    setDetailsTableData([...detailsTableData, newRow]);
    setDetailsTableErrors([...detailsTableErrors, { accountsName: '', subLedgerCode: '', narration: '', subledgerName: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === detailsTableData) {
      return (
        !lastRow.accountsName ||
        // !lastRow.creditAmount ||
        // !lastRow.debitAmount ||
        !lastRow.narration ||
        !lastRow.subLedgerCode ||
        !lastRow.subledgerName
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === detailsTableData) {
      setDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          accountsName: !table[table.length - 1].accountsName ? 'Account Name is required' : '',
          // creditAmount: !table[table.length - 1].creditAmount ? 'Credit is required' : '',
          // debitAmount: !table[table.length - 1].debitAmount ? 'Debit is required' : '',
          narration: !table[table.length - 1].narration ? 'Narration is required' : '',
          subLedgerCode: !table[table.length - 1].subLedgerCode ? 'Sub Ledger Code is required' : '',
          subledgerName: !table[table.length - 1].subledgerName ? 'Sub Ledger Name is required' : ''
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
    if (!formData.refNo) {
      errors.refNo = 'Ref No is required';
    }
    if (!formData.refDate) {
      errors.refDate = 'Ref Date is required';
    }
    if (!formData.voucherSubType) {
      errors.voucherSubType = 'Voucher Sub Type is required';
    }

    let detailTableDataValid = true;
    const newTableErrors = detailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.accountsName) {
        rowErrors.accountsName = 'Account Name is required';
        detailTableDataValid = false;
      }
      if (!row.creditAmount) {
        rowErrors.creditAmount = 'Credit is required';
        detailTableDataValid = false;
      }
      if (!row.debitAmount) {
        rowErrors.debitAmount = 'Debit is required';
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
      if (!row.subledgerName) {
        rowErrors.subledgerName = 'Sub Ledger Name is required';
        detailTableDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors);

    setDetailsTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && detailTableDataValid) {
      const GeneralJournalVO = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        accountsName: row.accountsName,
        creditAmount: row.creditAmount,
        debitAmount: row.debitAmount,
        narration: row.narration,
        subLedgerCode: row.subLedgerCode,
        subledgerName: row.subledgerName
      }));
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        currency: formData.currency,
        exRate: formData.exRate,
        finYear: finYear,
        orgId: orgId,
        particularsJournalDTO: GeneralJournalVO,
        refDate: dayjs(formData.refDate).format('YYYY-MM-DD'),
        refNo: formData.refNo,
        remarks: formData.remarks,
        totalCreditAmount: formData.totalCreditAmount,
        totalDebitAmount: formData.totalDebitAmount,
        voucherSubType: formData.voucherSubType
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/transaction/updateCreateGeneralJournal`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'General Journal Updated Successfully' : 'General Journal Created successfully');
          getAllGeneralJournalByOrgId();
          handleClear();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'General Journal creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'General Journal creation failed');
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
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.voucherSubType}>
                    <InputLabel id="voucherSubType-label">Voucher Sub Type</InputLabel>
                    <Select
                      labelId="voucherSubType-label"
                      label="Voucher Sub Type"
                      value={formData.voucherSubType}
                      onChange={handleInputChange}
                      name="voucherSubType"
                    >
                      <MenuItem value="GENERAL">GENERAL</MenuItem>
                      <MenuItem value="EXPENSE">EXPENSE</MenuItem>
                    </Select>
                    {fieldErrors.voucherSubType && <FormHelperText>{fieldErrors.voucherSubType}</FormHelperText>}
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
                    fullWidth
                    name="exRate"
                    type="number"
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
                    name="refNo"
                    value={formData.refNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.refNo ? 'Ref No is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Reference Date"
                        value={formData.refDate}
                        onChange={(date) => handleDateChange('refDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {fieldErrors.refDate && <p className="dateErrMsg">Ref Date is required</p>}
                  </FormControl>
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
                                          value={row.accountsName}
                                          style={{ width: '150px' }}
                                          className={detailsTableErrors[index]?.accountsName ? 'error form-control' : 'form-control'}
                                          onChange={(e) =>
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, accountsName: e.target.value } : r))
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
                                        {detailsTableErrors[index]?.accountsName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].accountsName}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.subledgerName}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, subledgerName: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                subledgerName: !value ? 'Sub Ledger Name is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.subledgerName ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.subledgerName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].subledgerName}
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
                                          type="text"
                                          value={row.debitAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d{0,20}$/.test(value)) {
                                              setDetailsTableData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, debitAmount: value } : r))
                                              );

                                              setDetailsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  debitAmount: !value ? 'Debit Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.debitAmount ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.debitAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].debitAmount}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.creditAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d{0,20}$/.test(value)) {
                                              setDetailsTableData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, creditAmount: value } : r))
                                              );

                                              setDetailsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  creditAmount: !value ? 'Credit Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.creditAmount ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.creditAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].creditAmount}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.debitAmount}
                                          onChange={(e) => handleDebitChange(e, row, index)}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.debitAmount ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.debitAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].debitAmount}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.creditAmount}
                                          onChange={(e) => handleCreditChange(e, row, index)}
                                          maxLength="20"
                                          className={detailsTableErrors[index]?.creditAmount ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.creditAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].creditAmount}
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
            <CommonTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getGeneralJournalById} />
          )}
        </div>
      </div>
    </>
  );
};
export default GeneralJournal;

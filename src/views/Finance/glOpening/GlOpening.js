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
import { getAllActiveBranches, getAllActiveCurrency } from 'utils/CommonFunctions';

const GlOpening = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branchList, setBranchList] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    branch: '',
    currency: '',
    docDate: dayjs(),
    docId: '24GL0002', //It's hard coded
    exRate: '',
    orgId: orgId,
    refDate: null,
    refNo: '',
    remarks: '',
    suppRefDate: null,
    suppRefNo: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0
  });

  const [fieldErrors, setFieldErrors] = useState({
    branch: '',
    currency: '',
    docDate: new Date(),
    // docId: '24GL0001',
    exRate: '',
    orgId: orgId,
    refDate: null,
    refNo: '',
    remarks: '',
    suppRefDate: null,
    suppRefNo: '',
    totalCreditAmount: 0,
    totalDebitAmount: 0
  });

  const listViewColumns = [
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    { accessorKey: 'exRate', header: 'Ex.Rate', size: 140 },
    { accessorKey: 'refNo', header: 'Ref No', size: 140 },
    { accessorKey: 'docId', header: 'Document Id', size: 140 }
  ];

  const [detailsTableData, setDetailsTableData] = useState([
    {
      id: 1,
      accountName: '',
      subLedgerCode: '',
      debitAmount: '',
      creditAmount: '',
      debitBase: '',
      creditBase: ''
    }
  ]);
  const [detailsTableErrors, setDetailsTableErrors] = useState([
    {
      accountName: '',
      subLedgerCode: '',
      debitAmount: '',
      creditAmount: '',
      debitBase: '',
      creditBase: ''
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
    getAllBranches();
    getAllGlOpeningBalanceByOrgId();
  }, []);

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  const getAllGlOpeningBalanceByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllGlOpeningBalanceByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.GlOpeningBalanceVO || []);
      showForm(true);
      console.log('GlOpeningBalanceVO', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllGlOpeningBalanceById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/transaction/getAllGlOpeningBalanceById?id=${row.original.id}`);

      if (result) {
        const glVO = result.paramObjectsMap.glOpeningBalanceVO[0];
        setEditId(row.original.id);

        setFormData({
          branch: glVO.branch || '',
          listDescription: glVO.listDescription || '',
          id: glVO.id || '',
          docDate: glVO.docDate || '',
          docId: glVO.docId || '',
          currency: glVO.currency || '',
          exRate: glVO.exRate || '',
          refNo: glVO.refNo || '',
          refDate: glVO.refDate || '',
          suppRefNo: glVO.suppRefNo || '',
          suppRefDate: glVO.suppRefDate || '',
          remarks: glVO.remarks || '',
          orgId: glVO.orgId || '',
          totalDebitAmount: glVO.totalDebitAmount || '',
          totalCreditAmount: glVO.totalCreditAmount || ''
          // active: glVO.active || false,
        });
        setDetailsTableData(
          glVO.particularsGlOpeningBalanceVO.map((row) => ({
            id: row.id,
            accountName: row.accountName,
            subLedgerCode: row.subLedgerCode,
            debitAmount: row.debitAmount,
            creditAmount: row.creditAmount,
            debitBase: row.debitBase,
            creditBase: row.creditBase
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
      branch: '',
      currency: '',
      docDate: dayjs(),
      docId: '24GL0002', //It's hard coded
      exRate: '',
      orgId: orgId,
      refDate: null,
      refNo: '',
      remarks: '',
      suppRefDate: null,
      suppRefNo: '',
      totalCreditAmount: 0,
      totalDebitAmount: 0
    });
    setFieldErrors({
      branch: '',
      currency: '',
      docDate: null,
      // docId: '24GL0001',
      exRate: '',
      orgId: orgId,
      refDate: '',
      refNo: '',
      remarks: '',
      suppRefDate: '',
      suppRefNo: ''
    });
    setDetailsTableData([{ id: 1, accountName: '', subLedgerCode: '', debitAmount: '', creditAmount: '', debitBase: '', creditBase: '' }]);
    setDetailsTableErrors('');
    setEditId('');
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
      debitAmount: '',
      creditAmount: '',
      debitBase: '',
      creditBase: ''
    };
    setDetailsTableData([...detailsTableData, newRow]);
    setDetailsTableErrors([
      ...detailsTableErrors,
      { accountName: '', subLedgerCode: '', debitAmount: '', creditAmount: '', debitBase: '', creditBase: '' }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === detailsTableData) {
      return (
        !lastRow.accountName ||
        !lastRow.creditAmount ||
        !lastRow.creditBase ||
        !lastRow.debitAmount ||
        !lastRow.debitBase ||
        !lastRow.subLedgerCode
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
          accountName: !table[table.length - 1].accountName ? 'Account Name is required' : '',
          creditAmount: !table[table.length - 1].creditAmount ? 'Credit Amount is required' : '',
          creditBase: !table[table.length - 1].creditBase ? 'Credit Base is required' : '',
          debitAmount: !table[table.length - 1].debitAmount ? 'Debit Amount is required' : '',
          debitBase: !table[table.length - 1].debitBase ? 'Debit Base is required' : '',
          subLedgerCode: !table[table.length - 1].subLedgerCode ? 'Sub Ledger Code is required' : ''
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
    if (!formData.branch) {
      errors.branch = 'Branch is required';
    }
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
    if (!formData.suppRefNo) {
      errors.suppRefNo = 'Supp. Ref No is required';
    }
    if (!formData.suppRefDate) {
      errors.suppRefDate = 'Supp. Ref Date is required';
    }

    let detailTableDataValid = true;
    const newTableErrors = detailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.accountName) {
        rowErrors.accountName = 'Account Name is required';
        detailTableDataValid = false;
      }
      if (!row.subLedgerCode) {
        rowErrors.subLedgerCode = 'Sub Ledger Code is required';
        detailTableDataValid = false;
      }
      if (!row.debitAmount) {
        rowErrors.debitAmount = 'Debit Account is required';
        detailTableDataValid = false;
      }
      if (!row.creditAmount) {
        rowErrors.creditAmount = 'Credit Account is required';
        detailTableDataValid = false;
      }
      if (!row.debitBase) {
        rowErrors.debitBase = 'Debit Base is required';
        detailTableDataValid = false;
      }
      if (!row.creditBase) {
        rowErrors.creditBase = 'Credit Base is required';
        detailTableDataValid = false;
      }

      return rowErrors;
    });
    setFieldErrors(errors);

    setDetailsTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0 && detailTableDataValid) {
      const glOpeningVO = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        accountName: row.accountName,
        creditAmount: row.creditAmount,
        creditBase: row.creditBase,
        debitAmount: row.debitAmount,
        debitBase: row.debitBase,
        subLedgerCode: row.subLedgerCode
      }));
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branch: formData.branch,
        createdBy: loginUserName,
        currency: formData.currency,
        docDate: formData.docDate,
        docId: formData.docId,
        exRate: formData.exRate,
        orgId: orgId,
        particularsGlOpeningBalanceDTO: glOpeningVO,
        refDate: formData.refDate,
        refNo: formData.refNo,
        remarks: formData.remarks,
        suppRefDate: formData.suppRefDate,
        suppRefNo: formData.suppRefNo,
        totalCreditAmount: formData.totalCreditAmount,
        totalDebitAmount: formData.totalDebitAmount
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `transaction/updateCreateGlOpeningBalance`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Gl Opening Balance Updated Successfully' : 'Gl Opening Balance Created successfully');
          // Increment docId sequence here
          const currentDocId = formData.docId;
          const numericPart = parseInt(currentDocId.match(/\d+$/), 10); // Extract the numeric part of docId
          const incrementedDocId = `${currentDocId.slice(0, -String(numericPart).length)}${String(numericPart + 1).padStart(String(numericPart).length, '0')}`;

          setFormData((prev) => ({
            ...prev,
            docId: incrementedDocId // Set new incremented docId
          }));
          handleClear();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Gl Opening Balance creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Gl Opening Balance creation failed');
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
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                    <InputLabel id="branch-label">Branch</InputLabel>
                    <Select labelId="branch-label" label="Branch" value={formData.branch} onChange={handleInputChange} name="branch">
                      {branchList?.map((row) => (
                        <MenuItem key={row.id} value={row.branch}>
                          {row.branch}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Document Date"
                        value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('docDate', date)}
                        disabled
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {/* {fieldErrors.docDate && <p className="dateErrMsg">Date is required</p>} */}
                  </FormControl>
                </div>

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
                    // helperText={<span style={{ color: 'red' }}>{fieldErrors.docId ? 'This field is required' : ''}</span>}
                    inputProps={{ maxLength: 10 }}
                  />
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
                    label="Ex. Rate *"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="exRate"
                    value={formData.exRate}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.exRate ? 'Ex. Rate is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Reference No"
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
                        value={formData.refDate ? dayjs(formData.refDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('refDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {fieldErrors.refDate && <p className="dateErrMsg">Date is required</p>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="outlined-textarea-zip"
                    label="Supp. Ref. No"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="suppRefNo"
                    value={formData.suppRefNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.suppRefNo ? 'Supp. Ref. No   is required' : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Supp Ref Date"
                        value={formData.suppRefDate ? dayjs(formData.suppRefDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('suppRefDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                    {fieldErrors.suppRefDate && <p className="dateErrMsg">Date is required</p>}
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
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      Action
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                                      Account Name
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Sub Ledger Code
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Debit Amount
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Credit Amount
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Debit (Base)
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                      Credit (Base)
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
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.accountName}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, accountName: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                accountName: !value ? 'Account Name is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.accountName ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.accountName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].accountName}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          style={{ width: '150px' }}
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
                                      <td className="border px-2 py-2">
                                        <input
                                          // style={{ width: '150px' }}
                                          type="text"
                                          value={row.debitAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
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
                                          }}
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
                                          // style={{ width: '150px' }}
                                          type="text"
                                          value={row.creditAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
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
                                          }}
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
                                          // style={{ width: '150px' }}
                                          type="text"
                                          value={row.debitBase}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, debitBase: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                debitBase: !value ? 'Debit Base is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.debitBase ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.debitBase && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].debitBase}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          // style={{ width: '150px' }}
                                          type="text"
                                          value={row.creditBase}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setDetailsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, creditBase: value } : r))
                                            );
                                            setDetailsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                creditBase: !value ? 'Credit Base is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={detailsTableErrors[index]?.creditBase ? 'error form-control' : 'form-control'}
                                        />
                                        {detailsTableErrors[index]?.creditBase && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {detailsTableErrors[index].creditBase}
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
            <CommonTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getAllGlOpeningBalanceById} />
          )}
        </div>
      </div>
    </>
  );
};
export default GlOpening;

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

export const ARAPAdjustment = () => {
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [docId, setDocId] = useState('');
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [finYearList, setFinYearList] = useState([]);
  const [loginBranchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));

  const [formData, setFormData] = useState({
    accCurrency: '',
    accountName: '',
    baseAmnt: '',
    branch: '',
    branchCode: 'MAA',
    chargeableAmt: '',
    docId: '',
    docDate: dayjs(),
    createdBy: '',
    creditDays: '',
    currency: '',
    dueDate: null,
    exRate: '',
    finYear: '',
    nativeAmt: '',
    offDocId: '',
    refDate: null,
    refNo: '',
    source: '',
    subLedgerCode: '',
    tdsAmt: '',
    transId: '',
    voucherType: '',
    orgId: orgId
  });

  const [fieldErrors, setFieldErrors] = useState({
    accCurrency: '',
    accountName: '',
    baseAmnt: '',
    branch: '',
    branchCode: '',
    chargeableAmt: '',
    createdBy: '',
    creditDays: '',
    currency: '',
    docDate: null,
    dueDate: null,
    exRate: '',
    finYear: '',
    nativeAmt: '',
    offDocId: '',
    officeDocId: '',
    refDate: null,
    refNo: '',
    source: '',
    subLedgerCode: '',
    tdsAmt: '',
    transId: '',
    voucherType: ''
  });

  const validateForm = () => {
    let errors = {};
    let hasError = false;

    if (!formData.accCurrency) {
      errors.accCurrency = '* Field is required';
      hasError = true;
    }
    if (!formData.accountName) {
      errors.accountName = '* Field is required';
      hasError = true;
    }
    if (!formData.baseAmnt) {
      errors.baseAmnt = '* Field is required';
      hasError = true;
    }
    if (!formData.branch) {
      errors.branch = '* Field is required';
      hasError = true;
    }

    if (!formData.chargeableAmt) {
      errors.chargeableAmt = '* Field is required';
      hasError = true;
    }
    if (!formData.creditDays) {
      errors.creditDays = '* Field is required';
      hasError = true;
    }
    if (!formData.currency) {
      errors.currency = '* Field is required';
      hasError = true;
    }
    if (!formData.docDate) {
      errors.docDate = '* Date is required';
      hasError = true;
    }
    if (!formData.dueDate) {
      errors.dueDate = '* Date is required';
      hasError = true;
    }
    if (!formData.exRate) {
      errors.exRate = '* Field is required';
      hasError = true;
    }
    if (!formData.finYear) {
      errors.finYear = '* Field is required';
      hasError = true;
    }

    if (!formData.nativeAmt) {
      errors.nativeAmt = '* Field is required';
      hasError = true;
    }
    if (!formData.offDocId) {
      errors.offDocId = '* Field is required';
      hasError = true;
    }
    if (!formData.refDate) {
      errors.refDate = '* Date is required';
      hasError = true;
    }
    if (!formData.refNo) {
      errors.refNo = '* Field is required';
      hasError = true;
    }
    if (!formData.source) {
      errors.source = '* Field is required';
      hasError = true;
    }
    if (!formData.subLedgerCode) {
      errors.subLedgerCode = '* Field is required';
      hasError = true;
    }
    // if (!formData.subLedgerName) {
    //   errors.subLedgerName = '* Field is required';
    //   hasError = true;
    // }
    if (!formData.tdsAmt) {
      errors.tdsAmt = '* Field is required';
      hasError = true;
    }
    if (!formData.transId) {
      errors.transId = '* Field is required';
      hasError = true;
    }
    if (!formData.voucherType) {
      errors.voucherType = '* Field is required';
      hasError = true;
    }

    // Set errors in state
    setFieldErrors(errors);

    // Return whether the form is valid or not
    return !hasError;
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'gstFlag') {
      newValue = value === 'true'; // Convert "true"/"false" strings to boolean
    }
    // Update other form fields
    setFormData({ ...formData, [name]: newValue });
  };

  useEffect(() => {
    getAllARAP();
    getAllBranches();
    getAllFinYear();
    getARAPDocId();
  }, []);

  const getAllFinYear = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getAllAciveFInYear?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setFinYearList(response.paramObjectsMap.financialYearVOs);
        console.log('fin', response.paramObjectsMap.financialYearVOs);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllARAP = async () => {
    try {
      const response = await apiCalls('get', `/arapAdjustments/getAllArapAdjustmentsByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setData(response.paramObjectsMap.arapAdjustmentsVO);

        console.log('Test===>', response.paramObjectsMap.arapAdjustmentsVO);
      } else {
        // Handle error
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getARAPDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/payable/getPaymentDocId?branchCode=${loginBranchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.paymentDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const handleSave = async () => {
    const formDataToSend = {
      ...formData,
      ...(editId && { id: editId }),
      baseAmnt: formData.baseAmnt ? parseInt(formData.baseAmnt, 10) : 0,
      chargeableAmt: formData.chargeableAmt ? parseInt(formData.chargeableAmt, 10) : 0,
      exRate: formData.exRate ? parseInt(formData.exRate, 10) : 0,
      nativeAmt: formData.nativeAmt ? parseInt(formData.nativeAmt, 10) : 0,
      tdsAmt: formData.tdsAmt ? parseInt(formData.tdsAmt, 10) : 0,
      docDate: formData.docDate
        ? dayjs(formData.docDate, 'DD-MM-YYYY').isValid()
          ? dayjs(formData.docDate).format('DD-MM-YYYY')
          : ''
        : '',
      dueDate: formData.dueDate
        ? dayjs(formData.dueDate, 'DD-MM-YYYY').isValid()
          ? dayjs(formData.dueDate).format('DD-MM-YYYY')
          : ''
        : '',
      refDate: formData.refDate ? (dayjs(formData.refDate, 'DD-MM-YYYY').isValid() ? dayjs(formData.refDate).format('DD-MM-YYYY') : '') : ''
    };

    if (validateForm()) {
      try {
        // Using async/await for API call
        const response = await apiCalls('put', `/arapAdjustments/updateCreateArapAdjustments`, formDataToSend);

        if (response.status) {
          console.log('Response:', response.data);
          handleClear();
          showToast('success', editId ? 'ARAP adjustment Updated Successfully' : 'ARAP adjustment created successfully');
        } else {
          console.error('API Error:', response.data);
          toast.error('Error in creating/updating AR AP Adjustment', {
            autoClose: 2000,
            theme: 'colored'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while saving', {
          autoClose: 2000,
          theme: 'colored'
        });
      }
    } else {
      toast.error('Please fill in all required fields', {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  const getAllARAPById = async (id) => {
    console.log('Fetching ARAP by ID:', id);
    setEditId(id.original.id);
    try {
      const response = await apiCalls('get', `/arapAdjustments/getAllArapAdjustmentsById?id=${id.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const arApVO = response.paramObjectsMap.arapAdjustmentsVO[0];
        setShowForm(true);

        setFormData({
          accCurrency: arApVO.accCurrency || '',
          accountName: arApVO.accountName || '',
          baseAmnt: arApVO.baseAmnt || 0,
          branch: arApVO.branch || '',
          branchCode: arApVO.branchCode || '',
          chargeableAmt: arApVO.chargeableAmt || 0,
          createdBy: arApVO.createdBy || '',
          creditDays: arApVO.creditDays || '',
          currency: arApVO.currency || '',
          docDate: arApVO.docDate || '',
          dueDate: arApVO.dueDate || '',
          exRate: arApVO.exRate || 0,
          finYear: arApVO.finYear || '',
          id: arApVO.id || 0,
          nativeAmt: arApVO.nativeAmt || 0,
          offDocId: arApVO.offDocId || '',
          orgId: arApVO.orgId || orgId,
          refDate: arApVO.refDate || '',
          refNo: arApVO.refNo || '',
          source: arApVO.source || '',
          subLedgerCode: arApVO.subLedgerCode || '',
          subLedgerName: arApVO.subLedgerName || '',
          tdsAmt: arApVO.tdsAmt || 0,
          transId: arApVO.transId || '',
          voucherType: arApVO.voucherType || ''
        });

        console.log('Data to Edit:', arApVO);
      } else {
        // Handle error case
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
    // setFieldErrors({
    //   chapter: false,
    //   subChapter: false,
    //   hsnCode: false,
    //   branch: false,
    //   newRate: false,
    //   excepmted: false
    // });

    getAllARAP();
  };
  const handleClear = () => {
    setFormData({
      accCurrency: '',
      accountName: '',
      baseAmnt: '',
      branch: '',
      branchCode: '',
      chargeableAmt: '',
      createdBy: '',
      creditDays: '',
      currency: '',
      docDate: null,
      dueDate: null,
      exRate: '',
      finYear: '',
      ipNo: '',
      latitude: '',
      nativeAmt: '',
      offDocId: '',
      officeDocId: '',
      refDate: null,
      refNo: '',
      source: '',
      subLedgerCode: '',
      subLedgerName: '',
      tdsAmt: '',
      transId: '',
      voucherType: ''
    });

    setFieldErrors({
      accCurrency: '',
      accountName: '',
      baseAmnt: '',
      branch: '',
      branchCode: '',
      chargeableAmt: '',
      createdBy: '',
      creditDays: '',
      currency: '',
      docDate: null,
      dueDate: null,
      exRate: '',
      finYear: '',
      ipNo: '',
      latitude: '',
      nativeAmt: '',
      offDocId: '',
      officeDocId: '',
      refDate: null,
      refNo: '',
      source: '',
      subLedgerCode: '',
      subLedgerName: '',
      tdsAmt: '',
      transId: '',
      voucherType: ''
    });
    setEditId('');
  };

  const columns = [
    { accessorKey: 'accountName', header: 'Account Name', size: 140 },
    { accessorKey: 'chargeableAmt', header: 'Chargeable Amount', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      size: 140,
      Cell: ({ row }) => dayjs(row.original.dueDate).format('DD-MM-YYYY') // Formatting due date
    },
    {
      accessorKey: 'gstFlag',
      header: 'GST Flag',
      size: 140,
      Cell: ({ row }) => (row.original.gstFlag ? 'Yes' : 'No') // Display Yes/No for boolean
    },
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'baseAmnt', header: 'Base Amount', size: 140 },
    { accessorKey: 'exRate', header: 'Exchange Rate', size: 140 },
    { accessorKey: 'transId', header: 'Transaction ID', size: 140 }
  ];

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} margin="0 10px 0 10px" />
          </div>

          {showForm ? (
            <div className="row d-flex ml">
              {/* Branch */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.branch}>
                  <InputLabel id="branch-select-label">Branch</InputLabel>
                  <Select
                    labelId="branch-select-label"
                    id="branch-select"
                    label="Branch"
                    required
                    value={formData.branch}
                    name="branch"
                    onChange={handleInputChange}
                  >
                    {branchList.length > 0 &&
                      branchList?.map((row) => (
                        <MenuItem key={row.id} value={row.branch}>
                          {row.branch}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.branch && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.branch}
                    </p>
                  )}
                </FormControl>
              </div>

              {/* FinYr */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.finYear}>
                  <InputLabel id="finYr-label">Fin Year</InputLabel>
                  <Select labelId="finYr-label" label="finYear" value={formData.finYear} onChange={handleInputChange} name="finYear">
                    {finYearList?.map((row) => (
                      <MenuItem key={row.id} value={row.finYear}>
                        {row.finYear}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.finYear && <FormHelperText>{fieldErrors.finYear}</FormHelperText>}
                </FormControl>
              </div>

              {/* Voucher Type */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="voucherType"
                  label="Voucher Type"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.voucherType}
                  helperText={fieldErrors.voucherType}
                />
              </div>

              {/* Source */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="source"
                  label="Source"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.source}
                  helperText={fieldErrors.source}
                />
              </div>

              {/* TransID */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="transId"
                  label="TransID"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="transId"
                  value={formData.transId}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.transId}
                  helperText={fieldErrors.transId}
                />
              </div>

              {/* Subtype Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="subLedgerCode"
                  label="Subtype Code"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="subLedgerCode"
                  value={formData.subLedgerCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.subLedgerCode}
                  helperText={fieldErrors.subLedgerCode}
                />
              </div>

              {/* Doc ID */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="docId"
                  label="Doc ID"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  className="w-100"
                  error={!!fieldErrors.docId}
                  helperText={fieldErrors.docId}
                />
              </div>

              {/* Doc Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="docDate"
                  label="Doc Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="docDate"
                  value={formData.docDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.docDate}
                  helperText={fieldErrors.docDate}
                />
              </div>

              {/* Ref. No. */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="refNo"
                  label="Ref. No."
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.refNo}
                  helperText={fieldErrors.refNo}
                />
              </div>

              {/* Ref. Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="refDate"
                  label="Ref. Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="refDate"
                  value={formData.refDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.refDate}
                  helperText={fieldErrors.refDate}
                />
              </div>

              {/* Account Name */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.accountName}>
                  <InputLabel id="accountName-select-label">Account Name</InputLabel>
                  <Select
                    labelId="accountName-select-label"
                    id="accountName-select"
                    label="Account Name"
                    required
                    value={formData.accountName}
                    name="accountName"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="account1">Account 1</MenuItem>
                    <MenuItem value="account2">Account 2</MenuItem>
                  </Select>
                  {fieldErrors.accountName && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.accountName}
                    </p>
                  )}
                </FormControl>
              </div>

              {/* Subledger Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="subLedgerCode"
                  label="Subledger Code"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="subLedgerCode"
                  value={formData.subLedgerCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.subLedgerCode}
                  helperText={fieldErrors.subLedgerCode}
                />
              </div>

              {/* Currency */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="currency"
                  label="Currency"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.currency}
                  helperText={fieldErrors.currency}
                />
              </div>

              {/* Ex. Rate */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="exRate"
                  label="Ex. Rate"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="exRate"
                  value={formData.exRate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.exRate}
                  helperText={fieldErrors.exRate}
                />
              </div>

              {/* Account Currency */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="accCurrency"
                  label="Account Currency"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="accCurrency"
                  value={formData.accCurrency}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.accCurrency}
                  helperText={fieldErrors.accCurrency}
                />
              </div>

              {/* Credit Days */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="creditDays"
                  label="Credit Days"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="creditDays"
                  value={formData.creditDays}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.creditDays}
                  helperText={fieldErrors.creditDays}
                />
              </div>

              {/* Due Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="dueDate"
                  label="Due Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.dueDate}
                  helperText={fieldErrors.dueDate}
                />
              </div>

              {/* Base Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="baseAmnt"
                  label="Base Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="baseAmnt"
                  value={formData.baseAmnt}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.baseAmnt}
                  helperText={fieldErrors.baseAmnt}
                />
              </div>

              {/* Native Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="nativeAmt"
                  label="Native Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="nativeAmt"
                  value={formData.nativeAmt}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.nativeAmt}
                  helperText={fieldErrors.nativeAmt}
                />
              </div>

              {/* Chargeable Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="chargeableAmt"
                  label="Chargeable Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="chargeableAmt"
                  value={formData.chargeableAmt}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.chargeableAmt}
                  helperText={fieldErrors.chargeableAmt}
                />
              </div>

              {/* TDS Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="tdsAmt"
                  label="TDS Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="tdsAmt"
                  value={formData.tdsAmt}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.tdsAmt}
                  helperText={fieldErrors.tdsAmt}
                />
              </div>

              {/* GST Flag */}

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.gstFlag}>
                  <InputLabel id="gstFlag-select-label">GST Flag</InputLabel>
                  <Select
                    labelId="gstFlag-select-label"
                    id="gstFlag-select"
                    label="GST Flag"
                    required
                    value={formData.gstFlag}
                    name="gstFlag"
                    onChange={handleInputChange}
                  >
                    <MenuItem value={'true'}>Yes</MenuItem>
                    <MenuItem value={'false'}>No</MenuItem>
                  </Select>
                  {fieldErrors.gstFlag && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.gstFlag}
                    </p>
                  )}
                </FormControl>
              </div>

              {/* HNO */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="offDocId"
                  label="Off. Doc Id"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="offDocId"
                  value={formData.offDocId}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.offDocId}
                  helperText={fieldErrors.offDocId}
                />
              </div>
            </div>
          ) : (
            <CommonListViewTable data={data} columns={columns} blockEdit={true} toEdit={getAllARAPById} />
          )}
        </div>
      </div>
    </>
  );
};
export default ARAPAdjustment;

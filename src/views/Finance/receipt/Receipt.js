import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import 'react-tabs/style/react-tabs.css';

// import CommonListViewTable from '../basicMaster/CommonListViewTable';

// import { AiOutlineSearch, AiOutlineWallet } from "react-icons/ai";
// import { BsListTask } from "react-icons/bs";

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import CommonListViewTable from '../../basicMaster/CommonListViewTable';

const Receipt = () => {
  // const buttonStyle = {
  //   fontSize: '20px' // Adjust the font size as needed
  // };
  const [value, setValue] = useState(0);

  const theme = useTheme();
  const anchorRef = useRef(null);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allCustomerName, setAllCustomerName] = useState([]);
  const [branchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [branch, setLoginBranch] = useState(localStorage.getItem('branch'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    active: true,
    receiptType1: '',
    bankChargeAcc: '',
    // docId: '',
    // docDate: null,
    bankCharges: '',
    inCurrencyBnkChargs: '',
    type: '',
    tdsAmt: '',
    inCurrencyTdsAmt: '',
    customerName: '',
    chequeBank: '',
    customerCode: '',
    receiptType: '',
    bankCashAcc: '',
    chequeUtiNo: '',
    chequeUtiDt: null,
    receiptAmt: '',
    currency: '',
    currencyAmount: '',
    receivedFrom: '',
    netAmount: '',
    remarks: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    active: true,
    receiptType1: '',
    bankChargeAcc: '',
    // docId: '',
    // docDate: null,
    bankCharges: '',
    inCurrencyBnkChargs: '',
    type: '',
    tdsAmt: '',
    inCurrencyTdsAmt: '',
    customerName: '',
    chequeBank: '',
    customerCode: '',
    receiptType: '',
    bankCashAcc: '',
    chequeUtiNo: '',
    chequeUtiDt: null,
    receiptAmt: '',
    currency: '',
    currencyAmount: '',
    receivedFrom: '',
    netAmount: '',
    remarks: ''
  });

  const [inVoiceDetailsData, setInVoiceDetailsData] = useState([
    {
      id: Date.now(),
      invNo: '',
      invDate: null,
      refNo: '',
      refDate: null,
      masterRef: '',
      houseRef: '',
      currency: '',
      exRate: '',
      amount: '',
      chargeAmt: '',
      outstanding: '',
      settled: '',
      recExRate: '',
      txnSettled: '',
      gainAmt: ''
      // remarks: ''
    }
  ]);

  const [invoiceDetailsError, setInvoiceDetailsError] = useState([
    {
      invNo: '',
      invDate: null,
      refNo: '',
      refDate: null,
      masterRef: '',
      houseRef: '',
      currency: '',
      exRate: '',
      amount: '',
      chargeAmt: '',
      outstanding: '',
      settled: '',
      recExRate: '',
      txnSettled: '',
      gainAmt: ''
      // remarks: ''
    }
  ]);

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;
  //   setFormData({ ...formData, [name]: inputValue });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;

  //   // If customerName is selected, find and set customerCode
  //   if (name === 'customerName') {
  //     const selectedCustomer = allCustomerName.find((customer) => customer.customerName === value);
  //     if (selectedCustomer) {
  //       setFormData({
  //         ...formData,
  //         customerName: value,
  //         customerCode: selectedCustomer.customerCode // Set the corresponding customerCode
  //       });
  //     }
  //   } else {
  //     setFormData({ ...formData, [name]: inputValue });
  //   }

  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;

  //   // Define regex for numeric fields
  //   const isNumeric = /^[0-9]*$/;

  //   // Validation logic for numeric fields
  //   const numericFields = ['bankCharges', 'receiptAmt', 'tdsAmt']; // Add other numeric fields if needed
  //   if (numericFields.includes(name)) {
  //     if (!isNumeric.test(value)) {
  //       setFieldErrors({
  //         ...fieldErrors,
  //         [name]: 'Only numbers are allowed'
  //       });
  //       return; // Prevent further form updates if invalid input
  //     }
  //   }

  //   // If customerName is selected, find and set customerCode
  //   if (name === 'customerName') {
  //     const selectedCustomer = allCustomerName.find((customer) => customer.customerName === value);
  //     if (selectedCustomer) {
  //       setFormData({
  //         ...formData,
  //         customerName: value,
  //         customerCode: selectedCustomer.customerCode // Set the corresponding customerCode
  //       });
  //     }
  //   } else {
  //     setFormData({ ...formData, [name]: inputValue });
  //   }

  //   // Clear error when input is valid
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    // Define regex for numeric fields
    const isNumeric = /^[0-9]*$/;

    // Validation logic for numeric fields
    const numericFields = ['bankCharges', 'receiptAmt', 'tdsAmt']; // Add other numeric fields if needed
    if (numericFields.includes(name)) {
      if (!isNumeric.test(value)) {
        setFieldErrors({
          ...fieldErrors,
          [name]: 'Only numbers are allowed'
        });
        return; // Prevent further form updates if invalid input
      }
    }

    // Handle customerName selection and customerCode mapping
    if (name === 'customerName') {
      const selectedCustomer = allCustomerName.find((customer) => customer.customerName === value);
      if (selectedCustomer) {
        setFormData({
          ...formData,
          customerName: value,
          customerCode: selectedCustomer.customerCode // Set the corresponding customerCode
        });

        // Clear any errors related to customerName if input is valid
        setFieldErrors({
          ...fieldErrors,
          customerName: false,
          customerCode: false
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

  const handleClear = () => {
    setFormData({
      active: true,
      bankChargeAcc: '',
      // docId: '',
      // docDate: null,
      bankCharges: '',
      inCurrencyBnkChargs: '',
      type: '',
      tdsAmt: '',
      inCurrencyTdsAmt: '',
      customerName: '',
      chequeBank: '',
      customerCode: '',
      receiptType: '',
      bankCashAcc: '',
      chequeUtiNo: '',
      chequeUtiDt: null,
      receiptAmt: '',
      currency: '',
      currencyAmount: '',
      receivedFrom: '',
      netAmount: '',
      remarks: ''
    });
    setFieldErrors({
      bankChargeAcc: '',
      // docId: '',
      // docDate: null,
      bankCharges: '',
      inCurrencyBnkChargs: '',
      type: '',
      tdsAmt: '',
      inCurrencyTdsAmt: '',
      customerName: '',
      chequeBank: '',
      customerCode: '',
      receiptType: '',
      bankCashAcc: '',
      chequeUtiNo: '',
      chequeUtiDt: null,
      receiptAmt: '',
      currency: '',
      currencyAmount: '',
      receivedFrom: '',
      netAmount: '',
      remarks: ''
    });
    setInVoiceDetailsData([
      {
        invNo: '',
        invDate: null,
        refNo: '',
        refDate: null,
        masterRef: '',
        houseRef: '',
        currency: '',
        exRate: '',
        amount: '',
        chargeAmt: '',
        outstanding: '',
        settled: '',
        recExRate: '',
        txnSettled: '',
        gainAmt: ''
        // remarks: ''
      }
    ]);
    setInvoiceDetailsError({
      invNo: '',
      invDate: null,
      refNo: '',
      refDate: null,
      masterRef: '',
      houseRef: '',
      currency: '',
      exRate: '',
      amount: '',
      chargeAmt: '',
      outstanding: '',
      settled: '',
      recExRate: '',
      txnSettled: '',
      gainAmt: ''
      // remarks: ''
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(inVoiceDetailsData)) {
      displayRowError(inVoiceDetailsData);
      return;
    }
    const newRow = {
      id: Date.now(),
      invNo: '',
      invDate: null,
      refNo: '',
      refDate: null,
      masterRef: '',
      houseRef: '',
      currency: '',
      exRate: '',
      amount: '',
      chargeAmt: '',
      outstanding: '',
      settled: '',
      recExRate: '',
      txnSettled: '',
      txnSettled: '',
      gainAmt: ''
      // remarks: ''
    };
    setInVoiceDetailsData([...inVoiceDetailsData, newRow]);
    setInvoiceDetailsError([
      ...invoiceDetailsError,
      {
        invNo: '',
        invDate: null,
        refNo: '',
        refDate: null,
        masterRef: '',
        houseRef: '',
        currency: '',
        exRate: '',
        amount: '',
        chargeAmt: '',
        outstanding: '',
        settled: '',
        recExRate: '',
        txnSettled: '',
        txnSettled: '',
        gainAmt: ''
        // remarks: ''
      }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === inVoiceDetailsData) {
      return (
        !lastRow.invNo ||
        !lastRow.invDate ||
        !lastRow.refNo ||
        !lastRow.refDate ||
        !lastRow.masterRef ||
        !lastRow.houseRef ||
        !lastRow.currency ||
        !lastRow.exRate ||
        !lastRow.amount ||
        !lastRow.chargeAmt ||
        !lastRow.outstanding ||
        !lastRow.settled ||
        !lastRow.recExRate ||
        !lastRow.txnSettled ||
        !lastRow.gainAmt
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === inVoiceDetailsData) {
      setInvoiceDetailsError((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          invNo: !table[table.length - 1].invNo ? 'Invoice No is required' : '',
          invDate: !table[table.length - 1].invDate ? 'Invoice Date is required' : '',
          refNo: !table[table.length - 1].refNo ? 'Ref No is required' : '',
          refDate: !table[table.length - 1].refDate ? 'Ref Date is required' : '',
          masterRef: !table[table.length - 1].masterRef ? 'Master Ref is required' : '',
          houseRef: !table[table.length - 1].houseRef ? 'House Ref is required' : '',
          currency: !table[table.length - 1].currency ? 'Currency is required' : '',
          exRate: !table[table.length - 1].exRate ? 'Ex Rate is required' : '',
          amount: !table[table.length - 1].amount ? 'Amount is required' : '',
          chargeAmt: !table[table.length - 1].chargeAmt ? 'Chargeable Amount is required' : '',
          outstanding: !table[table.length - 1].outstanding ? 'Outstanding is required' : '',
          settled: !table[table.length - 1].settled ? 'Settled is required' : '',
          recExRate: !table[table.length - 1].recExRate ? 'Rec Ex Rate is required' : '',
          txnSettled: !table[table.length - 1].txnSettled ? 'Txn Settled is required' : '',
          gainAmt: !table[table.length - 1].gainAmt ? 'Gain or Loss is required' : ''
        };
        return newErrors;
      });
    }
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
    getAllCustomerName();
  }, []);

  const getAllCustomerName = async () => {
    try {
      const response = await apiCalls(
        'get',
        `arreceivable/getCustomerNameAndCodeForReceipt?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      console.log('API Response:', response);

      if (response.status === true) {
        setAllCustomerName(response.paramObjectsMap.PartyMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllReceipt();
  }, []);

  const getAllReceipt = async () => {
    try {
      const response = await apiCalls('get', `arreceivable/getAllReceiptByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.receiptReceivableVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getReceiptById = async (row) => {
    console.log('first', row);
    setEditId(row.original.id);
    // setShowForm(true);

    try {
      const response = await apiCalls('get', `/arreceivable/getAllReceiptById?id=${row.original.id}`);
      if (response.status === true) {
        setListView(false);
        const receiptVO = response.paramObjectsMap.receiptReceivableVO[0];

        setFormData({
          receiptType: receiptVO.receiptType,
          bankChargeAcc: receiptVO.bankChargeAcc,
          // docId: receiptVO.docId,
          // docDate: dayjs(receiptVO.docDate, 'DD-MM-YYYY').format('YYYY-MM-DD'), // Convert to correct format
          bankCharges: receiptVO.bankCharges,
          inCurrencyBnkChargs: receiptVO.inCurrencyBnkChargs,
          type: receiptVO.type,
          tdsAmt: receiptVO.tdsAmt,
          inCurrencyTdsAmt: receiptVO.inCurrencyTdsAmt,
          chequeBank: receiptVO.chequeBank,
          customerName: receiptVO.customerName,
          customerCode: receiptVO.customerCode,
          receiptType1: receiptVO.receiptType1,
          bankCashAcc: receiptVO.bankCashAcc,
          chequeUtiNo: receiptVO.chequeUtiNo,
          chequeUtiDt: dayjs(receiptVO.chequeUtiDt, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
          receiptAmt: receiptVO.receiptAmt,
          currency: receiptVO.currency,
          currencyAmount: receiptVO.currencyAmount,
          receivedFrom: receiptVO.receivedFrom
        });
        setInVoiceDetailsData(
          receiptVO.receiptInvDetailsVO.map((invoiceData) => ({
            id: invoiceData.id,
            invNo: invoiceData.invNo,
            invDate: dayjs(invoiceData.invDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
            refNo: invoiceData.refNo,
            refDate: dayjs(invoiceData.refDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), // Convert to correct format
            masterRef: invoiceData.masterRef,
            houseRef: invoiceData.houseRef,
            currency: invoiceData.currency,
            exRate: invoiceData.exRate,
            amount: invoiceData.amount,
            chargeAmt: invoiceData.chargeAmt,
            outstanding: invoiceData.outstanding,
            settled: invoiceData.settled,
            recExRate: invoiceData.recExRate,
            txnSettled: invoiceData.txnSettled,
            gainAmt: invoiceData.gainAmt
            // remarks: invoiceData.remarks
          }))
        );
      } else {
        // Handle error
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

  const currentDate = new Date();

  const handleSave = async () => {
    const errors = {};
    const tableErrors = inVoiceDetailsData.map((row) => ({
      invNo: !row.invNo ? 'Invoice No is required' : '',
      invDate: !row.invDate ? 'Invoice Date is required' : '',
      refNo: !row.refNo ? 'Ref No is required' : '',
      refDate: !row.refDate ? 'Ref Date is required' : '',
      masterRef: !row.masterRef ? 'Master Ref is required' : '',
      houseRef: !row.houseRef ? 'House Ref is required' : '',
      currency: !row.currency ? 'Currency is required' : '',
      exRate: !row.exRate ? 'Ex Rate is required' : '',
      amount: !row.amount ? 'Amount is required' : '',
      chargeAmt: !row.chargeAmt ? 'Chargeable Amount is required' : '',
      outstanding: !row.outstanding ? 'Outstanding is required' : '',
      settled: !row.settled ? 'Settled is required' : '',
      recExRate: !row.recExRate ? 'Rec Ex Rate is required' : '',
      txnSettled: !row.txnSettled ? 'Txn Settled is required' : '',
      gainAmt: !row.gainAmt ? 'Gain or Loss is required' : ''
    }));

    let hasTableErrors = false;

    tableErrors.forEach((err) => {
      if (Object.values(err).some((error) => error)) {
        hasTableErrors = true;
      }
    });

    // Check for empty fields and set error messages
    if (!formData.receiptType) {
      errors.receiptType = 'Receipt Type Bank is required';
    }
    if (!formData.bankChargeAcc) {
      errors.bankChargeAcc = 'Bank Charge Acc is required';
    }
    // if (!formData.docId) {
    //   errors.docId = 'Document ID is required';
    // }
    // if (!formData.docDate) {
    //   errors.docDate = 'Document Date is required';
    // }
    if (!formData.bankCharges) {
      errors.bankCharges = 'Bank Charges is required';
    }
    if (!formData.inCurrencyBnkChargs) {
      errors.inCurrencyBnkChargs = 'In Currency Bank Charges is required';
    }
    if (!formData.type) {
      errors.type = 'Type is required';
    }
    if (!formData.tdsAmt) {
      errors.tdsAmt = 'Tds Amount is required';
    }
    if (!formData.inCurrencyTdsAmt) {
      errors.inCurrencyTdsAmt = 'In Currency Tds Amount is required';
    }
    if (!formData.customerName) {
      errors.customerName = 'Customer Name is required';
    }
    if (!formData.chequeBank) {
      errors.chequeBank = 'Cheque Bank is required';
    }
    if (!formData.customerCode) {
      errors.customerCode = 'Customer Code is required';
    }
    if (!formData.receiptType1) {
      errors.receiptType1 = 'Receipt Type is required';
    }
    if (!formData.bankCashAcc) {
      errors.bankCashAcc = 'Bank/Cash/Acc is required';
    }
    if (!formData.chequeUtiNo) {
      errors.chequeUtiNo = 'Cheque/Uti No is required';
    }
    if (!formData.chequeUtiDt) {
      errors.chequeUtiDt = 'Cheque/Uti Dt is required';
    }
    if (!formData.receiptAmt) {
      errors.receiptAmt = 'Receipt Amount is required';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.currencyAmount) {
      errors.currencyAmount = 'Currency Amount is required';
    }
    if (!formData.receivedFrom) {
      errors.receivedFrom = 'Received From is required';
    }

    setFieldErrors(errors);
    setInvoiceDetailsError(tableErrors);

    // Prevent saving if form or table errors exist
    if (Object.keys(errors).length === 0 && !hasTableErrors) {
      setIsLoading(true);

      const receiptInvDetailVo = inVoiceDetailsData.map((row) => ({
        // id: item.id || 0, // If id exists, otherwise 0

        ...(editId && { id: row.id }),
        amount: parseInt(row.amount),
        chargeAmt: parseInt(row.chargeAmt),
        currency: row.currency,
        exRate: parseInt(row.exRate),
        gainAmt: parseInt(row.gainAmt),
        houseRef: row.houseRef,
        invNo: row.invNo,
        invDate: formatDate(new Date(row.invDate)),
        masterRef: row.masterRef,
        outstanding: parseInt(row.outstanding),
        recExRate: parseInt(row.recExRate),
        refDate: formatDate(new Date(row.refDate)),
        refNo: row.refNo,
        settled: parseInt(row.settled),
        txnSettled: parseInt(row.txnSettled)
        // remarks: row.remarks,
        // fromDate: formatDate(currentDate), // Passing current date
        // toDate: formatDate(currentDate)
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        bankCashAcc: formData.bankCashAcc,
        bankChargeAcc: formData.bankChargeAcc,
        bankCharges: parseInt(formData.bankCharges),
        branch: branch,
        branchCode: branchCode,
        cancel: true,
        cancelRemarks: '',
        chequeBank: formData.chequeBank,
        chequeUtiNo: formData.chequeUtiNo,
        chequeUtiDt: formatDate(new Date(formData.chequeUtiDt)), // Formatting with date and time
        client: '',
        createdBy: loginUserName,
        currency: formData.currency,
        currencyAmount: formData.currencyAmount,
        customer: '',
        customerCode: formData.customerCode,
        customerName: formData.customerName,
        finYear: finYear,
        inCurrencyBnkChargs: formData.inCurrencyBnkChargs,
        inCurrencyTdsAmt: formData.inCurrencyTdsAmt,
        netAmount: formData.netAmount,
        receiptAmt: parseInt(formData.receiptAmt),
        receiptInvDetailaDTO: receiptInvDetailVo,
        receiptType: formData.receiptType,
        receiptType1: formData.receiptType1,
        receivedFrom: formData.receivedFrom,
        remarks: formData.remarks,
        taxAmt: 0,
        tdsAmt: parseInt(formData.tdsAmt),
        type: formData.type,
        orgId: parseInt(orgId)
        // docId: formData.docId,
        // docDate: formatDate(new Date(formData.docDate)), // Formatting with date and time
        // ipNo: '',
        // latitude: '',
      };

      try {
        const response = await apiCalls('put', `arreceivable/updateCreateReceipt`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'Receipt Updated Successfully' : 'Receipt created successfully');
          handleClear();
          getAllReceipt();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Receipt creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Receipt creation failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const listViewColumns = [
    { accessorKey: 'receiptType', header: 'Receipt Type', size: 140 },
    { accessorKey: 'bankChargeAcc', header: 'Bank Charges Account', size: 140 },
    // { accessorKey: 'docId', header: 'Doc Id', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'tdsAmt', header: 'TDS Amount', size: 140 },
    { accessorKey: 'customerName', header: 'Customer Name', size: 140 },
    { accessorKey: 'chequeUtiDt', header: 'Chq/ UTI Dt', size: 140 },
    { accessorKey: 'receiptAmt', header: 'Receipt Amount', size: 140 }
  ];

  return (
    <div>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="row d-flex ml" style={{ marginBottom: '20px' }}>
          <div className="d-flex flex-wrap justify-content-start mb-4 " style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} />
          </div>
        </div>
        {listView ? (
          <div className="">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getReceiptById} />
          </div>
        ) : (
          <>
            <div className="row d-flex ml" style={{ marginBottom: '20px' }}>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.receiptType}>
                  <InputLabel id="receiptType" required>
                    Receipt Type
                  </InputLabel>
                  <Select
                    labelId="receiptType"
                    id="receiptType"
                    name="receiptType"
                    required
                    value={formData.receiptType}
                    label="Receipt Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value={'Cash Receipt'}>Cash Receipt</MenuItem>
                    <MenuItem value={'Bank Receipt'}>Bank Receipt</MenuItem>
                  </Select>
                  {fieldErrors.receiptType && <FormHelperText>{fieldErrors.receiptType}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="bankChargeAcc"
                    label="Bank Charges A/C"
                    name="bankChargeAcc"
                    size="small"
                    value={formData.bankChargeAcc}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.bankChargeAcc}
                    helperText={fieldErrors.bankChargeAcc}
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="docId"
                    name="docId"
                    label="Doc ID"
                    size="small"
                    value={formData.docId}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.docId}
                    helperText={fieldErrors.docId}
                  />
                </FormControl>
              </div> */}
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Doc Date"
                      value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('docDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.docDate}
                      helperText={fieldErrors.docDate ? fieldErrors.docDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="bankCharges"
                    name="bankCharges"
                    label="Bank Charges"
                    size="small"
                    value={formData.bankCharges}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.bankCharges}
                    helperText={fieldErrors.bankCharges}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.inCurrencyBnkChargs}>
                  <InputLabel id="inCurrencyBnkChargs">In Currency</InputLabel>
                  <Select
                    labelId="inCurrencyBnkChargs"
                    id="inCurrencyBnkChargs"
                    label="In Currency"
                    onChange={handleInputChange}
                    name="inCurrencyBnkChargs"
                    value={formData.inCurrencyBnkChargs}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.currency}>
                        {currency.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.inCurrencyBnkChargs && <FormHelperText>{fieldErrors.inCurrencyBnkChargs}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.type}>
                  <InputLabel id="type" required>
                    Type
                  </InputLabel>
                  <Select labelId="type" id="type" name="type" required value={formData.type} label="Type" onChange={handleInputChange}>
                    <MenuItem value={'AIR CARRIER'}>AIR CARRIER</MenuItem>
                    <MenuItem value={'BANK'}>BANK</MenuItem>
                    <MenuItem value={'COLOADER'}>COLOADER</MenuItem>
                    <MenuItem value={'CUSTOMER'}>CUSTOMER</MenuItem>
                    <MenuItem value={'GLOBAL'}>GLOBAL</MenuItem>
                    <MenuItem value={'SEA CARRIER'}>SEA CARRIER</MenuItem>
                    <MenuItem value={'VENDOR'}>VENDOR</MenuItem>
                  </Select>
                  {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="tdsAmt"
                    name="tdsAmt"
                    label="TDS Amount"
                    size="small"
                    value={formData.tdsAmt}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.tdsAmt}
                    helperText={fieldErrors.tdsAmt}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.inCurrencyTdsAmt}>
                  <InputLabel id="inCurrencyTdsAmt">In Currency</InputLabel>
                  <Select
                    labelId="inCurrencyTdsAmt"
                    id="inCurrencyTdsAmt"
                    label="In Currency"
                    onChange={handleInputChange}
                    name="inCurrencyTdsAmt"
                    value={formData.inCurrencyTdsAmt}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.currency}>
                        {currency.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.inCurrencyTdsAmt && <FormHelperText>{fieldErrors.inCurrencyTdsAmt}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="chequeBank"
                    name="chequeBank"
                    label="Cheque Bank"
                    size="small"
                    value={formData.chequeBank}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.chequeBank}
                    helperText={fieldErrors.chequeBank}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.customerName}>
                  <InputLabel id="demo-simple-select-label">Customer Name</InputLabel>
                  <Select
                    labelId="customerName"
                    id="customerName"
                    label="Customer Name"
                    onChange={handleInputChange}
                    name="customerName"
                    value={formData.customerName}
                  >
                    {allCustomerName.map((customer) => (
                      <MenuItem key={customer.id} value={customer.customerName}>
                        {customer.customerName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.customerName && <FormHelperText>{fieldErrors.customerName}</FormHelperText>}{' '}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="customerCode"
                    name="customerCode"
                    label="Customer Code"
                    size="small"
                    value={formData.customerCode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.customerCode}
                    helperText={fieldErrors.customerCode}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.receiptType1}>
                  <InputLabel id="receiptType1" required>
                    Receipt Type
                  </InputLabel>
                  <Select
                    labelId="receiptType1"
                    id="receiptType1"
                    name="receiptType1"
                    required
                    value={formData.receiptType1}
                    label="Receipt Type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value={'NEFT'}>NEFT</MenuItem>
                    <MenuItem value={'RTGS'}>RTGS</MenuItem>
                    <MenuItem value={'CHEQUE'}>CHEQUE</MenuItem>
                    <MenuItem value={'CASH'}>CASH</MenuItem>
                    <MenuItem value={'DD'}>DD</MenuItem>
                  </Select>
                  {fieldErrors.receiptType1 && <FormHelperText>{fieldErrors.receiptType1}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="bankCashAcc"
                    name="bankCashAcc"
                    label="Bank/Cash/AC"
                    size="small"
                    value={formData.bankCashAcc}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.bankCashAcc}
                    helperText={fieldErrors.bankCashAcc}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="chequeUtiNo"
                    name="chequeUtiNo"
                    label="Chq/ UTI No"
                    size="small"
                    value={formData.chequeUtiNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.chequeUtiNo}
                    helperText={fieldErrors.chequeUtiNo}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Chq/ UTI Dt"
                      value={formData.chequeUtiDt ? dayjs(formData.chequeUtiDt, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('chequeUtiDt', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.chequeUtiDt}
                      helperText={fieldErrors.chequeUtiDt ? fieldErrors.chequeUtiDt : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="receiptAmt"
                    name="receiptAmt"
                    label="Receipt Amount"
                    size="small"
                    value={formData.receiptAmt}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.receiptAmt}
                    helperText={fieldErrors.receiptAmt}
                  />
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
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="currencyAmount"
                    name="currencyAmount"
                    size="small"
                    required
                    value={formData.currencyAmount}
                    onChange={handleInputChange}
                    error={!!fieldErrors.currencyAmount}
                    helperText={fieldErrors.currencyAmount}
                    inputProps={{ maxLength: 30 }}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="receivedFrom"
                    name="receivedFrom"
                    label="Received From"
                    size="small"
                    value={formData.receivedFrom}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.receivedFrom}
                    helperText={fieldErrors.receivedFrom}
                  />
                </FormControl>
              </div>
            </div>
            {/* </div> */}

            {/* <div className="card w-full p-6 bg-base-100 shadow-xl mt-2" style={{ padding: '20px' }}> */}
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value={0} label="Invoice Details" />
              <Tab value={1} label="Summary" />
            </Tabs>

            <Box sx={{ padding: 2 }}>
              {value === 0 && (
                <div className="row d-flex ml" style={{ marginTop: '5px' }}>
                  <div className="mb-1">
                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                  </div>
                  <div className="row mt-2">
                    <div className="col-lg-12">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr style={{ backgroundColor: '#673AB7' }}>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                Action
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                S.No
                              </th>
                              <th className="px-2 py-2 text-white text-center">Invoice Number</th>
                              <th className="px-2 py-2 text-white text-center">Invoice Date</th>
                              <th className="px-2 py-2 text-white text-center">Ref No</th>
                              <th className="px-2 py-2 text-white text-center">Ref Date</th>
                              <th className="px-2 py-2 text-white text-center">Master Ref</th>
                              <th className="px-2 py-2 text-white text-center">House Ref</th>
                              <th className="px-2 py-2 text-white text-center">Curr.</th>
                              <th className="px-2 py-2 text-white text-center">Ex. Rate</th>
                              <th className="px-2 py-2 text-white text-center">Amount</th>
                              <th className="px-2 py-2 text-white text-center">Chargeable Amount</th>
                              <th className="px-2 py-2 text-white text-center">Outstanding</th>
                              <th className="px-2 py-2 text-white text-center">Settled</th>
                              <th className="px-2 py-2 text-white text-center">Rec. Ex. Rate</th>
                              <th className="px-2 py-2 text-white text-center">Txn Settled</th>
                              <th className="px-2 py-2 text-white text-center">Gain or Loss</th>
                              {/* <th className="px-2 py-2 text-white text-center">Remarks</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(inVoiceDetailsData) &&
                              inVoiceDetailsData.map((row, index) => (
                                <tr key={row.id}>
                                  <td className="border px-2 py-2 text-center">
                                    <ActionButton
                                      title="Delete"
                                      icon={DeleteIcon}
                                      onClick={() =>
                                        handleDeleteRow(
                                          row.id,
                                          inVoiceDetailsData,
                                          setInVoiceDetailsData,
                                          invoiceDetailsError,
                                          setInvoiceDetailsError
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
                                      value={row.invNo}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[a-zA-Z0-9\s-]*$/;
                                        if (regex.test(value)) {
                                          setInVoiceDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, invNo: value } : r)));
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], invNo: !value ? 'Invoice No is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          // Remove this block to not set any error for non-numeric input
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], invNo: 'Only alphabets and numbers are allowed' }; // Clear the error instead
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.invNo ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.invNo && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].invNo}
                                      </div>
                                    )}
                                  </td>

                                  <td className="border px-2 py-2">
                                    <input
                                      type="date"
                                      value={row.invDate}
                                      onChange={(e) => {
                                        const date = e.target.value;

                                        setInVoiceDetailsData((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id ? { ...r, invDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                          )
                                        );

                                        setInvoiceDetailsError((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            invDate: !date ? 'Invoice Date is required' : ''
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      className={invoiceDetailsError[index]?.invDate ? 'error form-control' : 'form-control'}
                                    />
                                    {invoiceDetailsError[index]?.invDate && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].invDate}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.refNo}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[a-zA-Z0-9\s-]*$/;
                                        if (regex.test(value)) {
                                          setInVoiceDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, refNo: value } : r)));
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], refNo: !value ? 'Ref No is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], refNo: 'Only alphabets and numbers are allowed' };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.refNo ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.refNo && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].refNo}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="date"
                                      value={row.refDate}
                                      onChange={(e) => {
                                        const date = e.target.value;

                                        setInVoiceDetailsData((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id ? { ...r, refDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                          )
                                        );

                                        setInvoiceDetailsError((prev) => {
                                          const newErrors = [...prev];
                                          newErrors[index] = {
                                            ...newErrors[index],
                                            refDate: !date ? 'Ref Date is required' : ''
                                          };
                                          return newErrors;
                                        });
                                      }}
                                      className={invoiceDetailsError[index]?.refDate ? 'error form-control' : 'form-control'}
                                    />
                                    {invoiceDetailsError[index]?.refDate && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].refDate}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.masterRef}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[a-zA-Z0-9\s-]*$/;
                                        if (regex.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, masterRef: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], masterRef: !value ? 'Master Ref is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              masterRef: 'Only alphabets and numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.masterRef ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.masterRef && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].masterRef}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.houseRef}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[a-zA-Z0-9\s-]*$/;
                                        if (regex.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, houseRef: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], houseRef: !value ? 'House Ref is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              houseRef: 'Only alphabets and numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.houseRef ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.houseRef && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].houseRef}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.currency}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^[a-zA-Z0-9\s-]*$/;
                                        if (regex.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, currency: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], currency: !value ? 'Currency is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              currency: 'Only alphabets and numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.currency ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.currency && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].currency}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.exRate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;

                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, exRate: value } : r)));
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], exRate: !value ? 'Ex Rate is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], exRate: 'Only numbers are allowed' };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.exRate ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.exRate && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].exRate}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.amount}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;
                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, amount: value } : r)));
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], amount: !value ? 'Amount is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], amount: 'Only numbers are allowed' };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.amount ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.amount && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].amount}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.chargeAmt}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;
                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, chargeAmt: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], chargeAmt: !value ? 'Charge Amt is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              chargeAmt: 'Only numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.chargeAmt ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.chargeAmt && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].chargeAmt}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.outstanding}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;
                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, outstanding: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              outstanding: !value ? 'Outstanding is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              outstanding: 'Only numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.outstanding ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.outstanding && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].outstanding}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.settled}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;
                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, settled: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], settled: !value ? 'Settled is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], settled: 'Only numbers are allowed' };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.settled ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.settled && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].settled}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.recExRate}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;

                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, recExRate: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              recExRate: !value ? 'Rec Ex Rate is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              recExRate: 'Only numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.recExRate ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.recExRate && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].recExRate}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.txnSettled}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;

                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, txnSettled: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              txnSettled: !value ? 'Txn Settled is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              txnSettled: 'Only numbers are allowed'
                                            };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.txnSettled ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}
                                    />
                                    {invoiceDetailsError[index]?.txnSettled && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].txnSettled}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.gainAmt}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const isNumeric = /^[0-9]*$/;
                                        if (isNumeric.test(value)) {
                                          setInVoiceDetailsData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, gainAmt: value } : r))
                                          );
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], gainAmt: !value ? 'Gain or Loss is required' : '' };
                                            return newErrors;
                                          });
                                        } else {
                                          setInvoiceDetailsError((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], gainAmt: 'Only numbers are allowed' };
                                            return newErrors;
                                          });
                                        }
                                      }}
                                      className={invoiceDetailsError[index]?.gainAmt ? 'error form-control' : 'form-control'}
                                      style={{ width: '150px' }}

                                      // onKeyDown={(e) => handleKeyDown(e, row, inVoiceDetailsData)}
                                    />
                                    {invoiceDetailsError[index]?.gainAmt && (
                                      <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                        {invoiceDetailsError[index].gainAmt}
                                      </div>
                                    )}
                                  </td>
                                  {/* <td className="border px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.remarks}
                                      className="form-control"
                                      style={{ width: '150px' }}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setInVoiceDetailsData((prev) => prev.map((r) => (r.id === row.id ? { ...r, remarks: value } : r)));
                                      }}
                                    />
                                  </td> */}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Box>
            <Box>
              {value === 1 && (
                <div>
                  <div className="row d-flex mt-4">
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="netAmount"
                          name="netAmount"
                          label="Net Amount"
                          size="small"
                          value={formData.netAmount}
                          onChange={handleInputChange}
                          inputProps={{ maxLength: 30 }}
                          error={!!fieldErrors.netAmount}
                          helperText={fieldErrors.netAmount}
                        />
                      </FormControl>
                    </div>

                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="remarks"
                          name="remarks"
                          label="Remarks"
                          size="small"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          inputProps={{ maxLength: 30 }}
                          error={!!fieldErrors.remarks}
                          helperText={fieldErrors.remarks}
                        />
                      </FormControl>
                    </div>
                  </div>
                </div>
              )}
            </Box>
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Receipt;

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { getAllActivecurrency } from 'utils/CommonFunctions';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
import { useSelector } from 'react-redux';



const AdjustmentOffset = () => {
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [listViewData, setListViewData] = useState([]);

  const [currencies, setCurrencies] = useState([]);
  const [allbankName, setAllbankName] = useState([]);
  const [allinvoiceNumber, setAllinvoiceNumber] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [editId, setEditId] = useState('');
  const [data, setData] = useState(true);
  const [value, setValue] = useState(0);
  const [docId, setDocId] = useState('');

  const [formData, setFormData] = useState({
    orgId: orgId,
    invoiceNumber: '',
    docDate: dayjs(),
    receiptPaymentDocId: '',
    receiptPaymentDocDt: dayjs(),
    subledgerType: '',
    currency: '',
    exRate: '',
    subledgerName: '',
    amount: '',
    supplierRefNo: '',
    subledgerCode: '',
    forexGainOrLoss: '',
    totalSettied: '',
    roundoffAmt: '',
    onAccount: '',
    narration: '',

  });
  const [fieldErrors, setFieldErrors] = useState({
    orgId: orgId,
    invoiceNumber: '',
    docDate: dayjs(),
    receiptPaymentDocId: '',
    receiptPaymentDocDt: dayjs(),
    subledgerType: '',
    currency: '',
    exRate: '',
    subledgerName: '',
    amount: '',
    supplierRefNo: '',
    subledgerCode: '',
    forexGainOrLoss: '',
    totalSettied: '',
    roundoffAmt: '',
    onAccount: '',
    narration: '',
  });
  const [detailsTableData, setDetailsTableData] = useState([
    {
      id: Date.now(),
      invoiceNumber: '',
      invDate: null,
      refNo: '',
      refDate: null,
      curr: '',
      exchangeRate: '',
      invoiceAmount: '',
      outStanding: '',
      settled: '',
      settlementExchangeRate: '',
      txnSettled: '',
      gainorLoss: '',
      remarks: '',
    },
  ]);

  const [detailsTableErrors, setDetailsTableErrors] = useState([
    {
      id: 1,
      invoiceNumber: '',
      invDate: '',
      refNo: '',
      refDate: '',
      curr: '',
      exchangeRate: '',
      invoiceAmount: '',
      outStanding: '',
      settled: '',
      settlementExchangeRate: '',
      txnSettled: '',
      gainorLoss: '',
      remarks: '',
    }
  ]);

  const listViewColumns = [
    { accessorKey: 'currency', header: 'Subledger Type', size: 140 },
    { accessorKey: 'exRate', header: 'currency', size: 140 },
    { accessorKey: 'docId', header: 'ExRate', size: 140 },
    { accessorKey: 'docDate', header: 'Subledger Name', size: 140 }
  ];
  useEffect(() => {
    getAllArApAdjustmentOffSet();
  }, []);


  const getAllArApAdjustmentOffSetById = async (row) => {
    console.log('Row clicked:', row);
    setShowForm(true);

    try {
      const result = await apiCalls(
        'get',
        `transaction/getAllArApAdjustmentOffSetById?id=${row.original.id}`
      );

      if (result) {
        const AdOffSet = result.paramObjectsMap.arApAdjustmentOffSetVO[0];

        // Update form data with the API response
        setEditId(row.original.id);
        setDocId(AdOffSet.docId); // Correct assignment
        setFormData({
          orgId: AdOffSet.orgId,
          docDate: AdOffSet.docDate ? dayjs(AdOffSet.docDate) : null, // Parse date with `dayjs`
          receiptPaymentDocId: AdOffSet.receiptPaymentDocId, // Correct field mapping
          receiptPaymentDocDt: AdOffSet.receiptPaymentDocDate ? dayjs(AdOffSet.receiptPaymentDocDate) : null, // Parse date
          subledgerType: AdOffSet.subLedgerType,
          currency: AdOffSet.currency,
          exRate: AdOffSet.exRate,
          subledgerName: AdOffSet.subLedgerName,
          amount: AdOffSet.amount,
          supplierRefNo: AdOffSet.supplierRefNo,
          subledgerCode: AdOffSet.subLedgerCode,
          forexGainOrLoss: AdOffSet.forexGainOrLoss,
          totalSettied: AdOffSet.totalSettled,
          roundoffAmt: AdOffSet.roundOffAmount,
          onAccount: AdOffSet.onAccount,
          narration: AdOffSet.narration,
        });

        // Update details table data with the invoice details from the API response
        setDetailsTableData(
          AdOffSet.arApAdjustmentInvoiceDetailsVO.map((detail) => ({
            id: detail.id,
            invoiceNumber: detail.invoiceNo,
            invDate: detail.invoiceDate ? dayjs(detail.invoiceDate) : null, // Parse date
            refNo: detail.refNo,
            refDate: detail.refDate ? dayjs(detail.refDate) : null, // Parse date
            curr: detail.curr,
            exchangeRate: detail.exRate,
            invoiceAmount: detail.invAmount,
            outStanding: detail.outStanding,
            settled: detail.settled,
            settlementExchangeRate: detail.setExRate,
            txnSettled: detail.tnxSettled,
            gainorLoss: detail.gainOrLoss,
            remarks: detail.remarks,
          }))
        );

        console.log('Data to edit:', AdOffSet);
      }
    } catch (error) {
      console.error('Error fetching adjustment offset by ID:', error);
    }
  };



  useEffect(() => {
    getAllArApAdjustmentOffSet();
  }, []);

  const getAllArApAdjustmentOffSet = async () => {
    try {
      const response = await apiCalls('get', `transaction/getAllArApAdjustmentOffSetByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.arApAdjustmentOffSetVO.reverse());
        console.log("response", response);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  const handleClear = () => {
    setFormData({
      receiptPaymentDocId: '',
      subledgerType: '',
      currency: '',
      exRate: '',
      subledgerName: '',
      amount: '',
      supplierRefNo: '',
      subledgerCode: '',
      forexGainOrLoss: '',
      totalSettied: '',
      roundoffAmt: '',
      onAccount: '',
      narration: '',
    });
    setFieldErrors({
      receiptPaymentDocId: '',
      subledgerType: '',
      currency: '',
      exRate: '',
      subledgerName: '',
      amount: '',
      supplierRefNo: '',
      subledgerCode: '',
      forexGainOrLoss: '',
      totalSettied: '',
      roundoffAmt: '',
      onAccount: '',
      narration: '',
    });
    setDetailsTableData([{
      invoiceNumber: '',
      refNo: '',
      curr: '',
      exchangeRate: '',
      invoiceAmount: '',
      outStanding: '',
      settled: '',
      settlementExchangeRate: '',
      txnSettled: '',
      gainorLoss: '',
      remarks: '',
    }]);
    setDetailsTableErrors('');
    getArApAdjustmentOffSetDocId()
    setEditId('');
  };

  const handleView = () => {
    setShowForm(!showForm);
  };

  const getAllAdjustmentOffsetById = async (row) => {
    console.log('first', row);
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(detailsTableData)) {
      displayRowError(detailsTableData);
      return;
    }

    const newRow = {
      id: Date.now(),
      invoiceNumber: '',
      invDate: null,
      refNo: '',
      refDate: null,
      curr: '',
      exchangeRate: '',
      invoiceAmount: '',
      outStanding: '',
      settled: '',
      settlementExchangeRate: '',
      txnSettled: '',
      gainorLoss: '',
      remarks: '',
    };

    console.log('Adding new row:', newRow);

    // Update the table data
    setDetailsTableData((prevData) => [...prevData, newRow]);
    setDetailsTableErrors((prevErrors) => [
      ...prevErrors,
      {
        invoiceNumber: '',
        invDate: '',
        refNo: '',
        refDate: '',
        curr: '',
        exchangeRate: '',
        invoiceAmount: '',
        outStanding: '',
        settled: '',
        settlementExchangeRate: '',
        txnSettled: '',
        gainorLoss: '',
        remarks: '',
      },
    ]);
  };
  useEffect(() => {
    console.log('Updated detailsTableData:', detailsTableData);
  }, [detailsTableData]);


  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false; // No rows to validate

    // Log the lastRow for debugging
    console.log('Last row:', lastRow);

    // Check required fields in the last row
    return (
      !lastRow.invoiceNumber ||
      !lastRow.invDate ||
      !lastRow.refNo ||
      !lastRow.refDate ||
      !lastRow.curr ||
      !lastRow.exchangeRate ||
      !lastRow.invoiceAmount ||
      !lastRow.outStanding ||
      !lastRow.settled ||
      !lastRow.settlementExchangeRate ||
      !lastRow.txnSettled ||
      !lastRow.gainorLoss ||
      !lastRow.remarks
    );
  };


  const displayRowError = (table) => {
    if (table === detailsTableData) {
      setDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        const lastRow = table[table.length - 1];
        const index = table.length - 1;

        // Update errors for the last row
        newErrors[index] = {
          ...newErrors[index],
          invoiceNumber: !lastRow.invoiceNumber ? 'Invoice Number is required' : '',
          invDate: !lastRow.invDate ? 'Invoice Date is required' : '',
          refNo: !lastRow.refNo ? 'Reference Number is required' : '',
          refDate: !lastRow.refDate ? 'Reference Date is required' : '',
          curr: !lastRow.curr ? 'curr is required' : '',
          exchangeRate: !lastRow.exchangeRate ? 'Exchange Rate is required' : '',
          invoiceAmount: !lastRow.invoiceAmount ? 'Invoice Amount is required' : '',
          outStanding: !lastRow.outStanding ? 'Outstanding Amount is required' : '',
          settled: !lastRow.settled ? 'Settled Amount is required' : '',
          settlementExchangeRate: !lastRow.settlementExchangeRate
            ? 'Settlement Exchange Rate is required'
            : '',
          txnSettled: !lastRow.txnSettled ? 'Transaction Settled is required' : '',
          gainorLoss: !lastRow.gainorLoss ? 'Gain or Loss is required' : '',
          remarks: !lastRow.remarks ? 'Remarks are required' : '',
        };

        console.log('Updated errors for last row:', newErrors[index]);
        return newErrors;
      });
    }
  };


  // DocId  
  useEffect(() => {
    getArApAdjustmentOffSetDocId()
  }, [])
  const getArApAdjustmentOffSetDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getArApAdjustmentOffSetDocId?branchCode=${branchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      console.log('docid working');

      setDocId(response.paramObjectsMap.arApAdjustmentOffSetDocId);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
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



  const handlerefNoChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, refNo: value, invoiceDate: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          refNo: !value ? 'refNo Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {

    };

  }, []);

  // useEffect(() => {
  //   const totalinvoiceDate = detailsTableData.reduce((sum, row) => sum + Number(row.invoiceDate || 0), 0);
  //   const totalrefNo = detailsTableData.reduce((sum, row) => sum + Number(row.refNo || 0), 0);
  //   const withdrawalAmount = formData.withdrawalAmount || 0;
  //   console.log(withdrawalAmount);

  //   setFormData((prev) => ({
  //     ...prev,
  //     totalinvoiceDateAmount: totalinvoiceDate,
  //     totalrefNoAmount: totalrefNo,
  //     totalAmount: withdrawalAmount
  //   }));
  // }, [detailsTableData]);



  const handleSave = async () => {
    const errors = {};
    if (!formData.receiptPaymentDocId) {
      errors.receiptPaymentDocId = ' Receipt/Payment Doc Id is required';
    }
    if (!formData.subledgerType) {
      errors.subledgerType = 'Subledger Type is required';
    }
    if (!formData.currency) {
      errors.currency = 'currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'ExRate is required';
    }
    if (!formData.subledgerName) {
      errors.subledgerName = 'Subledger Name is required';
    }
    if (!formData.amount) {
      errors.amount = 'Amount Name is required';
    }
    if (!formData.supplierRefNo) {
      errors.supplierRefNo = 'Supplier RefNo Name is required';
    }
    if (!formData.subledgerCode) {
      errors.subledgerCode = 'Subledger Code RefNo Name is required';
    }
    let detailTableDataValid = true;
    const newTableErrors = detailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.invoiceNumber) {
        rowErrors.invoiceNumber = 'Invoice Number is required';
        detailTableDataValid = false;
      }  
      return rowErrors;
    });
    setFieldErrors(errors);
    setDetailsTableErrors(newTableErrors);
    if (Object.keys(errors).length === 0 && detailTableDataValid) {
      const AdjustmentOffSet = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        invoiceNumber: row.invoiceNumber,
        invoiceDate: formData.invDate ? formData.invDate.format('YYYY-MM-DD') : '',
        refNo: row.refNo,
        refDate: formData.refDate ? formData.refDate.format('YYYY-MM-DD') : '',
        curr: row.curr,
        exRate: row.exchangeRate,
        invAmount: row.invoiceAmount,
        outStanding: row.outStanding,
        settled: row.settled,
        setExRate: row.settlementExchangeRate,
        txnSettled: row.txnSettled,
        gainOrLoss: row.gainorLoss,
        remarks: row.remarks,
      }));
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        finYear: finYear,
        orgId: parseInt(orgId),
        arApOffSetInvoiceDetailsDTO: AdjustmentOffSet,
        receiptPaymentDocId: formData.receiptPaymentDocDt,
        subLedgerType: formData.subledgerType,
        currency: formData.currency,
        exRate: parseInt(formData.exRate, 10),
        subLedgerName: formData.subledgerName,
        amount: parseInt(formData.amount, 10),
        supplierRefNo: formData.supplierRefNo,
        subLedgerCode: formData.subledgerCode,
        forexGainOrLoss: parseInt(formData.forexGainOrLoss, 10),
        totalSettled: parseInt(formData.totalSettied, 10),
        roundOffAmount: parseInt(formData.roundoffAmt, 10),
        onAccount: parseInt(formData.onAccount, 10),
        narration: formData.narration,
        invoiceDate: formData.invDate ? formData.invDate.format('YYYY-MM-DD') : '',
        refDate: formData.refDate ? formData.refDate.format('YYYY-MM-DD') : '',
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `transaction/updateCreateArApAdjustmentOffSet`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'AdjustmentOffset Successfully' : 'AdjustmentOffset Created successfully');
          handleClear();
          getAllArApAdjustmentOffSet();
        } else {
          showToast('error', response.paramObjectsMap.message || 'AdjustmentOffset creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'AdjustmentOffset creation failed');
      }
    } else {
      setFieldErrors(errors);
    }
  };


  const handleDateChange = (date, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: date ? dayjs(date) : null // Ensure date is a Day.js object
    });
  };

  const handleInputChange = (e, fieldName = null) => {
    let name, value;

    if (fieldName) {
      // Case for DatePicker or components providing direct values
      name = fieldName;
      value = e; // `e` is the value passed directly (e.g., date)
    } else {
      // Case for standard input fields and dropdowns
      name = e.target.name;
      value = e.target.value;
    }

    // Skip regex validation for dropdown fields
    const dropdownFields = ["subledgerType"]; // Add other dropdown field names if needed
    if (!dropdownFields.includes(name)) {
      const regex = /^[a-zA-Z0-9\s-]*$/;
      if (!regex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: "Only alphabets and numbers are allowed",
        }));
        return;
      }
    }

    // Clear errors for the field and update form data
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputDropdownChange = (e) => {
    const { name, value } = e.target; // Extract name and value from event

    // Validate and update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear or set errors
    setFieldErrors((prev) => ({
      ...prev,
      [name]: value ? "" : "This field is required",
    }));
  };



  const handleCurrChange = (e, row, index) => {
    const value = e.target.value;

    // Allow up to 20 digits
    if (/^\d{0,20}$/.test(value)) {
      // Update table data
      setDetailsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, curr: value, debit: value ? '0' : '' }
            : r
        )
      );

      // Update errors
      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          curr: !value ? 'Currency Amount is required' : '',
        };
        return newErrors;
      });
    }
  };
  const handleExchangeRateChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, exchangeRate: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          exchangeRate: !value ? 'ExchangeRate Amount is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleInvoiceAmountChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, invoiceAmount: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          invoiceAmount: !value ? 'InvoiceAmount Amount is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleoutStandingChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, outStanding: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          outStanding: !value ? 'outStanding Amount is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleSettledChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, settled: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          settled: !value ? 'settled Amount is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleSettlementExchangeRateChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, settlementExchangeRate: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          settlementExchangeRate: !value ? 'Settlement Exchange Rate Amount is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleTransactionSettledChange = (e, row, index) => {
    const value = e.target.value;

    // Allow only up to 20 digits
    if (/^\d{0,20}$/.test(value)) {
      // Update table data
      setDetailsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, txnSettled: value, debit: value ? '0' : '' }
            : r
        )
      );

      // Update errors
      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          txnSettled: !value ? 'Transaction Settled is required' : '',
        };
        return newErrors;
      });
    }
  };

  const handlehandleGainorLossChangeChange = (e, row, index) => {
    const value = e.target.value;

    if (/^\d{0,20}$/.test(value)) {
      setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, gainorLoss: value, debit: value ? '0' : '' } : r)));

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          gainorLoss: !value ? 'Gain Or Loss is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleRemarksChange = (e, row, index) => {
    const value = e.target.value;

    // Allow any input up to 20 characters
    if (value.length <= 20) {
      setDetailsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, remarks: value, debit: value ? '0' : '' } : r
        )
      );

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          remarks: !value ? 'Gain Or Loss is required' : '' // Error if empty
        };
        return newErrors;
      });
    }
  };
  const handleInvoiceNumberChange = (e, row, index) => {
    const value = e.target.value;

    // Allow any input up to 20 characters
    if (value.length <= 20) {
      setDetailsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, invoiceNumber: value, debit: value ? '0' : '' } : r
        )
      );

      setDetailsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          invoiceNumber: !value ? 'Gain Or Loss is required' : '' // Error if empty
        };
        return newErrors;
      });
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
                  <TextField id="docId" label="Document No" variant="outlined" size="small" fullWidth name="docId" value={docId} disabled />
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
                  <TextField
                    id="receiptPaymentDocId"
                    label={
                      <span>
                        Receipt/Payment Doc Id <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="receiptPaymentDocId"
                    value={formData.receiptPaymentDocId}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.receiptPaymentDocId ? fieldErrors.receiptPaymentDocId : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.receiptPaymentDocId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Receipt/Payment Doc Dt"
                        value={formData.docDate}
                        onChange={(date) => handleDateChange('receiptPaymentDocDt', date)}
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
                  {/* <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.subledgerType}>
                    <InputLabel id="subledgerType">Subledger Type</InputLabel>
                    <Select
                      labelId="subledgerType"
                      label="Subledger Type"
                      value={formData.subledgerType}
                      onChange={handleInputChange}
                      name="subledgerType"
                    >
                      <MenuItem value="BANK RECEIPT">BANK RECEIPT</MenuItem>
                      <MenuItem value="CASH RECEIPT">CASH RECEIPT</MenuItem>
                    </Select>
                    {fieldErrors.subledgerType && <FormHelperText>{fieldErrors.subledgerType}</FormHelperText>}
                  </FormControl> */}
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.subledgerType}>
                    <InputLabel id="subledgerType">Subledger Type</InputLabel>
                    <Select
                      labelId="subledgerType"
                      label="Subledger Type"
                      value={formData.subledgerType}
                      onChange={handleInputDropdownChange}
                      name="subledgerType" // Ensure 'name' matches the state field
                    >
                      <MenuItem value="BANK RECEIPT">BANK RECEIPT</MenuItem>
                      <MenuItem value="CASH RECEIPT">CASH RECEIPT</MenuItem>
                    </Select>
                    {fieldErrors.subledgerType && <FormHelperText>{fieldErrors.subledgerType}</FormHelperText>}
                  </FormControl>
                </div>


                <div className="col-md-3 mb-3">
                  <TextField
                    id="currency"
                    label="currency"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.currency ? fieldErrors.currency : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.currency}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="exrate"
                    label="ExRate"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="exRate"
                    value={formData.exRate}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.exRate ? fieldErrors.exRate : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.exRate}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="subledgerName"
                    label="Subledger Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="subledgerName"
                    value={formData.subledgerName}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.subledgerName ? fieldErrors.subledgerName : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.subledgerName}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="Amount"
                    label="Amount"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.amount ? fieldErrors.amount : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.amount}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="supplierRefNo"
                    label="Supplier Ref No"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="supplierRefNo"
                    value={formData.supplierRefNo}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.supplierRefNo ? fieldErrors.supplierRefNo : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.supplierRefNo}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="subledgerCode"
                    label="Subledger Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="subledgerCode"
                    value={formData.subledgerCode}
                    onChange={handleInputChange}
                    helperText={<span style={{ color: 'red' }}>{fieldErrors.subledgerCode ? fieldErrors.subledgerCode : ''}</span>}
                    inputProps={{ maxLength: 40 }}
                    error={!!fieldErrors.subledgerCode}
                  />
                </div>

              </div>

              <>
                <div className="row mt-2">
                  <Box sx={{ width: '100%' }}>
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
                                      <th className="table-header">Invoice Number</th>
                                      <th className="table-header">Invoice Date</th>
                                      <th className="table-header">Reference Number</th>
                                      <th className="table-header">Reference Date</th>
                                      <th className="table-header">currency</th>
                                      <th className="table-header">Exchange Rate</th>
                                      <th className="table-header">Invoice Amount</th>
                                      <th className="table-header">outStanding Amount</th>
                                      <th className="table-header">Settled Amount</th>
                                      <th className="table-header">Settlement Exchange Rate</th>
                                      <th className="table-header">Txn Settled</th>
                                      <th className="table-header">Gain or Loss</th>
                                      <th className="table-header">Remarks</th>
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
                                        {/* <td> 
                                          <TextField
                                            id="invoiceNumber"
                                            label="invoiceNumber"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            name="invoiceNumber"
                                            value={formData.invoiceNumber}
                                            onChange={handleInputChange}
                                            error={!!detailsTableErrors[index]?.invoiceNumber}
                                            helperText={detailsTableErrors[index]?.invoiceNumber}
                                            style={{ width: "200px" }}
                                          // helperText={<span style={{ color: 'red' }}>
                                          //   {fieldErrors.invoiceNumber ? fieldErrors.invoiceNumber : ''}</span>}
                                          // inputProps={{ maxLength: 40 }}
                                          // error={!!fieldErrors.invoiceNumber}
                                          />
                                        </td> */}

                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.invoiceNumber}
                                            onChange={(e) => handleInvoiceNumberChange(e, row, index)}
                                            maxLength="20" // Limit input to 20 characters
                                            className={
                                              detailsTableErrors[index]?.invoiceNumber ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {detailsTableErrors[index]?.invoiceNumber && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].invoiceNumber}
                                            </div>
                                          )}
                                        </td>

                                        <td className="border px-2 py-2">
                                          <input
                                            type="date"
                                            value={row.invDate}
                                            onChange={(e) => {
                                              const date = e.target.value;

                                              setDetailsTableData((prev) =>
                                                prev.map((r) =>
                                                  r.id === row.id ? { ...r, invDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                                )
                                              );

                                              setDetailsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  invDate: !date ? 'Invoice Date is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            className={detailsTableData[index]?.invDate ? 'error form-control' : 'form-control'}
                                          />
                                          {/* {detailsTableData[index]?.invDate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableData[index].invDate}
                                            </div>
                                          )} */}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.refNo}
                                            onChange={(e) => handlerefNoChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.refNo ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.refNo && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].refNo}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="date"
                                            value={row.refDate}
                                            onChange={(e) => {
                                              const date = e.target.value;

                                              setDetailsTableData((prev) =>
                                                prev.map((r) =>
                                                  r.id === row.id ? { ...r, refDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                                )
                                              );

                                              setDetailsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  refDate: !date ? 'Invoice Date is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            className={detailsTableData[index]?.refDate ? 'error form-control' : 'form-control'}
                                          />
                                          {/* {detailsTableData[index]?.refDate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableData[index].refDate}
                                            </div>
                                          )} */}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.curr}
                                            onChange={(e) => handleCurrChange(e, row, index)}
                                            maxLength="20"
                                            className={
                                              detailsTableErrors[index]?.curr ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {detailsTableErrors[index]?.curr && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].curr}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.exchangeRate}
                                            onChange={(e) => handleExchangeRateChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.exchangeRate ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.exchangeRate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].exchangeRate}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.invoiceAmount}
                                            onChange={(e) => handleInvoiceAmountChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.invoiceAmount ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.invoiceAmount && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].invoiceAmount}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.outStanding}
                                            onChange={(e) => handleoutStandingChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.outStanding ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.outStanding && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].outStanding}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.settled}
                                            onChange={(e) => handleSettledChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.settled ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.settled && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].settled}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.settlementExchangeRate}
                                            onChange={(e) => handleSettlementExchangeRateChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.settlementExchangeRate ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.settlementExchangeRate && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].settlementExchangeRate}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.txnSettled}
                                            onChange={(e) => handleTransactionSettledChange(e, row, index)}
                                            maxLength="20"
                                            className={
                                              detailsTableErrors[index]?.txnSettled ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {detailsTableErrors[index]?.txnSettled && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].txnSettled}
                                            </div>
                                          )}
                                        </td>


                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.gainorLoss}
                                            onChange={(e) => handlehandleGainorLossChangeChange(e, row, index)}
                                            maxLength="20"
                                            className={detailsTableErrors[index]?.gainorLoss ? 'error form-control' : 'form-control'}
                                          />
                                          {detailsTableErrors[index]?.gainorLoss && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].gainorLoss}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            value={row.remarks}
                                            onChange={(e) => handleRemarksChange(e, row, index)}
                                            maxLength="20" // Limit input to 20 characters
                                            className={
                                              detailsTableErrors[index]?.remarks ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {detailsTableErrors[index]?.remarks && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {detailsTableErrors[index].remarks}
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
                              label="Forex Gain or Loss"
                              variant="outlined"
                              size="small"
                              fullWidth
                              name="forexGainOrLoss"
                              value={formData.forexGainOrLoss}
                              onChange={handleInputChange}
                              // disabled
                              helperText={
                                <span style={{ color: 'red' }}>{fieldErrors.forexGainOrLoss ? fieldErrors.forexGainOrLoss : ''}</span>
                              }
                              inputProps={{ maxLength: 40 }}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <TextField
                              id="outlined-textarea-zip"
                              label="Total Settied"
                              variant="outlined"
                              size="small"
                              fullWidth
                              name="totalSettied"
                              value={formData.totalSettied}
                              onChange={handleInputChange}
                              // disabled
                              helperText={
                                <span style={{ color: 'red' }}>{fieldErrors.totalSettied ? fieldErrors.totalSettied : ''}</span>
                              }
                              inputProps={{ maxLength: 40 }}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <TextField
                              id="outlined-textarea-zip"
                              label="Round Off Amt"
                              variant="outlined"
                              size="small"
                              fullWidth
                              name="roundoffAmt"
                              value={formData.roundoffAmt}
                              onChange={handleInputChange}
                              // disabled
                              helperText={<span style={{ color: 'red' }}>{fieldErrors.roundoffAmt ? fieldErrors.roundoffAmt : ''}</span>}
                              inputProps={{ maxLength: 40 }}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <TextField
                              id="outlined-textarea-zip"
                              label="On Account"
                              variant="outlined"
                              size="small"
                              fullWidth
                              name="onAccount"
                              value={formData.onAccount}
                              onChange={handleInputChange}
                              // disabled
                              helperText={<span style={{ color: 'red' }}>{fieldErrors.onAccount ? fieldErrors.onAccount : ''}</span>}
                              inputProps={{ maxLength: 40 }}
                            />
                          </div>
                        </div>
                        <div className="row d-flex">
                          <div className="col-md-8">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="narration"
                                label="Narration"
                                size="small"
                                name="narration"
                                value={formData.narration}
                                multiline
                                minRows={2}
                                inputProps={{ maxLength: 30 }}
                                onChange={handleInputChange}
                              />
                            </FormControl>
                          </div>
                        </div>
                      </>
                    )}
                  </Box>
                </div>
              </>
            </>
          ) : (
            // <CommonTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getAllArApAdjustmentOffSetById} />
            <CommonTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getAllArApAdjustmentOffSetById}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AdjustmentOffset;

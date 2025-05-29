import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Autocomplete, Chip, FormHelperText, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
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
import ConfirmationModal from 'utils/confirmationPopup';
import GeneratePdfTempIRN from 'utils/pdfTempIRN';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from '../../basicMaster/CommonListViewTable';

const IrnCreditNote = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const theme = useTheme();
  const anchorRef = useRef(null);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allPartyName, setAllPartyName] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [docId, setDocId] = useState('');
  const [value, setValue] = useState('1');
  const [partyTypeData, setPartyTypeData] = useState([]);
  const [originBillList, setOriginBillList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [approveStatus, setApproveStatus] = useState('');
  const [formData, setFormData] = useState({
    vohNo: '',
    vohDate: null,
    approveStatus: '',
    approveBy: '',
    approveOn: '',
    partyType: '',
    partyName: '',
    originBill: '',
    partyCode: '',
    supplierRefNo: '',
    supplierRefDate: null,
    // currentDate: dayjs(),
    // currentDateValue: '',
    // product: '',
    creditDays: '',
    // dueDate: null,
    currency: '',
    exRate: '',
    status: '',
    // remarks: '',
    address: '',
    shipRefNo: '',
    pincode: '',
    gstType: '',
    billingMonth: '',
    // otherInfo: '',
    salesType: '',
    exAmount: '',
    creditRemarks: '',
    // charges: '',
    stateCode: '',
    stateNo: '',
    recipientGSTIN: '',
    placeOfSupply: '',
    addressType: '',
    roundOff: '',
    totChargesBillCurrAmt: '',
    totChargesLCAmt: '',
    totGrossBillAmt: '',
    totGrossLCAmt: '',
    netBillCurrAmt: '',
    netLCAmt: '',
    summaryExRate: '',
    amtInWords: '',
    totTaxAmt: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    vohNo: '',
    vohDate: null,
    partyType: '',
    partyName: '',
    originBill: '',
    partyCode: '',
    supplierRefNo: '',
    supplierRefDate: null,
    // currentDate: dayjs(),
    // currentDateValue: '',
    // product: '',
    creditDays: '',
    // dueDate: null,
    currency: '',
    exRate: '',
    status: '',
    // remarks: '',
    address: '',
    shipRefNo: '',
    pincode: '',
    gstType: '',
    billingMonth: '',
    // otherInfo: '',
    salesType: '',
    exAmount: '',
    creditRemarks: '',
    // charges: '',
    stateCode: '',
    stateNo: '',
    recipientGSTIN: '',
    placeOfSupply: '',
    addressType: '',
    roundOff: '',
    totChargesBillCurrAmt: '',
    totChargesLCAmt: '',
    totGrossBillAmt: '',
    totGrossLCAmt: '',
    netBillCurrAmt: '',
    netLCAmt: '',
    summaryExRate: '',
    amtInWords: '',
    totTaxAmt: ''
  });

  const [irnChargesData, setIrnChargesData] = useState([
    {
      id: 1,
      // jobNo: '',
      chargeType: '',
      chargeCode: '',
      govChargeCode: '',
      ledger: '',
      chargeName: '',
      taxable: '',
      // applyOn: '',
      qty: '',
      rate: '',
      currency: '',
      exRate: '',
      exempted: '',
      fcAmount: '',
      lcAmount: '',
      tlcAmount: '',
      billAmount: '',
      sac: '',
      gstAmount: '',
      gstpercent: ''
    }
  ]);

  const [irnChargesError, setIrnChargesError] = useState([
    {
      // jobNo: '',
      chargeType: '',
      chargeCode: '',
      govChargeCode: '',
      ledger: '',
      chargeName: '',
      taxable: '',
      // applyOn: '',
      qty: '',
      rate: '',
      currency: '',
      exRate: '',
      exempted: '',
      fcAmount: '',
      lcAmount: '',
      tlcAmount: '',
      billAmount: '',
      sac: '',
      gstAmount: '',
      gstpercent: ''
    }
  ]);

  const [irnGstData, setIrnGstData] = useState([
    {
      id: 1,
      chargeAcc: '',
      subLodgerCode: '',
      crBillAmt: '',
      crLCAmt: null,
      gstRemarks: '',
      dbillAmt: '',
      dblcamt: ''
    }
  ]);

  const [irnGstError, setIrnGstError] = useState([
    {
      chargeAcc: '',
      subLodgerCode: '',
      crBillAmt: '',
      crLCAmt: null,
      gstRemarks: '',
      dbillAmt: '',
      dblcamt: ''
    }
  ]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    // Define regex for numeric fields
    const isNumeric = /^[0-9]*$/;

    // Validation logic for numeric fields
    const numericFields = [
      'pincode',
      'creditDays',
      // 'currentDateValue',
      'exRate',
      'netBillCurrAmt',
      'netLCAmt',
      'roundOff',
      'totChargesBillCurrAmt',
      'totChargesLCAmt',
      'totGrossBillAmt',
      'totGrossLCAmt',
      'summaryExRate',
      'totTaxAmt'
    ]; // Add other numeric fields if needed
    if (numericFields.includes(name)) {
      if (!isNumeric.test(value)) {
        setFieldErrors({
          ...fieldErrors,
          [name]: 'Only numbers are allowed'
        });
        return; // Prevent further form updates if invalid input
      }
    }

    // Handle other fields
    setFormData({ ...formData, [name]: inputValue });

    // Clear error when input is valid
    setFieldErrors({ ...fieldErrors, [name]: false });

    if (name === 'partyType') {
      setFormData({ ...formData, partyType: inputValue, partyName: '', partyCode: '' });
      getAllPartyName(inputValue); // Fetch all party names based on selected partyType
      return;
    }

    if (name === 'partyName') {
      const selectedParty = allPartyName.find((party) => party.partyName === value);
      setFormData({
        ...formData,
        partyName: value,
        partyCode: selectedParty ? selectedParty.partyCode : ''
      });
      return;
    }

    // If the currency field is being changed, update exRate based on the selected currency's sellingExRate
    if (name === 'currency') {
      const selectedCurrency = currencies.find((currency) => currency.currency === value);
      if (selectedCurrency) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          exRate: selectedCurrency.sellingExRate
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
      vohNo: '',
      vohDate: null,
      partyType: '',
      partyName: '',
      originBill: '',
      partyCode: '',
      supplierRefNo: '',
      supplierRefDate: null,
      // currentDate: dayjs(),
      // currentDateValue: '',
      // product: '',
      creditDays: '',
      // dueDate: null,
      currency: '',
      exRate: '',
      status: '',
      // remarks: '',
      address: '',
      shipRefNo: '',
      pincode: '',
      gstType: '',
      billingMonth: '',
      // otherInfo: '',
      salesType: '',
      exAmount: '',
      creditRemarks: '',
      // charges: '',
      stateCode: '',
      stateNo: '',
      recipientGSTIN: '',
      placeOfSupply: '',
      addressType: '',
      roundOff: '',
      totChargesBillCurrAmt: '',
      totChargesLCAmt: '',
      totGrossBillAmt: '',
      totGrossLCAmt: '',
      netBillCurrAmt: '',
      netLCAmt: '',
      summaryExRate: '',
      amtInWords: '',
      totTaxAmt: ''
    });

    setFieldErrors({
      vohNo: '',
      vohDate: null,
      partyType: '',
      partyName: '',
      originBill: '',
      partyCode: '',
      supplierRefNo: '',
      supplierRefDate: null,
      // currentDate: dayjs(),
      // currentDateValue: '',
      // product: '',
      creditDays: '',
      // dueDate: null,
      currency: '',
      exRate: '',
      status: '',
      // remarks: '',
      address: '',
      shipRefNo: '',
      pincode: '',
      gstType: '',
      billingMonth: '',
      // otherInfo: '',
      salesType: '',
      exAmount: '',
      creditRemarks: '',
      // charges: '',
      stateCode: '',
      stateNo: '',
      recipientGSTIN: '',
      placeOfSupply: '',
      addressType: '',
      roundOff: '',
      totChargesBillCurrAmt: '',
      totChargesLCAmt: '',
      totGrossBillAmt: '',
      totGrossLCAmt: '',
      netBillCurrAmt: '',
      netLCAmt: '',
      summaryExRate: '',
      amtInWords: '',
      totTaxAmt: ''
    });

    setIrnChargesData([
      {
        // id: 1,
        // jobNo: '',
        chargeType: '',
        chargeCode: '',
        govChargeCode: '',
        ledger: '',
        chargeName: '',
        taxable: '',
        // applyOn: '',
        qty: '',
        rate: '',
        currency: '',
        exRate: '',
        exempted: '',
        fcAmount: '',
        lcAmount: '',
        tlcAmount: '',
        billAmount: '',
        sac: '',
        gstAmount: '',
        gstpercent: ''
      }
    ]);
    setIrnChargesError('');
    setEditId('');
    // setDocId('');
    getIrnCreditNoteDocId();
    setIrnGstData([
      {
        chargeAcc: '',
        subLodgerCode: '',
        crBillAmt: '',
        crLCAmt: null,
        gstRemarks: '',
        dbillAmt: '',
        dblcamt: ''
      }
    ]);
    setIrnGstError('');
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleTabSelect = (index) => {
    setTabIndex(index);
  };

  const handleOpenModalApprove = () => {
    setModalOpen(true);
    setApproveStatus('Approved');
  };

  const handleOpenModalReject = () => {
    setModalOpen(true);
    setApproveStatus('Rejected');
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleConfirmAction = async () => {
    try {
      const result = await apiCalls(
        'put',
        `/taxInvoice/approveTaxInvoice?orgId=${orgId}&action=${approveStatus}&actionBy=${loginUserName}&docId=${formData.docId}&id=${formData.id}`
      );
      console.log('API Response:==>', result);

      if (result.status === true) {
        setFormData({ ...formData, approveStatus: result.paramObjectsMap.taxInvoiceVO.approveStatus });
        showToast(
          result.paramObjectsMap.taxInvoiceVO.approveStatus === 'Approved' ? 'success' : 'error',
          result.paramObjectsMap.taxInvoiceVO.approveStatus === 'Approved'
            ? ' TaxInvoice Approved successfully'
            : 'TaxInvoice Rejected successfully'
        );

        const listValueVO = result.paramObjectsMap.taxInvoiceVO;

        setFormData({
          docId: listValueVO.docId,
          approveStatus: listValueVO.approveStatus,
          approveBy: listValueVO.approveBy,
          approveOn: listValueVO.approveOn,
          docDate: listValueVO.docDate,
          type: listValueVO.type,
          partyCode: listValueVO.partyCode,
          partyName: listValueVO.partyName,
          partyType: listValueVO.partyType,
          bizType: listValueVO.bizType,
          bizMode: listValueVO.bizMode,
          stateNo: listValueVO.stateNo,
          stateCode: listValueVO.stateCode,
          address: listValueVO.address,
          addressType: listValueVO.addressType,
          gstType: listValueVO.gstType,
          pinCode: listValueVO.pinCode,
          placeOfSupply: listValueVO.placeOfSupply,
          recipientGSTIN: listValueVO.recipientGSTIN,
          billCurr: listValueVO.billCurr,
          status: listValueVO.status,
          salesType: listValueVO.salesType,
          updatedBy: listValueVO.updatedBy,
          supplierBillNo: listValueVO.supplierBillNo,
          supplierBillDate: listValueVO.supplierBillDate,
          billCurrRate: listValueVO.billCurrRate,
          exAmount: listValueVO.exAmount,
          creditDays: listValueVO.creditDays,
          contactPerson: listValueVO.contactPerson,
          shipperInvoiceNo: listValueVO.shipperInvoiceNo,
          billOfEntry: listValueVO.billOfEntry,
          billMonth: listValueVO.billMonth,
          invoiceNo: listValueVO.invoiceNo,
          invoiceDate: listValueVO.invoiceDate,
          id: listValueVO.id,
          totalChargeAmountLc: listValueVO.totalChargeAmountLc,
          totalChargeAmountBc: listValueVO.totalChargeAmountBc,
          totalTaxAmountLc: listValueVO.totalTaxAmountLc,
          totalInvAmountLc: listValueVO.totalInvAmountLc,
          roundOffAmountLc: listValueVO.roundOffAmountLc,
          totalChargeAmountBc: listValueVO.totalChargeAmountBc,
          totalInvAmountLc: listValueVO.totalInvAmountLc,
          totalInvAmountBc: listValueVO.totalInvAmountBc,
          totalChargeAmountBc: listValueVO.totalChargeAmountBc,
          totalTaxAmountBc: listValueVO.totalTaxAmountBc,
          totalInvAmountBc: listValueVO.totalInvAmountBc,
          totalTaxableAmountLc: listValueVO.totalTaxableAmountLc,
          amountInWords: listValueVO.amountInWords,
          billingRemarks: listValueVO.billingRemarks,
          amountInWords: listValueVO.amountInWords
        });
        handleCloseModal();

        console.log('TAX INVOICE:==>', result);
      } else {
        console.error('API Error:', result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // const handleAddRow = () => {
  //   if (isLastRowEmpty(irnChargesData)) {
  //     displayRowError(irnChargesData);
  //     return;
  //   }

  //   const newRow = {
  //     id: Date.now(),
  //     // jobNo: '',
  //     chargeType: '',
  //     chargeCode: '',
  //     govChargeCode: '',
  //     ledger: '',
  //     chargeName: '',
  //     taxable: true,
  //     // applyOn: '',
  //     qty: '',
  //     rate: '',
  //     currency: '',
  //     exRate: '',
  //     exempted: true,
  //     fcAmount: '',
  //     lcAmount: '',
  //     tlcAmount: '',
  //     billAmount: '',
  //     sac: '',
  //     gstAmount: '',
  //     gstpercent: ''
  //   };

  //   setIrnChargesData([...irnChargesData, newRow]);
  //   setIrnChargesError([
  //     ...irnChargesError,
  //     {
  //       // id: 1,
  //       // jobNo: '',
  //       chargeType: '',
  //       chargeCode: '',
  //       govChargeCode: '',
  //       ledger: '',
  //       chargeName: '',
  //       taxable: true,
  //       // applyOn: '',
  //       qty: '',
  //       rate: '',
  //       currency: '',
  //       exRate: '',
  //       exempted: true,
  //       fcAmount: '',
  //       lcAmount: '',
  //       tlcAmount: '',
  //       billAmount: '',
  //       sac: '',
  //       gstAmount: '',
  //       gstpercent: ''
  //     }
  //   ]);
  // };

  // const isLastRowEmpty = (table) => {
  //   const lastRow = table[table.length - 1];
  //   if (!lastRow) return false;

  //   if (table === irnChargesData) {
  //     return (
  //       !lastRow.jobNo ||
  //       !lastRow.chargeType ||
  //       !lastRow.chargeCode ||
  //       !lastRow.govChargeCode ||
  //       !lastRow.ledger ||
  //       !lastRow.chargeName ||
  //       // !lastRow.applyOn ||
  //       !lastRow.taxable ||
  //       !lastRow.qty ||
  //       !lastRow.rate ||
  //       !lastRow.currency ||
  //       !lastRow.exRate ||
  //       // !lastRow.exempted ||
  //       !lastRow.fcAmount ||
  //       !lastRow.lcAmount ||
  //       !lastRow.tlcAmount ||
  //       !lastRow.billAmount ||
  //       !lastRow.gstAmount ||
  //       !lastRow.gstpercent
  //     );
  //   }
  //   return false;
  // };

  // const displayRowError = (table) => {
  //   if (table === irnChargesData) {
  //     setIrnChargesError((prevErrors) => {
  //       const newErrors = [...prevErrors];
  //       newErrors[table.length - 1] = {
  //         ...newErrors[table.length - 1],
  //         // jobNo: !table[table.length - 1].jobNo ? 'Job No is required' : '',
  //         chargeType: !table[table.length - 1].chargeType ? 'Charge Code is required' : '',
  //         chargeCode: !table[table.length - 1].chargeCode ? 'Charge Code is required' : '',
  //         govChargeCode: !table[table.length - 1].govChargeCode ? 'G Charge Code is required' : '',
  //         ledger: !table[table.length - 1].ledger ? 'G Charge Code is required' : '',
  //         chargeName: !table[table.length - 1].chargeName ? 'Charge Name is required' : '',
  //         // applyOn: !table[table.length - 1].applyOn ? 'Apply On is required' : '',
  //         qty: !table[table.length - 1].qty ? 'Rate is required' : '',
  //         rate: !table[table.length - 1].rate ? 'Rate is required' : '',
  //         currency: !table[table.length - 1].currency ? 'Currency is required' : '',
  //         exRate: !table[table.length - 1].exRate ? 'Ex Rate is required' : '',
  //         // exempted: !table[table.length - 1].exempted ? 'Excempted is required' : '',
  //         fcAmount: !table[table.length - 1].fcAmount ? 'FC Amount is required' : '',
  //         lcAmount: !table[table.length - 1].lcAmount ? 'LC Amount Amount is required' : '',
  //         tlcAmount: !table[table.length - 1].tlcAmount ? 'TLC Amount is required' : '',
  //         billAmount: !table[table.length - 1].billAmount ? 'Bill Amount is required' : '',
  //         gstAmount: !table[table.length - 1].gstAmount ? 'GST is required' : '',
  //         gstpercent: !table[table.length - 1].gstpercent ? 'GST % is required' : ''
  //       };
  //       return newErrors;
  //     });
  //   }
  // };

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

  // const handleGstAddRow = () => {
  //   if (isGstLastRowEmpty(irnGstData)) {
  //     displayGstRowError(irnGstData);
  //     return;
  //   }
  //   const newGstRow = {
  //     id: Date.now(),
  //     chargeAcc: '',
  //     subLodgerCode: '',
  //     crBillAmt: '',
  //     crLCAmt: null,
  //     gstRemarks: '',
  //     dbillAmt: '',
  //     dblcamt: ''
  //   };

  //   setIrnGstData([...irnGstData, newGstRow]);

  //   setIrnGstError([
  //     ...irnGstError,
  //     {
  //       chargeAcc: '',
  //       subLodgerCode: '',
  //       crBillAmt: '',
  //       crLCAmt: null,
  //       gstRemarks: '',
  //       dbillAmt: '',
  //       dblcamt: ''
  //     }
  //   ]);
  // };

  // const isGstLastRowEmpty = (table) => {
  //   const lastRow = table[table.length - 1];
  //   if (!lastRow) return false;

  //   if (table === irnGstData) {
  //     return (
  //       !lastRow.chargeAcc || !lastRow.subLodgerCode || !lastRow.dbillAmt || !lastRow.crBillAmt || !lastRow.dblcamt || !lastRow.crLCAmt
  //     );
  //   }
  //   return false;
  // };

  // const displayGstRowError = (table) => {
  //   if (table === irnGstData) {
  //     setIrnGstError((prevErrors) => {
  //       const newErrors = [...prevErrors];
  //       newErrors[table.length - 1] = {
  //         ...newErrors[table.length - 1],
  //         chargeAcc: !table[table.length - 1].chargeAcc ? 'Charge Account is required' : '',
  //         subLodgerCode: !table[table.length - 1].subLodgerCode ? 'Sub Ledger Code is required' : '',
  //         dbillAmt: !table[table.length - 1].dbillAmt ? 'D Bill Amount is required' : '',
  //         crBillAmt: !table[table.length - 1].crBillAmt ? 'CR Bill Amount is required' : '',
  //         dblcamt: !table[table.length - 1].dblcamt ? 'DB LC Amount is required' : '',
  //         crLCAmt: !table[table.length - 1].crLCAmt ? 'CR LC Amount is required' : ''
  //         // remarks: !table[table.length - 1].remarks ? 'Remarks is required' : ''
  //       };
  //       return newErrors;
  //     });
  //   }
  // };

  const handleDeleteRow1 = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    // If the row exists, proceed to delete
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const getAllOriginalBill = async (party) => {
    try {
      const response = await apiCalls('get', `irnCreditNote/getOrginBillNoByParty?branchCode=${branchCode}&orgId=${orgId}&party=${party}`);
      if (response.status === true) {
        // Update the origin bill dropdown options
        setOriginBillList(response.paramObjectsMap.taxInvoiceVO || []);
      } else {
        console.error('Failed to fetch origin bills:', response);
      }
    } catch (error) {
      console.error('Error fetching origin bills:', error);
    }
  };

  const handleOriginBillSelection = (selectedBill) => {
    if (selectedBill) {
      // Update the formData with selected bill data (excluding table data for Party Name)
      setFormData((prev) => ({
        ...prev,
        vohNo: selectedBill.invoiceNo,
        vohDate: selectedBill.invoiceDate,
        creditDays: selectedBill.creditDays,
        currency: selectedBill.billCurr,
        exRate: selectedBill.billCurrRate,
        address: selectedBill.address,
        pincode: selectedBill.pinCode,
        gstType: selectedBill.gstType,
        billingMonth: selectedBill.billMonth,
        salesType: selectedBill.salesType,
        stateCode: selectedBill.stateCode,
        stateNo: selectedBill.stateNo,
        recipientGSTIN: selectedBill.recipientGSTIN,
        placeOfSupply: selectedBill.placeOfSupply,
        addressType: selectedBill.addressType,
        exAmount: selectedBill.exAmount,
        supplierRefNo: selectedBill.invoiceNo,
        supplierRefDate: selectedBill.invoiceDate
        // Add other form fields as needed
      }));

      // Example: Update table data (assuming you're maintaining a table state)
      if (selectedBill.taxInvoiceDetailsVO) {
        setIrnChargesData(
          selectedBill.taxInvoiceDetailsVO.map((item) => ({
            id: item.id,
            chargeType: item.chargeType,
            chargeCode: item.chargeCode,
            govChargeCode: item.govChargeCode,
            ledger: item.ledger,
            chargeName: item.chargeName,
            taxable: item.taxable,
            qty: item.qty,
            rate: item.rate,
            currency: item.currency,
            exRate: item.exRate,
            exempted: item.exempted,
            fcAmount: item.fcAmount,
            lcAmount: item.lcAmount,
            tlcAmount: item.tlcAmount,
            billAmount: item.billAmount,
            sac: item.sac,
            gstAmount: item.gstAmount,
            gstpercent: item.gstpercent
            // Map other fields as needed
          }))
        );
      }
    }
  };

  const getAllPartyTypeByOrgId = async () => {
    try {
      const response = await apiCalls('get', `master/getAllPartyTypeByOrgId?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setPartyTypeData(response.paramObjectsMap.partyTypeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
    getAllPartyName();
    getIrnCreditNoteDocId();
    getAllPartyTypeByOrgId();
    getAllCurrency();
    getAllOriginalBill();
  }, []);

  const getIrnCreditNoteDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `irnCreditNote/getIrnCreditNoteDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      console.log('API Response:', response);

      if (response.status === true) {
        setDocId(response.paramObjectsMap.irnCreditVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllPartyName = async (partyType) => {
    try {
      const response = await apiCalls('get', `irnCreditNote/getPartyNameByPartyType?orgId=${orgId}&partyType=${partyType}`);
      console.log('API Response:', response);
      // &partyType=${partyType}

      if (response.status === true) {
        setAllPartyName(response.paramObjectsMap.partyMasterVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllIrnCredit();
  }, []);

  const getAllIrnCredit = async () => {
    try {
      const response = await apiCalls('get', `irnCreditNote/getAllIrnCreditByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.irnCreditVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getIrnCreditById = async (row) => {
    console.log('first', row);
    setEditId(row.original.id);
    setListView(false);

    try {
      const response = await apiCalls('get', `/irnCreditNote/getIrnCreditById?id=${row.original.id}`);
      if (response.status === true) {
        const irnCreditNoteVO = response.paramObjectsMap.irnCreditVO[0];

        setDocId(irnCreditNoteVO.docId);

        setFormData({
          // docId: irnCreditNoteVO.docId,
          partyName: irnCreditNoteVO.partyName,
          partyCode: irnCreditNoteVO.partyCode,
          partyType: irnCreditNoteVO.partyType,
          stateCode: irnCreditNoteVO.stateCode,
          approveStatus: irnCreditNoteVO.approveStatus,
          approveBy: irnCreditNoteVO.approveBy,
          approveOn: irnCreditNoteVO.approveOn,
          stateNo: irnCreditNoteVO.stateNo,
          recipientGSTIN: irnCreditNoteVO.recipientGSTIN,
          placeOfSupply: irnCreditNoteVO.placeOfSupply,
          addressType: irnCreditNoteVO.addressType,
          address: irnCreditNoteVO.address,
          pinCode: irnCreditNoteVO.pinCode,
          status: irnCreditNoteVO.status,
          gstType: irnCreditNoteVO.gstType,
          originBill: irnCreditNoteVO.originBillNo,
          vohNo: irnCreditNoteVO.voucherNo,
          vohDate: irnCreditNoteVO.voucherDate,
          supplierRefNo: irnCreditNoteVO.supplierRefNo,
          supplierRefDate: irnCreditNoteVO.supplierRefDate,
          currency: irnCreditNoteVO.billCurr,
          exRate: irnCreditNoteVO.billCurrRate,
          exAmount: irnCreditNoteVO.exAmount,
          creditDays: irnCreditNoteVO.creditDays,
          shipRefNo: irnCreditNoteVO.shipperRefNo,
          billingMonth: irnCreditNoteVO.billMonth,
          salesType: irnCreditNoteVO.salesType,
          creditRemarks: irnCreditNoteVO.creditRemarks,
          roundOff: irnCreditNoteVO.roundOffAmountLc,
          totChargesBillCurrAmt: irnCreditNoteVO.totalChargeAmountBc,
          totChargesLCAmt: irnCreditNoteVO.totalChargeAmountLc,
          totGrossBillAmt: irnCreditNoteVO.totalInvAmountBc,
          totGrossLCAmt: irnCreditNoteVO.totalInvAmountLc,
          netBillCurrAmt: irnCreditNoteVO.netBillCurrAmt,
          netLCAmt: irnCreditNoteVO.netLCAmt,
          amtInWords: irnCreditNoteVO.amountInWords
          // summaryExRate: irnCreditNoteVO.summaryExRate,
          // totTaxAmt: irnCreditNoteVO.totTaxAmt
        });
        setIrnChargesData(
          irnCreditNoteVO.irnCreditNoteDetailsVO.map((invoiceData) => ({
            id: invoiceData.id,
            // jobNo: invoiceData.jobNo,
            chargeType: invoiceData.chargeType,
            chargeCode: invoiceData.chargeCode,
            govChargeCode: invoiceData.govChargeCode,
            ledger: invoiceData.ledger,
            chargeName: invoiceData.chargeName,
            taxable: invoiceData.taxable,
            // applyOn: invoiceData.applyOn,
            qty: invoiceData.qty,
            rate: invoiceData.rate,
            currency: invoiceData.currency,
            exRate: invoiceData.exRate,
            exempted: invoiceData.exempted,
            fcAmount: invoiceData.fcAmount,
            lcAmount: invoiceData.lcAmount,
            tlcAmount: invoiceData.tlcAmount,
            billAmount: invoiceData.billAmount,
            sac: invoiceData.sac,
            gstAmount: invoiceData.gstAmount,
            gstpercent: invoiceData.gstpercent
          }))
        );
        setIrnGstData(
          irnCreditNoteVO.irnCreditNoteGstVO.map((invoiceData) => ({
            id: invoiceData.id,
            chargeAcc: invoiceData.gstChargeAcc,
            subLodgerCode: invoiceData.gstSubledgerCode,
            dbillAmt: invoiceData.gstDbBillAmount,
            crBillAmt: invoiceData.gstCrBillAmount,
            dblcamt: invoiceData.gstDbLcAmount,
            crLCAmt: invoiceData.gstCrLcAmount
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
    if (!date) return '';
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero based
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    const errors = {};
    const tableErrors = irnChargesData.map((row) => ({
      // jobNo: !row.jobNo ? 'Job No is required' : '',
      // chargeType: !row.chargeType ? 'Charge Type is required' : '',
      // chargeCode: !row.chargeCode ? 'Charge Code is required' : '',
      // govChargeCode: !row.govChargeCode ? 'G Charge Code is required' : '',
      // ledger: !row.ledger ? 'G Charge Code is required' : '',
      // chargeName: !row.chargeName ? 'Charge Name is required' : '',
      // applyOn: !row.applyOn ? 'Apply On is required' : '',
      // taxable: !row.taxable ? 'Apply On is required' : '',
      // currency: !row.currency ? 'Currency is required' : '',
      // exRate: !row.exRate ? 'Ex Rate is required' : '',
      // qty: !row.qty ? 'Qty is required' : '',
      rate: !row.rate ? 'Rate is required' : ''
      // exempted: !row.exempted ? 'Excempted is required' : '',
      // fcAmount: !row.fcAmount ? 'FC Amount is required' : '',
      // lcAmount: !row.lcAmount ? 'LC Amount is required' : '',
      // tlcAmount: !row.tlcAmount ? 'TLC Amount is required' : '',
      // billAmount: !row.billAmount ? 'Bill Amount is required' : '',
      // sac: !row.sac ? 'Sac is required' : '',
      // gstAmount: !row.gstAmount ? 'GST is required' : '',
      // gstpercent: !row.gstpercent ? 'GST % is required' : ''
    }));

    let hasTableErrors = false;

    tableErrors.forEach((err) => {
      if (Object.values(err).some((error) => error)) {
        hasTableErrors = true;
      }
    });

    // Check for empty fields and set error messages
    if (!formData.vohNo) {
      errors.vohNo = 'Voucher No is required';
    }
    if (!formData.vohDate) {
      errors.vohDate = 'Voucher Date is required';
    }
    if (!formData.partyName) {
      errors.partyName = 'Party Name is required';
    }
    if (!formData.partyCode) {
      errors.partyCode = 'Party Code is required';
    }
    if (!formData.partyType) {
      errors.partyType = 'Party Type is required';
    }
    // if (!formData.supplierRefDate) {
    //   errors.supplierRefDate = 'SupRef Date is required';
    // }
    if (!formData.creditDays) {
      errors.creditDays = 'Credit Days is required';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'Ex Rate is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    if (!formData.stateCode) {
      errors.stateCode = 'State Code is required';
    }
    if (!formData.stateNo) {
      errors.stateNo = 'State No is required';
    }
    if (!formData.recipientGSTIN) {
      errors.recipientGSTIN = 'Recipient GST IN is required';
    }
    if (!formData.placeOfSupply) {
      errors.placeOfSupply = 'Place Of Supply is required';
    }
    if (!formData.addressType) {
      errors.addressType = 'Address Type is required';
    }
    if (!formData.originBill) {
      errors.originBill = 'Origin Bill is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.shipRefNo) {
      errors.shipRefNo = 'shipper RefNo is required';
    }
    // if (!formData.pincode) {
    //   errors.pincode = 'Pin code is required';
    // }
    if (!formData.gstType) {
      errors.gstType = 'Gst Type is required';
    }
    if (!formData.billingMonth) {
      errors.billingMonth = 'Bill Amount is required';
    }
    if (!formData.salesType) {
      errors.salesType = 'Sales Type is required';
    }
    if (!formData.exAmount) {
      errors.exAmount = 'Ex Amount is required';
    }
    if (!formData.creditRemarks) {
      errors.creditRemarks = 'Credit Remarks is required';
    }

    setFieldErrors(errors);
    setIrnChargesError(tableErrors);

    // Prevent saving if form or table errors exist
    if (Object.keys(errors).length === 0 && !hasTableErrors) {
      setIsLoading(true);

      const irnCreditChargesVo = irnChargesData.map((row) => ({
        // id: item.id || 0, // If id exists, otherwise 0
        ...(editId && { id: row.id }),
        chargeType: row.chargeType,
        chargeCode: row.chargeCode,
        govChargeCode: row.govChargeCode,
        ledger: row.ledger,
        chargeName: row.chargeName,
        taxable: row.taxable,
        qty: parseInt(row.qty),
        rate: parseInt(row.rate),
        currency: row.currency,
        exRate: parseInt(row.exRate),
        exempted: row.exempted,
        sac: row.sac,
        gstpercent: parseInt(row.gstpercent)
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        address: formData.address,
        addressType: formData.addressType,
        billCurr: formData.currency,
        billCurrRate: parseInt(formData.exRate),
        billMonth: formData.billingMonth,
        branch: branch,
        branchCode: branchCode,
        createdBy: loginUserName,
        creditDays: parseInt(formData.creditDays),
        exAmount: parseInt(formData.exAmount),
        creditRemarks: formData.creditRemarks,
        finYear: finYear,
        gstType: formData.gstType,
        irnCreditNoteDetailsDTO: irnCreditChargesVo,
        orgId: parseInt(orgId),
        originBillNo: formData.originBill,
        partyCode: formData.partyCode,
        partyName: formData.partyName,
        partyType: formData.partyType,
        pincode: formData.pincode,
        placeOfSupply: formData.placeOfSupply,
        recipientGSTIN: formData.recipientGSTIN,
        salesType: formData.salesType,
        shipperRefNo: formData.shipRefNo,
        stateCode: formData.stateCode,
        stateNo: formData.stateNo,
        status: formData.status,
        supplierRefDate: formatDate(formData.supplierRefDate),
        supplierRefNo: formData.supplierRefNo,
        voucherDate: formatDate(formData.vohDate),
        voucherNo: formData.vohNo,
        bizMode: 'TAX',
        bizType: 'B2B'
      };

      try {
        const response = await apiCalls('put', `/irnCreditNote/updateCreateIrnCreditNote`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'IRN Credit Note Updated Successfully' : 'IRN Credit Note created successfully');
          handleClear();
          getAllIrnCredit();
          getIrnCreditNoteDocId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'IRN Credit Note creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'IRN Credit Note creation failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (formData.partyName) {
      getAllOriginalBill(formData.partyName);
    }
  }, [formData.partyName]);

  useEffect(() => {
    if (formData.partyType) {
      getAllPartyName(formData.partyType);
    }
  }, [formData.partyType]);

  const listViewColumns = [
    { accessorKey: 'partyName', header: 'Party Name', size: 140 },
    { accessorKey: 'partyCode', header: 'Party Code', size: 140 },
    // { accessorKey: 'docId', header: 'Doc Id', size: 140 },
    { accessorKey: 'partyType', header: 'Party Type', size: 140 },
    { accessorKey: 'vohNo', header: 'Voucher No', size: 140 },
    { accessorKey: 'vohDate', header: 'Voucher Date', size: 140 }
  ];

  const GeneratePdf = (row) => {
    console.log('PDF-Data =>', row.original);
    setPdfData(row.original);
    setDownloadPdf(true);
  };

  return (
    <div>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="row">
          <div className="d-flex flex-wrap justify-content-between mb-4" style={{ marginBottom: '20px' }}>
            <div className="d-flex">
              <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
              <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
            </div>

            {editId && !listView && (
              <>
                {formData.approveStatus === 'Approved' ? (
                  <Stack direction="row" spacing={2}>
                    <Chip label={`Approved By: ${formData.approveBy}`} variant="outlined" color="success" />
                    <Chip label={`Approved On: ${formData.approveOn}`} variant="outlined" color="success" />
                  </Stack>
                ) : formData.approveStatus === 'Rejected' ? (
                  <Stack direction="row" spacing={2}>
                    <Chip label={`Rejected By: ${formData.approveBy}`} variant="outlined" color="error" />
                    <Chip label={`Rejected On: ${formData.approveOn}`} variant="outlined" color="error" />
                  </Stack>
                ) : (
                  <div className="d-flex" style={{ marginRight: '30px' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircleIcon />}
                      size="small"
                      style={{
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        padding: '2px 8px',
                        fontSize: '0.8rem',
                        marginRight: '10px'
                      }}
                      onClick={handleOpenModalApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      size="small"
                      style={{
                        borderColor: '#F44336',
                        color: '#F44336',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        padding: '2px 8px',
                        fontSize: '0.8rem'
                      }}
                      onClick={handleOpenModalReject}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {listView ? (
          <div className="">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true}
              toEdit={getIrnCreditById}
              isPdf={true}
              GeneratePdf={GeneratePdf}
            />
            {downloadPdf && <GeneratePdfTempIRN row={pdfData} />}
          </div>
        ) : (
          <>
            <div className="row d-flex ml" style={{ marginBottom: '20px' }}>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField id="docId" name="docId" label="Doc ID" size="small" value={docId} disabled required fullWidth />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Doc Date"
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
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="vohNo"
                    name="vohNo"
                    label="Voucher No"
                    size="small"
                    value={formData.vohNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.vohNo}
                    helperText={fieldErrors.vohNo}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Voucher Date"
                      value={formData.vohDate ? dayjs(formData.vohDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('vohDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.vohDate}
                      helperText={fieldErrors.vohDate ? fieldErrors.vohDate : ''}
                      disabled
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl variant="outlined" fullWidth size="small" error={!!fieldErrors.partyType}>
                  <InputLabel id="partyType">Party Type</InputLabel>
                  <Select labelId="partyType" label="Party Type" name="partyType" value={formData.partyType} onChange={handleInputChange}>
                    {partyTypeData?.map((row) => (
                      <MenuItem key={row.id} value={row.partyType}>
                        {row.partyType}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.partyType && <FormHelperText>{fieldErrors.partyType}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={allPartyName}
                  getOptionLabel={(option) => option.partyName}
                  sx={{ width: '100%' }}
                  size="small"
                  value={formData.partyName ? allPartyName.find((c) => c.partyName === formData.partyName) : null}
                  onChange={(event, newValue) => {
                    // Update formData with selected partyName
                    handleInputChange({
                      target: {
                        name: 'partyName',
                        value: newValue ? newValue.partyName : ''
                      }
                    });

                    // Fetch origin bills based on the selected partyName
                    if (newValue) {
                      getAllOriginalBill(newValue.partyName);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Party Name"
                      name="partyName"
                      error={!!fieldErrors.partyName}
                      helperText={fieldErrors.partyName}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl variant="outlined" fullWidth size="small" error={!!fieldErrors.originBill}>
                  <InputLabel id="originBill">Origin Bill</InputLabel>

                  <Select
                    labelId="originBill"
                    label="Origin Bill"
                    name="originBill"
                    value={formData.originBill}
                    onChange={(event) => {
                      const selectedDocId = event.target.value;

                      // Find the selected origin bill data
                      const selectedBill = originBillList.find((item) => item.docId === selectedDocId);

                      // Call the function to handle the mapping (form fields and table fields)
                      handleOriginBillSelection(selectedBill);

                      // Update the formData with the selected origin bill
                      setFormData((prev) => ({
                        ...prev,
                        originBill: selectedDocId
                      }));
                    }}
                  >
                    {originBillList?.map((row) => (
                      <MenuItem key={row.id} value={row.docId}>
                        {row.docId}
                      </MenuItem>
                    ))}
                  </Select>

                  {fieldErrors.originBill && <FormHelperText>{fieldErrors.originBill}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="partyCode"
                    name="partyCode"
                    label="Party Code"
                    size="small"
                    value={formData.partyCode}
                    // onChange={handleInputChange}
                    // error={!!fieldErrors.partyCode}
                    // helperText={fieldErrors.partyCode}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="supplierRefNo"
                    name="supplierRefNo"
                    label="Supplier Ref No"
                    size="small"
                    value={formData.supplierRefNo}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supplierRefNo}
                    helperText={fieldErrors.supplierRefNo}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Supplier Ref. Date."
                      value={formData.supplierRefDate ? dayjs(formData.supplierRefDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('supplierRefDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.supplierRefDate}
                      helperText={fieldErrors.supplierRefDate ? fieldErrors.supplierRefDate : ''}
                      disabled
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={formData.currentDate ? dayjs(formData.currentDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('currentDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.currentDate}
                      helperText={fieldErrors.currentDate ? fieldErrors.currentDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="currentDateValue"
                    name="currentDateValue"
                    value={formData.currentDateValue}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.currentDateValue}
                    helperText={fieldErrors.currentDateValue}
                  />
                </FormControl>
              </div> */}
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.product}>
                  <InputLabel id="product" required>
                    Product
                  </InputLabel>
                  <Select
                    labelId="product"
                    id="product"
                    name="product"
                    required
                    value={formData.product}
                    label="product"
                    onChange={handleInputChange}
                  >
                    <MenuItem value={'CO'}>CO</MenuItem>
                    <MenuItem value={'TO'}>TO</MenuItem>
                  </Select>
                  {fieldErrors.product && <FormHelperText>{fieldErrors.product}</FormHelperText>}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="creditDays"
                    name="creditDays"
                    label="Credit Days"
                    size="small"
                    value={formData.creditDays}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.creditDays}
                    helperText={fieldErrors.creditDays}
                    disabled
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={formData.dueDate ? dayjs(formData.dueDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dueDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.dueDate}
                      helperText={fieldErrors.dueDate ? fieldErrors.dueDate : ''}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency">Currency</InputLabel>
                  <Select
                    labelId="currency"
                    id="currency"
                    label="currency"
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
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="currency"
                    name="currency"
                    label="Currency"
                    size="small"
                    value={formData.currency}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.currency}
                    helperText={fieldErrors.currency}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="exRate"
                    name="exRate"
                    label="Ex. Rate"
                    size="small"
                    value={formData.exRate}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.exRate}
                    helperText={fieldErrors.exRate}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.status}>
                  <InputLabel id="status" required>
                    Status
                  </InputLabel>
                  <Select
                    labelId="status"
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    label="status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value={'OPEN'}>OPEN</MenuItem>
                    <MenuItem value={'RELEASED'}>RELEASED</MenuItem>
                  </Select>
                  {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                </FormControl>
              </div>

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="remarks"
                    name="remarks"
                    label="Remarks"
                    size="small"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 150 }}
                    error={!!fieldErrors.remarks}
                    helperText={fieldErrors.remarks}
                  />
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="stateCode"
                    name="stateCode"
                    label="state Code"
                    size="small"
                    value={formData.stateCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.stateCode}
                    helperText={fieldErrors.stateCode}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="stateNo"
                    name="stateNo"
                    label="State No"
                    size="small"
                    value={formData.stateNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.stateNo}
                    helperText={fieldErrors.stateNo}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="recipientGSTIN"
                    name="recipientGSTIN"
                    label="Recipient GST IN"
                    size="small"
                    value={formData.recipientGSTIN}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.recipientGSTIN}
                    helperText={fieldErrors.recipientGSTIN}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="placeOfSupply"
                    name="placeOfSupply"
                    label="Place Of Supply"
                    size="small"
                    value={formData.placeOfSupply}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.placeOfSupply}
                    helperText={fieldErrors.placeOfSupply}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="addressType"
                    name="addressType"
                    label="Address Type"
                    size="small"
                    value={formData.addressType}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.addressType}
                    helperText={fieldErrors.addressType}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="address"
                    name="address"
                    label="Address"
                    size="small"
                    value={formData.address}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 200 }}
                    error={!!fieldErrors.address}
                    helperText={fieldErrors.address}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="shipRefNo"
                    name="shipRefNo"
                    label="Shipper Ref. No."
                    size="small"
                    value={formData.shipRefNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.shipRefNo}
                    helperText={fieldErrors.shipRefNo}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="pincode"
                    name="pincode"
                    label="Pin Code"
                    size="small"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 6 }}
                    error={!!fieldErrors.pincode}
                    helperText={fieldErrors.pincode}
                    disabled
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="pincode"
                    name="pincode"
                    // label="Pin Code"
                    size="small"
                    // value={formData.pincode}
                    // onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    // error={!!fieldErrors.pincode}
                    // helperText={fieldErrors.pincode}
                  />
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="gstType"
                    name="gstType"
                    label="Gst Type"
                    size="small"
                    value={formData.gstType}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.gstType}
                    helperText={fieldErrors.gstType}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="billingMonth"
                    name="billingMonth"
                    label="Billing Month"
                    size="small"
                    value={formData.billingMonth}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.billingMonth}
                    helperText={fieldErrors.billingMonth}
                    disabled
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="otherInfo"
                    name="otherInfo"
                    label="Other Info"
                    size="small"
                    value={formData.otherInfo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.otherInfo}
                    helperText={fieldErrors.otherInfo}
                  />
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="salesType"
                    name="salesType"
                    label="Sales Type"
                    size="small"
                    value={formData.salesType}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.salesType}
                    helperText={fieldErrors.salesType}
                    disabled
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="exAmount"
                    name="exAmount"
                    label="Ex Amount"
                    size="small"
                    value={formData.exAmount}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 150 }}
                    error={!!fieldErrors.exAmount}
                    helperText={fieldErrors.exAmount}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="creditRemarks"
                    name="creditRemarks"
                    label="Credit Remarks"
                    size="small"
                    value={formData.creditRemarks}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 150 }}
                    error={!!fieldErrors.creditRemarks}
                    helperText={fieldErrors.creditRemarks}
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="charges"
                    name="charges"
                    label="Charges"
                    size="small"
                    value={formData.charges}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 50 }}
                    error={!!fieldErrors.charges}
                    helperText={fieldErrors.charges}
                  />
                </FormControl>
              </div> */}
            </div>
            {/* </div> */}

            <div className="card w-full p-6 bg-base-100 shadow-xl mb-3">
              <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} textColor="secondary" indicatorColor="secondary" aria-label="lab API tabs example">
                      <Tab label="Masters / House Charges" value="1" />
                      {editId && <Tab label="Gst" value="2" />}
                      {editId && <Tab label="Summary" value="3" />}
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    {/* <TableComponent /> */}
                    <div className="row d-flex ml">
                      <div className="mb-1">{/* <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} /> */}</div>
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
                                  {/* <th className="px-2 py-2 text-white text-center">Job Number</th> */}
                                  <th className="px-2 py-2 text-white text-center">Charge Type</th>
                                  <th className="px-2 py-2 text-white text-center">Charge Code</th>
                                  <th className="px-2 py-2 text-white text-center">GCharge Code</th>
                                  <th className="px-2 py-2 text-white text-center">Ledger</th>
                                  <th className="px-2 py-2 text-white text-center">Charge Name</th>
                                  {/* <th className="px-2 py-2 text-white text-center">Apply On</th> */}
                                  <th className="px-2 py-2 text-white text-center">Taxable</th>
                                  <th className="px-2 py-2 text-white text-center">Qty</th>
                                  <th className="px-2 py-2 text-white text-center">Rate</th>
                                  <th className="px-2 py-2 text-white text-center">Currency</th>
                                  <th className="px-2 py-2 text-white text-center">Ex. Rate</th>
                                  <th className="px-2 py-2 text-white text-center">Excempted</th>
                                  <th className="px-2 py-2 text-white text-center">FC Amount</th>
                                  <th className="px-2 py-2 text-white text-center">LC Amount</th>
                                  <th className="px-2 py-2 text-white text-center">TLC Amount</th>
                                  <th className="px-2 py-2 text-white text-center">Bill Amount</th>
                                  <th className="px-2 py-2 text-white text-center">SAC</th>
                                  <th className="px-2 py-2 text-white text-center">GST</th>
                                  <th className="px-2 py-2 text-white text-center">GST %</th>
                                  {/* <th className="px-2 py-2 text-white text-center">Remarks</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {Array.isArray(irnChargesData) &&
                                  irnChargesData.map((row, index) => (
                                    <tr key={row.id}>
                                      <td className="border px-2 py-2 text-center">
                                        <ActionButton
                                          title="Delete"
                                          icon={DeleteIcon}
                                          onClick={() =>
                                            handleDeleteRow(row.id, irnChargesData, setIrnChargesData, irnChargesError, setIrnChargesError)
                                          }
                                        />
                                      </td>
                                      <td className="text-center">
                                        <div className="pt-2">{index + 1}</div>
                                      </td>

                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.chargeType}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, chargeType: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeType: !value ? 'Charge Code is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              // Remove this block to not set any error for non-numeric input
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeType: 'Only alphabets and numbers are allowed'
                                                }; // Clear the error instead
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.chargeType ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.chargeType && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].chargeType}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.chargeCode}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, chargeCode: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeCode: !value ? 'Charge Code is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              // Remove this block to not set any error for non-numeric input
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeCode: 'Only alphabets and numbers are allowed'
                                                }; // Clear the error instead
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.chargeCode ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.chargeCode && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].chargeCode}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.govChargeCode}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, govChargeCode: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  govChargeCode: !value ? 'GCharge Code is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  govChargeCode: 'Only alphabets and numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.govChargeCode ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.govChargeCode && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].govChargeCode}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.ledger}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, ledger: value } : r)));
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  ledger: !value ? 'GCharge Code is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  ledger: 'Only alphabets and numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.ledger ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.ledger && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].ledger}
                                          </div>
                                        )}
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.chargeName}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, chargeName: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeName: !value ? 'Charge Name is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  chargeName: 'Only alphabets and numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.chargeName ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.chargeName && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].chargeName}
                                          </div>
                                        )}
                                      </td>

                                      <td className="border px-2 py-2">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <Checkbox
                                            id="tax"
                                            checked={row.taxable}
                                            disabled
                                            onChange={(e) => {
                                              const isChecked = e.target.checked;
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, taxable: isChecked } : r))
                                              );
                                              // setirnChargesError((prev) => {
                                              //   const newErrors = [...prev];
                                              //   newErrors[index] = { ...newErrors[index], taxable: '' };
                                              //   return newErrors;
                                              // });
                                            }}
                                            sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                                          />
                                        </div>
                                      </td>
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.qty}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, qty: value } : r)));
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  qty: !value ? 'Qty is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  qty: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.qty ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.qty && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].qty}
                                          </div>
                                        )}
                                      </td> */}
                                      {/* <td className="border px-2 py-2">
  <input
    type="text"
    value={row.qty}
    onChange={(e) => {
      const value = e.target.value;
      const isNumeric = /^[0-9]*$/;
      if (isNumeric.test(value)) {
        // Update the quantity
        setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, qty: value } : r)));
        
        // Recalculate fcAmount if necessary
        if (row.currency !== 'INR') {
          const newFcAmount = (Number(value) * Number(row.rate)).toFixed(2);
          setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, fcAmount: newFcAmount } : r)));
        }
        
        setIrnChargesError((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            qty: !value ? 'Qty is required' : ''
          };
          return newErrors;
        });
      } else {
        setIrnChargesError((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            qty: 'Only numbers are allowed'
          };
          return newErrors;
        });
      }
    }}
    className={irnChargesError[index]?.qty ? 'error form-control' : 'form-control'}
    style={{ width: '150px' }}
  />
  {irnChargesError[index]?.qty && (
    <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
      {irnChargesError[index].qty}
    </div>
  )}
</td> */}
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.qty}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              // Update the qty
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => {
                                                  if (r.id === row.id) {
                                                    const newQty = value;

                                                    // Calculate lcAmount
                                                    const newLcAmount = (Number(newQty) * Number(row.rate) * Number(row.exRate)).toFixed(2);

                                                    // Calculate billAmount
                                                    const newBillAmount = (
                                                      (Number(newQty) * Number(row.rate) * Number(row.exRate)) /
                                                      Number(row.exRate)
                                                    ).toFixed(2);

                                                    // Calculate gstAmount
                                                    const newGstAmount = (
                                                      (Number(newQty) * Number(row.rate) * Number(row.exRate) * Number(row.gstpercent)) /
                                                      100
                                                    ).toFixed(2);

                                                    return {
                                                      ...r,
                                                      qty: newQty,
                                                      lcAmount: newLcAmount,
                                                      billAmount: newBillAmount,
                                                      gstAmount: newGstAmount
                                                    };
                                                  }
                                                  return r;
                                                })
                                              );

                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  qty: !value ? 'Quantity is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  qty: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.qty ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.qty && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].qty}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input type="text" value={row.qty} readOnly className="form-control" style={{ width: '150px' }} />
                                      </td>

                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.rate}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, rate: value } : r)));
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: !value ? 'Rate is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.rate ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.rate && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].rate}
                                          </div>
                                        )}
                                      </td> */}
                                      {/* <td className="border px-2 py-2">
  <input
    type="text"
    value={row.rate}
    onChange={(e) => {
      const value = e.target.value;
      const isNumeric = /^[0-9]*$/;
      if (isNumeric.test(value)) {
        // Update the rate
        setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, rate: value } : r)));

        // Recalculate fcAmount if necessary
        if (row.currency !== 'INR') {
          const newFcAmount = (Number(row.qty) * Number(value)).toFixed(2);
          setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, fcAmount: newFcAmount } : r)));
        }

        setIrnChargesError((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            rate: !value ? 'Rate is required' : ''
          };
          return newErrors;
        });
      } else {
        setIrnChargesError((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            rate: 'Only numbers are allowed'
          };
          return newErrors;
        });
      }
    }}
    className={irnChargesError[index]?.rate ? 'error form-control' : 'form-control'}
    style={{ width: '150px' }}
  />
  {irnChargesError[index]?.rate && (
    <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
      {irnChargesError[index].rate}
    </div>
  )}
</td> */}
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.rate}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              // Update the rate
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => {
                                                  if (r.id === row.id) {
                                                    const newRate = value;

                                                    // Calculate lcAmount
                                                    const newLcAmount = (Number(row.qty) * Number(newRate) * Number(row.exRate)).toFixed(2);

                                                    // Calculate billAmount
                                                    const newBillAmount = (
                                                      (Number(row.qty) * Number(newRate) * Number(row.exRate)) /
                                                      Number(row.exRate)
                                                    ).toFixed(2);

                                                    // Calculate gstAmount
                                                    const newGstAmount = (
                                                      (Number(row.qty) * Number(newRate) * Number(row.exRate) * Number(row.gstpercent)) /
                                                      100
                                                    ).toFixed(2);

                                                    return {
                                                      ...r,
                                                      rate: newRate,
                                                      lcAmount: newLcAmount,
                                                      billAmount: newBillAmount,
                                                      gstAmount: newGstAmount
                                                    };
                                                  }
                                                  return r;
                                                })
                                              );

                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: !value ? 'Rate is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.rate ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.rate && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].rate}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.rate}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*\.?[0-9]*$/; // Updated regex to allow decimals

                                            if (isNumeric.test(value)) {
                                              // Update the rate
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => {
                                                  if (r.id === row.id) {
                                                    // Calculate new values based on the updated rate
                                                    const updatedRate = Number(value);
                                                    const newLcAmount = (Number(row.qty) * updatedRate * Number(row.exRate)).toFixed(2);
                                                    const newBillAmount = (
                                                      (Number(row.qty) * updatedRate * Number(row.exRate)) /
                                                      Number(row.exRate)
                                                    ).toFixed(2);
                                                    const newGstAmount = (
                                                      (Number(row.qty) * updatedRate * Number(row.exRate) * Number(row.gstpercent)) /
                                                      100
                                                    ).toFixed(2);

                                                    return {
                                                      ...r,
                                                      rate: value,
                                                      lcAmount: newLcAmount,
                                                      billAmount: newBillAmount,
                                                      gstAmount: newGstAmount
                                                    };
                                                  }
                                                  return r;
                                                })
                                              );

                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: !value ? 'Rate is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  rate: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.rate ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.rate && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].rate}
                                          </div>
                                        )}
                                      </td>

                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.currency}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, currency: value } : r)));

                                            setIrnChargesError((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                currency: !value ? 'currency is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={irnChargesError[index]?.currency ? 'error form-control' : 'form-control'}
                                          style={{ width: '200px' }}
                                        />
                                        {irnChargesError[index]?.currency && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].currency}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.currency}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value.toUpperCase(); // Ensure currency is uppercase
                                            setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, currency: value } : r)));

                                            // Recalculate fcAmount based on currency
                                            if (value === 'INR') {
                                              // If currency is INR, set fcAmount to 0.00
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, fcAmount: '0.00' } : r))
                                              );
                                            } else {
                                              // If currency is not INR, calculate fcAmount
                                              const newFcAmount = (Number(row.qty) * Number(row.rate)).toFixed(2);
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, fcAmount: newFcAmount } : r))
                                              );
                                            }

                                            setIrnChargesError((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                currency: !value ? 'Currency is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          }}
                                          className={irnChargesError[index]?.currency ? 'error form-control' : 'form-control'}
                                          style={{ width: '200px' }}
                                        />
                                        {irnChargesError[index]?.currency && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].currency}
                                          </div>
                                        )}
                                      </td>

                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.exRate}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, exRate: value } : r)));
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  exRate: !value ? 'Ex Rate is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  exRate: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.exRate ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.exRate && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].exRate}
                                          </div>
                                        )}
                                      </td>

                                      <td className="border px-2 py-2">
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <Checkbox
                                            id="tax"
                                            checked={row.exempted}
                                            disabled
                                            onChange={(e) => {
                                              const isChecked = e.target.checked;
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, exempted: isChecked } : r))
                                              );
                                              // setirnChargesError((prev) => {
                                              //   const newErrors = [...prev];
                                              //   newErrors[index] = { ...newErrors[index], exempted: '' };
                                              //   return newErrors;
                                              // });
                                            }}
                                            sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                                          />
                                        </div>
                                      </td>
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.fcAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, fcAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  fcAmount: !value ? 'FC Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  fcAmount: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.fcAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.fcAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].fcAmount}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.currency === 'INR' ? '0.00' : row.fcAmount}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, fcAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  fcAmount: !value ? 'FC Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  fcAmount: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.fcAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.fcAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].fcAmount}
                                          </div>
                                        )}
                                      </td>

                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.lcAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, lcAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  lcAmount: !value ? 'LC Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  lcAmount: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.lcAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.lcAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].lcAmount}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.lcAmount}
                                          readOnly
                                          className="form-control"
                                          style={{ width: '150px' }}
                                        />
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.tlcAmount}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, tlcAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  tlcAmount: !value ? 'TLC Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = { ...newErrors[index], tlcAmount: 'Only numbers are allowed' };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.tlcAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.tlcAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].tlcAmount}
                                          </div>
                                        )}
                                      </td>
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.billAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;

                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, billAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  billAmount: !value ? 'Bill Amount is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  billAmount: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.billAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.billAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].billAmount}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.billAmount}
                                          readOnly
                                          className="form-control"
                                          style={{ width: '150px' }}
                                        />
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.sac}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const regex = /^[a-zA-Z0-9\s-]*$/;
                                            if (regex.test(value)) {
                                              setIrnChargesData((prev) => prev.map((r) => (r.id === row.id ? { ...r, sac: value } : r)));
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  sac: !value ? 'SAC is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  sac: 'Only alphabets and numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.sac ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.sac && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].sac}
                                          </div>
                                        )}
                                      </td>
                                      {/* <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.gstAmount}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;
                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, gstAmount: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = { ...newErrors[index], gstAmount: !value ? 'Gst is required' : '' };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = { ...newErrors[index], gstAmount: 'Only numbers are allowed' };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.gstAmount ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}

                                          // onKeyDown={(e) => handleKeyDown(e, row, inVoiceDetailsData)}
                                        />
                                        {irnChargesError[index]?.gstAmount && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].gstAmount}
                                          </div>
                                        )}
                                      </td> */}
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.gstAmount}
                                          readOnly
                                          className="form-control"
                                          style={{ width: '150px' }}
                                        />
                                      </td>
                                      <td className="border px-2 py-2">
                                        <input
                                          type="text"
                                          value={row.gstpercent}
                                          disabled
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const isNumeric = /^[0-9]*$/;

                                            if (isNumeric.test(value)) {
                                              setIrnChargesData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, gstpercent: value } : r))
                                              );
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  gstpercent: !value ? 'GST % is required' : ''
                                                };
                                                return newErrors;
                                              });
                                            } else {
                                              setIrnChargesError((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  gstpercent: 'Only numbers are allowed'
                                                };
                                                return newErrors;
                                              });
                                            }
                                          }}
                                          className={irnChargesError[index]?.gstpercent ? 'error form-control' : 'form-control'}
                                          style={{ width: '150px' }}
                                        />
                                        {irnChargesError[index]?.gstpercent && (
                                          <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                            {irnChargesError[index].gstpercent}
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
                  </TabPanel>
                  {editId && (
                    <TabPanel value="2">
                      {/* <TableComponent /> */}
                      <div className="row d-flex ml">
                        <div className="mb-1">{/* <ActionButton title="Add" icon={AddIcon} onClick={handleGstAddRow} /> */}</div>
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
                                    <th className="px-2 py-2 text-white text-center">Charge Account</th>
                                    <th className="px-2 py-2 text-white text-center">Sub Ledger Code</th>
                                    <th className="px-2 py-2 text-white text-center">D Bill Amount</th>
                                    <th className="px-2 py-2 text-white text-center">CR Bill Amount</th>
                                    <th className="px-2 py-2 text-white text-center">DB LC Amount</th>
                                    <th className="px-2 py-2 text-white text-center">CR LC Amount</th>
                                    <th className="px-2 py-2 text-white text-center">Remarks</th>

                                    {/* <th className="px-2 py-2 text-white text-center">Remarks</th> */}
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.isArray(irnGstData) &&
                                    irnGstData.map((row, index) => (
                                      <tr key={row.id}>
                                        <td className="border px-2 py-2 text-center">
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() => handleDeleteRow1(row.id, irnGstData, setIrnGstData, irnGstError, setIrnGstError)}
                                          />
                                        </td>
                                        <td className="text-center">
                                          <div className="pt-2">{index + 1}</div>
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.chargeAcc}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const regex = /^[a-zA-Z0-9\s-]*$/;
                                              if (regex.test(value)) {
                                                setIrnGstData((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, chargeAcc: value } : r))
                                                );
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    chargeAcc: !value ? 'Charge Account is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                // Remove this block to not set any error for non-numeric input
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    chargeAcc: 'Only alphabets and numbers are allowed'
                                                  }; // Clear the error instead
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.chargeAcc ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.chargeAcc && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].chargeAcc}
                                            </div>
                                          )}
                                        </td>

                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.subLodgerCode}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const regex = /^[a-zA-Z0-9\s-]*$/;
                                              if (regex.test(value)) {
                                                setIrnGstData((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, subLodgerCode: value } : r))
                                                );
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    subLodgerCode: !value ? 'Sub Ledger Code is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                // Remove this block to not set any error for non-numeric input
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    subLodgerCode: 'Only alphabets and numbers are allowed'
                                                  }; // Clear the error instead
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.subLodgerCode ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.subLodgerCode && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].subLodgerCode}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.dbillAmt}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const isNumeric = /^[0-9]*$/;
                                              if (isNumeric.test(value)) {
                                                setIrnGstData((prev) => prev.map((r) => (r.id === row.id ? { ...r, dbillAmt: value } : r)));
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    dbillAmt: !value ? 'D Bill Amount is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    dbillAmt: 'Only numbers are allowed'
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.dbillAmt ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.dbillAmt && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].dbillAmt}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.crBillAmt}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const isNumeric = /^[0-9]*$/;
                                              if (isNumeric.test(value)) {
                                                setIrnGstData((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, crBillAmt: value } : r))
                                                );
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    crBillAmt: !value ? 'CR Bill Amount is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    crBillAmt: 'Only numbers are allowed'
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.crBillAmt ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.crBillAmt && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].crBillAmt}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.dblcamt}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const isNumeric = /^[0-9]*$/;
                                              if (isNumeric.test(value)) {
                                                setIrnGstData((prev) => prev.map((r) => (r.id === row.id ? { ...r, dblcamt: value } : r)));
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    dblcamt: !value ? 'DB LC Amount is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    dblcamt: 'Only numbers are allowed'
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.dblcamt ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.dblcamt && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].dblcamt}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.crLCAmt}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const isNumeric = /^[0-9]*$/;
                                              if (isNumeric.test(value)) {
                                                setIrnGstData((prev) => prev.map((r) => (r.id === row.id ? { ...r, crLCAmt: value } : r)));
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    crLCAmt: !value ? 'CR LC Amount is required' : ''
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                setIrnGstError((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    crLCAmt: 'Only numbers are allowed'
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={irnGstError[index]?.crLCAmt ? 'error form-control' : 'form-control'}
                                            style={{ width: '150px' }}
                                          />
                                          {irnGstError[index]?.crLCAmt && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {irnGstError[index].crLCAmt}
                                            </div>
                                          )}
                                        </td>

                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.gstRemarks}
                                            className="form-control"
                                            style={{ width: '150px' }}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              setIrnGstData((prev) => prev.map((r) => (r.id === row.id ? { ...r, gstRemarks: value } : r)));
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabPanel>
                  )}
                  {editId && (
                    <TabPanel value="3">
                      <div>
                        <div className="row d-flex mt-2">
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="roundOff"
                                name="roundOff"
                                label="Round Off"
                                size="small"
                                disabled
                                value={formData.roundOff}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.roundOff}
                                // helperText={fieldErrors.roundOff}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="totChargesBillCurrAmt"
                                name="totChargesBillCurrAmt"
                                label="Total Charges Bill Curr Amount"
                                size="small"
                                disabled
                                value={formData.totChargesBillCurrAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.totChargesBillCurrAmt}
                                // helperText={fieldErrors.totChargesBillCurrAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="totChargesLCAmt"
                                name="totChargesLCAmt"
                                label="Total Charges LC Amount"
                                size="small"
                                disabled
                                value={formData.totChargesLCAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.totChargesLCAmt}
                                // helperText={fieldErrors.totChargesLCAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="totGrossBillAmt"
                                name="totGrossBillAmt"
                                label="Total Gross Bill Amount"
                                size="small"
                                disabled
                                value={formData.totGrossBillAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.totGrossBillAmt}
                                // helperText={fieldErrors.totGrossBillAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="totGrossLCAmt"
                                name="totGrossLCAmt"
                                label="Total Gross LC Amount"
                                size="small"
                                disabled
                                value={formData.totGrossLCAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.totGrossLCAmt}
                                // helperText={fieldErrors.totGrossLCAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="netBillCurrAmt"
                                name="netBillCurrAmt"
                                label="Net Bill Curr Amount"
                                size="small"
                                disabled
                                value={formData.netBillCurrAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.netBillCurrAmt}
                                // helperText={fieldErrors.netBillCurrAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="netLCAmt"
                                name="netLCAmt"
                                label="Net LC Amount"
                                size="small"
                                disabled
                                value={formData.netLCAmt}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.netLCAmt}
                                // helperText={fieldErrors.netLCAmt}
                              />
                            </FormControl>
                          </div>
                          <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled">
                              <TextField
                                id="amtInWords"
                                name="amtInWords"
                                label="Amount In Words"
                                size="small"
                                disabled
                                value={formData.amtInWords}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 30 }}
                                // error={!!fieldErrors.amtInWords}
                                // helperText={fieldErrors.amtInWords}
                              />
                            </FormControl>
                          </div>
                          {/* <div className="col-md-3 mb-3">
                          <FormControl fullWidth variant="filled">
                            <TextField
                              id="summaryExRate"
                              name="summaryExRate"
                              label="Ex Rate"
                              size="small"
                              disabled
                              value={formData.summaryExRate}
                              onChange={handleInputChange}
                              inputProps={{ maxLength: 30 }}
                              // error={!!fieldErrors.summaryExRate}
                              // helperText={fieldErrors.summaryExRate}
                            />
                          </FormControl>
                        </div>
                        <div className="col-md-3 mb-3">
                          <FormControl fullWidth variant="filled">
                            <TextField
                              id="totTaxAmt"
                              name="totTaxAmt"
                              label="Total Tax Amount"
                              size="small"
                              disabled
                              value={formData.totTaxAmt}
                              onChange={handleInputChange}
                              inputProps={{ maxLength: 30 }}
                              // error={!!fieldErrors.totTaxAmt}
                              // helperText={fieldErrors.totTaxAmt}
                            />
                          </FormControl>
                        </div> */}
                        </div>
                      </div>
                    </TabPanel>
                  )}
                </TabContext>
              </Box>
            </div>
          </>
        )}
      </div>
      <ConfirmationModal
        open={modalOpen}
        title="IRN Credit Note Approval"
        message={`Are you sure you want to ${approveStatus === 'Approved' ? 'approve' : 'reject'} this invoice?`}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseModal}
      />
      <ToastContainer />
    </div>
  );
};

export default IrnCreditNote;

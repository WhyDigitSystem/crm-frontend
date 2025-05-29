import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, Autocomplete } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from '../../basicMaster/CommonListViewTable';

const CostDebitNote = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [currencies, setCurrencies] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [listView, setListView] = useState(false);
  const [data, setData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  // const [branch, setBranch] = useState('CHENNAI');
  // const [branchCode, setBranchCode] = useState('MAA');
  // const [finYear, setFinYear] = useState('2024');
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [allChargeCode, setAllChargeCode] = useState([]);
  const [allOriginalBill, setAllOriginalBill] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [allPartyType, setAllPartyType] = useState([]);
  const [allPartyName, setAllPartyName] = useState([]);
  const [docId, setDocId] = useState('');

  const [formData, setFormData] = useState({
    subType: 'Debit Note',
    product: '',
    vohNo: '',
    vohDate: null,
    partyType: '',
    partyCode: '',
    suppRefNo: '',
    suppRefDate: null,
    currentDate: dayjs(),
    currentDateValue: '',
    partyName: '',
    partyAddType: '',
    creditDays: '',
    dueDate: null,
    taxExampt: true,
    address: '',
    currency: '',
    exRate: '',
    remarks: '',
    otherInfo: '',
    // shipRefNo: '',
    status: '',
    orginBill: '',
    orginBillDate: null,
    gstType: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    subType: '',
    product: '',
    vohNo: '',
    vohDate: null,
    partyType: '',
    partyCode: '',
    suppRefNo: '',
    suppRefDate: null,
    currentDate: null,
    currentDateValue: '',
    partyName: '',
    partyAddType: '',
    creditDays: '',
    dueDate: null,
    taxExampt: true,
    address: '',
    currency: '',
    exRate: '',
    remarks: '',
    otherInfo: '',
    // shipRefNo: '',
    status: '',
    orginBill: '',
    orginBillDate: null,
    gstType: ''
  });

  const listViewColumns = [
    { accessorKey: 'docId', header: 'Doc No', size: 140 },
    { accessorKey: 'vohNo', header: 'Voucher No', size: 140 },
    { accessorKey: 'vohDate', header: 'Voucher Date', size: 140 },
    { accessorKey: 'partyType', header: 'Party Type', size: 140 },
    { accessorKey: 'partyName', header: 'Party Name', size: 140 },
    { accessorKey: 'creditDays', header: 'Credit Days', size: 140 },
    // { accessorKey: 'shipRefNo', header: 'Shipper RefNo', size: 140 },
    { accessorKey: 'orginBill', header: 'Original bill', size: 140 },
    { accessorKey: 'gstType', header: 'Gst Type', size: 140 }
  ];

  const [taxParticularData, setTaxParticularData] = useState({
    tds: '',
    tdsPercentage: '',
    section: '',
    totTDSAmt: ''
  });

  const [taxParticularErrors, setTaxParticularErrors] = useState({
    tds: '',
    tdsPercentage: '',
    section: '',
    totTDSAmt: ''
  });

  const [summaryData, setSummaryData] = useState({
    roundOff: '',
    totChargesBillCurrAmt: '',
    totChargesLCAmt: '',
    totGrossBillAmt: '',
    totGrossLCAmt: '',
    netBillCurrAmt: '',
    netLCAmt: '',
    amtInWords: ''
  });

  const [summaryErrors, setSummaryErrors] = useState({
    roundOff: '',
    totChargesBillCurrAmt: '',
    totChargesLCAmt: '',
    totGrossBillAmt: '',
    totGrossLCAmt: '',
    netBillCurrAmt: '',
    netLCAmt: '',
    amtInWords: ''
  });

  const theme = useTheme();
  const anchorRef = useRef(null);
  const [value, setValue] = useState('1');

  const [houseChargeTableData, setHouseChargeTableData] = useState([
    {
      id: 1,
      jobNo: '',
      chargeCode: '',
      gchargeCode: '',
      chargeName: '',
      taxable: '',
      qty: '',
      rate: '',
      currency: '',
      exRate: '',
      fcAmt: '',
      lcAmt: '',
      billAmt: '',
      sac: '',
      gstPercentage: '',
      gst: ''
    }
  ]);

  const [houseChargeTableErrors, setHouseChargeTableErrors] = useState([
    {
      jobType: '',
      jobNo: '',
      subJobNo: '',
      houseNo: '',
      chargeCode: '',
      gchargeCode: '',
      gsac: '',
      chargeName: '',
      applyOn: '',
      tax: true,
      currency: '',
      exRate: '',
      rate: '',
      exampted: true,
      fcAmt: '',
      lcAmt: '',
      taxPercentage: '',
      tlcAmt: '',
      billAmt: '',
      gstPercentage: '',
      gst: ''
    }
  ]);

  // const handleAddRow = () => {
  //   if (isLastRowEmpty(houseChargeTableData)) {
  //     displayRowError(houseChargeTableData);
  //     return;
  //   }
  //   const newRow = {
  //       id: Date.now(),
  //       jobNo: '',
  //       chargeCode: '',
  //       gchargeCode: '',
  //       chargeName: '',
  //       taxable: '',
  //       qty: '',
  //       rate: '',
  //       currency: '',
  //       exRate: '',
  //       fcAmt: '',
  //       lcAmt: '',
  //       billAmt: '',
  //       sac: '',
  //       gstPercentage: '',
  //       gst: ''
  //   };
  //   setHouseChargeTableData([...houseChargeTableData, newRow]);
  //   setHouseChargeTableErrors([
  //     ...houseChargeTableErrors,
  //     {
  //       jobNo: '',
  //       chargeCode: '',
  //       gchargeCode: '',
  //       chargeName: '',
  //       taxable: '',
  //       qty: '',
  //       rate: '',
  //       currency: '',
  //       exRate: '',
  //       fcAmt: '',
  //       lcAmt: '',
  //       billAmt: '',
  //       sac: '',
  //       gstPercentage: '',
  //       gst: ''
  //     }
  //   ]);
  // };

  // const isLastRowEmpty = (table) => {
  //   const lastRow = table[table.length - 1];
  //   if (!lastRow) return false;

  //   if (table === houseChargeTableData) {
  //     return (
  //       !lastRow.jobType ||
  //       !lastRow.jobNo ||
  //       !lastRow.subJobNo ||
  //       !lastRow.houseNo ||
  //       !lastRow.chargeCode ||
  //       !lastRow.gchargeCode ||
  //       !lastRow.gsac ||
  //       !lastRow.chargeName ||
  //       !lastRow.applyOn ||
  //       // !lastRow.tax ||
  //       !lastRow.currency ||
  //       !lastRow.exRate ||
  //       !lastRow.rate ||
  //       // !lastRow.exampted ||
  //       !lastRow.fcAmt ||
  //       !lastRow.lcAmt ||
  //       !lastRow.taxPercentage ||
  //       !lastRow.tlcAmt ||
  //       !lastRow.billAmt ||
  //       !lastRow.gstPercentage ||
  //       !lastRow.gst
  //     );
  //   }
  //   return false;
  // };

  // const displayRowError = (table) => {
  //   if (table === houseChargeTableData) {
  //     setHouseChargeTableErrors((prevErrors) => {
  //       const newErrors = [...prevErrors];
  //       newErrors[table.length - 1] = {
  //         ...newErrors[table.length - 1],
  //         jobType: !table[table.length - 1].jobType ? 'Job Type is required' : '',
  //         jobNo: !table[table.length - 1].jobNo ? 'Job No is required' : '',
  //         subJobNo: !table[table.length - 1].subJobNo ? 'Sub Job No is required' : '',
  //         houseNo: !table[table.length - 1].houseNo ? 'House No is required' : '',
  //         chargeCode: !table[table.length - 1].chargeCode ? 'Charge Code is required' : '',
  //         gchargeCode: !table[table.length - 1].gchargeCode ? 'G Charge Code is required' : '',
  //         gsac: !table[table.length - 1].gsac ? 'GSAC is required' : '',
  //         chargeName: !table[table.length - 1].chargeName ? 'Charge Name is required' : '',
  //         applyOn: !table[table.length - 1].applyOn ? 'Apply On is required' : '',
  //         // tax: !table[table.length - 1].tax ? 'Tax is required' : '',
  //         currency: !table[table.length - 1].currency ? 'Currency is required' : '',
  //         exRate: !table[table.length - 1].exRate ? 'Ex Rate is required' : '',
  //         rate: !table[table.length - 1].rate ? 'Rate is required' : '',
  //         // exampted: !table[table.length - 1].exampted ? 'Exempted is required' : '',
  //         fcAmt: !table[table.length - 1].fcAmt ? 'Fc Amt is required' : '',
  //         lcAmt: !table[table.length - 1].lcAmt ? 'Lc Amt is required' : '',
  //         taxPercentage: !table[table.length - 1].taxPercentage ? 'Tax Percentage is required' : '',
  //         tlcAmt: !table[table.length - 1].tlcAmt ? 'Tlc Amt is required' : '',
  //         billAmt: !table[table.length - 1].billAmt ? 'Bill Amt is required' : '',
  //         gstPercentage: !table[table.length - 1].gstPercentage ? 'Gst% is required' : '',
  //         gst: !table[table.length - 1].gst ? 'Gst is required' : ''
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

  const getCostDebitNoteDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/costdebitnote/getCostDebitNoteDocId?branchCode=${branchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setDocId(response.paramObjectsMap.costDebitNoteDocId);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const [gstTableData, setGstTableData] = useState([
    {
      id: 1,
      chargeAcc: '',
      subLodgerCode: '',
      dbillAmt: '',
      crBillAmt: '',
      dblcamt: '',
      crLCAmt: ''
      // remarks: ''
    }
  ]);

  const [gstTableErrors, setGstTableErrors] = useState([
    {
      chargeAcc: '',
      subLodgerCode: '',
      dbillAmt: '',
      crBillAmt: '',
      dblcamt: '',
      crLCAmt: ''
    }
  ]);

  const handleAddRow1 = () => {
    if (isLastRowEmpty1(gstTableData)) {
      displayRowError1(gstTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      chargeAcc: '',
      subLodgerCode: '',
      dbillAmt: '',
      crBillAmt: '',
      dblcamt: '',
      crLCAmt: ''
    };
    setGstTableData([...gstTableData, newRow]);
    setGstTableErrors([...gstTableErrors, { chargeAcc: '', subLodgerCode: '', dbillAmt: '', crBillAmt: '', dblcamt: '', crLCAmt: '' }]);
  };

  const isLastRowEmpty1 = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === gstTableData) {
      return (
        !lastRow.chargeAcc || !lastRow.subLodgerCode || !lastRow.dbillAmt || !lastRow.crBillAmt || !lastRow.dblcamt || !lastRow.crLCAmt
      );
    }
    return false;
  };

  const displayRowError1 = (table) => {
    if (table === gstTableData) {
      setGstTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          chargeAcc: !table[table.length - 1].chargeAcc ? 'Charge Account is required' : '',
          subLodgerCode: !table[table.length - 1].subLodgerCode ? 'SubLedger Code is required' : '',
          dbillAmt: !table[table.length - 1].dbillAmt ? 'DBill Amt is required' : '',
          crBillAmt: !table[table.length - 1].crBillAmt ? 'Crbill Amt is required' : '',
          dblcamt: !table[table.length - 1].dblcamt ? 'Dblc Amt is required' : '',
          crLCAmt: !table[table.length - 1].crLCAmt ? 'Crlc Amt is required' : ''
        };
        return newErrors;
      });
    }
  };

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

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleClear = () => {
    // Reset form data to initial state
    setFormData({
      subType: 'Debit Note',
      product: '',
      vohNo: '',
      vohDate: null,
      partyType: '',
      partyCode: '',
      suppRefNo: '',
    suppRefDate: null,
      currentDate: dayjs(),
      currentDateValue: '',
      partyName: '',
      partyAddType: '',
      creditDays: '',
      dueDate: null,
      taxExampt: true,
      address: '',
      currency: '',
      exRate: '',
      remarks: '',
      otherInfo: '',
      // shipRefNo: '',
      status: '',
      orginBill: '',
      orginBillDate: null,
      gstType: ''
    });

    // Reset field errors to initial state
    setFieldErrors({
      subType: '',
      product: '',
      vohNo: '',
      vohDate: null,
      partyType: '',
      partyCode: '',
      suppRefNo: '',
    suppRefDate: null,
      currentDate: null,
      currentDateValue: '',
      partyName: '',
      partyAddType: '',
      creditDays: '',
      dueDate: null,
      taxExampt: true,
      address: '',
      currency: '',
      exRate: '',
      remarks: '',
      otherInfo: '',
      // shipRefNo: '',
      status: '',
      orginBill: '',
      orginBillDate: null,
      gstType: ''
    });

    setTaxParticularData({
      tds: '',
      tdsPercentage: '',
      section: '',
      totTDSAmt: ''
    });

    // Reset tax particular errors to initial state
    setTaxParticularErrors({
      tds: '',
      tdsPercentage: '',
      section: '',
      totTDSAmt: ''
    });

    setSummaryData({
      roundOff: '',
      totChargesBillCurrAmt: '',
      totChargesLCAmt: '',
      totGrossBillAmt: '',
      totGrossLCAmt: '',
      netBillCurrAmt: '',
      netLCAmt: '',
      amtInWords: ''
    });

    // Reset summary errors to initial state
    setSummaryErrors({
      roundOff: '',
      totChargesBillCurrAmt: '',
      totChargesLCAmt: '',
      totGrossBillAmt: '',
      totGrossLCAmt: '',
      netBillCurrAmt: '',
      netLCAmt: '',
      amtInWords: ''
    });

    // Reset house charge table data and errors to initial state
    setHouseChargeTableData([
      {
        id: 1,
        jobNo: '',
        chargeCode: '',
        gchargeCode: '',
        chargeName: '',
        taxable: '',
        qty: '',
        rate: '',
        currency: '',
        exRate: '',
        fcAmt: '',
        lcAmt: '',
        billAmt: '',
        sac: '',
        gstPercentage: '',
        gst: ''
      }
    ]);

    setHouseChargeTableErrors([
      {
        jobType: '',
        jobNo: '',
        subJobNo: '',
        houseNo: '',
        chargeCode: '',
        gchargeCode: '',
        gsac: '',
        chargeName: '',
        applyOn: '',
        tax: true,
        currency: '',
        exRate: '',
        rate: '',
        exampted: true,
        fcAmt: '',
        lcAmt: '',
        taxPercentage: '',
        tlcAmt: '',
        billAmt: '',
        gstPercentage: '',
        gst: ''
      }
    ]);

    // Reset GST table data and errors to initial state
    setGstTableData([
      {
        id: 1,
        chargeAcc: '',
        subLodgerCode: '',
        dbillAmt: '',
        crBillAmt: '',
        dblcamt: '',
        crLCAmt: ''
      }
    ]);

    setGstTableErrors([
      {
        chargeAcc: '',
        subLodgerCode: '',
        dbillAmt: '',
        crBillAmt: '',
        dblcamt: '',
        crLCAmt: ''
      }
    ]);
    getCostDebitNoteDocId();
  };

  const handleTabSelect = (index) => {
    setTabIndex(index);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    const numericFields = [
      'tdsPercentage',
      'totTDSAmt',
      'creditDays',
      'exRate',
      'currentDateValue',
      'netBillCurrAmt',
      'netLCAmt',
      'roundOff',
      'totChargesBillCurrAmt',
      'totChargesLCAmt',
      'totGrossBillAmt',
      'totGrossLCAmt'
    ];

    // Check if field is numeric and validate
    if (numericFields.includes(name)) {
      if (!/^\d*\.?\d*$/.test(value)) {
        // Allowing decimals now
        console.log(`Setting error for ${name}`);
        setFieldErrors((prev) => ({ ...prev, [name]: 'Only numbers are allowed' }));
        setTaxParticularErrors((prev) => ({ ...prev, [name]: 'Only numbers are allowed' }));
        setSummaryErrors((prev) => ({ ...prev, [name]: 'Only numbers are allowed' }));
        return;
      } else {
        // Clear numeric validation errors if present
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        setTaxParticularErrors((prev) => ({ ...prev, [name]: '' }));
        setSummaryErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }

    // Determine which state to update
    if (name in taxParticularData) {
      console.log(`Updating taxParticularData for ${name}`);
      setTaxParticularData((prev) => ({ ...prev, [name]: inputValue }));
    } else if (name in summaryData) {
      console.log(`Updating summaryData for ${name}`);
      setSummaryData((prev) => ({ ...prev, [name]: inputValue }));
    } else {
      console.log(`Updating formData for ${name}`);
      setFormData((prev) => ({ ...prev, [name]: inputValue }));
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

  // const handlePartyNameChange = (event, newValue) => {
  //   if (newValue) {
  //     // Update partyName and partyCode in formData based on the selected party
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       partyName: newValue.partyName,
  //       partyCode: newValue.partyCode
  //     }));
  //   } else {
  //     // Clear the fields if no selection
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       partyName: '',
  //       partyCode: ''
  //     }));
  //   }
  // };

  const handlePartyNameChange = (event, newValue) => {
    if (newValue) {
      // Update partyName and partyCode in formData based on the selected party
      setFormData((prevFormData) => ({
        ...prevFormData,
        partyName: newValue.partyName,
        partyCode: newValue.partyCode
      }));

      // Call the API to get the original bills based on the selected party
      getAllOriginalBill(newValue.partyName);
    } else {
      // Clear the fields if no selection
      setFormData((prevFormData) => ({
        ...prevFormData,
        partyName: '',
        partyCode: ''
      }));

      // Clear the list of original bills if no party is selected
      setAllOriginalBill([]);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero based
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    getCostDebitNoteDocId();
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

  const getAllChargeCode = async () => {
    try {
      const response = await apiCalls('get', `costdebitnote/chargeTypeDetailsForCostDebitNote?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllChargeCode(response.paramObjectsMap.chargeType);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllOriginalBill = async (party) => {
    try {
      const response = await apiCalls('get', `costdebitnote/getOrginBillNoByParty?branchCode=${branchCode}&orgId=${orgId}&party=${party}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllOriginalBill(response.paramObjectsMap.costInvoiceVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOrginBillChange = (event) => {
    const { value } = event.target;

    // Find the selected bill from the list
    const selectedBill = allOriginalBill.find((doc) => doc.docId === value);

    // If a matching bill is found, update the formData accordingly
    if (selectedBill) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        orginBill: value,
        orginBillDate: selectedBill.docDate,
        product: selectedBill.product,
        docDate: selectedBill.docDate,
        // vohNo: selectedBill.purVoucherNo,
        // vohDate: selectedBill.purVoucherDate,
        creditDays: selectedBill.creditDays,
        address: selectedBill.address,
        currency: selectedBill.currency,
        exRate: selectedBill.exRate,
        // remarks: selectedBill.remarks,
        otherInfo: selectedBill.otherInfo,
        // shipRefNo: selectedBill.shipperRefNo,
        suppRefNo: selectedBill.purVoucherNo,
        suppRefDate: selectedBill.purVoucherDate,
        gstType: selectedBill.gstType
      }));
      if (selectedBill.tdsCostInvoiceVO && selectedBill.tdsCostInvoiceVO.length > 0) {
        const tdsData = selectedBill.tdsCostInvoiceVO[0]; // Assuming only one entry
        setTaxParticularData({
          tds: tdsData.tdsWithHolding,
          tdsPercentage: tdsData.tdsWithHoldingPer,
          section: tdsData.section,
          totTDSAmt: tdsData.totTdsWhAmnt,
        });
      }
      if (selectedBill) {
        setSummaryData({
          roundOff: selectedBill.roundOff,
          totChargesBillCurrAmt: selectedBill.totChargesBillCurrAmt,
          totChargesLCAmt: selectedBill.totChargesLcAmt,
          totGrossBillAmt: selectedBill.totTdsWhAmnt,
          totGrossLCAmt: selectedBill.totTdsWhAmnt,
          netBillCurrAmt: selectedBill.netBillCurrAmt,
          netLCAmt: selectedBill.netBillLcAmt,
          amtInWords: selectedBill.totTdsWhAmnt,
        });
      } 
      if (selectedBill.chargerCostInvoiceVO) {
        setHouseChargeTableData(
          selectedBill.chargerCostInvoiceVO.map((item) => ({
            id: item.id,
            jobNo: item.jobNo,
            chargeCode: item.chargeCode,
            gchargeCode: item.govChargeCode,
            chargeName: item.chargeName,
            taxable: item.taxable,
            qty: item.qty,
            rate: item.rate,
            currency: item.currency,
            exRate: item.exRate,
            fcAmt: item.fcAmt,
            lcAmt: item.lcAmt,
            billAmt: item.billAmt,
            sac: item.sac,
            gst: item.gstAmount,
            gstPercentage: item.gstpercent
            // Map other fields as needed
          }))
        );
      }
    }
  };

  const getAllCostDebitNote = async () => {
    try {
      const response = await apiCalls('get', `costdebitnote/getCostDebitNoteByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.costDebitNoteVOs);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllPartyType = async () => {
    try {
      const response = await apiCalls('get', `costdebitnote/partyTypeForCostDebitNote?branch=${branch}&finYear=${finYear}&orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setAllPartyType(response.paramObjectsMap.partyMaster);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllPartyName = async (partyType) => {
    try {
      const response = await apiCalls(
        'get',
        `costdebitnote/partyDetailsForCostDebitNote?branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      console.log('API Response:', response);
      // &partyType=${partyType}

      if (response.status === true) {
        setAllPartyName(response.paramObjectsMap.partyMaster);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getAllChargeCode();
    getAllOriginalBill();
    getAllCostDebitNote();
    getAllPartyType();
    getAllPartyName();
  }, []);

  const handleView = () => {
    setListView(!listView);
  };

  const handleChargeCodeChange = (index, selectedChargeCode) => {
    const selectedCharge = allChargeCode.find((charge) => charge.chargeCode === selectedChargeCode);
    const newHouseChargeTableData = [...houseChargeTableData];

    if (selectedCharge) {
      newHouseChargeTableData[index] = {
        ...newHouseChargeTableData[index],
        chargeCode: selectedChargeCode,
        gchargeCode: selectedCharge.serviceAccountCode, // Set gchargeCode based on the selected chargeCode
        gsac: selectedCharge.govtSac, // Set gsac based on the selected chargeCode
        chargeName: selectedCharge.chargeType // Set chargeName based on the selected chargeCode
      };
      setHouseChargeTableData(newHouseChargeTableData);
    }
  };

  const getCostDebitNoteById = async (row) => {
    console.log('first', row);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `/costdebitnote/getCostDebitNoteById?id=${row.original.id}`);
      if (response.status === true) {
        setListView(false);
        const costVO = response.paramObjectsMap.costDebitNoteVOs[0]; // Accessing first element

        setDocId(costVO.docId);

        setFormData({
          subType: costVO.subType,
          product: costVO.product,
          vohNo: costVO.vohNo,
          vohDate: costVO.vohDate,
          partyType: costVO.partyType,
          partyCode: costVO.partyCode,
          suppRefNo: costVO.suppRefNo,
          currentDate: costVO.currentDate,
          currentDateValue: costVO.currentDateValue,
          partyName: costVO.partyName,
          partyAddType: costVO.partyAddType,
          creditDays: costVO.creditDays,
          dueDate: costVO.dueDate,
          taxExampt: costVO.taxExampt,
          address: costVO.address,
          currency: costVO.currency,
          exRate: costVO.exRate,
          remarks: costVO.remarks,
          otherInfo: costVO.otherInfo,
          // shipRefNo: costVO.shipRefNo,
          status: costVO.status,
          orginBill: costVO.orginBill,
          gstType: costVO.gstType,
          // docDate: costVO.docDate ? dayjs(costVO.docDate).format('YYYY-MM-DD') : null, // Ensure date format
          active: costVO.active,
          cancel: costVO.cancel
        });

        const summaryData = costVO.costDebitNoteSummaryVO[0]; // Access the first element directly
        setSummaryData({
          roundOff: summaryData.roundOff || '',
          totChargesBillCurrAmt: summaryData.totChargesBillCurrAmt || '',
          totChargesLCAmt: summaryData.totChargesLCAmt || '',
          totGrossBillAmt: summaryData.totGrossBillAmt || '',
          totGrossLCAmt: summaryData.totGrossLCAmt || '',
          netBillCurrAmt: summaryData.netBillCurrAmt || '',
          netLCAmt: summaryData.netLCAmt || '',
          amtInWords: summaryData.amtInWords || ''
        });

        const taxData = costVO.costDebitNoteTaxPrtculVO[0]; // Access the first element directly
        setTaxParticularData({
          tds: taxData.tds || '',
          tdsPercentage: taxData.tdsPercentage || '',
          section: taxData.section || '',
          totTDSAmt: taxData.totTDSAmt || ''
        });

        // Mapping House Charges Data
        setHouseChargeTableData(
          costVO.costDebitChargesVO.map((chargeData) => ({
            id: chargeData.id,
            jobType: chargeData.jobType,
            jobNo: chargeData.jobNo,
            subJobNo: chargeData.subJobNo,
            houseNo: chargeData.houseNo,
            chargeCode: chargeData.chargeCode,
            chargeName: chargeData.chargeName,
            applyOn: chargeData.applyOn,
            tax: chargeData.tax,
            currency: chargeData.currency,
            exRate: chargeData.exRate,
            rate: chargeData.rate,
            exampted: chargeData.exampted,
            fcAmt: chargeData.fcAmt,
            lcAmt: chargeData.lcAmt,
            taxPercentage: chargeData.taxPercentage,
            tlcAmt: chargeData.tlcAmt,
            billAmt: chargeData.billAmt,
            gstPercentage: chargeData.gstPercentage,
            gst: chargeData.gst,
            gchargeCode: chargeData.gchargeCode,
            gsac: chargeData.gsac // Ensure this is correct
          }))
        );

        // Mapping GST Data
        setGstTableData(
          costVO.costDebitNoteGstVO.map((gstData) => ({
            id: gstData.id,
            chargeAcc: gstData.chargeAcc,
            subLodgerCode: gstData.subLodgerCode,
            crBillAmt: gstData.crBillAmt,
            crLCAmt: gstData.crLCAmt,
            remarks: gstData.remarks,
            dbillAmt: gstData.dbillAmt,
            dblcamt: gstData.dblcamt
          }))
        );
      } else {
        // Handle error
        console.error('Error in response status');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = {};
    const tableErrors = houseChargeTableData.map((row) => ({
      jobType: !row.jobType ? 'Job Type is required' : '',
      jobNo: !row.jobNo ? 'Job No is required' : '',
      subJobNo: !row.subJobNo ? 'SubJob No is required' : '',
      houseNo: !row.houseNo ? 'House No is required' : '',
      chargeCode: !row.chargeCode ? 'ChargeCode is required' : '',
      applyOn: !row.applyOn ? 'Apply On is required' : '',
      currency: !row.currency ? 'Currency is required' : '',
      exRate: !row.exRate ? 'Ex Rate is required' : '',
      rate: !row.rate ? 'Rate is required' : '',
      fcAmt: !row.fcAmt ? 'Fc Amt is required' : '',
      lcAmt: !row.lcAmt ? 'Lc Amt is required' : '',
      taxPercentage: !row.taxPercentage ? 'Tax Percentage is required' : '',
      tlcAmt: !row.tlcAmt ? 'Tlc Amt is required' : '',
      billAmt: !row.billAmt ? 'Bill Amt is required' : '',
      gstPercentage: !row.gstPercentage ? 'Gst % is required' : '',
      gst: !row.gst ? 'gst is required' : ''
    }));

    const tableGstErrors = gstTableData.map((row) => ({
      chargeAcc: !row.chargeAcc ? 'Charge Acc is required' : '',
      subLodgerCode: !row.subLodgerCode ? 'SubLodger Code is required' : '',
      dbillAmt: !row.dbillAmt ? 'Dbill Amt is required' : '',
      crBillAmt: !row.crBillAmt ? 'CrBill Amt is required' : '',
      dblcamt: !row.dblcamt ? 'Dblc amt is required' : '',
      crLCAmt: !row.crLCAmt ? 'CrLC Amt is required' : ''
    }));

    let hasTableErrors = false;
    let hasTableGstErrors = false;

    tableErrors.forEach((err) => {
      if (Object.values(err).some((error) => error)) {
        hasTableErrors = true;
      }
    });

    tableGstErrors.forEach((err) => {
      if (Object.values(err).some((error) => error)) {
        hasTableGstErrors = true;
      }
    });

    if (!formData.subType) {
      errors.subType = 'Sub Type is required';
    }
    if (!formData.product) {
      errors.product = 'Product is required';
    }
    if (!formData.vohNo) {
      errors.vohNo = 'Voucher No is required';
    }
    if (!formData.vohDate) {
      errors.vohDate = 'Voucher Date is required';
    }
    if (!formData.partyType) {
      errors.partyType = 'Party Type is required';
    }
    if (!formData.suppRefNo) {
      errors.suppRefNo = 'Supplier Ref No is required';
    }
    if (!formData.currentDate) {
      errors.currentDate = 'Date is required';
    }
    if (!formData.partyName) {
      errors.partyName = 'Party Name is required';
    }
    if (!formData.creditDays) {
      errors.creditDays = 'Credit Days is required';
    }
    if (!formData.dueDate) {
      errors.dueDate = 'Due Date is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'Ex Rate is required';
    }
    if (!formData.remarks) {
      errors.remarks = 'Remarks is required';
    }
    if (!formData.otherInfo) {
      errors.otherInfo = 'Other Info is required';
    }
    // if (!formData.shipRefNo) {
    //   errors.shipRefNo = 'Shipper RefNo is required';
    // }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    if (!formData.orginBill) {
      errors.orginBill = 'Orginal Bill is required';
    }
    if (!formData.gstType) {
      errors.gstType = 'Gst Type is required';
    }

    if (!taxParticularData.tds) {
      errors.taxParticularData = { ...errors.taxParticularData, tds: 'TDS is required' };
    }
    if (!taxParticularData.tdsPercentage) {
      errors.taxParticularData = { ...errors.taxParticularData, tdsPercentage: 'TDS % is required' };
    }
    if (!taxParticularData.section) {
      errors.taxParticularData = { ...errors.taxParticularData, section: 'Section is required' };
    }
    if (!taxParticularData.totTDSAmt) {
      errors.taxParticularData = { ...errors.taxParticularData, totTDSAmt: 'TotTDS Amt is required' };
    }

    if (!summaryData.roundOff) {
      errors.summaryData = { ...errors.summaryData, roundOff: 'Round Off is required' };
    }
    if (!summaryData.totChargesBillCurrAmt) {
      errors.summaryData = {
        ...errors.summaryData,
        totChargesBillCurrAmt: 'Tot Charges Amt (Bill Curr) is required'
      };
    }
    if (!summaryData.totChargesLCAmt) {
      errors.summaryData = { ...errors.summaryData, totChargesLCAmt: 'Tot Charges Amt (LC) is required' };
    }
    if (!summaryData.totGrossBillAmt) {
      errors.summaryData = { ...errors.summaryData, totGrossBillAmt: 'Tot Gross Amt (Bill Curr) is required' };
    }
    if (!summaryData.totGrossLCAmt) {
      errors.summaryData = { ...errors.summaryData, totGrossLCAmt: 'Tot Gross Amt (LC) is required' };
    }
    if (!summaryData.netBillCurrAmt) {
      errors.summaryData = { ...errors.summaryData, netBillCurrAmt: 'Net Amt Bill is required' };
    }
    if (!summaryData.netLCAmt) {
      errors.summaryData = { ...errors.summaryData, netLCAmt: 'Net Amt (LC) is required' };
    }
    if (!summaryData.amtInWords) {
      errors.summaryData = { ...errors.summaryData, amtInWords: 'Amount in Words is required' };
    }

    setFieldErrors(errors);
    setHouseChargeTableErrors(tableErrors);
    setGstTableErrors(tableGstErrors);
    setTaxParticularErrors(errors.taxParticularData);
    setSummaryErrors(errors.summaryData);

    // Prevent saving if form or table errors exist
    if (Object.keys(errors).length === 0 && !hasTableErrors && !hasTableGstErrors) {
      setIsLoading(true);

      const houseChargeTableVo = houseChargeTableData.map((row) => ({
        // id: item.id || 0, // If id exists, otherwise 0
        ...(editId && { id: row.id }),
        jobType: row.jobType,
        jobNo: row.jobNo,
        subJobNo: row.subJobNo,
        houseNo: row.houseNo,
        chargeCode: row.chargeCode,
        gchargeCode: row.gchargeCode,
        gsac: row.gsac,
        chargeName: row.chargeName,
        applyOn: row.applyOn,
        tax: row.tax,
        currency: row.currency,
        exRate: parseInt(row.exRate),
        rate: parseInt(row.rate),
        exampted: row.exampted,
        fcAmt: parseInt(row.fcAmt),
        lcAmt: parseInt(row.lcAmt),
        taxPercentage: parseInt(row.taxPercentage),
        tlcAmt: parseInt(row.tlcAmt),
        billAmt: parseInt(row.billAmt),
        gstPercentage: parseInt(row.gstPercentage),
        gst: parseInt(row.gst)
      }));

      const gstTableVo = gstTableData.map((row) => ({
        // id: item.id || 0, // If id exists, otherwise 0
        ...(editId && { id: row.id }),
        chargeAcc: row.chargeAcc,
        subLodgerCode: row.subLodgerCode,
        dbillAmt: parseInt(row.dbillAmt),
        crBillAmt: parseInt(row.crBillAmt),
        dblcamt: parseInt(row.dblcamt),
        crLCAmt: parseInt(row.crLCAmt),
        remarks: row.remarks
      }));

      // Mapping costDebitNoteTaxPrtculDTO
      const costDebitNoteTaxPrtculDTO = [
        {
          ...(editId && { id: taxParticularData.id }),
          tds: taxParticularData.tds,
          tdsPercentage: parseInt(taxParticularData.tdsPercentage),
          section: taxParticularData.section,
          totTDSAmt: parseInt(taxParticularData.totTDSAmt)
        }
      ];

      // Mapping costDebitNoteSummaryDTO
      const costDebitNoteSummaryDTO = [
        {
          ...(editId && { id: summaryData.id }),
          roundOff: parseInt(summaryData.roundOff),
          totChargesBillCurrAmt: parseInt(summaryData.totChargesBillCurrAmt),
          totChargesLCAmt: parseInt(summaryData.totChargesLCAmt),
          totGrossBillAmt: parseInt(summaryData.totGrossBillAmt),
          totGrossLCAmt: parseInt(summaryData.totGrossLCAmt),
          netBillCurrAmt: parseInt(summaryData.netBillCurrAmt),
          netLCAmt: parseInt(summaryData.netLCAmt),
          amtInWords: summaryData.amtInWords
        }
      ];

      const saveFormData = {
        ...(editId && { id: editId }),
        subType: formData.subType,
        product: formData.product,
        vohNo: formData.vohNo,
        vohDate: formatDate(formData.vohDate),
        partyType: formData.partyType,
        partyCode: formData.partyCode,
        suppRefNo: formData.suppRefNo,
        currentDate: formatDate(formData.currentDate),
        currentDateValue: parseInt(formData.currentDateValue),
        partyName: formData.partyName,
        partyAddType: formData.partyAddType,
        creditDays: parseInt(formData.creditDays),
        dueDate: formatDate(formData.dueDate),
        taxExampt: formData.taxExampt,
        address: formData.address,
        currency: formData.currency,
        exRate: parseInt(formData.exRate),
        remarks: formData.remarks,
        otherInfo: formData.otherInfo,
        // shipRefNo: formData.shipRefNo,
        status: formData.status,
        orginBill: formData.orginBill,
        gstType: formData.gstType,
        createdBy: loginUserName,
        orgId: parseInt(orgId),
        branch: branch,
        branchCode: branchCode,
        cancelRemarks: '',
        finYear: finYear,
        suppDate: formatDate(new Date()),
        ipNo: '',
        latitude: '',

        // Fix: Use DTO array for charges
        costDebitChargesDTO: houseChargeTableVo,
        costDebitNoteGstDTO: gstTableVo,
        costDebitNoteTaxPrtculDTO: costDebitNoteTaxPrtculDTO,
        costDebitNoteSummaryDTO: costDebitNoteSummaryDTO
      };

      try {
        const response = await apiCalls('put', `costdebitnote/updateCreateCostDebitNote`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'Cost Debit Note Updated Successfully' : 'Cost Debit Note created successfully');
          handleClear();
          getAllCostDebitNote();
          getCostDebitNoteDocId();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Cost Debit Note creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Cost Debit Note creation failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row">
          {/* MENU BAR  */}
          <div className="d-flex flex-wrap justify-content-start mb-4">
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} margin="0 10px 0 10px" onClick={handleSave} />
          </div>
          {/* FIELDS */}
          {listView ? (
            <div className="">
              <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCostDebitNoteById} />
            </div>
          ) : (
            <div className="row d-flex">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="docId"
                    label="Doc No"
                    name="docId"
                    variant="outlined"
                    size="small"
                    disabled
                    value={docId}
                    required
                    fullWidth
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.subType}>
                  <InputLabel id="subType" required>
                    Sub Type
                  </InputLabel>
                  <Select labelId="subType" value={formData.subType} label="Sub Type" disabled>
                    <MenuItem value="Debit Note">Debit Note</MenuItem>
                    <MenuItem value="Credit Note">Credit Note</MenuItem>
                  </Select>
                  {fieldErrors.subType && <FormHelperText>{fieldErrors.subType}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField size="small" inputProps={{ maxLength: 30 }} value="Reducing the Cost" disabled />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.product}>
                  <InputLabel id="product" required>
                    Product
                  </InputLabel>
                  <Select labelId="product" value={formData.product} label="Product" disabled>
                    <MenuItem value="Nill">Nill</MenuItem>
                    <MenuItem value="Product 1">Product 1</MenuItem>
                  </Select>
                  {fieldErrors.product && <FormHelperText>{fieldErrors.product}</FormHelperText>}
                </FormControl>
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="product"
                    label="Product"
                    name="product"
                    value={formData.product}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.product}
                    helperText={fieldErrors.product ? fieldErrors.product : ''}
                  />
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
                      disabled
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
{editId && (
  <>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="vohNo"
                    label="Voucher No"
                    name="vohNo"
                    value={formData.vohNo}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.vohNo}
                    helperText={fieldErrors.vohNo ? fieldErrors.vohNo : ''}
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
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              </>
              )}
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.partyType}>
                  <InputLabel id="partyType">Party Type</InputLabel>
                  <Select
                    labelId="partyType"
                    id="partyType"
                    label="Party Type"
                    onChange={handlePartyTypeChange}
                    name="partyType"
                    value={formData.partyType}
                  >
                    {allPartyType.map((party, index) => (
                      <MenuItem key={index} value={party.partyType}>
                        {party.partyType}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.partyType && <FormHelperText>{fieldErrors.partyType}</FormHelperText>}
                </FormControl>
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl variant="outlined" fullWidth size="small" error={!!fieldErrors.partyType}>
                  <InputLabel id="partyType">Party Type</InputLabel>
                  <Select labelId="partyType" label="Party Type" name="partyType" value={formData.partyType} onChange={handleInputChange}>
                    {allPartyType?.map((row) => (
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
                  onChange={handlePartyNameChange}
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
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.orginBill}>
                  <InputLabel id="orginBill">Original Bill</InputLabel>
                  <Select
                    labelId="orginBill"
                    id="orginBill"
                    label="Original Bill"
                    onChange={handleOrginBillChange}
                    name="orginBill"
                    value={formData.orginBill}
                  >
                    <MenuItem value="">--Select--</MenuItem>
                    {allOriginalBill.map((doc) => (
                      <MenuItem key={doc.id} value={doc.docId}>
                        {doc.docId}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.orginBill && <FormHelperText>{fieldErrors.orginBill}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Original Bill Date"
                      value={formData.orginBillDate ? dayjs(formData.orginBillDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('orginBillDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.orginBillDate}
                      helperText={fieldErrors.orginBillDate ? fieldErrors.orginBillDate : ''}
                    />
                  </LocalizationProvider>
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
                    id="suppRefNo"
                    label="Supplier Ref No"
                    name="suppRefNo"
                    value={formData.suppRefNo}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.suppRefNo}
                    helperText={fieldErrors.suppRefNo ? fieldErrors.suppRefNo : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Supplier Ref Date"
                      value={formData.suppRefDate ? dayjs(formData.suppRefDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('suppRefDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={!!fieldErrors.suppRefDate}
                      helperText={fieldErrors.suppRefDate ? fieldErrors.suppRefDate : ''}
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
                    helperText={fieldErrors.currentDateValue ? fieldErrors.currentDateValue : ''}
                  />
                </FormControl>
              </div> */}

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="partyAddType"
                    name="partyAddType"
                    value={formData.partyAddType}
                    variant="outlined"
                    size="small"
                    disabled
                    fullWidth
                  />
                </FormControl>
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="creditDays"
                    label="Credit Days"
                    name="creditDays"
                    value={formData.creditDays}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.creditDays}
                    helperText={fieldErrors.creditDays ? fieldErrors.creditDays : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
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
              </div>

              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="taxExampt"
                        name="taxExampt"
                        checked={formData.taxExampt}
                        onChange={handleInputChange}
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Tax Exempt"
                  />
                </FormGroup>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="address"
                    label="Address"
                    name="address"
                    value={formData.address}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.address}
                    helperText={fieldErrors.address ? fieldErrors.address : ''}
                  />
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
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
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="currency"
                    label="Currency"
                    name="currency"
                    value={formData.currency}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.currency}
                    helperText={fieldErrors.currency ? fieldErrors.currency : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="exRate"
                    label="ExRates"
                    name="exRate"
                    value={formData.exRate}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.exRate}
                    helperText={fieldErrors.exRate ? fieldErrors.exRate : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="remarks"
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.remarks}
                    helperText={fieldErrors.remarks ? fieldErrors.remarks : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="otherInfo"
                    label="Other Info"
                    name="otherInfo"
                    value={formData.otherInfo}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.otherInfo}
                    helperText={fieldErrors.otherInfo ? fieldErrors.otherInfo : ''}
                  />
                </FormControl>
              </div>

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="shipRefNo"
                    label="Shipper RefNo"
                    name="shipRefNo"
                    value={formData.shipRefNo}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.shipRefNo}
                    helperText={fieldErrors.shipRefNo ? fieldErrors.shipRefNo : ''}
                  />
                </FormControl>
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.status}>
                  <InputLabel id="status">Status</InputLabel>
                  <Select labelId="status" id="status" label="Status" onChange={handleInputChange} name="status" value={formData.status}>
                    <MenuItem value="Edit">Edit</MenuItem>
                    <MenuItem value="Release">Release</MenuItem>
                  </Select>
                  {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="gstType"
                    label="GST Type"
                    name="gstType"
                    value={formData.gstType}
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    onChange={handleInputChange}
                    error={!!fieldErrors.gstType}
                    helperText={fieldErrors.gstType ? fieldErrors.gstType : ''}
                  />
                </FormControl>
              </div>
            </div>
          )}
        </div>

        <br></br>
        {!listView && (
          <div className="card w-full p-6 bg-base-100 shadow-xl mb-3">
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} textColor="secondary" indicatorColor="secondary" aria-label="lab API tabs example">
                    <Tab label="Masters / House Charges" value="1" />
                    <Tab label="Tax Particulars" value="2" />
                    <Tab label="Summary" value="3" />
                    <Tab label="GST" value="4" /> {/* </Tab> */}
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <div className="row d-flex ml">
                    <div className="mb-1">
                      {/* <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} /> */}
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
                                <th className="px-2 py-2 text-white text-center">S.No</th>
                                <th className="px-2 py-2 text-white text-center">Job No</th>
                                <th className="px-2 py-2 text-white text-center">Charge Code</th>
                                <th className="px-2 py-2 text-white text-center">GCharge Code</th>
                                <th className="px-2 py-2 text-white text-center">Charge Name</th>
                                <th className="px-2 py-2 text-white text-center">Taxable</th>
                                <th className="px-2 py-2 text-white text-center">Qty</th>
                                <th className="px-2 py-2 text-white text-center">Rate</th>
                                <th className="px-2 py-2 text-white text-center">Currency</th>
                                <th className="px-2 py-2 text-white text-center">Ex. Rate</th>
                                <th className="px-2 py-2 text-white text-center">FC Amount</th>
                                <th className="px-2 py-2 text-white text-center">LC Amount</th>
                                <th className="px-2 py-2 text-white text-center">Bill Amount</th>
                                <th className="px-2 py-2 text-white text-center">SAC</th>
                                <th className="px-2 py-2 text-white text-center">GST %</th>
                                <th className="px-2 py-2 text-white text-center">GST</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(houseChargeTableData) &&
                                houseChargeTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(
                                            row.id,
                                            houseChargeTableData,
                                            setHouseChargeTableData,
                                            houseChargeTableErrors,
                                            setHouseChargeTableErrors
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
                                        value={row.jobNo}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const validRegex = /^[a-zA-Z0-9\s\-]*$/; // Allows alphabets, numbers, spaces, and hyphens
                                          if (validRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, jobNo: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], jobNo: !value ? 'jobNo is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], jobNo: 'Only numeric characters are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.jobNo ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.jobNo && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].jobNo}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.chargeCode}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.gchargeCode}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.chargeName}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.taxable}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.qty}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const validRegex = /^[a-zA-Z0-9\s\-]*$/; // Allows alphabets, numbers, spaces, and hyphens
                                          if (validRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, qty: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], qty: !value ? 'qty is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], qty: 'Only numeric characters are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.qty ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.qty && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].qty}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.rate}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, rate: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], rate: !value ? 'rate is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], rate: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.rate ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.rate && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].rate}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.currency}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>

                                    {/* <td className="border px-2 py-2">
                                      <select
                                        value={row.currency}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const selectedCurrency = currencies.find((currency) => currency.currency === value);

                                          setHouseChargeTableData((prev) =>
                                            prev.map((r) =>
                                              r.id === row.id ? { ...r, currency: value, exRate: selectedCurrency?.sellingExRate || '' } : r
                                            )
                                          );
                                          setHouseChargeTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              currency: !value ? 'currency is required' : '',
                                              exRate: selectedCurrency ? '' : 'Ex Rate is required'
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={houseChargeTableErrors[index]?.currency ? 'error form-control' : 'form-control'}
                                        style={{ width: '200px' }}
                                      >
                                        <option value="">Select Currency</option>
                                        {currencies.map((currency) => (
                                          <option key={currency.id} value={currency.currency}>
                                            {currency.currency}
                                          </option>
                                        ))}
                                      </select>
                                      {houseChargeTableErrors[index]?.currency && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].currency}
                                        </div>
                                      )}
                                    </td> */}

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.exRate}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, exRate: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], exRate: !value ? 'Ex Rate is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], exRate: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.exRate ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.exRate && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].exRate}
                                        </div>
                                      )}
                                    </td>
                                    
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.fcAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, fcAmt: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], fcAmt: !value ? 'fcAmt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], fcAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.fcAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.fcAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].fcAmt}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.lcAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, lcAmt: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], lcAmt: !value ? 'lcAmt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], lcAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.lcAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.lcAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].lcAmt}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.billAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, billAmt: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], billAmt: !value ? 'billAmt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], billAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.billAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.billAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].billAmt}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.sac}
                                        readOnly // Make it read-only since it's populated by chargeCode selection
                                        className="form-control"
                                        style={{ width: '150px' }}
                                      />
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.gstPercentage}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, gstPercentage: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                gstPercentage: !value ? 'gstPercentage is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                gstPercentage: 'Only numbers are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.gstPercentage ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.gstPercentage && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].gstPercentage}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.gst}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setHouseChargeTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, gst: value } : r))
                                            );
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], gst: !value ? 'gst is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setHouseChargeTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], gst: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={houseChargeTableErrors[index]?.gst ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {houseChargeTableErrors[index]?.gst && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {houseChargeTableErrors[index].gst}
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
                </TabPanel>

                <TabPanel value="2">
                  <div className="row d-flex mt-3">
                    {/* <div className="col-md-3 mb-3">
                      <FormControl size="small" variant="outlined" fullWidth error={!!taxParticularErrors?.tds}>
                        <InputLabel id="tds">TDS</InputLabel>
                        <Select
                          labelId="tds"
                          id="tds"
                          label="TDS"
                          onChange={handleInputChange}
                          name="tds"
                          value={taxParticularData.tds || ''}
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                          <MenuItem value="Normal">Normal</MenuItem>
                          <MenuItem value="Special">Special</MenuItem>
                        </Select>
                        {taxParticularErrors?.tds && <FormHelperText>{taxParticularErrors?.tds}</FormHelperText>}
                      </FormControl>
                    </div> */}
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="tds"
                          label="TDS"
                          name="tds"
                          value={taxParticularData.tds || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!taxParticularErrors?.tds}
                          helperText={taxParticularErrors?.tds || ''}
                          // taxParticularErrors?.tds ?
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="tdsPercentage"
                          label="TDS%"
                          name="tdsPercentage"
                          value={taxParticularData.tdsPercentage || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!taxParticularErrors?.tdsPercentage}
                          helperText={taxParticularErrors?.tdsPercentage || ''}
                          // taxParticularErrors?.tdsPercentage ?
                        />
                      </FormControl>
                    </div>

                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="section"
                          label="Section"
                          name="section"
                          value={taxParticularData.section || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!taxParticularErrors?.section}
                          helperText={taxParticularErrors?.section || ''}
                          // taxParticularErrors?.section ?
                        />
                      </FormControl>
                    </div>

                    {/* <div className="col-md-3 mb-3">
                      <FormControl size="small" variant="outlined" fullWidth error={!!taxParticularErrors?.section}>
                        <InputLabel id="section">Section</InputLabel>
                        <Select
                          labelId="section"
                          id="section"
                          label="Section"
                          onChange={handleInputChange}
                          name="section"
                          value={taxParticularData.section || ''}
                        >
                          <MenuItem value="Intera">Intera</MenuItem>
                          <MenuItem value="Inter">Inter</MenuItem>
                        </Select>
                        {taxParticularErrors?.section && <FormHelperText>{taxParticularErrors?.section}</FormHelperText>}
                      </FormControl>
                    </div> */}

                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="totTDSAmt"
                          label="Tot TDS Amt"
                          name="totTDSAmt"
                          value={taxParticularData.totTDSAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!taxParticularErrors?.totTDSAmt}
                          helperText={taxParticularErrors?.totTDSAmt || ''}
                        />
                      </FormControl>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel value="3">
                  <div className="row d-flex mt-3">
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="roundOff"
                          label="Round Off"
                          name="roundOff"
                          value={summaryData.roundOff || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.roundOff}
                          helperText={summaryErrors?.roundOff || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="totChargesBillCurrAmt"
                          label="Tot. Charge Amt.(Bill Curr)"
                          name="totChargesBillCurrAmt"
                          value={summaryData.totChargesBillCurrAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.totChargesBillCurrAmt}
                          helperText={summaryErrors?.totChargesBillCurrAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="totChargesLCAmt"
                          label="Tot. Charge Amt.(LC)"
                          name="totChargesLCAmt"
                          value={summaryData.totChargesLCAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.totChargesLCAmt}
                          helperText={summaryErrors?.totChargesLCAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        {' '}
                        <TextField
                          id="totGrossBillAmt"
                          label="Tot. Gross Amt.(Bill Curr)"
                          name="totGrossBillAmt"
                          value={summaryData.totGrossBillAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.totGrossBillAmt}
                          helperText={summaryErrors?.totGrossBillAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="totGrossLCAmt"
                          label="Tot. Gross Amt.(LC)"
                          name="totGrossLCAmt"
                          value={summaryData.totGrossLCAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.totGrossLCAmt}
                          helperText={summaryErrors?.totGrossLCAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="netBillCurrAmt"
                          label="Net Amt.(Bill Curr)"
                          name="netBillCurrAmt"
                          value={summaryData.netBillCurrAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.netBillCurrAmt}
                          helperText={summaryErrors?.netBillCurrAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="netLCAmt"
                          label="Net Amt.(LC)"
                          name="netLCAmt"
                          value={summaryData.netLCAmt || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.netLCAmt}
                          helperText={summaryErrors?.netLCAmt || ''}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          id="amtInWords"
                          label="Amount in Words"
                          name="amtInWords"
                          value={summaryData.amtInWords || ''}
                          variant="outlined"
                          size="small"
                          required
                          fullWidth
                          onChange={handleInputChange}
                          error={!!summaryErrors?.amtInWords}
                          helperText={summaryErrors?.amtInWords || ''}
                        />
                      </FormControl>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel value="4">
                  <div className="row d-flex ml">
                    <div className="mb-1">
                      <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow1} />
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
                                <th className="px-2 py-2 text-white text-center">S.No</th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                  Charge Account
                                </th>
                                <th className="px-2 py-2 text-white text-center">Subledger Code</th>
                                <th className="px-2 py-2 text-white text-center">DBbill Amount</th>
                                <th className="px-2 py-2 text-white text-center">CRbill Amount</th>
                                <th className="px-2 py-2 text-white text-center">DRLC amt</th>
                                <th className="px-2 py-2 text-white text-center">CRLC amt</th>
                                <th className="px-2 py-2 text-white text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(gstTableData) &&
                                gstTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow1(row.id, gstTableData, setGstTableData, gstTableErrors, setGstTableErrors)
                                        }
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
                                          const validRegex = /^[a-zA-Z0-9\s\-]*$/; // Allows alphabets, numbers, spaces, and hyphens
                                          if (validRegex.test(value)) {
                                            setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, chargeAcc: value } : r)));
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], chargeAcc: !value ? 'Charge Acc is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                chargeAcc: 'Only alphabets and numbers are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.chargeAcc ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.chargeAcc && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].chargeAcc}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.subLodgerCode}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const validRegex = /^[a-zA-Z0-9\s\-]*$/; // Allows alphabets, numbers, spaces, and hyphens
                                          if (validRegex.test(value)) {
                                            setGstTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, subLodgerCode: value } : r))
                                            );
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                subLodgerCode: !value ? 'SubLodger Code is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                subLodgerCode: 'Only alphabets and numbers are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.subLodgerCode ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.subLodgerCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].subLodgerCode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.dbillAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, dbillAmt: value } : r)));
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], dbillAmt: !value ? 'Dbill Amt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], dbillAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.dbillAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.dbillAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].dbillAmt}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.crBillAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, crBillAmt: value } : r)));
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], crBillAmt: !value ? 'Crbill Amt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], crBillAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.crBillAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.crBillAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].crBillAmt}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.dblcamt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, dblcamt: value } : r)));
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], dblcamt: !value ? 'Dblc Amt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], dblcamt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.dblcamt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.dblcamt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].dblcamt}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.crLCAmt}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, crLCAmt: value } : r)));
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], crLCAmt: !value ? 'Crlc Amt is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setGstTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], crLCAmt: 'Only numbers are allowed' };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={gstTableErrors[index]?.crLCAmt ? 'error form-control' : 'form-control'}
                                        style={{ width: '150px' }}
                                      />
                                      {gstTableErrors[index]?.crLCAmt && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {gstTableErrors[index].crLCAmt}
                                        </div>
                                      )}
                                    </td>
                                    {/* <td className="border px-2 py-2">
                                      <input type="text" value={row.remarks} className="form-control" />
                                    </td> */}
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.remarks}
                                        onChange={(e) => {
                                          const value = e.target.value; // Get the input value
                                          setGstTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, remarks: value } : r)));
                                        }}
                                        className="form-control"
                                        style={{ width: '150px' }}
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
              </TabContext>
            </Box>
          </div>
        )}
      </div>
    </>
  );
};

export default CostDebitNote;

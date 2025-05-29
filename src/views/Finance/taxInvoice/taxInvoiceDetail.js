import AddIcon from '@mui/icons-material/Add';
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
import { Chip, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';

import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import ActionButton from 'utils/ActionButton';
import ConfirmationModal from 'utils/confirmationPopup';
import GeneratePdfTemp from 'utils/PdfTempTaxInvoice';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import GstTable from './GstTable';

const TaxInvoiceDetails = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [listView, setlistView] = useState(false);
  const [editId, setEditId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [approveStatus, setApproveStatus] = useState('');
  const [data, setData] = useState([]);
  const [placeOfSupply, setPlaceOfSupply] = useState([]);
  const [addressType, setAddressType] = useState([]);
  const [chargeType, setChargeType] = useState([]);
  const [chargeCode, setChargeCode] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [gstTableData, setGstTableData] = useState({});
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [formData, setFormData] = useState({
    bizType: 'B2B',
    approveStatus: '',
    approveBy: '',
    approveOn: '',
    bizMode: 'TAX',
    partyCode: '',
    partyName: '',
    partyType: '',
    stateNo: '',
    stateCode: '',
    address: '',
    addressType: '',
    gstType: '',
    pinCode: '',
    placeOfSupply: '',
    recipientGSTIN: '',
    billCurr: 'INR',
    status: '',
    docId: '',
    docDate: dayjs(),
    active: true,
    orgId: orgId,
    salesType: '',
    updatedBy: '',
    supplierBillNo: '',
    supplierBillDate: '',
    billCurrRate: '',
    exAmount: '',
    creditDays: '',
    contactPerson: '',
    shipperInvoiceNo: '',
    billOfEntry: '',
    billMonth: '',
    invoiceNo: '',
    invoiceDate: '',
    taxInvoiceDetailsDTO: []
  });

  const [errors, setErrors] = useState({
    bizType: '',
    bizMode: '',
    partyCode: '',
    partyName: '',
    partyType: '',
    stateNo: '',
    stateCode: '',
    address: '',
    addressType: '',
    gstType: '',
    pinCode: '',
    billCurr: '',
    placeOfSupply: '',
    recipientGSTIN: '',
    status: '',
    docId: '',
    docDate: '',
    active: true,
    orgId: orgId,
    salesType: '',
    updatedBy: '',
    supplierBillNo: '',
    supplierBillDate: '',
    billCurrRate: '',
    exAmount: '',
    creditDays: '',
    contactPerson: '',
    shipperInvoiceNo: '',
    billOfEntry: '',
    billMonth: '',
    invoiceNo: '',
    invoiceDate: ''
  });

  const [value, setValue] = useState('1');
  const [fieldErrors, setFieldErrors] = useState({});
  const [partyName, setPartyName] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [stateName, setStateName] = useState([]);

  const [loginBranchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));

  const [withdrawalsTableData, setWithdrawalsTableData] = useState([
    {
      sno: '',
      chargeCode: '',
      chargeName: '',
      chargeType: '',
      currency: '',
      exRate: '',
      exempted: '',
      govChargeCode: '',
      GSTPercent: '',
      ledger: '',
      qty: '',
      rate: '',
      sac: '',
      taxable: ''
    }
  ]);

  const [withdrawalsTableErrors, setWithdrawalsTableErrors] = useState([
    {
      sno: '',
      chargeCode: '',
      chargeName: '',
      chargeType: '',
      currency: '',
      exRate: '',
      exempted: '',
      govChargeCode: '',
      GSTPercent: '',
      ledger: '',
      qty: '',
      rate: '',
      sac: '',
      taxable: ''
    }
  ]);

  useEffect(() => {
    getAllTaxInvoice();
    getTaxInvoiceDocId();
    getAllType();
    getAllCurrency();
  }, []);

  useEffect(() => {
    if (placeOfSupply && placeOfSupply.length === 1) {
      setFormData((prev) => ({
        ...prev,
        placeOfSupply: placeOfSupply[0].placeOfSupply
      }));
    }
  }, [placeOfSupply]);

  useEffect(() => {
    if (addressType && addressType.length === 1) {
      setFormData((prev) => ({
        ...prev,
        addressType: addressType[0].addressType
      }));
    }
  }, [addressType]);

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

  const getAllTaxInvoice = async () => {
    try {
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transaction/getTaxInvoiceByActive`);
      const result = await apiCalls(
        'get',
        `/taxInvoice/getAllTaxInvoiceByFinYearAndBranchCode?orgId=${orgId}&branchCode=${loginBranchCode}&finYear=${finYear}`
      );
      console.log('API Response:==>', result);

      if (result.status === true) {
        setData(result.paramObjectsMap.taxInvoiceVO);

        console.log('TAX INVOICE:==>', result);
      } else {
        // Handle error
        console.error('API Error:', result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getTaxInvoiceDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/taxInvoice/getTaxInvoiceDocId?branchCode=${loginBranchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.taxInvoiceDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(withdrawalsTableData)) {
      displayRowError(withdrawalsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      sno: '',
      chargeCode: '',
      chargeName: '',
      chargeType: '',
      currency: '',
      exRate: '',
      exempted: '',
      govChargeCode: '',
      GSTPercent: '',
      ledger: '',
      qty: '',
      rate: '',
      sac: '',
      taxable: ''
    };
    setWithdrawalsTableData([...withdrawalsTableData, newRow]);
    setWithdrawalsTableErrors([
      ...withdrawalsTableErrors,
      {
        sno: '',
        chargeCode: '',
        chargeName: '',
        chargeType: '',
        currency: '',
        exRate: '',
        exempted: '',
        govChargeCode: '',
        GSTPercent: '',
        ledger: '',
        qty: '',
        rate: '',
        sac: '',
        taxable: ''
      }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === withdrawalsTableData) {
      return (
        !lastRow.chargeCode ||
        !lastRow.chargeName ||
        !lastRow.chargeType ||
        !lastRow.currency ||
        !lastRow.exRate ||
        !lastRow.exempted ||
        !lastRow.govChargeCode ||
        !lastRow.GSTPercent ||
        !lastRow.ledger ||
        !lastRow.qty ||
        !lastRow.rate ||
        !lastRow.sac ||
        !lastRow.taxable
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === withdrawalsTableErrors) {
      setWithdrawalsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          chargeCode: !table[table.length - 1].chargeCode ? 'chargeCode is required' : '',
          chargeName: !table[table.length - 1].chargeName ? 'chargeName is required' : '',
          chargeType: !table[table.length - 1].chargeType ? 'chargeType is required' : '',
          currency: !table[table.length - 1].currency ? 'currency is required' : '',
          exRate: !table[table.length - 1].exRate ? 'exRate is required' : '',
          exempted: !table[table.length - 1].exempted ? 'exempted is required' : '',
          govChargeCode: !table[table.length - 1].govChargeCode ? 'govChargeCode is required' : '',
          GSTPercent: !table[table.length - 1].GSTPercent ? 'GSTPercent is required' : '',
          ledger: !table[table.length - 1].ledger ? 'ledger is required' : '',
          qty: !table[table.length - 1].qty ? 'qty is required' : '',
          rate: !table[table.length - 1].rate ? 'rate is required' : '',
          sac: !table[table.length - 1].sac ? 'sac is required' : '',
          taxable: !table[table.length - 1].taxable ? 'taxable is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (rowId) => {
    setWithdrawalsTableData((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleCreateNewRow = (values) => {
    // Ensure that relevant fields in gstTaxInvoiceDTO are integers
    const updatedValues = {
      ...values,
      gstBdBillAmount: parseInt(values.gstBdBillAmount, 10),
      gstCrBillAmount: parseInt(values.gstCrBillAmount, 10),
      gstCrLcAmount: parseInt(values.gstCrLcAmount, 10),
      gstDbLcAmount: parseInt(values.gstDbLcAmount, 10)
    };

    setFormData((prevData) => ({
      ...prevData,
      gstTaxInvoiceDTO: [...prevData.gstTaxInvoiceDTO, updatedValues]
    }));
  };

  // const handleCreateNewRow1 = (values) => {
  //   // Ensure that 'qty' is an integer
  //   const updatedValues = {
  //     ...values,
  //     qty: parseInt(values.qty, 10)
  //   };

  //   setTableData1((prevData) => {
  //     const updatedData = [...prevData, updatedValues];

  //     // Update formData with the new tableData1
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       chargerTaxInvoiceDTO: updatedData
  //     }));

  //     console.log('Updated GSTTableData1', updatedData);
  //     return updatedData;
  //   });
  // };
  const columns = [
    { accessorKey: 'docId', header: 'Prof.Inv.No', size: 140 },
    { accessorKey: 'docDate', header: 'Prof.Inv.Date', size: 140 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'partyName', header: 'Party Name', size: 140 },
    { accessorKey: 'partyType', header: 'party Type', size: 140 },
    { accessorKey: 'partyCode', header: 'Party Code', size: 140 }
  ];

  const handleClear = () => {
    setFormData({
      bizType: 'B2B',
      bizMode: 'TAX',
      partyCode: '',
      partyName: '',
      partyType: '',
      stateNo: '',
      stateCode: '',
      address: '',
      addressType: '',
      gstType: '',
      pinCode: '',
      placeOfSupply: '',
      recipientGSTIN: '',
      billCurr: 'INR',
      status: '',
      docId: '',
      docDate: dayjs(),
      active: true,
      orgId: orgId,
      salesType: '',
      updatedBy: '',
      supplierBillNo: '',
      supplierBillDate: '',
      billCurrRate: '',
      exAmount: '',
      creditDays: '',
      contactPerson: '',
      shipperInvoiceNo: '',
      billOfEntry: '',
      billMonth: '',
      invoiceNo: '',
      invoiceDate: ''
    });
    getTaxInvoiceDocId();
    setErrors({
      bizType: '',
      bizMode: '',
      partyCode: '',
      partyName: '',
      partyType: '',
      stateNo: '',
      stateCode: '',
      address: '',
      addressType: '',
      gstType: '',
      pinCode: '',
      placeOfSupply: '',
      recipientGSTIN: '',
      billCurr: '',
      status: '',
      docId: '',
      docDate: dayjs(),
      active: true,
      orgId: orgId,
      salesType: '',
      updatedBy: '',
      supplierBillNo: '',
      supplierBillDate: '',
      billCurrRate: '',
      exAmount: '',
      creditDays: '',
      contactPerson: '',
      shipperInvoiceNo: '',
      billOfEntry: '',
      billMonth: '',
      invoiceNo: '',
      invoiceDate: ''
    });
    setEditId('');

    setWithdrawalsTableErrors({
      sno: '',
      chargeCode: '',
      chargeName: '',
      chargeType: '',
      currency: '',
      exRate: '',
      exempted: '',
      govChargeCode: '',
      GSTPercent: '',
      ledger: '',
      qty: '',
      rate: '',
      sac: '',
      taxable: ''
    });

    setWithdrawalsTableData({
      sno: '',
      chargeCode: '',
      chargeName: '',
      chargeType: '',
      currency: '',
      exRate: '',
      exempted: '',
      govChargeCode: '',
      GSTPercent: '',
      ledger: '',
      qty: '',
      rate: '',
      sac: '',
      taxable: ''
    });
  };

  const handleTabSelect = (index) => {
    setTabIndex(index);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getPartyName(formData.partyType);
  }, [formData.partyType]);

  useEffect(() => {
    getStateName(1000000007);
  }, [formData.id]);

  // useEffect(() => {
  //   getPlaceOfSupply('MH');
  // }, [formData.stateCode]);

  const GeneratePdf = (row) => {
    console.log('PDF-Data =>', row.original);
    setPdfData(row.original);
    setDownloadPdf(true);
  };

  const getPartyName = async (partType) => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getPartyNameByPartyType?orgId=${orgId}&partyType=${partType}`);
      setPartyName(response.paramObjectsMap.partyMasterVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getStateName = async (partId) => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getPartyStateDetails?orgId=${orgId}&id=${partId}`);
      setStateName(response.paramObjectsMap.partyStateVO);

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getPlaceOfSupply = async (stateCode, partyyId) => {
    try {
      const response = await apiCalls(
        'get',
        `/taxInvoice/getPlaceOfSupply?orgId=${orgId}&id=${partyyId ? partyyId : partyId}&stateCode=${stateCode}`
      );
      setPlaceOfSupply(response.paramObjectsMap.placeOfSupplyDetails);

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAddessType = async (place, stateC, partyI) => {
    try {
      const response = await apiCalls(
        'get',
        `/taxInvoice/getPartyAddress?orgId=${orgId}&id=${partyI ? partyI : partyId}&stateCode=${stateC ? stateC : stateCode}&placeOfSupply=${place}`
      );
      setAddressType(response.paramObjectsMap.partyAddress);

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getGSTType = async (state) => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getGstType?orgId=${orgId}&branchCode=${loginBranchCode}&stateCode=${state}`);

      setFormData((prevData) => ({
        ...prevData,
        gstType: response.paramObjectsMap.gstTypeDetails[0].gstType
      }));

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAllType = async () => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getChargeType?orgId=${orgId}`);
      setChargeType(response.paramObjectsMap.chargeTypeVO);

      console.log('Test===>', response.paramObjectsMap.chargeTypeVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getAllCurrency = async () => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getCurrencyAndExrateDetails?orgId=${orgId}`);
      setCurrencyList(response.paramObjectsMap.currencyVO);

      console.log('Test===>', response.paramObjectsMap.currencyVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const getChargeCodeDetail = async (type) => {
    try {
      const response = await apiCalls('get', `/taxInvoice/getChargeCodeDetailsByChargeType?orgId=${orgId}&chargeType=${type}`);
      setChargeCode(response.paramObjectsMap.chargeCodeVO);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const handleSelectPartyChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);

    // Log each item in the empList to confirm the field names
    partyName.forEach((emp, index) => {
      console.log(`Employee ${index}:`, emp);
    });

    // Find the selected employee from empList based on employeeCode
    const selectedEmp = partyName.find((emp) => emp.partyName === value); // Check if 'empCode' is correct

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        partyName: selectedEmp.partyName,
        partyCode: selectedEmp.partyCode
      }));
      getStateName(selectedEmp.id);
      setPartyId(selectedEmp.id);
    } else {
      console.log('No employee found with the given code:', value); // Log if no employee is found
    }
  };

  const handleSelectStateChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);

    // Find the selected employee from empList based on employeeCode
    const selectedEmp = stateName.find((emp) => emp.stateCode === value); // Check if 'empCode' is correct

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        stateCode: selectedEmp.stateCode,
        stateNo: selectedEmp.stateNo,
        recipientGSTIN: selectedEmp.recipientGSTIN
      }));

      getPlaceOfSupply(selectedEmp.stateCode);
      setStateCode(selectedEmp.stateCode);
      getGSTType(selectedEmp.stateCode);
    } else {
      console.log('No employee found with the given code:', value); // Log if no employee is found
    }
  };

  const handleSelectPlaceChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);

    // Find the selected employee from empList based on employeeCode
    const selectedEmp = placeOfSupply.find((emp) => emp.placeOfSupply === value); // Check if 'empCode' is correct

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        placeOfSupply: selectedEmp.placeOfSupply
      }));

      getAddessType(selectedEmp.placeOfSupply);
    } else {
      console.log('No employee found with the given code:', value); // Log if no employee is found
    }
  };

  const handleSelectAddressTypeChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);

    // Find the selected employee from empList based on employeeCode
    const selectedEmp = addressType.find((emp) => emp.addressType === value); // Check if 'empCode' is correct

    if (selectedEmp) {
      console.log('Selected Employee:', selectedEmp);
      setFormData((prevData) => ({
        ...prevData,
        addressType: selectedEmp.addressType,
        address: selectedEmp.address,
        pinCode: selectedEmp.pinCode
      }));
    } else {
      console.log('No employee found with the given code:', value); // Log if no employee is found
    }
  };

  // const handleChangeField = (e) => {
  //   const { name, value } = e.target;
  //   if (name.startsWith('summaryTaxInvoiceDTO.')) {
  //     const summaryField = name.split('.')[1];
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       summaryTaxInvoiceDTO: {
  //         ...prevData.summaryTaxInvoiceDTO,
  //         [summaryField]: summaryField === 'amountInWords' || summaryField === 'billingRemarks' ? value : parseInt(value, 10)
  //       }
  //     }));
  //   } else {
  //     setFormData({
  //       ...formData,
  //       [name]: value
  //     });
  //   }
  // };

  const handleChangeField = (e) => {
    const { name, value } = e.target;
    const gstTaxInvoiceFields = ['gstdbBillAmount', 'gstcrBillAmount', 'gstDbLcAmount', 'gstCrLcAmount'];
    if (name.startsWith('summaryTaxInvoiceDTO.')) {
      const summaryField = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        summaryTaxInvoiceDTO: {
          ...prevData.summaryTaxInvoiceDTO,
          [summaryField]: ['amountInWords', 'billingRemarks'].includes(summaryField) ? value : parseInt(value, 10)
        }
      }));
    } else if (name.startsWith('gstTaxInvoiceDTO.')) {
      const gstField = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        gstTaxInvoiceDTO: {
          ...prevData.gstTaxInvoiceDTO,
          [gstField]: gstTaxInvoiceFields.includes(gstField) ? parseInt(value, 10) : value
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  const validateForm = () => {
    let formValid = true;
    const newErrors = { ...errors };

    // Party Name
    if (!formData.partyName) {
      newErrors.partyName = 'Party Name is required';
      formValid = false;
    } else {
      newErrors.partyName = '';
    }

    // Party Code
    if (!formData.partyCode) {
      newErrors.partyCode = 'Party Code is required';
      formValid = false;
    } else {
      newErrors.partyCode = '';
    }

    // Party Type
    if (!formData.partyType) {
      newErrors.partyType = 'Party Type is required';
      formValid = false;
    } else {
      newErrors.partyType = '';
    }

    // Address Type
    if (!formData.addressType) {
      newErrors.addressType = 'Address Type is required';
      formValid = false;
    } else {
      newErrors.addressType = '';
    }

    // Recipient GSTIN
    if (!formData.recipientGSTIN) {
      newErrors.recipientGSTIN = 'Recipient GSTIN is required';
      formValid = false;
    } else {
      newErrors.recipientGSTIN = '';
    }

    // Place of Supply
    if (!formData.placeOfSupply) {
      newErrors.placeOfSupply = 'Place of Supply is required';
      formValid = false;
    } else {
      newErrors.placeOfSupply = '';
    }

    // Address
    if (!formData.address) {
      newErrors.address = 'Address is required';
      formValid = false;
    } else {
      newErrors.address = '';
    }

    // Pincode
    if (!formData.pinCode) {
      newErrors.pinCode = 'pinCode is required';
      formValid = false;
    } else {
      newErrors.pinCode = '';
    }

    // Status
    if (!formData.status) {
      newErrors.status = 'Status is required';
      formValid = false;
    } else {
      newErrors.status = '';
    }

    // GST Type
    if (!formData.gstType) {
      newErrors.gstType = 'GST Type is required';
      formValid = false;
    } else {
      newErrors.gstType = '';
    }

    // Bill Curr
    if (!formData.billCurr) {
      newErrors.billCurr = 'Bill Curr is required';
      formValid = false;
    } else {
      newErrors.billCurr = '';
    }

    // Sales Type
    if (!formData.salesType) {
      newErrors.salesType = 'Sales Type is required';
      formValid = false;
    } else {
      newErrors.salesType = '';
    }

    setErrors(newErrors);
    return formValid;
  };

  const handleSave = async () => {
    console.log('handleSave', formData);

    const detailsVo = withdrawalsTableData.map((row) => ({
      ...(editId && { id: row.id }),
      chargeCode: row.chargeCode,
      chargeName: row.chargeName,
      chargeType: row.chargeType,
      currency: row.currency,
      exRate: parseFloat(row.exRate),
      exempted: row.exempted,
      govChargeCode: row.govChargeCode,
      gstpercent: parseFloat(row.GSTPercent),
      gst: row.gst,
      ledger: row.ledger,
      qty: parseInt(row.qty),
      rate: parseInt(row.rate),
      sac: row.sac,
      taxable: row.taxable
    }));

    const saveFormData = {
      ...(editId && { id: editId }),
      // active: formData.active,
      bizType: formData.bizType,
      bizMode: formData.bizMode,
      partyCode: formData.partyCode,
      partyName: formData.partyName,
      partyType: formData.partyType,
      stateNo: formData.stateNo,
      stateCode: formData.stateCode,
      address: formData.address,
      addressType: formData.addressType,
      gstType: formData.gstType,
      pinCode: formData.pinCode,
      placeOfSupply: formData.placeOfSupply,
      recipientGSTIN: formData.recipientGSTIN,
      billCurr: formData.billCurr,
      status: formData.status,
      salesType: formData.salesType,
      updatedBy: formData.updatedBy,
      supplierBillNo: formData.supplierBillNo,
      supplierBillDate: dayjs(formData.supplierBillDate).format('YYYY-MM-DD'),
      billCurrRate: parseInt(formData.billCurrRate),
      exAmount: parseInt(formData.exAmount),
      creditDays: parseInt(formData.creditDays),
      contactPerson: formData.contactPerson,
      shipperInvoiceNo: formData.shipperInvoiceNo,
      billOfEntry: formData.billOfEntry,
      billMonth: formData.billMonth,
      invoiceNo: formData.invoiceNo,
      invoiceDate: dayjs(formData.invoiceDate).format('YYYY-MM-DD'),
      taxInvoiceDetailsDTO: detailsVo,
      createdBy: loginUserName,
      orgId: orgId,
      finYear: finYear,
      branch: branch,
      branchCode: loginBranchCode
    };

    if (validateForm()) {
      try {
        const response = await apiCalls('put', '/taxInvoice/updateCreateTaxInvoice', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? ' TaxInvoice updated successfully' : 'TaxInvoice created successfully');
          getAllTaxInvoice();
          handleClear();
          // setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'TaxInvoice creation failed');
          // setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', ' TaxInvoice creation failed');
        // setIsLoading(false);
      }
    }
  };

  const getTaxInvoiceById = async (row) => {
    console.log('first', row);
    setlistView(false);
    try {
      const result = await apiCalls('get', `/taxInvoice/getTaxInvoiceById?id=${row.original.id}`);

      if (result.status === true) {
        const listValueVO = result.paramObjectsMap.taxInvoiceVO;
        setEditId(row.original.id);

        setGstTableData(row.original.taxInvoiceGstVO);

        console.log('DataToEdit ==>', result.paramObjectsMap.taxInvoiceVO);

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
          partyId: listValueVO.partyId,
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

        // getPartyName(listValueVO.partType);

        // const selectedEmp = partyName.find((emp) => emp.partyName === value); // Check if 'empCode' is correct

        setPartyId(listValueVO.partyId);

        getPlaceOfSupply(listValueVO.stateCode, listValueVO.partyId);

        getAddessType(listValueVO.placeOfSupply, listValueVO.stateCode, listValueVO.partyId);

        if (!listValueVO?.taxInvoiceDetailsVO) return;

        const mappedData = listValueVO.taxInvoiceDetailsVO.map((cl) => {
          // Call getChargeCodeDetail for each chargeType
          getChargeCodeDetail(cl.chargeType);

          return {
            id: cl.id,
            chargeCode: cl.chargeCode,
            chargeName: cl.chargeName,
            chargeType: cl.chargeType,
            currency: cl.currency,
            exRate: cl.exRate,
            exempted: cl.exempted,
            govChargeCode: cl.govChargeCode,
            gstpercent: cl.gstpercent,
            ledger: cl.ledger,
            qty: cl.qty,
            rate: cl.rate,
            sac: cl.sac,
            taxable: cl.taxable,
            gst: cl.gstAmount,
            GSTPercent: cl.gstpercent // Consider this: you already mapped gstpercent.
          };
        });

        // Update state with mapped data
        setWithdrawalsTableData(mappedData);
      } else {
        // Handle erro
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setlistView(!listView);
  };

  const handleSelectChange = (e) => {
    const value = e.target.value; // Get the selected value (employeeCode)
    console.log('Selected employeeCode value:', value);

    setFormData((prevData) => ({
      ...prevData,
      partyType: value
    }));
    getPartyName(value);
  };

  return (
    <>
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row">
          <div className="d-flex flex-wrap justify-content-between mb-4" style={{ marginBottom: '20px' }}>
            <div className="d-flex">
              <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
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

          {!listView && (
            <div className="d-flex flex-wrap justify-content-start row">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Biz Type"
                    size="small"
                    required
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.bizType}
                    onChange={(e) => setFormData({ ...formData, bizType: e.target.value })}
                    error={!!errors.bizType}
                    // helperText={errors.partyName}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Biz Mode"
                    size="small"
                    required
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.bizMode}
                    onChange={(e) => setFormData({ ...formData, bizMode: e.target.value })}
                    error={!!errors.bizMode}
                    // helperText={errors.partyName}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Doc Id"
                    size="small"
                    disabled
                    value={formData.docId}
                    onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                    error={!!errors.docId}
                    // helperText={errors.partyName}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Doc Date"
                      format="DD-MM-YYYY"
                      disabled
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.docDate ? dayjs(formData.docDate) : null}
                      onChange={(newValue) => setFormData({ ...formData, docDate: newValue })}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Party Type
                  </InputLabel>
                  <Select
                    labelId="partyTypeLabel"
                    value={formData.partyType}
                    onChange={handleSelectChange}
                    label="Party Type"
                    required
                    error={!!errors.partyType}
                    helperText={errors.partyType}
                  >
                    <MenuItem value="CUSTOMER">Customer</MenuItem>
                    <MenuItem value="VENDOR">Vendor</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label-party">Party Name</InputLabel>
                  <Select
                    labelId="demo-simple-select-label-party"
                    id="demo-simple-select-party"
                    label="Party Name"
                    required
                    value={formData.partyName}
                    onChange={handleSelectPartyChange}
                    // error={!!formDataErrors.partyName}
                  >
                    {partyName &&
                      partyName.map((par, index) => (
                        <MenuItem key={index} value={par.partyName}>
                          {par.partyName} {/* Display employee code */}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Party Code"
                    size="small"
                    required
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.partyCode}
                    onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
                    error={!!errors.partyCode}
                    // helperText={errors.partyCode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    State Code
                  </InputLabel>
                  <Select
                    labelId="addressTypeLabel"
                    value={formData.stateCode}
                    onChange={handleSelectStateChange}
                    label="State Code"
                    required
                    error={!!errors.stateCode}
                    helperText={errors.stateCode}
                  >
                    {stateName?.length > 0 ? (
                      stateName.map((par, index) => (
                        <MenuItem key={index} value={par.stateCode}>
                          {par.stateCode} {/* Display stateCode and stateName */}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No states available</MenuItem> // Fallback option
                    )}
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="State No"
                    size="small"
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.stateNo}
                    onChange={(e) => setFormData({ ...formData, stateNo: e.target.value })}
                    error={!!errors.stateNo}
                    // helperText={errors.partyCode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Recipient GSTIN"
                    size="small"
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.recipientGSTIN}
                    onChange={(e) => setFormData({ ...formData, recipientGSTIN: e.target.value })}
                    error={!!errors.recipientGSTIN}
                    // helperText={errors.partyCode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Place Of Supply
                  </InputLabel>
                  <Select
                    labelId="addressTypeLabel"
                    value={formData.placeOfSupply}
                    onChange={handleSelectPlaceChange}
                    label="Place Of Supply"
                    required
                    error={!!errors.placeOfSupply}
                    helperText={errors.placeOfSupply}
                  >
                    {placeOfSupply &&
                      placeOfSupply.map((par, index) => (
                        <MenuItem key={index} value={par.placeOfSupply}>
                          {par.placeOfSupply} {/* Display employee code */}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Address Type
                  </InputLabel>
                  <Select
                    labelId="addressTypeLabel"
                    value={formData.addressType}
                    onChange={handleSelectAddressTypeChange}
                    label="Address Type"
                    required
                    error={!!errors.addressType}
                    helperText={errors.addressType}
                  >
                    {addressType &&
                      addressType.map((par, index) => (
                        <MenuItem key={index} value={par.addressType}>
                          {par.addressType} {/* Display employee code */}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Place of Supply
                  </InputLabel>
                  <Select
                    labelId="placeOfSupplyLabel"
                    value={formData.placeOfSupply}
                    onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                    label="Place of Supply"
                    required
                    error={!!errors.placeOfSupply}
                    helperText={errors.placeOfSupply}
                  >
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Vendor">Vendor</MenuItem>
                  </Select>
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Address"
                    size="small"
                    required
                    multiline
                    disabled
                    inputProps={{ maxLength: 100 }}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    error={!!errors.address}
                    // helperText={errors.address || `${formData.address.length}/50`}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="pinCode"
                    size="small"
                    required
                    disabled
                    name="pinCode"
                    inputProps={{ maxLength: 30 }}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    error={!!errors.pinCode}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="gstType"
                    size="small"
                    required
                    disabled
                    name="gstType"
                    inputProps={{ maxLength: 30 }}
                    value={formData.gstType}
                    // onChange={(e) => setFormData({ ...formData, gstType: e.target.value })}
                    error={!!errors.gstType}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Supplier BillNo"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.supplierBillNo}
                    onChange={(e) => setFormData({ ...formData, supplierBillNo: e.target.value })}
                    error={!!errors.supplierBillNo}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Supplier BillDate"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.supplierBillDate ? dayjs(formData.supplierBillDate) : null}
                      onChange={(newValue) => setFormData({ ...formData, supplierBillDate: newValue })}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={formData.dueDate}
                      onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div> */}

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Bill Currency"
                    size="small"
                    required
                    disabled
                    inputProps={{ maxLength: 30 }}
                    value={formData.billCurr}
                    onChange={(e) => setFormData({ ...formData, billCurr: e.target.value })}
                    error={!!errors.billCurr}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Bill Curr Rate"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.billCurrRate}
                    onChange={(e) => setFormData({ ...formData, billCurrRate: e.target.value })}
                    error={!!errors.billCurrRate}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Ex Amount"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.exAmount}
                    onChange={(e) => setFormData({ ...formData, exAmount: e.target.value })}
                    error={!!errors.exAmount}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Credit Days"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.creditDays}
                    onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
                    error={!!errors.creditDays}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Contact Person"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    error={!!errors.contactPerson}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Shipper InvoiceNo"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.shipperInvoiceNo}
                    onChange={(e) => setFormData({ ...formData, shipperInvoiceNo: e.target.value })}
                    error={!!errors.shipperInvoiceNo}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Bill Of Entry"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.billOfEntry}
                    onChange={(e) => setFormData({ ...formData, billOfEntry: e.target.value })}
                    error={!!errors.billOfEntry}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Bill Month"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.billMonth}
                    onChange={(e) => setFormData({ ...formData, billMonth: e.target.value })}
                    error={!!errors.billMonth}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <TextField
                    label="Invoice No"
                    size="small"
                    required
                    inputProps={{ maxLength: 30 }}
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    error={!!errors.invoiceNo}
                    // helperText={errors.pincode}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Invoice Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      value={formData.invoiceDate ? dayjs(formData.invoiceDate) : null}
                      onChange={(newValue) => setFormData({ ...formData, invoiceDate: newValue })}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Sales Type
                  </InputLabel>
                  <Select
                    labelId="salesTypeLabel"
                    value={formData.salesType}
                    onChange={(e) => setFormData({ ...formData, salesType: e.target.value })}
                    label="Sales Type"
                    required
                    error={!!errors.salesType}
                    helperText={errors.salesType}
                  >
                    <MenuItem value="CREDIT">Credit</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Status
                  </InputLabel>
                  <Select
                    labelId="statusLabel"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                    required
                    error={!!errors.status}
                    // helperText={errors.status}
                  >
                    <MenuItem value="TAX">Tax</MenuItem>
                    <MenuItem value="PROFORMA">Proforma</MenuItem>
                  </Select>
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
                    <Tab label="Charge Particulars" value="1" />
                    <Tab label="Summary" value="2" />
                    {editId ? (
                      <Tab label="GST" value="3">
                        {' '}
                      </Tab>
                    ) : (
                      ''
                    )}
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <div className="row d-flex ml">
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
                                <th className="px-2 py-2 text-white text-center">Type</th>
                                <th className="px-2 py-2 text-white text-center">Charge Code</th>
                                <th className="px-2 py-2 text-white text-center">GCharge Code</th>
                                <th className="px-2 py-2 text-white text-center">Charge Name</th>
                                <th className="px-2 py-2 text-white text-center">Taxable</th>
                                <th className="px-2 py-2 text-white text-center">Qty</th>
                                <th className="px-2 py-2 text-white text-center">Rate</th>
                                <th className="px-2 py-2 text-white text-center">Currency</th>
                                <th className="px-2 py-2 text-white text-center">Ex Rate</th>
                                <th className="px-2 py-2 text-white text-center">FC Amount</th>
                                <th className="px-2 py-2 text-white text-center">LC Amount</th>
                                <th className="px-2 py-2 text-white text-center">Bill Amount</th>
                                <th className="px-2 py-2 text-white text-center">sac</th>
                                <th className="px-2 py-2 text-white text-center">GST %</th>
                                <th className="px-2 py-2 text-white text-center">GST</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(withdrawalsTableData) &&
                                withdrawalsTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(
                                            row.id,
                                            withdrawalsTableData,
                                            setWithdrawalsTableData,
                                            withdrawalsTableErrors,
                                            setWithdrawalsTableErrors
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>

                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.chargeType}
                                        style={{ width: '150px' }}
                                        onChange={(e) => {
                                          const selectedCurrency = e.target.value;
                                          const selectedCurrencyData = chargeType.find(
                                            (currency) => currency.chargeType === selectedCurrency
                                          );

                                          const updatedCurrencyData = [...withdrawalsTableData];
                                          updatedCurrencyData[index] = {
                                            ...updatedCurrencyData[index],
                                            chargeType: selectedCurrency
                                          };

                                          setWithdrawalsTableData(updatedCurrencyData);
                                          getChargeCodeDetail(e.target.value);
                                        }}
                                        className={withdrawalsTableErrors[index]?.chargeType ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">--Select--</option>
                                        {chargeType &&
                                          chargeType.map((currency) => (
                                            <option key={currency.id} value={currency.chargeType}>
                                              {currency.chargeType}
                                            </option>
                                          ))}
                                      </select>

                                      {withdrawalsTableErrors[index]?.chargeType && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].chargeType}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.chargeCode}
                                        style={{ width: '150px' }}
                                        onChange={(e) => {
                                          const selectedCurrency = e.target.value;
                                          const selectedCurrencyData = chargeCode.find(
                                            (currency) => currency.chargeCode === selectedCurrency
                                          );
                                          const updatedCurrencyData = [...withdrawalsTableData];
                                          updatedCurrencyData[index] = {
                                            ...updatedCurrencyData[index],
                                            chargeCode: selectedCurrency,
                                            GSTPercent: selectedCurrencyData ? selectedCurrencyData.GSTPercent : '',
                                            ccFeeApplicable: selectedCurrencyData ? selectedCurrencyData.ccFeeApplicable : '',
                                            chargeName: selectedCurrencyData ? selectedCurrencyData.chargeName : '',
                                            exempted: selectedCurrencyData ? selectedCurrencyData.exempted : '',
                                            govChargeCode: selectedCurrencyData ? selectedCurrencyData.govChargeCode : '',
                                            ledger: selectedCurrencyData ? selectedCurrencyData.ledger : '',
                                            sac: selectedCurrencyData ? selectedCurrencyData.sac : '',
                                            taxable: selectedCurrencyData ? selectedCurrencyData.taxable : ''
                                          };

                                          setWithdrawalsTableData(updatedCurrencyData);
                                        }}
                                        className={withdrawalsTableErrors[index]?.chargeCode ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">--Select--</option>
                                        {chargeCode?.map((currency, index) => (
                                          <option key={index} value={currency.chargeCode}>
                                            {currency.chargeCode}
                                          </option>
                                        ))}
                                      </select>
                                      {withdrawalsTableErrors[index]?.chargeCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].chargeCode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.govChargeCode}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, govChargeCode: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                govChargeCode: !value ? 'govChargeCode is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                govChargeCode: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.govChargeCode ? 'error form-control' : 'form-control'}
                                      />
                                      {withdrawalsTableErrors[index]?.govChargeCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].govChargeCode}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.chargeName}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, chargeName: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                chargeName: !value ? 'chargeName is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                chargeName: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.chargeName ? 'error form-control' : 'form-control'}
                                      />
                                      {withdrawalsTableErrors[index]?.chargeName && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].chargeName}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.taxable}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, taxable: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                taxable: !value ? 'taxable is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                taxable: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.taxable ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.taxable && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].taxable}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.qty}
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, qty: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                qty: !value ? 'qty is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                qty: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.qty ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.qty && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].qty}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.rate}
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, rate: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                rate: !value ? 'rate is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                rate: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.rate ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.rate && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].rate}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.currency}
                                        style={{ width: '150px' }}
                                        onChange={(e) => {
                                          const selectedCurrency = e.target.value;
                                          const selectedCurrencyData = currencyList.find(
                                            (currency) => currency.currency === selectedCurrency
                                          );

                                          const updatedCurrencyData = [...withdrawalsTableData];
                                          updatedCurrencyData[index] = {
                                            ...updatedCurrencyData[index],
                                            currency: selectedCurrency,
                                            exRate: selectedCurrencyData.sellingExRate,
                                            fcAmount: selectedCurrency === 'INR' ? 0 : row.qty * row.rate,
                                            lcAmount:
                                              (Number(row.qty) || 0) *
                                              (Number(row.rate) || 0) *
                                              (Number(selectedCurrencyData.sellingExRate) || 0),
                                            billAmount:
                                              ((Number(row.qty) || 0) *
                                                (Number(row.rate) || 0) *
                                                (Number(selectedCurrencyData.sellingExRate) || 0)) /
                                              selectedCurrencyData.sellingExRate,
                                            gst:
                                              ((Number(row.qty) || 0) *
                                                (Number(row.rate) || 0) *
                                                (Number(selectedCurrencyData.sellingExRate) || 0) *
                                                row.GSTPercent) /
                                              100
                                          };

                                          setWithdrawalsTableData(updatedCurrencyData);
                                        }}
                                        className={withdrawalsTableErrors[index]?.currency ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">--Select--</option>
                                        {currencyList &&
                                          currencyList.map((currency) => (
                                            <option key={currency.id} value={currency.currency}>
                                              {currency.currency}
                                            </option>
                                          ))}
                                      </select>
                                      {withdrawalsTableErrors[index]?.currency && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].currency}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.exRate}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, exRate: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], exRate: !value ? 'exRate is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                exRate: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.exRate ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.exRate && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].exRate}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.fcAmount ? row.fcAmount.toFixed(2) : '0'}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, fcAmount: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], fcAmount: !value ? 'fcAmount is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                fcAmount: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.fcAmount ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.fcAmount && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].fcAmount}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.lcAmount ? row.lcAmount.toFixed(2) : '0'}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, lcAmount: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                lcAmount: !value ? 'lcAmount is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                lcAmount: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.lcAmount ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.lcAmount && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].lcAmount}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.billAmount ? row.billAmount.toFixed(2) : '0.00'}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, billAmount: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = { ...newErrors[index], billAmount: !value ? 'Settled is required' : '' };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                billAmount: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.billAmount ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.billAmount && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].billAmount}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.sac}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, sac: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                sac: !value ? 'sac is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                sac: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.sac ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.sac && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].sac}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.GSTPercent}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, GSTPercent: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                GSTPercent: !value ? 'GSTPercent is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                GSTPercent: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.GSTPercent ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.GSTPercent && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].GSTPercent}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.gst ? row.gst : '0.00'}
                                        disabled
                                        style={{ width: '100px' }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numericRegex = /^[0-9]*$/;
                                          if (numericRegex.test(value)) {
                                            setWithdrawalsTableData((prev) =>
                                              prev.map((r) => (r.id === row.id ? { ...r, gst: value } : r))
                                            );
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                gst: !value ? 'gst is required' : ''
                                              };
                                              return newErrors;
                                            });
                                          } else {
                                            setWithdrawalsTableErrors((prev) => {
                                              const newErrors = [...prev];
                                              newErrors[index] = {
                                                ...newErrors[index],
                                                gst: 'Only numeric characters are allowed'
                                              };
                                              return newErrors;
                                            });
                                          }
                                        }}
                                        className={withdrawalsTableErrors[index]?.gst ? 'error form-control' : 'form-control'}
                                        // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                      />
                                      {withdrawalsTableErrors[index]?.gst && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {withdrawalsTableErrors[index].gst}
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
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot. Charge Amt.(LC)"
                          name="totalChargeAmountLc"
                          disabled
                          value={formData.totalChargeAmountLc}
                          onChange={(e) => setFormData({ ...formData, totalChargeAmountLc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalChargeAmountLc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot. Tax Amt.(LC)"
                          name="totalTaxAmountLc"
                          value={formData.totalTaxAmountLc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalTaxAmountLc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalTaxAmountLc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot. Inv Amt.(LC)"
                          name="totalInvAmountLc"
                          value={formData.totalInvAmountLc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalInvAmountLc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalInvAmountLc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Round Off Amt.(LC)"
                          name="roundOffAmountLc"
                          value={formData.roundOffAmountLc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, roundOffAmountLc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['roundOffAmountLc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot Charge Amt.(Bill Curr.)"
                          name="totalChargeAmountBc"
                          value={formData.totalChargeAmountBc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalChargeAmountBc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalChargeAmountBc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot Tax Amt.(Bill Curr.)"
                          name="totalTaxAmountBc"
                          value={formData.totalTaxAmountBc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalTaxAmountBc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalTaxAmountBc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot Inv Amt.(Bill Curr.)"
                          name="totalInvAmountBc"
                          value={formData.totalInvAmountBc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalInvAmountBc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalInvAmountBc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-3 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Tot Taxable Amt.(LC)"
                          name="totalTaxableAmountLc"
                          value={formData.totalTaxableAmountLc}
                          disabled
                          onChange={(e) => setFormData({ ...formData, totalTaxableAmountLc: e.target.value })}
                          size="small"
                          placeholder="0.00"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['totalTaxableAmountLc']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-6 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Amount In Words"
                          name="amountInWords"
                          value={formData.amountInWords}
                          disabled
                          onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                          size="small"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['amountInWords']}
                        />
                      </FormControl>
                    </div>
                    <div className="col-md-6 mb-3">
                      <FormControl fullWidth variant="filled">
                        <TextField
                          label="Billing Remarks"
                          name="billingRemarks"
                          value={formData.billingRemarks}
                          disabled
                          onChange={(e) => setFormData({ ...formData, billingRemarks: e.target.value })}
                          size="small"
                          inputProps={{ maxLength: 30 }}
                          error={fieldErrors['billingRemarks']}
                        />
                      </FormControl>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="3">
                  {' '}
                  <GstTable tableData={gstTableData} onCreateNewRow={handleCreateNewRow} />
                </TabPanel>
              </TabContext>
            </Box>
          </div>
        )}
        {listView && (
          <div>
            {/* <CommonTable data={data} columns={columns} editCallback={editCity} countryVO={countryVO} stateVO={stateVO} /> */}

            <CommonListViewTable
              data={data && data}
              columns={columns}
              blockEdit={true}
              toEdit={getTaxInvoiceById}
              isPdf={true}
              GeneratePdf={GeneratePdf}
            />
            {downloadPdf && <GeneratePdfTemp row={pdfData} />}
          </div>
        )}
      </div>
      <ConfirmationModal
        open={modalOpen}
        title="Tax Invoice Approval"
        message={`Are you sure you want to ${approveStatus === 'Approved' ? 'approve' : 'reject'} this invoice?`}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseModal}
      />
    </>
  );
};

export default TaxInvoiceDetails;

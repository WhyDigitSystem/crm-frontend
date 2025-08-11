import React, { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { toWords } from 'number-to-words';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Tabs,
    Tab,
    Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import CommonTableWithStatus from 'views/basicMaster/CommonTableWithStatus';
import FullScreenLoader from 'utils/FullScreenLoader';
import { tr } from 'date-fns/locale';
// import FullScreenLoader from 'utils/FullScreenLoader';

export const Quotation = ({ selectedRow }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [editId, setEditId] = useState('');
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [listView, setListView] = useState(true);
    const [listViewData, setListViewData] = useState([]);
    const [finYear] = useState(new Date().getFullYear().toString());
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    // const [sellingPrice, setSellingPrice] = useState([]);
    const [loading, setLoading] = useState(false);

    const [clientNameList, setClientNameList] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [opportunityList, setOpportunityList] = useState([]);
    const [productList, setProductList] = useState([]);
    useEffect(() => {
        if (selectedRow) {
            setLoading(true);
            getQuotationById({ original: selectedRow });
        }
    }, [selectedRow]);
    const [summaryCounts, setSummaryCounts] = useState({
        New: 0,
        Qualified: 0,
        Unqualified: 0,
        InProgress: 0,
    });
    const [formData, setFormData] = useState({
        quoteId: '',
        quoteDate: dayjs(),
        clientName: '',
        branchName: '',
        oppurtunityName: '',
        oppurtunityId: '',
        contactName: '',
        mobileNumber: '',
        emailId: '',
        gstNo: '',
        status: '',
        address: '',
        iterations: '',
        grossAmt: '',
        discount: '',
        netAmt: '',
        amtInWords: '',
        narration: '',
    });

    const [quotationPrice, setQuotationPrice] = useState([{
        productName: '',
        category: '',
        subCategory: '',
        sellingPrice: '',
        qty: '',
        price: '',
        discountPer: '',
        amount: ''
    }]);
    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        branchName: '',
        contactName: '',
        mobileNumber: '',
        status: '',
        address: '',
        iterations: '',
        oppurtunityName: ''
    });
    const [quotationPriceErrors, setQuotationPriceErrors] = useState([{
        productName: '',
        category: '',
        sellingPrice: '',
        qty: '',
        amount: ''
    }]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberToWordsIndian = (num) => {
        const ones = [
            '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
            'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN',
            'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
        ];
        const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

        const convertToWords = (n) => {
            if (n < 20) return ones[n];
            if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
            if (n < 1000) return `${ones[Math.floor(n / 100)]} HUNDRED ${n % 100 !== 0 ? 'AND ' + convertToWords(n % 100) : ''}`.trim();
            if (n < 100000) return `${convertToWords(Math.floor(n / 1000))} THOUSAND ${convertToWords(n % 1000)}`.trim();
            if (n < 10000000) return `${convertToWords(Math.floor(n / 100000))} LAKH ${convertToWords(n % 100000)}`.trim();
            return `${convertToWords(Math.floor(n / 10000000))} CRORE ${convertToWords(n % 10000000)}`.trim();
        };

        if (isNaN(num)) return '';
        if (num === 0) return 'ZERO';
        return convertToWords(Math.floor(num));
    };
    useEffect(() => {
        getQuotationDocId()
        getAllQuotation();
        getClientName();
    }, []);
    useEffect(() => {
        calculateTotals();
    }, [quotationPrice]);

    const getAllQuotation = async () => {
        setIsLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getAllQuotationByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            // if (response.status === true) {
            //     setListViewData(response.paramObjectsMap.quotationVO.reverse());
            // }
            if (response.status === true && response.paramObjectsMap?.quotationVO?.length > 0) {
                setListViewData([...response.paramObjectsMap.quotationVO].reverse());
                setIsLoading(false);
                const counts = {
                    New: 0,
                    Qualified: 0,
                    Unqualified: 0,
                    InProgress: 0,
                };
                response.paramObjectsMap.quotationVO.forEach((lead) => {
                    switch (lead.status) {
                        case 'NEW':
                        case 'REVICE':
                            counts.InProgress += 1;
                            break;
                        case 'APPROVED':
                            counts.Qualified += 1;
                            break;
                        case 'REJECTED':
                            counts.Unqualified += 1;
                            break;
                        default:
                            break;
                    }
                });
                setSummaryCounts(counts);
                setSummaryCounts(prev => ({
                    ...prev,
                    New: response.paramObjectsMap.quotationVO.length
                }));
            }
            else {
                setIsLoading(false);
                showToast('error', response.message);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching leads:', error);
            showToast('error', 'Failed to fetch leads');
        }
    };
    const getQuotationDocId = async () => {
        setIsDocIdLoading(true);
        setIsLoading(false);
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getQuotationDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true) {
                setFormData(prev => ({
                    ...prev,
                    quoteId: response.paramObjectsMap.quotationDocid
                }));
            }
        } catch (error) {
            // setLoading(false);
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            // setLoading(false);
            setIsDocIdLoading(false);
        }
    };
    const getIterationId = async (branchName, clientName) => {
        setIsDocIdLoading(true);
        setIsLoading(false);
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getOpportunityIdIteration?branchName=${branchName}&clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
            );

            if (response.status === true) {
                setFormData(prev => ({
                    ...prev,
                    iterations: response.paramObjectsMap.iterationId
                }));
            }
        } catch (error) {
            // setLoading(false);
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            // setLoading(false);
            setIsDocIdLoading(false);
        }
    };
    const getQuotationById = async (row) => {
        setIsLoading(true);
        try {
            const response = await apiCalls('get', `/transaction/getAllQuotationById?id=${row.original.id}`);
            setEditId(row.original.id);
            if (response.status === true) {
                const lead = response.paramObjectsMap.quotationVO;
                setListView(false);
                getBranch(lead.clientName);
                getOpportunityName(lead.branchName, lead.clientName);
                setFormData({
                    quoteId: lead.docId,
                    quoteDate: lead.docDate,
                    clientName: lead.clientName,
                    branchName: lead.branchName,
                    contactName: lead.contactName,
                    oppurtunityName: lead.oppurtunityName,
                    oppurtunityId: lead.oppurtunityId,
                    emailId: lead.email,
                    mobileNumber: lead.mobileNumber,
                    gstNo: lead.gstNo,
                    status: lead.status,
                    address: lead.address,
                    iterations: lead.iterations,
                    grossAmount: lead.grossAmount,
                    discount: lead.discount,
                    netAmount: lead.netAmount,
                    narration: lead.narration,
                    amtInWords: lead.amountInWords,
                    finYear: finYear,
                    branch: branch,
                    branchCode: branchCode,
                    orgId: orgId,
                });
                getProductName(lead.oppurtunityId, lead.clientName);
                setQuotationPrice(
                    lead.quotationDetailsVO.map((row) => ({
                        id: row.id,
                        productName: row.produtName,
                        category: row.category,
                        subCategory: row.subCategory,
                        sellingPrice: row.sellingPrice,
                        qty: row.qty,
                        discountPer: row.discount,
                        price: row.price,
                        amount: row.amount
                    }))
                );
                setIsLoading(false);
            } else {
                setIsLoading(false);
                showToast('error', response.paramObjectsMap.message);
            }
        } catch (error) {
            console.error('Error fetching lead details:', error);
            showToast('error', 'Failed to fetch lead details');
            setIsLoading(false);
        }
    };
    const handleSave = async () => {
        setIsLoading(true);

        // Main form validation
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client Name is required';
        if (!formData.branchName) errors.branchName = 'Branch is required';
        if (!formData.iterations) errors.iterations = 'Iterations is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.oppurtunityName) errors.oppurtunityName = 'Opportunity Name is required';

        // Sub-table validation
        let detailTableDataValid = true;
        const newTableErrors = quotationPrice.map((row) => {
            const rowErrors = {};

            if (!row.productName) {
                rowErrors.productName = 'Prod Name is required';
                detailTableDataValid = false;
            }
            if (!row.category) {
                rowErrors.category = 'Category is required';
                detailTableDataValid = false;
            }
            if (!row.qty || parseFloat(row.qty) <= 0) {
                rowErrors.qty = 'Qty is required';
                detailTableDataValid = false;
            }
            if (!row.sellingPrice || parseFloat(row.sellingPrice) <= 0) {
                rowErrors.sellingPrice = 'SP is required';
                detailTableDataValid = false;
            }
            if (!row.amount || parseFloat(row.amount) <= 0) {
                rowErrors.amount = 'Amt is required';
                detailTableDataValid = false;
            }

            return rowErrors;
        });

        // If there are any validation issues
        if (Object.keys(errors).length > 0 || !detailTableDataValid) {
            setFieldErrors(errors);
            setQuotationPriceErrors(newTableErrors);
            setIsLoading(false);
            return;
        }
        const subTableData = quotationPrice.map((row) => ({
            ...(editId && { id: row.id }),
            category: row.category,
            discount: parseFloat(row.discountPer) || 0,
            produtName: row.productName,
            qty: parseFloat(row.qty) || 0,
            sellingPrice: parseFloat(row.sellingPrice) || 0,
            subCategory: row.subCategory,
        }));
        const saveFormData = {
            ...(editId && { id: editId }),
            active: true,
            address: formData.address,
            amountInWords: formData.amtInWords,
            branch: branch,
            branchCode: branchCode,
            branchName: formData.branchName,
            clientName: formData.clientName,
            contactName: formData.contactName,
            createdBy: loginUserName,
            email: formData.emailId,
            finYear: finYear,
            gstNo: formData.gstNo,
            iterations: formData.iterations,
            mobileNumber: parseInt(formData.mobileNumber),
            narration: formData.narration,
            oppurtunityId: formData.oppurtunityId,
            oppurtunityName: formData.oppurtunityName,
            orgId: orgId,
            status: formData.status,
            quotationDetailsDTO: subTableData,
        };

        try {
            const response = await apiCalls('put', '/transaction/updateCreateQuotation', saveFormData);
            if (response.status === true) {
                showToast('success', editId ? 'Quotation updated successfully' : 'Quotation created successfully');
                getAllQuotation();
                handleClear();
            } else {
                showToast('error', response.paramObjectsMap.errorMessage || 'Quotation creation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('error', 'Quotation creation failed');
        } finally {
            setIsLoading(false);
        }
    };
    const getClientName = async () => {
        try {
            const response = await apiCalls('get', `/transaction/getClientNameFromOpportunity?orgId=${orgId}`);
            if (response.status === true) {
                setClientNameList(response.paramObjectsMap.clientNameDetails || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getBranch = async (clientName) => {
        try {
            const response = await apiCalls('get', `/transaction/getBranchNameFromOpportunity?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`);
            if (response.status === true) {
                setBranchList(response.paramObjectsMap.branchName || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getOpportunityName = async (clientBranch, clientName) => {
        try {
            const response = await apiCalls('get', `/transaction/getOpportunityNameIdAndDetails?branchName=${clientBranch}&clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`);
            if (response.status === true) {
                setOpportunityList(response.paramObjectsMap.opportunityDetails || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getProductName = async (oppurtunityId, clientName) => {
        try {
            const response = await apiCalls('get', `/transaction/getProductNameFromOpportunity?clientName=${encodeURIComponent(clientName)}&oppurtunityId=${oppurtunityId}&orgId=${orgId}`);
            if (response.status === true) {
                setProductList(response.paramObjectsMap.productNameDetails || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getSellingPrice = async (productName, index) => {
        if (!productName || index === undefined) return;
        try {
            const response = await apiCalls('get', `/transaction/getSellingPriceFromPriceMaster?orgId=${orgId}&productName=${productName}`);
            const priceArray = response?.paramObjectsMap?.priceDetails;

            if (response.status === true && Array.isArray(priceArray) && priceArray.length > 0) {
                const sellingPrice = priceArray[0]?.sellingPrice;

                // 🔥 FIX: update only `sellingPrice`, keep rest of the row intact
                setQuotationPrice((prevRows) => {
                    const updatedRows = [...prevRows];
                    updatedRows[index] = {
                        ...updatedRows[index],
                        sellingPrice: sellingPrice
                    };
                    return updatedRows;
                });
            } else {
                console.error('API Error: No valid price data found');
            }
        } catch (error) {
            console.error('Error fetching price:', error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        // Validation
        let errorMessage = '';
        if (name === 'mobile' && value && !/^\d{10}$/.test(value)) {
            errorMessage = 'Invalid mobile number (10 digits required)';
        } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errorMessage = 'Invalid email format';
        }

        if (errorMessage) {
            setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
        } else {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleClear = () => {
        getQuotationDocId()
        setOpportunityList([]);
        setBranchList([]);
        setProductList([]);
        setFormData({
            quoteDate: dayjs(),
            clientName: '',
            branchName: '',
            oppurtunityName: '',
            oppurtunityId: '',
            contactName: '',
            mobileNumber: '',
            emailId: '',
            gstNo: '',
            status: '',
            address: '',
            iterations: '',
            grossAmt: '',
            discount: '',
            netAmt: '',
            amtInWords: '',
            narration: '',
        });
        setQuotationPrice([{
            productName: '',
            category: '',
            subCategory: '',
            sellingPrice: '',
            qty: '',
            price: '',
            discountPer: '',
            amount: ''
        }]);
        setEditId('');
        setFieldErrors({});
        setQuotationPriceErrors([{
            productName: '',
            category: '',
            sellingPrice: '',
            qty: '',
            amount: ''
        }]);
    };
    const handleView = () => {
        setListView(!listView);
    };
    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleAddRowQuotation = () => {
        const newRow = {
            id: Date.now(),
            sno: '',
            productName: '',
            category: '',
            subCategory: '',
            sellingPrice: '',
            qty: '',
            price: '',
            discountPer: '',
            amount: ''
        };
        setQuotationPrice([...quotationPrice, newRow]);
        setQuotationPriceErrors([
            ...quotationPriceErrors,
            {
                sno: '',
                productName: '',
                category: '',
                sellingPrice: '',
                qty: '',
                amount: ''
            }
        ]);
    };
    const handleDetailChange = (index, field, value) => {
        const updatedData = [...quotationPrice];
        updatedData[index][field] = value;

        // Calculate price, discount, and amount
        const numericSellingPrice = parseFloat(updatedData[index].sellingPrice || 0);
        const numericQty = parseFloat(updatedData[index].qty || 0);
        const numericDiscountPer = parseFloat(updatedData[index].discountPer || 0);

        const price = numericSellingPrice * numericQty;
        updatedData[index].price = price.toFixed(2);

        const discountAmt = (price * numericDiscountPer) / 100;
        const amount = price - discountAmt;
        updatedData[index].amount = amount.toFixed(2);

        setQuotationPrice(updatedData);
        setQuotationPriceErrors(prevErrors => {
            const newErrors = [...prevErrors];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index] = {
                ...newErrors[index],
                [field]: ''  // Clear this field's error
            };
            return newErrors;
        });
    };
    const handleDeleteRow = (id, data, setData, errors, setErrors) => {
        if (data.length <= 1) return;
        const index = data.findIndex(item => item.id === id);
        const newData = [...data];
        newData.splice(index, 1);
        setData(newData);
        const newErrors = [...errors];
        newErrors.splice(index, 1);
        setErrors(newErrors);
    };
    const handleDateChange = (field, date) => {
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
        setFormData(prev => ({ ...prev, [field]: formattedDate }));
    };
    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc ID', size: 120 },
        { accessorKey: 'docDate', header: 'Doc Date', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'mobileNumber', header: 'Contact', size: 150 },
        { accessorKey: 'email', header: 'Email', size: 200 },
    ];
    const calculateTotals = () => {
        let gross = 0;
        let discountAmt = 0;

        quotationPrice.forEach((item) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.sellingPrice) || 0;
            const discountPer = parseFloat(item.discountPer) || 0;

            const lineTotal = qty * price;
            const lineDiscount = (lineTotal * discountPer) / 100;

            gross += lineTotal;
            discountAmt += lineDiscount;
        });

        const net = gross - discountAmt;

        setFormData((prev) => ({
            ...prev,
            grossAmt: gross.toFixed(2),
            discount: discountAmt.toFixed(2),
            netAmt: net.toFixed(2),
            // amtInWords: toWords(Math.floor(net)).toUpperCase() + " ONLY"
            amtInWords: numberToWordsIndian(net) + ' ONLY'
        }));
    };
    return (
        <>
            {isLoading && (
                <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
                    <FullScreenLoader />
                </div>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                    {/* <div className="row d-flex ml"> */}
                    {!selectedRow &&
                        <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                            {!listView &&
                                <>
                                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                                </>
                            }
                        </div>
                    }
                    {/* </div> */}

                    {listView && !isLoading ? (
                        <div>
                            <CommonTableWithStatus
                                data={listViewData}
                                columns={listViewColumns}
                                blockEdit={true}
                                toEdit={(row) => getQuotationById(row.original.id)}
                                summaryCounts={summaryCounts}
                            />
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Quote ID"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    disabled
                                    name="docId"
                                    value={isDocIdLoading ? "Generating..." : formData.quoteId || ''}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth variant="filled" size="small">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Quote Date"
                                            value={formData.quoteDate ? dayjs(formData.quoteDate, 'YYYY-MM-DD') : null}
                                            onChange={(date) => handleDateChange('quoteDate', date)}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                }
                                            }}
                                            format="DD-MM-YYYY"
                                            disabled
                                        />
                                    </LocalizationProvider>
                                </FormControl>
                            </div>
                            <div className="col-md-3 mb-3">
                                <Autocomplete
                                    options={clientNameList}
                                    getOptionLabel={(option) =>
                                        option?.clientName
                                            ? `${option.clientName}`
                                            : ''
                                    }
                                    value={
                                        clientNameList.find((item) => item.clientName === formData.clientName) || null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                clientName: newValue.clientName,
                                            }));
                                            setFieldErrors((prev) => ({ ...prev, clientName: '' }));
                                            getBranch(newValue.clientName);
                                        } else {
                                            setFormData((prev) => ({ ...prev, clientName: '' }));
                                            setFieldErrors((prev) => ({ ...prev, clientName: 'Client Name is required' }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    Client Name <span className="asterisk">*</span>
                                                </span>
                                            }
                                            size="small"
                                            error={!!fieldErrors.clientName}
                                            helperText={fieldErrors.clientName}
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <Autocomplete
                                    options={branchList}
                                    getOptionLabel={(option) =>
                                        option?.branchName
                                            ? `${option.branchName}`
                                            : ''
                                    }
                                    value={
                                        branchList.find((item) => item.branchName === formData.branchName) || null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                branchName: newValue.branchName,
                                                gstNo: newValue.gstNo,
                                                address: newValue.address,
                                            }));
                                            getOpportunityName(newValue.branchName, formData.clientName);
                                            getIterationId(newValue.branchName, formData.clientName);
                                            setFieldErrors((prev) => ({ ...prev, branchName: '', address: '' }));
                                        } else {
                                            setFormData((prev) => ({ ...prev, branchName: '' }));
                                            setFieldErrors((prev) => ({ ...prev, branchName: 'Branch is required' }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    Branch <span className="asterisk">*</span>
                                                </span>
                                            }
                                            size="small"
                                            error={!!fieldErrors.branchName}
                                            helperText={fieldErrors.branchName}
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="GST No"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    disabled
                                    name="gstNo"
                                    value={formData.gstNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label={
                                        <span>
                                            Address <span className="asterisk">*</span>
                                        </span>
                                    }
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="address"
                                    disabled
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.address}
                                    helperText={fieldErrors.address}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <Autocomplete
                                    options={opportunityList}
                                    getOptionLabel={(option) =>
                                        option?.productName ? `${option.productName}` : ''
                                    }
                                    value={
                                        opportunityList.find((item) => item.productName === formData.oppurtunityName) || null
                                    }
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                oppurtunityName: newValue.productName || '',
                                                oppurtunityId: newValue.docId || '',
                                                contactName: newValue.contactName || '',
                                                mobileNumber: newValue.mobileNo || '',
                                                emailId: newValue.email || '',
                                            }));
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                oppurtunityName: '',
                                                oppurtunityId: '',
                                                contactName: '',
                                                mobileNumber: '',
                                                emailId: '',
                                            }));
                                            getProductName(newValue.docId, formData.clientName);
                                        } else {
                                            setFormData((prev) => ({
                                                ...prev,
                                                oppurtunityName: '',
                                                oppurtunityId: '',
                                                contactName: '',
                                                mobileNumber: '',
                                                emailId: ''
                                            }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    Opportunity Name <span className="asterisk">*</span>
                                                </span>
                                            }
                                            size="small"
                                            fullWidth
                                            error={!!fieldErrors.oppurtunityName}
                                            helperText={fieldErrors.oppurtunityName}
                                        />
                                    )}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label={
                                        <span>
                                            Oppurtunity Id <span className="asterisk">*</span>
                                        </span>
                                    }
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    disabled
                                    name="oppurtunityId"
                                    value={formData.oppurtunityId}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Contact Name"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    disabled
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleInputChange}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label={
                                        <span>
                                            Mobile Number <span className="asterisk">*</span>
                                        </span>
                                    }
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="mobileNo"
                                    disabled
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.mobileNumber}
                                    helperText={fieldErrors.mobileNumber}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    size="small"
                                    disabled
                                    fullWidth
                                    name="email"
                                    value={formData.emailId}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.email}
                                    helperText={fieldErrors.email}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                                    <InputLabel id="demo-simple-select-label">
                                        Status <span style={{ color: 'red', fontSize: '20px' }}>*</span>
                                    </InputLabel>
                                    <Select
                                        labelId="statusLabel"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        label="Status"
                                        error={!!fieldErrors.status}
                                    >
                                        <MenuItem value="NEW">NEW</MenuItem>
                                        <MenuItem value="REVICE">REVICE</MenuItem>
                                        <MenuItem value="APPROVED">APPROVED</MenuItem>
                                        <MenuItem value="REJECTED">REJECTED</MenuItem>
                                    </Select>
                                    {fieldErrors.status && <FormHelperText style={{ color: 'red' }}>{fieldErrors.status}</FormHelperText>}
                                </FormControl>
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label={
                                        <span>
                                            Iterations <span className="asterisk">*</span>
                                        </span>
                                    }
                                    variant="outlined"
                                    size="small"
                                    disabled
                                    fullWidth
                                    name="iterations"
                                    value={formData.iterations}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.iterations}
                                    helperText={fieldErrors.iterations}
                                />
                            </div>
                            {/* Tabs for Party State and Address */}
                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={tabValue} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
                                        <Tab label="Quotation Price" />
                                        <Tab label="Summary" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ padding: 2 }}>
                                    {tabValue === 0 && (
                                        <div className="row d-flex ml">
                                            <div className="">
                                                <ActionButton title="Add" icon={AddCircleOutlineIcon} onClick={handleAddRowQuotation} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <Box
                                                            sx={{
                                                                '&::-webkit-scrollbar': {
                                                                    height: '8px',
                                                                },
                                                                '&::-webkit-scrollbar-track': {
                                                                    backgroundColor: 'transparent',
                                                                },
                                                                '&::-webkit-scrollbar-thumb': {
                                                                    backgroundColor: '#555',
                                                                    borderRadius: '10px',
                                                                },
                                                                '&::-webkit-scrollbar-thumb:hover': {
                                                                    backgroundColor: '#888',
                                                                },
                                                                borderRadius: '8px',
                                                                backgroundColor: '#1c1f3a',
                                                                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.4)',
                                                                overflowX: 'auto',
                                                            }}
                                                        >
                                                            <table className="table table-bordered">
                                                                <thead>
                                                                    <tr style={{ backgroundColor: '#12162e', color: '#ffff' }}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
                                                                        <th className="table-header">Product Name</th>
                                                                        <th className="table-header">Category</th>
                                                                        <th className="table-header">Sub Category</th>
                                                                        <th className="table-header">Selling Price</th>
                                                                        <th className="table-header">Qty</th>
                                                                        <th className="table-header">Price</th>
                                                                        <th className="table-header">Discount %</th>
                                                                        <th className="table-header">Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {quotationPrice.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteOutlineIcon}
                                                                                    onClick={() => handleDeleteRow(
                                                                                        row.id,
                                                                                        quotationPrice,
                                                                                        setQuotationPrice,
                                                                                        quotationPriceErrors,
                                                                                        setQuotationPriceErrors
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <div className="pt-2" style={{ color: 'white' }}>{index + 1}</div>
                                                                            </td>
                                                                            <td>
                                                                                <Box sx={{ minWidth: 150, flexGrow: 1 }}>
                                                                                    <Autocomplete
                                                                                        options={productList}
                                                                                        getOptionLabel={(option) => option?.productName || ''}
                                                                                        value={productList.find(item => item.productName === row.productName) || null}
                                                                                        isOptionEqualToValue={(option, value) =>
                                                                                            option.productName === value.productName
                                                                                        }
                                                                                        onChange={(event, newValue) => {
                                                                                            const updatedRows = [...quotationPrice];
                                                                                            const updatedRowsError = [...quotationPriceErrors];
                                                                                            if (newValue) {
                                                                                                updatedRows[index] = {
                                                                                                    ...updatedRows[index],
                                                                                                    productName: newValue.productName || '',
                                                                                                    category: newValue.category || '',
                                                                                                    subCategory: newValue.subCategory || '',
                                                                                                };
                                                                                                updatedRowsError[index] = {
                                                                                                    ...updatedRowsError[index],
                                                                                                    productName: '',
                                                                                                    category: '',
                                                                                                    subCategory: '',
                                                                                                };
                                                                                                setQuotationPrice(updatedRows);
                                                                                                setQuotationPriceErrors(updatedRowsError);
                                                                                                getSellingPrice(newValue.productName, index);
                                                                                            } else {
                                                                                                updatedRows[index] = {
                                                                                                    ...updatedRows[index],
                                                                                                    productName: '',
                                                                                                    category: '',
                                                                                                    subCategory: '',
                                                                                                };
                                                                                                setQuotationPrice(updatedRows);
                                                                                            }
                                                                                        }}
                                                                                        renderInput={(params) => (
                                                                                            <TextField
                                                                                                {...params}
                                                                                                size="small"
                                                                                                fullWidth
                                                                                            />
                                                                                        )}
                                                                                    />
                                                                                </Box>
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    value={row.category}
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    disabled
                                                                                    onChange={(e) => handleDetailChange(index, 'category', e.target.value)}
                                                                                    // onBlur={(e) => validateDetailField(index, 'productName', e.target.value)}
                                                                                    error={!!quotationPriceErrors[index]?.category}
                                                                                    helperText={quotationPriceErrors[index]?.category}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    disabled
                                                                                    value={row.subCategory}
                                                                                    onChange={(e) => handleDetailChange(index, 'subCategory', e.target.value)}
                                                                                // onBlur={(e) => validateDetailField(index, 'productName', e.target.value)}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type="number"
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    value={row.sellingPrice}
                                                                                    disabled
                                                                                    onChange={(e) => handleDetailChange(index, 'sellingPrice', e.target.value)}
                                                                                    error={!!quotationPriceErrors[index]?.sellingPrice}
                                                                                    helperText={quotationPriceErrors[index]?.sellingPrice}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type='number'
                                                                                    value={row.qty}
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    onChange={(e) => handleDetailChange(index, 'qty', e.target.value)}
                                                                                    // onBlur={(e) => validateDetailField(index, 'qty', e.target.value)}
                                                                                    error={!!quotationPriceErrors[index]?.qty}
                                                                                    helperText={quotationPriceErrors[index]?.qty}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type='number'
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    value={row.price}
                                                                                    onChange={(e) => handleDetailChange(index, 'price', e.target.value)}
                                                                                // onBlur={(e) => validateDetailField(index, 'productName', e.target.value)}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type='number'
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    value={row.discountPer}
                                                                                    onChange={(e) => handleDetailChange(index, 'discountPer', e.target.value)}
                                                                                // onBlur={(e) => validateDetailField(index, 'productName', e.target.value)}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type='number'
                                                                                    value={row.amount}
                                                                                    sx={{ minWidth: '100px' }}
                                                                                    onChange={(e) => handleDetailChange(index, 'amount', e.target.value)}
                                                                                    // onBlur={(e) => validateDetailField(index, 'amount', e.target.value)}
                                                                                    error={!!quotationPriceErrors[index]?.amount}
                                                                                    helperText={quotationPriceErrors[index]?.amount}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </Box>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {tabValue === 1 && (
                                        <div className="row d-flex ml">
                                            <div className="col-3 mb-3">
                                                <TextField
                                                    label="Gross Amount"
                                                    variant="outlined"
                                                    size="small"
                                                    disabled
                                                    fullWidth
                                                    name="grossAmt"
                                                    value={formData.grossAmt}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-3 mb-3">
                                                <TextField
                                                    label="Discount"
                                                    variant="outlined"
                                                    disabled
                                                    size="small"
                                                    fullWidth
                                                    name="discount"
                                                    value={formData.discount}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-3 mb-3">
                                                <TextField
                                                    label="Net Amount"
                                                    variant="outlined"
                                                    disabled
                                                    size="small"
                                                    fullWidth
                                                    name="netAmt"
                                                    value={formData.netAmt}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-3 mb-3">
                                                <TextField
                                                    label="Amount In Words"
                                                    variant="outlined"
                                                    multiline
                                                    size="small"
                                                    disabled
                                                    fullWidth
                                                    name="amtInWords"
                                                    value={formData.amtInWords}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <TextField
                                                    label="Narration"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    name="narration"
                                                    value={formData.narration}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Box>
                            </div>
                        </div>
                    )}
                </div>
                <ToastContainer />
            </LocalizationProvider>
        </>
    );
};

export default Quotation;
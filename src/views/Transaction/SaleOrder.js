import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, FormControl, InputLabel, MenuItem, Select, FormHelperText, Tab, Tabs } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const SalesOrder = () => {
    // State management
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [editId, setEditId] = useState('');
    const [docId, setDocId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [quotationList, setQuotationList] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [value, setValue] = useState(0);
    const [isBranchLoading, setIsBranchLoading] = useState(false);

    // User session data
    const orgId = parseInt(localStorage.getItem('orgId'));
    const finYear = parseInt(localStorage.getItem('finYear'));
    const branch = localStorage.getItem('branch') || '';
    const branchCode = localStorage.getItem('branchcode') || '';
    const createdBy = localStorage.getItem('userName');

    // Static options
    const statusOptions = ['Draft', 'Confirmed', 'Cancelled', 'Completed'];

    // Form data
    const [formData, setFormData] = useState({
        address: '',
        branch: branch,
        branchCode: branchCode,
        branchName: '',
        clientName: '',
        contactName: '',
        email: '',
        finYear: finYear.toString(),
        gstNo: '',
        mobileNumber: '',
        narration: '',
        quotationId: '',
        quotationName: '',
        status: 'Draft',
    });

    // Validation errors
    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        mobileNumber: '',
        email: '',
        branch: ''
    });

    // Sales Order details
    const [salesOrderDetails, setSalesOrderDetails] = useState([{
        category: '',
        discount: 0,
        produtName: '',
        qty: 1,
        sellingPrice: 0,
        subCategory: '',
    }]);

    const [detailErrors, setDetailErrors] = useState([{
        produtName: '',
        category: '',
        sellingPrice: '',
        qty: ''
    }]);

    // Table columns for list view
    const listViewColumns = useMemo(() => [
        { accessorKey: 'docId', header: 'Sales Order ID', size: 140 },
        { accessorKey: 'clientName', header: 'Client Name', size: 140 },
        { accessorKey: 'contactName', header: 'Contact', size: 140 },
        { accessorKey: 'mobileNumber', header: 'Mobile No', size: 140 },
        { accessorKey: 'email', header: 'Email', size: 140 },
        { accessorKey: 'status', header: 'Status', size: 140 },
        { accessorKey: 'totalAmount', header: 'Total Amount', size: 140 },
    ], []);

    // Calculate summary values
    const summaryValues = useMemo(() => {
        const grossAmount = salesOrderDetails.reduce(
            (sum, item) => sum + (parseFloat(item.sellingPrice) || 0) * (parseInt(item.qty) || 0),
            0
        );

        const totalDiscount = salesOrderDetails.reduce(
            (sum, item) => sum + (parseFloat(item.discount) || 0),
            0
        );

        const netAmount = grossAmount - totalDiscount;
        const discountPercentage = grossAmount > 0 ? (totalDiscount / grossAmount) * 100 : 0;

        return {
            grossAmount,
            totalDiscount,
            netAmount,
            discountPercentage,
            amountInWords: numberToWords(netAmount),
        };
    }, [salesOrderDetails]);

    // Number to words converter
    function numberToWords(num) {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return 'Zero';

        function convertLessThanOneThousand(number) {
            if (number === 0) return '';
            if (number < 10) return units[number];
            if (number < 20) return teens[number - 10];
            if (number < 100) {
                return tens[Math.floor(number / 10)] +
                    (number % 10 !== 0 ? ' ' + units[number % 10] : '');
            }
            return units[Math.floor(number / 100)] + ' Hundred' +
                (number % 100 !== 0 ? ' and ' + convertLessThanOneThousand(number % 100) : '');
        }

        const numStr = num.toString();
        const decimalIndex = numStr.indexOf('.');
        let wholeNumber = num;
        let decimalPart = 0;

        if (decimalIndex !== -1) {
            wholeNumber = parseInt(numStr.substring(0, decimalIndex));
            decimalPart = parseInt(numStr.substring(decimalIndex + 1, decimalIndex + 3)) || 0;
        }

        let result = '';
        if (wholeNumber >= 10000000) {
            result += convertLessThanOneThousand(Math.floor(wholeNumber / 10000000)) + ' Crore ';
            wholeNumber %= 10000000;
        }
        if (wholeNumber >= 100000) {
            result += convertLessThanOneThousand(Math.floor(wholeNumber / 100000)) + ' Lakh ';
            wholeNumber %= 100000;
        }
        if (wholeNumber >= 1000) {
            result += convertLessThanOneThousand(Math.floor(wholeNumber / 1000)) + ' Thousand ';
            wholeNumber %= 1000;
        }
        if (wholeNumber > 0) {
            result += convertLessThanOneThousand(wholeNumber);
        }

        if (decimalPart > 0) {
            result += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
        }

        return result.trim() + ' Only';
    }

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllSalesOrders();
            await getSalesOrderDocId();
            await getAllBranches();
            await getAllCategories();
            await getAllSubCategories();
            await getAllClients();
        };
        fetchInitialData();
    }, []);

    // API calls
    const getAllClients = async () => {
        try {
            const response = await apiCalls('get', `/transaction/getClientNameFromOpportunity?orgId=${orgId}`);
            if (response.status) {
                const clients = response.paramObjectsMap?.clientNameDetails || [];
                setClientList(clients.map(client => client.clientName));
            } else {
                showToast('error', response.message || 'Failed to load clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast('error', 'Failed to load clients');
        }
    };

    const getQuotationDetails = async (clientName) => {
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getQuotationNameIdAndDetails?branchName=${branch}&clientName=${clientName}&orgId=${orgId}`
            );

            if (response.status) {
                const quotations = response.paramObjectsMap?.quotationDetails || [];
                setQuotationList(quotations.map(quote => ({
                    id: quote.docId, // Using docId as ID since no other ID is provided
                    docId: quote.docId,
                    contactName: quote.contactName,
                    mobileNumber: quote.mobileNo,
                    quotationName: quote.oppurtunityName,
                    email: quote.email
                })));
            } else {
                showToast('error', response.message || 'Failed to load quotations');
            }
        } catch (error) {
            console.error('Error fetching quotation details:', error);
            showToast('error', 'Failed to load quotation details');
        }
    };

    const getAllBranches = async () => {
        setIsBranchLoading(true);
        try {
            const response = await apiCalls('get', `/master/branch?orgid=${orgId}`);
            console.log('Branch API Response:', response);

            if (response.status) {
                const branches = response.data?.branchVO ||
                    response.paramObjectsMap?.branchVO ||
                    [];

                setBranchList(branches);

                if (branches.length > 0) {
                    const defaultBranch = branches.find(b => b.branchCode === branchCode) ||
                        branches[0];

                    setFormData(prev => ({
                        ...prev,
                        branch: defaultBranch.branchCode,
                        branchName: defaultBranch.branchName,
                        branchCode: defaultBranch.branchCode
                    }));
                }
            } else {
                showToast('error', response.message || 'Failed to load branches');
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        } finally {
            setIsBranchLoading(false);
        }
    };

    const getAllSubCategories = async () => {
        try {
            const response = await apiCalls('get', `/master/getSubCategoryByOrgId?orgId=${orgId}`);
            if (response.status) {
                setSubCategoryList(response.paramObjectsMap?.subCategoryVO || []);
            } else {
                showToast('error', response.message || 'Failed to load subcategories');
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            showToast('error', 'Failed to load subcategories');
        }
    };

    const getAllCategories = async () => {
        try {
            const response = await apiCalls('get', `/ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
            if (response.status) {
                setCategoryList(response.paramObjectsMap?.categoryVO || []);
            } else {
                showToast('error', response.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('error', 'Failed to load categories');
        }
    };

    const getSalesOrderDocId = async () => {
        if (editId) return;

        try {
            setIsDocIdLoading(true);
            const response = await apiCalls(
                'get',
                `/transaction/getSalesOrderDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap?.salesOrderDocId) {
                setDocId(response.paramObjectsMap.salesOrderDocId);
            } else {
                showToast('error', response.paramObjectsMap?.message || 'Failed to generate sales order ID');
            }
        } catch (err) {
            console.error('Error fetching sales order docId:', err);
            showToast('error', 'Failed to generate sales order ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getAllSalesOrders = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getAllSalesOrderByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status) {
                const salesOrders = response.paramObjectsMap?.salesOrderVO || [];
                setListViewData(salesOrders.map(so => ({
                    ...so,
                    totalAmount: so.salesOrderDetailsDTO?.reduce(
                        (sum, item) => sum + (item.sellingPrice || 0) * (item.qty || 0) - (item.discount || 0),
                        0
                    ) || 0
                })));
            } else {
                showToast('error', response.message || 'Failed to fetch sales orders');
            }
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            showToast('error', 'Failed to fetch sales orders');
        }
    };

    const getSalesOrderById = async (row) => {
        setEditId(row.original.id);
        try {
            setIsLoading(true);
            const response = await apiCalls('get', `/transaction/getSalesOrderById?id=${row.original.id}`);

            if (response.status) {
                setListView(false);
                const salesOrder = response.paramObjectsMap.salesOrderVO;

                if (!salesOrder) {
                    showToast('error', 'Sales order not found');
                    return;
                }

                // Set form data
                setFormData({
                    address: salesOrder.address || '',
                    branch: salesOrder.branch || branch,
                    branchCode: salesOrder.branchCode || branchCode,
                    branchName: salesOrder.branchName || '',
                    clientName: salesOrder.clientName || '',
                    contactName: salesOrder.contactName || '',
                    email: salesOrder.email || '',
                    finYear: salesOrder.finYear || finYear.toString(),
                    gstNo: salesOrder.gstNo || '',
                    mobileNumber: salesOrder.mobileNumber || '',
                    narration: salesOrder.narration || '',
                    quotationId: salesOrder.quotationId || '',
                    quotationName: salesOrder.quotationName || '',
                    status: salesOrder.status || 'Draft',
                });

                setDocId(salesOrder.docId || '');

                // Set sales order details
                const details = salesOrder.salesOrderDetailsVO?.map(detail => ({
                    id: detail.id,
                    category: detail.category || '',
                    discount: detail.discount || '',
                    produtName: detail.produtName || '',
                    qty: detail.qty || '',
                    sellingPrice: detail.sellingPrice || '',
                    subCategory: detail.subCategory || '',
                })) || [{
                    category: '', discount: '', produtName: '', qty: '', sellingPrice: '', subCategory: ''
                }];

                setSalesOrderDetails(details);
                setDetailErrors(details.map(() => ({
                    produtName: '',
                    category: '',
                    sellingPrice: '',
                    qty: ''
                })));

                // Fetch quotations for this client
                if (salesOrder.clientName) {
                    await getQuotationDetails(salesOrder.clientName);
                }
            } else {
                showToast('error', response.message || 'Failed to fetch sales order details');
            }
        } catch (error) {
            console.error('Error fetching sales order details:', error);
            showToast('error', 'Failed to fetch sales order details');
        } finally {
            setIsLoading(false);
        }
    };

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field is modified
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        // If client is selected, update the client details
        if (name === 'clientName') {
            setFormData(prev => ({
                ...prev,
                quotationId: '', // Reset quotation when client changes
                quotationName: '',
                contactName: '',
                mobileNumber: '',
                email: ''
            }));
            getQuotationDetails(value);
        }

        // If quotation is selected, update the quotation details
        if (name === 'quotationId') {
            const selectedQuotation = quotationList.find(q => q.id === value);
            if (selectedQuotation) {
                setFormData(prev => ({
                    ...prev,
                    quotationName: selectedQuotation.quotationName || '',
                    contactName: selectedQuotation.contactName || prev.contactName,
                    mobileNumber: selectedQuotation.mobileNumber || prev.mobileNumber,
                    email: selectedQuotation.email || prev.email
                }));
            }
        }
    };

    const validateMainField = (field, value) => {
        const newErrors = { ...fieldErrors };

        switch (field) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors[field] = 'Invalid email format';
                } else if (!value) {
                    newErrors[field] = 'Email is required';
                } else {
                    newErrors[field] = '';
                }
                break;

            case 'mobileNumber':
                if (value && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(value)) {
                    newErrors[field] = 'Invalid mobile number (10 digits required)';
                } else if (!value) {
                    newErrors[field] = 'Mobile number is required';
                } else {
                    newErrors[field] = '';
                }
                break;

            case 'clientName':
            case 'contactName':
                if (!value) {
                    newErrors[field] = 'This field is required';
                } else {
                    newErrors[field] = '';
                }
                break;

            default:
                break;
        }

        setFieldErrors(newErrors);
    };

    const validateDetailField = (index, field, value) => {
        const newErrors = [...detailErrors];
        if (!newErrors[index]) newErrors[index] = {};

        if (field === 'sellingPrice' || field === 'discount') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                newErrors[index][field] = 'Must be a number';
            } else if (numValue < 0) {
                newErrors[index][field] = 'Amount cannot be negative';
            } else {
                newErrors[index][field] = '';
            }
        } else if (field === 'qty') {
            const numValue = parseInt(value);
            if (isNaN(numValue)) {
                newErrors[index][field] = 'Must be a number';
            } else if (numValue <= 0) {
                newErrors[index][field] = 'Quantity must be positive';
            } else {
                newErrors[index][field] = '';
            }
        } else if (!value && ['produtName', 'category'].includes(field)) {
            newErrors[index][field] = 'This field is required';
        } else {
            newErrors[index][field] = '';
        }

        setDetailErrors(newErrors);
    };

    const validateFields = () => {
        let isValid = true;
        const newErrors = { ...fieldErrors };

        // Required field validation
        if (!formData.clientName.trim()) {
            newErrors.clientName = 'Client name is required';
            isValid = false;
        }

        if (!formData.contactName.trim()) {
            newErrors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
            isValid = false;
        } else if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Invalid mobile number (10 digits required)';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!formData.branchCode) {
            newErrors.branch = 'Branch is required';
            isValid = false;
        }

        setFieldErrors(newErrors);
        return isValid;
    };

    const validateDetails = () => {
        let isValid = true;
        const newErrors = [];

        salesOrderDetails.forEach((detail, index) => {
            const error = {};

            if (!detail.produtName?.trim()) {
                error.produtName = 'Product name is required';
                isValid = false;
            }

            if (!detail.category) {
                error.category = 'Category is required';
                isValid = false;
            }

            const price = parseFloat(detail.sellingPrice);
            if (isNaN(price)) {
                error.sellingPrice = 'Must be a valid number';
                isValid = false;
            } else if (price < 0) {
                error.sellingPrice = 'Price cannot be negative';
                isValid = false;
            }

            const qty = parseInt(detail.qty);
            if (isNaN(qty)) {
                error.qty = 'Must be a valid number';
                isValid = false;
            } else if (qty <= 0) {
                error.qty = 'Quantity must be positive';
                isValid = false;
            }

            newErrors[index] = error;
        });

        setDetailErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        const isFormValid = validateFields();
        const isDetailsValid = validateDetails();

        if (!isFormValid || !isDetailsValid) {
            showToast('error', 'Please correct the highlighted fields');
            return;
        }

        setIsLoading(true);

        const selectedBranch = branchList.find(b => b.branchCode === formData.branchCode);

        const payload = {
            ...(editId && { id: editId }),
            docId: docId,
            address: formData.address,
            branch: formData.branch,
            branchName: selectedBranch?.branchName || '',
            branchCode: formData.branchCode,
            clientName: formData.clientName,
            contactName: formData.contactName,
            email: formData.email,
            finYear: formData.finYear,
            gstNo: formData.gstNo,
            mobileNumber: formData.mobileNumber,
            narration: formData.narration,
            orgId: orgId,
            createdBy: createdBy,
            quotationId: formData.quotationId,
            quotationName: formData.quotationName,
            status: formData.status,
            active: true,
            salesOrderDetailsDTO: salesOrderDetails.map(detail => ({
                ...(detail.id && { id: detail.id }),
                productName: detail.produtName,
                category: detail.category,
                subCategory: detail.subCategory,
                sellingPrice: parseFloat(detail.sellingPrice) || 0,
                qty: parseInt(detail.qty) || 1,
                discount: parseFloat(detail.discount) || 0
            }))
        };

        try {
            const response = await apiCalls('put', '/transaction/updateCreateSalesOrder', payload);
            if (response.status) {
                showToast('success', editId ? 'Sales order updated successfully' : 'Sales order created successfully');
                handleClear();
                await getAllSalesOrders();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving sales order:', error);
            showToast('error', 'Failed to save sales order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            address: '',
            branch: branch,
            branchCode: branchCode,
            branchName: branchList.find(b => b.branchCode === branchCode)?.branchName || '',
            clientName: '',
            contactName: '',
            email: '',
            finYear: finYear.toString(),
            gstNo: '',
            mobileNumber: '',
            narration: '',
            quotationId: '',
            quotationName: '',
            status: 'Draft',
        });

        setFieldErrors({
            clientName: '',
            contactName: '',
            mobileNumber: '',
            email: '',
            branch: ''
        });

        setSalesOrderDetails([{
            category: '',
            discount: 0,
            produtName: '',
            qty: 1,
            sellingPrice: 0,
            subCategory: '',
        }]);

        setDetailErrors([{
            produtName: '',
            category: '',
            sellingPrice: '',
            qty: ''
        }]);

        setEditId('');
        getSalesOrderDocId();
    };

    const handleAddDetail = () => {
        const lastDetail = salesOrderDetails[salesOrderDetails.length - 1];
        const lastError = detailErrors[detailErrors.length - 1] || {};

        const productNameValid = lastDetail.produtName?.trim();
        const categoryValid = lastDetail.category;
        const price = parseFloat(lastDetail.sellingPrice);
        const priceValid = !isNaN(price) && price >= 0;
        const qty = parseInt(lastDetail.qty);
        const qtyValid = !isNaN(qty) && qty > 0;

        if (!productNameValid || !categoryValid || !priceValid || !qtyValid) {
            const newErrors = [...detailErrors];
            newErrors[newErrors.length - 1] = {
                produtName: !productNameValid ? 'Product name is required' : '',
                category: !categoryValid ? 'Category is required' : '',
                sellingPrice: isNaN(price)
                    ? 'Must be a number'
                    : price < 0
                        ? 'Price cannot be negative'
                        : '',
                qty: isNaN(qty)
                    ? 'Must be a number'
                    : qty <= 0
                        ? 'Quantity must be positive'
                        : ''
            };
            setDetailErrors(newErrors);
            showToast('warning', 'Please fill current product details before adding new');
            return;
        }

        setSalesOrderDetails(prev => [
            ...prev,
            {
                category: '',
                discount: 0,
                produtName: '',
                qty: 1,
                sellingPrice: 0,
                subCategory: '',
            }
        ]);

        setDetailErrors(prev => [
            ...prev,
            {
                produtName: '',
                category: '',
                sellingPrice: '',
                qty: ''
            }
        ]);
    };

    const handleDeleteDetail = (index) => {
        if (salesOrderDetails.length <= 1) {
            showToast('warning', 'At least one product is required');
            return;
        }

        const newDetails = salesOrderDetails.filter((_, i) => i !== index);
        const newErrors = detailErrors.filter((_, i) => i !== index);

        setSalesOrderDetails(newDetails);
        setDetailErrors(newErrors);
    };

    const handleDetailChange = (index, field, value) => {
        // Prevent negative values for price, discount, and quantity
        if (field === 'sellingPrice' || field === 'discount' || field === 'qty') {
            if (parseFloat(value) < 0) {
                value = Math.abs(parseFloat(value)) || 0;
            }
        }

        const newDetails = [...salesOrderDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setSalesOrderDetails(newDetails);

        if (value && detailErrors[index]?.[field]) {
            const newErrors = [...detailErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setDetailErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

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
                        <ActionButton
                            title="Save"
                            icon={SaveIcon}
                            onClick={handleSave}
                            disabled={isLoading}
                            loading={isLoading}
                        />
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">
                                {/* Sales Order ID */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Sales Order ID"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        disabled
                                        value={isDocIdLoading ? "Generating..." : docId}
                                        InputProps={{
                                            style: { backgroundColor: '#f5f5f5' }
                                        }}
                                    />
                                </div>

                                {/* Client Name - Updated to dropdown */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small" error={!!fieldErrors.clientName}>
                                        <InputLabel>Client Name *</InputLabel>
                                        <Select
                                            label="Client Name *"
                                            value={formData.clientName}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                            }}
                                            name="clientName"
                                            onBlur={(e) => validateMainField('clientName', e.target.value)}
                                        >
                                            <MenuItem value=""><em>Select Client</em></MenuItem>
                                            {clientList.map((client, index) => (
                                                <MenuItem key={index} value={client}>
                                                    {client}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.clientName && <FormHelperText>{fieldErrors.clientName}</FormHelperText>}
                                    </FormControl>
                                </div>

                                {/* Branch Dropdown */}
                                <div className="col-md-3 mb-3">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                                        <InputLabel id="branch-label">Branch Name *</InputLabel>
                                        <Select
                                            labelId="branch-label"
                                            label="Branch Name *"
                                            value={formData.branch}
                                            onChange={handleInputChange}
                                            name="branch"
                                        >
                                            {branchList.map((branch) => (
                                                <MenuItem key={branch.id} value={branch.branch}>
                                                    {branch.branch}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                                    </FormControl>
                                </div>

                                {/* Quotation - Updated to show more details */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Quotation</InputLabel>
                                        <Select
                                            label="Quotation"
                                            value={formData.quotationId}
                                            onChange={handleInputChange}
                                            name="quotationId"
                                            disabled={!formData.clientName}
                                        >
                                            <MenuItem value=""><em>Select Quotation</em></MenuItem>
                                            {quotationList.map(quote => (
                                                <MenuItem key={quote.id} value={quote.id}>
                                                    {quote.docId} - {quote.quotationName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Contact Name */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Contact Name *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.contactName}
                                        helperText={fieldErrors.contactName}
                                        onBlur={(e) => validateMainField('contactName', e.target.value)}
                                    />
                                </div>

                                {/* Mobile No */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Mobile No *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.mobileNumber}
                                        helperText={fieldErrors.mobileNumber}
                                        onBlur={(e) => validateMainField('mobileNumber', e.target.value)}
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Email *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email}
                                        onBlur={(e) => validateMainField('email', e.target.value)}
                                    />
                                </div>

                                {/* GST No */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="GST No"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="gstNo"
                                        value={formData.gstNo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Status */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={formData.status}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'status', value: e.target.value }
                                            })}
                                        >
                                            {statusOptions.map(status => (
                                                <MenuItem key={status} value={status}>{status}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Address */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Address"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        // multiline
                                        // rows={2}
                                    />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                        <Tab value={0} label="Sales Order Price" />
                                        <Tab value={1} label="Summary" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            {/* <div className="mb-1">
                                                <ActionButton title="Add Branch" icon={AddIcon} onClick={handleAddBranch} />
                                            </div> */}
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>S.No</th>
                                                                    <th className="px-2 py-2 text-white text-center">Product Name *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Category *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Sub Category</th>
                                                                    <th className="px-2 py-2 text-white text-center">Price *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Quantity *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Discount</th>
                                                                    <th className="px-2 py-2 text-white text-center">Todal Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {salesOrderDetails.map((detail, index) => {
                                                                    const amount = (parseFloat(detail.sellingPrice) || 0) * (parseInt(detail.qty) || 0) - (parseFloat(detail.discount) || 0);
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteIcon}
                                                                                    onClick={() => handleDeleteDetail(index)}
                                                                                    aria-label={`Delete product ${index + 1}`}
                                                                                />
                                                                            </td>
                                                                            <td className="text-center pt-3">{index + 1}</td>

                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    value={detail.produtName}
                                                                                    onChange={(e) => handleDetailChange(index, 'produtName', e.target.value)}
                                                                                    onBlur={(e) => validateDetailField(index, 'produtName', e.target.value)}
                                                                                    error={!!detailErrors[index]?.produtName}
                                                                                    helperText={detailErrors[index]?.produtName}
                                                                                />
                                                                            </td>

                                                                            <td>
                                                                                <FormControl fullWidth size="small" error={!!detailErrors[index]?.category}>
                                                                                    <InputLabel>Category *</InputLabel>
                                                                                    <Select
                                                                                        value={detail.category}
                                                                                        label="Category *"
                                                                                        onChange={(e) => handleDetailChange(index, 'category', e.target.value)}
                                                                                        onBlur={(e) => validateDetailField(index, 'category', e.target.value)}
                                                                                    >
                                                                                        <MenuItem value=""><em>Select Category</em></MenuItem>
                                                                                        {categoryList.map(cat => (
                                                                                            <MenuItem key={cat.id} value={cat.categoryName}>
                                                                                                {cat.categoryName}
                                                                                            </MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                    {detailErrors[index]?.category && (
                                                                                        <FormHelperText>{detailErrors[index].category}</FormHelperText>
                                                                                    )}
                                                                                </FormControl>
                                                                            </td>

                                                                            <td>
                                                                                <FormControl fullWidth size="small">
                                                                                    <InputLabel>Sub Category</InputLabel>
                                                                                    <Select
                                                                                        value={detail.subCategory}
                                                                                        label="Sub Category"
                                                                                        onChange={(e) => handleDetailChange(index, 'subCategory', e.target.value)}
                                                                                    >
                                                                                        <MenuItem value=""><em>Select Sub Category</em></MenuItem>
                                                                                        {subCategoryList.map(sub => (
                                                                                            <MenuItem key={sub.id} value={sub.subCategoryName}>
                                                                                                {sub.subCategoryName}
                                                                                            </MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                            </td>

                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type="number"
                                                                                    label="Price"
                                                                                    value={detail.sellingPrice}
                                                                                    onChange={(e) => handleDetailChange(index, 'sellingPrice', e.target.value)}
                                                                                    onBlur={(e) => validateDetailField(index, 'sellingPrice', e.target.value)}
                                                                                    error={!!detailErrors[index]?.sellingPrice}
                                                                                    helperText={detailErrors[index]?.sellingPrice}
                                                                                    inputProps={{ min: 0, step: "0.01" }}
                                                                                />
                                                                            </td>

                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type="number"
                                                                                    label="Quantity"
                                                                                    value={detail.qty}
                                                                                    onChange={(e) => handleDetailChange(index, 'qty', e.target.value)}
                                                                                    onBlur={(e) => validateDetailField(index, 'qty', e.target.value)}
                                                                                    error={!!detailErrors[index]?.qty}
                                                                                    helperText={detailErrors[index]?.qty}
                                                                                    inputProps={{ min: 1 }}
                                                                                />
                                                                            </td>

                                                                            <td>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    type="number"
                                                                                    label="Discount"
                                                                                    value={detail.discount}
                                                                                    onChange={(e) => handleDetailChange(index, 'discount', e.target.value)}
                                                                                    onBlur={(e) => validateDetailField(index, 'discount', e.target.value)}
                                                                                    inputProps={{ min: 0, step: "0.01" }}
                                                                                />
                                                                            </td>

                                                                            <td className="text-center pt-3">
                                                                                {amount.toFixed(2)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                {/* <tr>
                                                                    <td colSpan="8" className="text-right font-weight-bold">Total Amount:</td>
                                                                    <td className="text-center font-weight-bold">{summaryValues.netAmount.toFixed(2)}</td>
                                                                </tr> */}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {value === 1 && (
                                        <>
                                            {/* <div className="mb-1">
                                                <ActionButton title="Add Contact" icon={AddIcon} onClick={handleAddContact} />
                                            </div> */}
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                                                    <th colSpan="2" className="px-2 py-2 text-white text-center">Summary</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td className="font-weight-bold">Gross Amount</td>
                                                                    <td className="text-right">
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={summaryValues.grossAmount.toFixed(2)}
                                                                            disabled
                                                                            InputProps={{
                                                                                style: { textAlign: 'right' }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="font-weight-bold">Discount %</td>
                                                                    <td className="text-right">
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={summaryValues.discountPercentage.toFixed(2)}
                                                                            disabled
                                                                            InputProps={{
                                                                                style: { textAlign: 'right' }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="font-weight-bold">Net Amount</td>
                                                                    <td className="text-right">
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={summaryValues.netAmount.toFixed(2)}
                                                                            disabled
                                                                            InputProps={{
                                                                                style: { textAlign: 'right' }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="font-weight-bold">Amount In Words</td>
                                                                    <td>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={summaryValues.amountInWords}
                                                                            disabled
                                                                            multiline
                                                                            rows={2}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="font-weight-bold">Narration</td>
                                                                    <td>
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            value={formData.narration}
                                                                            onChange={(e) => setFormData(prev => ({
                                                                                ...prev,
                                                                                narration: e.target.value
                                                                            }))}
                                                                            multiline
                                                                            rows={2}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Box>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getSalesOrderById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default SalesOrder;
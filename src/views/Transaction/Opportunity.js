import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const Opportunity = () => {
    // State management
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [editId, setEditId] = useState('');
    const [docId, setDocId] = useState('');
    const [toggle, setToggle] = useState({});
    const [branchList, setBranchList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [isBranchLoading, setIsBranchLoading] = useState(false);

    // User session data
    const orgId = parseInt(localStorage.getItem('orgId'));
    const finYear = parseInt(localStorage.getItem('finYear'));
    const branch = localStorage.getItem('branch') || '';
    const branchCode = localStorage.getItem('branchcode') || '';
    const createdBy = localStorage.getItem('userName');

    // Static options
    const statusOptions = ['Open', 'Closed', 'Lost', 'Won', 'In Progress'];
    const productStatusOptions = ['Active', 'Inactive'];

    // Form data
    const [formData, setFormData] = useState({
        address: '',
        branch:'',
        branchCode:'',
        branchName:'',
        cancelRemarks: '',
        clientName: '',
        closedDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        contactName: '',
        description: '',
        designation: '',
        email: '',
        finYear: finYear.toString(),
        gstNo: '',
        mobileNo: '',
        status: 'Open',
    });

    // Validation errors
    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        mobileNo: '',
        email: '',
        branch: ''
    });

    // Opportunity details
    const [opportunityDetails, setOpportunityDetails] = useState([{
        category: '',
        description: '',
        opportunityAmount: 0,
        productName: '',
        quantity: 1,
        remarks: '',
        status: 'Active',
        subCategory: '',
    }]);

    const [detailErrors, setDetailErrors] = useState([{
        productName: '',
        category: '',
        opportunityAmount: '',
    }]);

    // Table columns for list view
    const listViewColumns = useMemo(() => [
        { accessorKey: 'docId', header: 'Opportunity ID', size: 140 },
        { accessorKey: 'clientName', header: 'Client Name', size: 140 },
        { accessorKey: 'contactName', header: 'Contact', size: 140 },
        { accessorKey: 'mobileNo', header: 'Mobile No', size: 140 },
        { accessorKey: 'email', header: 'Email', size: 140 },
        { accessorKey: 'status', header: 'Status', size: 140 },
        { accessorKey: 'totalAmount', header: 'Total Amount', size: 140 },
    ], []);

    // Calculate total amount
    const totalAmount = useMemo(() => {
        return opportunityDetails.reduce(
            (sum, item) => sum + (parseFloat(item.opportunityAmount) || 0),
            0
        );
    }, [opportunityDetails]);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllOpportunities();
            await getOpportunityDocId();
            await getAllBranches();
            await getAllCategories();
            await getAllSubCategories();
        };
        fetchInitialData();
    }, []);

    // API calls
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
    const handleBranchChange = (e) => {
        const branchName = e.target.value;
        const selectedBranch = branchList.find(b => b.branch === branchName);

        if (selectedBranch) {
            setFormData(prev => ({
                ...prev,
                branch: branchName,
                branchCode: selectedBranch.branchCode
            }));
        }
    };

    const getOpportunityDocId = async () => {
        if (editId) return;

        try {
            setIsDocIdLoading(true);
            const response = await apiCalls(
                'get',
                `/transaction/getOpportunityDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap?.opportunityDocId) {
                setDocId(response.paramObjectsMap.opportunityDocId);
            } else {
                showToast('error', response.paramObjectsMap?.message || 'Failed to generate opportunity ID');
            }
        } catch (err) {
            console.error('Error fetching opportunity docId:', err);
            showToast('error', 'Failed to generate opportunity ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getAllOpportunities = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getOpportunityByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status) {
                const opportunities = response.paramObjectsMap?.opportunityVO || [];
                setListViewData(opportunities.map(opp => ({
                    ...opp,
                    totalAmount: opp.opportunityDetailsVO?.reduce((sum, item) => sum + (item.opportunityAmount || 0), 0) || 0
                })));
            } else {
                showToast('error', response.message || 'Failed to fetch opportunities');
            }
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            showToast('error', 'Failed to fetch opportunities');
        }
    };

    const getOpportunityById = async (row) => {
        setEditId(row.original.id);
        try {
            setIsLoading(true);
            const response = await apiCalls('get', `/transaction/getOpportunityById?id=${row.original.id}`);

            if (response.status) {
                setListView(false);
                const opportunity = response.paramObjectsMap.opportunityVO;

                if (!opportunity) {
                    showToast('error', 'Opportunity not found');
                    return;
                }

                // Set form data
                setFormData({
                    address: opportunity.address || '',
                    branchCode: opportunity.branchCode || branchCode,
                    branch:opportunity.branch || branch,
                    branchName: opportunity.branchName || '',
                    cancelRemarks: opportunity.cancelRemarks || '',
                    clientName: opportunity.clientName || '',
                    closedDate: opportunity.closedDate || dayjs().add(30, 'day').format('YYYY-MM-DD'),
                    contactName: opportunity.contactName || '',
                    description: opportunity.description || '',
                    designation: opportunity.designation || '',
                    email: opportunity.email || '',
                    finYear: opportunity.finYear || finYear.toString(),
                    gstNo: opportunity.gstNo || '',
                    mobileNo: opportunity.mobileNo || '',
                    status: opportunity.status || 'Open',
                });

                setDocId(opportunity.docId || '');

                // Set opportunity details
                const details = opportunity.opportunityDetailsVO?.map(detail => ({
                    id: detail.id, // Include id for existing items
                    category: detail.category || '',
                    description: detail.description || '',
                    opportunityAmount: detail.opportunityAmount || 0,
                    productName: detail.productName || '',
                    quantity: detail.quantity || 1,
                    remarks: detail.remarks || '',
                    status: detail.status || 'Active',
                    subCategory: detail.subCategory || '',
                })) || [{
                    category: '', description: '', opportunityAmount: 0, productName: '',
                    quantity: 1, remarks: '', status: 'Active', subCategory: ''
                }];

                setOpportunityDetails(details);
                setDetailErrors(details.map(() => ({
                    productName: '',
                    category: '',
                    opportunityAmount: ''
                })));
            } else {
                showToast('error', response.message || 'Failed to fetch opportunity details');
            }
        } catch (error) {
            console.error('Error fetching opportunity details:', error);
            showToast('error', 'Failed to fetch opportunity details');
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

            case 'mobileNo':
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

        if (field === 'opportunityAmount') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                newErrors[index][field] = 'Must be a number';
            } else if (numValue <= 0) {
                newErrors[index][field] = 'Amount must be positive';
            } else {
                newErrors[index][field] = '';
            }
        } else if (!value && ['productName', 'category'].includes(field)) {
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

        if (!formData.mobileNo.trim()) {
            newErrors.mobileNo = 'Mobile number is required';
            isValid = false;
        } else if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.mobileNo)) {
            newErrors.mobileNo = 'Invalid mobile number (10 digits required)';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
            isValid = false;
        }

        setFieldErrors(newErrors);
        return isValid;
    };

    const validateDetails = () => {
        let isValid = true;
        const newErrors = [];

        opportunityDetails.forEach((detail, index) => {
            const error = {};

            if (!detail.productName?.trim()) {
                error.productName = 'Product name is required';
                isValid = false;
            }

            if (!detail.category) {
                error.category = 'Category is required';
                isValid = false;
            }

            const amount = parseFloat(detail.opportunityAmount);
            if (isNaN(amount)) {
                error.opportunityAmount = 'Must be a valid number';
                isValid = false;
            } else if (amount <= 0) {
                error.opportunityAmount = 'Amount must be positive';
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

        const selectedBranch = branchList.find(b => b.branchCode === formData.branch);

        const payload = {
            ...(editId && { id: editId }),
            docId: docId,
            address: formData.address,
            branch: formData.branch,
            branchName: formData.branchName,
            branchCode: formData.branchCode,
            cancelRemarks: formData.cancelRemarks,
            clientName: formData.clientName,
            closedDate: formData.closedDate,
            contactName: formData.contactName,
            description: formData.description,
            designation: formData.designation,
            email: formData.email,
            finYear: formData.finYear,
            gstNo: formData.gstNo,
            mobileNo: formData.mobileNo,
            status: formData.status,
            active: true,
            orgId: orgId,
            createdBy: createdBy,
            opportunityDetailsDTO: opportunityDetails.map(detail => ({
                ...(detail.id && { id: detail.id }), // Include id for existing items
                productName: detail.productName,
                category: detail.category,
                subCategory: detail.subCategory,
                opportunityAmount: parseFloat(detail.opportunityAmount) || 0,
                quantity: parseInt(detail.quantity) || 1,
                status: detail.status,
                description: detail.description,
                remarks: detail.remarks
            }))
        };

        try {
            const response = await apiCalls('put', '/transaction/createUpdateOpprtunity', payload);
            if (response.status) {
                showToast('success', editId ? 'Opportunity updated successfully' : 'Opportunity created successfully');
                handleClear();
                await getAllOpportunities();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving opportunity:', error);
            showToast('error', 'Failed to save opportunity');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            address: '',
            branchName: '',
            cancelRemarks: '',
            clientName: '',
            closedDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
            contactName: '',
            description: '',
            designation: '',
            email: '',
            finYear: finYear.toString(),
            gstNo: '',
            mobileNo: '',
            status: 'Open',
        });

        setFieldErrors({
            clientName: '',
            contactName: '',
            mobileNo: '',
            email: '',
            branch: ''
        });

        setOpportunityDetails([{
            category: '',
            description: '',
            opportunityAmount: 0,
            productName: '',
            quantity: 1,
            remarks: '',
            status: 'Active',
            subCategory: '',
        }]);

        setDetailErrors([{
            productName: '',
            category: '',
            opportunityAmount: ''
        }]);

        setEditId('');
        getOpportunityDocId();
    };

    const handleAddDetail = () => {
        const lastDetail = opportunityDetails[opportunityDetails.length - 1];
        const lastError = detailErrors[detailErrors.length - 1] || {};

        const productNameValid = lastDetail.productName?.trim();
        const categoryValid = lastDetail.category;
        const amount = parseFloat(lastDetail.opportunityAmount);
        const amountValid = !isNaN(amount) && amount > 0;

        if (!productNameValid || !categoryValid || !amountValid) {
            const newErrors = [...detailErrors];
            newErrors[newErrors.length - 1] = {
                productName: !productNameValid ? 'Product name is required' : '',
                category: !categoryValid ? 'Category is required' : '',
                opportunityAmount: isNaN(amount)
                    ? 'Must be a number'
                    : amount <= 0
                        ? 'Amount must be positive'
                        : ''
            };
            setDetailErrors(newErrors);
            showToast('warning', 'Please fill current product details before adding new');
            return;
        }

        setOpportunityDetails(prev => [
            ...prev,
            {
                category: '',
                description: '',
                opportunityAmount: 0,
                productName: '',
                quantity: 1,
                remarks: '',
                status: 'Active',
                subCategory: '',
            }
        ]);

        setDetailErrors(prev => [
            ...prev,
            {
                productName: '',
                category: '',
                opportunityAmount: ''
            }
        ]);
    };

    const handleDeleteDetail = (index) => {
        if (opportunityDetails.length <= 1) {
            showToast('warning', 'At least one product is required');
            return;
        }

        const newDetails = opportunityDetails.filter((_, i) => i !== index);
        const newErrors = detailErrors.filter((_, i) => i !== index);

        setOpportunityDetails(newDetails);
        setDetailErrors(newErrors);
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...opportunityDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setOpportunityDetails(newDetails);

        if (value && detailErrors[index]?.[field]) {
            const newErrors = [...detailErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setDetailErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);

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
                                {/* Opportunity ID */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Opportunity ID"
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

                                {/* Client Name */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Client Name *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.clientName}
                                        helperText={fieldErrors.clientName}
                                        onBlur={(e) => validateMainField('clientName', e.target.value)}
                                    />
                                </div>

                                {/* Branch Dropdown - Updated */}
                                <div className="col-md-3 mb-3">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                                        <InputLabel id="branch-label">Branch Name *</InputLabel>
                                        <Select
                                            labelId="branch-label"
                                            label="Branch Name *"
                                            value={formData.branch}
                                            onChange={handleBranchChange}
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

                                {/* Designation */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Designation"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
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

                                {/* Mobile No */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Mobile No *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.mobileNo}
                                        helperText={fieldErrors.mobileNo}
                                        onBlur={(e) => validateMainField('mobileNo', e.target.value)}
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
                                        multiline
                                        rows={2}
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
                                                <MenuItem key={branch.branchCode} value={branch.branchCode}>
                                                    {branch.branchName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Expected Close Date */}
                                <div className="col-md-3 mb-3">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Expected Close Date"
                                            value={dayjs(formData.closedDate)}
                                            onChange={(newValue) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    closedDate: newValue.format('YYYY-MM-DD')
                                                }))
                                            }
                                            renderInput={(params) =>
                                                <TextField {...params} size="small" fullWidth />}
                                        />
                                    </LocalizationProvider>
                                </div>

                                {/* Description */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={2}
                                    />
                                </div>
                            </div>


                            <div className="row mt-2">
                                <div className="mb-1">
                                    <ActionButton
                                        title="Add Product"
                                        icon={AddIcon}
                                        onClick={handleAddDetail}
                                    />
                                </div>
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
                                                    <th className="px-2 py-2 text-white text-center">Amount *</th>
                                                    <th className="px-2 py-2 text-white text-center">Quantity</th>
                                                    <th className="px-2 py-2 text-white text-center">Status</th>
                                                    <th className="px-2 py-2 text-white text-center">Remarks</th>
                                                    <th className="px-2 py-2 text-white text-center">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {opportunityDetails.map((detail, index) => (
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
                                                                value={detail.productName}
                                                                onChange={(e) => handleDetailChange(index, 'productName', e.target.value)}
                                                                onBlur={(e) => validateDetailField(index, 'productName', e.target.value)}
                                                                error={!!detailErrors[index]?.productName}
                                                                helperText={detailErrors[index]?.productName}
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
                                                                label="Amount"
                                                                value={detail.opportunityAmount}
                                                                onChange={(e) => handleDetailChange(index, 'opportunityAmount', e.target.value)}
                                                                onBlur={(e) => validateDetailField(index, 'opportunityAmount', e.target.value)}
                                                                error={!!detailErrors[index]?.opportunityAmount}
                                                                helperText={detailErrors[index]?.opportunityAmount}
                                                                inputProps={{ min: 0, step: "0.01" }}
                                                            />
                                                        </td>

                                                        <td>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                type="number"
                                                                label="Quantity"
                                                                value={detail.quantity}
                                                                onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                                                                inputProps={{ min: 1 }}
                                                            />
                                                        </td>

                                                        <td>
                                                            <FormControl fullWidth size="small">
                                                                <InputLabel>Status</InputLabel>
                                                                <Select
                                                                    value={detail.status}
                                                                    label="Status"
                                                                    onChange={(e) => handleDetailChange(index, 'status', e.target.value)}
                                                                >
                                                                    {productStatusOptions.map(status => (
                                                                        <MenuItem key={status} value={status}>{status}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </td>

                                                        <td>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="Remarks"
                                                                value={detail.remarks}
                                                                onChange={(e) => handleDetailChange(index, 'remarks', e.target.value)}
                                                            />
                                                        </td>

                                                        <td>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="Description"
                                                                value={detail.description}
                                                                onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                                                multiline
                                                                rows={2}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getOpportunityById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Opportunity;
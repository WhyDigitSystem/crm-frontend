import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, Tab, Tabs, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState, useEffect } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const Lead = () => {
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [docId, setDocId] = useState('');
    const [branchCode] = useState(localStorage.getItem('branchCode') || '');
    const [clientTypes] = useState(['Corporate', 'Individual', 'Government', 'Non-Profit']);
    const [sources] = useState(['Website', 'Referral', 'Social Media', 'Advertisement', 'Other']);
    const [industries] = useState(['IT', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail']);

    const [formData, setFormData] = useState({
        clientName: '',
        clientType: '',
        contactNo: '',
        mail: '',
        industry: '',
        source: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
        website: '',
        customer: '',
        cancelRemarks: '',
        finYear: '2025',
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        clientType: '',
        contactNo: '',
        mail: '',
        industry: '',
        source: '',
    });

    const [leadBranches, setLeadBranches] = useState([{
        address: '',
        branch: '',
        branchCode: '',
        city: '',
        country: '',
        gstNo: '',
        state: ''
    }]);

    const [branchErrors, setBranchErrors] = useState([{
        branch: '',
        branchCode: '',
        address: '',
        city: '',
        country: '',
        state: ''
    }]);

    const [leadContacts, setLeadContacts] = useState([{
        branchName: '',
        designation: '',
        dob: '',
        email: '',
        mobileNo: '',
        name: '',
        preferredContact: false,
        workAnniversaryDate: ''
    }]);

    const [contactErrors, setContactErrors] = useState([{
        name: '',
        mobileNo: '',
        email: '',
        designation: ''
    }]);

    const listViewColumns = [
        { accessorKey: 'clientName', header: 'Client Name', size: 140 },
        { accessorKey: 'clientType', header: 'Client Type', size: 140 },
        { accessorKey: 'contactNo', header: 'Contact No', size: 140 },
        { accessorKey: 'mail', header: 'Email', size: 140 },
        { accessorKey: 'industry', header: 'Industry', size: 140 },
        { accessorKey: 'source', header: 'Source', size: 140 },
        { accessorKey: 'city', header: 'City', size: 140 },
        { accessorKey: 'state', header: 'State', size: 140 }
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllLeads();
            await getLeadDocId();
        };
        fetchInitialData();
    }, []);

    const getLeadDocId = async () => {
        if (editId) return;
        try {
            setIsDocIdLoading(true);
            const response = await apiCalls(
                'get',
                `/transaction/getLeadDocId?branch=BANGALORE&branchCode=BLR&finYear=${formData.finYear}&orgId=${orgId}`
            );
            if (response.status) {
                setDocId(response.paramObjectsMap.leadDocId);
            }
        } catch (err) {
            console.error('Error fetching lead docId:', err);
            showToast('error', 'Failed to generate lead ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getAllLeads = async () => {
        try {
            const response = await apiCalls('get', `/transaction/getAllLeadByOrgId?branchCode=BLR&finYear=2025&orgId=${orgId}`);
            if (response.status) {
                setListViewData(response.paramObjectsMap.leadVO);
            } else {
                showToast('error', response.message || 'Failed to fetch leads');
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast('error', 'Failed to fetch leads');
        }
    };

    const getLeadById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/transaction/getLeadById?id=${row.original.id}`);
            if (response.status) {
                setListView(false);
                const lead = response.paramObjectsMap.leadVO;

                // Map API fields to formData state
                setFormData({
                    address: lead.addres || '',
                    cancelRemarks: lead.cancelRemarks || '',
                    city: lead.city || '',
                    clientName: lead.clientName || '',
                    clientType: lead.clientType || '',
                    contactNo: lead.contactNo || '',
                    country: lead.country || '',
                    customer: lead.customer || '',
                    finYear: lead.finYear || '2025',
                    industry: lead.industry || '',
                    mail: lead.mail || '',
                    pinCode: lead.pinCode || '',
                    source: lead.source || '',
                    state: lead.state || '',
                    website: lead.website || '',
                });

                // Set document ID
                setDocId(lead.docId || '');

                // Map branches
                const branches = lead.leadBranchVO?.map(branch => ({
                    address: branch.address || '',
                    branch: branch.branch || '',
                    branchCode: branch.branchCode || '',
                    city: branch.city || '',
                    country: branch.country || '',
                    gstNo: branch.gstNo || '',
                    state: branch.state || ''
                })) || [];

                setLeadBranches(branches.length > 0 ? branches : [{
                    address: '', branch: '', branchCode: '', city: '', country: '', gstNo: '', state: ''
                }]);

                // Map contacts
                const contacts = lead.leadContactVO?.map(contact => ({
                    branchName: contact.branchName || '',
                    designation: contact.designation || '',
                    dob: contact.dob || contact.aniversary || '',
                    email: contact.email || '',
                    mobileNo: contact.mobileNo || '',
                    name: contact.name || '',
                    preferredContact: contact.preferedContact === 1,
                    workAnniversaryDate: contact.workAniversaryDate || ''
                })) || [];

                setLeadContacts(contacts.length > 0 ? contacts : [{
                    branchName: '', designation: '', dob: '', email: '', mobileNo: '', name: '',
                    preferredContact: false, workAnniversaryDate: ''
                }]);
            }
        } catch (error) {
            console.error('Error fetching lead details:', error);
            showToast('error', 'Failed to fetch lead details');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Convert to string if it's the contactNo field
        const processedValue = name === 'contactNo' ? String(value) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateMainField = (field, value) => {
        const newErrors = { ...fieldErrors };

        if (field === 'mail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field] = 'Invalid email format';
        } else if (field === 'contactNo' && value && !/^[0-9+\-\s]{10,15}$/.test(value)) {
            newErrors[field] = 'Invalid contact number';
        } else if (!value) {
            newErrors[field] = 'This field is required';
        } else {
            newErrors[field] = '';
        }

        setFieldErrors(newErrors);
    };

    const validateContactField = (index, field, value) => {
        const newErrors = [...contactErrors];
        if (!newErrors[index]) newErrors[index] = {};

        if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[index][field] = 'Invalid email format';
        } else if (field === 'mobileNo' && value && !/^[0-9+\-\s]{10,15}$/.test(value)) {
            newErrors[index][field] = 'Invalid mobile number';
        } else if (!value && ['name', 'mobileNo', 'email', 'designation'].includes(field)) {
            newErrors[index][field] = 'This field is required';
        } else {
            newErrors[index][field] = '';
        }

        setContactErrors(newErrors);
    };

    const validateBranchField = (index, field, value) => {
        const newErrors = [...branchErrors];
        if (!newErrors[index]) newErrors[index] = {};

        if (!value && ['branch', 'branchCode', 'address', 'city', 'country', 'state'].includes(field)) {
            newErrors[index][field] = 'This field is required';
        } else {
            newErrors[index][field] = '';
        }

        setBranchErrors(newErrors);
    };

    const validateFields = () => {
        const errors = {};
        if (!formData.clientName.trim()) errors.clientName = 'Client name is required';
        if (!formData.clientType) errors.clientType = 'Client type is required';
        if (!String(formData.contactNo).trim()) errors.contactNo = 'Contact number is required';
        if (!formData.mail.trim()) errors.mail = 'Email is required';
        if (!formData.industry) errors.industry = 'Industry is required';
        if (!formData.source) errors.source = 'Source is required';

        if (formData.mail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
            errors.mail = 'Invalid email format';
        }

        if (String(formData.contactNo).trim() && !/^[0-9+\-\s]{10,15}$/.test(String(formData.contactNo))) {
            errors.contactNo = 'Invalid contact number';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateBranches = () => {
        const errors = leadBranches.map(branch => {
            const error = {};
            if (!branch.branch.trim()) error.branch = 'Branch name is required';
            if (!branch.branchCode.trim()) error.branchCode = 'Branch code is required';
            if (!branch.address.trim()) error.address = 'Address is required';
            if (!branch.city.trim()) error.city = 'City is required';
            if (!branch.country.trim()) error.country = 'Country is required';
            if (!branch.state.trim()) error.state = 'State is required';
            return error;
        });

        setBranchErrors(errors);
        return errors.every(e => Object.keys(e).length === 0);
    };

    const validateContacts = () => {
        const errors = leadContacts.map(contact => {
            const error = {};
            if (!contact.name.trim()) error.name = 'Name is required';
            if (!contact.mobileNo.trim()) error.mobileNo = 'Mobile number is required';
            if (!contact.email.trim()) error.email = 'Email is required';
            if (!contact.designation.trim()) error.designation = 'Designation is required';

            if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
                error.email = 'Invalid email format';
            }

            if (contact.mobileNo.trim() && !/^[0-9+\-\s]{10,15}$/.test(contact.mobileNo)) {
                error.mobileNo = 'Invalid mobile number';
            }

            return error;
        });

        setContactErrors(errors);
        return errors.every(e => Object.keys(e).length === 0);
    };

    const handleSave = async () => {
        const isFormValid = validateFields();
        const isBranchesValid = validateBranches();
        const isContactsValid = validateContacts();

        if (!isFormValid || !isBranchesValid || !isContactsValid) {
            showToast('error', 'Please correct the highlighted fields');
            return;
        }

        setIsLoading(true);

        // Prepare API payload
        const payload = {
            ...(editId && { id: editId }),
            addres: formData.address || '',
            branch: leadBranches[0]?.branch || '',
            branchCode: leadBranches[0]?.branchCode || '',
            cancelRemarks: formData.cancelRemarks || '',
            city: formData.city || '',
            clientName: formData.clientName,
            clientType: formData.clientType,
            companyLogo: '',
            contactNo: formData.contactNo,
            country: formData.country || '',
            createdBy: createdBy,
            customer: formData.customer || '',
            finYear: formData.finYear,
            industry: formData.industry,
            mail: formData.mail,
            orgId: orgId,
            pinCode: formData.pinCode ? parseInt(formData.pinCode) : 0,
            source: formData.source,
            state: formData.state || '',
            website: formData.website || '',
            leadBranchDTO: leadBranches.map(branch => ({
                address: branch.address,
                branch: branch.branch,
                branchCode: branch.branchCode,
                city: branch.city,
                country: branch.country,
                gstNo: branch.gstNo || '',
                state: branch.state
            })),
            leadContactDTO: leadContacts.map(contact => ({
                aniversary: contact.dob || '',
                branchName: contact.branchName || '',
                designation: contact.designation,
                dob: contact.dob || '',
                email: contact.email,
                mobileNo: contact.mobileNo,
                name: contact.name,
                preferedContact: contact.preferredContact ? 1 : 0,
                workAniversaryDate: contact.workAnniversaryDate || ''
            }))
        };

        try {
            const response = await apiCalls('put', '/transaction/createUpdateLead', payload);
            if (response.status) {
                showToast('success', editId ? 'Lead updated successfully' : 'Lead created successfully');
                handleClear();
                getAllLeads();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            showToast('error', 'Failed to save lead: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            address: '',
            branch: '',
            branchCode: '',
            cancelRemarks: '',
            city: '',
            clientName: '',
            clientType: '',
            contactNo: '',
            country: '',
            customer: '',
            finYear: '2025',
            industry: '',
            mail: '',
            pinCode: '',
            source: '',
            state: '',
            website: '',
        });

        setFieldErrors({
            clientName: '',
            clientType: '',
            contactNo: '',
            mail: '',
            industry: '',
            source: '',
        });

        setLeadBranches([{
            address: '',
            branch: '',
            branchCode: '',
            city: '',
            country: '',
            gstNo: '',
            state: ''
        }]);

        setLeadContacts([{
            branchName: '',
            designation: '',
            dob: '',
            email: '',
            mobileNo: '',
            name: '',
            preferredContact: false,
            workAnniversaryDate: ''
        }]);

        setEditId('');
        getLeadDocId();
    };

    const handleAddBranch = () => {
        const lastBranch = leadBranches[leadBranches.length - 1];

        if (!lastBranch.branch || !lastBranch.branchCode || !lastBranch.address ||
            !lastBranch.city || !lastBranch.country || !lastBranch.state) {
            const newErrors = [...branchErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                branch: !lastBranch.branch ? 'Branch is required' : '',
                branchCode: !lastBranch.branchCode ? 'Branch code is required' : '',
                address: !lastBranch.address ? 'Address is required' : '',
                city: !lastBranch.city ? 'City is required' : '',
                country: !lastBranch.country ? 'Country is required' : '',
                state: !lastBranch.state ? 'State is required' : ''
            };
            setBranchErrors(newErrors);
            showToast('warning', 'Please fill current branch before adding new');
            return;
        }

        setLeadBranches((prev) => [...prev, {
            address: '',
            branch: '',
            branchCode: '',
            city: '',
            country: '',
            gstNo: '',
            state: ''
        }]);

        setBranchErrors((prev) => [...prev, {
            branch: '',
            branchCode: '',
            address: '',
            city: '',
            country: '',
            state: ''
        }]);
    };

    const handleDeleteBranch = (index) => {
        if (leadBranches.length <= 1) {
            showToast('warning', 'At least one branch is required');
            return;
        }

        const newBranches = leadBranches.filter((_, i) => i !== index);
        const newErrors = branchErrors.filter((_, i) => i !== index);

        setLeadBranches(newBranches);
        setBranchErrors(newErrors);
    };

    const handleBranchChange = (index, field, value) => {
        const newBranches = [...leadBranches];
        newBranches[index] = { ...newBranches[index], [field]: value };
        setLeadBranches(newBranches);

        if (value) {
            const newErrors = [...branchErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setBranchErrors(newErrors);
        }
    };

    const handleAddContact = () => {
        const lastContact = leadContacts[leadContacts.length - 1];

        if (!lastContact.name || !lastContact.mobileNo || !lastContact.email || !lastContact.designation) {
            const newErrors = [...contactErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                name: !lastContact.name ? 'Name is required' : '',
                mobileNo: !lastContact.mobileNo ? 'Mobile number is required' : '',
                email: !lastContact.email ? 'Email is required' : '',
                designation: !lastContact.designation ? 'Designation is required' : ''
            };
            setContactErrors(newErrors);
            showToast('warning', 'Please fill current contact before adding new');
            return;
        }

        setLeadContacts((prev) => [...prev, {
            branchName: '',
            designation: '',
            dob: '',
            email: '',
            mobileNo: '',
            name: '',
            preferredContact: false,
            workAnniversaryDate: ''
        }]);

        setContactErrors((prev) => [...prev, {
            name: '',
            mobileNo: '',
            email: '',
            designation: ''
        }]);
    };

    const handleDeleteContact = (index) => {
        if (leadContacts.length <= 1) {
            showToast('warning', 'At least one contact is required');
            return;
        }

        const newContacts = leadContacts.filter((_, i) => i !== index);
        const newErrors = contactErrors.filter((_, i) => i !== index);

        setLeadContacts(newContacts);
        setContactErrors(newErrors);
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...leadContacts];
        newContacts[index] = {
            ...newContacts[index],
            [field]: value
        };
        setLeadContacts(newContacts);
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
                        <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">
                                {/* Lead ID */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Lead ID"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        disabled
                                        name="leadDocId"
                                        value={isDocIdLoading ? "Generating..." : docId}
                                        InputProps={{
                                            style: { backgroundColor: '#f5f5f5' }
                                        }}
                                    />
                                </div>

                                {/* Source */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Source *</InputLabel>
                                        <Select
                                            label="Source *"
                                            name="source"
                                            value={formData.source}
                                            onChange={handleInputChange}
                                            error={!!fieldErrors.source}
                                        >
                                            {sources.map((source) => (
                                                <MenuItem key={source} value={source}>{source}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Client Type */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Client Type *</InputLabel>
                                        <Select
                                            label="Client Type *"
                                            name="clientType"
                                            value={formData.clientType}
                                            onChange={handleInputChange}
                                            error={!!fieldErrors.clientType}
                                        >
                                            {clientTypes.map((type) => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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

                                {/* Email */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Email *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="mail"
                                        value={formData.mail}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.mail}
                                        helperText={fieldErrors.mail}
                                        onBlur={(e) => validateMainField('mail', e.target.value)}
                                    />
                                </div>

                                {/* Contact No */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Contact No *"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="contactNo"
                                        value={formData.contactNo}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.contactNo}
                                        helperText={fieldErrors.contactNo}
                                        onBlur={(e) => validateMainField('contactNo', e.target.value)}
                                    />
                                </div>

                                {/* Industry */}
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Industry *</InputLabel>
                                        <Select
                                            label="Industry *"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleInputChange}
                                            error={!!fieldErrors.industry}
                                        >
                                            {industries.map((industry) => (
                                                <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Website */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Website"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* City */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="City"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* State */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="State"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Country */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Country"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* PIN Code */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="PIN Code"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="pinCode"
                                        value={formData.pinCode}
                                        onChange={handleInputChange}
                                        type="number"
                                    />
                                </div>

                                {/* Customer */}
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Customer"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleInputChange}
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
                                    />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                        <Tab value={0} label="Branches" />
                                        <Tab value={1} label="Contacts" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add Branch" icon={AddIcon} onClick={handleAddBranch} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>S.No</th>
                                                                    <th className="px-2 py-2 text-white text-center">Branch *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Branch Code *</th>
                                                                    <th className="px-2 py-2 text-white text-center">GST No</th>
                                                                    <th className="px-2 py-2 text-white text-center">City *</th>
                                                                    <th className="px-2 py-2 text-white text-center">State *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Country *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Address *</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {leadBranches.map((branch, index) => (
                                                                    <tr key={index}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteBranch(index)} />
                                                                        </td>
                                                                        <td className="text-center pt-3">{index + 1}</td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.branch}
                                                                                onChange={(e) => handleBranchChange(index, 'branch', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'branch', e.target.value)}
                                                                                error={!!branchErrors[index]?.branch}
                                                                                helperText={branchErrors[index]?.branch}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.branchCode}
                                                                                onChange={(e) => handleBranchChange(index, 'branchCode', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'branchCode', e.target.value)}
                                                                                error={!!branchErrors[index]?.branchCode}
                                                                                helperText={branchErrors[index]?.branchCode}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.gstNo}
                                                                                onChange={(e) => handleBranchChange(index, 'gstNo', e.target.value)}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.city}
                                                                                onChange={(e) => handleBranchChange(index, 'city', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'city', e.target.value)}
                                                                                error={!!branchErrors[index]?.city}
                                                                                helperText={branchErrors[index]?.city}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.state}
                                                                                onChange={(e) => handleBranchChange(index, 'state', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'state', e.target.value)}
                                                                                error={!!branchErrors[index]?.state}
                                                                                helperText={branchErrors[index]?.state}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.country}
                                                                                onChange={(e) => handleBranchChange(index, 'country', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'country', e.target.value)}
                                                                                error={!!branchErrors[index]?.country}
                                                                                helperText={branchErrors[index]?.country}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.address}
                                                                                onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'address', e.target.value)}
                                                                                error={!!branchErrors[index]?.address}
                                                                                helperText={branchErrors[index]?.address}
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
                                    )}

                                    {value === 1 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add Contact" icon={AddIcon} onClick={handleAddContact} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>S.No</th>
                                                                    <th className="px-2 py-2 text-white text-center">Preferred Contact</th>
                                                                    <th className="px-2 py-2 text-white text-center">Branch Name</th>
                                                                    <th className="px-2 py-2 text-white text-center">Name *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Mobile No *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Email *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Designation *</th>
                                                                    <th className="px-2 py-2 text-white text-center">Date of Birth</th>
                                                                    <th className="px-2 py-2 text-white text-center">Work Anniversary</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {leadContacts.map((contact, index) => (
                                                                    <tr key={index}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteContact(index)} />
                                                                        </td>
                                                                        <td className="text-center pt-3">{index + 1}</td>

                                                                        <td className="text-center">
                                                                            <FormControlLabel
                                                                                control={
                                                                                    <Checkbox
                                                                                        checked={contact.preferredContact}
                                                                                        onChange={(e) => handleContactChange(index, 'preferredContact', e.target.checked)}
                                                                                    />
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={contact.branchName}
                                                                                onChange={(e) => handleContactChange(index, 'branchName', e.target.value)}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={contact.name}
                                                                                onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                                                onBlur={(e) => validateContactField(index, 'name', e.target.value)}
                                                                                error={!!contactErrors[index]?.name}
                                                                                helperText={contactErrors[index]?.name}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={contact.mobileNo}
                                                                                onChange={(e) => handleContactChange(index, 'mobileNo', e.target.value)}
                                                                                onBlur={(e) => validateContactField(index, 'mobileNo', e.target.value)}
                                                                                error={!!contactErrors[index]?.mobileNo}
                                                                                helperText={contactErrors[index]?.mobileNo}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={contact.email}
                                                                                onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                                                onBlur={(e) => validateContactField(index, 'email', e.target.value)}
                                                                                error={!!contactErrors[index]?.email}
                                                                                helperText={contactErrors[index]?.email}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={contact.designation}
                                                                                onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                                                                                onBlur={(e) => validateContactField(index, 'designation', e.target.value)}
                                                                                error={!!contactErrors[index]?.designation}
                                                                                helperText={contactErrors[index]?.designation}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                type="date"
                                                                                value={contact.dob || ''}
                                                                                onChange={(e) => handleContactChange(index, 'dob', e.target.value)}
                                                                                InputLabelProps={{ shrink: true }}
                                                                            />
                                                                        </td>

                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                type="date"
                                                                                value={contact.workAnniversaryDate || ''}
                                                                                onChange={(e) => handleContactChange(index, 'workAnniversaryDate', e.target.value)}
                                                                                InputLabelProps={{ shrink: true }}
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
                                    )}
                                </Box>
                            </div>
                        </>
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getLeadById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Lead;
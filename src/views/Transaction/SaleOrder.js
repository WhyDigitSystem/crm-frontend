import React, { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';

export const SaleOrder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [finYear] = useState(new Date().getFullYear().toString());
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [clientTypeOptions] = useState(['Customer', 'Prospect', 'Vendor', 'Partner']);
    const [industryOptions] = useState(['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail']);
    const [sourceOptions] = useState(['Website', 'Referral', 'Social Media', 'Event', 'Cold Call', 'Email']);
    const [countryOptions] = useState(['India', 'USA', 'UK', 'Canada', 'Australia']);
    const [stateOptions] = useState(['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat']);
    const [tabValue, setTabValue] = useState(0);
    const [partyStateData, setPartyStateData] = useState([]);
    const [partyAddressData, setPartyAddressData] = useState([]);
    const [partyStateDataErrors, setPartyStateDataErrors] = useState([]);
    const [partyAddressDataErrors, setPartyAddressDataErrors] = useState([]);
    const [countryList, setCountryList] = useState([]);

    // Form structure for Lead
    const [formData, setFormData] = useState({
        clientName: '',
        contactNo: '',
        mail: '',
        website: '',
        industry: '',
        source: '',
        clientType: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
        companyLogo: '',
        cancelRemarks: '',
        branch: '',
        branchCode: '',
        active: true,
        // Child tables
        leadContactDTO: [{
            name: '',
            designation: '',
            mobileNo: '',
            email: '',
            dob: null,
            workAniversaryDate: null,
            aniversary: null,
            preferedContact: 0,
            branchName: ''
        }],
        leadBranchDTO: [{
            branch: '',
            branchCode: '',
            address: '',
            city: '',
            state: '',
            country: '',
            gstNo: ''
        }]
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactNo: '',
        branch: '',
        clientType: ''
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        getAllBranches();
        getAllLeads();
        fetchCountries();
    }, []);

    useEffect(() => {
        if (formData.branch && formData.branchCode && !editId) {
            getLeadDocId();
        }
    }, [formData.branch, formData.branchCode, editId]);

    const fetchCountries = async () => {
        try {
            // Replace with your actual API call to fetch countries
            const response = await apiCalls('get', '/master/getAllCountry');
            if (response.status) {
                setCountryList(response.paramObjectsMap.countryVOs);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            showToast('error', 'Failed to load countries');
        }
    };

    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchList(branchData);
            if (branchData.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    branch: branchData[0].branch,
                    branchCode: branchData[0].branchCode
                }));
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    const getAllLeads = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getAllLeadByOrgId?orgId=${orgId}`
            );

            if (response.status === true) {
                setListViewData(response.paramObjectsMap.leadVO);
            } else {
                showToast('error', response.message || 'Failed to fetch leads');
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast('error', 'Failed to fetch leads');
        }
    };

    const getLeadDocId = async () => {
        if (!formData.branch || !formData.branchCode) return;

        setIsDocIdLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/transaction/getLeadDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap.leadDocId) {
                setFormData(prev => ({
                    ...prev,
                    docId: response.paramObjectsMap.leadDocId
                }));
            }
        } catch (error) {
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getLeadById = async (id) => {
        try {
            const response = await apiCalls('get', `/transaction/getLeadById?id=${id}`);

            if (response.status === true) {
                const lead = response.paramObjectsMap.leadVO;
                setEditId(id);
                setListView(false);

                // Convert date strings to Dayjs objects for child tables
                const contactsWithDates = lead.leadContactDTO.map(contact => ({
                    ...contact,
                    dob: contact.dob ? dayjs(contact.dob) : null,
                    workAniversaryDate: contact.workAniversaryDate ? dayjs(contact.workAniversaryDate) : null,
                    aniversary: contact.aniversary ? dayjs(contact.aniversary) : null
                }));

                setFormData({
                    docId: lead.docId || '',
                    clientName: lead.clientName || '',
                    contactNo: lead.contactNo || '',
                    mail: lead.mail || '',
                    website: lead.website || '',
                    industry: lead.industry || '',
                    source: lead.source || '',
                    clientType: lead.clientType || '',
                    address: lead.address || '',
                    city: lead.city || '',
                    state: lead.state || '',
                    country: lead.country || '',
                    pinCode: lead.pinCode || '',
                    companyLogo: lead.companyLogo || '',
                    cancelRemarks: lead.cancelRemarks || '',
                    branch: lead.branch || '',
                    branchCode: lead.branchCode || '',
                    active: lead.active === "Active",
                    leadContactDTO: contactsWithDates || [{
                        name: '',
                        designation: '',
                        mobileNo: '',
                        email: '',
                        dob: null,
                        workAniversaryDate: null,
                        aniversary: null,
                        preferedContact: 0,
                        branchName: ''
                    }],
                    leadBranchDTO: lead.leadBranchDTO || [{
                        branch: '',
                        branchCode: '',
                        address: '',
                        city: '',
                        state: '',
                        country: '',
                        gstNo: ''
                    }]
                });

                // Initialize party state and address data
                if (lead.partyStateDTO) {
                    setPartyStateData(lead.partyStateDTO.map(item => ({
                        ...item,
                        stateOptions: [],
                        cityOptions: []
                    })));
                }
                if (lead.partyAddressDTO) {
                    setPartyAddressData(lead.partyAddressDTO.map(item => ({
                        ...item,
                        stateOptions: [],
                        cityOptions: []
                    })));
                }
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch lead details');
            }
        } catch (error) {
            console.error('Error fetching lead details:', error);
            showToast('error', 'Failed to fetch lead details');
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

    // Child table handlers
    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...formData.leadContactDTO];
        updatedContacts[index][field] = value;
        setFormData(prev => ({
            ...prev,
            leadContactDTO: updatedContacts
        }));
    };

    const handleBranchChangeChild = (index, field, value) => {
        const updatedBranches = [...formData.leadBranchDTO];
        updatedBranches[index][field] = value;
        setFormData(prev => ({
            ...prev,
            leadBranchDTO: updatedBranches
        }));
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            leadContactDTO: [
                ...prev.leadContactDTO,
                {
                    name: '',
                    designation: '',
                    mobileNo: '',
                    email: '',
                    dob: null,
                    workAniversaryDate: null,
                    aniversary: null,
                    preferedContact: 0,
                    branchName: ''
                }
            ]
        }));
    };

    const addBranch = () => {
        setFormData(prev => ({
            ...prev,
            leadBranchDTO: [
                ...prev.leadBranchDTO,
                {
                    branch: '',
                    branchCode: '',
                    address: '',
                    city: '',
                    state: '',
                    country: '',
                    gstNo: ''
                }
            ]
        }));
    };

    const removeContact = (index) => {
        if (formData.leadContactDTO.length <= 1) return;
        const updatedContacts = [...formData.leadContactDTO];
        updatedContacts.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            leadContactDTO: updatedContacts
        }));
    };

    const removeBranch = (index) => {
        if (formData.leadBranchDTO.length <= 1) return;
        const updatedBranches = [...formData.leadBranchDTO];
        updatedBranches.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            leadBranchDTO: updatedBranches
        }));
    };

    const handleClear = () => {
        const firstBranch = branchList[0] || null;
        setFormData({
            clientName: '',
            contactNo: '',
            mail: '',
            website: '',
            industry: '',
            source: '',
            clientType: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pinCode: '',
            companyLogo: '',
            cancelRemarks: '',
            branch: firstBranch ? firstBranch.branch : '',
            branchCode: firstBranch ? firstBranch.branchCode : '',
            active: true,
            leadContactDTO: [{
                name: '',
                designation: '',
                mobileNo: '',
                email: '',
                dob: null,
                workAniversaryDate: null,
                aniversary: null,
                preferedContact: 0,
                branchName: ''
            }],
            leadBranchDTO: [{
                branch: '',
                branchCode: '',
                address: '',
                city: '',
                state: '',
                country: '',
                gstNo: ''
            }]
        });
        setEditId('');
        setFieldErrors({});
        setPartyStateData([]);
        setPartyAddressData([]);
    };

    const handleSave = async () => {
        // Validation
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactNo) errors.contactNo = 'Contact number is required';
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.clientType) errors.clientType = 'Client type is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fix the validation errors');
            return;
        }

        setIsLoading(true);

        // Prepare API payload
        const payload = {
            ...formData,
            ...(editId && { id: editId }),
            finYear: finYear,
            createdBy: loginUserName,
            orgId: parseInt(orgId),
            contactNo: formData.contactNo ? parseInt(formData.contactNo) : 0,
            pinCode: formData.pinCode ? parseInt(formData.pinCode) : 0,
            // Format dates for child tables
            leadContactDTO: formData.leadContactDTO.map(contact => ({
                ...contact,
                dob: contact.dob ? contact.dob.format('YYYY-MM-DD') : null,
                workAniversaryDate: contact.workAniversaryDate ? contact.workAniversaryDate.format('YYYY-MM-DD') : null,
                aniversary: contact.aniversary ? contact.aniversary.format('YYYY-MM-DD') : null
            })),
            partyStateDTO: partyStateData,
            partyAddressDTO: partyAddressData
        };

        try {
            const response = await apiCalls('put', '/transaction/createUpdateLead', payload);

            if (response.status === true) {
                showToast('success', editId ? 'Lead updated successfully' : 'Lead created successfully');
                handleClear();
                getAllLeads();
            } else {
                showToast('error', response.paramObjectsMap.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving lead:', error);
            showToast('error', 'Failed to save lead');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddRowPartyState = () => {
        setPartyStateData([
            ...partyStateData,
            {
                id: Date.now(),
                country: '',
                state: '',
                stateCode: '',
                stateNo: '',
                gstIn: '',
                contactPerson: '',
                contactPhoneNo: '',
                email: '',
                stateOptions: [],
                cityOptions: []
            }
        ]);
        setPartyStateDataErrors([...partyStateDataErrors, {}]);
    };

    const handleAddRowPartyAddress = () => {
        setPartyAddressData([
            ...partyAddressData,
            {
                id: Date.now(),
                country: '',
                state: '',
                city: '',
                businessPlace: '',
                stateGstIn: '',
                addressType: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                pincode: '',
                contact: '',
                stateOptions: [],
                cityOptions: []
            }
        ]);
        setPartyAddressDataErrors([...partyAddressDataErrors, {}]);
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

    const handleCountryChange = async (row, index, e) => {
        const countryName = e.target.value;
        const newPartyStateData = [...partyStateData];
        newPartyStateData[index] = {
            ...newPartyStateData[index],
            country: countryName,
            state: '',
            stateCode: '',
            stateNo: '',
            stateOptions: []
        };
        setPartyStateData(newPartyStateData);

        // Fetch states for selected country
        if (countryName) {
            try {
                const response = await apiCalls('get', `/master/getAllStateByCountryName?countryName=${countryName}`);
                if (response.status) {
                    newPartyStateData[index].stateOptions = response.paramObjectsMap.stateVOs;
                    setPartyStateData([...newPartyStateData]);
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        }
    };

    const handleStateChange = (newValue, index) => {
        const newPartyStateData = [...partyStateData];
        newPartyStateData[index] = {
            ...newPartyStateData[index],
            state: newValue.stateName,
            stateCode: newValue.stateCode,
            stateNo: newValue.stateNo
        };
        setPartyStateData(newPartyStateData);
    };

    const handleCountryPartyAddress = async (row, index, e) => {
        const countryName = e.target.value;
        const newPartyAddressData = [...partyAddressData];
        newPartyAddressData[index] = {
            ...newPartyAddressData[index],
            country: countryName,
            state: '',
            city: '',
            stateOptions: []
        };
        setPartyAddressData(newPartyAddressData);

        // Fetch states for selected country
        if (countryName) {
            try {
                const response = await apiCalls('get', `/master/getAllStateByCountryName?countryName=${countryName}`);
                if (response.status) {
                    newPartyAddressData[index].stateOptions = response.paramObjectsMap.stateVOs;
                    setPartyAddressData([...newPartyAddressData]);
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        }
    };

    const handleStatePartyAddress = async (newValue, index) => {
        const newPartyAddressData = [...partyAddressData];
        newPartyAddressData[index] = {
            ...newPartyAddressData[index],
            state: newValue.stateName,
            city: '',
            cityOptions: []
        };
        setPartyAddressData(newPartyAddressData);

        // Fetch cities for selected state
        if (newValue.stateName) {
            try {
                const response = await apiCalls('get', `/master/getAllCityByStateName?stateName=${newValue.stateName}`);
                if (response.status) {
                    newPartyAddressData[index].cityOptions = response.paramObjectsMap.cityVOs;
                    setPartyAddressData([...newPartyAddressData]);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
    };

    const handleCityPartyAddress = (newValue, index) => {
        const newPartyAddressData = [...partyAddressData];
        newPartyAddressData[index] = {
            ...newPartyAddressData[index],
            city: newValue.cityName
        };
        setPartyAddressData(newPartyAddressData);
    };

    const handleDateChange = (field, date) => {
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
        setFormData(prev => ({ ...prev, [field]: formattedDate }));
    };

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc ID', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'contactNo', header: 'Contact', size: 150 },
        { accessorKey: 'mail', header: 'Email', size: 200 },
        { accessorKey: 'clientType', header: 'Type', size: 120 },
        { accessorKey: 'industry', header: 'Industry', size: 150 },
        { accessorKey: 'source', header: 'Source', size: 130 },
        { accessorKey: 'branch', header: 'Branch', size: 150 },
        { accessorKey: 'active', header: 'Active', size: 100 },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton
                            title="Save"
                            icon={SaveIcon}
                            isLoading={isLoading}
                            onClick={handleSave}
                            margin="0 10px 0 10px"
                        />
                    </div>
                </div>

                {listView ? (
                    <div className="">
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            blockEdit={true}
                            toEdit={(row) => getLeadById(row.original.id)}
                        />
                    </div>
                ) : (
                    <div className="row">
                        {/* Sales ID */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Sales ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled
                                name="docId"
                                value={isDocIdLoading ? "Generating..." : formData.docId || ''}
                                InputProps={{
                                    style: { backgroundColor: '#f5f5f5' }
                                }}
                            />
                        </div>

                        {/* Meeting Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="SaleOrder Date *"
                                        value={formData.meetingDate ? dayjs(formData.meetingDate, 'YYYY-MM-DD') : null}
                                        onChange={(date) => handleDateChange('meetingDate', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.meetingDate,
                                                helperText: fieldErrors.meetingDate
                                            }
                                        }}
                                        format="DD-MM-YYYY"
                                        disabled
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Source */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="clientName"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleInputChange}
                                error={!!fieldErrors.clientName}
                                helperText={fieldErrors.clientName}
                            />
                        </div>

                        {/* Client Type */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.clientType}>
                                <InputLabel id="clientType-label">Branch Type *</InputLabel>
                                <Select
                                    labelId="clientType-label"
                                    label="Branch Type *"
                                    value={formData.clientType}
                                    onChange={handleInputChange}
                                    name="clientType"
                                >
                                    {clientTypeOptions.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.clientType && <FormHelperText>{fieldErrors.clientType}</FormHelperText>}
                            </FormControl>
                        </div>

                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.clientType}>
                                <InputLabel id="clientType-label">Oppurtunity Name</InputLabel>
                                <Select
                                    labelId="clientType-label"
                                    label="Oppurtunity Name"
                                    value={formData.clientType}
                                    onChange={handleInputChange}
                                    name="clientType"
                                >
                                    {clientTypeOptions.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.clientType && <FormHelperText>{fieldErrors.clientType}</FormHelperText>}
                            </FormControl>
                        </div>

                        {/* Client Name */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Oppurtunity Id *"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleInputChange}
                                error={!!fieldErrors.clientName}
                                helperText={fieldErrors.clientName}
                            />
                        </div>

                        {/* Contact Number */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Contact Number *"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.contactNo}
                                helperText={fieldErrors.contactNo}
                                inputProps={{ maxLength: 10 }}
                            />
                        </div>

                        {/* Contact Number */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Mobile Number *"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.contactNo}
                                helperText={fieldErrors.contactNo}
                                inputProps={{ maxLength: 10 }}
                            />
                        </div>

                        {/* Email */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Email"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={!!fieldErrors.email}
                                helperText={fieldErrors.email}
                            />
                        </div>

                        
                        

                        {/* Website */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="GST No"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                        </div>


                        {/* Pin Code */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Pin Code"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 6 }}
                            />
                        </div>


                        {/* Customer */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth>
                                <InputLabel id="source-label">Customer</InputLabel>
                                <Select
                                    labelId="source-label"
                                    label="Customer"
                                    value={formData.source}
                                    onChange={handleInputChange}
                                    name="source"
                                >
                                    {sourceOptions.map((source) => (
                                        <MenuItem key={source} value={source}>
                                            {source}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        {/* Address */}
                        <div className="col-md-6 mb-3">
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

                        {/* Tabs for Party State and Address */}
                        <div className="row mt-2">
                            <Box sx={{ width: '100%' }}>
                                <Tabs value={tabValue} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
                                    <Tab label="SaleOrder Order Price" />
                                    <Tab label="Summary" />
                                </Tabs>
                            </Box>
                            <Box sx={{ padding: 2 }}>
                                {tabValue === 0 && (
                                    <div className="row d-flex ml">
                                        <div className="">
                                            <ActionButton title="Add" icon={AddCircleOutlineIcon} onClick={handleAddRowPartyState} />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#673AB7' }}>
                                                                <th className="table-header">Action</th>
                                                                <th className="table-header">SNo</th>
                                                                <th className="table-header">Branch</th>
                                                                <th className="table-header">GST No</th>
                                                                <th className="table-header">City</th>
                                                                <th className="table-header">State</th>
                                                                <th className="table-header">Country</th>
                                                                <th className="table-header">Address</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {partyStateData.map((row, index) => (
                                                                <tr key={row.id}>
                                                                    <td className="border px-2 py-2 text-center">
                                                                        <ActionButton
                                                                            title="Delete"
                                                                            icon={DeleteOutlineIcon}
                                                                            onClick={() => handleDeleteRow(
                                                                                row.id,
                                                                                partyStateData,
                                                                                setPartyStateData,
                                                                                partyStateDataErrors,
                                                                                setPartyStateDataErrors
                                                                            )}
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="pt-2">{index + 1}</div>
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.country}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => handleCountryChange(row, index, e)}
                                                                            className={partyStateDataErrors[index]?.country ? 'error form-control' : 'form-control'}
                                                                        >
                                                                            <option value="">Select Country</option>
                                                                            {countryList?.map((country) => (
                                                                                <option key={country.id} value={country.countryName}>
                                                                                    {country.countryName}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {partyStateDataErrors[index]?.country && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyStateDataErrors[index].country}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <Autocomplete
                                                                            options={row.stateOptions || []}
                                                                            getOptionLabel={(option) => option.stateName || ''}
                                                                            disableClearable
                                                                            sx={{ width: '200px' }}
                                                                            value={
                                                                                row.stateOptions?.find(
                                                                                    (option) => option.stateName === row.state
                                                                                ) || null
                                                                            }
                                                                            onChange={(event, newValue) => {
                                                                                handleStateChange(newValue, index);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    placeholder="Select State"
                                                                                    size="small"
                                                                                    error={!!partyStateDataErrors[index]?.state}
                                                                                    helperText={partyStateDataErrors[index]?.state}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.stateCode}
                                                                            style={{ width: '150px' }}
                                                                            maxLength={3}
                                                                            disabled
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, stateCode: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        stateCode: !value ? 'State Code is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.stateCode ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.stateCode && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].stateCode}</div>
                                                                        )}
                                                                    </td>

                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="number"
                                                                            value={row.stateNo}
                                                                            style={{ width: '150px' }}
                                                                            disabled
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, stateNo: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        stateNo: !value ? 'State No is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.stateNo ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.stateNo && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].stateNo}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.gstIn}
                                                                            style={{ width: '150px' }}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) => prev.map((r) => (r.id === row.id ? { ...r, gstIn: value } : r)));
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = { ...newErrors[index], gstIn: !value ? 'Reg No is required' : '' };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.gstIn ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.gstIn && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].gstIn}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.contactPerson}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyStateData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, contactPerson: value } : r))
                                                                                );
                                                                                setPartyStateDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        contactPerson: !value ? 'Contact Person is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyStateDataErrors[index]?.contactPerson ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyStateDataErrors[index]?.contactPerson && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyStateDataErrors[index].contactPerson}</div>
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
                                )}
                                {tabValue === 1 && (
                                    <div className="row d-flex ml">
                                        <div className="">
                                            <ActionButton title="Add" icon={AddCircleOutlineIcon} onClick={handleAddRowPartyAddress} />
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-lg-12">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#673AB7' }}>
                                                                <th className="table-header">Action</th>
                                                                <th className="table-header">SNo</th>
                                                                <th className="table-header">prefered Contact</th>
                                                                <th className="table-header">Branch Name</th>
                                                                <th className="table-header">Name</th>
                                                                <th className="table-header">Mobile</th>
                                                                <th className="table-header">Email</th>
                                                                <th className="table-header">designation</th>
                                                                <th className="table-header">DOB</th>
                                                                <th className="table-header">Anniversary Date</th>
                                                                <th className="table-header">Work Anniversary Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {partyAddressData.map((row, index) => (
                                                                <tr key={row.id}>
                                                                    <td className="border px-2 py-2 text-center">
                                                                        <ActionButton
                                                                            title="Delete"
                                                                            icon={DeleteOutlineIcon}
                                                                            onClick={() => handleDeleteRow(
                                                                                row.id,
                                                                                partyAddressData,
                                                                                setPartyAddressData,
                                                                                partyAddressDataErrors,
                                                                                setPartyAddressDataErrors
                                                                            )}
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <div className="pt-2">{index + 1}</div>
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <select
                                                                            value={row.country}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => handleCountryPartyAddress(row, index, e)}
                                                                            className={partyAddressDataErrors[index]?.country ? 'error form-control' : 'form-control'}
                                                                        >
                                                                            <option value="">Select Country</option>
                                                                            {countryList?.map((country) => (
                                                                                <option key={country.id} value={country.countryName}>
                                                                                    {country.countryName}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {partyAddressDataErrors[index]?.country && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyAddressDataErrors[index].country}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <Autocomplete
                                                                            options={row.stateOptions || []}
                                                                            getOptionLabel={(option) => option.stateName || ''}
                                                                            disableClearable
                                                                            sx={{ width: '200px' }}
                                                                            value={
                                                                                row.stateOptions?.find(
                                                                                    (option) => option.stateName === row.state
                                                                                ) || null
                                                                            }
                                                                            onChange={(event, newValue) => {
                                                                                handleStatePartyAddress(newValue, index);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    placeholder="Select State"
                                                                                    size="small"
                                                                                    error={!!partyAddressDataErrors[index]?.state}
                                                                                    helperText={partyAddressDataErrors[index]?.state}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <Autocomplete
                                                                            options={row.cityOptions || []}
                                                                            sx={{ width: '150px' }}
                                                                            getOptionLabel={(option) => option.cityName || ''}
                                                                            disableClearable
                                                                            value={
                                                                                row.cityOptions?.find(
                                                                                    (option) => option.cityName === row.city
                                                                                ) || null
                                                                            }
                                                                            onChange={(event, newValue) => {
                                                                                handleCityPartyAddress(newValue, index);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    placeholder="Select City"
                                                                                    size="small"
                                                                                    error={!!partyAddressDataErrors[index]?.city}
                                                                                    helperText={partyAddressDataErrors[index]?.city}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.businessPlace}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, businessPlace: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        businessPlace: !value ? 'Business Place In is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.businessPlace ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.businessPlace && (
                                                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                                                {partyAddressDataErrors[index].businessPlace}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.stateGstIn}
                                                                            maxLength={15}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, stateGstIn: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        stateGstIn: !value ? 'State Gst In is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.stateGstIn ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.stateGstIn && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].stateGstIn}</div>
                                                                        )}
                                                                    </td>
                                                                 
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressLine2}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressLine2: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressLine2: !value ? 'Address Line2 is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressLine2 ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressLine2 && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressLine2}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.addressLine3}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) =>
                                                                                    prev.map((r) => (r.id === row.id ? { ...r, addressLine3: value } : r))
                                                                                );
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        addressLine3: !value ? 'Address Line3 is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.addressLine3 ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.addressLine3 && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].addressLine3}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.pincode}
                                                                            style={{ width: '150px' }}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;

                                                                                if (/^\d{0,6}$/.test(value)) {
                                                                                    setPartyAddressData((prev) => prev.map((r) => (r.id === row.id ? { ...r, pincode: value } : r)));

                                                                                    setPartyAddressDataErrors((prev) => {
                                                                                        const newErrors = [...prev];
                                                                                        newErrors[index] = {
                                                                                            ...newErrors[index],
                                                                                            pincode: !value
                                                                                                ? 'Pin Code is required'
                                                                                                : value.length !== 6
                                                                                                    ? 'Pin Code must be exactly 6 digits'
                                                                                                    : ''
                                                                                        };
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            maxLength="6"
                                                                            className={partyAddressDataErrors[index]?.pincode ? 'error form-control' : 'form-control'}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.pincode && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].pincode}</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="border px-2 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={row.contact}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setPartyAddressData((prev) => prev.map((r) => (r.id === row.id ? { ...r, contact: value } : r)));
                                                                                setPartyAddressDataErrors((prev) => {
                                                                                    const newErrors = [...prev];
                                                                                    newErrors[index] = {
                                                                                        ...newErrors[index],
                                                                                        contact: !value ? 'Contact is required' : ''
                                                                                    };
                                                                                    return newErrors;
                                                                                });
                                                                            }}
                                                                            className={partyAddressDataErrors[index]?.contact ? 'error form-control' : 'form-control'}
                                                                            style={{ width: '150px' }}
                                                                        />
                                                                        {partyAddressDataErrors[index]?.contact && (
                                                                            <div style={{ color: 'red', fontSize: '12px' }}>{partyAddressDataErrors[index].contact}</div>
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
                                )}
                            </Box>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </LocalizationProvider>
    );
};

export default SaleOrder;
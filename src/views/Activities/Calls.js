import React, { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
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

export const Calls = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [branchcode] = useState(localStorage.getItem('branchcode'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);

    // Status and Direction options
    const statusOptions = ['Planned', 'Held', 'Not Held', 'Re-Schedule'];
    const directionOptions = ['Call Received', 'Call Made'];

    const [clientOptions, setClientOptions] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [contactOptions, setContactOptions] = useState([]);
    const [isClientLoading, setIsClientLoading] = useState(false);
    const [isBranchLoading, setIsBranchLoading] = useState(false);
    const [isContactLoading, setIsContactLoading] = useState(false);
    const [isParentLoading, setIsParentLoading] = useState(false);

    const [parentOptions, setParentOptions] = useState([]);
    const isCreating = editId === undefined || editId === null || editId === '';

    const [formData, setFormData] = useState({
        callDocId: '',
        calldate: dayjs().format('YYYY-MM-DD'),
        clientName: '',
        contactName: '',
        email: '',
        mobile: '',
        Parent: '',
        branch: branch || '',
        branchCode: branchcode || '',
        dateStart: null,
        timeStart: '',
        dateEnd: null,
        timeEnd: '',
        duration: '',
        description: '',
        direction: '',
        status: '',
        followUpDate: null,
        active: true
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        email: '',
        mobile: '',
        Parent: '',
        branch: '',
        dateStart: '',
        timeStart: '',
        status: '',
        direction: ''
    });

    const isValidTime = (value) => {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '';
        if (!isValidTime(startTime)) return 'Invalid start time';
        if (!isValidTime(endTime)) return 'Invalid end time';

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes < startTotalMinutes) {
            return 'End time before start';
        }

        const diffMinutes = endTotalMinutes - startTotalMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        getAllBranches();
        fetchClientOptions();
        getCallDocId();
    }, []);

    // useEffect(() => {
    //     if (formData.branch || formData.branchCode || isCreating) {
    //         getCallDocId();
    //     }
    // }, [formData.branch, formData.branchCode, isCreating]);

    useEffect(() => {
        if (formData.branchCode) {
            getAllCalls();
        }
    }, [formData.branchCode]);

    useEffect(() => {
        if (formData.clientName) {
            fetchParentOptions(formData.clientName);
        } else {
            setParentOptions([]);
        }
    }, [formData.clientName]);

    useEffect(() => {
        if (formData.timeStart && formData.timeEnd) {
            const duration = calculateDuration(formData.timeStart, formData.timeEnd);
            setFormData(prev => ({ ...prev, duration }));
        } else if (!formData.timeStart || !formData.timeEnd) {
            setFormData(prev => ({ ...prev, duration: '' }));
        }
    }, [formData.timeStart, formData.timeEnd]);

    const fetchClientOptions = async () => {
        setIsClientLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getClientNameFromLead?orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.clientName) {
                setClientOptions(response.paramObjectsMap.clientName);
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast('error', 'Failed to fetch clients');
        } finally {
            setIsClientLoading(false);
        }
    };

    const fetchParentOptions = async (clientName) => {
        setIsParentLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getParentFromLead?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.parentName) {
                setParentOptions(response.paramObjectsMap.parentName.map(p => ({
                    label: p.parent,
                    value: p.parent
                })));
            } else {
                setParentOptions([]);
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch parent options');
            }
        } catch (error) {
            console.error('Error fetching parent options:', error);
            showToast('error', 'Failed to fetch parent options');
            setParentOptions([]);
        } finally {
            setIsParentLoading(false);
        }
    };

    const fetchBranchOptions = async (clientName) => {
        if (!clientName) return;

        setIsBranchLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getBranchNameFromLeadFillGrid?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.branchName) {
                setBranchOptions(response.paramObjectsMap.branchName);
            } else {
                setBranchOptions([]);
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch branches');
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to fetch branches');
            setBranchOptions([]);
        } finally {
            setIsBranchLoading(false);
        }
    };

    const fetchContactOptions = async (clientName, branchName) => {
        if (!clientName || !branchName) return;

        setIsContactLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getContactNameFromLeadFillGrid?branchName=${encodeURIComponent(branchName)}&clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.contactDetails) {
                setContactOptions(response.paramObjectsMap.contactDetails);
            } else {
                setContactOptions([]);
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('error', 'Failed to fetch contacts');
            setContactOptions([]);
        } finally {
            setIsContactLoading(false);
        }
    };

    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchList(branchData);
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    const getAllCalls = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/ncontroller/getAllCallsByOrgId?branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true) {
                setListViewData(response.paramObjectsMap.callsVO || []);
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch calls');
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
            showToast('error', 'Failed to fetch calls');
        }
    };

    const getCallDocId = async () => {
        // if (!formData.branch || !formData.branchCode) return;

        setIsDocIdLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getCallsDocId?branch=${formData.branch}&branchCode=${branchcode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap.callsDocId) {
                setFormData(prev => ({
                    ...prev,
                    callDocId: response.paramObjectsMap.callsDocId
                }));
            }
        } catch (error) {
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getCallById = async (id) => {
        try {
            const response = await apiCalls('get', `/ncontroller/getCallsyById?id=${id}`);

            if (response.status === true) {
                const call = response.paramObjectsMap.callsVO;
                setEditId(id);
                setListView(false);

                setFormData({
                    callDocId: call.docId || '',
                    calldate: call.docDate || null,
                    clientName: call.clientName || '',
                    contactName: call.contactName || '',
                    email: call.email || '',
                    mobile: call.mobile ? call.mobile.toString() : '',
                    Parent: call.parent || '',
                    branch: call.branch || '',
                    branchCode: call.branchCode || '',
                    dateStart: call.dateStart || null,
                    timeStart: call.timeStart ? call.timeStart.substring(0, 5) : '',
                    dateEnd: call.dateEnd || null,
                    timeEnd: call.timeEnd ? call.timeEnd.substring(0, 5) : '',
                    duration: call.duratrion || '',
                    description: call.description || '',
                    direction: call.direction || '',
                    status: call.status || '',
                    followUpDate: call.follwUpDate || null,
                    active: call.active === "Active"
                });
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch call details');
            }
        } catch (error) {
            console.error('Error fetching call details:', error);
            showToast('error', 'Failed to fetch call details');
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
        } else if (name === 'timeStart' && value && !isValidTime(value)) {
            errorMessage = 'Invalid time format (HH:mm required)';
        } else if (name === 'timeEnd' && value && !isValidTime(value)) {
            errorMessage = 'Invalid time format (HH:mm required)';
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

    const handleClientSelect = (event, newValue) => {
        const clientName = newValue ? newValue.clientName : '';

        setFormData(prev => ({
            ...prev,
            clientName: clientName,
            branch: '',
            contactName: '',
            email: '',
            mobile: '',
            Parent: ''
        }));

        if (clientName) {
            fetchBranchOptions(clientName);
        } else {
            setBranchOptions([]);
            setContactOptions([]);
            setParentOptions([]);
        }
    };

    const handleBranchSelect = (event, newValue) => {
        const branchName = newValue ? newValue.branch : '';

        setFormData(prev => ({
            ...prev,
            branch: branchName,
            contactName: '',
            email: '',
            mobile: ''
        }));

        if (branchName && formData.clientName) {
            fetchContactOptions(formData.clientName, branchName);
        } else {
            setContactOptions([]);
        }
    };

    const handleContactSelect = (event, newValue) => {
        if (newValue) {
            const cleanMobile = newValue.mobileNumber ?
                newValue.mobileNumber.replace(/\D/g, '').substring(0, 10) : '';

            setFormData(prev => ({
                ...prev,
                contactName: newValue.name || '',
                email: newValue.email || '',
                mobile: cleanMobile
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                contactName: '',
                email: '',
                mobile: ''
            }));
        }
    };

    const handleDateChange = (field, date) => {
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
        setFormData(prev => ({ ...prev, [field]: formattedDate }));
    };

    const handleClear = () => {
        const firstBranch = branchList[0] || null;
        setFormData({
            // callDocId: '',
            calldate: dayjs().format('YYYY-MM-DD'),
            clientName: '',
            contactName: '',
            email: '',
            mobile: '',
            Parent: '',
            branch: firstBranch ? firstBranch.branch : '',
            branchCode: firstBranch ? firstBranch.branchCode : '',
            dateStart: null,
            timeStart: '',
            dateEnd: null,
            timeEnd: '',
            duration: '',
            description: '',
            direction: '',
            status: '',
            followUpDate: null,
            active: true
        });
        setEditId('');
        setFieldErrors({});
        setBranchOptions([]);
        setContactOptions([]);
        setParentOptions([]);
    };

    const handleSave = async () => {
        // Validation
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactName) errors.contactName = 'Contact name is required';
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.dateStart) errors.dateStart = 'Start date is required';
        if (!formData.timeStart) errors.timeStart = 'Start time is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.direction) errors.direction = 'Direction is required';

        // Additional time validation
        if (formData.timeStart && !isValidTime(formData.timeStart)) {
            errors.timeStart = 'Invalid start time format (HH:mm)';
        }
        if (formData.timeEnd && !isValidTime(formData.timeEnd)) {
            errors.timeEnd = 'Invalid end time format (HH:mm)';
        }
        if (formData.timeStart && formData.timeEnd && formData.duration.includes('before')) {
            errors.timeEnd = 'End time must be after start time';
        }

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
            mobile: formData.mobile ? parseInt(formData.mobile) : null,
            duration: formData.duration,
            parent: formData.Parent,
            follwUpDate: formData.followUpDate,
            cancel: formData.status === 'Cancelled',
            cancelRemarks: formData.cancelRemarks
        };

        try {
            const response = await apiCalls('put', '/ncontroller/updateCreateCalls', payload);

            if (response.status === true) {
                showToast('success', editId ? 'Call updated successfully' : 'Call created successfully');
                handleClear();
                getAllCalls();
            } else {
                showToast('error', response.paramObjectsMap.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving call:', error);
            showToast('error', 'Failed to save call');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc ID', size: 120 },
        { accessorKey: 'docDate', header: 'Call Date', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'contactName', header: 'Contact', size: 150 },
        { accessorKey: 'mobile', header: 'Mobile', size: 130 },
        { accessorKey: 'parent', header: 'Parent', size: 130 },
        { accessorKey: 'dateStart', header: 'Date', size: 120 },
        { accessorKey: 'timeStart', header: 'Time', size: 100 },
        { accessorKey: 'direction', header: 'Direction', size: 100 },
        { accessorKey: 'status', header: 'Status', size: 120 },
        { accessorKey: 'duration', header: 'Duration', size: 100 },
        { accessorKey: 'active', header: 'Active', size: 100 },
    ];

    return (
        <>
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
                            toEdit={(row) => getCallById(row.original.id)}
                        />
                    </div>
                ) : (
                    <div className="row">
                        {/* Call ID */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Call ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={true}
                                name="callDocId"
                                value={isDocIdLoading ? "Generating..." : formData.callDocId}
                                InputProps={{
                                    style: { backgroundColor: '#f5f5f5' }
                                }}
                            />
                        </div>

                        {/* Call Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Call Date"
                                        value={formData.calldate ? dayjs(formData.calldate, 'YYYY-MM-DD') : null}
                                        onChange={(date) => handleDateChange('calldate', date)}
                                        slotProps={{ textField: { size: 'small' } }}
                                        format="DD-MM-YYYY"
                                        disabled
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Client Name */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                options={clientOptions}
                                getOptionLabel={(option) => option.clientName}
                                value={clientOptions.find(c => c.clientName === formData.clientName) || null}
                                onChange={handleClientSelect}
                                loading={isClientLoading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={<span>Client Name <span className="asterisk">*</span></span>}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        error={!!fieldErrors.clientName}
                                        helperText={fieldErrors.clientName}
                                    />
                                )}
                                noOptionsText="No clients found"
                            />
                        </div>

                        {/* Branch */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                options={branchOptions}
                                getOptionLabel={(option) => option.branch}
                                value={branchOptions.find(b => b.branch === formData.branch) || null}
                                onChange={handleBranchSelect}
                                loading={isBranchLoading}
                                disabled={!formData.clientName}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Branch"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                                noOptionsText="No branches found"
                            />
                        </div>

                        {/* Contact Name */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                options={contactOptions}
                                getOptionLabel={(option) => option.name}
                                value={contactOptions.find(c => c.name === formData.contactName) || null}
                                onChange={handleContactSelect}
                                loading={isContactLoading}
                                disabled={!formData.clientName || !formData.branch}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={<span>Contact Name <span className="asterisk">*</span></span>}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        error={!!fieldErrors.contactName}
                                        helperText={fieldErrors.contactName}
                                    />
                                )}
                                noOptionsText="No contacts found"
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
                                disabled
                            />
                        </div>

                        {/* Mobile */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Mobile"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                error={!!fieldErrors.mobile}
                                helperText={fieldErrors.mobile}
                                inputProps={{ maxLength: 10 }}
                                disabled
                            />
                        </div>

                        {/* Parent */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                options={parentOptions}
                                getOptionLabel={(option) => option.label}
                                value={parentOptions.find((opt) => opt.value === formData.Parent) || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'Parent',
                                            value: newValue ? newValue.value : ''
                                        }
                                    });
                                }}
                                loading={isParentLoading}
                                disabled={!formData.clientName}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Parent"
                                        variant="outlined"
                                        fullWidth
                                        error={!!fieldErrors.Parent}
                                        helperText={fieldErrors.Parent}
                                    />
                                )}
                                noOptionsText="No parent options found"
                            />
                        </div>

                        {/* Direction */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                options={directionOptions}
                                value={formData.direction || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'direction',
                                            value: newValue || ''
                                        }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={<span>Direction <span className="asterisk">*</span></span>}
                                        variant="outlined"
                                        fullWidth
                                        error={!!fieldErrors.direction}
                                        helperText={fieldErrors.direction}
                                    />
                                )}
                                noOptionsText="No direction options found"
                            />
                        </div>

                        {/* Start Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label={<span>Start Date <span className="asterisk">*</span></span>}
                                        value={formData.dateStart ? dayjs(formData.dateStart, 'YYYY-MM-DD') : null}
                                        onChange={(date) => handleDateChange('dateStart', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.dateStart,
                                                helperText: fieldErrors.dateStart
                                            }
                                        }}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* End Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={formData.dateEnd ? dayjs(formData.dateEnd, 'YYYY-MM-DD') : null}
                                        onChange={(date) => handleDateChange('dateEnd', date)}
                                        slotProps={{ textField: { size: 'small' } }}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Start Time */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label={<span>Start Time <span className="asterisk">*</span></span>}
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="timeStart"
                                type="time"
                                value={formData.timeStart}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                error={!!fieldErrors.timeStart}
                                helperText={fieldErrors.timeStart}
                            />
                        </div>

                        {/* End Time */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="End Time"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="timeEnd"
                                type="time"
                                value={formData.timeEnd}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                error={!!fieldErrors.timeEnd}
                                helperText={fieldErrors.timeEnd}
                            />
                        </div>

                        {/* Duration */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Duration"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="duration"
                                value={formData.duration}
                                InputProps={{
                                    readOnly: true,
                                    style: {
                                        fontWeight: 'bold',
                                        color: formData.duration.includes('Invalid') ||
                                            formData.duration.includes('before')
                                            ? '#d32f2f' : '#1976d2'
                                    }
                                }}
                                error={formData.duration.includes('Invalid') ||
                                    formData.duration.includes('before')}
                            />
                        </div>

                        {/* Status */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                options={statusOptions}
                                value={formData.status || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'status',
                                            value: newValue || '',
                                        },
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            <span>
                                                Status <span className="asterisk">*</span>
                                            </span>
                                        }
                                        variant="outlined"
                                        fullWidth
                                        error={!!fieldErrors.status}
                                        helperText={fieldErrors.status}
                                    />
                                )}
                                noOptionsText="No status options found"
                            />
                        </div>

                        {/* Follow-up Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Follow-up Date"
                                        value={formData.followUpDate ? dayjs(formData.followUpDate, 'YYYY-MM-DD') : null}
                                        onChange={(date) => handleDateChange('followUpDate', date)}
                                        slotProps={{ textField: { size: 'small' } }}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
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
                                // multiline
                                // rows={3}
                            />
                        </div>

                        <div className="col-md-3 mb-3 d-flex align-items-center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        name="active"
                                    />
                                }
                                label="Active"
                                style={{ marginTop: '16px' }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </>
    );
};

export default Calls;
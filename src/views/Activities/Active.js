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
    Autocomplete
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';

export const Active = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const orgId = localStorage.getItem('orgId') || '';
    const branch = localStorage.getItem('branch') || '';
    const branchCode = localStorage.getItem('branchcode');
    const finYear = localStorage.getItem('finYear') || '';
    const loginUserName = localStorage.getItem('userName') || '';
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);

    // State for API-driven options
    const [clientOptions, setClientOptions] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [contactOptions, setContactOptions] = useState([]);
    const [assignToOptions, setAssignToOptions] = useState([]);
    const [typeOptions] = useState(['Call', 'Meeting', 'Visit']);
    const [directionOptions] = useState(['Call Received', 'Call Made']);

    // Form state
    const [formData, setFormData] = useState({
        activeDocId: '',
        docDate: null,
        clientName: '',
        contactName: '',
        branchName: branch,
        mobileNo: '',
        email: '',
        parent: '',
        branch: branch,
        branchCode: branchCode,
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        duration: '',
        description: '',
        status: '',
        followUpDate: null,
        active: true,
        venue: '',
        address: '',
        assignTo: '',
        type: '',
        direction: '',
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        mobileNo: '',
        email: '',
        branch: '',
        startDate: '',
        startTime: '',
        status: '',
        type: '',
        assignTo: ''
    });

    // Status options
    const statusOptions = ['Planned', 'Completed', 'Cancelled', 'Postponed'];

    // Calculate duration between start and end times
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '';

        const startTotalMinutes = startTime.hour() * 60 + startTime.minute();
        const endTotalMinutes = endTime.hour() * 60 + endTime.minute();

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
        getClientNames();
        getAssignToOptions();
    }, []);

    useEffect(() => {
        if (formData.branch && formData.branchCode && !editId) {
            getActiveDocId();
        }
    }, [formData.branch, formData.branchCode, editId]);

    useEffect(() => {
        if (formData.branchCode) {
            getAllActives();
        }
    }, [formData.branchCode]);

    useEffect(() => {
        if (formData.startTime && formData.endTime) {
            const duration = calculateDuration(formData.startTime, formData.endTime);
            setFormData(prev => ({ ...prev, duration }));
        } else if (!formData.startTime || !formData.endTime) {
            setFormData(prev => ({ ...prev, duration: '' }));
        }
    }, [formData.startTime, formData.endTime]);

    const getParentFromLead = async (clientName) => {
        if (!clientName) return;

        try {
            const response = await apiCalls(
                'get',
                `/activities/getParentFromLead?clientName=${clientName}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.parentName) {
                const parents = response.paramObjectsMap.parentName;
                if (parents.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        parent: parents[0].parent || ''
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching parent:', error);
        }
    };

    const getClientNames = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/activities/getClientNameFromLead?orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.clientName) {
                const clients = response.paramObjectsMap.clientName.map(item => ({
                    label: item.clientName,
                    value: item.clientName,
                    docId: item.docId
                }));
                setClientOptions(clients);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            showToast('error', 'Failed to load clients');
        }
    };

    const getBranchNames = async (clientName) => {
        if (!clientName) return;

        try {
            const response = await apiCalls(
                'get',
                `/activities/getBranchNameFromLeadFillGrid?clientName=${clientName}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.branchName) {
                const branches = response.paramObjectsMap.branchName.map(item => ({
                    label: item.branch,
                    value: item.branch,
                    address: item.address,
                    website: item.website,
                    industry: item.industry
                }));
                setBranchOptions(branches);

                setFormData(prev => ({
                    ...prev,
                    branch: '',
                    branchCode: '',
                    contactName: '',
                    mobileNo: '',
                    email: '',
                    address: ''
                }));
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    const getContactDetails = async (clientName, branchName) => {
        if (!clientName || !branchName) return;

        try {
            const response = await apiCalls(
                'get',
                `/activities/getContactNameFromLeadFillGrid?branchName=${branchName}&clientName=${clientName}&orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.contactDetails) {
                const contacts = response.paramObjectsMap.contactDetails.map(item => ({
                    label: item.name,
                    value: item.name,
                    mobileNo: item.mobileNumber,
                    email: item.email
                }));
                setContactOptions(contacts);

                // Don't clear the fields automatically - let user choose
                if (!formData.contactName) {
                    setFormData(prev => ({
                        ...prev,
                        contactName: '',
                        mobileNo: '',
                        email: ''
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast('error', 'Failed to load contacts');
        }
    };

    const getAssignToOptions = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/activities/getAssignedUserName?orgId=${orgId}`
            );

            if (response.status && response.paramObjectsMap.assginedUserName) {
                const assignees = response.paramObjectsMap.assginedUserName.map(item => ({
                    label: item.assignedTo,
                    value: item.assignedUser
                }));
                setAssignToOptions(assignees);
            } else {
                showToast('error', response.paramObjectsMap?.message || 'Failed to load assignees');
                setAssignToOptions([
                    { label: 'Alice Johnson', value: 'alice_johnson' },
                    { label: 'Bob Smith', value: 'bob_smith' },
                    { label: 'Charlie Brown', value: 'charlie_brown' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching assignees:', error);
            showToast('error', 'Failed to load assignees');
            setAssignToOptions([
                { label: 'Alice Johnson', value: 'alice_johnson' },
                { label: 'Bob Smith', value: 'bob_smith' },
                { label: 'Charlie Brown', value: 'charlie_brown' }
            ]);
        }
    };

    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchList(branchData);

            // Find matching branch from localStorage or use first branch
            let initialBranch = branch;
            let initialBranchCode = branchCode;

            if (branchData.length > 0) {
                const storedBranch = branchData.find(b =>
                    b.branchCode === branchCode ||
                    b.branchCode === localStorage.getItem('branchCode') ||
                    b.branch === branch
                );

                if (storedBranch) {
                    initialBranch = storedBranch.branch;
                    initialBranchCode = storedBranch.branchCode;
                } else {
                    // Fallback to first branch
                    initialBranch = branchData[0].branch;
                    initialBranchCode = branchData[0].branchCode;
                }
            }

            // Update localStorage with correct values
            localStorage.setItem('branch', initialBranch);
            localStorage.setItem('branchCode', initialBranchCode);

            setFormData(prev => ({
                ...prev,
                branch: initialBranch,
                branchCode: initialBranchCode,
                branchName: initialBranch
            }));
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    const getAllActives = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/activities/getAllActiveByOrgId?orgId=${orgId}&branchCode=${formData.branchCode}&finYear=${finYear}`
            );

            if (response.status === true) {
                setListViewData(response.paramObjectsMap.activeVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            showToast('error', 'Failed to fetch activities');
        }
    };

    const getActiveDocId = async () => {
        if (!formData.branch || !formData.branchCode) return;

        setIsDocIdLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getActiveDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap.activeDocId) {
                setFormData(prev => ({
                    ...prev,
                    activeDocId: response.paramObjectsMap.activeDocId,
                    docDate: dayjs()
                }));
            }
        } catch (error) {
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    const getActiveById = async (id) => {
        try {
            const response = await apiCalls('get', `/activities/getActiveById?id=${id}`);

            if (response.status === true && response.paramObjectsMap.activeVO) {
                const active = response.paramObjectsMap.activeVO;
                setEditId(id);
                setListView(false);

                // Convert dates/times to Dayjs
                const docDate = active.docDate ? dayjs(active.docDate, 'YYYY-MM-DD') : null;
                const startDate = active.startDate ? dayjs(active.startDate, 'YYYY-MM-DD') : null;
                const endDate = active.endDate ? dayjs(active.endDate, 'YYYY-MM-DD') : null;
                const followUpDate = active.followUpDate ? dayjs(active.followUpDate, 'YYYY-MM-DD') : null;
                const startTime = active.startTime ? dayjs(`1970-01-01T${active.startTime.padStart(5, '0')}:00`) : null;
                const endTime = active.endTime ? dayjs(`1970-01-01T${active.endTime.padStart(5, '0')}:00`) : null;

                // Handle branchCode - if missing, look it up
                let branchCodeForActive = active.branchCode;
                if (!branchCodeForActive && active.branch) {
                    const branchInList = branchList.find(b => b.branch === active.branch);
                    if (branchInList) {
                        branchCodeForActive = branchInList.branchCode;
                    }
                }

                // First set basic form data
                setFormData(prev => ({
                    ...prev,
                    activeDocId: active.docId || '',
                    docDate: docDate,
                    clientName: active.clientName || '',
                    contactName: active.contactName || '',
                    mobileNo: active.mobileNo ? active.mobileNo.toString() : '',
                    email: active.email || '',
                    parent: active.parent || '',
                    branch: active.branch || branch,
                    branchCode: branchCodeForActive || branchCode,
                    branchName: active.branch || branch,
                    startDate: startDate,
                    startTime: startTime,
                    endDate: endDate,
                    endTime: endTime,
                    duration: active.duration || '',
                    description: active.description || '',
                    status: active.status || '',
                    followUpDate: followUpDate,
                    active: active.active === "Active",
                    venue: active.venue || '',
                    address: active.address || '',
                    assignTo: active.assignTo || '',
                    type: active.type || '',
                    direction: active.direction || ''
                }));

                // Then load related data
                if (active.clientName) {
                    await getClientNames();
                    await getBranchNames(active.clientName);
                    await getParentFromLead(active.clientName);

                    // Update branch-related fields after a short delay
                    setTimeout(() => {
                        const branchOpt = branchList.find(b => b.branch === active.branch);
                        if (branchOpt) {
                            setFormData(prev => ({
                                ...prev,
                                address: branchOpt.address || active.address || '',
                                branch: active.branch,
                                branchCode: branchOpt.branchCode,
                                branchName: active.branch
                            }));
                        }
                    }, 300);

                    // Update contact-related fields
                    if (active.contactName) {
                        setTimeout(async () => {
                            await getContactDetails(active.clientName, active.branch);
                        }, 300);
                    }
                    if (active.branch) {
                        await getContactDetails(active.clientName, active.branch);
                    }
                }
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch activity details');
            }
        } catch (error) {
            console.error('Error fetching activity details:', error);
            showToast('error', 'Failed to fetch activity details');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        let errorMessage = '';
        if (name === 'mobileNo' && value && !/^\d{10}$/.test(value)) {
            errorMessage = 'Invalid mobile number (10 digits required)';
        }
        if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errorMessage = 'Invalid email format';
        }

        if (errorMessage) {
            setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
        } else {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateChange = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleTimeChange = (field, time) => {
        setFormData(prev => ({ ...prev, [field]: time }));

        if (field === 'startTime') {
            setFieldErrors(prev => ({ ...prev, startTime: '' }));
        } else if (field === 'endTime') {
            setFieldErrors(prev => ({ ...prev, endTime: '' }));
        }
    };

    const handleBranchChange = (e) => {
        const branchName = e.target.value;
        const selectedBranch = branchList.find(b => b.branch === branchName);

        if (selectedBranch) {
            setFormData(prev => ({
                ...prev,
                branch: branchName,
                branchCode: selectedBranch.branchCode,
                branchName: branchName
            }));
        }
    };

    const handleClear = () => {
        let initialBranch = branch;
        let initialBranchCode = branchCode;

        if (branchList.length > 0) {
            const storedBranch = branchList.find(b => b.branch === branch && b.branchCode === branchCode);

            if (storedBranch) {
                initialBranch = storedBranch.branch;
                initialBranchCode = storedBranch.branchCode;
            } else {
                initialBranch = branchList[0].branch;
                initialBranchCode = branchList[0].branchCode;
            }
        }

        setFormData({
            activeDocId: '',
            docDate: null,
            clientName: '',
            contactName: '',
            mobileNo: '',
            email: '',
            parent: '',
            branch: initialBranch,
            branchCode: initialBranchCode,
            branchName: initialBranch,
            startDate: null,
            startTime: null,
            endDate: null,
            endTime: null,
            duration: '',
            description: '',
            status: '',
            followUpDate: null,
            active: true,
            venue: '',
            address: '',
            assignTo: '',
            type: '',
            direction: ''
        });
        setEditId('');
        setFieldErrors({});
    };

    const handleSave = async () => {
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactName) errors.contactName = 'Contact name is required';
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.type) errors.type = 'Type is required';
        if (!formData.assignTo) errors.assignTo = 'Assign To is required';
        if (formData.email && fieldErrors.email) errors.email = fieldErrors.email;

        if (formData.startTime && formData.endTime && formData.duration.includes('before')) {
            errors.endTime = 'End time must be after start time';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fix the validation errors');
            return;
        }

        setIsLoading(true);

        const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : null;
        const formatTime = (time) => time ? time.format('HH:mm') : '';

        const payload = {
            id: editId || undefined,
            docId: formData.activeDocId,
            docDate: formatDate(formData.docDate),
            clientName: formData.clientName,
            contactName: formData.contactName,
            mobileNo: formData.mobileNo,
            email: formData.email,
            parent: formData.parent,
            branch: formData.branch,
            branchCode: formData.branchCode,
            branchName: formData.branch,
            startDate: formatDate(formData.startDate),
            startTime: formatTime(formData.startTime),
            endDate: formatDate(formData.endDate),
            endTime: formatTime(formData.endTime),
            duration: formData.duration,
            description: formData.description,
            status: formData.status,
            followUpDate: formatDate(formData.followUpDate),
            venue: formData.venue,
            address: formData.address,
            assignTo: formData.assignTo,
            finYear: finYear,
            createdBy: loginUserName,
            orgId: parseInt(orgId),
            active: formData.active,
            type: formData.type,
            direction: formData.direction,
            screenCode: "ACT",
            screenName: "ACTIVITY"
        };

        try {
            const response = await apiCalls('put', '/activities/updateCreateActive', payload);

            if (response.status === true) {
                showToast('success', editId ? 'Activity updated successfully' : 'Activity created successfully');
                handleClear();
                getAllActives();
            } else {
                showToast('error', response.paramObjectsMap?.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            showToast('error', 'Failed to save activity');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc ID', size: 120 },
        { accessorKey: 'docDate', header: 'Date', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'contactName', header: 'Contact', size: 150 },
        { accessorKey: 'mobileNo', header: 'Mobile', size: 130 },
        { accessorKey: 'email', header: 'Email', size: 180 },
        { accessorKey: 'parent', header: 'Parent', size: 130 },
        { accessorKey: 'startDate', header: 'Start Date', size: 120 },
        { accessorKey: 'startTime', header: 'Time', size: 100 },
        { accessorKey: 'type', header: 'Type', size: 120 },
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
                            toEdit={(row) => getActiveById(row.original.id)}
                        />
                    </div>
                ) : (
                    <div className="row">
                        {/* Activity ID */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Activity ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled
                                name="activeDocId"
                                value={isDocIdLoading ? "Generating..." : formData.activeDocId}
                                InputProps={{
                                    style: { backgroundColor: '#f5f5f5' }
                                }}
                            />
                        </div>

                        {/* Activity Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Activity Date"
                                        value={formData.docDate}
                                        onChange={(date) => handleDateChange('docDate', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.docDate,
                                                helperText: fieldErrors.docDate
                                            }
                                        }}
                                        format="DD-MM-YYYY"
                                        disabled
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Type */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={typeOptions}
                                value={formData.type || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'type',
                                            value: newValue || ''
                                        }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            <span>
                                                Type <span className="asterisk">*</span>
                                            </span>
                                        }
                                        variant="outlined"
                                        error={!!fieldErrors.type}
                                        helperText={fieldErrors.type}
                                    />
                                )}
                            />
                        </div>

                        {/* Direction */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
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
                                        label="Direction"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </div>

                        {/* Client Name */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={clientOptions}
                                getOptionLabel={(option) => option.label}
                                value={
                                    clientOptions.find(opt => opt.value === formData.clientName) || null
                                }
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'clientName',
                                            value: newValue ? newValue.value : ''
                                        }
                                    });

                                    if (newValue) {
                                        getBranchNames(newValue.value);
                                        getParentFromLead(newValue.value);
                                    } else {
                                        setBranchOptions([]);
                                        setContactOptions([]);
                                        setFormData(prev => ({ ...prev, parent: '', address: '' }));
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
                                        variant="outlined"
                                        error={!!fieldErrors.clientName}
                                        helperText={fieldErrors.clientName}
                                    />
                                )}
                            />
                        </div>

                        {/* Branch */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={branchOptions}
                                getOptionLabel={(option) => option.label}
                                value={
                                    branchOptions.find((b) => b.value === formData.branch) || null
                                }
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'branch',
                                            value: newValue ? newValue.value : ''
                                        }
                                    });

                                    if (newValue) {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: newValue.address || ''
                                        }));
                                    }

                                    if (newValue && formData.clientName) {
                                        getContactDetails(formData.clientName, newValue.value);
                                    } else {
                                        setContactOptions([]);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Branch"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </div>

                        {/* Contact Name */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={contactOptions}
                                getOptionLabel={(option) => option.label}
                                value={
                                    contactOptions.find((opt) => opt.value === formData.contactName) || null
                                }
                                onChange={(event, newValue) => {
                                    const newContactName = newValue ? newValue.value : '';
                                    const newMobileNo = newValue ? newValue.mobileNo || formData.mobileNo : formData.mobileNo;
                                    const newEmail = newValue ? newValue.email || formData.email : formData.email;

                                    setFormData(prev => ({
                                        ...prev,
                                        contactName: newContactName,
                                        mobileNo: newMobileNo,
                                        email: newEmail
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            <span>
                                                Contact Name <span className="asterisk">*</span>
                                            </span>
                                        }
                                        variant="outlined"
                                        error={!!fieldErrors.contactName}
                                        helperText={fieldErrors.contactName}
                                    />
                                )}
                            />
                        </div>

                        {/* Mobile */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Mobile"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="mobileNo"
                                value={formData.mobileNo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.mobileNo}
                                helperText={fieldErrors.mobileNo}
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

                        {/* Parent */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Parent"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="parent"
                                value={formData.parent}
                                onChange={handleInputChange}
                                disabled
                                InputProps={{
                                    style: { backgroundColor: '#f5f5f5' }
                                }}
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
                                disabled
                                InputProps={{
                                    style: { backgroundColor: '#f5f5f5' }
                                }}
                            />
                        </div>

                        {/* Start Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label={
                                            <span>
                                                Start Date <span className="asterisk">*</span>
                                            </span>
                                        }
                                        value={formData.startDate}
                                        onChange={(date) => handleDateChange('startDate', date)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.startDate,
                                                helperText: fieldErrors.startDate
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
                                        value={formData.endDate}
                                        onChange={(date) => handleDateChange('endDate', date)}
                                        slotProps={{ textField: { size: 'small' } }}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Start Time */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label={
                                            <span>
                                                Start Time <span className="asterisk">*</span>
                                            </span>
                                        }
                                        value={formData.startTime}
                                        onChange={(time) => handleTimeChange('startTime', time)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.startTime,
                                                helperText: fieldErrors.startTime
                                            }
                                        }}
                                        format="HH:mm"
                                        views={['hours', 'minutes']}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* End Time */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="End Time"
                                        value={formData.endTime}
                                        onChange={(time) => handleTimeChange('endTime', time)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.endTime,
                                                helperText: fieldErrors.endTime
                                            }
                                        }}
                                        format="HH:mm"
                                        views={['hours', 'minutes']}
                                    />
                                </LocalizationProvider>
                            </FormControl>
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
                                        color: formData.duration.includes('before')
                                            ? '#d32f2f' : '#1976d2'
                                    }
                                }}
                                error={formData.duration.includes('before')}
                            />
                        </div>

                        {/* Status */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={statusOptions}
                                value={formData.status || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'status',
                                            value: newValue || ''
                                        }
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
                                        error={!!fieldErrors.status}
                                        helperText={fieldErrors.status}
                                    />
                                )}
                            />
                        </div>

                        {/* Venue */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Venue"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Follow-up Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Follow-up Date"
                                        value={formData.followUpDate}
                                        onChange={(date) => handleDateChange('followUpDate', date)}
                                        slotProps={{ textField: { size: 'small' } }}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>
                        {/* Assign To */}
                        <div className="col-md-3 mb-3">
                            <Autocomplete
                                size="small"
                                fullWidth
                                options={assignToOptions}
                                getOptionLabel={(option) => option.label}
                                value={
                                    assignToOptions.find((opt) => opt.value === formData.assignTo) || null
                                }
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'assignTo',
                                            value: newValue ? newValue.value : ''
                                        }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            <span>
                                                Assign To <span className="asterisk">*</span>
                                            </span>
                                        }
                                        variant="outlined"
                                        error={!!fieldErrors.assignTo}
                                        helperText={fieldErrors.assignTo}
                                    />
                                )}
                            />
                        </div>

                        {/* Description */}
                        <div className="col-md-6 mb-3">
                            <TextField
                                label="Description"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                            />
                        </div>

                        {/* Active */}
                        <div className="col-md-3 .mb-3 d-flex align-items-center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        name="active"
                                    />
                                }
                                label="Active"
                            />
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </>
    );
};

export default Active;
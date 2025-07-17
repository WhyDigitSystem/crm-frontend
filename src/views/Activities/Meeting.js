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
    Select
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers'; // Added TimePicker
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';

export const Meeting = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const orgId = localStorage.getItem('orgId');
    const branch = localStorage.getItem('branch');
    const branchCode = localStorage.getItem('branchCode');
    const finYear = localStorage.getItem('finYear');
    const loginUserName = localStorage.getItem('userName');
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [userList, setUserList] = useState([]);

    // Updated form structure for meetings
    const [formData, setFormData] = useState({
        meetingDocId: '',
        meetingDate: null,
        clientName: '',
        contactName: '',
        mobileNo: '',
        parent: '',
        branch: branch || '',
        branchCode: branchCode || '',
        startDate: null,
        startTime: null, // Changed to Dayjs object
        endDate: null,
        endTime: null, // Changed to Dayjs object
        duration: '',
        description: '',
        status: '',
        followUpDate: null,
        active: true,
        venue: '',
        address: '',
        assignTo: '',
        cancelRemarks: '',
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        mobileNo: '',
        branch: '',
        startDate: '',
        startTime: '',
        status: '',
        venue: '',
        assignTo: ''
    });

    // Status options
    const statusOptions = ['Completed', 'Pending', 'Rescheduled', 'Cancelled'];

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
    }, []);

    useEffect(() => {
        if (formData.branch && formData.branchCode && !editId) {
            getMeetingDocId();
        }
    }, [formData.branch, formData.branchCode, editId]);

    useEffect(() => {
        if (formData.branchCode) {
            getAllMeetings();
        }
    }, [formData.branchCode]);

    // Recalculate duration when times change
    useEffect(() => {
        if (formData.startTime && formData.endTime) {
            const duration = calculateDuration(formData.startTime, formData.endTime);
            setFormData(prev => ({ ...prev, duration }));
        } else if (!formData.startTime || !formData.endTime) {
            setFormData(prev => ({ ...prev, duration: '' }));
        }
    }, [formData.startTime, formData.endTime]);

    // getAllBranches
    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchList(branchData);

            // Set to localStorage values if available, otherwise first branch
            let initialBranch = branch || '';
            let initialBranchCode = branchCode || '';

            if (branchData.length > 0) {
                // Try to find localStorage branch in list
                const storedBranch = branchData.find(b => b.branch === branch && b.branchCode === branchCode);

                if (storedBranch) {
                    initialBranch = storedBranch.branch;
                    initialBranchCode = storedBranch.branchCode;
                } else {
                    // Fallback to first branch
                    initialBranch = branchData[0].branch;
                    initialBranchCode = branchData[0].branchCode;
                }
            }

            setFormData(prev => ({
                ...prev,
                branch: initialBranch,
                branchCode: initialBranchCode
            }));
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branches');
        }
    };

    // getAllMeetings
    const getAllMeetings = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/activities/getMeetingByOrgId?orgId=${orgId}&branchCode=${formData.branchCode}`
            );

            if (response.status === true) {
                setListViewData(response.paramObjectsMap.meetingVO);
            } else {
                showToast('error', response.message || 'Failed to fetch meetings');
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            showToast('error', 'Failed to fetch meetings');
        }
    };

    // getMeetingDocId
    const getMeetingDocId = async () => {
        if (!formData.branch || !formData.branchCode) return;

        setIsDocIdLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/activities/getMetingDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap.meetingDocId) {
                setFormData(prev => ({
                    ...prev,
                    meetingDocId: response.paramObjectsMap.meetingDocId,
                    meetingDate: dayjs() // Set current date as meeting date
                }));
            }
        } catch (error) {
            console.error('Error getting document ID:', error);
            showToast('error', 'Failed to generate document ID');
        } finally {
            setIsDocIdLoading(false);
        }
    };

    // getMeetingById
    const getMeetingById = async (id) => {
        try {
            const response = await apiCalls('get', `/activities/getMeetingById?id=${id}`);

            if (response.status === true) {
                const meeting = response.paramObjectsMap.meetingVO;
                setEditId(id);
                setListView(false);

                // Convert date strings to Dayjs objects
                const meetingDate = meeting.docDate ? dayjs(meeting.docDate, 'YYYY-MM-DD') : null;
                const startDate = meeting.startDate ? dayjs(meeting.startDate, 'YYYY-MM-DD') : null;
                const endDate = meeting.endDate ? dayjs(meeting.endDate, 'YYYY-MM-DD') : null;
                const followUpDate = meeting.followUpDate ? dayjs(meeting.followUpDate, 'YYYY-MM-DD') : null;

                // Convert time strings to Dayjs objects
                const startTime = meeting.startTime
                    ? dayjs(`1970-01-01T${meeting.startTime.substring(0, 5)}`)
                    : null;

                const endTime = meeting.endTime
                    ? dayjs(`1970-01-01T${meeting.endTime.substring(0, 5)}`)
                    : null;

                setFormData({
                    meetingDocId: meeting.docId || '',
                    meetingDate: meetingDate,
                    clientName: meeting.clientName || '',
                    contactName: meeting.contactName || '',
                    mobileNo: meeting.mobileNo ? meeting.mobileNo.toString() : '',
                    parent: meeting.parent || '',
                    branch: meeting.branch || '',
                    branchCode: meeting.branchCode || '',
                    startDate: startDate,
                    startTime: startTime,
                    endDate: endDate,
                    endTime: endTime,
                    duration: meeting.duration || '',
                    description: meeting.description || '',
                    status: meeting.status || '',
                    followUpDate: followUpDate,
                    active: meeting.active === "Active",
                    venue: meeting.venue || '',
                    address: meeting.address || '',
                    assignTo: meeting.assignTo || ''
                });
            } else {
                showToast('error', response.paramObjectsMap.message || 'Failed to fetch meeting details');
            }
        } catch (error) {
            console.error('Error fetching meeting details:', error);
            showToast('error', 'Failed to fetch meeting details');
        }
    };

    // handleInputChange
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        // Validation
        let errorMessage = '';
        if (name === 'mobileNo' && value && !/^\d{10}$/.test(value)) {
            errorMessage = 'Invalid mobile number (10 digits required)';
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

    // handleDateChange
    const handleDateChange = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    // handleTimeChange
    const handleTimeChange = (field, time) => {
        setFormData(prev => ({ ...prev, [field]: time }));

        // Clear time errors when time is selected
        if (field === 'startTime') {
            setFieldErrors(prev => ({ ...prev, startTime: '' }));
        } else if (field === 'endTime') {
            setFieldErrors(prev => ({ ...prev, endTime: '' }));
        }
    };

    // handleBranchChange
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

    // handleClear
    const handleClear = () => {
        // Reset to localStorage values if available, otherwise first branch
        let initialBranch = branch || '';
        let initialBranchCode = branchCode || '';

        if (branchList.length > 0) {
            // Try to find localStorage branch in list
            const storedBranch = branchList.find(b => b.branch === branch && b.branchCode === branchCode);

            if (storedBranch) {
                initialBranch = storedBranch.branch;
                initialBranchCode = storedBranch.branchCode;
            } else {
                // Fallback to first branch
                initialBranch = branchList[0].branch;
                initialBranchCode = branchList[0].branchCode;
            }
        }

        setFormData({
            meetingDocId: '',
            meetingDate: null,
            clientName: '',
            contactName: '',
            mobileNo: '',
            parent: '',
            branch: initialBranch,
            branchCode: initialBranchCode,
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
            assignTo: ''
        });
        setEditId('');
        setFieldErrors({});
    };

    // handleSave
    const handleSave = async () => {
        // Validation
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactName) errors.contactName = 'Contact name is required';
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.venue) errors.venue = 'Venue is required';
        if (!formData.assignTo) errors.assignTo = 'Assign To is required';

        // Additional time validation
        if (formData.startTime && formData.endTime && formData.duration.includes('before')) {
            errors.endTime = 'End time must be after start time';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fix the validation errors');
            return;
        }

        setIsLoading(true);

        // Format dates for API
        const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : null;
        // Format times for API
        const formatTime = (time) => time ? time.format('HH:mm') : '';

        // Prepare API payload
        const payload = {
            meetingDocId: formData.meetingDocId,
            meetingDate: formatDate(formData.meetingDate),
            clientName: formData.clientName,
            contactName: formData.contactName,
            mobileNo: formData.mobileNo,
            parent: formData.parent,
            branch: formData.branch,
            branchCode: formData.branchCode,
            startDate: formatDate(formData.startDate),
            startTime: formatTime(formData.startTime),
            endDate: formatDate(formData.endDate),
            endTime: formatTime(formData.endTime),
            duration: formData.duration,
            description: formData.description,
            status: formData.status,
            followUpDate: formatDate(formData.followUpDate),
            active: formData.active,
            venue: formData.venue,
            address: formData.address,
            assignTo: formData.assignTo,
            cancelRemarks: formData.cancelRemarks,
            finYear: finYear,
            createdBy: loginUserName,
            orgId: parseInt(orgId),
            cancel: formData.status === 'Cancelled',
            ...(editId && { id: editId }),
        };

        try {
            const response = await apiCalls('put', '/activities/createUpdateMetting', payload);

            if (response.status === true) {
                showToast('success', editId ? 'Meeting updated successfully' : 'Meeting created successfully');
                handleClear();
                getAllMeetings();
            } else {
                showToast('error', response.paramObjectsMap.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving meeting:', error);
            showToast('error', 'Failed to save meeting');
        } finally {
            setIsLoading(false);
        }
    };

    // handleView
    const handleView = () => {
        setListView(!listView);
    };

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc ID', size: 120 },
        { accessorKey: 'docDate', header: 'Meeting Date', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'contactName', header: 'Contact', size: 150 },
        { accessorKey: 'mobileNo', header: 'Mobile', size: 130 },
        { accessorKey: 'parent', header: 'Parent', size: 130 },
        { accessorKey: 'startDate', header: 'Start Date', size: 120 },
        { accessorKey: 'startTime', header: 'Time', size: 100 },
        { accessorKey: 'venue', header: 'Venue', size: 150 },
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
                            toEdit={(row) => getMeetingById(row.original.id)}
                        />
                    </div>
                ) : (
                    <div className="row">
                        {/* Meeting ID */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Meeting ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled
                                name="meetingDocId"
                                value={isDocIdLoading ? "Generating..." : formData.meetingDocId}
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
                                        label="Meeting Date *"
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
                            />
                        </div>

                        {/* Branch */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                                <InputLabel id="branch-label">Branch *</InputLabel>
                                <Select
                                    labelId="branch-label"
                                    label="Branch *"
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
                            />
                        </div>

                        {/* Venue */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Venue *"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                error={!!fieldErrors.venue}
                                helperText={fieldErrors.venue}
                            />
                        </div>

                        {/* Start Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date *"
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
                                        label="Start Time *"
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
                                helperText={formData.duration.includes('before')
                                    ? formData.duration : "Calculated automatically"}
                            />
                        </div>

                        {/* Status */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.status}>
                                <InputLabel id="status-label">Status *</InputLabel>
                                <Select
                                    labelId="status-label"
                                    label="Status *"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    name="status"
                                >
                                    {statusOptions.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                            </FormControl>
                        </div>

                        {/* Assign To */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Assign To *"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="assignTo"
                                value={formData.assignTo}
                                onChange={handleInputChange}
                                error={!!fieldErrors.assignTo}
                                helperText={fieldErrors.assignTo}
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

                        {/* Description */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Description"
                                variant="outlined"
                                size="small"
                                fullWidth
                                // multiline
                                // rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Active */}
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

export default Meeting;
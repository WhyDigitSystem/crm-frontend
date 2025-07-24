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

    const [formData, setFormData] = useState({
        callDocId: '',
        calldate: dayjs().format('YYYY-MM-DD'), // Set current date by default
        clientName: '',
        contactName: '',
        email: '',
        mobile: '',
        Parent: '',
        branch: '',
        branchCode: '',
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

    // Status options
    const statusOptions = ['Completed', 'Pending', 'Rescheduled', 'Cancelled'];

    const isValidTime = (value) => {
        // Matches HH:mm 24-hour format
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
    };

    // Calculate duration between start and end times
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
    }, []);

    useEffect(() => {
        if (formData.branch && formData.branchCode && !editId) {
            getCallDocId();
        }
    }, [formData.branch, formData.branchCode, editId]);

    useEffect(() => {
        if (formData.branchCode) {
            getAllCalls();
        }
    }, [formData.branchCode]);

    // Recalculate duration when times change
    useEffect(() => {
        if (formData.timeStart && formData.timeEnd) {
            const duration = calculateDuration(formData.timeStart, formData.timeEnd);
            setFormData(prev => ({ ...prev, duration }));
        } else if (!formData.timeStart || !formData.timeEnd) {
            setFormData(prev => ({ ...prev, duration: '' }));
        }
    }, [formData.timeStart, formData.timeEnd]);

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
        if (!formData.branch || !formData.branchCode) return;

        setIsDocIdLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/ncontroller/getCallsDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
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
                    timeStart: call.timeStart ? call.timeStart.substring(0, 5) : '', // Extract HH:mm
                    dateEnd: call.dateEnd || null,
                    timeEnd: call.timeEnd ? call.timeEnd.substring(0, 5) : '', // Extract HH:mm
                    duration: call.duratrion || '', // Note: Typo in response field
                    description: call.description || '',
                    direction: call.direction || '',
                    status: call.status || '',
                    followUpDate: call.follwUpDate || null, // Note: Typo in response field
                    active: call.active === "Active" // Convert to boolean
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



    const handleDateChange = (field, date) => {
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
        setFormData(prev => ({ ...prev, [field]: formattedDate }));
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

    const handleClear = () => {
        const firstBranch = branchList[0] || null;
        setFormData({
            callDocId: '',
            calldate: null,
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
    };

    const handleSave = async () => {
        // Validation
        const errors = {};
        // if (!formData.calldate) errors.calldate = 'Call Date is required';
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

    const clientOptions = [
        { label: 'Client A', value: 'clientA' },
        { label: 'Client B', value: 'clientB' },
        { label: 'Client C', value: 'clientC' }
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
                                disabled
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
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                error: !!fieldErrors.calldate,
                                                helperText: fieldErrors.calldate
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
                            <Autocomplete
                                options={clientOptions}
                                getOptionLabel={(option) => option.label}
                                value={clientOptions.find((opt) => opt.value === formData.clientName) || null}
                                onChange={(event, newValue) => {
                                    handleInputChange({
                                        target: {
                                            name: 'clientName',
                                            value: newValue ? newValue.value : ''
                                        }
                                    });
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
                                        size="small"
                                        fullWidth
                                        error={!!fieldErrors.clientName}
                                        helperText={fieldErrors.clientName}
                                    />
                                )}
                            />
                        </div>

                        {/* Branch */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                                <InputLabel id="branch-label">Branch <span className="asterisk">*</span></InputLabel>
                                <Select
                                    labelId="branch-label"
                                    // label="Branch *"
                                    label={
                                        <span>
                                            Branch <span className="asterisk">*</span>
                                        </span>
                                    }
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
                                // label="Contact Name *"
                                label={
                                    <span>
                                        Contact Name <span className="asterisk">*</span>
                                    </span>
                                }
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
                            />
                        </div>

                        {/* Parent */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Parent"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="Parent"
                                value={formData.Parent}
                                onChange={handleInputChange}
                                error={!!fieldErrors.Parent}
                                helperText={fieldErrors.Parent}
                            />
                        </div>

                        {/* Direction */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="Direction"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="direction"
                                value={formData.direction}
                                onChange={handleInputChange}
                                error={!!fieldErrors.direction}
                                helperText={fieldErrors.direction}
                            />
                        </div>

                        {/* Start Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        // label="Start Date *"
                                        label={
                                            <span>
                                                Start Date <span className="asterisk">*</span>
                                            </span>
                                        }
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
                                // label="Start Time *"
                                label={
                                    <span>
                                        Start Time <span className="asterisk">*</span>
                                    </span>
                                }
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="timeStart"
                                type="time"
                                value={formData.timeStart}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min interval
                                }}
                                error={!!fieldErrors.timeStart}
                            // helperText={fieldErrors.timeStart || "Format: HH:mm"}
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
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300,
                                }}
                                error={!!fieldErrors.timeEnd}
                            // helperText={fieldErrors.timeEnd || "Format: HH:mm"}
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
                            // helperText={formData.duration.includes('Invalid') || 
                            //            formData.duration.includes('before')
                            //     ? formData.duration : "Calculated automatically"}
                            />
                        </div>

                        {/* Status */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.status}>
                                <InputLabel id="status-label">Status <span className="asterisk">*</span></InputLabel>
                                <Select
                                    labelId="status-label"
                                    // label="Status *"
                                    label={
                                        <span>
                                            Status <span className="asterisk">*</span>
                                        </span>
                                    }
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
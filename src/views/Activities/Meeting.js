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

export const Meeting = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);
    const [finYear] = useState(new Date().getFullYear().toString());
    const [isDocIdLoading, setIsDocIdLoading] = useState(false);

    const [formData, setFormData] = useState({
        meetingId: '',
        meetingDate: null,
        clientName: '',
        contactName: '',
        email: '',
        mobile: '',
        Parent: '',
        venue: '',
        branch: '',
        branchCode: '',
        dateStart: null,
        timeStart: '',
        dateEnd: null,
        timeEnd: '',
        duration: '',
        description: '',
        address: '',
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
        venue: '',
        branch: '',
        dateStart: '',
        timeStart: '',
        status: '',
    });

    // Status options
    const statusOptions = ['Completed', 'Pending', 'Rescheduled', 'Cancelled'];
    const assignToOptions = ['Incoming', 'Outgoing'];

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
                    meetingId: response.paramObjectsMap.callsDocId
                }));
            } else {
                // showToast('error', response.paramObjectsMap.message || 'Failed to generate document ID');
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
            const response = await apiCalls('get', `/ncontroller/getCallsById?id=${id}`);

            if (response.status === true) {
                const call = response.paramObjectsMap.callsVO;
                setEditId(id);
                setListView(false);

                setFormData({
                    meetingId: call.meetingId,
                    meetingDate: call.meetingDate,
                    clientName: call.clientName,
                    contactName: call.contactName,
                    email: call.email,
                    mobile: call.mobile,
                    Parent: call.Parent,
                    venue: call.venue,
                    branch: call.branch,
                    branchCode: call.branchCode,
                    dateStart: call.dateStart,
                    timeStart: call.timeStart,
                    dateEnd: call.dateEnd,
                    timeEnd: call.timeEnd,
                    duration: call.duratrion, // Note: API has typo "duratrion"
                    description: call.description,
                    address: call.address,
                    status: call.status,
                    followUpDate: call.follwUpDate,
                    active: call.active
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
        } else if (name === 'timeStart' && value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            errorMessage = 'Invalid time format (HH:mm)';
        } else if (name === 'timeEnd' && value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            errorMessage = 'Invalid time format (HH:mm)';
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
        const formattedDate = dayjs(date).format('YYYY-MM-DD');
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
            meetingId: '',
            meetingDate: null,
            clientName: '',
            contactName: '',
            email: '',
            mobile: '',
            Parent: '',
            venue: '',
            branch: firstBranch ? firstBranch.branch : '',
            branchCode: firstBranch ? firstBranch.branchCode : '',
            dateStart: null,
            timeStart: '',
            dateEnd: null,
            timeEnd: '',
            duration: '',
            description: '',
            address: '',
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
        if (!formData.meetingDate) errors.meetingDate = 'Meeting Date is required';
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactName) errors.contactName = 'Contact name is required';
        if (!formData.branch) errors.branch = 'Branch is required';
        if (!formData.dateStart) errors.dateStart = 'Start date is required';
        if (!formData.timeStart) errors.timeStart = 'Start time is required';
        if (!formData.status) errors.status = 'Status is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare API payload
        const payload = {
            ...formData,
            id: editId || 0,
            finYear: finYear,
            createdBy: loginUserName,
            orgId: parseInt(orgId),
            mobile: formData.mobile ? parseInt(formData.mobile) : null,
            duratrion: formData.duration, // Note: API expects "duratrion"
            follwUpDate: formData.followUpDate, // Note: API expects "follwUpDate"
            cancel: formData.status === 'Cancelled'
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
        { accessorKey: 'meetingId', header: 'Meeting Id', size: 120 },
        { accessorKey: 'meetingDate', header: 'Meeting Date', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 180 },
        { accessorKey: 'contactName', header: 'Contact', size: 150 },
        { accessorKey: 'mobile', header: 'Mobile', size: 130 },
        { accessorKey: 'Parent', header: 'Parent', size: 130 },
        { accessorKey: 'venue', header: 'Venue', size: 130 },
        { accessorKey: 'dateStart', header: 'Date', size: 120 },
        { accessorKey: 'timeStart', header: 'Time', size: 100 },
        { accessorKey: 'status', header: 'Status', size: 120 },
        { accessorKey: 'active', header: 'Active', size: 100 }
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
                                label="Meeting Id"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled
                                name="meetingId"
                                value={isDocIdLoading ? "Generating..." : formData.meetingId}
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
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </div>

                        {/* Client Name */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                                <InputLabel id="assignTo-label">Client Name</InputLabel>
                                <Select
                                    labelId="assignTo-label"
                                    label="Client Name"
                                    value={formData.assignTo}
                                    onChange={handleInputChange}
                                    name="assignTo"
                                >
                                    {assignToOptions.map((dir) => (
                                        <MenuItem key={dir} value={dir}>
                                            {dir}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.assignTo && <FormHelperText>{fieldErrors.assignTo}</FormHelperText>}
                            </FormControl>
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
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                                <InputLabel id="assignTo-label">Contact Name</InputLabel>
                                <Select
                                    labelId="assignTo-label"
                                    label="Contact Name"
                                    value={formData.assignTo}
                                    onChange={handleInputChange}
                                    name="assignTo"
                                >
                                    {assignToOptions.map((dir) => (
                                        <MenuItem key={dir} value={dir}>
                                            {dir}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.assignTo && <FormHelperText>{fieldErrors.assignTo}</FormHelperText>}
                            </FormControl>
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

                        {/* Duration */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                                <InputLabel id="assignTo-label">Duration</InputLabel>
                                <Select
                                    labelId="assignTo-label"
                                    label="Duration"
                                    value={formData.assignTo}
                                    onChange={handleInputChange}
                                    name="assignTo"
                                >
                                    {assignToOptions.map((dir) => (
                                        <MenuItem key={dir} value={dir}>
                                            {dir}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.assignTo && <FormHelperText>{fieldErrors.assignTo}</FormHelperText>}
                            </FormControl>
                        </div>

                        {/* Start Date */}
                        <div className="col-md-3 mb-3">
                            <FormControl fullWidth variant="filled" size="small">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date *"
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
                                label="Start Time * (HH:mm)"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="timeStart"
                                value={formData.timeStart}
                                onChange={handleInputChange}
                                placeholder="09:30"
                                error={!!fieldErrors.timeStart}
                                helperText={fieldErrors.timeStart}
                            />
                        </div>

                        {/* End Time */}
                        <div className="col-md-3 mb-3">
                            <TextField
                                label="End Time (HH:mm)"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="timeEnd"
                                value={formData.timeEnd}
                                onChange={handleInputChange}
                                placeholder="10:30"
                                error={!!fieldErrors.timeEnd}
                                helperText={fieldErrors.timeEnd}
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
                        <div className="col-md-6 mb-3">
                            <TextField
                                label="Description"
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Address */}
                        <div className="col-md-6 mb-3">
                            <TextField
                                label="Address"
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Assign To */}
                        <div className="col-md-3 mb-3">
                            <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                                <InputLabel id="assignTo-label">Assign To </InputLabel>
                                <Select
                                    labelId="assignTo-label"
                                    label="Assign To "
                                    value={formData.assignTo}
                                    onChange={handleInputChange}
                                    name="assignTo"
                                >
                                    {assignToOptions.map((dir) => (
                                        <MenuItem key={dir} value={dir}>
                                            {dir}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.assignTo && <FormHelperText>{fieldErrors.assignTo}</FormHelperText>}
                            </FormControl>
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
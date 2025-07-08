import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import {FormHelperText } from '@mui/material';


const Calls = () => {
    const orgId = parseInt(localStorage.getItem('orgId'));
    const loginUserName = localStorage.getItem('userName');
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [branchList, setBranchList] = useState([]);
    const [listView, setListView] = useState(false);
    const [listViewData, setListViewData] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        active: true,
        branch: '',
        branchCode: '',
        branchName: '',
        clientName: '',
        contactName: '',
        direction: '',
        duratrion: '',
        status: '',
        dateStart: dayjs(),
        dateEnd: dayjs(),
        timeStart: dayjs().format('HH:mm'),
        timeEnd: dayjs().add(30, 'minute').format('HH:mm'),
        description: '',
        email: '',
        mobile: '',
        follwUpDate: dayjs().add(1, 'day'),
    });

    // Field errors
    const [fieldErrors, setFieldErrors] = useState({
        branch: '',
        clientName: '',
        contactName: '',
        direction: '',
        status: '',
        mobile: '',
    });

    // List view columns
    const listViewColumns = [
        { accessorKey: 'id', header: 'Call ID', size: 120 },
        { accessorKey: 'clientName', header: 'Client', size: 160 },
        { accessorKey: 'contactName', header: 'Contact', size: 140 },
        { accessorKey: 'direction', header: 'Direction', size: 100 },
        { accessorKey: 'duratrion', header: 'Duration', size: 100 },
        { accessorKey: 'status', header: 'Status', size: 120 },
        { accessorKey: 'active', header: 'Active', size: 80 },
    ];

    // Fetch initial data
    useEffect(() => {
        getAllBranches();
        // getCallsData();
    }, []);

    // Get branch list
    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchList(branchData);
        } catch (error) {
            console.error('Error fetching branches:', error);
            showToast('error', 'Failed to load branch data');
        }
    };

    // Get calls data for list view
    // const getCallsData = async () => {
    //     try {
    //         const response = await apiCalls('get', `calls/getAllCalls?orgId=${orgId}`);
    //         if (response.status) {
    //             setListViewData(response.data);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching calls:', error);
    //         showToast('error', 'Failed to load calls data');
    //     }
    // };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        // For checkboxes
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // For select dropdowns
        if (type === 'select-one') {
            // Special handling for branch selection
            if (name === 'branch') {
                const selectedBranch = branchList.find(b => b.id === value);
                setFormData(prev => ({
                    ...prev,
                    branch: value,
                    branchCode: selectedBranch?.branchCode || '',
                    branchName: selectedBranch?.branchName || ''
                }));
                return;
            }

            setFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        // For text inputs
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle date changes
    const handleDateChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle time changes
    const handleTimeChange = (name, value) => {
        if (value) {
            const timeString = value.format('HH:mm');
            setFormData(prev => ({ ...prev, [name]: timeString }));
        }
    };

    // Handle clear form
    const handleClear = () => {
        setFormData({
            active: true,
            branch: '',
            branchCode: '',
            branchName: '',
            clientName: '',
            contactName: '',
            direction: '',
            duratrion: '',
            status: '',
            dateStart: dayjs(),
            dateEnd: dayjs(),
            timeStart: dayjs().format('HH:mm'),
            timeEnd: dayjs().add(30, 'minute').format('HH:mm'),
            description: '',
            email: '',
            mobile: '',
            follwUpDate: dayjs().add(1, 'day'),
        });
        setFieldErrors({
            branch: '',
            clientName: '',
            contactName: '',
            direction: '',
            status: '',
            mobile: '',
        });
        setEditId('');
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!formData.branch) {
            errors.branch = 'Branch is required';
            isValid = false;
        }

        if (!formData.clientName.trim()) {
            errors.clientName = 'Client name is required';
            isValid = false;
        }

        if (!formData.contactName.trim()) {
            errors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!formData.direction) {
            errors.direction = 'Direction is required';
            isValid = false;
        }

        if (!formData.status) {
            errors.status = 'Status is required';
            isValid = false;
        }

        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            errors.mobile = 'Invalid mobile number (10 digits required)';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Format dates for API
            const payload = {
                ...formData,
                dateStart: formData.dateStart.format('YYYY-MM-DD'),
                dateEnd: formData.dateEnd.format('YYYY-MM-DD'),
                follwUpDate: formData.follwUpDate.format('YYYY-MM-DD'),
                timeStart: {
                    hour: formData.timeStart.split(':')[0],
                    minute: formData.timeStart.split(':')[1],
                    second: "00",
                    nano: 0
                },
                timeEnd: {
                    hour: formData.timeEnd.split(':')[0],
                    minute: formData.timeEnd.split(':')[1],
                    second: "00",
                    nano: 0
                },
                orgId: orgId,
                createdBy: loginUserName,
                cancel: false,
                finYear: new Date().getFullYear().toString(),
                id: editId || 0
            };

            const endpoint = editId ? 'calls/updateCall' : 'calls/createCall';
            const method = editId ? 'put' : 'post';

            const response = await apiCalls(method, endpoint, payload);

            if (response.status) {
                showToast('success', `Call ${editId ? 'updated' : 'created'} successfully!`);
                handleClear();
                // getCallsData();
            } else {
                showToast('error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving call:', error);
            showToast('error', 'Failed to save call');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle view toggle
    const handleView = () => {
        setListView(!listView);
    };

    // Get call by ID for editing
    const getCallById = async (row) => {
        try {
            const response = await apiCalls('get', `calls/getCallById/${row.original.id}`);
            if (response.status) {
                const callData = response.data;
                setEditId(callData.id);

                // Convert API time objects to strings
                const timeStartStr = `${callData.timeStart.hour.padStart(2, '0')}:${callData.timeStart.minute.padStart(2, '0')}`;
                const timeEndStr = `${callData.timeEnd.hour.padStart(2, '0')}:${callData.timeEnd.minute.padStart(2, '0')}`;

                setFormData({
                    ...callData,
                    dateStart: dayjs(callData.dateStart),
                    dateEnd: dayjs(callData.dateEnd),
                    follwUpDate: dayjs(callData.follwUpDate),
                    timeStart: timeStartStr,
                    timeEnd: timeEndStr,
                });

                setListView(false);
            }
        } catch (error) {
            console.error('Error fetching call details:', error);
            showToast('error', 'Failed to load call details');
        }
    };

    return (
        <>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={SearchIcon} onClick={handleView} />
                        <ActionButton
                            title={editId ? "Update" : "Save"}
                            icon={SaveIcon}
                            isLoading={isLoading}
                            onClick={handleSave}
                            margin="0 10px 0 10px"
                        />
                    </div>
                </div>

                {listView ? (
                    <div className="mt-4">
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getCallById}
                        />
                    </div>
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="row">
                            {/* Branch Selection */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth size="small" error={!!fieldErrors.branch}>
                                    <InputLabel>Branch *</InputLabel>
                                    <Select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        label="Branch *"
                                    >
                                        {branchList.map((branch) => (
                                            <MenuItem key={branch.id} value={branch}>
                                                {branch.branchName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
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

                            {/* Direction */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth size="small" error={!!fieldErrors.direction}>
                                    <InputLabel>Direction *</InputLabel>
                                    <Select
                                        name="direction"
                                        value={formData.direction}
                                        onChange={handleInputChange}
                                        label="Direction *"
                                    >
                                        <MenuItem value="Incoming">Incoming</MenuItem>
                                        <MenuItem value="Outgoing">Outgoing</MenuItem>
                                    </Select>
                                    {fieldErrors.direction && <FormHelperText>{fieldErrors.direction}</FormHelperText>}
                                </FormControl>
                            </div>

                            {/* Duration */}
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Duration (HH:MM)"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="duratrion"
                                    value={formData.duratrion}
                                    onChange={handleInputChange}
                                    placeholder="00:30"
                                />
                            </div>

                            {/* Status */}
                            <div className="col-md-3 mb-3">
                                <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                                    <InputLabel>Status *</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        label="Status *"
                                    >
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Missed">Missed</MenuItem>
                                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                                        <MenuItem value="Rescheduled">Rescheduled</MenuItem>
                                        <MenuItem value="Follow-up">Follow-up</MenuItem>
                                    </Select>
                                    {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                                </FormControl>
                            </div>

                            {/* Start Date */}
                            <div className="col-md-3 mb-3">
                                <DatePicker
                                    label="Start Date"
                                    value={formData.dateStart}
                                    onChange={(newValue) => handleDateChange('dateStart', newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </div>

                            {/* Start Time */}
                            <div className="col-md-3 mb-3">
                                <TimePicker
                                    label="Start Time"
                                    value={dayjs().set({
                                        hour: parseInt(formData.timeStart.split(':')[0]),
                                        minute: parseInt(formData.timeStart.split(':')[1])
                                    })}
                                    onChange={(newValue) => handleTimeChange('timeStart', newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </div>

                            {/* End Date */}
                            <div className="col-md-3 mb-3">
                                <DatePicker
                                    label="End Date"
                                    value={formData.dateEnd}
                                    onChange={(newValue) => handleDateChange('dateEnd', newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </div>

                            {/* End Time */}
                            <div className="col-md-3 mb-3">
                                <TimePicker
                                    label="End Time"
                                    value={dayjs().set({
                                        hour: parseInt(formData.timeEnd.split(':')[0]),
                                        minute: parseInt(formData.timeEnd.split(':')[1])
                                    })}
                                    onChange={(newValue) => handleTimeChange('timeEnd', newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </div>

                            {/* Follow-up Date */}
                            <div className="col-md-3 mb-3">
                                <DatePicker
                                    label="Follow-up Date"
                                    value={formData.follwUpDate}
                                    onChange={(newValue) => handleDateChange('follwUpDate', newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
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
                                />
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

                            {/* Active Checkbox */}
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
                    </LocalizationProvider>
                )}
            </div>
            <ToastComponent />
        </>
    );
};

export default Calls;
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from "@mui/icons-material/Add";
import { Avatar, Typography, Button, Dialog, DialogContent, Checkbox, FormControlLabel, FormControl, Autocomplete } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';

const Schedule = ({ selectedRow }) => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [isLoading, setIsLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [editId, setEditId] = useState('');
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [open, setOpen] = useState(false);
  const [supportingImg, setImg] = useState(null);

  // API data states
  const [clientOptions, setClientOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [assignedToOptions, setAssignedToOptions] = useState([]);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getTaskById({ original: selectedRow });
    }
  }, [selectedRow]);
  // Form state
  const [formData, setFormData] = useState({
    taskId: '',
    taskDate: dayjs().format('YYYY-MM-DD'),
    clientName: '',
    branch: branch,
    branchName: '',
    customerName: '',
    taskName: '',
    taskType: '',
    duration: '',
    status: 'Pending',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    priority: 'Medium',
    startTime: '',
    endTime: '',
    description: '',
    assignedTo: '',
    assignedName: '',
    finYear: finYear,
    orgId: orgId,
    branch: branch,
    branchCode: branchCode,
    createdBy: loginUserName,
    active: true
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({
    taskName: '',
    branch: '',
    startDate: '',
    startTime: '',
    endTime: '',
    status: '',
    assignedTo: ''
  });

  // Column definitions for list view
  const listViewColumns = [
    { accessorKey: 'docId', header: 'Task ID', size: 120 },
    { accessorKey: 'docDate', header: 'Task Date', size: 120 },
    { accessorKey: 'taskName', header: 'Task Name', size: 180 },
    { accessorKey: 'taskType', header: 'Type', size: 100 },
    { accessorKey: 'priority', header: 'Priority', size: 100 },
    { accessorKey: 'startDate', header: 'Start Date', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 120 },
    { accessorKey: 'assignedName', header: 'Assigned To', size: 150 },
    {
      accessorKey: 'active',
      header: 'Active',
      size: 100,
      Cell: ({ cell }) => (cell.getValue() === 'Active' || cell.getValue() === true ? 'Active' : 'Inactive')
    }
  ];

  useEffect(() => {
    getAllBranches();
    getAllTasks();
    fetchClientOptions();
    fetchAssignedToOptions();
  }, []);

  useEffect(() => {
    if (formData.branch && formData.branchCode && !editId) {
      getscheduleDocId();
    }
  }, [formData.branch, formData.branchCode, editId]);

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const duration = calculateDuration(formData.startTime, formData.endTime);
      setFormData((prev) => ({ ...prev, duration }));
    } else if (!formData.startTime || !formData.endTime) {
      setFormData((prev) => ({ ...prev, duration: '' }));
    }
  }, [formData.startTime, formData.endTime]);

  useEffect(() => {
    if (formData.clientName) {
      fetchBranchOptions(formData.clientName);
      fetchCustomerOptions(formData.clientName);
    } else {
      setBranchOptions([]);
      setCustomerOptions([]);
    }
  }, [formData.clientName]);

  // Fetch client names from API
  const fetchClientOptions = async () => {
    try {
      const response = await apiCalls('get', `/activities/getClientNameFromLead?orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.clientName) {
        setClientOptions(response.paramObjectsMap.clientName);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showToast('error', 'Failed to load clients');
    }
  };

  // Fetch branches based on client selection
  const fetchBranchOptions = async (clientName) => {
    try {
      const response = await apiCalls('get', `/activities/getBranchNameFromLeadFillGrid?clientName=${clientName}&orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.branchName) {
        setBranchOptions(response.paramObjectsMap.branchName);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      showToast('error', 'Failed to load branches for this client');
    }
  };

  // Fetch customers based on client selection
  const fetchCustomerOptions = async (clientName) => {
    try {
      const response = await apiCalls('get', `/activities/getCustomerNameFromLead?clientName=${clientName}&orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.customerName) {
        setCustomerOptions(response.paramObjectsMap.customerName);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('error', 'Failed to load customers for this client');
    }
  };

  // Fetch assigned users from API
  const fetchAssignedToOptions = async () => {
    try {
      const response = await apiCalls('get', `/activities/getAssignedUserName?orgId=${orgId}`);

      if (response.status === true && response.paramObjectsMap.assginedUserName) {
        setAssignedToOptions(
          response.paramObjectsMap.assginedUserName.map((user) => ({
            assignedTo: user.assignedTo,
            assignedUser: user.assignedUser
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      showToast('error', 'Failed to load assigned users');
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

  const getAllTasks = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/activities/getAllScheduleByOrgId?branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status === true) {
        const formattedData = response.paramObjectsMap.scheduleVO.map((task) => ({
          ...task,
          id: task.id, // Ensure id is included for editing
          active: task.active === 'Active' || task.active === true
        }));
        setListViewData(formattedData);
      } else {
        showToast('error', response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('error', 'Failed to fetch tasks');
    }
  };

  const getscheduleDocId = async () => {
    if (!formData.branch || !formData.branchCode) return;
    setIsDocIdLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `/activities/getScheduleDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status === true && response.paramObjectsMap.scheduleDocId) {
        setFormData((prev) => ({
          ...prev,
          taskId: response.paramObjectsMap.scheduleDocId
        }));
      }
    } catch (error) {
      console.error('Error getting document ID:', error);
      showToast('error', 'Failed to generate document ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getTaskById = async (row) => {
    try {
      setEditId(row.original.id);
      const response = await apiCalls('get', `/activities/getScheduleById?id=${row.original.id}`);

      if (response.status === true) {
        const task = response.paramObjectsMap.scheduleVO;
        setListView(false);
        setImg(task.attachments);
        setFormData({
          taskId: task.docId || '',
          taskDate: task.docDate || dayjs().format('YYYY-MM-DD'),
          taskName: task.taskName || '',
          taskType: task.taskType || '',
          clientName: task.clientName || '',
          customerName: task.customerName || '',
          branch: task.branch || branch,
          branchCode: task.branchCode || branchCode,
          branchName: task.branchName || '',
          priority: task.priority || 'Medium',
          startDate: task.startDate || dayjs().format('YYYY-MM-DD'),
          startTime: task.startTime ? task.startTime.slice(0, 5) : '',
          endDate: task.endDate || dayjs().format('YYYY-MM-DD'),
          endTime: task.endTime ? task.endTime.slice(0, 5) : '',
          duration: task.duration || '',
          status: task.status || 'Pending',
          assignedTo: task.assignedTo || '',
          assignedName: task.assignedName || task.assignedTo || '',
          description: task.description || '',
          active: task.active === 'Active' || task.active === true,
          finYear: finYear,
          orgId: orgId,
          createdBy: loginUserName
        });
        setIsLoading(false);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      showToast('error', 'Failed to fetch task details');
    }
  };

  // Helper function to validate time format
  const isValidTime = (value) => {
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

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    // Validation
    let errorMessage = '';
    if ((name === 'startTime' || name === 'endTime') && value && !isValidTime(value)) {
      errorMessage = 'Invalid time format (HH:mm required)';
    }

    if (errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };

  const handleBranchChange = (e) => {
    const branchName = e.target.value;
    const selectedBranch = branchList.find((b) => b.branch === branchName);

    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branch: branchName,
        branchCode: selectedBranch.branchCode
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      taskId: '',
      taskDate: dayjs().format('YYYY-MM-DD'),
      taskName: '',
      taskType: 'General',
      clientName: '',
      customerName: '',
      branch: branch,
      branchCode: branchCode,
      priority: 'Medium',
      startDate: dayjs().format('YYYY-MM-DD'),
      startTime: '',
      endDate: dayjs().format('YYYY-MM-DD'),
      endTime: '',
      duration: '',
      status: 'Pending',
      assignedTo: '',
      assignedName: '',
      description: '',
      active: true,
      finYear: finYear,
      orgId: orgId,
      createdBy: loginUserName
    });
    setEditId('');
    setFieldErrors({});
    getscheduleDocId();
    setImg(null);
  };

  const handleSave = async () => {
    // Validation
    const errors = {};
    if (!formData.taskName) errors.taskName = 'Task name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.assignedTo) errors.assignedTo = 'Assign To is required';

    // Time validation
    if (formData.startTime && !isValidTime(formData.startTime)) {
      errors.startTime = 'Invalid start time format (HH:mm)';
    }
    if (formData.endTime && !isValidTime(formData.endTime)) {
      errors.endTime = 'Invalid end time format (HH:mm)';
    }
    if (formData.startTime && formData.endTime && formData.duration.includes('before')) {
      errors.endTime = 'End time must be after start time';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    const payload = {
      ...(editId && { id: editId }),
      createdBy: loginUserName,
      finYear: finYear,
      orgId: parseInt(orgId),
      branch: formData.branch,
      branchCode: formData.branchCode,
      active: formData.active,
      assignedName: formData.assignedName || formData.assignedTo,
      assignedTo: formData.assignedTo,
      clientName: formData.clientName,
      customerName: formData.customerName,
      description: formData.description,
      endDate: formData.endDate,
      endTime: formData.endTime,
      priority: formData.priority,
      startDate: formData.startDate,
      startTime: formData.startTime,
      status: formData.status,
      taskName: formData.taskName,
      taskType: formData.taskType,
      docId: formData.taskId,
      docDate: formData.taskDate,
      duration: formData.duration
    };

    try {
      const response = await apiCalls('put', '/activities/createUpdateSchedule', payload);

      if (response.status === true) {
        showToast('success', editId ? 'Task Updated Successfully' : 'Task Created Successfully');
        const generatedId = response.paramObjectsMap?.ScheduleVO?.id || editId;
        if (generatedId && supportingImg && typeof supportingImg === 'object') {
          await handleFileUpload(generatedId);
        }
        handleClear();
        getAllTasks();
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('error', 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setImg(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const handleFileUpload = async (generatedId) => {
    if (!generatedId) return;
    const formData = new FormData();
    formData.append('file', supportingImg);
    try {
      const response = await apiCalls(
        'post',
        `/activities/uploadAttachmentsTaskInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        showToast('error', 'Image upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload image');
    }
  };

  const handleRemoveImg = () => setImg(null);

  // Task type options
  const taskTypeOptions = ['General', 'Meeting', 'Call', 'Email', 'Other'];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="d-flex justify-content-between mb-3" style={{ marginBottom: '20px' }}>
          <div className="d-flex flex-wrap">
            {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
            {!listView && (
              <>
                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
              </>
            )}
          </div>
        </div>

        {listView ? (
          <div className="mt-0">
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} blockEdit={true} toEdit={getTaskById} />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Task ID */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Task ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  name="taskId"
                  value={isDocIdLoading ? 'Generating...' : formData.taskId}
                  InputProps={{
                    style: { backgroundColor: '#f5f5f5' }
                  }}
                />
              </div>

              {/* Task Date */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Task Date "
                      disabled
                      value={dayjs(formData.taskDate, 'YYYY-MM-DD')}
                      onChange={(date) => handleDateChange('taskDate', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.taskDate,
                          helperText: fieldErrors.taskDate
                        }
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Client Name */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={clientOptions}
                  getOptionLabel={(option) => option.clientName || ''}
                  value={clientOptions.find((opt) => opt.clientName === formData.clientName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      clientName: newValue ? newValue.clientName : '',
                      branch: branch,
                      customerName: ''
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Client Name" variant="outlined" />}
                />
              </div>

              {/* Branch */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={branchOptions}
                  getOptionLabel={(option) => option.branch || ''}
                  value={branchOptions.find((opt) => opt.branch === formData.branch) || null}
                  onChange={(event, newValue) => {
                    const branchName = newValue ? newValue.branch : branch;
                    const selectedBranch = branchList.find((b) => b.branch === branchName);

                    setFormData((prev) => ({
                      ...prev,
                      branch: branchName,
                      branchCode: selectedBranch ? selectedBranch.branchCode : branchCode,
                      branchName: branchName
                    }));
                  }}
                  disabled={!formData.clientName}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <span>
                          Branch <span className="asterisk">*</span>
                        </span>
                      }
                      variant="outlined"
                      error={!!fieldErrors.branch}
                      helperText={fieldErrors.branch}
                    />
                  )}
                />
              </div>

              {/* Customer Name */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={customerOptions}
                  getOptionLabel={(option) => option.customerName || ''}
                  value={customerOptions.find((opt) => opt.customerName === formData.customerName) || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      customerName: newValue ? newValue.customerName : ''
                    }));
                  }}
                  disabled={!formData.clientName}
                  renderInput={(params) => <TextField {...params} label="Customer Name" variant="outlined" />}
                />
              </div>

              {/* Task Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label={
                    <span>
                      Task Name <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.taskName}
                  helperText={fieldErrors.taskName}
                />
              </div>

              {/* Task Type */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={taskTypeOptions}
                  value={formData.taskType || ''}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'taskType',
                        value: newValue || ''
                      }
                    });
                  }}
                  renderInput={(params) => <TextField {...params} label="Task Type" variant="outlined" />}
                />
              </div>

              {/* Status */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={statusOptions}
                  value={formData.status || ''}
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
                      value={dayjs(formData.startDate, 'YYYY-MM-DD')}
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
                      value={dayjs(formData.endDate, 'YYYY-MM-DD')}
                      onChange={(date) => handleDateChange('endDate', date)}
                      slotProps={{ textField: { size: 'small' } }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Start Time */}
              <div className="col-md-3 mb-3">
                <TextField
                  label={
                    <span>
                      Start Time <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputProps={{
                    step: 300
                  }}
                  error={!!fieldErrors.startTime}
                  helperText={fieldErrors.startTime}
                />
              </div>

              {/* End Time */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="End Time"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputProps={{
                    step: 300
                  }}
                  error={!!fieldErrors.endTime}
                  helperText={fieldErrors.endTime}
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
                  disabled
                  InputProps={{
                    style: { backgroundColor: '#f5f5f5' }
                  }}
                />
              </div>

              {/* Priority */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={priorityOptions}
                  value={formData.priority || ''}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: {
                        name: 'priority',
                        value: newValue || ''
                      }
                    });
                  }}
                  renderInput={(params) => <TextField {...params} label="Priority" variant="outlined" />}
                />
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
                />
              </div>

              {/* Assign To */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  size="small"
                  fullWidth
                  options={assignedToOptions}
                  getOptionLabel={(option) => option.assignedUser || ''}
                  value={assignedToOptions.find((opt) => opt.assignedTo === formData.assignedTo) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        assignedTo: newValue.assignedTo,
                        assignedName: newValue.assignedUser
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        assignedTo: '',
                        assignedName: ''
                      }));
                    }
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
                      error={!!fieldErrors.assignedTo}
                      helperText={fieldErrors.assignedTo}
                    />
                  )}
                />
              </div>

              {/* Assigned Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Assigned Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="assignedName"
                  value={formData.assignedName}
                  disabled
                  InputProps={{
                    style: { backgroundColor: '#f5f5f5' }
                  }}
                />
              </div>

              {/* Image Upload */}
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    multiline
                    startIcon={<CloudUploadIcon />}
                    sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                  >
                    {supportingImg
                      ? typeof supportingImg === 'object' && supportingImg.name
                        ? supportingImg.name
                        : 'Image Uploaded'
                      : 'Upload Img'}
                    <input type="file" hidden accept="image/png, image/jpeg" onChange={handleImgChange} />
                  </Button>

                  {supportingImg && (
                    <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                      <ControlCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                  <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                      Attachment
                    </Typography>
                    {supportingImg ? (
                      <Box>
                        <Avatar
                          src={
                            typeof supportingImg === 'object'
                              ? URL.createObjectURL(supportingImg)
                              : `data:image/jpeg;base64,${supportingImg}`
                          }
                          alt="Attachment"
                          sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                        />
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleRemoveImg}
                          >
                            Delete
                          </IconButton>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                          <Typography variant="caption">No Image</Typography>
                        </Avatar>
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Active */}
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" color="primary" />}
                  label="Active"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default Schedule;

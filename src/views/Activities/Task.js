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
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { FormHelperText, Button, Checkbox, FormControlLabel } from '@mui/material';
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

const Task = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [editId, setEditId] = useState('');
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [finYear] = useState(new Date().getFullYear().toString());
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    taskId: '',
    taskDate: null,
    taskName: '',
    taskType: 'General',
    clientName: '',
    customerName: '',
    branch: '',
    branchCode: '',
    priority: 'Medium',
    startDate: null,
    startTime: '',
    endDate: null,
    endTime: '',
    duration: '',
    status: 'Pending',
    assignedTo: '',
    description: '',
    active: true
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({
    taskDate: '',
    taskName: '',
    branch: '',
    startDate: '',
    startTime: '',
    status: '',
    assignedTo: ''
  });

  // Column definitions for list view
  const listViewColumns = [
    { accessorKey: 'docId', header: 'Task ID', size: 120 },
    { accessorKey: 'taskDate', header: 'Task Date', size: 120 },
    { accessorKey: 'taskName', header: 'Task Name', size: 180 },
    { accessorKey: 'taskType', header: 'Type', size: 100 },
    { accessorKey: 'priority', header: 'Priority', size: 100 },
    { accessorKey: 'startDate', header: 'Start Date', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 120 },
    { accessorKey: 'assignedTo', header: 'Assigned To', size: 150 },
    { accessorKey: 'active', header: 'Active', size: 100 },
  ];

  useEffect(() => {
    getAllBranches();
    getAllTasks();
  }, []);

  useEffect(() => {
    if (formData.branch && formData.branchCode && !editId) {
      getTaskDocId();
    }
  }, [formData.branch, formData.branchCode, editId]);

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const duration = calculateDuration(formData.startTime, formData.endTime);
      setFormData(prev => ({ ...prev, duration }));
    } else if (!formData.startTime || !formData.endTime) {
      setFormData(prev => ({ ...prev, duration: '' }));
    }
  }, [formData.startTime, formData.endTime]);

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

  const getAllTasks = async () => {
    try {
      const response = await apiCalls(
        'get', `/activities/getAllTaskByOrgId?orgId=${orgId}`
      );

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.taskVO);
      } else {
        showToast('error', response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('error', 'Failed to fetch tasks');
    }
  };

  const getTaskDocId = async () => {
    if (!formData.branch || !formData.branchCode) return;

    setIsDocIdLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `/activities/getTaskDocId?branch=${formData.branch}&branchCode=${formData.branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status === true && response.paramObjectsMap.callsDocId) {
        setFormData(prev => ({
          ...prev,
          taskId: response.paramObjectsMap.callsDocId
        }));
      }
    } catch (error) {
      console.error('Error getting document ID:', error);
      showToast('error', 'Failed to generate document ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getTaskById = async (id) => {
    try {
      const response = await apiCalls('get', `/activities/getTaskById?id=${id}`);

      console.log('Editing task ID:', id);
      if (response.status === true) {
        const task = response.paramObjectsMap.taskVO;
        setEditId(id);
        setListView(false);


        // Handle date formatting correctly
        const formatDate = (dateString) => {
          if (!dateString) return null;
          // Ensure date is in YYYY-MM-DD format
          return dayjs(dateString).format('YYYY-MM-DD');
        };

        setFormData({
          taskId: task.docId || '',
          // taskDate: formatDate(task.docDate),
          // taskDate: task.docDate || null,
          taskDate: task.docDate ? dayjs(task.docDate).format('YYYY-MM-DD') : null,
          taskName: task.taskName || '',
          taskType: task.taskType || 'General',
          clientName: task.clientName || '',
          customerName: task.customerName || '',
          branch: task.branch || '',
          branchCode: task.branchCode || '',
          priority: task.priority || 'Medium',
          startDate: formatDate(task.startDate),
          startTime: task.startTime ? task.startTime.slice(0, 5) : '', // Ensure HH:mm format
          endDate: formatDate(task.endDate),
          endTime: task.endTime ? task.endTime.slice(0, 5) : '', // Ensure HH:mm format
          duration: task.duration || '',
          status: task.status || 'Pending',
          assignedTo: task.assignedTo || '',
          description: task.description || '',
          active: task.active !== undefined ? task.active : true
        });
      } else {
        showToast('error', response.message || 'Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      showToast('error', 'Failed to fetch task details');
    }
  };

  // Helper function to validate time format
  const isValidTime = (time) => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
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
    if (name === 'startTime' && value && !isValidTime(value)) {
      errorMessage = 'Invalid time format (HH:mm required)';
    } else if (name === 'endTime' && value && !isValidTime(value)) {
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
      taskId: '',
      taskDate: null,
      taskName: '',
      taskType: 'General',
      clientName: '',
      customerName: '',
      branch: firstBranch ? firstBranch.branch : '',
      branchCode: firstBranch ? firstBranch.branchCode : '',
      priority: 'Medium',
      startDate: null,
      startTime: '',
      endDate: null,
      endTime: '',
      duration: '',
      status: 'Pending',
      assignedTo: '',
      description: '',
      active: true
    });
    setEditId('');
    setFieldErrors({});
  };

  const handleSave = async () => {
    // Validation
    const errors = {};
    // if (!formData.taskDate) errors.taskDate = 'Task Date is required';
    if (!formData.taskName) errors.taskName = 'Task name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.assignedTo) errors.assignedTo = 'Assign To is required';

    // Additional time validation
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

    // Prepare API payload
    const payload = {
      ...formData,
      ...(editId && { id: editId }),
      finYear: finYear,
      createdBy: loginUserName,
      orgId: parseInt(orgId),
      docId: formData.taskId,
      docDate: formData.taskDate,
      duration: formData.duration,
      active: formData.active === true || formData.active === 'true'
    };

    try {
      const response = await apiCalls('put', '/activities/createUpdateTask', payload);

      if (response.status === true) {
        showToast('success', editId ? 'Task updated successfully' : 'Task created successfully');
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

  // Task type options
  const taskTypeOptions = ['General', 'Meeting', 'Call', 'Email', 'Other'];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  // Status options
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>

        {listView ? (
          <div className="mt-0">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              blockEdit={true}
              // toEdit={()=>getTaskById(id)}
               toEdit={(row) => getTaskById(row.original.id)}
              
            />
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
                  value={isDocIdLoading ? "Generating..." : formData.taskId}
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
                      value={formData.taskDate ? dayjs(formData.taskDate, 'YYYY-MM-DD') : null}
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

              {/* Task Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Task Name *"
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

              {/* Task Type */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth>
                  <InputLabel id="taskType-label">Task Type</InputLabel>
                  <Select
                    labelId="taskType-label"
                    label="Task Type"
                    value={formData.taskType}
                    onChange={handleInputChange}
                    name="taskType"
                  >
                    {taskTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Priority */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    label="Priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    name="priority"
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Client Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Client Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Customer Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Customer Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Start Date */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date *"
                      value={formData.startDate ? dayjs(formData.startDate, 'YYYY-MM-DD') : null}
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
                      value={formData.endDate ? dayjs(formData.endDate, 'YYYY-MM-DD') : null}
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
                  label="Start Time *"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  placeholder="HH:mm (e.g., 09:30)"
                  error={!!fieldErrors.startTime}
                // helperText={fieldErrors.startTime || "Format: HH:mm (24-hour)"}
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
                  value={formData.endTime}
                  onChange={handleInputChange}
                  placeholder="HH:mm (e.g., 10:45)"
                  error={!!fieldErrors.endTime}
                // helperText={fieldErrors.endTime || "Format: HH:mm (24-hour)"}
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
                //   formData.duration.includes('before')
                //   ? formData.duration : "Calculated automatically"}
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
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.assignedTo}
                  helperText={fieldErrors.assignedTo}
                />
              </div>

              {/* Description */}
              <div className="col-md-12 mb-3">
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
          </>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default Task;
import React, { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';
import { Button, CircularProgress } from '@mui/material';
import CommonReportTable from 'utils/CommonReportTable';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const Active = ({ selectedRow }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const orgId = localStorage.getItem('orgId') || '';
  const branch = localStorage.getItem('branch') || '';
  const branchCode = localStorage.getItem('branchcode');
  const finYear = localStorage.getItem('finYear') || '';
  const loginUserName = localStorage.getItem('userName') || '';
  const [listView, setListView] = useState(false);
  const [myLeads, setMyLeads] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);
  const [assignToOptions, setAssignToOptions] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [typeOptions] = useState(['Call', 'Meeting', 'Visit']);
  const [directionOptions] = useState(['Call Received', 'Call Made']);
  const statusOptions = ['Planned', 'Completed', 'Cancelled', 'Postponed', 'Agreed', 'NotAgreed'];

  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getActiveById({ original: selectedRow });
    }
  }, [selectedRow]);
  useEffect(() => {
    if (myLeads) {
      fetchTabData(activeTab);
    }
  }, [activeTab, myLeads]);
  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      let response;
      if (tab === 'Pending') {
        response = await apiCalls('get', `/transaction/getMyLeads?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`);
        setRowData(response?.paramObjectsMap?.myLeads || []);
      } else if (tab === 'FollowUps') {
        response = await apiCalls(
          'get',
          `/transaction/getMyFollowUpDate?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`
        );
        setRowData(response?.paramObjectsMap?.myFollowUpDate || []);
      } else if (tab === 'ExistCust') {
        response = await apiCalls(
          'get',
          `/transaction/getMyCutsomers?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`
        );
        setRowData(response?.paramObjectsMap?.myCutsomers || []);
      } else if (tab === 'Agreed' || tab === 'NotAgreed') {
        response = await apiCalls(
          'get',
          `/transaction/getMyAgreeOrNotAgree?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}&status=${tab}`
        );
        setRowData(response?.paramObjectsMap?.myAgreeOrNotAgree || []);
      }
      // else if (tab === 'NotAgreed') {
      //     response = await apiCalls('get', `/transaction/getMyLeads?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`);
      //     setRowData(response?.paramObjectsMap?.myLeads || []);
      // }
    } catch (error) {
      console.error('Error:', error);
      setRowData([]);
      showToast('error', 'Report Fetch failed');
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    activeDocId: '',
    docDate: dayjs(),
    active: true,
    address: '',
    assignTo: '',
    branchName: '',
    clientName: '',
    contactName: '',
    description: '',
    direction: '',
    duration: '',
    email: '',
    endDate: null,
    endTime: null,
    followUpDate: null,
    mobileNo: '',
    parent: '',
    startDate: null,
    startTime: null,
    status: '',
    type: '',
    venue: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    clientName: '',
    contactName: '',
    mobileNo: '',
    email: '',
    branchName: '',
    startDate: '',
    startTime: '',
    status: '',
    type: '',
    assignTo: ''
  });
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
    getClientNames();
    getAssignToOptions();
    getActiveDocId();
    getAllActives();
  }, []);
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const duration = calculateDuration(formData.startTime, formData.endTime);
      setFormData((prev) => ({ ...prev, duration }));
    } else if (!formData.startTime || !formData.endTime) {
      setFormData((prev) => ({ ...prev, duration: '' }));
    }
  }, [formData.startTime, formData.endTime]);
  const getClientNames = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getClientNameFromLeadScreen?orgId=${orgId}`);
      if (response.status === true) {
        setClientOptions(response.paramObjectsMap.clientName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getParentFromLead = async (clientName) => {
    try {
      const response = await apiCalls('get', `/activities/getParentFromLead?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`);

      if (response.status && response.paramObjectsMap.parentName) {
        const parents = response.paramObjectsMap.parentName;
        if (parents.length > 0) {
          setFormData((prev) => ({
            ...prev,
            parent: parents[0].parent || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching parent:', error);
    }
  };
  const getBranchNames = async (clientName) => {
    try {
      const response = await apiCalls(
        'get',
        `/activities/getBranchNameFromLeadFillGrid?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
      );
      if (response.status === true) {
        setBranchOptions(response.paramObjectsMap.branchName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getContactDetails = async (clientName, branchName) => {
    try {
      const response = await apiCalls(
        'get',
        `/activities/getContactNameFromLeadFillGrid?branchName=${branchName}&clientName=${clientName}&orgId=${orgId}`
      );

      if (response.status && response.paramObjectsMap.contactDetails) {
        setContactOptions(response.paramObjectsMap.contactDetails);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('error', 'Failed to load contacts');
    }
  };

  const getAssignToOptions = async () => {
    try {
      const response = await apiCalls('get', `/activities/getAssignedUserName?orgId=${orgId}`);
      setAssignToOptions(response.paramObjectsMap.assginedUserName);
    } catch (error) {
      console.error('Error fetching assignees:', error);
      showToast('error', 'Failed to load assignees');
    }
  };
  const getAllActives = async () => {
    try {
      const response = await apiCalls('get', `/activities/getAllActiveByOrgId?orgId=${orgId}&branchCode=${branchCode}&finYear=${finYear}`);
      if (response.status === true) {
        setListViewData(response.paramObjectsMap.activeVO.reverse() || []);
      } else {
        showToast('error', response.message || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast('error', 'Failed to fetch activities');
    }
  };

  const getActiveDocId = async () => {
    setIsDocIdLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `/activities/getActiveDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status === true && response.paramObjectsMap.activeDocId) {
        setFormData((prev) => ({
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

  const getActiveById = async (row) => {
    setEditId(row.original.id);
    try {
      setIsLoading(true);
      const response = await apiCalls('get', `/activities/getActiveById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const active = response.paramObjectsMap.activeVO;
        getBranchNames(active.clientName);
        getContactDetails(active.clientName, active.branchName);
        setFormData({
          activeDocId: active.docId || '',
          docDate: formData.docDate || null,
          clientName: active.clientName || '',
          contactName: active.contactName || '',
          mobileNo: active.mobileNo ? active.mobileNo.toString() : '',
          email: active.email || '',
          parent: active.parent || '',
          branchName: active.branchName || '',
          duration: active.duration || '',
          description: active.description || '',
          status: active.status || '',
          active: active.active === 'Active' ? true : false,
          venue: active.venue || '',
          address: active.address || '',
          assignTo: active.assignTo || '',
          type: active.type || '',
          direction: active.direction || '',
          startDate: active.startDate ? dayjs(active.startDate) : null,
          startTime: active.startTime ? dayjs(active.startTime, 'HH:mm') : null,
          followUpDate: active.followUpDate ? dayjs(active.followUpDate) : null,
          endDate: active.endDate ? dayjs(active.endDate) : null,
          endTime: active.endTime ? dayjs(active.endTime, 'HH:mm') : null
        });
      } else {
        showToast('error', response.message || 'Failed to fetch opportunity details');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      showToast('error', 'Failed to fetch opportunity details');
    } finally {
      setIsLoading(false);
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
      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };
  const handleTimeChange = (field, time) => {
    setFormData((prev) => ({ ...prev, [field]: time }));

    if (field === 'startTime') {
      setFieldErrors((prev) => ({ ...prev, startTime: '' }));
    } else if (field === 'endTime') {
      setFieldErrors((prev) => ({ ...prev, endTime: '' }));
    }
  };

  const handleClear = () => {
    // let initialBranch = branch;
    // let initialBranchCode = branchCode;

    // if (branchList.length > 0) {
    //     const storedBranch = branchList.find(b => b.branch === branch && b.branchCode === branchCode);

    //     if (storedBranch) {
    //         initialBranch = storedBranch.branch;
    //         initialBranchCode = storedBranch.branchCode;
    //     } else {
    //         initialBranch = branchList[0].branch;
    //         initialBranchCode = branchList[0].branchCode;
    //     }
    // }
    setContactOptions([]);
    setBranchOptions([]);
    getActiveDocId();
    setFormData({
      active: true,
      address: '',
      assignTo: '',
      branchName: '',
      clientName: '',
      contactName: '',
      createdBy: '',
      description: '',
      direction: '',
      duration: '',
      email: '',
      endDate: null,
      endTime: null,
      followUpDate: null,
      mobileNo: '',
      parent: '',
      startDate: null,
      startTime: null,
      status: '',
      type: '',
      venue: ''
    });
    setEditId('');
    setFieldErrors({});
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.clientName) errors.clientName = 'Client name is required';
    if (!formData.contactName) errors.contactName = 'Contact name is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.type) errors.type = 'Type is required';
    // if (!formData.assignTo) errors.assignTo = 'Assign To is required';
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
    const formatDate = (date) => (date ? dayjs(date).format('YYYY-MM-DD') : null);
    const formatTime = (time) => (time ? time.format('HH:mm') : '');
    const payload = {
      ...(editId && { id: editId }),
      branch: branch,
      orgId: orgId,
      branchCode: branchCode,
      finYear: finYear,
      active: formData.active,
      address: formData.address || '',
      assignTo: formData.assignTo || '',
      branchName: formData.branchName || '',
      clientName: formData.clientName || '',
      contactName: formData.contactName || '',
      createdBy: loginUserName || '',
      description: formData.description || '',
      direction: formData.direction || '',
      duration: formData.duration || '',
      email: formData.email || '',
      mobileNo: formData.mobileNo || '',
      parent: formData.parent || '',
      status: formData.status || '',
      type: formData.type || '',
      venue: formData.venue || '',
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime),
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      followUpDate: formatDate(formData.followUpDate)
    };
    console.log('Save data', payload);
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
    handleClear();
  };
  const handleClose = () => setMyLeads(false);
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
    { accessorKey: 'active', header: 'Active', size: 100 }
  ];
  const myLeadsColumns = [
    // { accessorKey: 'docId', header: 'Doc No', size: 100 },
    {
      accessorKey: 'docId',
      header: 'Doc Id',
      size: 100,
      Cell: ({ row }) => {
        const docId = row.original.docId;
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMyLeads(false);
              getBranchNames(row.original.clientName);
              getContactDetails(row.original.clientName, row.original.branchName);
              setFormData((prev) => ({
                ...prev,
                clientName: row.original.clientName || '',
                contactName: row.original.contactName || '',
                mobileNo: row.original.mobileNo || '',
                email: row.original.email || '',
                branchName: row.original.branchName || '',
                address: row.original.address || '',
                parent: row.original.status || '',
                followUpDate: row.original.followUpDate ? dayjs(row.original.followUpDate) : null
              }));
            }}
            style={{
              color: '#f59e0b',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s, text-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#fbbf24';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#f59e0b';
            }}
          >
            {docId}
          </a>
        );
      }
    },
    { accessorKey: 'clientName', header: 'Client Name', size: 100 },
    { accessorKey: 'contactName', header: 'Contact Name', size: 100 },
    { accessorKey: 'branchName', header: 'Branch', size: 100 },
    { accessorKey: 'mobileNo', header: 'Mobile No', size: 100 },
    { accessorKey: 'email', header: 'Email', size: 100 },
    ...(activeTab === 'FollowUps' || activeTab === 'Agreed' || activeTab === 'NotAgreed'
      ? [{ accessorKey: 'followUpDate', header: 'Follow-Ups', size: 100 }]
      : []),
    { accessorKey: 'address', header: 'Address', size: 100 }
  ];
  //     const handleMyLeads = () => {
  //     setLoading(true);
  //     setTimeout(() => {
  //         setLoading(false);
  //         setMyLeads(!myLeads);
  //         handleAllMyLeads();
  //     }, 300);
  // };
  const handleMyLeads = async (tab) => {
    setMyLeads(true);
    fetchTabData(tab);
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <>
      {isLoading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        {!selectedRow && (
          <div className="d-flex justify-content-between mb-4" style={{ marginBottom: '20px' }}>
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
            {!listView && (
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleMyLeads(activeTab)}
                  startIcon={<PersonPinCircleIcon />}
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    py: 0.5,
                    fontSize: '14px',
                    borderRadius: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: loading ? 'none' : 'scale(1.08)',
                      boxShadow: loading ? 'none' : '0px 6px 15px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'My Leads'}
                </Button>
              </div>
            )}
          </div>
        )}
        {listView ? (
          <div className="">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getActiveById} isPdf={false} />
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
                value={isDocIdLoading ? 'Generating...' : formData.activeDocId}
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
                    value={formData.docDate || null}
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
                renderInput={(params) => <TextField {...params} label="Direction" variant="outlined" />}
              />
            </div>

            <div className="col-md-3 mb-3">
              <Autocomplete
                options={clientOptions}
                getOptionLabel={(option) => (option?.clientName ? `${option.clientName}` : '')}
                value={clientOptions.find((item) => item.clientName === formData.clientName) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      clientName: newValue.clientName
                    }));
                    setFieldErrors((prev) => ({ ...prev, clientName: '' }));
                    getBranchNames(newValue.clientName);
                    getParentFromLead(newValue.clientName);
                  } else {
                    setFormData((prev) => ({ ...prev, clientName: '' }));
                    setFieldErrors((prev) => ({ ...prev, clientName: 'Client Name is required' }));
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
                    size="small"
                    error={!!fieldErrors.clientName}
                    helperText={fieldErrors.clientName}
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={branchOptions}
                getOptionLabel={(option) => (option?.branch ? `${option.branch}` : '')}
                value={branchOptions.find((item) => item.branch === formData.branchName) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      branchName: newValue.branch,
                      address: newValue.address
                    }));
                    setFieldErrors((prev) => ({ ...prev, branchName: '', address: '' }));
                    getContactDetails(formData.clientName, newValue.branch);
                  } else {
                    setFormData((prev) => ({ ...prev, branchName: '' }));
                    setFieldErrors((prev) => ({ ...prev, branchName: 'Branch is required' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Branch <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    error={!!fieldErrors.branchName}
                    helperText={fieldErrors.branchName}
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={contactOptions}
                getOptionLabel={(option) => (option?.name ? `${option.name}` : '')}
                value={contactOptions.find((item) => item.name === formData.contactName) || null}
                isOptionEqualToValue={(option, value) => option.name === value.name}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      contactName: newValue.name,
                      mobileNo: newValue.mobileNumber,
                      email: newValue.email
                    }));
                    setFieldErrors((prev) => ({ ...prev, contactName: '', mobileNo: '', email: '' }));
                  } else {
                    setFormData((prev) => ({ ...prev, contactName: '' }));
                    setFieldErrors((prev) => ({ ...prev, contactName: 'Contact Name is required' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Contact Name <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    error={!!fieldErrors.contactName}
                    helperText={fieldErrors.contactName}
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Mobile"
                variant="outlined"
                size="small"
                fullWidth
                disabled
                name="mobileNo"
                value={formData.mobileNo || ''}
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
                disabled
                name="email"
                value={formData.email || ''}
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
                value={formData.parent || ''}
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
                value={formData.address || ''}
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
                    value={formData.startDate || null}
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
                    value={formData.endDate || null}
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
                    value={formData.startTime || null}
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
                    value={formData.endTime || null}
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
                value={formData.duration || ''}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontWeight: 'bold',
                    color: formData.duration.includes('before') ? '#d32f2f' : '#1976d2'
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

            {/* Venue */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Venue"
                variant="outlined"
                size="small"
                fullWidth
                name="venue"
                value={formData.venue || ''}
                onChange={handleInputChange}
              />
            </div>
            {/* Follow-up Date */}
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Follow-up Date"
                    value={formData.followUpDate || null}
                    onChange={(date) => handleDateChange('followUpDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                    format="DD-MM-YYYY"
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={assignToOptions}
                getOptionLabel={(option) => (option?.assignedUser ? `${option.assignedUser} - ${option.assignedTo}` : '')}
                value={assignToOptions.find((item) => item.assignedUser === formData.assignTo) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      assignTo: newValue.assignedUser
                    }));
                    setFieldErrors((prev) => ({ ...prev, assignTo: '' }));
                  } else {
                    setFormData((prev) => ({ ...prev, assignTo: '' }));
                    setFieldErrors((prev) => ({ ...prev, assignTo: 'Assigned To is required' }));
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
                    size="small"
                    error={!!fieldErrors.assignTo}
                    helperText={fieldErrors.assignTo}
                    fullWidth
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
                value={formData.description || ''}
                onChange={handleInputChange}
                multiline
              />
            </div>

            {/* Active */}
            <div className="col-md-3 .mb-3 d-flex align-items-center">
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                label="Active"
              />
            </div>
          </div>
        )}
      </div>
      <>
        {myLeads && (
          <Dialog
            open={myLeads}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            PaperProps={{
              sx: { p: 0, m: 0, borderRadius: 1 }
            }}
          >
            <DialogTitle style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }} id="draggable-dialog-title">
              My Leads
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  color: 'white'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                p: 0,
                backgroundColor: '#0f0f1a'
              }}
            >
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#1a1a2e', color: 'white' }}>
                <Tabs
                  value={activeTab}
                  onChange={(event, newValue) => setActiveTab(newValue)}
                  textColor="inherit"
                  indicatorColor="primary"
                  variant="fullWidth"
                >
                  <Tab value="Pending" label="Leads" />
                  <Tab value="ExistCust" label="Exist-Cust" />
                  <Tab value="FollowUps" label="Follow-Up's" />
                  <Tab value="Agreed" label="Agreed" />
                  <Tab value="NotAgreed" label="Not Agreed" />
                </Tabs>
              </Box>
              <CommonReportTable
                data={rowData}
                columns={myLeadsColumns}
                isListView={true}
                isPdf={false}
                isExcel={false}
                fileName={'My Leads'}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
      <ToastContainer />
    </>
  );
};

export default Active;

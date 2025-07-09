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
import { Avatar, Typography, FormHelperText, Button, Dialog, DialogContent } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry, getAllActiveCurrency } from 'utils/CommonFunctions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Task = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [editId, setEditId] = useState('');
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [finYear] = useState(new Date().getFullYear().toString());
  const [branchList, setBranchList] = useState([]);


  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    website: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyCode: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gstIn: '',
    website: '',
    active: true
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'companyCode', header: 'Company Code', size: 140 },
    {
      accessorKey: 'companyName',
      header: 'Company',
      size: 140
    },
    {
      accessorKey: 'ceo',
      header: 'CEO',
      size: 140
    },
    {
      accessorKey: 'gstIn',
      header: 'GST',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCountries();
    getCompanyDetails();
    getAllCurrency();
  }, []); // Run only once on mount

  useEffect(() => {
    if (formData.country) {
      getAllStates(); // Fetch states only when country changes
    }
  }, [formData.country]); // Only depend on country change

  useEffect(() => {
    if (formData.state) {
      getAllCities(); // Fetch cities only when state changes
    }
  }, [formData.state]); // Only depend on state change

  const getAllCurrency = async () => {
    try {
      const currencyData = await getAllActiveCurrency(orgId);
      setCurrencyList(currencyData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
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

  // Status options
  const statusOptions = ['Completed', 'Pending', 'Rescheduled', 'Cancelled'];
  const assignToOptions = ['Incoming', 'Outgoing'];

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
          taskId: response.paramObjectsMap.callsDocId
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
  const getAllStates = async () => {
    try {
      const stateData = await getAllActiveStatesByCountry(formData.country, orgId);
      setStateList(stateData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCities = async () => {
    try {
      const cityData = await getAllActiveCitiesByState(formData.state, orgId);
      setCityList(cityData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target || e;

    // Regular expressions for validation
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;

    let newValue = value;
    let error = '';

    // Validation logic
    if (name === 'ceo') {
      if (!nameRegex.test(value)) {
        error = 'Only alphabetic characters are allowed';
      }
    } else if (name === 'pincode') {
      if (!numericRegex.test(value)) {
        error = 'Only numeric characters are allowed';
      } else if (value.length > 6) {
        error = 'Only 6 digits are allowed';
      }
    } else if (name === 'mobileNo') {
      if (!alphanumericRegex.test(value)) {
        error = 'Special characters are not allowed';
      } else if (value.length > 10) {
        error = 'Only 10 characters are allowed';
      }
    }

    // Update error state
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));

    // Only update form data if there's no error
    if (!error) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue
      }));
    }

    if (type === 'checkbox') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: checked
      }));
      return; // Exit here to avoid further processing for checkboxes
    }



    // Handle dropdowns separately
    if (type === 'select-one') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value
      }));
      return;
    }

    // If it's not a checkbox or dropdown, process the input normally
    if (type !== 'checkbox' && type !== 'select-one') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: newValue
      }));
    }
  };

  const getCompanyById = async (row) => {
    console.log('THE SELECTED BRANCH ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];
        console.log('PARTICULAR COMPANY IS:', particularCompany);
        setLogo(response.paramObjectsMap.companyVO[0].companyLogo);

        setFormData({
          companyCode: particularCompany.companyCode,
          companyName: particularCompany.companyName,
          ceo: particularCompany.ceo,
          address: particularCompany.address,
          country: particularCompany.country,
          currency: particularCompany.currency,
          state: particularCompany.state,
          city: particularCompany.city,
          pincode: particularCompany.zip,
          mobileNo: particularCompany.phone,
          gstIn: particularCompany.gstIn,
          website: particularCompany.website,
        });

      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company`);
      console.log('API Response:', response);

      if (response.status === true) {
        const companyList = response.paramObjectsMap.companyVO;
        setListViewData(companyList);

        console.log('THE LISTVIEW COMPANY IS:', companyList);

        // Check if orgId exists and matches any company's id
        const matchedCompany = companyList.find((company) => company.id === parseInt(orgId));

        if (matchedCompany) {
          console.log('MATCHED COMPANY ID FOUND:', matchedCompany.id);
          await getCompanyById({ original: { id: matchedCompany.id } }); // Call getCompanyById if match is found
        } else {
          console.log('No matching company found for the given orgId.');
        }
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClear = () => {
    setFormData({
      // companyCode: '',
      companyCode: formData.companyCode,
      companyName: formData.companyName,
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      website: '',
      active: true
    });
    setFieldErrors({
      // companyCode: '',
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gstIn: '',
      website: '',
    });
    setEditId('');
    getCompanyDetails();
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.ceo) {
      errors.ceo = 'CEO is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.mobileNo) {
      errors.mobileNo = 'Mobile No is required';
    } else if (formData.mobileNo.length < 10) {
      errors.mobileNo = 'Invalid mobileNo No';
    }
    if (formData.pincode.length < 6 && formData.pincode.length >= 1) {
      errors.pincode = 'Invalid Pincode';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        id: orgId,
        active: formData.active,
        address: formData.address,
        cancel: true,
        ceo: formData.ceo,
        city: formData.city,
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        country: formData.country,
        createdBy: loginUserName,
        currency: formData.currency,
        gstIn: formData.gstIn,
        website: formData.website,
        phone: formData.mobileNo,
        state: formData.state,
        zip: formData.pincode,
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', 'Company updated Successfully');
          const generatedId = response.paramObjectsMap.CompanyVO.id;
          console.log("save", typeof logo);
          if (generatedId && typeof logo === 'object') {
            console.log('Generated ID:', generatedId);
            console.log('Uploaded Item', logo);
            handleFileUpload(generatedId);
          } else {
            console.log('handle Img Upload failed');
          }
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Company updation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company updation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };
  const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      const response = await apiCalls(
        'post',
        `/commonmaster/uploadCompanyLogoInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Img Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        console.warn('Img upload failed:', response);
        showToast('error', 'Img upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload Img');
    }
  };
  useEffect(() => {
    return () => {
      if (logo && typeof logo === 'object') {
        URL.revokeObjectURL(logo);
      }
    };
  }, [logo]);
  const handleRemoveLogo = () => setLogo(null);
  const handleView = () => {
    console.log('LIST VIEW DATAS ARE:', listViewData);

    setListView(!listView);
  };

  const handleDateChange = (field, newValue) => {
    if (newValue.isValid()) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue
      }));
    }
  };

  const handleTimeChange = (fieldName, newValue) => {
    if (!newValue) return;

    const timeFormat = 'HH:mm';
    const newTime = dayjs(newValue).format(timeFormat);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newTime
    }));
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            {/* <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} /> */}
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              enableEditing={true}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCompanyById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              {/* Task ID */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Task Id"
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
                      label="Task Date *"
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

              {/* Customer Name */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                  <InputLabel id="assignTo-label">Customer Name</InputLabel>
                  <Select
                    labelId="assignTo-label"
                    label="Customer Name"
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

              {/* task Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Task Name *"
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

              {/* task type */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                  <InputLabel id="assignTo-label">Task type</InputLabel>
                  <Select
                    labelId="assignTo-label"
                    label="Task type"
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

              {/* Priority */}
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.assignTo}>
                  <InputLabel id="assignTo-label">Priority</InputLabel>
                  <Select
                    labelId="assignTo-label"
                    label="Priority"
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

              {/* Assigneduname */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Assigneduname"
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

              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>

              <div className="row">
                <label>Attachments</label>

                {/* axpfilepath_atch */}
                <div className="col-md-3 mb-3 mt-2">
                  <TextField
                    label="axpfilepath_atch"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="axpfilepath_atch"
                    value={formData.axpfilepath_atch}
                    onChange={handleInputChange}
                    error={!!fieldErrors.axpfilepath_atch}
                    helperText={fieldErrors.axpfilepath_atch}
                  />
                </div>

                {/* Upload Ref.Docs */}
                <div className="col-md-3 mb-3  mt-2">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      variant="outlined"
                      component="label"
                      multiline
                      startIcon={<CloudUploadIcon />}
                      sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                    >
                      {/* {logo ? logo.name === '' ? "Logo👉" : logo.name : 'Upload Ref.Docs'} */}
                      {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Logo👉') : 'Upload Ref.Docs'}

                      <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                    </Button>

                    {logo && (
                      <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                        <ControlCameraIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                        Company Logo
                      </Typography>
                      {logo ? (
                        <Box>
                          <Avatar
                            src={typeof logo === 'object' ? URL.createObjectURL(logo) : `data:image/jpeg;base64,${logo}`}
                            alt="Company Logo"
                            sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                          />
                          <Box display="flex" gap={2} mt={2}>
                            {/* <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleRemoveLogo}
                          >
                            Delete
                          </IconButton> */}
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
                            <Typography variant="caption">Upload Ref.Docs</Typography>
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

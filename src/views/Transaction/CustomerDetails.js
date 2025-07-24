import React, { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Avatar, Typography, FormHelperText, Button, Dialog, DialogContent, TextField, Autocomplete, Box, FormControl, InputLabel, Tabs, Tab, MenuItem, Select,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
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

export const CustomerDetails = () => {
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [clientTypeOptions] = useState(['Customer', 'Individual']);
  const [cityList, setCityList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [open, setOpen] = useState(false);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  // Form structure for Lead
  const [formData, setFormData] = useState({
    docId: '',
    docDate: dayjs(),
    clientType: '',
    clientName: '',
    mail: '',
    mobileNo: '',
    industry: '',
    website: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    address: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    clientName: '',
    city: '',
    state: '',
    country: '',
  });

  const [branchDetails, setBranchDetails] = useState([{
    branchCode: '',
    branchName: '',
    gstNo: '',
    city: '',
    state: '',
    country: '',
    address: '',
  }]);

  const [branchDetailsErrors, setBranchDetailsErrors] = useState([{
    branch: '',
    address: '',
    city: '',
    country: '',
    state: '',
    gstNo: ''
  }]);

  const [contactDetails, setContactDetails] = useState([{
    referedContact: '',
    name: '',
    branchName: '',
    mobileNo: '',
    email: '',
    designation: '',
    dob: '',
    anniversaryDate: '',
    workAnniversaryDate: '',
  }]);

  const [contactErrors, setContactErrors] = useState([{
    name: '',
    mobileNo: '',
    email: '',
    designation: ''
  }]);
  useEffect(() => {
    getCustomerDetailsDocId();
    getAllCustomerDetails();
    getCityName();
  }, []);
  const getAllCustomerDetails = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getAllCustomerDetailsByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status === true) {
        setListViewData(response.paramObjectsMap.customerDetailsVO);
      } else {
        showToast('error', response.message || 'Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('error', 'Failed to fetch leads');
    }
  };

  const getCustomerDetailsDocId = async () => {
    setIsDocIdLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getCustomerDetailsDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status === true && response.paramObjectsMap.customerDetailsDocId) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.customerDetailsDocId
        }));
      }
    } catch (error) {
      console.error('Error getting document ID:', error);
      showToast('error', 'Failed to generate document ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };
  const getCustomerDetailsById = async (id) => {
    try {
      const response = await apiCalls('get', `/transaction/getCustomerDetailsById?id=${id}`);

      if (response.status === true) {
        const customerDetails = response.paramObjectsMap.customerDetailsVO;
        setEditId(id);
        setListView(false);
        setImg(response.paramObjectsMap.customerDetailsVO.photo)
        setFormData({
          docId: customerDetails.docId,
          docDate: customerDetails.docDate,
          clientType: customerDetails.clientType,
          clientName: customerDetails.clientName,
          mail: customerDetails.email,
          mobileNo: customerDetails.mobileNumber,
          industry: customerDetails.industry,
          website: customerDetails.website,
          city: customerDetails.city,
          state: customerDetails.state,
          country: customerDetails.country,
          pinCode: customerDetails.pincode,
          address: customerDetails.address,
          finYear: finYear,
          branch: branch,
          branchCode: branchCode,
          orgId: orgId,
        });
        setBranchDetails(
          customerDetails.branchDetailsVO.map((row) => ({
            id: row.id,
            branchCode: row.branchCode,
            branchName: row.branchName,
            city: row.city,
            gstNo: row.gstNo,
            state: row.state,
            country: row.country,
            address: row.address
          }))
        );
        setContactDetails(
          customerDetails.contactDetailsVO.map((row) => ({
            id: row.id,
            referedContact: row.referedContact,
            name: row.name,
            email: row.email,
            mobileNo: row.mobileNumber,
            designation: row.designation,
            branchName: row.branchName,
            workAnniversary: row.workAnniversary,
            workAnniversaryDate: row.anniversaryDate,
            dob: row.dateOfBirth,
          }))
        );
      } else {
        showToast('error', response.paramObjectsMap.message || 'Failed to fetch CustomerDetails details');
      }
    } catch (error) {
      console.error('Error fetching Customer Details details:', error);
      showToast('error', 'Failed to fetch Customer Details details');
    }
  };
  const getCityName = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getCityNameFromMaster?orgId=${orgId}`);
      if (response.status === true) {
        setCityList(response.paramObjectsMap.cityName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
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
  const handleClear = () => {
    getCustomerDetailsDocId();
    setImg(null);
    setFormData({
      docId: '',
      docDate: dayjs(),
      clientType: '',
      clientName: '',
      mail: '',
      mobileNo: '',
      industry: '',
      website: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      address: '',
    });
    setBranchDetails([{
      branchCode: '',
      branchName: '',
      gstNo: '',
      city: '',
      state: '',
      country: '',
      address: '',
    }]);
    setContactDetails([{
      referedContact: '',
      name: '',
      branchName: '',
      mobileNo: '',
      email: '',
      designation: '',
      dob: '',
      anniversaryDate: '',
      workAnniversaryDate: '',
    }]);
    setEditId('');
    setFieldErrors({});
  };

  const handleSave = async () => {
    // Validation
    const errors = {};
    if (!formData.clientName) errors.clientName = 'Client name is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fix the validation errors');
      return;
    }

    setIsLoading(true);
    const branchTable = branchDetails.map((row) => ({
      ...(editId && { id: row.id }),
      address: row.address,
      branchCode: row.branchCode,
      branchName: row.branchName,
      city: row.city,
      country: row.country,
      gstNo: row.gstNo,
      state: row.state
    }));
    const contactTable = contactDetails.map((row) => ({
      ...(editId && { id: row.id }),
      anniversaryDate: row.anniversaryDate,
      branchName: row.branchName,
      // city: row.,
      // gstNo: row.,
      // state: row.,
      dateOfBirth: row.dob,
      designation: row.designation,
      email: row.email,
      mobileNumber: row.mobileNo,
      name: row.name,
      referedContact: row.referedContact,
      workAnniversary: row.workAnniversaryDate
    }));
    const saveFormData = {
      ...(editId && { id: editId }),
      createdBy: createdBy,
      finYear: finYear,
      orgId: orgId,
      branch: branch,
      branchCode: branchCode,
      active: true,
      country: formData.country,
      email: formData.mail,
      industry: formData.industry,
      mobileNumber: formData.mobileNo,
      pincode: formData.pinCode,
      state: formData.state,
      website: formData.website,
      city: formData.city,
      clientName: formData.clientName,
      clientType: formData.clientType,
      address: formData.address,
      branchDetailsDTO: branchTable,
      contactDetailsDTO: contactTable,
    };
    try {
      const response = await apiCalls('put', '/transaction/updateCreateCustomerDetails', saveFormData);
      if (response.status === true) {
        showToast('success', editId ? 'Customer Details Updated successfully' : 'Customer Details Created Successfully');
        const generatedId = response.paramObjectsMap.customerDetailsVO.id;
        if (generatedId && typeof supportingImg === 'object') {
          handleFileUpload(generatedId);
        }
        handleClear();
        getAllCustomerDetails();
      } else {
        showToast('error', response.paramObjectsMap.message || 'Customer Details failed');
      }
    } catch (error) {
      console.error('Error saving CustomerDetails:', error);
      showToast('error', 'Failed to Save CustomerDetails');
    } finally {
      setIsLoading(false);
    }
  };
  const [supportingImg, setImg] = useState(null);
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
        `/transaction/uploadCustomerPhotoInBloob?id=${generatedId}`,
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
  useEffect(() => {
    return () => {
      if (supportingImg && typeof supportingImg === 'object') {
        URL.revokeObjectURL(supportingImg);
      }
    };
  }, [supportingImg]);
  const handleRemoveImg = () => setImg(null);
  const handleView = () => {
    setListView(!listView);
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleAddBranchDetails = () => {
    const newRow = {
      id: Date.now(),
      branchCode: '',
      branchName: '',
      gstNo: '',
      city: '',
      state: '',
      country: '',
      address: '',
    };
    setBranchDetails([...branchDetails, newRow]);
    setBranchDetailsErrors([
      ...branchDetailsErrors,
      {
        branchName: '',
        gstNo: '',
        city: '',
        state: '',
        country: '',
        address: '',
      }
    ]);
  };
  const handleAddContactDetails = () => {
    const newRow = {
      id: Date.now(),
      referedContact: '',
      name: '',
      branchName: '',
      mobileNo: '',
      email: '',
      designation: '',
      dob: '',
      anniversaryDate: '',
      workAnniversaryDate: '',
    };
    setContactDetails([...contactDetails, newRow]);
    setContactErrors([
      ...contactErrors,
      {
        name: '',
        mobileNo: '',
        email: '',
        designation: ''
      }
    ]);
  };
  const handleBranchChange = (index, field, value) => {
    const newBranches = [...branchDetails];
    newBranches[index] = { ...newBranches[index], [field]: value };
    setBranchDetails(newBranches);

    if (value) {
      const newErrors = [...branchDetailsErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      setBranchDetailsErrors(newErrors);
    }
  };
  const handleContactChange = (index, field, value) => {
    const newContacts = [...contactDetails];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setContactDetails(newContacts);
  };
  const handleDeleteRow = (id, data, setData, errors, setErrors) => {
    if (data.length <= 1) return;
    const index = data.findIndex(item => item.id === id);
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);

    const newErrors = [...errors];
    newErrors.splice(index, 1);
    setErrors(newErrors);
  };
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  const listViewColumns = [
    { accessorKey: 'docId', header: 'Doc Id', size: 120 },
    { accessorKey: 'docDate', header: 'Doc Date', size: 120 },
    { accessorKey: 'clientType', header: 'Client Type', size: 180 },
    { accessorKey: 'clientName', header: 'Client Name', size: 180 },
    { accessorKey: 'mobileNumber', header: 'Contact', size: 150 },
    { accessorKey: 'email', header: 'Email', size: 200 },
    { accessorKey: 'industry', header: 'Type', size: 120 },
    { accessorKey: 'website', header: 'Industry', size: 150 },
    { accessorKey: 'pincode', header: 'Source', size: 130 },
  ];
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              toEdit={(row) => getCustomerDetailsById(row.original.id)}
            />
          </div>
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <TextField
                label="Customer ID"
                variant="outlined"
                size="small"
                fullWidth
                disabled
                name="docId"
                value={isDocIdLoading ? "Generating..." : formData.docId || ''}
                InputProps={{
                  style: { backgroundColor: '#f5f5f5' }
                }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled" size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Doc Date"
                    value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                    onChange={(date) => handleDateChange('docDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                      }
                    }}
                    format="DD-MM-YYYY"
                    disabled
                  />
                </LocalizationProvider>
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.clientType}>
                <InputLabel id="clientType-label">Client Type</InputLabel>
                <Select
                  labelId="clientType-label"
                  label="Branch Type"
                  value={formData.clientType}
                  onChange={handleInputChange}
                  name="clientType"
                >
                  {clientTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.clientType && <FormHelperText>{fieldErrors.clientType}</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Client Name"
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
            <div className="col-md-3 mb-3">
              <TextField
                label="Email"
                variant="outlined"
                size="small"
                fullWidth
                name="mail"
                value={formData.mail}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Mobile"
                variant="outlined"
                size="small"
                fullWidth
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                inputProps={{ maxLength: 10 }}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Industry"
                variant="outlined"
                size="small"
                fullWidth
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Website"
                variant="outlined"
                size="small"
                fullWidth
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={cityList}
                getOptionLabel={(option) =>
                  option?.city ? `${option.city}` : ''
                }
                value={
                  cityList.find((item) => item.city === formData.city) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      city: newValue.city,
                      state: newValue.state,
                      country: newValue.country || '',
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      city: '',
                      state: '',
                      country: ''
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        City <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label={
                  <span>
                    State <span className="asterisk">*</span>
                  </span>
                }
                variant="outlined"
                size="small"
                fullWidth
                name="state"
                disabled
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label={
                  <span>
                    Country <span className="asterisk">*</span>
                  </span>
                }
                variant="outlined"
                disabled
                size="small"
                fullWidth
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Pin Code"
                variant="outlined"
                size="small"
                fullWidth
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                inputProps={{ maxLength: 6 }}
              />
            </div>
            <div className="col-md-6 mb-3">
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
            <div className="col-md-3 mb-3">
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant="outlined"
                  component="label"
                  multiline
                  startIcon={<CloudUploadIcon />}
                  sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                >
                  {supportingImg ? (typeof supportingImg === 'object' && supportingImg.name ? supportingImg.name : '') : 'Upload Img'}

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
                        src={typeof supportingImg === 'object' ? URL.createObjectURL(supportingImg) : `data:image/jpeg;base64,${supportingImg}`}
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
                        <Typography variant="caption">Upload Img</Typography>
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
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
                  <Tab label="Branch Details" />
                  <Tab label="Contact Details" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {tabValue === 0 && (
                  <>
                    <div className="mb-1">
                      <ActionButton title="Add Branch" icon={AddCircleOutlineIcon} onClick={handleAddBranchDetails} />
                    </div>
                    <div className="row mt-2">
                      <div className="col-lg-12">
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>#</th>
                                <th className="px-2 py-2 text-white text-center">Branch Code *</th>
                                <th className="px-2 py-2 text-white text-center">Branch Name *</th>
                                <th className="px-2 py-2 text-white text-center">Reg No *</th>
                                <th className="px-2 py-2 text-white text-center">City *</th>
                                <th className="px-2 py-2 text-white text-center">State *</th>
                                <th className="px-2 py-2 text-white text-center">Country *</th>
                                <th className="px-2 py-2 text-white text-center">Address *</th>
                              </tr>
                            </thead>
                            <tbody>
                              {branchDetails.map((branch, index) => (
                                <tr key={index}>
                                  <td className="border px-2 py-2 text-center">
                                    <ActionButton
                                      title="Delete"
                                      icon={DeleteOutlineIcon}
                                      onClick={() =>
                                        handleDeleteRow(
                                          branchDetails[index].id,
                                          branchDetails,
                                          setBranchDetails,
                                          branchDetailsErrors,
                                          setBranchDetailsErrors
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="text-center pt-3">{index + 1}</td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={branch.branchCode}
                                      onChange={(e) => handleBranchChange(index, 'branchCode', e.target.value)}
                                      // onBlur={(e) => validateBranchField(index, 'branch', e.target.value)}
                                      error={!!branchDetailsErrors[index]?.branch}
                                      helperText={branchDetailsErrors[index]?.branch}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={branch.branchName}
                                      onChange={(e) => handleBranchChange(index, 'branchName', e.target.value)}
                                    // onBlur={(e) => validateBranchField(index, 'branch', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={branch.gstNo}
                                      onChange={(e) => handleBranchChange(index, 'gstNo', e.target.value)}
                                      error={!!branchDetailsErrors[index]?.gstNo}
                                      helperText={branchDetailsErrors[index]?.gstNo}
                                    />
                                  </td>

                                  <td>
                                    <Box sx={{ minWidth: 150, flexGrow: 1 }}>
                                      <Autocomplete
                                        options={cityList}
                                        getOptionLabel={(option) =>
                                          option?.city ? `${option.city}` : ''
                                        }
                                        value={
                                          cityList.find((item) => item.city === branch.city) || null
                                        }
                                        onChange={(event, newValue) => {
                                          const updatedBranches = [...branchDetails];
                                          if (newValue) {
                                            updatedBranches[index] = {
                                              ...updatedBranches[index],
                                              city: newValue.city,
                                              state: newValue.state,
                                              country: newValue.country || '',
                                            };
                                          } else {
                                            updatedBranches[index] = {
                                              ...updatedBranches[index],
                                              city: '',
                                              state: '',
                                              country: '',
                                            };
                                          }
                                          setBranchDetails(updatedBranches);
                                        }}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label={
                                              <span>
                                                City <span className="asterisk">*</span>
                                              </span>
                                            }
                                            size="small"
                                            fullWidth
                                          />
                                        )}
                                      />
                                    </Box>
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={branch.state}
                                      disabled
                                      onChange={(e) => handleBranchChange(index, 'state', e.target.value)}
                                      // onBlur={(e) => validateBranchField(index, 'state', e.target.value)}
                                      error={!!branchDetailsErrors[index]?.state}
                                      helperText={branchDetailsErrors[index]?.state}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={branch.country}
                                      disabled
                                      onChange={(e) => handleBranchChange(index, 'country', e.target.value)}
                                      // onBlur={(e) => validateBranchField(index, 'country', e.target.value)}
                                      error={!!branchDetailsErrors[index]?.country}
                                      helperText={branchDetailsErrors[index]?.country}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      multiline
                                      value={branch.address}
                                      onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                                      // onBlur={(e) => validateBranchField(index, 'address', e.target.value)}
                                      error={!!branchDetailsErrors[index]?.address}
                                      helperText={branchDetailsErrors[index]?.address}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {tabValue === 1 && (
                  <>
                    <div className="mb-1">
                      <ActionButton title="Add Contact" icon={AddCircleOutlineIcon} onClick={handleAddContactDetails} />
                    </div>
                    <div className="row mt-2">
                      <div className="col-lg-12">
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead>
                              <tr style={{ background: '#5e35b1', color: '#ede7f6' }}>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>Action</th>
                                <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>#</th>
                                <th className="px-2 py-2 text-white text-center">Referred Contact</th>
                                <th className="px-2 py-2 text-white text-center">Name *</th>
                                <th className="px-2 py-2 text-white text-center">Branch Name *</th>
                                <th className="px-2 py-2 text-white text-center">Mobile No *</th>
                                <th className="px-2 py-2 text-white text-center">Email *</th>
                                <th className="px-2 py-2 text-white text-center">Designation *</th>
                                <th className="px-2 py-2 text-white text-center">Date of Birth</th>
                                <th className="px-2 py-2 text-white text-center">Anniversary Date</th>
                                <th className="px-2 py-2 text-white text-center">Work Anniversary Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {contactDetails.map((contact, index) => (
                                <tr key={index}>
                                  <td className="border px-2 py-2 text-center">
                                    <ActionButton
                                      title="Delete"
                                      icon={DeleteOutlineIcon}
                                      onClick={() =>
                                        handleDeleteRow(
                                          contactDetails[index].id,
                                          contactDetails,
                                          setContactDetails,
                                          contactErrors,
                                          setContactErrors
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="text-center pt-3">{index + 1}</td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.referedContact}
                                      onChange={(e) => handleContactChange(index, 'referedContact', e.target.value)}
                                    // onBlur={(e) => validateContactField(index, 'name', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.name}
                                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                      // onBlur={(e) => validateContactField(index, 'name', e.target.value)}
                                      error={!!contactErrors[index]?.name}
                                      helperText={contactErrors[index]?.name}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.branchName}
                                      onChange={(e) => handleContactChange(index, 'branchName', e.target.value)}
                                    // onBlur={(e) => validateContactField(index, 'name', e.target.value)}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.mobileNo}
                                      onChange={(e) => handleContactChange(index, 'mobileNo', e.target.value)}
                                      // onBlur={(e) => validateContactField(index, 'mobileNo', e.target.value)}
                                      error={!!contactErrors[index]?.mobileNo}
                                      helperText={contactErrors[index]?.mobileNo}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.email}
                                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                      // onBlur={(e) => validateContactField(index, 'email', e.target.value)}
                                      error={!!contactErrors[index]?.email}
                                      helperText={contactErrors[index]?.email}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={contact.designation}
                                      onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                                      // onBlur={(e) => validateContactField(index, 'designation', e.target.value)}
                                      error={!!contactErrors[index]?.designation}
                                      helperText={contactErrors[index]?.designation}
                                    />
                                  </td>

                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="date"
                                      value={contact.dob || ''}
                                      onChange={(e) => handleContactChange(index, 'dob', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="date"
                                      value={contact.anniversaryDate || ''}
                                      onChange={(e) => handleContactChange(index, 'anniversaryDate', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </td>
                                  <td>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="date"
                                      value={contact.workAnniversaryDate || ''}
                                      onChange={(e) => handleContactChange(index, 'workAnniversaryDate', e.target.value)}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default CustomerDetails;
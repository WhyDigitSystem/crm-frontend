import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { FormControl, FormHelperText, InputLabel, MenuItem, Autocomplete, Select, Button, Chip, Stack, Avatar, Typography, Dialog, DialogContent } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import FullScreenLoader from 'utils/FullScreenLoader';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import dealerSample from '../../assets/sample-files/dealer.xlsx';

const Dealer = ({ selectedRow }) => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [managerList, setManagerList] = useState([]);
  const [salesRepList, setSalesRepList] = useState([]);
  const [docId, setDocId] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  useEffect(() => {
    if (selectedRow) {
      setLoading(true);
      getDealersById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    dealerType: '',
    manager: '',
    salesRep: '',
    dealerName: '',
    dealerDOB: dayjs(),
    dealerAnniversary: dayjs(),
    creditLimit: '',
    chequeAvailable: '',
    state: '',
    district: '',
    contactPerson1: '',
    mobileNo1: '',
    contactPerson2: '',
    mobileNo2: '',
    latitude: '',
    longitude: '',
    gstNo: '',
    otherInfo: '',
    status: '',
    place: '',
    address: '',
    pinCode: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    dealerType: '',
    dealerName: '',
    manager: '',
    salesRep: '',
    state: '',
    district: '',
    contactPerson1: '',
    mobileNo1: '',
    status: '',
  });

  const listViewColumns = [
    { accessorKey: 'name', header: 'Dealer Name', size: 140 },
    { accessorKey: 'dateOfBirth', header: 'DOB', size: 140 },
    { accessorKey: 'anniversaryDate', header: 'Anniversary Date', size: 140 },
    { accessorKey: 'place', header: 'Place/Town', size: 140 },
    { accessorKey: 'manager', header: 'Manager', size: 140 },
  ];
  const getAllStates = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/state?orgid=${orgId}`);
      if (response.status === true) {
        setStateList(response.paramObjectsMap.stateVO || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getCityByState = async (state) => {
    try {
      const response = await apiCalls('get', `/dealer/getCityNameFromState?orgId=${orgId}&state=${state}`);
      if (response.status === true) {
        setDistrictList(response.paramObjectsMap.city || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  useEffect(() => {
    getAllStates();
    getDealersByOrgId();
    getDealersDocId();
  }, []);

  const getDealersByOrgId = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `/dealer/getAllDealerByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`);
      setData(result.paramObjectsMap.dealerVO.reverse() || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('error', err);
    }
  };
  const getDealersDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/dealer/getDealerDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      setDocId(response.paramObjectsMap.DealerDocId);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const getDealersById = async (row) => {
    setShowForm(true);
    setLoading(true);
    try {
      const result = await apiCalls('get', `/dealer/getDealerById?id=${row.original.id}`);
      if (result) {
        const DealerVO = result.paramObjectsMap.dealerVO;
        setEditId(row.original.id);
        setDocId(DealerVO.docId);
        setFormData({
          id: DealerVO.id || '',
          docDate: DealerVO.docDate ? dayjs(DealerVO.docDate, 'YYYY-MM-DD') : null,
          dealerDOB: DealerVO.dateOfBirth ? dayjs(DealerVO.dateOfBirth, 'YYYY-MM-DD') : null,
          dealerAnniversary: DealerVO.anniversaryDate ? dayjs(DealerVO.anniversaryDate, 'YYYY-MM-DD') : null,
          dealerType: DealerVO.dealerType || '',
          manager: DealerVO.manager || '',
          salesRep: DealerVO.saleRep || '',
          dealerName: DealerVO.name || '',
          creditLimit: DealerVO.creditLimit || '',
          chequeAvailable: DealerVO.chequeAvailable || '',
          district: DealerVO.district || '',
          state: DealerVO.state || '',
          place: DealerVO.place || '',
          status: DealerVO.status || '',
          address: DealerVO.address || '',
          pinCode: DealerVO.pincode || '',
          contactPerson1: DealerVO.contactPerson1 || '',
          contactPerson2: DealerVO.contactPerson2 || '',
          mobileNo1: DealerVO.mobile1 || '',
          mobileNo2: DealerVO.mobile2 || '',
          latitude: DealerVO.latitude || '',
          longitude: DealerVO.longitude || '',
          gstNo: DealerVO.gst || '',
          otherInfo: DealerVO.otherInfo || '',
        });

        setLoading(false);
      } else {
        setLoading(false);
        // Handle erro
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      setFormData({ ...formData, [name]: value });
      setFieldErrors({ ...fieldErrors, [name]: '' });
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement && inputElement.setSelectionRange) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date);
    console.log('formattedDate', formattedDate);
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };
  const handleClear = () => {
    setFormData({
      dealerType: '',
      manager: '',
      salesRep: '',
      dealerName: '',
      dealerDOB: dayjs(),
      docDate: dayjs(),
      dealerAnniversary: dayjs(),
      creditLimit: '',
      chequeAvailable: '',
      state: '',
      district: '',
      contactPerson1: '',
      mobileNo1: '',
      contactPerson2: '',
      mobileNo2: '',
      latitude: '',
      longitude: '',
      gstNo: '',
      otherInfo: '',
      status: '',
      place: '',
      address: '',
      pinCode: '',
    });
    setFieldErrors({});
    setEditId('');
    getDealersDocId();
  };
  const handleView = () => {
    setShowForm(!showForm);
    handleClear();
  };

  const handleSave = async () => {
    setLoading(true);
    const errors = {};
    if (!formData.dealerType) {
      errors.dealerType = 'Dealer Type is required';
    }
    if (!formData.dealerName) {
      errors.dealerName = 'Name is required';
    }
    // if (!formData.manager) {
    //   errors.manager = 'Manager is required';
    // }
    // if (!formData.salesRep) {
    //   errors.salesRep = 'Sales Rep is required';
    // }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.district) {
      errors.district = 'Districe is required';
    }
    if (!formData.contactPerson1) {
      errors.contactPerson1 = 'Contact Person 1 is required';
    }
    if (!formData.mobileNo1) {
      errors.mobileNo1 = 'Mobile No 1 is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      const saveFormData = {
        ...(editId && { id: editId }),
        branch: branch,
        branchCode: branchCode,
        finYear: finYear,
        orgId: orgId,
        createdBy: loginUserName,
        dealerType: formData.dealerType,
        manager: formData.manager,
        salesRep: formData.salesRep,
        name: formData.dealerName,
        creditLimit: parseInt(formData.creditLimit),
        chequeAvailable: formData.chequeAvailable,
        state: formData.state,
        district: formData.district,
        place: formData.place,
        address: formData.address,
        pincode: parseInt(formData.pinCode),
        contactPerson1: formData.contactPerson1,
        mobile1: formData.mobileNo1,
        contactPerson2: formData.contactPerson2,
        mobile2: formData.mobileNo2,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gst: formData.gstNo,
        otherInfo: formData.otherInfo,
        status: formData.status,
        dateOfBirth: formData.dealerDOB?.format('YYYY-MM-DD'),
        anniversaryDate: formData.dealerAnniversary?.format('YYYY-MM-DD'),
        active: true
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/dealer/createUpdateDealer`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Dealers Updated Successfully' : 'Dealers Created successfully');
          getDealersByOrgId();
          getDealersDocId();
          handleClear();
          setLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Dealers creation failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        showToast('error', 'Dealers creation failed');
      }
    } else {
      setFieldErrors(errors);
      setLoading(false);
    }
  };
  const handleBulkUploadClose = () => {
    setUploadOpen(false);
  };

  const handleSubmit = () => {
    console.log('Submit clicked');
    handleBulkUploadClose();
  };

  const handleFileUpload = (event) => {
    console.log(event.target.files[0]);
  };
  const handleBulkUpload = () => {
    setUploadOpen(true);
  };
  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row">
          <div className="d-flex justify-content-between align-items-center mb-4" style={{ width: '100%' }}>
            {!selectedRow &&
              <div className="d-flex">
                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                <ActionButton title="BulkUpload" icon={CloudUploadIcon} onClick={handleBulkUpload} />
                {uploadOpen && (
                  <CommonBulkUpload
                    open={uploadOpen}
                    handleClose={handleBulkUploadClose}
                    title="Upload Files"
                    uploadText="Upload file"
                    downloadText="Sample File"
                    onSubmit={handleSubmit}
                    sampleFileDownload={dealerSample}
                    handleFileUpload={handleFileUpload}
                    apiUrl={`/dealer/excelUploadForDealer`}
                    screen="DEALERS"
                    loginUser={loginUserName}
                    orgId={orgId}
                    branch={branch}
                    branchCode={branchCode}
                    finYear={finYear}
                  ></CommonBulkUpload>
                )}
                {showForm && (
                  <>
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                  </>
                )}
              </div>
            }
          </div>
          {showForm ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    id="docId"
                    label="Doc No"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="docId"
                    value={docId}
                    disabled
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Doc Date"
                        value={formData.docDate}
                        onChange={(date) => handleDateChange('docDate', date)}
                        disabled
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.dealerType}>
                    <InputLabel id="dealerType-label">Dealer Type <span className="asterisk">*</span></InputLabel>
                    <Select
                      labelId="dealerType-label"
                      label="Dealer Type"
                      value={formData.dealerType}
                      onChange={handleInputChange}
                      name="dealerType"
                    >
                      <MenuItem value="Existing Dealer">Existing Dealer</MenuItem>
                      <MenuItem value="Hot Prospect">Hot Prospect</MenuItem>
                      <MenuItem value="Cold Prospect">Cold Prospect</MenuItem>
                    </Select>
                    {fieldErrors.dealerType && <FormHelperText>{fieldErrors.dealerType}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={managerList}
                    getOptionLabel={(option) =>
                      option?.manager
                        ? `${option.manager}`
                        : ''
                    }
                    value={
                      managerList.find((item) => item.manager === formData.manager) || null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          manager: newValue.manager,
                        }));
                        setFieldErrors((prev) => ({ ...prev, manager: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, manager: '' }));
                        setFieldErrors((prev) => ({ ...prev, manager: 'Requested By is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Manager <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.manager}
                        helperText={fieldErrors.manager}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={salesRepList}
                    getOptionLabel={(option) =>
                      option?.salesRep
                        ? `${option.salesRep}`
                        : ''
                    }
                    value={
                      salesRepList.find((item) => item.salesRep === formData.salesRep) || null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          salesRep: newValue.salesRep,
                        }));
                        setFieldErrors((prev) => ({ ...prev, salesRep: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, salesRep: '' }));
                        setFieldErrors((prev) => ({ ...prev, salesRep: 'Sales Rep is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Sales Rep <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.salesRep}
                        helperText={fieldErrors.salesRep}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="dealerName"
                    label="Dealer Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="dealerName"
                    value={formData.dealerName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="DOB"
                      value={formData.dealerDOB}
                      onChange={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          dealerDOB: date,
                        }));
                      }}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </div>
                <div className="col-md-3 mb-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Anniversary"
                      value={formData.dealerAnniversary}
                      onChange={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          fromDate: date,
                        }));
                      }}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="creditLimit"
                    label="Credit Limit"
                    variant="outlined"
                    size="small"
                    fullWidth
                    type='number'
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.chequeAvailable}>
                    <InputLabel id="chequeAvailable-label">Cheque Available</InputLabel>
                    <Select
                      labelId="chequeAvailable-label"
                      label="Cheque Available"
                      value={formData.chequeAvailable}
                      onChange={handleInputChange}
                      name="chequeAvailable"
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                    {fieldErrors.chequeAvailable && <FormHelperText>{fieldErrors.chequeAvailable}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={stateList}
                    getOptionLabel={(option) =>
                      option?.stateName ? `${option.stateName}` : ''
                    }
                    value={
                      stateList.find((item) => item.stateName === formData.state) || null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          state: newValue.stateName,
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          state: '',
                        }));
                        getCityByState(newValue.stateName)
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          state: '',
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            State <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        fullWidth
                        error={!!fieldErrors.state}
                        helperText={fieldErrors.state}
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={districtList}
                    getOptionLabel={(option) =>
                      option?.city ? `${option.city}` : ''
                    }
                    value={
                      districtList.find((item) => item.city === formData.district) || null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          district: newValue.city,
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          district: '',

                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          district: '',

                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            District <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        fullWidth
                        error={!!fieldErrors.district}
                        helperText={fieldErrors.district}
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Place
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}

                    error={!!fieldErrors.place}
                    helperText={fieldErrors.place}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Address
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}

                    error={!!fieldErrors.address}
                    helperText={fieldErrors.address}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Pin Code
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}

                    error={!!fieldErrors.pinCode}
                    helperText={fieldErrors.pinCode}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Contact Person 1 <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="contactPerson1"
                    value={formData.contactPerson1}
                    onChange={handleInputChange}

                    error={!!fieldErrors.contactPerson1}
                    helperText={fieldErrors.contactPerson1}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Mobile No 1 <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="mobileNo1"
                    value={formData.mobileNo1}
                    onChange={handleInputChange}

                    error={!!fieldErrors.mobileNo1}
                    helperText={fieldErrors.mobileNo1}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Contact Person 2
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="contactPerson2"
                    value={formData.contactPerson2}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Mobile No 2
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="mobileNo2"
                    value={formData.mobileNo2}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Latitude
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Longitude
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Reg No
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Other Info
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="otherInfo"
                    value={formData.otherInfo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.status}>
                    <InputLabel id="status-label">Status <span className="asterisk">*</span></InputLabel>
                    <Select
                      labelId="status-label"
                      label="Status"
                      value={formData.status}
                      onChange={handleInputChange}
                      name="status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="In-Active">In-Active</MenuItem>
                    </Select>
                    {fieldErrors.status && <FormHelperText>{fieldErrors.status}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
            </>
          ) : (
            <CommonListViewTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getDealersById} />
          )}
        </div >
      </div >
    </>
  );
};
export default Dealer;

import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField, Box, Tab, Tabs, MenuItem, Select, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
// import {  } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import {
  Avatar,
  Typography,
  Autocomplete,
  FormHelperText,
  FormControl,
  Rating,
  FormLabel
} from '@mui/material';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const SupplierManagement = ({ selectedRow }) => {
  const [listViewData, setListViewData] = useState([]);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listView, setListView] = useState(true);
  const [docId, setDocId] = useState('');
  const [supplierTypeList] = useState([
    'Raw Material Supplier',
    'Equipment Supplier',
    'Service Provider',
    'Consumables Supplier',
    'Logistics Partner',
    'Maintenance Service'
  ]);
  const [cityList, setCityList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [paymentTermsList] = useState([
    'Net 15 Days',
    'Net 30 Days',
    'Net 45 Days',
    'Net 60 Days',
    'Advance Payment',
    'Cash on Delivery',
    'Letter of Credit'
  ]);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getSupplierById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    branch: branch,
    branchCode: branchCode,
    createdBy: createdBy,
    finYear: finYear,
    orgId: orgId,
    address: '',
    city: '',
    companyName: '',
    contactPerson: '',
    creditLimit: '',
    email: '',
    gstNumber: '',
    notes: '',
    paymentTerms: '',
    phone: '',
    pincode: '',
    state: '',
    status: '',
    supplierRating: '',
    supplierType: '',
    type: '',
    supplied: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    address: '',
    city: '',
    companyName: '',
    contactPerson: '',
    creditLimit: '',
    email: '',
    gstNumber: '',
    notes: '',
    paymentTerms: '',
    phone: '',
    pincode: '',
    state: '',
    status: '',
    supplierRating: '',
    supplierType: '',
    type: '',
    supplied: ''
  });
  const listViewColumns = [
    { accessorKey: 'docid', header: 'Supplier Code', size: 140 },
    { accessorKey: 'companyName', header: 'Company Name', size: 140 },
    { accessorKey: 'contactPerson', header: 'Contact Person', size: 140 },
    { accessorKey: 'phone', header: 'Phone', size: 140 },
    { accessorKey: 'email', header: 'Email', size: 140 },
    { accessorKey: 'supplierType', header: 'Type', size: 140 },
    { accessorKey: 'status', header: 'Status', size: 140 }
  ];

  useEffect(() => {
    getAllSupplier();
    getSupplierDocId();
    getStateName();
  }, []);
  const getSupplierDocId = async () => {
    if (editId) return;
    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/inventoryitem/getSupplierDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status) {
        setDocId(response.paramObjectsMap.supplierDocId);
      }
    } catch (err) {
      console.error('Error fetching Supplier docId:', err);
      showToast('error', 'Failed to generate Supplier ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllSupplier = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/inventoryitem/getAllSupplierByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status === true && response.paramObjectsMap?.supplierVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.supplierVO].reverse());
      } else {
        setListViewData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Supplier:', error);
      showToast('error', 'Failed to fetch Supplier');
      setIsLoading(false);
    }
  };
  const getSupplierById = async (row) => {
    setIsLoading(true);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/inventoryitem/getSupplierById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const supplier = response.paramObjectsMap.supplierVO;
        getCityName(supplier.state);
        setFormData({
          docDate: supplier.docdate || null,
          companyName: supplier.companyName || '',
          supplierType: supplier.supplierType || '',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          gstNumber: supplier.gstNumber || '',
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          pincode: supplier.pincode || '',
          paymentTerms: supplier.paymentTerms || '',
          creditLimit: supplier.creditLimit || '',
          supplierRating: supplier.supplierRating || '',
          status: supplier.status || '',
          type: supplier.type || '',
          createdBy: createdBy || '',
          orgId: orgId,
          finYear: finYear,
          notes: supplier.notes,
          supplied: supplier.supplied,
          branch: branch,
          branchCode: branchCode
        });
        setDocId(supplier.docid || '');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Supplier details:', error);
      showToast('error', 'Failed to fetch Supplier details');
      setIsLoading(false);
    }
  };
  const getStateName = async () => {
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
  const getCityName = async (state) => {
    try {
      const response = await apiCalls('get', `/commonmaster/city/state?orgid=${orgId}&state=${state}`);
      if (response.status === true) {
        setCityList(response.paramObjectsMap.cityVO || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value)) {
          error = 'Phone number must be 10 digits';
        }
        break;

      case 'gstNumber':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          error = 'Invalid GST number format';
        }
        break;

      case 'pincode':
        if (value && !/^[1-9][0-9]{5}$/.test(value)) {
          error = 'Invalid pincode';
        }
        break;

      default:
        break;
    }

    return error;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate specific fields
    const error = validateField(name, value);

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   // Convert to string if it's the contactNo field
  //   const processedValue = name === 'contactNo' ? String(value) : value;
  //   setFormData((prev) => ({ ...prev, [name]: processedValue }));
  //   setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  // };
  const handleSave = async () => {
    // const errors = {};
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    if (!formData.companyName) {
      newErrors.companyName = 'Company Name is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...newErrors }));
      showToast('error', 'Please correct the highlighted fields');
      return;
    }
    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      branch: branch || '',
      branchCode: branchCode || '',
      createdBy: createdBy || '',
      finYear: finYear || '',
      orgId: orgId,
      address: formData.address || '',
      city: formData.city || '',
      companyName: formData.companyName || '',
      contactPerson: formData.contactPerson || '',
      creditLimit: parseInt(formData.creditLimit),
      email: formData.email || '',
      gstNumber: formData.gstNumber || '',
      notes: formData.notes || '',
      paymentTerms: formData.paymentTerms || '',
      phone: formData.phone || '',
      pincode: parseInt(formData.pincode),
      state: formData.state || '',
      status: formData.status || '',
      supplierRating: formData.supplierRating || '',
      supplierType: formData.supplierType || '',
      type: formData.type || '',
      supplied: formData.supplied || '',
      active: true
    };

    try {
      const response = await apiCalls('put', '/inventoryitem/createUpdateSupplier', payload);
      if (response.status) {
        showToast('success', editId ? 'Inventory Management updated successfully' : 'Inventory Management created successfully');
        handleClear();
        getAllSupplier();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving Supplier Management:', error);
      showToast('error', 'Failed to save Supplier Management: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      branch: branch,
      branchCode: branchCode,
      createdBy: createdBy,
      finYear: finYear,
      orgId: orgId,
      address: '',
      city: '',
      companyName: '',
      contactPerson: '',
      creditLimit: '',
      email: '',
      gstNumber: '',
      notes: '',
      paymentTerms: '',
      phone: '',
      pincode: '',
      state: '',
      status: '',
      supplierRating: '',
      supplierType: '',
      supplied: '',
      type: ''
    });
    setFieldErrors({
      docDate: '',
      address: '',
      city: '',
      companyName: '',
      contactPerson: '',
      creditLimit: '',
      email: '',
      gstNumber: '',
      notes: '',
      paymentTerms: '',
      phone: '',
      pincode: '',
      state: '',
      status: '',
      supplierRating: '',
      supplied: '',
      supplierType: '',
      type: ''
    });
    setEditId('');
    getSupplierDocId();
  };
  const handleView = () => {
    setListView(!listView);
    handleClear();
  };
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };

  return (
    <>
      {isLoading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          {!selectedRow && (
            <div className="d-flex flex-wrap justify-content-start mb-3" style={{ marginBottom: '20px' }}>
              {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
              {!listView && (
                <>
                  <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                  <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                  <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                </>
              )}
            </div>
          )}
          {listView && !isLoading ? (
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              toEdit={getSupplierById}
            />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Supply ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="supplierDocId"
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Supply Date"
                        value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('docDate', date)}
                        slotProps={{
                          textField: {
                            size: 'small'
                          }
                        }}
                        format="DD-MM-YYYY"
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Company Name <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    error={!!fieldErrors.companyName}
                    helperText={fieldErrors.companyName}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.supplierType}>
                    <InputLabel>Supplier Type</InputLabel>
                    <Select
                      label="Supplier Type"
                      name="supplierType"
                      value={formData.supplierType}
                      onChange={handleInputChange}
                      error={!!fieldErrors.supplierType}
                      helperText={fieldErrors.supplierType}
                    >
                      {supplierTypeList.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.supplierType && <FormHelperText style={{ color: 'red' }}>{fieldErrors.supplierType}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Contact Person</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    error={!!fieldErrors.contactPerson}
                    helperText={fieldErrors.contactPerson}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Email</span>}
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
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Phone</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={!!fieldErrors.phone}
                    helperText={fieldErrors.phone}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>GST Number</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    error={!!fieldErrors.gstNumber}
                    helperText={fieldErrors.gstNumber}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Address</span>}
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
                  <Autocomplete
                    options={stateList}
                    getOptionLabel={(option) => (option?.stateName ? `${option.stateName}` : '')}
                    value={stateList.find((item) => item.stateName === formData.state) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          state: newValue.stateName
                        }));
                        setFieldErrors((prev) => ({ ...prev, state: '' }));
                        getCityName(newValue.stateName);
                      } else {
                        setFormData((prev) => ({ ...prev, state: '' }));
                        setFieldErrors((prev) => ({ ...prev, state: 'State is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<span>State</span>}
                        size="small"
                        error={!!fieldErrors.state}
                        helperText={fieldErrors.state}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={cityList}
                    getOptionLabel={(option) => (option?.cityName ? `${option.cityName}` : '')}
                    value={cityList.find((item) => item.cityName === formData.city) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          city: newValue.cityName
                        }));
                        setFieldErrors((prev) => ({ ...prev, city: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, city: '' }));
                        setFieldErrors((prev) => ({ ...prev, city: 'City is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<span>City</span>}
                        size="small"
                        error={!!fieldErrors.city}
                        helperText={fieldErrors.city}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Pin Code</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    error={!!fieldErrors.pincode}
                    helperText={fieldErrors.pincode}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Credit Limit</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    error={!!fieldErrors.creditLimit}
                    helperText={fieldErrors.creditLimit}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.paymentTerms}>
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      label="Payment Terms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      error={!!fieldErrors.paymentTerms}
                      helperText={fieldErrors.paymentTerms}
                    >
                      {paymentTermsList.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.paymentTerms && <FormHelperText style={{ color: 'red' }}>{fieldErrors.paymentTerms}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Products/Services Supplied</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="supplied"
                    value={formData.supplied}
                    onChange={handleInputChange}
                    error={!!fieldErrors.supplied}
                    helperText={fieldErrors.supplied}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                    <InputLabel id="demo-simple-select-label">Status</InputLabel>
                    <Select
                      labelId="statusLabel"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                      error={!!fieldErrors.status}
                    >
                      <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                      <MenuItem value="INACTIVE">INPROGRESS</MenuItem>
                      <MenuItem value="PENDING APPROVAL">PENDING APPROVAL</MenuItem>
                      <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                    </Select>
                    {fieldErrors.status && <FormHelperText style={{ color: 'red' }}>{fieldErrors.status}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    label={<span>Notes</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    error={!!fieldErrors.notes}
                    helperText={fieldErrors.notes}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.supplierRating}>
                    <FormLabel>Supplier Rating</FormLabel>
                    <Rating
                      name="supplierRating"
                      value={formData.supplierRating}
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: { name: 'supplierRating', value: newValue }
                        });
                      }}
                      precision={1}
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.4 }} />}
                    />
                    {fieldErrors.supplierRating && <FormHelperText style={{ color: 'red' }}>{fieldErrors.supplierRating}</FormHelperText>}
                  </FormControl>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SupplierManagement;

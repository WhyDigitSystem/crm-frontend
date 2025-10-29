import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField, Box, Tab, Tabs, MenuItem, Select, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import {
  Avatar,
  Typography,
  Autocomplete,
  FormHelperText,
  Button,
  Dialog,
  DialogContent,
  Checkbox,
  FormControlLabel,
  FormControl
} from '@mui/material';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const InventoryManagement = ({ selectedRow }) => {
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
  const [productName, setProductName] = useState([]);
  const [locationList, setLocation] = useState([]);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getInventoryById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    productName: '',
    location: '',
    currentStock: '',
    reservedStock: '',
    availableStock: '',
    reorderLevel: '',
    maximumStockLevel: '',
    batchNumber: '',
    expirydate: dayjs(),
    notes: '',
    branch: branch,
    branchCode: branchCode
  });

  const [fieldErrors, setFieldErrors] = useState({
    docDate: '',
    productName: '',
    location: '',
    currentStock: '',
    reservedStock: '',
    availableStock: '',
    reorderLevel: '',
    maximumStockLevel: '',
    batchNumber: '',
    expirydate: '',
    notes: ''
  });

  const listViewColumns = [
    { accessorKey: 'product', header: 'Product', size: 140 },
    { accessorKey: 'location', header: 'Location', size: 140 },
    { accessorKey: 'currentStock', header: 'Current Stock', size: 140 },
    { accessorKey: 'reservedStock', header: 'Reserved', size: 140 },
    { accessorKey: 'availableStock', header: 'Available', size: 140 },
    { accessorKey: 'reorderLevel', header: 'Reorder Level', size: 140 }
    // { accessorKey: 'city', header: 'Status', size: 140 },
  ];

  useEffect(() => {
    getAllInventory();
    getInventoryDocId();
    getLocation();
    getProductName();
  }, []);
  const getInventoryDocId = async () => {
    if (editId) return;
    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/inventoryitem/getInventoryItemDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status) {
        setDocId(response.paramObjectsMap.inventoryItemDocId);
        setIsDocIdLoading(false);
      }
    } catch (err) {
      console.error('Error fetching Inventory docId:', err);
      showToast('error', 'Failed to generate Inventory ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllInventory = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/inventoryitem/getAllInventoryItemByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status === true && response.paramObjectsMap?.inventoryItemVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.inventoryItemVO].reverse());
      } else {
        setListViewData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Inventory:', error);
      showToast('error', 'Failed to fetch Inventory');
      setIsLoading(false);
    }
  };
  const getInventoryById = async (row) => {
    setIsLoading(true);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/inventoryitem/getInventoryItemById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const inventoryMan = response.paramObjectsMap.inventoryItemVO;
        // Map API fields to formData state
        setFormData({
          productName: inventoryMan.product || '',
          docDate: inventoryMan.docdate || '',
          location: inventoryMan.location || '',
          currentStock: inventoryMan.currentStock || '',
          reservedStock: inventoryMan.reservedStock || '',
          // availableStock: inventoryMan.availableStock || '',
          reorderLevel: inventoryMan.reorderLevel || '',
          maximumStockLevel: inventoryMan.maximumStockLevel || '',
          batchNumber: inventoryMan.batchNumber || '',
          expirydate: inventoryMan.expirydate || '',
          notes: inventoryMan.notes || '',
          createdBy: createdBy,
          orgId: orgId,
          finYear: finYear,
          branch: branch,
          branchCode: branchCode
        });
        setDocId(inventoryMan.docid || '');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Inventory details:', error);
      showToast('error', 'Failed to fetch Inventory details');
      setIsLoading(false);
    }
  };
  const getProductName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getProductNameFromProduct?orgId=${orgId}`);
      if (response.status === true) {
        setProductName(response.paramObjectsMap.productName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getLocation = async () => {
    try {
      const response = await apiCalls('get', `/inventoryitem/getWarehouseName?orgId=${orgId}`);
      if (response.status === true) {
        setLocation(response.paramObjectsMap.mapp || []);
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
    const { name, value } = e.target;
    // Convert to string if it's the contactNo field
    const processedValue = name === 'contactNo' ? String(value) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const handleSave = async () => {
    const errors = {};
    if (!formData.productName) {
      errors.productName = 'Product Name is required';
    }
    if (!formData.currentStock) {
      errors.currentStock = 'Current Stock is required';
    }
    if (!formData.batchNumber) {
      errors.batchNumber = 'Batch No is required';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      branch: branch || '',
      branchCode: branchCode || '',
      createdBy: createdBy || '',
      finYear: finYear || '',
      orgId: orgId || '',
      batchNumber: formData.batchNumber || '',
      currentStock: formData.currentStock || '',
      expirydate: formData.expirydate || '',
      location: formData.location || '',
      maximumStockLevel: formData.maximumStockLevel || '',
      notes: formData.notes || '',
      product: formData.productName || '',
      reorderLevel: formData.reorderLevel || '',
      reservedStock: formData.reservedStock || '',
      active: true
    };
    try {
      const response = await apiCalls('put', '/inventoryitem/createUpdateInventoryItem', payload);
      console.log('data to save', payload);

      if (response.status) {
        showToast('success', editId ? 'Inventory Management updated successfully' : 'Inventory Management created successfully');
        handleClear();
        getAllInventory();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving Inventory:', error);
      showToast('error', 'Failed to save Inventory: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      batchNumber: '',
      availableStock: '',
      branch: '',
      branchCode: '',
      currentStock: '',
      expirydate: dayjs(),
      location: '',
      maximumStockLevel: '',
      notes: '',
      product: '',
      productName: '',
      reorderLevel: '',
      reservedStock: '',
      finYear: finYear,
      orgId: orgId,
      branch: branch,
      branchCode: branchCode,
      createdBy: createdBy
    });
    setFieldErrors({
      docDate: '',
      batchNumber: '',
      branch: '',
      branchCode: '',
      currentStock: '',
      expirydate: '',
      location: '',
      maximumStockLevel: '',
      notes: '',
      product: '',
      productName: '',
      reorderLevel: '',
      reservedStock: ''
    });
    setEditId('');
    getInventoryDocId();
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={getInventoryById} />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Inventory ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="inventoryDocId"
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Inventory Date"
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
                  <Autocomplete
                    options={productName}
                    getOptionLabel={(option) => (option?.productName ? `${option.productName} - ${option.productCode}` : '')}
                    value={productName.find((item) => item.productName === formData.productName) || null}
                    onChange={(event, newValue) =>
                      handleInputChange({
                        target: { name: 'productName', value: newValue?.productName || '' }
                      })
                    }
                    isOptionEqualToValue={(option, value) => option.productName === value.productName}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Product <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.productName}
                        helperText={fieldErrors.productName}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={locationList}
                    getOptionLabel={(option) => (option?.warehouse ? `${option.warehouse} - ${option.code}` : '')}
                    value={locationList.find((item) => item.warehouse === formData.location) || null}
                    onChange={(event, newValue) =>
                      handleInputChange({
                        target: { name: 'location', value: newValue?.warehouse || '' }
                      })
                    }
                    isOptionEqualToValue={(option, value) => option.warehouse === value.warehouse}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Location <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.location}
                        helperText={fieldErrors.location}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Current Stock <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    error={!!fieldErrors.currentStock}
                    helperText={fieldErrors.currentStock}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Reserved Stock</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="reservedStock"
                    value={formData.reservedStock}
                    onChange={handleInputChange}
                    error={!!fieldErrors.reservedStock}
                    helperText={fieldErrors.reservedStock}
                  />
                </div>
                {/* <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Available Stock</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="availableStock"
                    value={formData.availableStock}
                    onChange={handleInputChange}
                    error={!!fieldErrors.availableStock}
                    helperText={fieldErrors.availableStock}
                  />
                </div> */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Reorder Level</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    error={!!fieldErrors.reorderLevel}
                    helperText={fieldErrors.reorderLevel}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Maximum Stock Level</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    type="number"
                    name="maximumStockLevel"
                    value={formData.maximumStockLevel}
                    onChange={handleInputChange}
                    error={!!fieldErrors.maximumStockLevel}
                    helperText={fieldErrors.maximumStockLevel}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Batch Number <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    error={!!fieldErrors.batchNumber}
                    helperText={fieldErrors.batchNumber}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Expiry Date"
                        value={formData.expirydate ? dayjs(formData.expirydate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('expirydate', date)}
                        slotProps={{
                          textField: {
                            size: 'small'
                          }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
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
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryManagement;

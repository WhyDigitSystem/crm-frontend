import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField, MenuItem, Select, InputLabel, ListItemIcon, ListItemText } from '@mui/material';
import { useState, useEffect } from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Autocomplete, FormHelperText, FormControl } from '@mui/material';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonTableWithStatus from 'views/basicMaster/CommonTableWithStatus';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';

const ProductionManagement = ({ selectedRow }) => {
  const shiftIcons = {
    'Day Shift': <WbSunnyIcon sx={{ color: '#fbc02d', fontSize: 18, mr: 1 }} />,
    'Night Shift': <Brightness2Icon sx={{ color: '#1565c0', fontSize: 18, mr: 1 }} />,
    'General Shift': <AccessTimeIcon sx={{ color: '#4caf50', fontSize: 18, mr: 1 }} />
  };
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
  const [open, setOpen] = useState(false);
  const [relatedOrder] = useState([]);
  const [supervisorName, setSupervisorName] = useState([]);
  const [productName, setProductName] = useState([]);
  const [clientTypes] = useState(['Company', 'Individual']);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getProductionById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    relatedOrder: '',
    productName: '',
    plannedQuantity: '',
    productionLine: '',
    startDate: dayjs(),
    plannedCompletionDate: dayjs(),
    shift: '',
    supervisorName: '',
    notes: '',
    producedQuantity: '',
    status: '',
    finYear: finYear,
    orgId: orgId,
    branch: branch,
    branchCode: branchCode,
    createdBy: createdBy
  });

  const [fieldErrors, setFieldErrors] = useState({
    docDate: '',
    relatedOrder: '',
    productName: '',
    plannedQuantity: '',
    productionLine: '',
    startDate: '',
    plannedCompletionDate: '',
    shift: '',
    supervisorName: '',
    producedQuantity: '',
    status: '',
    notes: ''
  });
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };
  const listViewColumns = [
    { accessorKey: 'productionOrderCode', header: 'Production Order Code', size: 140 },
    { accessorKey: 'productionOrderDate', header: 'Production Order Date', size: 140 },
    { accessorKey: 'productName', header: 'Product Name', size: 140 },
    { accessorKey: 'plannedQuantity', header: 'Planned Qty', size: 140 },
    { accessorKey: 'producedQuantity', header: 'Produced Qty', size: 140 },
    { accessorKey: 'productionLine', header: 'Line', size: 140 },
    { accessorKey: 'startDate', header: 'Start Date', size: 140 },
    { accessorKey: 'plannedCompletionDate', header: 'End Date', size: 140 },
    { accessorKey: 'status', header: 'Status', size: 140 }
  ];

  useEffect(() => {
    getAllProductionManagement();
    getProductionDocId();
    getSupervisorName();
    getProductName();
  }, []);
  const getProductionDocId = async () => {
    if (editId) return;
    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/master/getProductionOrderDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status) {
        setDocId(response.paramObjectsMap.productionOrderDocId);
      }
    } catch (err) {
      console.error('Error fetching Production docId:', err);
      showToast('error', 'Failed to generate Production ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllProductionManagement = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/master/getAllProductionOrderByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status === true && response.paramObjectsMap?.productionOrderVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.productionOrderVO].reverse());

        const counts = {
          New: 0,
          Qualified: 0,
          Unqualified: 0,
          InProgress: 0
        };

        response.paramObjectsMap.productionOrderVO.forEach((production) => {
          switch (production.status) {
            case 'PLANNED':
            case 'INPROGRESS':
            case 'ONHOLD':
              counts.InProgress += 1;
              break;
            case 'COMPLETED':
              counts.Qualified += 1;
              break;
            case 'CANCELLED':
              counts.Unqualified += 1;
              break;
            default:
              break;
          }
        });
        setSummaryCounts(counts);
        setSummaryCounts((prev) => ({
          ...prev,
          New: response.paramObjectsMap.productionOrderVO.length
        }));
      } else {
        setListViewData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Production Management:', error);
      showToast('error', 'Failed to fetch Production Management');
      setIsLoading(false);
    }
  };
  const getProductionById = async (row) => {
    setIsLoading(true);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/master/getProductionOrderById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const production = response.paramObjectsMap.productionOrderVO;
        // Map API fields to formData state
        setFormData({
          docDate: production.productionOrderDate || null,
          relatedOrder: production.relatedOrder || '',
          productName: production.productName || '',
          plannedQuantity: production.plannedQuantity || '',
          producedQuantity: production.producedQuantity || '',
          productionLine: production.productionLine || '',
          startDate: production.startDate || null,
          plannedCompletionDate: production.plannedCompletionDate || null,
          shift: production.shift || '',
          supervisorName: production.supervisor || '',
          status: production.status || '',
          remainingQuantity: production.remainingQuantity || '',
          notes: production.notes || '',
          orgId: production.orgId || orgId,
          finYear: production.finYear || finYear,
          branch: production.branch || branch,
          branchCode: production.branchCode || branchCode
        });
        setDocId(production.productionOrderCode || '');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Production Management details:', error);
      showToast('error', 'Failed to fetch Production Management details');
      setIsLoading(false);
    }
  };
  const getSupervisorName = async () => {
    try {
      const response = await apiCalls('get', `/master/getSupervisorName?orgId=${orgId}`);
      if (response.status === true) {
        setSupervisorName(response.paramObjectsMap.supervisorName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
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
    if (!formData.plannedQuantity) {
      errors.plannedQuantity = 'Planned Qty is required';
    }
    if (!formData.productionLine) {
      errors.productionLine = 'Production Line is required';
    }
    if (!formData.producedQuantity) {
      errors.producedQuantity = 'Produced Qty is required';
    }
    if (!formData.shift) {
      errors.shift = 'Shift is required';
    }
    if (!formData.supervisorName) {
      errors.supervisorName = 'Supervisor is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
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
      orgId: orgId || '',
      finYear: finYear || '',
      relatedOrder: formData.relatedOrder || '',
      productName: formData.productName || '',
      plannedQuantity: formData.plannedQuantity || '',
      productionLine: formData.productionLine || '',
      startDate: formData.startDate || dayjs(),
      plannedCompletionDate: formData.plannedCompletionDate || dayjs(),
      shift: formData.shift || '',
      supervisor: formData.supervisorName || '',
      notes: formData.notes || '',
      producedQuantity: formData.producedQuantity || '',
      status: formData.status || '',
      active: true
    };

    try {
      const response = await apiCalls('put', '/master/createUpdateProductionOrder', payload);
      console.log('data to save', payload);

      if (response.status) {
        showToast('success', editId ? 'Production updated successfully' : 'Production created successfully');
        handleClear();
        getAllProductionManagement();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving Production:', error);
      showToast('error', 'Failed to save Production: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      docDate: dayjs(),
      relatedOrder: '',
      productName: '',
      plannedQuantity: '',
      productionLine: '',
      startDate: dayjs(),
      plannedCompletionDate: dayjs(),
      shift: '',
      supervisorName: '',
      notes: '',
      producedQuantity: '',
      status: '',
      finYear: finYear,
      orgId: orgId,
      branch: branch,
      branchCode: branchCode,
      createdBy: createdBy
    });
    setFieldErrors({
      docDate: '',
      relatedOrder: '',
      productName: '',
      plannedQuantity: '',
      productionLine: '',
      startDate: '',
      plannedCompletionDate: '',
      shift: '',
      supervisorName: '',
      notes: '',
      producedQuantity: '',
      status: ''
    });
    setEditId('');
    getProductionDocId();
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };

  const [summaryCounts, setSummaryCounts] = useState({
    New: 0,
    Qualified: 0,
    Unqualified: 0,
    InProgress: 0
  });

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
            <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
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
            <CommonTableWithStatus
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              toEdit={getProductionById}
              summaryCounts={summaryCounts}
            />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Production ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="productionDocId"
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Production Date"
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
                  <FormControl fullWidth size="small" error={!!fieldErrors.relatedOrder}>
                    <InputLabel>Related Order</InputLabel>
                    <Select
                      label="Related Order"
                      name="relatedOrder"
                      value={formData.relatedOrder}
                      onChange={handleInputChange}
                      // error={!!fieldErrors.source}
                      // helperText={fieldErrors.source}
                    >
                      {relatedOrder.map((relatedOrder) => (
                        <MenuItem key={relatedOrder} value={relatedOrder}>
                          {relatedOrder}
                        </MenuItem>
                      ))}
                    </Select>
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
                  <TextField
                    label={
                      <span>
                        Planned Qty(Mt)<span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="plannedQuantity"
                    type="number"
                    value={formData.plannedQuantity}
                    onChange={handleInputChange}
                    error={!!fieldErrors.plannedQuantity}
                    helperText={fieldErrors.plannedQuantity}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                    <InputLabel id="demo-simple-select-label">
                      Production Line <span style={{ color: 'red', fontSize: '20px' }}>*</span>
                    </InputLabel>
                    <Select
                      labelId="productionLine"
                      name="productionLine"
                      value={formData.productionLine}
                      onChange={handleInputChange}
                      label="Production Line"
                      error={!!fieldErrors.productionLine}
                    >
                      <MenuItem value="LINE A">LINE A</MenuItem>
                      <MenuItem value="LINE B">LINE B</MenuItem>
                      <MenuItem value="LINE C">LINE C</MenuItem>
                      <MenuItem value="LINE D">LINE D</MenuItem>
                      <MenuItem value="LINE E">LINE E</MenuItem>
                    </Select>
                    {fieldErrors.productionLine && <FormHelperText style={{ color: 'red' }}>{fieldErrors.productionLine}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate ? dayjs(formData.startDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('startDate', date)}
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
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Expected Close Date"
                        value={formData.plannedCompletionDate ? dayjs(formData.plannedCompletionDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('plannedCompletionDate', date)}
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
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Produced Qty<span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="producedQuantity"
                    type="number"
                    value={formData.producedQuantity}
                    onChange={handleInputChange}
                    error={!!fieldErrors.producedQuantity}
                    helperText={fieldErrors.producedQuantity}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.shift}>
                    <InputLabel id="shift-label">
                      Shift <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Select
                      labelId="shift-label"
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      label="Shift"
                      renderValue={(selected) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {shiftIcons[selected]}
                          <span>{selected}</span>
                        </div>
                      )}
                    >
                      <MenuItem value="Day Shift">
                        <ListItemIcon>
                          <WbSunnyIcon sx={{ color: '#fbc02d' }} />
                        </ListItemIcon>
                        <ListItemText primary="Day Shift" />
                      </MenuItem>

                      <MenuItem value="Night Shift">
                        <ListItemIcon>
                          <Brightness2Icon sx={{ color: '#1565c0' }} />
                        </ListItemIcon>
                        <ListItemText primary="Night Shift" />
                      </MenuItem>

                      <MenuItem value="General Shift">
                        <ListItemIcon>
                          <AccessTimeIcon sx={{ color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="General Shift" />
                      </MenuItem>
                    </Select>
                    {fieldErrors.shift && <FormHelperText style={{ color: 'red' }}>{fieldErrors.shift}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={supervisorName}
                    getOptionLabel={(option) => (option?.supervisorName ? `${option.supervisorName} - ${option.supervisorCode}` : '')}
                    value={supervisorName.find((item) => item.supervisorName === formData.supervisorName) || null}
                    onChange={(event, newValue) =>
                      handleInputChange({
                        target: {
                          name: 'supervisorName',
                          value: newValue ? newValue.supervisorName : ''
                        }
                      })
                    }
                    isOptionEqualToValue={(option, value) => option.supervisorName === value.supervisorName}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Supervisor <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.supervisorName}
                        helperText={fieldErrors.supervisorName}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                    <InputLabel id="demo-simple-select-label">
                      Status <span style={{ color: 'red', fontSize: '20px' }}>*</span>
                    </InputLabel>
                    <Select
                      labelId="statusLabel"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                      error={!!fieldErrors.status}
                    >
                      <MenuItem value="PLANNED">PLANNED</MenuItem>
                      <MenuItem value="INPROGRESS">INPROGRESS</MenuItem>
                      <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                      <MenuItem value="ONHOLD">ONHOLD</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
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
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductionManagement;

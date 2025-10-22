import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField, Box, Tab, Tabs, MenuItem, Select, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
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
import CommonTableWithStatus from 'views/basicMaster/CommonTableWithStatus';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

const QualityManagement = ({ selectedRow }) => {
  const [listViewData, setListViewData] = useState([]);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [productName, setProductName] = useState([]);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listView, setListView] = useState(true);
  const [docId, setDocId] = useState('');
  const [resultList] = useState(['Pass', 'Fail', 'Pending']);
  const [testTypeList] = useState(['Tensile Test', 'Bend Test', 'Chemical Analysis', 'Weight Test']);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      // setListView(false);
      getLeadById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    branch: branch,
    branchCode: branchCode,
    createdBy: createdBy,
    finYear: finYear,
    orgId: orgId,
    docDate: dayjs(),
    batchNumber: '',
    inspector: '',
    product: '',
    remarks: '',
    result: '',
    testType: '',
    testdate: dayjs()
  });

  const [fieldErrors, setFieldErrors] = useState({
    docDate: '',
    batchNumber: '',
    inspector: '',
    product: '',
    remarks: '',
    result: '',
    testType: '',
    testdate: ''
  });

  const listViewColumns = [
    { accessorKey: 'product', header: 'Product', size: 140 },
    { accessorKey: 'batchNumber', header: 'Batch', size: 140 },
    { accessorKey: 'testType', header: 'Type', size: 140 },
    { accessorKey: 'testdate', header: 'Date', size: 140 },
    { accessorKey: 'inspector', header: 'Inspector', size: 140 },
    { accessorKey: 'result', header: 'Result', size: 140 },
    // { accessorKey: 'city', header: 'Certificate', size: 140 }
  ];

  useEffect(() => {
    getAllQuality();
    getLeadDocId();
    getProductName();
  }, []);
  const getLeadDocId = async () => {
    if (editId) return;
    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/inventoryitem/getQualityTestDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status) {
        setDocId(response.paramObjectsMap.qualityTestDocId);
      }
    } catch (err) {
      console.error('Error fetching Quality docId:', err);
      showToast('error', 'Failed to generate Quality ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllQuality = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/inventoryitem/getAllQualityTestByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status === true && response.paramObjectsMap?.qualityTestVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.qualityTestVO].reverse());
      } else {
        setListViewData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('error', 'Failed to fetch leads');
      setIsLoading(false);
    }
  };
  const getLeadById = async (row) => {
    setIsLoading(true);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/inventoryitem/getQualityTestById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const quality = response.paramObjectsMap.qualityTestVO;
        // Map API fields to formData state
        setFormData({
          branch: quality.branch || '',
          branchCode: quality.branchCode || '',
          createdBy: quality.createdBy || '',
          finYear: quality.finYear || '',
          orgId: quality.orgId || '',
          docDate: quality.docdate || dayjs(),
          batchNumber: quality.batchNumber || '',
          inspector: quality.inspector || '',
          product: quality.product || '',
          remarks: quality.remarks || '',
          result: quality.result || '',
          testType: quality.testType || '',
          testdate: quality.testdate || dayjs()
        });
        setDocId(quality.docid || '');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching Quality details:', error);
      showToast('error', 'Failed to fetch Quality details');
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'contactNo' ? String(value) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const handleSave = async () => {
    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      branch: formData.branch || '',
      branchCode: formData.branchCode || '',
      createdBy: formData.createdBy || '',
      finYear: formData.finYear || '',
      orgId: formData.orgId || '',
      docDate: formData.docDate || dayjs(),
      batchNumber: formData.batchNumber || '',
      inspector: formData.inspector || '',
      product: formData.product || '',
      remarks: formData.remarks || '',
      result: formData.result || '',
      testType: formData.testType || '',
      testdate: formData.testdate || dayjs(),
      active: true
    };

    try {                                      
      const response = await apiCalls('put', '/inventoryitem/createUpdateQualityTest', payload);
      if (response.status) {
        showToast('success', editId ? 'Quality Management updated successfully' : 'Quality Management created successfully');
        handleClear();
        getAllQuality();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving Quality:', error);
      showToast('error', 'Failed to save Quality: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      branch: branch,
      branchCode: branchCode,
      createdBy: createdBy,
      finYear: finYear,
      orgId: orgId,
      docDate: dayjs(),
      batchNumber: '',
      inspector: '',
      product: '',
      remarks: '',
      result: '',
      testType: '',
      testdate: dayjs()
    });
    setFieldErrors({
      docDate: '',
      batchNumber: '',
      inspector: '',
      product: '',
      remarks: '',
      result: '',
      testType: '',
      testdate: ''
    });
    setEditId('');
    getLeadDocId();
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
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
            <CommonListViewTable data={listViewData} columns={listViewColumns} enableEditing={true} toEdit={getLeadById} />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Quality Control ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="qualityControlDocId"
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Quality Control Date"
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
                    value={productName.find((item) => item.productName === formData.product) || null}
                    onChange={(event, newValue) =>
                      handleInputChange({
                        target: { name: 'product', value: newValue?.productName || '' }
                      })
                    }
                    isOptionEqualToValue={(option, value) => option.productName === value.productName}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<span>Product</span>}
                        size="small"
                        error={!!fieldErrors.product}
                        helperText={fieldErrors.product}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={<span>Batch Number</span>}
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
                  <FormControl fullWidth size="small" error={!!fieldErrors.testType}>
                    <InputLabel>Test Type</InputLabel>
                    <Select
                      label="Test Type *"
                      name="testType"
                      value={formData.testType}
                      onChange={handleInputChange}
                      error={!!fieldErrors.testType}
                      helperText={fieldErrors.testType}
                    >
                      {testTypeList.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.testType && <FormHelperText style={{ color: 'red' }}>{fieldErrors.testType}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Test Date"
                        value={formData.testdate ? dayjs(formData.testdate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('testdate', date)}
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
                    label={<span>Inspector</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="inspector"
                    value={formData.inspector}
                    onChange={handleInputChange}
                    error={!!fieldErrors.inspector}
                    helperText={fieldErrors.inspector}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.result}>
                    <InputLabel>Result</InputLabel>
                    <Select
                      label="Result *"
                      name="result"
                      value={formData.result}
                      onChange={handleInputChange}
                      error={!!fieldErrors.result}
                      helperText={fieldErrors.result}
                    >
                      {resultList.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.result && <FormHelperText style={{ color: 'red' }}>{fieldErrors.result}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-6 mb-3">
                  <TextField
                    label={<span>Remarks</span>}
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    error={!!fieldErrors.remarks}
                    helperText={fieldErrors.remarks}
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

export default QualityManagement;

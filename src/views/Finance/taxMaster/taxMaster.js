import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';
import TableComponent from './TableComponent';

const TaxMaster = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [formValues, setFormValues] = useState({
    active: true,
    cancel: true,
    cancelRemarks: '',
    createdBy: '',
    finYear: '',
    gst: '',
    gstSlab: 0,
    orgId: orgId,
    serviceAccountCode: '',
    taxMasterDetailsDTO: [],
    updatedBy: '',
    warehouse: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getAllTaxMasterByOrgId();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Validate the input fields
    if (id === 'finYear' || id === 'gst' || id === 'gstSlab' || id === 'serviceAccountCode' || id === 'warehouse') {
      if (!value.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: 'This field is required'
        }));
      } else {
        setValidationErrors((prev) => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const columns = [
    { accessorKey: 'finYear', header: 'FinYear', size: 140 },
    { accessorKey: 'serviceAccountCode', header: 'Service Account Code', size: 140 },
    { accessorKey: 'warehouse', header: 'warehouse', size: 140 },
    { accessorKey: 'gst', header: 'GST', size: 140 },
    { accessorKey: 'gstSlab', header: 'GSTSlab', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const handleClear = () => {
    setFormValues({
      finYear: '',
      serviceAccountCode: '',
      active: true,
      warehouse: '',
      gst: '',
      gstSlab: ''
    });
    setValidationErrors({});
  };

  const formatDate = (date) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero based
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    const formDataWithEncryptedPassword = {
      ...formValues,
      taxMasterDetailsDTO: formValues.taxMasterDetailsDTO.map((item) => ({
        ...item,
        fromDate: formatDate(item.fromDate),
        toDate: formatDate(item.fromDate)
      }))
    };
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await apiCalls('put', '/master/updateCreateTaxMaster', formDataWithEncryptedPassword);

        toast.success(editMode ? ' Tax Master Updated Successfully' : ' Tax Master created successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
        getAllTaxMasterByOrgId();
        handleClear();
        setIsLoading(false);
      } catch (error) {
        console.error('Save Failed', error);
      }
    } else {
      console.error('Validation Errors:', validationErrors);
    }
  };

  const getAllTaxMasterByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllTaxMasterByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.taxMasterVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getTaxMasterById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getAllTaxMasterById?id=${row.original.id}`);

      if (result) {
        const taxMasterVO = result.paramObjectsMap.taxMasterVO[0];
        setEditMode(true);

        setFormValues({
          finYear: taxMasterVO.finYear || '',
          gst: taxMasterVO.gst || '',
          gstSlab: taxMasterVO.gstSlab || '',
          serviceAccountCode: taxMasterVO.serviceAccountCode || '',
          warehouse: taxMasterVO.warehouse || '',
          active: taxMasterVO.active || false,
          id: taxMasterVO.id || 0,
          taxMasterDetailsDTO: taxMasterVO.taxMasterDetailsVO || [],
          orgId: orgId
        });
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.finYear.trim()) {
      errors.finYear = 'This field is required';
    }
    if (!formValues.serviceAccountCode.trim()) {
      errors.serviceAccountCode = 'This field is required';
    }
    if (!formValues.gst.trim()) {
      errors.gst = 'This field is required';
    }
    // if (!formValues.gstSlab.trim()) {
    //   errors.gstSlab = 'This field is required';
    // }
    if (!formValues.warehouse.trim()) {
      errors.warehouse = 'This field is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} margin="0 10px 0 10px" />
        </div>
        {showForm ? (
          <>
            <div className="row d-flex">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="finYear"
                    label="FinYear"
                    size="small"
                    required
                    value={formValues.finYear}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.finYear}
                    helperText={validationErrors.finYear}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="serviceAccountCode"
                    label="Service Account Code"
                    size="small"
                    required
                    value={formValues.serviceAccountCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.serviceAccountCode}
                    helperText={validationErrors.serviceAccountCode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="warehouse"
                    label="Warehouse"
                    size="small"
                    required
                    value={formValues.warehouse}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.warehouse}
                    helperText={validationErrors.warehouse}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="gst"
                    label="GST"
                    size="small"
                    required
                    value={formValues.gst}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.gst}
                    helperText={validationErrors.gst}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="gstSlab"
                    label="GST slab"
                    size="small"
                    required
                    value={formValues.gstSlab}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.gstSlab}
                    helperText={validationErrors.gstSlab}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="active"
                        checked={formValues.active}
                        onChange={handleInputChange}
                        sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                      />
                    }
                    label="Active"
                  />
                </FormGroup>
              </div>
            </div>
            <TableComponent formValues={formValues} setFormValues={setFormValues} />
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getTaxMasterById} />
        )}
      </div>
    </div>
  );
};

export default TaxMaster;

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';
import { FormHelperText } from '@mui/material';

const CostCenter = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formValues, setFormValues] = useState({
    active: true,
    createdBy: loginUserName,
    orgId: orgId,
    dimensionType: '',
    valueCode: '',
    valueDescription: ''
    // updatedBy: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getAllCostCenterByOrgId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    // Handle checkboxes separately
    if (type === 'checkbox') {
      setFormValues((prev) => ({
        ...prev,
        [name]: checked // Use 'checked' for checkboxes
      }));

      return;
    }

    // Handle dropdown (Select)
    if (name === 'dimensionType') {
      setFormValues((prev) => ({
        ...prev,
        [name]: value
      }));

      if (!value) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: 'This field is required'
        }));
      } else {
        setValidationErrors((prev) => {
          const { [name]: removed, ...rest } = prev;
          return rest;
        });
      }
      return;
    }

    // Convert input to uppercase
    const uppercasedValue = value.toUpperCase();

    // Check and restrict input for valueCode
    if (name === 'valueCode') {
      const filteredValue = uppercasedValue.replace(/[^0-9\s]/g, ''); // Allow only numbers
      setFormValues((prev) => ({
        ...prev,
        [name]: filteredValue
      }));

      if (uppercasedValue !== filteredValue) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: 'Only numbers are allowed'
        }));
      } else if (!filteredValue.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: 'This field is required'
        }));
      } else {
        setValidationErrors((prev) => {
          const { [name]: removed, ...rest } = prev;
          return rest;
        });
      }
      return;
    }

    // Check and restrict input for valueDescription
    if (name === 'valueDescription') {
      const filteredValue = uppercasedValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Alphanumeric only
      setFormValues((prev) => ({
        ...prev,
        [name]: filteredValue
      }));

      if (uppercasedValue !== filteredValue) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: 'Only alphabets and numbers are allowed'
        }));
      } else if (!filteredValue.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: 'This field is required'
        }));
      } else {
        setValidationErrors((prev) => {
          const { [name]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const columns = [
    { accessorKey: 'dimensionType', header: 'Dimension Type', size: 140 },
    { accessorKey: 'valueCode', header: 'Value Code', size: 140 },
    { accessorKey: 'valueDescription', header: 'valueDescription', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const handleClear = () => {
    setFormValues({
      dimensionType: '',
      valueCode: '',
      active: true,
      createdBy: 'currentUser',
      updatedBy: 'currentUser',
      valueDescription: ''
    });
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await apiCalls('put', '/master/updateCreateCostCenter', formValues);
        console.log('Save Successful', response.data);
        toast.success(editMode ? ' Cost Center Updated Successfully' : ' Cost center created successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
        handleClear();
        getAllCostCenterByOrgId();
        setIsLoading(false);
      } catch (error) {
        console.error('Save Failed', error);
      }
    } else {
      console.error('Validation Errors:', validationErrors);
    }
  };

  const getAllCostCenterByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllCostCenterByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.costCenterVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getCostCenterById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getCostCenterById?id=${row.original.id}`);
      if (result) {
        const costCenterVO = result.paramObjectsMap.costCenterVO[0];
        setEditMode(true);

        setFormValues({
          dimensionType: costCenterVO.dimensionType || '',
          valueCode: costCenterVO.valueCode || '',
          active: costCenterVO.active || false,
          id: costCenterVO.id || 0,
          valueDescription: costCenterVO.valueDescription || '',
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
    if (!formValues.dimensionType.trim()) {
      errors.dimensionType = 'This field is required';
    }
    if (!formValues.valueCode.trim()) {
      errors.valueCode = 'This field is required';
    }
    if (!formValues.valueDescription.trim()) {
      errors.valueDescription = 'This field is required';
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
                <FormControl fullWidth size="small">
                  <InputLabel id="dimensionType">Dimension Type</InputLabel>
                  <Select
                    labelId="dimensionType"
                    id="dimensionType"
                    label="Dimension Type"
                    onChange={handleInputChange}
                    name="dimensionType"
                    value={formValues.dimensionType}
                  >
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                  {validationErrors.dimensionType && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="valueCode"
                    label="Value Code"
                    name="valueCode"
                    size="small"
                    required
                    value={formValues.valueCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.valueCode}
                    helperText={validationErrors.valueCode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="valueDescription"
                    label="Value Description"
                    name="valueDescription"
                    size="small"
                    required
                    value={formValues.valueDescription}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.valueDescription}
                    helperText={validationErrors.valueDescription}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="active"
                        name="active"
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
            {/* <TableComponent formValues={formValues} setFormValues={setFormValues} /> */}
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getCostCenterById} />
        )}
      </div>
    </div>
  );
};

export default CostCenter;

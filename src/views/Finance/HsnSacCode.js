import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';

const HsnSacCode = () => {

  const [formData, setFormData] = useState({
    active: true,
    serviceAccountCode: '',
    sacDescription: '',
    product: ''
  });


  const [fieldErrors, setFieldErrors] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const columns = [
    { accessorKey: 'serviceAccountCode', header: 'Service Account Code', size: 240 },
    { accessorKey: 'sacDescription', header: 'SAC Description', size: 140 },
    { accessorKey: 'product', header: 'Product', size: 100 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllHsnSacCode();
  }, []);

  const getAllHsnSacCode = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllSacCodeByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.sacCodeVO);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllSacCodeById = async (row) => {
    setEditId(row.original.id);
    try {
      const result = await apiCalls('get', `/master/getAllSacCodeById?id=${row.original.id}`);
      if (result.status === true) {
        const hsnSocCodeVO = result.paramObjectsMap.sacCodeVO[0];
        setShowForm(true);
        setFormData({
          active: hsnSocCodeVO.active || false,
          serviceAccountCode: hsnSocCodeVO.serviceAccountCode || '',
          sacDescription: hsnSocCodeVO.sacDescription || '',
          product: hsnSocCodeVO.product || '',
          id: hsnSocCodeVO.id || 0,
          orgId: orgId
        });
      } else {
        console.error('API Error:', result.paramObjectsMap.errorMessage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleCheckboxChange = (event) => {
    setFormData({ ...formData, active: event.target.checked });
  };

  const handleClear = () => {
    setFormData({
      active: true,
      serviceAccountCode: '',
      sacDescription: '',
      product: ''
    });
    setEditId('');
    setFieldErrors({});
  };

  const handleList = () => {
    setShowForm(!showForm);
    setFieldErrors({});
  };

  const validateForm = () => {
    let errors = {};
    let hasError = false;

    if (!formData.serviceAccountCode) {
      errors.serviceAccountCode = 'SAC is required';
      hasError = true;
    }
    if (!formData.sacDescription) {
      errors.sacDescription = 'SAC Description is required';
      hasError = true;
    }
    if (!formData.product) {
      errors.product = 'Product is required';
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formDataToSend = {
        ...(editId && { id: editId }),
        active: formData.active,
        serviceAccountCode: formData.serviceAccountCode,
        sacDescription: formData.sacDescription,
        product: formData.product,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('Saving HSN code with payload:', formDataToSend);

      try {
        const result = await apiCalls('put', '/master/updateCreateSacCode', formDataToSend);
        if (result.status === true) {
          showToast('success', editId ? 'SAC Code Updated Successfully' : 'SAC Code created successfully');
          getAllHsnSacCode();
          handleClear();
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'SAC code creation failed');
        }
      } catch (error) {
        console.error('API Error:', error);
        showToast('error', 'An error occurred while saving');
      }
    } else {
      showToast('error', 'Please fill in all required fields');
    }
  };

  return (
    <div>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSubmit} margin="0 10px 0 10px" />
        </div>

        {showForm ? (
          <div className="row d-flex align-items-center">
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="serviceAccountCode"
                  name="serviceAccountCode"
                  label={
                    <span>
                      Service Account Code <span className="asterisk">*</span>
                    </span>
                  }
                  size="small"
                  value={formData.serviceAccountCode}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 30 }}
                  error={!!fieldErrors.serviceAccountCode}
                  helperText={fieldErrors.serviceAccountCode}
                />
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="sacDescription"
                  name="sacDescription"
                  label={
                    <span>
                      SAC Description <span className="asterisk">*</span>
                    </span>
                  }
                  size="small"
                  value={formData.sacDescription}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 50 }}
                  error={!!fieldErrors.sacDescription}
                  helperText={fieldErrors.sacDescription}
                />
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="product"
                  name="product"
                  label={
                    <span>
                      Product <span className="asterisk">*</span>
                    </span>
                  }
                  size="small"
                  value={formData.product}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 30 }}
                  error={!!fieldErrors.product}
                  helperText={fieldErrors.product}
                />
              </FormControl>
            </div>
            <div className="col-md-4 mb-2">
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />} label="Active" />
              </FormGroup>
            </div>
          </div>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getAllSacCodeById} />
        )}
      </div>
    </div>
  );
};

export default HsnSacCode;

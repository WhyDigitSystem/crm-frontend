import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { FormControlLabel, Checkbox, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import FullScreenLoader from 'utils/FullScreenLoader';
import AddIcon from '@mui/icons-material/Add';

const Port = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    countryCode: '',
    countryName: '',
    portCode: '',
    portName: '',
    type: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    countryCode: '',
    countryName: '',
    portCode: '',
    portName: '',
    type: ''
  });

  const listViewColumns = [
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'portName', header: 'Port Name', size: 140 },
    { accessorKey: 'portCode', header: 'Port Code', size: 140 },
    { accessorKey: 'countryName', header: 'Country Name', size: 140 }
  ];
  const getAllCountry = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/country?orgid=${orgId}`);
      if (response.status === true) {
        const filteredCountries = (response.paramObjectsMap.countryVO || []).filter((country) => country.active === 'Active');
        setCountryList(filteredCountries);
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
    getAllCountry();
    getAllPortByOrgId();
  }, []);

  const getAllPortByOrgId = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `/commonmaster/getAllPortByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.portVO.reverse() || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('error', err);
    }
  };
  const getPortById = async (row) => {
    setShowForm(true);
    setLoading(true);
    try {
      const result = await apiCalls('get', `/commonmaster/getAllPortById?id=${row.original.id}`);

      const PortVO = result?.paramObjectsMap?.portVO;

      if (PortVO) {
        setEditId(row.original.id);
        setFormData({
          countryCode: PortVO.countryCode || '',
          countryName: PortVO.countryName || '',
          portCode: PortVO.portCode || '',
          portName: PortVO.portName || '',
          active: PortVO.active || '',
          type: PortVO.type || '',
          active: PortVO.active === 'Active' ? true : false
        });
      } else {
        console.error('PortVO not found in response:', result);
        // You can also show an error toast here
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
  const handleClear = () => {
    setFormData({
      active: true,
      countryCode: '',
      countryName: '',
      portCode: '',
      portName: '',
      type: ''
    });
    setFieldErrors({});
    setEditId('');
  };
  const handleView = () => {
    setShowForm(!showForm);
    handleClear();
  };

  const handleSave = async () => {
    setLoading(true);
    const errors = {};
    if (!formData.portName) {
      errors.portName = 'Port Name is required';
    }
    if (!formData.countryName) {
      errors.countryName = 'Country Name is required';
    }
    if (!formData.type) {
      errors.type = 'Type is required';
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
        type: formData.type,
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        portCode: formData.portCode,
        active: formData.active,
        portName: formData.portName
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/commonmaster/createUpdatePort`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Port Updated Successfully' : 'Port Created successfully');
          getAllPortByOrgId();
          handleClear();
          setLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Port creation failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        showToast('error', 'Port creation failed');
      }
    } else {
      setFieldErrors(errors);
      setLoading(false);
    }
  };
  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
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
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {!showForm && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
            {showForm && (
              <>
                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
              </>
            )}
          </div>
          {showForm ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    id="type"
                    label="Type"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="portName"
                    label="Port Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="portName"
                    value={formData.portName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="portCode"
                    label="Port Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="portCode"
                    value={formData.portCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={countryList}
                    getOptionLabel={(option) => (option?.countryName ? `${option.countryName}` : '')}
                    value={countryList.find((item) => item.countryName === formData.countryName) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          countryName: newValue.countryName,
                          countryCode: newValue.countryCode
                        }));
                        setFieldErrors((prev) => ({ ...prev, countryName: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, countryName: '' }));
                        setFieldErrors((prev) => ({ ...prev, countryName: 'Country is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Country <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.countryName}
                        helperText={fieldErrors.countryName}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    id="countryCode"
                    label="Country Code"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControlLabel
                    control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                    label="Active"
                    labelPlacement="end"
                  />
                </div>
              </div>
            </>
          ) : (
            <CommonListViewTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getPortById} />
          )}
        </div>
      </div>
    </>
  );
};
export default Port;

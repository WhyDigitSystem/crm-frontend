import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, ButtonBase, FormHelperText, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useMemo, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry } from 'utils/CommonFunctions';
import apiCalls from 'apicall';

const Company = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [editId, setEditId] = useState('');

  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    ceo: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    gst: '',
    website: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyCode: '',
    ceo: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    gst: '',
    website: '',
    active: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'companyCode', header: 'Company Code', size: 140 },
    {
      accessorKey: 'companyName',
      header: 'Company',
      size: 140
    },
    {
      accessorKey: 'employeeName',
      header: 'Admin',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getCompanyDetails();
    // getCompany();
    getAllCountries();
    if (formData.country) {
      getAllStates();
    }
    if (formData.state) {
      getAllCities();
    }
  }, [formData.country, formData.state]);

  const getAllCountries = async () => {
    try {
      const countryData = await getAllActiveCountries(orgId);
      setCountryList(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllStates = async () => {
    try {
      const stateData = await getAllActiveStatesByCountry(formData.country, orgId);
      setStateList(stateData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllCities = async () => {
    try {
      const cityData = await getAllActiveCitiesByState(formData.state, orgId);
      setCityList(cityData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
  //   const nameRegex = /^[A-Za-z ]*$/;
  //   const branchNameRegex = /^[A-Za-z0-9@_\-*]*$/;
  //   const numericRegex = /^[0-9]*$/;
  //   const alphanumericRegex = /^[A-Za-z0-9]*$/;

  //   if (name === 'ceo' && !nameRegex.test(value)) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Only alphabetic characters are allowed' });
  //   } else if (name === 'pincode') {
  //     if (!numericRegex.test(value)) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only numeric characters are allowed' });
  //     } else if (value.length > 6) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only 6 digits are allowed' });
  //     } else {
  //       setFieldErrors({ ...fieldErrors, [name]: '' });
  //     }
  //   } else if (name === 'gst') {
  //     if (!alphanumericRegex.test(value)) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Special characters are not allowed' });
  //     } else if (value.length > 15) {
  //       setFieldErrors({ ...fieldErrors, [name]: 'Only 15 characters are allowed' });
  //     } else {
  //       setFieldErrors({ ...fieldErrors, [name]: '' });
  //     }
  //   } else {
  //     setFieldErrors({ ...fieldErrors, [name]: '' });
  //   }

  //   // Update the form data
  //   if (name === 'active') {
  //     setFormData({ ...formData, [name]: checked });
  //   } else {
  //     setFormData({ ...formData, [name]: value.toUpperCase() });
  //   }

  //   // Update the cursor position after the input change
  //   if (type === 'text' || type === 'textarea' || type === 'email') {
  //     setTimeout(() => {
  //       const inputElement = document.getElementsByName(name)[0];
  //       if (inputElement) {
  //         inputElement.setSelectionRange(selectionStart, selectionEnd);
  //       }
  //     }, 0);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;

    // Regular expressions for validation
    const nameRegex = /^[A-Za-z ]*$/; // Allows only alphabetic characters and spaces
    const numericRegex = /^[0-9]*$/; // Allows only numeric characters
    const alphanumericRegex = /^[A-Za-z0-9]*$/; // Allows only alphanumeric characters

    let error = '';

    // Validation logic
    if (name === 'ceo') {
      if (!nameRegex.test(value)) {
        error = 'Only alphabetic characters are allowed';
      }
    } else if (name === 'pincode') {
      if (!numericRegex.test(value)) {
        error = 'Only numeric characters are allowed';
      } else if (value.length > 6) {
        error = 'Only 6 digits are allowed';
      }
    } else if (name === 'gst') {
      if (!alphanumericRegex.test(value)) {
        error = 'Special characters are not allowed';
      } else if (value.length > 15) {
        error = 'Only 15 characters are allowed';
      }
    }

    // Handle errors if validation fails
    if (error) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error
      }));
    } else {
      // Clear previous error if input is valid
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));

      // Update the form data
      let updatedValue = value;

      if (name !== 'active') {
        updatedValue = value.toUpperCase();
      }

      if (type === 'checkbox') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: checked
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: updatedValue
        }));
      }

      // Handle cursor position reset after input change (for text, email, and textarea)
      if (type === 'text' || type === 'textarea' || type === 'email') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const getCompanyById = async (row) => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];
        console.log('PARTICULAR COMPANY IS:', particularCompany);

        setFormData({
          companyCode: particularCompany.companyCode,
          companyName: particularCompany.companyName,
          ceo: particularCompany.ceo,
          address: particularCompany.address,
          country: particularCompany.country,
          state: particularCompany.state,
          city: particularCompany.city,
          pincode: particularCompany.zip,
          gst: particularCompany.gst,
          website: particularCompany.webSite
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        const particularCompany = response.paramObjectsMap.companyVO[0];
        setListViewData(response.paramObjectsMap.companyVO);
        console.log('THE LISTVIEW COMPANY IS:', particularCompany);

        setFormData({ ...formData, companyCode: particularCompany.companyCode, companyName: particularCompany.companyName });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClear = () => {
    setFormData({
      // companyCode: '',
      ceo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      gst: '',
      website: '',
      active: true
    });
    setFieldErrors({
      // companyCode: '',
      ceo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      gst: '',
      website: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.ceo) {
      errors.ceo = 'CEO is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.gst) {
      errors.gst = 'GST is required';
    } else if (formData.gst.length < 15) {
      errors.gst = 'Invalid GST No';
    }
    if (formData.pincode.length < 6 && formData.pincode.length >= 1) {
      errors.pincode = 'Invalid Pincode';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        id: orgId,
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        ceo: formData.ceo,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zip: formData.pincode,
        gst: formData.gst,
        webSite: formData.website,
        active: formData.active,
        updatedBy: loginUserName
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);

          showToast('success', ' Company updated Successfully');
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Company updation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Company updation failed');

        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    console.log('LIST VIEW DATAS ARE:', listViewData);

    setListView(!listView);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              // editCallback={editEmployee}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCompanyById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Company Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyName"
                  value={formData.companyName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleInputChange}
                  // error={!!fieldErrors.companyCode}
                  // helperText={fieldErrors.companyCode}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="CEO"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="ceo"
                  value={formData.ceo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.ceo}
                  helperText={fieldErrors.ceo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Address"
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
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.country}>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                    {Array.isArray(countryList) &&
                      countryList?.map((row) => (
                        <MenuItem key={row.id} value={row.countryName}>
                          {row.countryName}
                        </MenuItem>
                      ))}
                  </Select>
                  {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select labelId="state-label" label="State" value={formData.state} onChange={handleInputChange} name="state">
                    {stateList?.map((row) => (
                      <MenuItem key={row.id} value={row.stateName}>
                        {row.stateName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.state && <FormHelperText>{fieldErrors.state}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.state}>
                  <InputLabel id="city-label">City</InputLabel>
                  <Select labelId="city-label" label="City" value={formData.city} onChange={handleInputChange} name="city">
                    {cityList?.map((row) => (
                      <MenuItem key={row.id} value={row.cityName}>
                        {row.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && <FormHelperText>{fieldErrors.city}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="pincode"
                  value={formData.pincode}
                  maxLength={6}
                  onChange={handleInputChange}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="GST"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  error={!!fieldErrors.gst}
                  helperText={fieldErrors.gst}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Official Website"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  error={!!fieldErrors.website}
                  helperText={fieldErrors.website}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                  label="Active"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default Company;

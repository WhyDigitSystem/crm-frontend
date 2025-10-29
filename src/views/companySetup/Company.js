import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { Avatar, Typography, FormHelperText, Button, Dialog, DialogContent } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import { getAllActiveCitiesByState, getAllActiveCountries, getAllActiveStatesByCountry, getAllActiveCurrency } from 'utils/CommonFunctions';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Company = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [editId, setEditId] = useState('');

  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gst: '',
    webSite: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyCode: '',
    ceo: '',
    address: '',
    currency: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileNo: '',
    gst: '',
    webSite: '',
    active: true
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
      accessorKey: 'ceo',
      header: 'CEO',
      size: 140
    },
    {
      accessorKey: 'gst',
      header: 'GST',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllCountries();
    getCompanyDetails();
    getAllCurrency();
  }, []); // Run only once on mount

  useEffect(() => {
    if (formData.country) {
      getAllStates(); // Fetch states only when country changes
    }
  }, [formData.country]); // Only depend on country change

  useEffect(() => {
    if (formData.state) {
      getAllCities(); // Fetch cities only when state changes
    }
  }, [formData.state]); // Only depend on state change

  const getAllCurrency = async () => {
    try {
      const currencyData = await getAllActiveCurrency(orgId);
      setCurrencyList(currencyData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
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

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target || e;

    // Regular expressions for validation
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;
    const alphanumericRegex = /^[A-Za-z0-9]*$/;

    let newValue = value;
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
    } else if (name === 'mobileNo') {
      if (!alphanumericRegex.test(value)) {
        error = 'Special characters are not allowed';
      } else if (value.length > 10) {
        error = 'Only 10 characters are allowed';
      }
    }

    // Update error state
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));

    // Only update form data if there's no error
    if (!error) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue
      }));
    }

    if (type === 'checkbox') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: checked
      }));
      return; // Exit here to avoid further processing for checkboxes
    }

   

    // Handle dropdowns separately
    if (type === 'select-one') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value
      }));
      return;
    }

    // If it's not a checkbox or dropdown, process the input normally
    if (type !== 'checkbox' && type !== 'select-one') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: newValue
      }));
    }
  };

  const getCompanyById = async (row) => {
    console.log('THE SELECTED BRANCH ID IS:', row.original.id);
    setEditId(row.original.id);

    try {
      const response = await apiCalls('get', `commonmaster/company/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularCompany = response.paramObjectsMap.companyVO[0];
        console.log('PARTICULAR COMPANY IS:', particularCompany);
        setLogo(response.paramObjectsMap.companyVO[0].companyLogo);
        
        setFormData({
          companyCode: particularCompany.companyCode,
          companyName: particularCompany.companyName,
          ceo: particularCompany.ceo,
          address: particularCompany.address,
          country: particularCompany.country,
          currency: particularCompany.currency,
          state: particularCompany.state,
          city: particularCompany.city,
          pincode: particularCompany.zip,
          mobileNo: particularCompany.phone,
          gst: particularCompany.gst,
          webSite: particularCompany.webSite,
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
      const response = await apiCalls('get', `commonmaster/company`);
      console.log('API Response:', response);

      if (response.status === true) {
        const companyList = response.paramObjectsMap.companyVO;
        setListViewData(companyList);

        console.log('THE LISTVIEW COMPANY IS:', companyList);

        // Check if orgId exists and matches any company's id
        const matchedCompany = companyList.find((company) => company.id === parseInt(orgId));

        if (matchedCompany) {
          console.log('MATCHED COMPANY ID FOUND:', matchedCompany.id);
          await getCompanyById({ original: { id: matchedCompany.id } }); // Call getCompanyById if match is found
        } else {
          console.log('No matching company found for the given orgId.');
        }
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
      companyCode: formData.companyCode,
      companyName: formData.companyName,
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gst: '',
      webSite: '',
      active: true
    });
    setFieldErrors({
      // companyCode: '',
      ceo: '',
      address: '',
      currency: '',
      country: '',
      state: '',
      city: '',
      pincode: '',
      mobileNo: '',
      gst: '',
      webSite: '',
    });
    setEditId('');
    getCompanyDetails();
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
    if (!formData.mobileNo) {
      errors.mobileNo = 'Mobile No is required';
    } else if (formData.mobileNo.length < 10) {
      errors.mobileNo = 'Invalid mobileNo No';
    }
    if (formData.pincode.length < 6 && formData.pincode.length >= 1) {
      errors.pincode = 'Invalid Pincode';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        id: orgId,
        active: formData.active,
        address: formData.address,
        cancel: true,
        ceo: formData.ceo,
        city: formData.city,
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        country: formData.country,
        createdBy: loginUserName,
        currency: formData.currency,
        gst: formData.gst,
        webSite: formData.webSite,
        phone: formData.mobileNo,
        state: formData.state,
        zip: formData.pincode,
      };
      console.log('THE SAVE FORM DATA IS:', saveFormData);

      try {
        const response = await apiCalls('put', `commonmaster/updateCompany`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', 'Company updated Successfully');
          const generatedId = response.paramObjectsMap.CompanyVO.id;
          console.log("save", typeof logo);
          if (generatedId && typeof logo === 'object') {
            console.log('Generated ID:', generatedId);
            console.log('Uploaded Item', logo);
            handleFileUpload(generatedId);
          } else {
            console.log('handle Img Upload failed');
          }
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
  const [logo, setLogo] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      const response = await apiCalls(
        'post',
        `/commonmaster/uploadCompanyLogo?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Img Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        console.warn('Img upload failed:', response);
        showToast('error', 'Img upload failed');
      }
    } catch (error) {
      console.error('Img Upload Error:', error);
      showToast('error', 'Failed to upload Img');
    }
  };
  useEffect(() => {
    return () => {
      if (logo && typeof logo === 'object') {
        URL.revokeObjectURL(logo);
      }
    };
  }, [logo]);
  const handleRemoveLogo = () => setLogo(null);
  const handleView = () => {
    console.log('LIST VIEW DATAS ARE:', listViewData);

    setListView(!listView); 
  };

  const handleDateChange = (field, newValue) => {
    if (newValue.isValid()) {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue
      }));
    }
  };

  const handleTimeChange = (fieldName, newValue) => {
    if (!newValue) return;

    const timeFormat = 'HH:mm';
    const newTime = dayjs(newValue).format(timeFormat);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newTime
    }));
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
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
              enableEditing={true}
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
                  <InputLabel id="country">Country</InputLabel>
                  <Select labelId="country" label="Country" name="country" value={formData.country} onChange={handleInputChange}>
                    {countryList?.map((row) => (
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
                  <InputLabel id="state">State</InputLabel>
                  <Select labelId="state" label="State" name="state" value={formData.state} onChange={handleInputChange}>
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
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.city}>
                  <InputLabel id="city">City</InputLabel>
                  <Select labelId="city" label="City" name="city" value={formData.city} onChange={handleInputChange}>
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
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency-label">Currency</InputLabel>
                  <Select labelId="currency-label" label="currency" value={formData.currency} onChange={handleInputChange} name="currency">
                    {currencyList?.map((row) => (
                      <MenuItem key={row.id} value={row.currency}>
                        {row.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText>{fieldErrors.currency}</FormHelperText>}
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
                  label="Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNo}
                  helperText={fieldErrors.mobileNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="GST In"
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
                  label="Official webSite"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="webSite"
                  value={formData.webSite}
                  onChange={handleInputChange}
                  error={!!fieldErrors.webSite}
                  helperText={fieldErrors.webSite}
                />
              </div>
             
           
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    multiline
                    startIcon={<CloudUploadIcon />}
                    sx={{ color: 'rgb(103 58 183)', borderRadius: '12px' }}
                  >
                    {/* {logo ? logo.name === '' ? "Logo👉" : logo.name : 'Upload Logo'} */}
                    {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Logo👉') : 'Upload Logo'}

                    <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                  </Button>

                  {logo && (
                    <IconButton variant="contained" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }} onClick={handleOpen}>
                      <ControlCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                  <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                      Company Logo
                    </Typography>
                    {logo ? (
                      <Box>
                        <Avatar
                          src={typeof logo === 'object' ? URL.createObjectURL(logo) : `data:image/jpeg;base64,${logo}`}
                          alt="Company Logo"
                          sx={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 2 }}
                        />
                        <Box display="flex" gap={2} mt={2}>
                          {/* <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleRemoveLogo}
                          >
                            Delete
                          </IconButton> */}
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                          <Typography variant="caption">Upload Logo</Typography>
                        </Avatar>
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </DialogContent>
                </Dialog>
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

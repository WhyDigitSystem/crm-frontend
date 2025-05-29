import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';

export const ChargeTypeRequest = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [editId, setEditId] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [listValues, setListValues] = useState([]);
  const [serviceCode, setServiceCode] = useState([]);
  const [salesCode, setSalesCode] = useState([]);
  const [purchaseCode, setPurchaseCode] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    chargeType: '',
    chargeCode: '',
    product: '',
    chargeDescription: '',
    localChargeDescripition: '',
    serviceAccountCode: '',
    sacDescripition: '',
    salesAccount: '',
    purchaseAccount: '',
    taxType: '',
    ccFeeApplicable: '',
    taxable: '',
    taxablePercentage: '',
    ccJob: '',
    govtSac: '',
    excempted: '',
    orgId: orgId,
    gstTax: '',
    gstControl: '',
    service: '',
    type: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    chargeType: '',
    chargeCode: '',
    product: '',
    chargeDescription: '',
    localChargeDescripition: '',
    serviceAccountCode: '',
    sacDescripition: '',
    salesAccount: '',
    purchaseAccount: '',
    taxable: '',
    taxType: '',
    taxablePercentage: '',
    ccFeeApplicable: '',
    ccJob: '',
    govtSac: '',
    excempted: '',
    gstTax: '',
    gstControl: '',
    service: '',
    type: ''
  });

  const columns = [
    { accessorKey: 'chargeType', header: 'Charge Type', size: 140 },
    { accessorKey: 'chargeCode', header: 'Charge Code', size: 140 },
    { accessorKey: 'chargeDescription', header: 'Charge Description', size: 140 },
    // { accessorKey: 'localChargeDescripition', header: 'Local Charge Description', size: 140 },
    // { accessorKey: 'serviceAccountCode', header: 'Service Account Code', size: 140 },
    // { accessorKey: 'sACDescription', header: 'SAC Description', size: 140 },
    // { accessorKey: 'salesAccount', header: 'Sales Account', size: 140 },
    // { accessorKey: 'purchaseAccount', header: 'Purchase Account', size: 140 },
    // { accessorKey: 'taxType', header: 'Tax Type', size: 140 },
    // { accessorKey: 'ccFeeApplicable', header: 'CC Fee Applicable', size: 140 },
    // { accessorKey: 'taxable', header: 'Taxable', size: 140 },
    // { accessorKey: 'taxablePercentage', header: 'Taxable Percentage', size: 140 },
    // { accessorKey: 'ccJob', header: 'CC Job', size: 140 },
    // { accessorKey: 'govtSac', header: 'Govt SAC', size: 140 },
    // { accessorKey: 'excempted', header: 'Exempted', size: 140 },
    { accessorKey: 'gstTax', header: 'GST Tax', size: 140 },
    // { accessorKey: 'gSTControl', header: 'GST Control', size: 140 },
    // { accessorKey: 'service', header: 'Service', size: 140 },
    // { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'serviceAccountCode') {
      // Find the selected serviceAccountCode's description
      const selectedService = serviceCode.find((item) => item.serviceAccountCode === value);
      const sacDescription = selectedService ? selectedService.sacDescription : '';

      // Update both serviceAccountCode and sacDescripition in formData
      setFormData({
        ...formData,
        [name]: newValue,
        sacDescripition: sacDescription
      });
    } else {
      // For other fields, just update the value as usual
      setFormData({ ...formData, [name]: newValue });
    }
  };

  useEffect(() => {
    getAllChargeTypeRequestByOrgId();
    getChargeType();
    getAllServiceAccountCode();
    getAllSalesAccount();
    getAllPurchaseAccount();
  }, []);

  const getAllChargeTypeRequestByOrgId = async () => {
    try {
      const response = await apiCalls('get', `master/getAllChargeTypeRequestByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);
      setData(response.paramObjectsMap.chargeTypeRequestVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getChargeType = async () => {
    try {
      const result = await apiCalls('get', `/master/getChargeType?orgId=${orgId}`);
      setListValues(result.paramObjectsMap.chargeTypeDetails || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllServiceAccountCode = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllActiveSacCodeByOrgId?orgId=${orgId}`);
      setServiceCode(result.paramObjectsMap.sacCodeVO || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllSalesAccount = async () => {
    try {
      const result = await apiCalls('get', `/master/getSalesAccountFromGroup?orgId=${orgId}`);
      setSalesCode(result.paramObjectsMap.salesAccount || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllPurchaseAccount = async () => {
    try {
      const result = await apiCalls('get', `/master/getPurchaseAccountFromGroup?orgId=${orgId}`);
      setPurchaseCode(result.paramObjectsMap.purchaseAccount || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllChargeTypeById = async (row) => {
    handleClear();
    console.log('THE SELECTED ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `master/getAllChargeTypeRequestById?id=${row.original.id}`);

      if (response.status === true) {
        const chargeTypeRequestVO = response.paramObjectsMap.chargeTypeRequestVO[0];
        setShowForm(true);

        setFormData({
          active: chargeTypeRequestVO.active,
          chargeType: chargeTypeRequestVO.chargeType || '',
          chargeCode: chargeTypeRequestVO.chargeCode || '',
          product: chargeTypeRequestVO.product || '',
          chargeDescription: chargeTypeRequestVO.chargeDescription || '',
          localChargeDescripition: chargeTypeRequestVO.localChargeDescripition || '',
          serviceAccountCode: chargeTypeRequestVO.serviceAccountCode || '',
          sacDescripition: chargeTypeRequestVO.sacDescripition || '',
          salesAccount: chargeTypeRequestVO.salesAccount || '',
          purchaseAccount: chargeTypeRequestVO.purchaseAccount || '',
          taxType: chargeTypeRequestVO.taxType || '',
          ccFeeApplicable: chargeTypeRequestVO.ccFeeApplicable || '',
          taxable: chargeTypeRequestVO.taxable || '',
          taxablePercentage: chargeTypeRequestVO.taxablePercentage || '',
          ccJob: chargeTypeRequestVO.ccJob || '',
          id: chargeTypeRequestVO.id || 0,
          govtSac: chargeTypeRequestVO.govtSac || '',
          excempted: chargeTypeRequestVO.excempted || '',
          orgId: chargeTypeRequestVO.orgId || orgId,
          gstTax: chargeTypeRequestVO.gstTax || '',
          gstControl: chargeTypeRequestVO.gstControl || '',
          service: chargeTypeRequestVO.service || '',
          type: chargeTypeRequestVO.type || ''
        });

        console.log('DataToEdit', chargeTypeRequestVO);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
    // setFieldErrors({
    //   chapter: false,
    //   subChapter: false,
    //   hsnCode: false,
    //   branch: false,
    //   newRate: false,
    //   excepmted: false
    // });
    getAllChargeTypeRequestByOrgId();
  };

  const handleClear = () => {
    setFormData({
      active: true,
      chargeType: '',
      chargeCode: '',
      product: '',
      chargeDescription: '',
      localChargeDescripition: '',
      serviceAccountCode: '',
      sacDescripition: '',
      salesAccount: '',
      purchaseAccount: '',
      taxType: '',
      ccFeeApplicable: '',
      taxable: '',
      taxablePercentage: '',
      ccJob: '',
      govtSac: '',
      excempted: '',
      orgId: orgId,
      gstTax: '',
      gstControl: '',
      service: '',
      type: ''
    });

    setEditId('');

    setFieldErrors({
      chargeType: '',
      chargeCode: '',
      product: '',
      chargeDescription: '',
      localChargeDescripition: '',
      serviceAccountCode: '',
      sacDescripition: '',
      salesAccount: '',
      purchaseAccount: '',
      taxable: '',
      taxType: '',
      taxablePercentage: '',
      ccFeeApplicable: '',
      ccJob: '',
      govtSac: '',
      excempted: '',
      gstTax: '',
      gstControl: '',
      service: '',
      type: ''
    });
  };

  const validateForm = () => {
    let errors = {};
    let hasError = false;

    if (!formData.chargeType) {
      errors.chargeType = 'Charge Type is required';
      hasError = true;
    }
    if (!formData.chargeCode) {
      errors.chargeCode = 'Charge Code is required';
      hasError = true;
    }
    // if (!formData.product) {
    //   errors.product = 'Product is required';
    //   hasError = true;
    // }
    if (!formData.chargeDescription) {
      errors.chargeDescription = 'Charge Desc is required';
      hasError = true;
    }
    if (!formData.localChargeDescripition) {
      errors.localChargeDescripition = 'Local Charge Desc is required';
      hasError = true;
    }
    if (!formData.serviceAccountCode) {
      errors.serviceAccountCode = 'Service Account Code is required';
      hasError = true;
    }
    if (!formData.sacDescripition) {
      errors.sacDescripition = 'Sac Desc is required';
      hasError = true;
    }
    if (!formData.salesAccount) {
      errors.salesAccount = 'Sales Account is required';
      hasError = true;
    }
    if (!formData.purchaseAccount) {
      errors.purchaseAccount = 'Purchase Account is required';
      hasError = true;
    }
    if (!formData.taxable) {
      errors.taxable = 'Taxable is required';
      hasError = true;
    }
    if (!formData.taxablePercentage) {
      errors.taxablePercentage = 'Taxable Percentage is required';
      hasError = true;
    }

    if (!formData.taxType) {
      errors.taxType = 'Tax Type is required';
      hasError = true;
    }
    if (!formData.ccFeeApplicable) {
      errors.ccFeeApplicable = 'CC Fee Applicable is required';
      hasError = true;
    }
    if (!formData.ccJob) {
      errors.ccJob = 'CC Job is required';
      hasError = true;
    }
    if (!formData.govtSac) {
      errors.govtSac = 'Govt Sac is required';
      hasError = true;
    }
    if (!formData.excempted) {
      errors.excempted = 'Excempted is required';
      hasError = true;
    }
    if (!formData.gstTax) {
      errors.gstTax = 'GST Tax is required';
      hasError = true;
    }
    // if (!formData.gstControl) {
    //   errors.gstControl = 'Field is required';
    //   hasError = true;
    // }
    // if (!formData.service) {
    //   errors.service = 'Field is required';
    //   hasError = true;
    // }
    // if (!formData.type) {
    //   errors.type = 'Field is required';
    //   hasError = true;
    // }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const formDataToSend = {
        ...(editId && { id: editId }),
        taxablePercentage: formData.taxablePercentage ? parseInt(formData.taxablePercentage, 10) : 0,
        chargeType: formData.chargeType,
        chargeCode: formData.chargeCode,
        // product: formData.product,
        chargeDescription: formData.chargeDescription,
        localChargeDescripition: formData.localChargeDescripition,
        serviceAccountCode: formData.serviceAccountCode,
        sacDescripition: formData.sacDescripition,
        salesAccount: formData.salesAccount,
        purchaseAccount: formData.purchaseAccount,
        taxable: formData.taxable,
        taxType: formData.taxType,
        ccFeeApplicable: formData.ccFeeApplicable,
        ccJob: formData.ccJob,
        govtSac: formData.govtSac,
        excempted: formData.excempted,
        gstTax: formData.gstTax,
        orgId: orgId,
        // createdBy: loginUserName,
        active: formData.active
      };

      console.log('Data to save is:', formDataToSend);

      try {
        const result = await apiCalls('put', `master/updateCreateChargeTypeRequest`, formDataToSend);
        console.log('API Response:', result); // Log the complete result object

        if (result.status === true) {
          console.log('Response:', result.data);
          showToast('success', editId ? 'Charge Type Updated Successfully' : 'Charge Type created successfully');
          handleClear();
          getAllChargeTypeRequestByOrgId();
        } else if (result.status === false) {
          // Check for error message within result object
          console.log('Error Response:', result);
          showToast('error', result.paramObjectsMap?.errorMessage || 'Charge Type creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      showToast('error', 'Please fill in all required fields');
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} margin="0 10px 0 10px" />
          </div>

          {showForm ? (
            <div className="row d-flex ml">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.chargeType}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Charge Type <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Charge Type"
                    required
                    value={formData.chargeType}
                    name="chargeType"
                    onChange={handleInputChange}
                  >
                    {listValues.map((item) => (
                      <MenuItem key={item.id} value={item.chargeType}>
                        {item.chargeType}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.chargeType && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.chargeType}
                    </p>
                  )}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      Charge Code <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="chargeCode"
                  value={formData.chargeCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.chargeCode}
                  helperText={fieldErrors.chargeCode}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.product}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Product <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Product"
                    required
                    value={formData.product}
                    name="product"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="string">String</MenuItem>
                  </Select>
                  {fieldErrors.product && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.product}
                    </p>
                  )}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      Charge Description <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="chargeDescription"
                  value={formData.chargeDescription}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.chargeDescription}
                  helperText={fieldErrors.chargeDescription}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      Local Charge Description <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="localChargeDescripition"
                  value={formData.localChargeDescripition}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.localChargeDescripition}
                  helperText={fieldErrors.localChargeDescripition}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.chargeType}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Service Account Code <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Service Account Code"
                    required
                    value={formData.serviceAccountCode}
                    name="serviceAccountCode"
                    onChange={handleInputChange}
                  >
                    {serviceCode.map((item) => (
                      <MenuItem key={item.id} value={item.serviceAccountCode}>
                        {item.serviceAccountCode}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.chargeType && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.chargeType}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      SAC Description <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  disabled
                  name="sacDescripition"
                  value={formData.sacDescripition}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.sacDescripition}
                  helperText={fieldErrors.sacDescripition}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.salesAccount}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Sales Account <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Sales Account"
                    required
                    value={formData.salesAccount}
                    name="salesAccount"
                    onChange={handleInputChange}
                  >
                    {salesCode.map((item) => (
                      <MenuItem key={item.index} value={item.salesAccount}>
                        {item.salesAccount}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.salesAccount && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.salesAccount}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.purchaseAccount}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Purchase Account <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Purchase Account"
                    required
                    value={formData.purchaseAccount}
                    name="purchaseAccount"
                    onChange={handleInputChange}
                  >
                    {purchaseCode.map((item) => (
                      <MenuItem key={item.index} value={item.purchaseAccount}>
                        {item.purchaseAccount}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.purchaseAccount && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.purchaseAccount}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.taxable}>
                  <InputLabel id="demo-simple-select-labeltax">
                    {
                      <span>
                        Taxable <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-labeltax"
                    id="demo-simple-selecttax"
                    label="Taxable"
                    required
                    value={formData.taxable}
                    name="taxable"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="YES">Yes</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                  </Select>
                  {fieldErrors.taxable && (
                    <p className="error-text ml-2 " style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.taxable}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.taxType}>
                  <InputLabel id="demo-simple-select-labeltaxtype">
                    {
                      <span>
                        Tax Type <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-labeltaxtype"
                    id="demo-simple-selecttaxtype"
                    label="Tax Type"
                    required
                    value={formData.taxType}
                    name="taxType"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="BAS">BAS</MenuItem>
                    <MenuItem value="BSS">BSS</MenuItem>
                    <MenuItem value="CHA">CHA</MenuItem>
                  </Select>
                  {fieldErrors.taxType && (
                    <p className="error-text ml-2 " style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.taxType}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="taxable100%"
                  label={
                    <span>
                      Taxable % <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  type='number'
                  name="taxablePercentage"
                  value={formData.taxablePercentage}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.taxablePercentage}
                  helperText={fieldErrors.taxablePercentage}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.excempted}>
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Exempted <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Exempted"
                    required
                    value={formData.excempted}
                    name="excempted"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="YES">Yes</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                  </Select>
                  {fieldErrors.excempted && (
                    <p className="error-text ml-2 " style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.excempted}
                    </p>
                  )}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.taxable}>
                  <InputLabel id="demo-simple-select-labelcc">
                    {
                      <span>
                        CC Job <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-labelcc"
                    id="demo-simple-selectcc"
                    label="CC Job"
                    required
                    value={formData.ccJob}
                    name="ccJob"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="YES">Yes</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                  </Select>
                  {fieldErrors.ccJob && (
                    <p className="error-text ml-2 " style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.ccJob}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.taxable}>
                  <InputLabel id="demo-simple-select-labelfee">
                    {
                      <span>
                        CC Fee Applicable <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-labelfee"
                    id="demo-simple-selectfee"
                    label="CC Fee Applicable"
                    required
                    value={formData.ccFeeApplicable}
                    name="ccFeeApplicable"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="YES">Yes</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                  </Select>
                  {fieldErrors.ccFeeApplicable && (
                    <p className="error-text ml-2 " style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.ccFeeApplicable}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      Govt. SAC <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="govtSac"
                  value={formData.govtSac}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.govtSac}
                  helperText={fieldErrors.govtSac}
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  id="outlined-textarea"
                  label={
                    <span>
                      GST Tax <span className="asterisk">*</span>
                    </span>
                  }
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="gstTax"
                  type='number'
                  value={formData.gstTax}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.gstTax}
                  helperText={fieldErrors.gstTax}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.gstControl}>
                  <InputLabel id="demo-simple-select-label">GST Control</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="GST Control"
                    required
                    value={formData.gstControl}
                    name="gstControl"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="string">String</MenuItem>
                  </Select>
                  {fieldErrors.gstControl && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.gstControl}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.service}>
                  <InputLabel id="demo-simple-select-label">Service</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Service"
                    required
                    value={formData.service}
                    name="service"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="string">String</MenuItem>
                  </Select>
                  {fieldErrors.service && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.service}
                    </p>
                  )}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.type}>
                  <InputLabel id="demo-simple-select-label">Type</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Type"
                    required
                    value={formData.type}
                    name="type"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="string">String</MenuItem>
                  </Select>
                  {fieldErrors.type && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.type}
                    </p>
                  )}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox name="active" checked={formData.active} onChange={handleInputChange} />}
                    label="Active"
                  />
                </FormGroup>
              </div>
            </div>
          ) : (
            <CommonTable data={data} columns={columns} blockEdit={true} toEdit={getAllChargeTypeById} />
          )}
        </div>
      </div>
    </>
  );
};
export default ChargeTypeRequest;

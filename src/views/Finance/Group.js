import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';

const Group = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [currencies, setCurrencies] = useState([]);
  const [editId, setEditId] = useState('');
  const [groupList, setGroupList] = useState([]);
  const [formData, setFormData] = useState({
    groupName: '',
    gstTaxFlag: '',
    gstType:'',
    gstPercentage:'',
    accountCode: '',
    coaList: '',
    accountGroupName: '',
    type: '',
    interBranchAc: false,
    controllAc: false,
    category: '',
    currency: 'INR',
    active: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    groupName: false,
    gstTaxFlag: false,
    gstType:false,
    gstPercentage:false,
    accountCode: false,
    coaList: false,
    accountGroupName: false,
    type: false,
    interBranchAc: false,
    controllAc: false,
    category: false,

    currency: false,
    active: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your orgId or fetch it from somewhere
        const currencyData = await getAllActiveCurrency(orgId);
        setCurrencies(currencyData);

        console.log('currency', currencyData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    fetchData();
    getGroup();
    getAllGroupName();
  }, []);

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;
  //   setFormData({ ...formData, [name]: inputValue });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const inputValue = type === 'checkbox' ? checked : value;

  //   let errorMessage = '';
  //   let validInputValue = inputValue; // Initialize valid input value

  //   // Validation for accountCode (alphanumeric only)
  //   if (name === 'accountCode') {
  //     const alphanumericPattern = /^[a-zA-Z0-9]*$/; // Pattern for alphanumeric
  //     if (!alphanumericPattern.test(inputValue)) {
  //       errorMessage = 'Only alphabets and numbers are allowed.';
  //       // Set validInputValue to prevent invalid character input
  //       validInputValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');
  //     }
  //   }

  //   // Validation for accountGroupName (alphabets only)

  //   // Update the form data with the valid input value
  //   setFormData({ ...formData, [name]: validInputValue });

  //   // Update the error messages
  //   setFieldErrors({ ...fieldErrors, [name]: errorMessage });
  // };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    let validInputValue = inputValue; 
   
    // Validation for accountCode (alphanumeric only)
    if (name === 'accountCode') {
      const alphanumericPattern = /^[a-zA-Z0-9]*$/; // Pattern for alphanumeric
      if (!alphanumericPattern.test(inputValue)) {
        errorMessage = 'Only alphabets and numbers are allowed.';
        // Set validInputValue to prevent invalid character input
        validInputValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');
      }
    }
    // Update form data
    setFormData((prevState) => ({ ...prevState, [name]: validInputValue }));
  
    // Handle dynamic validation
    if (name === 'gstTaxFlag') {
      if (value === 'NA') {
        // Reset gstType and gstPercentage if GST Tax Flag is NA
        setFormData((prevState) => ({
          ...prevState,
          gstType: '',
          gstPercentage: '',
        }));
        // Clear field errors
        setFieldErrors((prevState) => ({
          ...prevState,
          gstType: '',
          gstPercentage: '',
        }));
      }
    }
  
    // Validate other fields if required
    let errorMessage = '';
    if (name === 'gstPercentage' && !value) {
      errorMessage = 'GST Percentage is required.';
    }
    if (name === 'gstType' && !value) {
      errorMessage = 'GST Type is required.';
    }
  
    // Set field errors
    setFieldErrors((prevState) => ({ ...prevState, [name]: errorMessage }));
  };

  const getGroup = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllGroupLedgerByOrgId?orgId=${orgId}`);
      if (result) {
        setData(result.paramObjectsMap.groupLedgerVO.reverse());
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validateForm = (formData) => {
    let errors = {};

    if (formData.type === 'ACCOUNT' ? !formData.groupName : '') {
      errors.groupName = 'Group Name is required';
    }

    if (!formData.gstTaxFlag) {
      errors.gstTaxFlag = 'GST Tax Flag is required';
    }

    if (!formData.coaList || formData.coaList.length === 0) {
      errors.coaList = 'COA List is required';
    }

    if (!formData.accountGroupName) {
      errors.accountGroupName = 'Account Group Name is required';
    }

    if (!formData.type) {
      errors.type = 'Type is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    // if (!formData.currency) {
    //   errors.currency = 'Currency is required';
    // }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm(formData); // Validate the form data

    if (Object.keys(errors).length === 0) {
      // No errors, proceed with the save
      setIsLoading(true);

      const saveData = {
        ...(editId && { id: editId }), // Include id if editing
        active: formData.active,
        groupName: formData.groupName,
        gstTaxFlag: formData.gstTaxFlag,
        coaList: formData.coaList,
        accountGroupName: formData.accountGroupName,
        type: formData.type,
        interBranchAc: formData.interBranchAc,
        controllAc: formData.controllAc,
        category: formData.category,
        branch: formData.branch,
        currency: 'INR',
        ...(formData.gstTaxFlag !== 'NA' && {
          gstType: formData.gstType,
          gstPercentage: formData.gstPercentage,
        }),
        ...(formData.gstTaxFlag === 'NA' && {
          gstType: 'NA',
          gstPercentage: 0,
        }),
        orgId: orgId,
        createdBy: loginUserName,
      };
      

      console.log('DATA TO SAVE', saveData); // Add this line to log the save data

      try {
        const response = await apiCalls('put', `master/updateCreateGroupLedger`, saveData);
        if (response.status === true) {
          showToast('success', editId ? 'Group updated successfully' : 'Group created successfully');
          getGroup();
          handleClear();
        } else {
          showToast('error', editId ? 'Group updation failed' : 'Group creation failed');
        }
        // Handle response (success, errors, etc.)
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false); // Stop the loader after the operation
      }
    } else {
      // Handle validation errors (e.g., show error messages)
      console.log('Validation Errors:', errors);
      setFieldErrors(errors); // Set errors to display in the UI if needed
    }
  };

  const handleClear = () => {
    setFormData({
      groupName: '',
      gstTaxFlag: '',
      accountCode: '',
      coaList: '',
      accountGroupName: '',
      type: '',
      interBranchAc: false,
      controllAc: false,
      category: '',
      gstType:'',
      gstPercentage:'',
      branch: '',
      // currency: '',
      active: false
    });
    setFieldErrors({
      groupName: false,
      gstTaxFlag: false,
      accountCode: false,
      coaList: false,
      accountGroupName: false,
      type: false,
      gstType:false,
      gstPercentage:false,
      interBranchAc: false,
      controllAc: false,
      category: false,
      branch: false,
      // currency: false,
      active: false
    });
    setEditId('');
  };

  const handleListView = () => {
    setShowForm(!showForm);
    setFieldErrors({
      groupName: false,
      gstTaxFlag: false,
      accountCode: false,
      coaList: false,
      accountGroupName: false,
      type: false,
      interBranchAc: false,
      controllAc: false,
      category: false,
      branch: false,
      active: false
    });
  };

  const columns = [
    { accessorKey: 'groupName', header: 'Group Name', size: 140 },
    { accessorKey: 'id', header: 'Account Code', size: 140 },
    { accessorKey: 'coaList', header: 'COA List', size: 100 },
    { accessorKey: 'accountGroupName', header: 'Account/Groupname', size: 100 },
    { accessorKey: 'type', header: 'type', size: 100 },
    { accessorKey: 'currency', header: 'Currency', size: 100 },
    { accessorKey: 'active', header: 'Active', size: 100 }
  ];

  const getGruopById = async (row) => {
    console.log('Editing Exchange Rate:', row.original.id);
    setEditId(row.original.id);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getAllGroupLedgerById?id=${row.original.id}`);

      if (result) {
        const exRate = result.paramObjectsMap.groupLedgerVO[0];
        setEditMode(true);

        setFormData({
          orgId: orgId,
          groupName: exRate.groupName,
          gstTaxFlag: exRate.gstTaxFlag,
          accountCode: exRate.id,
          coaList: exRate.coaList,
          accountGroupName: exRate.accountGroupName,
          type: exRate.type,
          gstType:exRate.gstType,
          gstPercentage:exRate.gstPercentage,
          interBranchAc: exRate.interBranchAc,
          controllAc: exRate.controllAc,
          category: exRate.category,
          branch: exRate.branch,
          id: exRate.id,
          currency: 'INR',
          active: exRate.active
        });

        console.log('DataToEdit', exRate);
      } else {
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllGroupName = async () => {
    try {
      const response = await apiCalls('get', `/master/getGroupNameByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setGroupList(response.paramObjectsMap.groupNameDetails);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
        </div>
        {/* <div className="d-flex justify-content-between">
          <h1 className="text-xl font-semibold mb-3">Group / Ledger</h1>
        </div> */}
        {showForm ? (
          <div className="row d-flex ">
            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Type"
                  onChange={handleInputChange}
                  name="type"
                  value={formData.type}
                >
                  <MenuItem value="ACCOUNT">Account</MenuItem>
                  <MenuItem value="GROUP">Group</MenuItem>
                </Select>
                {fieldErrors.type && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">Group Name</InputLabel>
                <Select
                  labelId="groupName"
                  id="groupName"
                  label="Group Name"
                  onChange={handleInputChange}
                  name="groupName"
                  value={formData.groupName}
                >
                  {groupList.length > 0 &&
                    groupList.map((gro, index) => (
                      <MenuItem key={index} value={gro.groupName}>
                        {gro.groupName} {/* Display employee code */}
                      </MenuItem>
                    ))}
                </Select>
                {fieldErrors.groupName && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
              </FormControl>
            </div>
            {/* <div className="col-md-3 mb-2">
              <FormControl fullWidth size="small">
                <InputLabel id="gstTaxFlag">GST Tax Flag</InputLabel>
                <Select
                  labelId="gstTaxFlag"
                  id="gstTaxFlag"
                  label="GST Tax Flag"
                  onChange={handleInputChange}
                  name="gstTaxFlag"
                  value={formData.gstTaxFlag}
                >
                  <MenuItem value="INPUT TAX">Input Tax</MenuItem>
                  <MenuItem value="OUTPUT TAX">Output Tax</MenuItem>
                  <MenuItem value="NA">NA</MenuItem>
                </Select>
                {fieldErrors.gstTaxFlag && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
              </FormControl>
            </div>
            
            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">Gst Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="gstType"
                  onChange={handleInputChange}
                  name="gstType"
                  value={formData.gstType}
                >
                  <MenuItem value="INTRA">INTRA</MenuItem>
                  <MenuItem value="INTER">INTER</MenuItem>
                </Select>
                {fieldErrors.gstType && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
              </FormControl>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="gstPercentage"
                  label="Gst %"
                  size="small"
                  placeholder="Enter Gst %"
                  inputProps={{ maxLength: 30 }}
                  onChange={handleInputChange}
                  name="gstPercentage"
                  value={formData.gstPercentage}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.gstPercentage ? fieldErrors.gstPercentage : ''}</span>}
                />
              </FormControl>
            </div> */}
            {/* GST Tax Flag */}
    <div className="col-md-3 mb-2">
      <FormControl fullWidth size="small">
        <InputLabel id="gstTaxFlag">GST Tax Flag</InputLabel>
        <Select
          labelId="gstTaxFlag"
          id="gstTaxFlag"
          label="GST Tax Flag"
          onChange={handleInputChange}
          name="gstTaxFlag"
          value={formData.gstTaxFlag}
        >
          <MenuItem value="INPUT TAX">Input Tax</MenuItem>
          <MenuItem value="OUTPUT TAX">Output Tax</MenuItem>
          <MenuItem value="NA">NA</MenuItem>
        </Select>
        {fieldErrors.gstTaxFlag && <FormHelperText style={{ color: 'red' }}>{fieldErrors.gstTaxFlag}</FormHelperText>}
      </FormControl>
    </div>

    {/* GST Type - Conditional Rendering */}
    {formData.gstTaxFlag !== 'NA' && (
      <div className="col-md-3 mb-3">
        <FormControl fullWidth size="small">
          <InputLabel id="gstType">GST Type</InputLabel>
          <Select
            labelId="gstType"
            id="gstType"
            label="GST Type"
            onChange={handleInputChange}
            name="gstType"
            value={formData.gstType}
          >
            <MenuItem value="INTRA">INTRA</MenuItem>
            <MenuItem value="INTER">INTER</MenuItem>
          </Select>
          {fieldErrors.gstType && <FormHelperText style={{ color: 'red' }}>{fieldErrors.gstType}</FormHelperText>}
        </FormControl>
      </div>
    )}

    {/* GST Percentage - Conditional Rendering */}
    {formData.gstTaxFlag !== 'NA' && (
      <div className="col-md-3 mb-3">
        <FormControl fullWidth variant="filled">
          <TextField
            id="gstPercentage"
            label="GST %"
            size="small"
            placeholder="Enter GST %"
            onChange={handleInputChange}
            name="gstPercentage"
            value={formData.gstPercentage}
          />
          {fieldErrors.gstPercentage && (
            <FormHelperText style={{ color: 'red' }}>{fieldErrors.gstPercentage}</FormHelperText>
          )}
        </FormControl>
      </div>
    )}
            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="account"
                  label="Account Code"
                  size="small"
                  required
                  disabled
                  placeholder="40003600104"
                  inputProps={{ maxLength: 30 }}
                  onChange={handleInputChange}
                  name="accountCode"
                  value={formData.accountCode}
                />
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">COA List</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="COA List"
                  onChange={handleInputChange}
                  name="coaList"
                  value={formData.coaList}
                >
                  <MenuItem value="ASSET">Asset</MenuItem>
                  <MenuItem value="LIABILITY">Liability</MenuItem>
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENCE">Expense</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormControl fullWidth variant="filled">
                <TextField
                  id="accountGroupName"
                  label="Account/Group Name"
                  size="small"
                  required
                  placeholder="Enter Group Name"
                  inputProps={{ maxLength: 30 }}
                  onChange={handleInputChange}
                  name="accountGroupName"
                  value={formData.accountGroupName}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.accountGroupName ? fieldErrors.accountGroupName : ''}</span>}
                />
              </FormControl>
            </div>

            <div className="col-md-3 mb-2">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.interBranchAc}
                      onChange={handleInputChange}
                      name="interBranchAc"
                      sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                    />
                  }
                  label="Interbranch A/c"
                />
              </FormGroup>
            </div>
            <div className="col-md-3 mb-2">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.controllAc}
                      onChange={handleInputChange}
                      name="controllAc"
                      sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                    />
                  }
                  label="Control A/c"
                />
              </FormGroup>
            </div>
            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Category"
                  onChange={handleInputChange}
                  name="category"
                  value={formData.category}
                >
                  <MenuItem value="RECEIVABLE A/C">RECEIVABLE A/C</MenuItem>
                  <MenuItem value="PAYABLE A/C">PAYABLE A/C</MenuItem>
                  <MenuItem value="OTHERS">OTHERS</MenuItem>
                  <MenuItem value="BANK">BANK</MenuItem>
                  <MenuItem value="TAX">TAX</MenuItem>
                </Select>
                {fieldErrors.category && <FormHelperText style={{ color: 'red' }}>This field is required</FormHelperText>}
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormControl fullWidth size="small">
                <TextField
                  id="currency"
                  label="Currency"
                  size="small"
                  disabled
                  inputProps={{ maxLength: 30 }}
                  onChange={handleInputChange}
                  name="currency"
                  value={formData.currency}
                  helperText={<span style={{ color: 'red' }}>{fieldErrors.currency ? fieldErrors.currency : ''}</span>}
                />
              </FormControl>
            </div>

            <div className="col-md-3 mb-3">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.active}
                      name="active"
                      onChange={handleInputChange}
                      sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                    />
                  }
                  label="Active"
                />
              </FormGroup>
            </div>
          </div>
        ) : (
          <CommonTable columns={columns} data={data} blockEdit={true} toEdit={getGruopById} />
        )}
      </div>
    </>
  );
};

export default Group;

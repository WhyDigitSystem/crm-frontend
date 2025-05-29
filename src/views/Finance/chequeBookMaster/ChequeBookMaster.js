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
import TableComponent from './TableComponent';

const ChequeBookMaster = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [formValues, setFormValues] = useState({
    active: true,
    bank: '',
    branch: '',
    checkPrefix: '',
    checkStartNo: '',
    chequeBookDetailsDTO: [],
    chequeId: '',
    createdBy: '',
    noOfChequeLeaves: '',
    orgId: orgId,
    updatedBy: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getAllChequeBookMasterByOrgId();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Validate the input fields
    if (
      id === 'bank' ||
      // id === 'branch' ||
      id === 'checkPrefix' ||
      id === 'checkStartNo' ||
      id === 'chequeId' ||
      id === 'noOfChequeLeaves'
    ) {
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
    { accessorKey: 'branch', header: 'Branch/Account', size: 140 },
    { accessorKey: 'chequeId', header: 'Cheque Book Id', size: 140 },
    { accessorKey: 'bank', header: 'Bank', size: 140 },
    { accessorKey: 'checkPrefix', header: 'Cheque Prefix', size: 140 },
    { accessorKey: 'checkStartNo', header: 'cheque Start No', size: 140 },
    { accessorKey: 'noOfChequeLeaves', header: 'No Of Cheque Leaves', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  const handleClear = () => {
    setFormValues({
      active: true,
      bank: '',
      branch: '',
      checkPrefix: '',
      checkStartNo: '',
      chequeBookDetailsDTO: [],
      chequeId: '',
      createdBy: '',
      noOfChequeLeaves: '',
      orgId: orgId,
      updatedBy: ''
    });
    setValidationErrors({});
  };

  const handleSave = async () => {
    const formDataWithEncryptedPassword = {
      ...formValues,
      chequeBookDetailsDTO: formValues.chequeBookDetailsDTO.map((item) => ({
        ...item,
        chequeNo: parseInt(item.chequeNo)
      }))
    };

    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await apiCalls('put', '/master/updateCreateChequeBook', formDataWithEncryptedPassword);
        console.log('Save Successful', response.data);
        toast.success(editMode ? ' Cheque Book Master Updated Successfully' : ' Cheque Book Master created successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
        getAllChequeBookMasterByOrgId();
        handleClear();
        setIsLoading(false);
      } catch (error) {
        console.error('Save Failed', error);
      }
    } else {
      console.error('Validation Errors:', validationErrors);
    }
  };

  const getAllChequeBookMasterByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllChequeBookByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.chequeBookVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getChequeBookMasterById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getAllChequeBookById?id=${row.original.id}`);
      if (result) {
        const chequeBookVO = result.paramObjectsMap.chequeBookVO[0];
        setEditMode(true);

        setFormValues({
          active: chequeBookVO.active || false,
          id: chequeBookVO.id || 0,
          orgId: orgId,
          bank: chequeBookVO.bank || '',
          branch: chequeBookVO.branch || '',
          checkPrefix: chequeBookVO.bank || '',
          checkStartNo: chequeBookVO.bank || '',
          chequeBookDetailsDTO: chequeBookVO.chequeBookDetailsVO,
          chequeId: chequeBookVO.bank || '',
          createdBy: chequeBookVO.bank || '',
          noOfChequeLeaves: chequeBookVO.bank || '',
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
    if (!formValues.bank.trim()) {
      errors.bank = 'This field is required';
    }
    // if (!formValues.branch.trim()) {
    //   errors.branch = 'This field is required';
    // }
    if (!formValues.checkPrefix.trim()) {
      errors.checkPrefix = 'This field is required';
    }
    if (!formValues.checkStartNo.trim()) {
      errors.checkStartNo = 'This field is required';
    }
    if (!formValues.chequeId.trim()) {
      errors.chequeId = 'This field is required';
    }
    if (!formValues.noOfChequeLeaves.trim()) {
      errors.noOfChequeLeaves = 'This field is required';
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
                  <InputLabel id="branchAccount" required>
                    Branch/Account
                  </InputLabel>
                  <Select labelId="branch" id="branch" value={formValues.branch} onChange={handleInputChange} label="Accounts Category">
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                  {validationErrors.branch && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="chequeId"
                    label="Check Book Id"
                    size="small"
                    required
                    value={formValues.chequeId}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.chequeId}
                    helperText={validationErrors.chequeId}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="bank"
                    label="Bank"
                    size="small"
                    required
                    value={formValues.bank}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.bank}
                    helperText={validationErrors.bank}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="checkPrefix"
                    label="Check Prefix"
                    size="small"
                    required
                    value={formValues.checkPrefix}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.checkPrefix}
                    helperText={validationErrors.checkPrefix}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="checkStartNo"
                    label="Check Start No"
                    size="small"
                    required
                    value={formValues.checkStartNo}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.checkStartNo}
                    helperText={validationErrors.checkStartNo}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="noOfChequeLeaves"
                    label="NO Of Check Leaves"
                    size="small"
                    required
                    value={formValues.noOfChequeLeaves}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.noOfChequeLeaves}
                    helperText={validationErrors.noOfChequeLeaves}
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
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getChequeBookMasterById} />
        )}
      </div>
    </div>
  );
};

export default ChequeBookMaster;

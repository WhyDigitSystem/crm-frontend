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
import axios from 'axios';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';

const SubLedgerAccounts = () => {
  const [formData, setFormData] = useState({
    accountsCategory: '',
    active: true,
    controllAccount: '',
    createdBy: '',
    creditDays: '',
    creditLimit: '',
    currency: '',
    invoiceType: '',
    newCode: '',
    oldCode: '',
    orgId: parseInt(localStorage.getItem('orgId')),
    stateJutisiction: '',
    subLedgerName: '',
    subLedgerType: '',
    updatedBy: '',
    vatno: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSubLedgerAccounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const getSubLedgerAccounts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master/getAllSubLedgerAccountByOrgId?orgId=${formData.orgId}`);
      if (response.status === 200) {
        setData(response.data.paramObjectsMap.subLedgerAccountVO);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    // List of fields shown on the screen
    const visibleFields = [
      'accountsCategory',
      'subLedgerType',
      'newCode',
      'oldCode',
      'subLedgerName',
      'controllAccount',
      'creditDays',
      'creditLimit',
      'vatno',
      'currency',
      'stateJutisiction',
      'invoiceType'
    ];

    // Validate form data
    const errors = {};
    visibleFields.forEach((key) => {
      if (!formData[key]) {
        errors[key] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Start loading state
    setIsLoading(true);

    try {
      // Log the payload for debugging
      console.log('Saving Sub Ledger Account with payload:', formData);

      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/master/updateCreateSubLedgerAccount`, formData);

      if (response.status === 200) {
        if (response.data.status === true || response.data.statusFlag === 'Ok') {
          handleClear();
          toast.success(editMode ? 'Sub Ledger Account Updated Successfully' : 'Sub Ledger Account Created Successfully', {
            autoClose: 2000,
            theme: 'colored'
          });

          getSubLedgerAccounts();
          setEditMode(false);
        } else {
          console.error('API Error:', response.data);
          toast.error(response.data.message || 'Failed to Save Sub Ledger Account', {
            autoClose: 2000,
            theme: 'colored'
          });
        }
      } else {
        console.error('API Error:', response.data);
        toast.error(response.data.message || 'Failed to Save Sub Ledger Account', {
          autoClose: 2000,
          theme: 'colored'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to Save Sub Ledger Account', {
        autoClose: 2000,
        theme: 'colored'
      });
    } finally {
      // Stop loading state
      setIsLoading(false);
    }
  };

  const columns = [
    { accessorKey: 'accountsCategory', header: 'Accounts Category', size: 140 },

    { accessorKey: 'controllAccount', header: 'Control Account', size: 140 },
    { accessorKey: 'creditDays', header: 'Credit Days', size: 100 },
    { accessorKey: 'creditLimit', header: 'Credit Limit', size: 100 },
    { accessorKey: 'currency', header: 'Currency', size: 100 },
    { accessorKey: 'id', header: 'ID', size: 80 },
    { accessorKey: 'invoiceType', header: 'Invoice Type', size: 140 },
    { accessorKey: 'newCode', header: 'New Code', size: 140 },
    { accessorKey: 'oldCode', header: 'Old Code', size: 140 },
    { accessorKey: 'stateJutisiction', header: 'State Jurisdiction', size: 140 },
    { accessorKey: 'subLedgerName', header: 'Sub Ledger Name', size: 140 },
    { accessorKey: 'subLedgerType', header: 'Sub Ledger Type', size: 140 },
    { accessorKey: 'vatno', header: 'VAT No.', size: 100 },
    { accessorKey: 'active', header: 'Active', size: 80 }
  ];

  const handleClear = () => {
    setFormData({
      accountsCategory: '',
      active: true,
      controllAccount: '',
      createdBy: '',
      creditDays: '',
      creditLimit: '',
      currency: '',
      id: 0,
      invoiceType: '',
      newCode: '',
      oldCode: '',
      orgId: localStorage.getItem('orgId'),
      stateJutisiction: '',
      subLedgerName: '',
      subLedgerType: '',
      updatedBy: '',
      vatno: ''
    });
    setFieldErrors({});
  };

  const handleList = () => {
    setShowForm(!showForm);
    setFieldErrors({});
  };

  const getAllSubLedgerAccountById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master/getAllSubLedgerAccountById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === 200) {
        const subLedgerAccountVO = response.data.paramObjectsMap.subLedgerAccountVO[0];
        setEditMode(true);

        setFormData({
          accountsCategory: subLedgerAccountVO.accountsCategory || '',
          active: subLedgerAccountVO.active || false,
          controllAccount: subLedgerAccountVO.controllAccount || '',
          createdBy: subLedgerAccountVO.createdBy || '',
          creditDays: subLedgerAccountVO.creditDays || '',
          creditLimit: subLedgerAccountVO.creditLimit || '',
          currency: subLedgerAccountVO.currency || '',
          id: subLedgerAccountVO.id || 0,
          invoiceType: subLedgerAccountVO.invoiceType || '',
          newCode: subLedgerAccountVO.newCode || '',
          oldCode: subLedgerAccountVO.oldCode || '',
          orgId: subLedgerAccountVO.orgId || localStorage.getItem('orgId'),
          stateJutisiction: subLedgerAccountVO.stateJutisiction || '',
          subLedgerName: subLedgerAccountVO.subLedgerName || '',
          subLedgerType: subLedgerAccountVO.subLedgerType || '',
          updatedBy: subLedgerAccountVO.updatedBy || '',
          vatno: subLedgerAccountVO.vatno || ''
        });

        console.log('DataToEdit', subLedgerAccountVO);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton
            title="Save"
            icon={SaveIcon}
            isLoading={isLoading}
            onClick={() => handleSave()}
            margin="0 10px 0 10px"
          /> &nbsp;{' '}
        </div>
        <div className="row d-flex">
          {showForm ? (
            <>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="accounts-category-label" required>
                    Accounts Category
                  </InputLabel>
                  <Select
                    labelId="accounts-category-label"
                    id="accounts-category"
                    name="accountsCategory"
                    value={formData.accountsCategory}
                    onChange={handleInputChange}
                    label="Accounts Category"
                  >
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                  {fieldErrors.accountsCategory && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="sub-ledger-type-label" required>
                    SubLedger Type
                  </InputLabel>
                  <Select
                    labelId="sub-ledger-type-label"
                    id="sub-ledger-type"
                    name="subLedgerType"
                    value={formData.subLedgerType}
                    onChange={handleInputChange}
                    label="SubLedger Type"
                  >
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                  {fieldErrors.subLedgerType && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="New Code"
                    size="small"
                    required
                    name="newCode"
                    value={formData.newCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.newCode && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Old Code"
                    size="small"
                    required
                    name="oldCode"
                    value={formData.oldCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.oldCode && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="SubLedger Name"
                    size="small"
                    required
                    name="subLedgerName"
                    value={formData.subLedgerName}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.subLedgerName && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Control Account"
                    size="small"
                    required
                    name="controllAccount"
                    value={formData.controllAccount}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.controllAccount && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Credit Days"
                    size="small"
                    required
                    name="creditDays"
                    value={formData.creditDays}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.creditDays && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Credit Limit"
                    size="small"
                    required
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.creditLimit && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="VAT Number"
                    size="small"
                    required
                    name="vatno"
                    value={formData.vatno}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.vatno && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Currency"
                    size="small"
                    required
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.currency && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="State Jurisdiction"
                    size="small"
                    required
                    name="stateJutisiction"
                    value={formData.stateJutisiction}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.stateJutisiction && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label="Invoice Type"
                    size="small"
                    required
                    name="invoiceType"
                    value={formData.invoiceType}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                  />
                  {fieldErrors.invoiceType && <span style={{ color: 'red' }}>This field is required</span>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        name="active"
                      />
                    }
                    label="Active"
                  />
                </FormGroup>
              </div>
            </>
          ) : (
            <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getAllSubLedgerAccountById} />
          )}
        </div>
      </div>
    </>
  );
};

export default SubLedgerAccounts;

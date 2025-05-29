import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import apiCalls from 'apicall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import CommonTable from 'views/basicMaster/CommonTable';
import TableComponent from './TableComponent';

const Account = () => {
  const [value, setValue] = useState('1');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [data, setData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    accountGroup: '',
    branchLocation: '',
    accountType: '',
    groupName: '',
    accountCode: '',
    accountName: '',
    category: '',
    orgId: orgId,
    currency: '',
    block: false,
    itcApplicable: true,
    account1DTO: [
      {
        balanceSheet: '',
        cashFlowStatement: '',
        incomeStatement: ''
      }
    ],
    account2DTO: [
      {
        accountNo: '',
        bankType: '',
        overDraftLimit: ''
      }
    ]
  });

  useEffect(() => {
    fetchData();
    const getCurrency = async () => {
      try {
        const currencyData = await getAllActiveCurrency(orgId);
        setCurrencies(currencyData);

        console.log('currency', currencyData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    getCurrency();
  }, []);

  const handleChangeTab = (event, newValue) => setValue(newValue);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Check if the name belongs to nested objects
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData((prevFormData) => ({
        ...prevFormData,
        [parentKey]: {
          ...prevFormData[parentKey],
          [childKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      accountGroup: '',
      branchLocation: '',
      accountType: '',
      groupName: '',
      accountCode: '',
      accountName: '',
      category: '',
      currency: '',
      block: false,
      itcApplicable: true,
      account1DTO: {
        balanceSheet: '',
        cashFlowStatement: '',
        incomeStatement: ''
      },
      account2DTO: {
        accountNo: '',
        bankType: '',
        overDraftLimit: ''
      }
    });
  };

  const handleListView = () => {
    setShowForm(!showForm);
  };

  const fetchData = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllAccountByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.accountVO || []);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleSave = async () => {
    const preparedFormData = {
      ...formData,
      account2DTO: {
        ...formData.account2DTO,
        accountNo: parseInt(formData.account2DTO.accountNo, 10) || 0,
        overDraftLimit: parseInt(formData.account2DTO.overDraftLimit, 10) || 0
      }
    };

    try {
      setLoading(true);
      const response = await apiCalls('put', '/master/updateCreateAccount', preparedFormData);
      console.log('Post response:', response);
      toast.success('Account Created successfully', {
        autoClose: 2000,
        theme: 'colored'
      });
      handleClear();
      // Handle successful response (e.g., clear form, update state, etc.)
    } catch (error) {
      console.error('Error posting data:', error);

      toast.error('Error posting data', {
        autoClose: 2000,
        theme: 'colored'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccountById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master/getListOfValuesById?id=${row.original.id}`);
      // console.log('API Response:', response);
      const result = await apiCalls('get', `/master/getAllAccountById?id=${row.original.id}`);
      if (result) {
        const listValueVO = result.paramObjectsMap.accountVO[0];
        // setEditMode(true);

        setFormData({
          accountGroup: listValueVO.accountGroup,
          branchLocation: listValueVO.branchLocation,
          accountType: listValueVO.accountType,
          groupName: listValueVO.groupName,
          accountCode: listValueVO.accountCode,
          accountName: listValueVO.accountName,
          category: listValueVO.category,
          id: listValueVO.id,
          currency: listValueVO.currency,
          account1DTO: listValueVO.account1VO[0],
          account2DTO: listValueVO.account2VO[0],
          account3DTO: listValueVO.account3VO
        });

        console.log('DataToEdit', listValueVO);
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const columns = [
    { accessorKey: 'accountGroup', header: 'AccountGroup', size: 140 },
    { accessorKey: 'branchLocation', header: 'Branch/Location', size: 140 },
    { accessorKey: 'accountType', header: 'Account Type', size: 140 },
    { accessorKey: 'groupName', header: 'Group Name', size: 140 },
    { accessorKey: 'accountCode', header: 'Account Code', size: 140 },
    { accessorKey: 'accountName', header: 'Account Name', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleListView} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={loading} onClick={handleSave} margin="0 10px 0 10px" />
        </div>
        {showForm ? (
          <>
            <div className="row d-flex">
              <FormControlComponent
                name="accountGroup"
                label="Account/Group"
                value={formData.accountGroup}
                onChange={handleChange}
                options={['atype', 'Twenty', 'Thirty']}
              />
              <TextFieldComponent name="branchLocation" label="Branch/Location" value={formData.branchLocation} onChange={handleChange} />
              <FormControlComponent
                name="accountType"
                label="Account Type"
                value={formData.accountType}
                onChange={handleChange}
                options={['Primary Group', 'Twenty', 'Thirty']}
              />
              <FormControlComponent
                name="groupName"
                label="Group Name"
                value={formData.groupName}
                onChange={handleChange}
                options={['groupname', 'Twenty', 'Thirty']}
              />
              <TextFieldComponent name="accountCode" label="Account Code" value={formData.accountCode} onChange={handleChange} />
              <TextFieldComponent name="accountName" label="Account/Group Name" value={formData.accountName} onChange={handleChange} />
              <FormControlComponent
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                options={['acategory', 'Twenty', 'Thirty']}
              />
              <FormControlComponent
                name="currency"
                label="Currency"
                value={formData.currency}
                onChange={handleChange}
                options={currencies}
              />
              <CheckboxComponent name="block" checked={formData.block} onChange={handleChange} label="Block/Unblock" />
              <CheckboxComponent name="itcApplicable" checked={formData.itcApplicable} onChange={handleChange} label="is ITC Applicable?" />
            </div>

            <div className="card w-full p-6 bg-base-100 shadow-xl mt-2" style={{ padding: '20px' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChangeTab} textColor="secondary" indicatorColor="secondary">
                    <Tab label="Link to Final Statements" value="1" />
                    <Tab label="Bank Details" value="2" />
                    <Tab label="Company" value="3" />
                  </TabList>
                </Box>

                <TabPanel value="1">
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <FormControlComponent
                      name="account1DTO.balanceSheet"
                      label="Balance Sheet"
                      value={formData.account1DTO.balanceSheet}
                      onChange={handleChange}
                    />
                    <FormControlComponent
                      name="account1DTO.cashFlowStatement"
                      label="Cash Flow Statement"
                      value={formData.account1DTO.cashFlowStatement}
                      onChange={handleChange}
                      options={['cfcategory', 'Twenty', 'Thirty']}
                    />
                    <FormControlComponent
                      name="account1DTO.incomeStatement"
                      label="Income Statement"
                      value={formData.account1DTO.incomeStatement}
                      onChange={handleChange}
                    />
                  </div>
                </TabPanel>
                <TabPanel value="2">
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <FormControlComponent
                      name="account2DTO.bankType"
                      label="Bank Type"
                      value={formData.account2DTO.bankType}
                      onChange={handleChange}
                      options={['banktype', 'Twenty', 'Thirty']}
                    />
                    <TextFieldComponent
                      name="account2DTO.accountNo"
                      label="Bank Account No"
                      value={formData.account2DTO.accountNo}
                      onChange={handleChange}
                    />
                    <TextFieldComponent
                      name="account2DTO.overDraftLimit"
                      label="Over draft limit"
                      value={formData.account2DTO.overDraftLimit}
                      onChange={handleChange}
                    />
                  </div>
                </TabPanel>
                <TabPanel value="3">
                  <TableComponent formValues={formData} setFormValues={setFormData} />
                </TabPanel>
              </TabContext>
            </div>
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getAccountById} />
        )}
      </div>
    </>
  );
};

const FormControlComponent = ({ name, label, value, onChange, options }) => (
  <div className="col-md-3 mb-3">
    <FormControl fullWidth size="small">
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select labelId={`${name}-label`} id={name} name={name} value={value} label={label} onChange={onChange}>
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
);

const TextFieldComponent = ({ name, label, value, onChange }) => (
  <div className="col-md-3 mb-3">
    <TextField id={name} label={label} name={name} value={value} onChange={onChange} size="small" variant="outlined" fullWidth />
  </div>
);

const CheckboxComponent = ({ name, checked, onChange, label }) => (
  <div className="col-md-3 mb-3">
    <FormGroup>
      <FormControlLabel
        control={<Checkbox name={name} checked={checked} onChange={onChange} sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }} />}
        label={label}
      />
    </FormGroup>
  </div>
);

export default Account;

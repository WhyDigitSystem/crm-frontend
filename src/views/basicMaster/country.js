import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

export const Country = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    active: true,
    countryCode: '',
    countryName: ''
  });
  const [editId, setEditId] = useState('');

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    countryName: '',
    countryCode: ''
  });
  const [listView, setListView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const listViewColumns = [
    { accessorKey: 'countryCode', header: 'Code', size: 140 },
    {
      accessorKey: 'countryName',
      header: 'Country',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllCountries();
  }, []);

  const getAllCountries = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/country?orgid=${orgId}`);
      setListViewData(result.paramObjectsMap.countryVO);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getCountryById = async (row) => {
    console.log('THE SELECTED COUNTRY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/country/${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.Country;
        setFormData({
          countryCode: particularCountry.countryCode,
          countryName: particularCountry.countryName,
          active: particularCountry.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
  //   const nameRegex = /^[A-Za-z ]*$/;

  //   if (name === 'countryCode' && !codeRegex.test(value)) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
  //   } else if (name === 'countryName' && !nameRegex.test(value)) {
  //     setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
  //   } else {
  //     setFormData({ ...formData, [name]: value.toUpperCase() });
  //     setFieldErrors({ ...fieldErrors, [name]: '' });
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'countryCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'countryName' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Update the cursor position after the input change
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      countryName: '',
      countryCode: '',
      active: true
    });
    setFieldErrors({
      countryName: '',
      countryCode: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.countryCode) {
      errors.countryCode = 'Country Code is required';
    }
    if (!formData.countryName) {
      errors.countryName = 'Country is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('post', `commonmaster/createUpdateCountry`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Country Updated Successfully' : 'Country created successfully');
          handleClear();
          getAllCountries();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Country creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Country creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClose = () => {
    setEditMode(false);
    setFormData({
      country: '',
      countryCode: ''
    });
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
  };
  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getCountryById}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.countryCode}
                  helperText={fieldErrors.countryCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="countryName"
                  value={formData.countryName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.countryName}
                  helperText={fieldErrors.countryName}
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
        )}
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default Country;

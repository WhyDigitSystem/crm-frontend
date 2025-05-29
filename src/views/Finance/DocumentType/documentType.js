import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import TextField from '@mui/material/TextField';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

export const DocumentTypeMaster = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    screenCode: '',
    screenName: '',
    userType: '',
    docCode: '',
    desc: ''
  });
  const [value, setValue] = useState(0);
  const [clientTableData, setClientTableData] = useState([{ id: 1, clientCode: '', client: '' }]);
  const [clientTableErrors, setClientTableErrors] = useState([
    {
      clientCode: '',
      client: ''
    }
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    screenCode: '',
    screenName: '',
    userType: '',
    docCode: '',
    desc: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'screenCode', header: 'screenCode', size: 140 },
    { accessorKey: 'screenName', header: 'Screen', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);
  const [screenList, setScreenList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [clientList, setClientList] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    getAllScreens();
    getAllDocumentType();
    // getAllCustomers();
    getAllClients();
  }, []);

  const getAllScreens = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getAllScreenCode?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setScreenList(response.paramObjectsMap.finScreen);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllClients = async () => {
    try {
      const response = await apiCalls('get', `warehousemastercontroller/getClientAndClientCodeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setClientList(response.paramObjectsMap.CustomerVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllDocumentType = async () => {
    try {
      const response = await apiCalls('get', `/documentType/getAllDocumentType?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.documentTypeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getDocumentTypeById = async (row) => {
    console.log('THE SELECTED DOCUMENTTYPE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/documentType/documentTypeById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularClient = response.paramObjectsMap.documentTypeVO;

        setFormData({
          screenName: particularClient.screenName,
          screenCode: particularClient.screenCode,
          desc: particularClient.description,
          docCode: particularClient.docCode,
          active: particularClient.active === 'Active' ? true : false
        });

        const alreadySelectedClient = particularClient.documentTypeDetailsVO.map((i) => {
          const foundClient = clientList.find((cl) => cl.client === i.client);
          console.log(`Searching for branch with code ${i.client}:`, foundClient);
          return {
            id: i.id,
            client: foundClient ? foundClient.client : 'Not Found',
            clientCode: foundClient.clientCode ? foundClient.clientCode : 'Not Found'
          };
        });
        setClientTableData(alreadySelectedClient);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;

  //   const nameRegex = /^[A-Za-z ]*$/;
  //   const alphaNumericRegex = /^[A-Za-z0-9]*$/;
  //   const numericRegex = /^[0-9]*$/;

  //   let errorMessage = '';

  //   switch (name) {
  //     case 'docCode':
  //       if (!alphaNumericRegex.test(value)) {
  //         errorMessage = 'Only numeric characters are allowed';
  //       } else if (value.length > 10) {
  //         errorMessage = 'Invalid Format';
  //       }
  //       break;
  //   }

  //   if (errorMessage) {
  //     setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
  //   } else {
  //     if (name === 'screenCode') {
  //       const selectedScreen = screenList.find((scr) => scr.screenCode === value);
  //       if (selectedScreen) {
  //         setFormData((prevData) => ({
  //           ...prevData,
  //           screenName: selectedScreen.screenName,
  //           screenCode: selectedScreen.screenCode
  //         }));
  //       }
  //     }

  //     setFormData((prevData) => ({ ...prevData, [name]: value.toUpperCase() }));

  //     setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value, type, selectionStart, selectionEnd } = e.target;

    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;

    let errorMessage = '';

    switch (name) {
      case 'docCode':
        if (!alphaNumericRegex.test(value)) {
          errorMessage = 'Only alphanumeric characters are allowed';
        } else if (value.length > 10) {
          errorMessage = 'Invalid Format';
        }
        break;

      // Add other cases here if needed
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === 'screenCode') {
        const selectedScreen = screenList.find((scr) => scr.screenCode === value);
        if (selectedScreen) {
          setFormData((prevData) => ({
            ...prevData,
            screenName: selectedScreen.screenName,
            screenCode: selectedScreen.screenCode
          }));
        }
      }

      const updatedValue = value.toUpperCase();
      setFormData((prevData) => ({ ...prevData, [name]: updatedValue }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

      // Preserve cursor position for text inputs
      if (type === 'text' && e.target.setSelectionRange) {
        setTimeout(() => {
          e.target.setSelectionRange(selectionStart, selectionEnd);
        }, 0);
      }
    }
  };

  const getAvailableClients = (currentRowId) => {
    const selectedClients = clientTableData.filter((row) => row.id !== currentRowId).map((row) => row.client);
    return clientList.filter((client) => !selectedClients.includes(client.client));
  };

  const handleClientChange = (row, index, event) => {
    const value = event.target.value;
    const selectedClient = clientList.find((client) => client.client === value);
    setClientTableData((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, client: value, clientCode: selectedClient ? selectedClient.clientCode : '' } : r))
    );
    setClientTableErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = {
        ...newErrors[index],
        client: !value ? 'Client is required' : ''
      };
      return newErrors;
    });
  };

  const handleClear = () => {
    setFormData({
      screenCode: '',
      screenName: '',
      docCode: '',
      desc: '',
      active: true
    });

    setFieldErrors({
      screenCode: '',
      screenName: '',
      docCode: '',
      desc: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    console.log('handle save is working');

    const errors = {};
    if (!formData.screenCode) {
      errors.screenCode = 'Screen Code is required';
    }
    if (!formData.desc) {
      errors.desc = 'Desc is required';
    }
    if (!formData.docCode) {
      errors.docCode = 'Doc Code is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        screenCode: formData.screenCode,
        docCode: formData.docCode,
        description: formData.desc,
        screenName: formData.screenName,
        // active: formData.active,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/documentType/createUpdateDocumentType`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Document Type Updated Successfully' : 'Document Type created successfully');
          handleClear();
          getAllDocumentType();
          getAllScreens();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Document Type creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Document Type creation failed');
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
    setFormData({
      screenCode: '',
      screenName: '',
      docCode: '',
      desc: '',
      active: true
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
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getDocumentTypeById} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.screenCode}>
                  <InputLabel id="screenCode-label">Screen Code</InputLabel>
                  <Select
                    labelId="screenCode-label"
                    label="screenCode"
                    value={formData.screenCode}
                    onChange={handleInputChange}
                    name="screenCode"
                  >
                    {screenList?.map((row) => (
                      <MenuItem key={row.id} value={row.screenCode}>
                        {row.screenCode}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.screenCode && <FormHelperText>{fieldErrors.screenCode}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Screen Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="screenName"
                  value={formData.screenName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.screenName}
                  helperText={fieldErrors.screenName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Desc"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  error={!!fieldErrors.desc}
                  helperText={fieldErrors.desc}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Doc Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="docCode"
                  value={formData.docCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.docCode}
                  helperText={fieldErrors.docCode}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};
export default DocumentTypeMaster;

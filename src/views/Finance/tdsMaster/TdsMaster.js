import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';
import TableComponent from './TableComponent';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
// import 'react-datepicker/dist/react-datepicker.css';
// import DatePicker from 'react-datepicker';
import { toDate } from 'date-fns';
import ToastComponent, { showToast } from 'utils/toast-component';

const TdsMaster = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState('');
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [formValues, setFormValues] = useState({
    active: true,
    section: '',
    sectionName: ''
    // tdsMaster2DTO: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getAllTdsMasterByOrgId();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Validate the input fields
    if (id === 'section' || id === 'sectionName') {
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

  const [tdsTableData, setTdsTableData] = useState([
    {
      id: 1,
      fromDate: '',
      toDate: '',
      tcs: '',
      sur: '',
      eds: ''
    }
  ]);

  const [tdsTableErrors, setTdsTableErrors] = useState([
    {
      fromDate: '',
      toDate: '',
      tcs: '',
      sur: '',
      eds: ''
    }
  ]);

  const handleAddRow = () => {
    if (isLastRowEmpty(tdsTableData)) {
      displayRowError(tdsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      fromDate: '',
      toDate: '',
      tcs: '',
      sur: '',
      eds: ''
    };
    setTdsTableData([...tdsTableData, newRow]);
    setTdsTableErrors([...tdsTableErrors, { fromDate: null, toDate: null, tcs: '', sur: '', eds: '' }]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === tdsTableData) {
      return !lastRow.fromDate || !lastRow.toDate || !lastRow.tcs || !lastRow.sur || !lastRow.eds;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === tdsTableData) {
      setTdsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          fromDate: !table[table.length - 1].fromDate ? 'From Date is required' : '',
          toDate: !table[table.length - 1].toDate ? 'To Date is required' : '',
          tcs: !table[table.length - 1].tcs ? 'Tcs is required' : '',
          sur: !table[table.length - 1].sur ? 'Sur is required' : '',
          eds: !table[table.length - 1].eds ? 'Eds is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    // If the row exists, proceed to delete
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const columns = [
    { accessorKey: 'section', header: 'Section', size: 140 },
    { accessorKey: 'sectionName', header: 'Section Name', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  // const handleClear = () => {
  //   setFormValues({
  //     section: '',
  //     sectionName: '',
  //     active: true
  //     // orgId: ''
  //   });
  //   setTdsTableData({
  //     fromDate: null,
  //     toDate: null,
  //     tcs: '',
  //     sur: '',
  //     eds: ''
  //   });
  //   setValidationErrors({});
  //   setEditId('');
  // };

  // const handleClear = () => {
  //   setFormValues({
  //     section: '',
  //     sectionName: '',
  //     active: true
  //   });

  //   setTdsTableData((prevData) =>
  //     prevData.map((row) => ({
  //       ...row,
  //       fromDate: '',
  //       toDate: '',
  //       tcs: '',
  //       sur: '',
  //       eds: ''
  //     }))
  //   );

  //   setValidationErrors({});
  //   setTdsTableErrors(
  //     tdsTableData.map(() => ({
  //       fromDate: null,
  //       toDate: null,
  //       tcs: '',
  //       sur: '',
  //       eds: ''
  //     }))
  //   );
  //   setEditId('');
  // };

  const handleClear = () => {
    setFormValues({
      section: '',
      sectionName: '',
      active: true
    });

    // Set the table to only have one empty row
    setTdsTableData([
      {
        id: 1, // Set an initial id (or use Date.now() or any unique identifier)
        fromDate: '', // Empty 'fromDate'
        toDate: '', // Empty 'toDate'
        tcs: '', // Empty 'tcs'
        sur: '', // Empty 'sur'
        eds: '' // Empty 'eds'
      }
    ]);

    // Reset table errors for just one row
    setTdsTableErrors([
      {
        fromDate: null,
        toDate: null,
        tcs: '',
        sur: '',
        eds: ''
      }
    ]);

    setValidationErrors({});
    setEditId('');
  };

  const formatDate = (date) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero based
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // const handleSave = async () => {
  //   const formDataWithEncryptedPassword = {
  //     ...formValues,
  //     tdsMaster2DTO: formValues.tdsMaster2DTO.map((item) => ({
  //       ...item,
  //       fromDate: formatDate(item.fromDate),
  //       toDate: formatDate(item.toDate)
  //     }))
  //   };
  //   if (validateForm()) {
  //     try {
  //       setIsLoading(true);
  //       const response = await apiCalls('put', '/master/updateCreateTdsMaster', formDataWithEncryptedPassword);
  //       console.log('Save Successful', response.data);
  //       toast.success(editMode ? ' Tds Master Updated Successfully' : ' Tds Master created successfully', {
  //         autoClose: 2000,
  //         theme: 'colored'
  //       });
  //       getAllTdsMasterByOrgId();
  //       handleClear();
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error('Save Failed', error);
  //     }
  //   } else {
  //     console.error('Validation Errors:', validationErrors);
  //   }
  // };

  // const handleSave = async () => {
  //   // Ensure dates are formatted and fields are mapped correctly
  //   const formDataWithMappedFields = {
  //     ...formValues,
  //     tdsMaster2DTO: tdsTableData.map((item) => ({
  //       // id: item.id || 0, // If id exists, otherwise 0
  //       fromDate: formatDate(item.fromDate), // Format the date
  //       toDate: formatDate(item.toDate), // Format the date
  //       tcsPercentage: parseFloat(item.tcs) || 0, // Ensure it's a number
  //       surPercentage: parseFloat(item.sur) || 0, // Ensure it's a number
  //       edcessPercentage: parseFloat(item.eds) || 0 // Ensure it's a number
  //     }))
  //   };

  //   if (validateForm()) {
  //     try {
  //       setIsLoading(true);
  //       const response = await apiCalls('put', '/master/updateCreateTdsMaster', formDataWithMappedFields);
  //       console.log('Save Successful', response.data);
  //       toast.success(editMode ? 'Tds Master Updated Successfully' : 'Tds Master created successfully', {
  //         autoClose: 2000,
  //         theme: 'colored'
  //       });
  //       getAllTdsMasterByOrgId();
  //       handleClear();
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error('Save Failed', error);
  //     }
  //   } else {
  //     console.error('Validation Errors:', validationErrors);
  //   }
  // };

  // const handleSave = async () => {
  //   // Ensure dates are formatted and fields are mapped correctly
  //   const formDataWithMappedFields = {
  //     ...formValues,
  //     tdsMaster2DTO: tdsTableData.map((item) => ({
  //       fromDate: formatDate(item.fromDate), // Format the date
  //       toDate: formatDate(item.toDate), // Format the date
  //       tcsPercentage: parseFloat(item.tcs) || 0, // Ensure it's a number
  //       surPercentage: parseFloat(item.sur) || 0, // Ensure it's a number
  //       edcessPercentage: parseFloat(item.eds) || 0 // Ensure it's a number
  //     }))
  //   };

  //   if (validateForm()) {
  //     try {
  //       setIsLoading(true);
  //       const response = await apiCalls('put', '/master/updateCreateTdsMaster', formDataWithMappedFields);

  //       const { status, paramObjectsMap, statusFlag } = response.data;

  //       if (response.status === 200 && status && statusFlag !== 'Error') {
  //         // Show success message when HTTP status is 200 and backend logic is successful
  //         toast.success(editMode ? 'Tds Master Updated Successfully' : 'Tds Master created successfully', {
  //           autoClose: 2000,
  //           theme: 'colored'
  //         });

  //         // Clear the form and table data only on success
  //         handleClear();

  //         // Reload data if necessary
  //         getAllTdsMasterByOrgId();
  //       } else {
  //         // Show error message from backend if business logic failed
  //         toast.error(paramObjectsMap?.errorMessage || 'Failed to save. Please try again.', {
  //           autoClose: 4000,
  //           theme: 'colored'
  //         });
  //       }
  //     } catch (error) {
  //       // Capture and display the error from the backend
  //       console.error('Save Failed', error.response?.data?.message || error.message);

  //       // Show error message to the user
  //       toast.error(error.response?.data?.message || 'An error occurred. Please try again.', {
  //         autoClose: 4000,
  //         theme: 'colored'
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   } else {
  //     // Handle validation errors
  //     console.error('Validation Errors:', validationErrors);
  //   }
  // };

  // const handleSave = async () => {
  //   const errors = {};
  //   if (!formValues.section.trim()) {
  //     errors.section = 'This field is required';
  //   }
  //   if (!formValues.sectionName.trim()) {
  //     errors.sectionName = 'This field is required';
  //   }
  //   setValidationErrors(errors);

  //   if (Object.keys(errors).length === 0) {
  //     setIsLoading(true);

  //     const tdsTableVo = tdsTableData.map((item) => ({
  //       // ...(editId && { id: row.id }),
  //       fromDate: formatDate(item.fromDate), // Format the date
  //       toDate: formatDate(item.toDate), // Format the date
  //       tcsPercentage: parseFloat(item.tcs) || 0, // Ensure it's a number
  //       surPercentage: parseFloat(item.sur) || 0, // Ensure it's a number
  //       edcessPercentage: parseFloat(item.eds) || 0 // Ensure it's a number
  //     }));

  //     const saveFormData = {
  //       ...(editId && { id: formValues.docId }),
  //       ...formValues,
  //       tdsMaster2DTO: tdsTableVo
  //     };

  //     console.log('DATA TO SAVE IS:', saveFormData);
  //     try {
  //       const response = await apiCalls('put', `master/updateCreateTdsMaster`, saveFormData);
  //       if (response.status === true) {
  //         console.log('Response:', response);
  //         showToast('success', editId ? 'Tds Updated Successfully' : 'Tds created successfully');
  //         handleClear();
  //         getAllTdsMasterByOrgId();
  //         setIsLoading(false);
  //       } else {
  //         showToast('error', response.paramObjectsMap.errorMessage || 'Tds creation failed');
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //       showToast('error', 'Tds creation failed');
  //       setIsLoading(false);
  //     }
  //   } else {
  //     setValidationErrors(errors);
  //   }
  // };

  const handleSave = async () => {
    const errors = {};
    const tableErrors = tdsTableData.map((row) => ({
      fromDate: !row.fromDate ? 'From Date is required' : '',
      toDate: !row.toDate ? 'To Date is required' : '',
      tcs: !row.tcs ? 'TCS is required' : '',
      sur: !row.sur ? 'Sur is required' : '',
      eds: !row.eds ? 'EDS is required' : ''
    }));

    let hasTableErrors = false;

    tableErrors.forEach((err) => {
      if (Object.values(err).some((error) => error)) {
        hasTableErrors = true;
      }
    });

    if (!formValues.section.trim()) {
      errors.section = 'This field is required';
    }
    if (!formValues.sectionName.trim()) {
      errors.sectionName = 'This field is required';
    }

    setValidationErrors(errors);
    setTdsTableErrors(tableErrors);

    // Prevent saving if form or table errors exist
    if (Object.keys(errors).length === 0 && !hasTableErrors) {
      setIsLoading(true);

      const tdsTableVo = tdsTableData.map((row) => ({
        // id: item.id || 0, // If id exists, otherwise 0
        ...(editId && { id: row.id }),
        fromDate: formatDate(row.fromDate),
        toDate: formatDate(row.toDate),
        tcsPercentage: parseFloat(row.tcs) || 0,
        surPercentage: parseFloat(row.sur) || 0,
        edcessPercentage: parseFloat(row.eds) || 0
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        section: formValues.section,
        sectionName: formValues.sectionName,
        active: formValues.active,
        createdBy: loginUserName,
        orgId: orgId,
        tdsMaster2DTO: tdsTableVo
      };

      try {
        const response = await apiCalls('put', `master/updateCreateTdsMaster`, saveFormData);
        if (response.status === true) {
          showToast('success', editId ? 'Tds Updated Successfully' : 'Tds created successfully');
          handleClear();
          getAllTdsMasterByOrgId();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Tds creation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Tds creation failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getAllTdsMasterByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllTdsMasterByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.tdsMasterVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getTdsMasterById = async (row) => {
    console.log('first', row);
    setEditId(row.original.id);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/master/getAllTdsMasterById?id=${row.original.id}`);
      if (result) {
        const tdsMasterVO = result.paramObjectsMap.tdsMasterVO[0];
        setEditMode(true);

        setFormValues({
          section: tdsMasterVO.section,
          sectionName: tdsMasterVO.sectionName,
          active: tdsMasterVO.active
          // id: tdsMasterVO.id || 0,
          // tdsMaster2DTO: tdsMasterVO.tdsMaster2VO || [],
          // orgId: orgId
        });
        setTdsTableData(
          tdsMasterVO.tdsMaster2VO.map((role) => ({
            id: role.id,
            fromDate: role.fromDate,
            toDate: role.toDate,
            tcs: role.tcsPercentage,
            sur: role.surPercentage,
            eds: role.edcessPercentage
          }))
        );
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

  // const validateForm = () => {
  //   const errors = {};
  //   if (!formValues.section.trim()) {
  //     errors.section = 'This field is required';
  //   }
  //   if (!formValues.sectionName.trim()) {
  //     errors.sectionName = 'This field is required';
  //   }
  //   setValidationErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  return (
    <div>
      <ToastComponent />
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
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="section"
                    label="Section"
                    size="small"
                    required
                    value={formValues.section}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.section}
                    helperText={validationErrors.section}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="sectionName"
                    label="Section Name"
                    size="small"
                    required
                    value={formValues.sectionName}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!validationErrors.sectionName}
                    helperText={validationErrors.sectionName}
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
            {/* <TableComponent formValues={formValues} setFormValues={setFormValues} /> */}
            <div className="row d-flex ml">
              <div className="mb-1">
                <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
              </div>
              <div className="row mt-2">
                <div className="col-lg-12">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr style={{ backgroundColor: '#673AB7' }}>
                          <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                            Action
                          </th>
                          <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                            S.No
                          </th>
                          <th className="px-2 py-2 text-white text-center">From Date</th>
                          <th className="px-2 py-2 text-white text-center">To Date</th>
                          <th className="px-2 py-2 text-white text-center">TCS %</th>
                          <th className="px-2 py-2 text-white text-center">Sur %</th>
                          <th className="px-2 py-2 text-white text-center">EDS %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(tdsTableData) &&
                          tdsTableData.map((row, index) => (
                            <tr key={row.id}>
                              <td className="border px-2 py-2 text-center">
                                <ActionButton
                                  title="Delete"
                                  icon={DeleteIcon}
                                  onClick={() => handleDeleteRow(row.id, tdsTableData, setTdsTableData, tdsTableErrors, setTdsTableErrors)}
                                />
                              </td>
                              <td className="text-center">
                                <div className="pt-2">{index + 1}</div>
                              </td>

                              <td className="border px-2 py-2">
                                <input
                                  type="date"
                                  value={row.fromDate}
                                  onChange={(e) => {
                                    const date = e.target.value;

                                    setTdsTableData((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, fromDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                      )
                                    );

                                    setTdsTableErrors((prev) => {
                                      const newErrors = [...prev];
                                      newErrors[index] = {
                                        ...newErrors[index],
                                        fromDate: !date ? 'From Date is required' : ''
                                      };
                                      return newErrors;
                                    });
                                  }}
                                  className={tdsTableErrors[index]?.fromDate ? 'error form-control' : 'form-control'}
                                  // onKeyDown={(e) => handleKeyDown(e, row, tdsTableData)}
                                />
                                {tdsTableErrors[index]?.fromDate && (
                                  <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                    {tdsTableErrors[index].fromDate}
                                  </div>
                                )}
                              </td>

                              <td className="border px-2 py-2">
                                <input
                                  type="date"
                                  value={row.toDate}
                                  onChange={(e) => {
                                    const date = e.target.value;

                                    setTdsTableData((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, toDate: date, endDate: date > r.endDate ? '' : r.endDate } : r
                                      )
                                    );

                                    setTdsTableErrors((prev) => {
                                      const newErrors = [...prev];
                                      newErrors[index] = {
                                        ...newErrors[index],
                                        toDate: !date ? 'To Date is required' : ''
                                      };
                                      return newErrors;
                                    });
                                  }}
                                  className={tdsTableErrors[index]?.toDate ? 'error form-control' : 'form-control'}
                                />
                                {tdsTableErrors[index]?.toDate && (
                                  <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                    {tdsTableErrors[index].toDate}
                                  </div>
                                )}
                              </td>
                              <td className="border px-2 py-2">
                                <input
                                  type="text"
                                  value={row.tcs}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numericRegex = /^[0-9]*$/;
                                    if (numericRegex.test(value)) {
                                      setTdsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, tcs: value } : r)));
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], tcs: !value ? 'Tcs is required' : '' };
                                        return newErrors;
                                      });
                                    } else {
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], tcs: 'Only numeric characters are allowed' };
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className={tdsTableErrors[index]?.tcs ? 'error form-control' : 'form-control'}
                                />
                                {tdsTableErrors[index]?.tcs && (
                                  <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                    {tdsTableErrors[index].tcs}
                                  </div>
                                )}
                              </td>
                              <td className="border px-2 py-2">
                                <input
                                  type="text"
                                  value={row.sur}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numericRegex = /^[0-9]*$/;
                                    if (numericRegex.test(value)) {
                                      setTdsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, sur: value } : r)));
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], sur: !value ? 'Sur is required' : '' };
                                        return newErrors;
                                      });
                                    } else {
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], sur: 'Only numeric characters are allowed' };
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className={tdsTableErrors[index]?.sur ? 'error form-control' : 'form-control'}
                                  // onKeyDown={(e) => handleKeyDown(e, row, tdsTableData)}
                                />
                                {tdsTableErrors[index]?.sur && (
                                  <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                    {tdsTableErrors[index].sur}
                                  </div>
                                )}
                              </td>
                              <td className="border px-2 py-2">
                                <input
                                  type="text"
                                  value={row.eds}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numericRegex = /^[0-9]*$/;
                                    if (numericRegex.test(value)) {
                                      setTdsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, eds: value } : r)));
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], eds: !value ? 'Eds is required' : '' };
                                        return newErrors;
                                      });
                                    } else {
                                      setTdsTableErrors((prev) => {
                                        const newErrors = [...prev];
                                        newErrors[index] = { ...newErrors[index], eds: 'Only numeric characters are allowed' };
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className={tdsTableErrors[index]?.eds ? 'error form-control' : 'form-control'}
                                  // onKeyDown={(e) => handleKeyDown(e, row, tdsTableData)}
                                />
                                {tdsTableErrors[index]?.eds && (
                                  <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                    {tdsTableErrors[index].eds}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getTdsMasterById} />
        )}
      </div>
    </div>
  );
};

export default TdsMaster;

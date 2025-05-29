import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { showToast } from 'utils/toast-component';

const ListOfValues = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();

  const [formData, setFormData] = useState({
    listCode: '',
    listDescription: '',
    active: true
  });
  const [fieldErrors, setFieldErrors] = useState({
    listCode: '',
    listDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [detailsTableData, setDetailsTableData] = useState([
    {
      id: 1,
      valueCode: '',
      valueDesc: '',
      active: 'true'
    }
  ]);
  const [detailsTableErrors, setDetailsTableErrors] = useState([
    {
      valueCode: '',
      valueDesc: '',
      active: ''
    }
  ]);
  const columns = [
    { accessorKey: 'listCode', header: 'List Code', size: 140 },
    { accessorKey: 'listDescription', header: 'Description', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllListOfValuesByOrgId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, selectionStart, selectionEnd, type } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;
    const branchNameRegex = /^[A-Za-z0-9@_\-*]*$/;
    const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = '';

    switch (name) {
      case 'customer':
      case 'shortName':
      case 'contactPerson':
        if (!nameRegex.test(value)) {
          errorMessage = 'Only alphabetic characters are allowed';
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      if (name === 'active') {
        setFormData({ ...formData, [name]: checked });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: '' });

      // Preserve the cursor position for text-based inputs
      if (type === 'text' || type === 'textarea') {
        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement && inputElement.setSelectionRange) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      }
    }
  };

  const handleKeyDown = (e, row, table) => {
    if (e.key === 'Tab' && row.id === table[table.length - 1].id) {
      e.preventDefault();
      if (isLastRowEmpty(table)) {
        displayRowError(table);
      } else {
        handleAddRow();
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(detailsTableData)) {
      displayRowError(detailsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      valueCode: '',
      valueDesc: '',
      active: 'true'
    };
    setDetailsTableData([...detailsTableData, newRow]);
    setDetailsTableErrors([...detailsTableErrors, { valueCode: '', valueDesc: '' }]);
  };
  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === detailsTableData) {
      return !lastRow.valueCode || !lastRow.valueDesc || !lastRow.active;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === detailsTableData) {
      setDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          valueCode: !table[table.length - 1].valueCode ? 'Value Code is required' : '',
          valueDesc: !table[table.length - 1].valueDesc ? 'Value Desc is required' : '',
          active: !table[table.length - 1].active ? 'Active is required' : ''
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

  const handleClear = () => {
    setFormData({
      listCode: '',
      listDescription: '',
      active: true,
      createdBy: 'currentUser',
      updatedBy: 'currentUser'
    });
    setFieldErrors({});
    setDetailsTableData([
      {
        id: 1,
        valueCode: '',
        valueDesc: '',
        active: 'true'
      }
    ]);
    setDetailsTableErrors('');
    setEditId('');
  };

  const handleSave = async () => {
    console.log('THE HANDLE SAVE IS WORKING');

    const errors = {};
    if (!formData.listCode) errors.listCode = 'List Code is required';
    if (!formData.listDescription) errors.listDescription = 'List Description is required';

    let detailsTableDataValid = true;
    if (!detailsTableData || !Array.isArray(detailsTableData) || detailsTableData.length === 0) {
      detailsTableDataValid = false;
      setDetailsTableErrors([{ general: 'Lr Table Data is required' }]);
    } else {
      const newTableErrors = detailsTableData.map((row, index) => {
        const rowErrors = {};
        if (!row.valueCode) {
          rowErrors.valueCode = 'Value Code is required';
          detailsTableDataValid = false;
        }
        if (!row.valueDesc) {
          rowErrors.valueDesc = 'Value Desc is required';
          detailsTableDataValid = false;
        }

        if (row.active === undefined || row.active === null) {
          rowErrors.active = 'Active is required';
          detailsTableDataValid = false;
        }

        return rowErrors;
      });
      setDetailsTableErrors(newTableErrors);
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0 && detailsTableDataValid) {
      setIsLoading(true);

      const detailsVo = detailsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        valueCode: row.valueCode,
        valueDescription: row.valueDesc,
        active: row.active === 'true' || row.active === true // Convert string 'true' to boolean true if necessary
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        listCode: formData.listCode,
        listDescription: formData.listDescription,
        listOfValues1DTO: detailsVo,
        createdBy: loginUserName,
        orgId: orgId
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', '/master/updateCreateListOfValues', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'List of values updated successfully' : 'List of values created successfully');
          getAllListOfValuesByOrgId();
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'List of value creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'List of value creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const getAllListOfValuesByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/master/getListOfValuesByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.listOfValuesVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getListOfValueById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/master/getListOfValuesById?id=${row.original.id}`);

      if (result) {
        const listValueVO = result.paramObjectsMap.listOfValuesVO[0];
        setEditId(row.original.id);

        setFormData({
          listCode: listValueVO.listCode || '',
          listDescription: listValueVO.listDescription || '',
          active: listValueVO.active || false,
          id: listValueVO.id || 0
        });
        setDetailsTableData(
          listValueVO.listOfValues1VO.map((cl) => ({
            id: cl.id,
            valueCode: cl.valueCode,
            valueDesc: cl.valueDescription,
            active: cl.active
          }))
        );

        console.log('DataToEdit', listValueVO);
      } else {
        // Handle erro
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
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
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="listCode"
                    label={
                      <span>
                        List Code <span className="asterisk">*</span>
                      </span>
                    }
                    name="listCode"
                    size="small"
                    value={formData.listCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.listCode}
                    helperText={fieldErrors.listCode}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="listDescription"
                    label={
                      <span>
                        List Description <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    name="listDescription"
                    value={formData.listDescription}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.listDescription}
                    helperText={fieldErrors.listDescription}
                  />
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" color="primary" />}
                  label="Active"
                  sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                />
              </div>
            </div>
            {/* <TableComponent formData={formData} setFormData={setFormData} /> */}
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="Details" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-7">
                          <div className="table-responsive">
                            <table className="table table-bordered ">
                              <thead>
                                <tr style={{ backgroundColor: '#673AB7' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    S.No
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>
                                    Value Code
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                    Value Description
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '120px' }}>
                                    Active
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailsTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(
                                            row.id,
                                            detailsTableData,
                                            setDetailsTableData,
                                            detailsTableErrors,
                                            setDetailsTableErrors
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        // style={{ width: '150px' }}
                                        type="text"
                                        value={row.valueCode}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, valueCode: value } : r))
                                          );
                                          setDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              valueCode: !value ? 'Value Code is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={detailsTableErrors[index]?.valueCode ? 'error form-control' : 'form-control'}
                                      />
                                      {detailsTableErrors[index]?.valueCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {detailsTableErrors[index].valueCode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        // style={{ width: '150px' }}
                                        type="text"
                                        value={row.valueDesc}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, valueDesc: value } : r))
                                          );
                                          setDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              valueDesc: !value ? 'Value Desc is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={detailsTableErrors[index]?.valueDesc ? 'error form-control' : 'form-control'}
                                      />
                                      {detailsTableErrors[index]?.valueDesc && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {detailsTableErrors[index].valueDesc}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.active}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setDetailsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, active: value } : r)));
                                          setDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              active: !value ? 'Active is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, row, detailsTableData)}
                                        className={detailsTableErrors[index]?.active ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">Select</option>
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                      </select>
                                      {detailsTableErrors[index]?.active && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {detailsTableErrors[index].active}
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
                )}
              </Box>
            </div>
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getListOfValueById} />
        )}
      </div>
    </div>
  );
};

export default ListOfValues;

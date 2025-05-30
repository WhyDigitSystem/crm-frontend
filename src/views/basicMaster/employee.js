import React, { useState, useRef, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Checkbox, FormControlLabel, FormHelperText, FormControl, Autocomplete, InputLabel, MenuItem, Select } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import CommonListViewTable from '../basicMaster/CommonListViewTable';
import { ToastContainer, toast } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';


export const Employee = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [departmentList, setDepartment] = useState([]);
  const [designationList, setDesignationList] = useState([]);

  const [formData, setFormData] = useState({
    empCode: '',
    empName: '',
    gender: '',
    branch: '',
    branchCode: '',
    department: '',
    designation: '',
    dob: null,
    doj: null,
    email: null,
    active: true
  });

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    empCode: '',
    empName: '',
    gender: '',
    branch: '',
    branchCode: '',
    department: '',
    designation: '',
    dob: '',
    doj: '',
    email: '',
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllBranches();
    getAllEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type, selectionStart, selectionEnd } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    let errorMessage = '';

    if (name === 'empCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }
    else if (name === 'empName' && !nameRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }


    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

      if (name === 'branch') {
        const selectedBranch = branchList.find((br) => br.branch === value);
        if (selectedBranch) {
          setFormData((prevData) => ({
            ...prevData,
            branch: value,
            branchCode: selectedBranch.branchCode
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            branch: value,
            branchCode: ''
          }));
        }
      } else if (type === 'checkbox') {
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
      } else if (type === 'text' || type === 'textarea') {
        const upperCaseValue = value.toUpperCase();
        setFormData((prevData) => ({ ...prevData, [name]: upperCaseValue }));

        setTimeout(() => {
          const inputElement = document.getElementsByName(name)[0];
          if (inputElement && inputElement.setSelectionRange) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
          }
        }, 0);
      } else {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      }
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const maxDate = dayjs().subtract(18, 'years');

  const handleClear = () => {
    setFormData({
      empCode: '',
      empName: '',
      gender: '',
      branch: '',
      branchCode: '',
      department: '',
      designation: '',
      dob: null,
      doj: null,
      active: true,
      email: '',
    });
    setFieldErrors({
      empCode: '',
      empName: '',
      gender: '',
      branch: '',
      branchCode: '',
      department: '',
      designation: '',
      dob: '',
      doj: '',
      email: ''
    });
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllEmployees = async () => {
    try {
      const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getEmployeeById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    getAllDepartmentByOrgId();
    getDesignationByOrgId();
    try {
      const response = await apiCalls('get', `master/employee/${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularEmp = response.paramObjectsMap.Employee;
        const selectedBranch = branchList.find((br) => br.branch === particularEmp.branch);
        console.log('THE SELECTED BRANCH IS:', selectedBranch);

        setFormData({
          empCode: particularEmp.employeeCode,
          empName: particularEmp.employeeName,
          gender: particularEmp.gender,
          department: particularEmp.department,
          designation: particularEmp.designation,
          branch: particularEmp.branch,
          branchCode: selectedBranch ? selectedBranch.branchCode : '', // Handle case where selectedBranch might be undefined
          dob: particularEmp.dateOfBirth,
          doj: particularEmp.joiningDate,
          active: particularEmp.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    getAllDepartmentByOrgId();
    getDesignationByOrgId();
  }, [])
  const getAllDepartmentByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/commonmaster/getDepartmentByOrgId?orgId=${orgId}`);
      setDepartment(result.paramObjectsMap.departmentVO || []);
    } catch (err) {
      console.log('error', err);
    }
  };
  const getDesignationByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/commonmaster/getDesignationByOrgId?orgId=${orgId}`);
      setDesignationList(result.paramObjectsMap.designationVO || []);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.empCode) {
      errors.empCode = 'Employee Code is required';
    }
    if (!formData.empName) {
      errors.empName = 'Employee Name is required';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    if (!formData.branch) {
      errors.branch = 'Branch is required';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.designation) {
      errors.designation = 'Designation is required';
    }
    if (!formData.dob) {
      errors.dob = 'Date of Birth is required';
    }
    if (!formData.doj) {
      errors.doj = 'Date of Joining is required';
    }
    if (!formData.email) errors.email = 'Email is required';

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        // active: formData.active,
        active: true,
        employeeCode: formData.empCode,
        employeeName: formData.empName,
        gender: formData.gender,
        branch: formData.branch,
        branchCode: formData.branchCode,
        department: formData.department,
        designation: formData.designation,
        dateOfBirth: formData.dob,
        joiningdate: formData.doj,
        orgId: orgId,
        createdBy: loginUserName
      };
      console.log('DATA TO SAVE', saveFormData);

      try {
        const response = await apiCalls('put', `master/createUpdateEmployee`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Employee Updated Successfully' : 'Employee created successfully');
          handleClear();
          getAllEmployees();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Employee creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Employee creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const listViewColumns = [
    { accessorKey: 'employeeCode', header: 'Emp Code', size: 140 },
    { accessorKey: 'employeeName', header: 'Employee', size: 140 },
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'department', header: 'department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    { accessorKey: 'joiningDate', header: 'Joining Date', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  return (
    <>
      <div>{/* <ToastContainer /> */}</div>
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
          <div>
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getEmployeeById} />
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
                  name="empCode"
                  value={formData.empCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.empCode}
                  helperText={fieldErrors.empCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="empName"
                  value={formData.empName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.empName}
                  helperText={fieldErrors.empName}
                />
              </div>

              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.gender}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select labelId="gender-label" label="Gender" value={formData.gender} onChange={handleInputChange} name="gender">
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                  </Select>
                  {fieldErrors.gender && <FormHelperText>{fieldErrors.gender}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branch}>
                  <InputLabel id="branch-label">Branch</InputLabel>
                  <Select labelId="branch-label" label="Branch" value={formData.branch} onChange={handleInputChange} name="branch">
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branch && <FormHelperText>{fieldErrors.branch}</FormHelperText>}
                </FormControl>
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.department}>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select labelId="department-label" label="Department" value={formData.department} onChange={handleInputChange} name="department">
                    <MenuItem value="department1">department1</MenuItem>
                    <MenuItem value="department2">department2</MenuItem>
                  </Select>
                  {fieldErrors.department && <FormHelperText>{fieldErrors.department}</FormHelperText>}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={departmentList}
                  getOptionLabel={(option) => option?.departmentName || ''}
                  sx={{ width: '100%' }}
                  // disabled={!!editId}
                  size="small"
                  value={departmentList.find((c) => c.departmentName === formData.department) || null}
                  onChange={(event, newValue) => {
                    console.log('Selected Value:', newValue);

                    if (newValue) {
                      setFormData({
                        ...formData,
                        department: newValue.departmentName,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        department: ''
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      name="department"
                      error={!!fieldErrors.department}
                      helperText={fieldErrors.department}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.designation}>
                  <InputLabel id="designation-label">Designation</InputLabel>
                  <Select
                    labelId="designation-label"
                    label="Designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    name="designation"
                  >
                    <MenuItem value="DESIGNATION1">DESIGNATION1</MenuItem>
                    <MenuItem value="DESIGNATION2">DESIGNATION2</MenuItem>
                  </Select>
                  {fieldErrors.designation && <FormHelperText>{fieldErrors.designation}</FormHelperText>}
                </FormControl>
              </div> */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  disablePortal
                  options={designationList}
                  getOptionLabel={(option) => option?.designationName || ''}
                  sx={{ width: '100%' }}
                  // disabled={!!editId}
                  size="small"
                  value={designationList.find((c) => c.designationName === formData.designation) || null}
                  onChange={(event, newValue) => {
                    console.log('Selected Value:', newValue);

                    if (newValue) {
                      setFormData({
                        ...formData,
                        designation: newValue.designationName,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        designation: ''
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Designation"
                      name="designation"
                      error={!!fieldErrors.designation}
                      helperText={fieldErrors.designation}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dob ? dayjs(formData.dob, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dob', date)}
                      maxDate={maxDate}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.dob}
                      helperText={fieldErrors.dob && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Join"
                      value={formData.doj ? dayjs(formData.doj, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('doj', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.doj}
                      helperText={fieldErrors.doj && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Email"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
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
      <ToastContainer />
    </>
  );
};

export default Employee;

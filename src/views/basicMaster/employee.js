import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Checkbox, FormControlLabel, TextField, Autocomplete, Button } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import ActionButton from 'utils/ActionButton';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, IconButton, Typography, LinearProgress, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CommonTable from 'views/basicMaster/CommonTable';
import FormControl from '@mui/material/FormControl';
// import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeeDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [data, setData] = useState([]);
  const [loginUserName, setLoginUserName] = useState(() => localStorage.getItem('userName') || '');
  const [empCode, setEmpCode] = useState(() => localStorage.getItem('employeeCode') || '');
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const mobileRegex = /^[6-9]\d{9}$/;
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxDate = dayjs().subtract(18, 'years');
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeCode: '',
    // employeeName:'',
    employeeAddress: '',
    branch: '',
    gender: '',
    email: '',
    dob: null,
    mobileNo: '',
    department: '',
    designation: '',
    doj: null,
    active: true,
    company: '',
    fatherName: '',
    motherName: '',
    martialStatus: '',
    region: '',
    age: '',
    finYear: localStorage.getItem('finYear') || '',
    assignedUserName: '',
    reportingTo: '',
    branchCode: localStorage.getItem('branchcode') || ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    employeeCode: '',
    employeeName: '',
    branch: '',
    gender: '',
    email: '',
    dob: '',
    mobileNo: '',
    department: '',
    designation: '',
    doj: '',
    company: ''
  });

  const genderList = [
    { label: 'MALE', value: 'MALE' },
    { label: 'FEMALE', value: 'FEMALE' }
  ];

  const martialStatusList = [
    { label: 'Single', value: 'SINGLE' },
    { label: 'Married', value: 'MARRIED' },
    { label: 'Divorced', value: 'DIVORCED' },
    { label: 'Widowed', value: 'WIDOWED' }
  ];

  useEffect(() => {
    getAllBranches();
    getAllEmployees();
    getAllDesignation();
    getAllDepartment();
    getAllCompanies();
    getAllAssignedUsers();
    getAllRegions();
  }, []);

  const calculateAge = (dob) => {
    const birthDate = dayjs(dob);
    const today = dayjs();
    return today.diff(birthDate, 'year');
  };

  const getAllRegions = async () => {
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    try {
      const response = await apiCalls('get', `/master/getRegionName?orgId=${orgId}`);
      if (response?.status === true) {
        setRegionList(response.paramObjectsMap?.regionName || []);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegionList([]);
    }
  };

  const getAllBranches = async () => {
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData || []);
    } catch (error) {
      console.error('Error fetching branch data:', error);
      setBranchList([]);
    }
  };

  const getAllCompanies = async () => {
    try {
      const response = await apiCalls('get', '/master/getCompanyName');
      if (response?.status === true) {
        setCompanyList(response.paramObjectsMap?.companyName || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanyList([]);
    }
  };

  const getAllDesignation = async () => {
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    try {
      const response = await apiCalls('get', `/master/getDesignationName?orgId=${orgId}`);
      if (response?.status === true) {
        setDesignationList(response.paramObjectsMap?.designationName || []);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignationList([]);
    }
  };

  const getAllDepartment = async () => {
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    try {
      const response = await apiCalls('get', `/master/getDepartmentName?orgId=${orgId}`);
      if (response?.status === true) {
        setDepartmentList(response.paramObjectsMap?.departmentName || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartmentList([]);
    }
  };

  const getAllEmployees = async () => {
    try {
      setLoading(true);
      const orgId = parseInt(localStorage.getItem('orgId')) || 0;
      const branchCode = localStorage.getItem('branchcode') || '';
      const finYear = localStorage.getItem('finYear') || '';

      const response = await apiCalls(
        'get',
        `/master/getAllEmployeeByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response?.status === true) {
        setListViewData(response.paramObjectsMap?.employeeVO || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setListViewData([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllAssignedUsers = async () => {
    const orgId = parseInt(localStorage.getItem('orgId')) || 0;
    try {
      const response = await apiCalls('get', `/master/getUserNameAndAssigned?orgId=${orgId}`);
      if (response?.status === true) {
        setAssignedUsers(response.paramObjectsMap?.userName || []);
      } else {
        setAssignedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      setAssignedUsers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    let errorMessage = '';
    let inputValue = value;

    if (type === 'checkbox') {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
      return;
    }

    if (name === 'mobileNo') {
      if (value && !mobileRegex.test(value)) {
        errorMessage = 'Invalid Mobile Number';
      }
      inputValue = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name === 'email') {
      inputValue = value.toLowerCase();
    }

    setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

    if (name === 'branch') {
      const selectedBranch = branchList.find((br) => br.branch === value);
      setFormData((prevData) => ({
        ...prevData,
        branch: value,
        branchCode: selectedBranch ? selectedBranch.branchCode : ''
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      employeeCode: '',
      employeeName: '',
      employeeAddress: '',
      branch: '',
      gender: '',
      email: '',
      dob: null,
      mobileNo: '',
      department: '',
      designation: '',
      doj: null,
      active: true,
      company: '',
      fatherName: '',
      motherName: '',
      martialStatus: '',
      region: '',
      age: '',
      finYear: localStorage.getItem('finYear') || '',
      assignedUserName: '',
      reportingTo: '',
      branchCode: localStorage.getItem('branchcode') || ''
    });
    setFieldErrors({});
    setEditId('');
    setLogo(null);
    setIsViewMode(false);
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;

    if (field === 'dob' && date) {
      const age = calculateAge(date);
      setFormData(prevData => ({
        ...prevData,
        [field]: formattedDate,
        age: age.toString()
      }));
    } else {
      setFormData(prevData => ({ ...prevData, [field]: formattedDate }));
    }
  };

  const handleSave = async () => {
    const errors = {};

    if (!formData.firstName) errors.firstName = 'First Name is required';
    if (!formData.lastName) errors.lastName = 'Last Name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.dob) errors.dob = 'Date of Birth is required';
    if (!formData.mobileNo) errors.mobileNo = 'Mobile No is required';
    if (!formData.doj) errors.doj = 'Date of Join is required';
    if (!formData.designation) errors.designation = 'Designation is required';
    if (!formData.company) errors.company = 'Company is required';

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        address: formData.employeeAddress,
        branch: formData.branch,
        branchCode: formData.branchCode || localStorage.getItem('branchcode') || '',
        finYear: formData.finYear || localStorage.getItem('finYear') || '',
        company: formData.company,
        createdBy: loginUserName,
        dateOfBirth: formData.dob,
        department: formData.department,
        designation: formData.designation,
        email: formData.email,
        employeeCode: formData.employeeCode,
        employeeName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        fatherName: formData.fatherName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        joiningDate: formData.doj,
        mobileNumber: formData.mobileNo,
        motherName: formData.motherName,
        orgId: parseInt(localStorage.getItem('orgId')) || 0,
        region: formData.region,
        martialStatus: formData.martialStatus,
        age: parseInt(formData.age) || 0,
        assignedUserName: formData.assignedUserName,
        reportingTo: formData.reportingTo,
        cancelRemark: null,
      };

      try {
        const endpoint = editId ? '/master/createUpdateEmployee' : '/master/createUpdateEmployee';
        const response = await apiCalls('put', endpoint, saveFormData);
        if (response?.status === true) {
          toast.success(editId ? 'Employee updated successfully' : 'Employee created successfully');
          handleClear();
          getAllEmployees();
          setShowForm(false);
        } else {
          toast.error(response?.paramObjectsMap?.errorMessage || 'Operation failed');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Operation failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getEmployeeDetailsById = async (row) => {
    setIsViewMode(true);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/master/employee/${row.original.id}`);

      if (result?.paramObjectsMap?.Employee) {
        const employee = result.paramObjectsMap.Employee;
        setEditId(employee.id);

        setFormData({
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          employeeCode: employee.employeeCode || '',
          // employeeName:employee.employeeName || '',
          employeeAddress: employee.address || '',
          branch: employee.branch || '',
          gender: employee.gender || '',
          email: employee.email || '',
          dob: employee.dateOfBirth || '',
          mobileNo: employee.mobileNumber || '',
          department: employee.department || '',
          designation: employee.designation || '',
          doj: employee.joiningDate || '',
          active: employee.active === 'Active' || employee.active === true,
          company: employee.company || '',
          fatherName: employee.fatherName || '',
          motherName: employee.motherName || '',
          martialStatus: employee.martialStatus || '',
          region: employee.region || '',
          age: employee.age?.toString() || '',
          assignedUserName: employee.assignedUserName || '',
          reportingTo: employee.reportingTo || '',
          finYear: employee.finYear || localStorage.getItem('finYear') || '',
          branchCode: employee.branchCode || localStorage.getItem('branchcode') || '',
          id: employee.id || 0
        });

        setLogo(employee.passportphoto || null);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
    if (!showForm) {
      handleClear();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      toast.error('Please upload a valid image (PNG or JPEG).');
    }
  };

  const handleDownloadPDF = () => {
    if (listViewData.length === 0) {
      toast.warning('No data available to download');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape'
    });

    doc.setProperties({
      title: 'Employee Details Report',
      subject: 'Employee Information',
      author: 'Your Organization',
      keywords: 'employee, details, report',
      creator: 'Your Application'
    });

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('EMPLOYEE DETAILS REPORT', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    const tableData = listViewData.map((employee, index) => [
      index + 1,
      employee.employeeCode || '-',
      `${employee.firstName || ''} ${employee.lastName || ''}`,
      employee.branch || '-',
      employee.joiningDate || '-',
      employee.department || '-',
      employee.designation || '-',
      employee.active ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: [['S.No', 'Code', 'Employee', 'Branch', 'Date of Join', 'Department', 'Designation', 'Status']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [103, 58, 183],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 25, left: 5, right: 5 },
      tableWidth: 'auto'
    });

    doc.save(`Employee_Details_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns = [
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    {
      accessorKey: 'employee',
      header: 'Name',
      size: 140,
      Cell: ({ row }) => (
        <span
          style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => getEmployeeDetailsById(row)}
        >
          {`${row.original.employeeName || ''}`}
        </span>
      )
    },
    { accessorKey: 'joiningDate', header: 'Date of Join', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    {
      accessorKey: 'active',
      header: 'Active',
      size: 140,
      Cell: ({ row }) => (
        <span style={{ color: row.original.active ? 'green' : 'red', fontWeight: 500 }}>
          {row.original.active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} />
          {!showForm && (
            <ActionButton
              title="Download PDF"
              icon={PictureAsPdfIcon}
              onClick={handleDownloadPDF}
              isLoading={isLoading}
              margin="0 10px 0 10px"
            />
          )}
        </div>

        {showForm ? (
          <>
            <div className="row">
              <h5 className="mb-4">Employee Details</h5>

              {/* Employee Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                />
              </div>

              {/* Company */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={companyList}
                  getOptionLabel={(option) => option.companyName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={companyList.find((c) => c.companyName === formData.company) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'company',
                        value: newValue ? newValue.companyName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      // {...params}
                      // label="Company *"
                      {...params}
                      label={
                        <span>
                          Company <span className="asterisk">*</span>
                        </span>
                      }
                      name="company"
                      error={Boolean(fieldErrors.company)}
                      helperText={fieldErrors.company || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Branch */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={branchList}
                  getOptionLabel={(option) => option.branch || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={branchList.find((c) => c.branch === formData.branch) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'branch',
                        value: newValue ? newValue.branch : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // label="Branch *"
                      label={
                        <span>
                          Branch <span className="asterisk">*</span>
                        </span>
                      }
                      name="branch"
                      error={Boolean(fieldErrors.branch)}
                      helperText={fieldErrors.branch || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* First Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  // label="First Name *"
                  label={
                    <span>
                      First Name <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
                />
              </div>

              {/* Last Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  // label="Last Name *"
                  label={
                    <span>
                      Last Name <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                />
              </div>

              {/* <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Name"
                  variant="outlined"
                  size="small"
                  name='employeeName'
                  fullWidth
                  value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim()}
                  disabled
                  InputProps={{
                    style: { color: 'rgba(0, 0, 0, 0.87)' } 
                  }}
                />
              </div> */}

              {/* Father's Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  // label="Father's Name"
                  label={
                    <span>
                      Father's Name <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Mother's Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mother's Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Date of Birth */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      // label="Date of Birth *"
                      label={
                        <span>
                          Date of Birth <span className="asterisk">*</span>
                        </span>
                      }
                      value={formData.dob ? dayjs(formData.dob, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dob', date)}
                      maxDate={maxDate}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.dob,
                          helperText: fieldErrors.dob
                        }
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Age */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Age"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: 3
                  }}
                />
              </div>

              {/* Gender */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={genderList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: '100%' }}
                  size="small"
                  value={genderList.find((c) => c.value === formData.gender) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'gender',
                        value: newValue ? newValue.value : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // label="Gender *"
                      label={
                        <span>
                          Gender <span className="asterisk">*</span>
                        </span>
                      }
                      name="gender"
                      error={Boolean(fieldErrors.gender)}
                      helperText={fieldErrors.gender || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Martial Status */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={martialStatusList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: '100%' }}
                  size="small"
                  value={martialStatusList.find((c) => c.value === formData.martialStatus) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'martialStatus',
                        value: newValue ? newValue.value : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Martial Status"
                      name="martialStatus"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Email */}
              <div className="col-md-3 mb-3">
                <TextField
                  // label="Email *"
                  label={
                    <span>
                      Email <span className="asterisk">*</span>
                    </span>
                  }
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

              {/* Mobile Number */}
              <div className="col-md-3 mb-3">
                <TextField
                  // label="Mobile No *"
                  label={
                    <span>
                      Mobile No <span className="asterisk">*</span>
                    </span>
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNo}
                  helperText={fieldErrors.mobileNo}
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric'
                  }}
                />
              </div>

              {/* DOJ */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      // label="Date of Join *"
                      label={
                        <span>
                          Date of Join <span className="asterisk">*</span>
                        </span>
                      }
                      value={formData.doj ? dayjs(formData.doj, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('doj', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!fieldErrors.doj,
                          helperText: fieldErrors.doj
                        }
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Region */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={regionList}
                  getOptionLabel={(option) => option.regionName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={regionList.find((r) => r.regionName === formData.region) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'region',
                        value: newValue ? newValue.regionName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Region"
                      name="region"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Department */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={departmentList}
                  getOptionLabel={(option) => option.departmentName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={departmentList.find((c) => c.departmentName === formData.department) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'department',
                        value: newValue ? newValue.departmentName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      name="department"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Designation */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={designationList}
                  getOptionLabel={(option) => option.designationName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={designationList.find((c) => c.designationName === formData.designation) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'designation',
                        value: newValue ? newValue.designationName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // label="Designation *"
                      label={
                        <span>
                          Designation <span className="asterisk">*</span>
                        </span>
                      }
                      name="designation"
                      error={Boolean(fieldErrors.designation)}
                      helperText={fieldErrors.designation || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Employee Address */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Employee Address"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  name="employeeAddress"
                  value={formData.employeeAddress}
                  onChange={handleInputChange}
                />
              </div>

              {/* Assigned User */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={assignedUsers}
                  getOptionLabel={(option) => option.userName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={assignedUsers.find((u) => u.userName === formData.assignedUserName) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'assignedUserName',
                        value: newValue ? newValue.userName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned User"
                      name="assignedUserName"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Reporting To */}
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={assignedUsers}
                  getOptionLabel={(option) => option.userName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={assignedUsers.find((u) => u.userName === formData.reportingTo) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'reportingTo',
                        value: newValue ? newValue.userName : ''
                      }
                    })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting To"
                      name="reportingTo"
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-md-3 mb-3">
                <input
                  accept="image/*"
                  id="image-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: logo ? 1 : 0
                    }}
                  >
                    <label htmlFor="image-upload" style={{ flex: 1 }}>
                      <Button
                        variant="contained"
                        component="span"
                        size="small"
                        startIcon={<CloudUploadIcon fontSize="small" />}
                        disabled={isLoading}
                        fullWidth
                        sx={{
                          py: 0.5,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 'none' }
                        }}
                      >
                        {isLoading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </label>
                    {logo && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setLogo(null)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'error.main',
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {logo && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 0.75,
                        backgroundColor: 'action.hover',
                        borderRadius: 0.5,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      <ImageIcon color="primary" fontSize="small" />
                      <Typography
                        variant="caption"
                        sx={{
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {typeof logo === 'string' ? 'Profile Image' : logo.name}
                      </Typography>
                    </Box>
                  )}
                  {isLoading && <LinearProgress sx={{ height: 2, mt: 1 }} />}
                </Box>
              </div>

              {/* Active */}
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(formData.active)}
                      onChange={handleInputChange}
                      name="active"
                    />
                  }
                  label="Active"
                />
              </div>
            </div>
          </>
        ) : loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50px' }}>
            <CircularProgress />
          </div>
        ) : (
          <CommonTable
            data={listViewData}
            columns={columns}
            blockEdit={true}
            toEdit={getEmployeeDetailsById}
            enableEditing={false}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { Checkbox, FormControl, Avatar, FormControlLabel, Dialog, DialogContent, TextField, Autocomplete, Button } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import ActionButton from 'utils/ActionButton';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { showToast } from 'utils/toast-component';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinearProgress from '@mui/material/LinearProgress';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const EmployeeDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [editId, setEditId] = useState();
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [allReportingPerson, setAllReportingPerson] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxDate = dayjs().subtract(18, 'years');
  const [isViewMode, setIsViewMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    employeeCode: '',
    active: true,
    address: '',
    bloodGroup: '',
    branchCode: '',
    branchName: '',
    dateOfBirth: null,
    department: '',
    designation: '',
    email: '',
    emergencyMobileNumber: '',
    employeeName: '',
    gender: '',
    joiningDate: null,
    mobileNumber: '',
    panNo: '',
    reportingDesignation: '',
    reportingPerson: '',
    reportingPersonCode: '',
    team: '',
    uanNo: '',
    roleName: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    aadhaarNumber: '',
    employeeCode: '',
    active: true,
    address: '',
    bloodGroup: '',
    branchCode: '',
    branchName: '',
    dateOfBirth: null,
    department: '',
    designation: '',
    email: '',
    emergencyMobileNumber: '',
    employeeName: '',
    gender: '',
    joiningDate: null,
    mobileNumber: '',
    panNo: '',
    reportingDesignation: '',
    reportingPerson: '',
    reportingPersonCode: '',
    team: '',
    uanNo: '',
    roleName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const handleRemoveLogo = () => setLogo(null);
  const genderList = [
    { label: 'MALE', value: 'MALE' },
    { label: 'FEMALE', value: 'FEMALE' }
  ];
  const columns = [
    // {
    //   accessorKey: 'employee',
    //   header: 'Employee',
    //   size: 140,
    //   Cell: ({ row }) => (
    //     <span style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => getEmployeeDetailsById(row)}>
    //       {row.original.employee}
    //     </span>
    //   )
    // },
    { accessorKey: 'employeeName', header: 'Employee', size: 140 },
    { accessorKey: 'employeeCode', header: 'Code', size: 140 },
    { accessorKey: 'joiningDate', header: 'Date of Join', size: 140 },
    { accessorKey: 'department', header: 'Department', size: 140 },
    { accessorKey: 'designation', header: 'Designation', size: 140 },
    {
      accessorKey: 'active',
      header: 'Active',
      size: 140,
      Cell: ({ row }) => (
        <span style={{ color: row.original.active ? 'green' : 'red', fontWeight: 500 }}>{row.original.active ? 'Active' : 'Inactive'}</span>
      )
    }
  ];

  useEffect(() => {
    getAllBranches();
    getAllEmployees();
    getAllDesignation();
    getAllDepartment();
    getAllReportingPerson();
    getEmployeeCode();
  }, []);
  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllDesignation = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getDesignationByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDesignationList(response.paramObjectsMap.designationVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllDepartment = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setDepartmentList(response.paramObjectsMap.departmentVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getAllEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiCalls('get', `/master/getAllEmployeeByOrgId?branchCode=${branchCode}&orgId=${orgId}`);
      if (response.status === true) {
        setListViewData(response.paramObjectsMap.employeeVO);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const getAllReportingPerson = async () => {
    try {
      const response = await apiCalls('get', `master/getReportingNameForEmployee?orgId=${orgId}&branchCode=${branchCode}`);
      if (response.status === true) {
        setAllReportingPerson(response.paramObjectsMap.employeeVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, checked, type, selectionStart, selectionEnd } = e.target;

    // Regex
    const codeRegex = /^[a-zA-Z0-9#_\-/\\ ]*$/;
    const aadhaarRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const accountRegex = /^\d{9,18}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    let errorMessage = '';
    let inputValue = value;

    // ✅ Handle checkbox separately
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    // ✅ Sanitize input before validation
    switch (name) {
      case 'aadhaarNumber':
      case 'accountNo':
      case 'mobileNumber':
      case 'altMobileNo':
      case 'uanNo':
        inputValue = value.replace(/\D/g, ''); // keep only digits
        break;

      case 'panNo':
      case 'ifscCode':
        inputValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        break;

      default:
        break;
    }

    // ✅ Validation rules
    if (name === 'aadhaarNumber') {
      if (inputValue.length === 12 && !aadhaarRegex.test(inputValue)) {
        errorMessage = 'Aadhaar must be 12 digits';
      }
    }

    if (name === 'panNo') {
      if (inputValue.length === 10 && !panRegex.test(inputValue)) {
        errorMessage = 'Invalid PAN format (e.g., ABCDE1234F)';
      }
    }

    if (name === 'accountNo') {
      if (inputValue.length > 0 && !accountRegex.test(inputValue)) {
        errorMessage = 'Account must be 9–18 digits';
      }
    }

    if (name === 'ifscCode') {
      if (inputValue.length === 11 && !ifscRegex.test(inputValue)) {
        errorMessage = 'Invalid IFSC format (e.g., SBIN0123456)';
      }
    }

    if (name === 'mobileNumber' || name === 'altMobileNo') {
      if (inputValue.length === 10 && !mobileRegex.test(inputValue)) {
        errorMessage = 'Invalid Mobile Number';
      }
    }

    if (name === 'uanNo') {
      if (inputValue.length > 12) {
        inputValue = inputValue.slice(0, 12);
        errorMessage = 'UAN cannot exceed 12 digits';
      }
    }

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    if (name === 'employeeCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    }

    // ✅ Always update formData (even if error exists)
    if (name === 'email') {
      inputValue = value.toLowerCase();
    } else if (type === 'text' || type === 'textarea') {
      inputValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: inputValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));

    // ✅ Branch special handling
    if (name === 'branchName') {
      const selectedBranch = branchList.find((br) => br.branch === value);
      setFormData((prev) => ({
        ...prev,
        branchName: value,
        branchCode: selectedBranch ? selectedBranch.branchCode : ''
      }));
    }

    // ✅ Reporting Person auto-fill
    // if (name === 'reportingPerson') {
    //   const selectedEmployee = allReportingPerson.find((emp) => emp.employeeName === value);
    //   setFormData((prev) => ({
    //     ...prev,
    //     reportingPerson: value,
    //     reportingDesignation: selectedEmployee?.role || selectedEmployee?.designation || ''
    //   }));
    // }

    // ✅ Keep cursor position
    if (type === 'text' || type === 'textarea') {
      setTimeout(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement?.setSelectionRange) {
          inputElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  };
  const handleClear = () => {
    getEmployeeCode();
    setFormData({
      aadhaarNumber: '',
      employeeCode: '',
      active: true,
      address: '',
      bloodGroup: '',
      branchCode: '',
      branchName: '',
      dateOfBirth: null,
      department: '',
      designation: '',
      email: '',
      emergencyMobileNumber: '',
      employeeName: '',
      gender: '',
      joiningDate: null,
      mobileNumber: '',
      panNo: '',
      reportingDesignation: '',
      reportingPerson: '',
      reportingPersonCode: '',
      team: '',
      uanNo: '',
      roleName: ''
    });
    setFieldErrors({});
    setEditId('');
    setLogo(null);
    setIsViewMode(false);
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const handleSave = async () => {
    console.log('THE HANDLE SAVE IS WORKING');

    const errors = {};
    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.branchName) errors.branchName = 'Branch is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of Birth is required';
    if (!formData.mobileNumber) errors.mobileNumber = 'Mobile No is required';
    if (!formData.aadhaarNumber) errors.aadhaarNumber = 'Aadhaar Number is required';
    if (!formData.panNo) errors.panNo = 'Pan Number is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of Join is required';
    if (!formData.designation) errors.designation = 'Designation is required';

    setFieldErrors(errors);
    console.log('handlesave errors', errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        aadhaarNumber: formData.aadhaarNumber,
        active: formData.active,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        branch: branch,
        branchCode: branchCode,
        branchName: formData.branchName,
        createdBy: loginUserName,
        department: formData.department,
        dateOfBirth: formData.dateOfBirth ? dayjs(formData.dateOfBirth).format('YYYY-MM-DD') : null,
        joiningDate: formData.joiningDate ? dayjs(formData.joiningDate).format('YYYY-MM-DD') : null,
        designation: formData.designation,
        email: formData.email,
        emergencyMobileNumber: formData.emergencyMobileNumber,
        employeeName: formData.employeeName,
        finYear: finYear,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber,
        orgId: orgId,
        panNo: formData.panNo,
        reportingDesignation: formData.reportingDesignation,
        reportingPerson: formData.reportingPerson,
        reportingPersonCode: formData.reportingPersonCode,
        team: formData.team,
        uanNo: formData.uanNo,
        roleName: formData.roleName,
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', '/master/createUpdateEmployee', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Employee Details updated successfully' : 'Employee Details created successfully');
          handleClear();
          getAllEmployees();
          const generatedId = response.paramObjectsMap.employeeVO.id;
          if (generatedId && typeof logo === 'object') {
            handleImageUpload(generatedId);
          } else {
            setLogo(null);
          }
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Employee Details creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Employee Details creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };
  const getEmployeeDetailsById = async (row) => {
    console.log('Fetching employee details for:', row);
    setIsViewMode(true);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/master/employee/${row.original.id}`);

      if (result) {
        const employeeDetailsVO = result.paramObjectsMap.Employee;
        setEditId(row.original.id);
        setFormData({
          employeeName: employeeDetailsVO.employeeName || '',
          employeeCode: employeeDetailsVO.employeeCode || '',
          address: employeeDetailsVO.address || '',
          branchName: employeeDetailsVO.branchName || '',
          gender: employeeDetailsVO.gender,
          email: employeeDetailsVO.email || '',
          joiningDate: employeeDetailsVO.joiningDate || '',
          resignationDate: employeeDetailsVO.resignDate || '',
          grade: employeeDetailsVO.grade || '',
          team: employeeDetailsVO.team || '',
          department: employeeDetailsVO.department || '',
          designation: employeeDetailsVO.designation || '',
          uanNo: employeeDetailsVO.uanNo || '',
          reportingPerson: employeeDetailsVO.reportingPerson || '',
          reportingPersonCode: employeeDetailsVO.reportingPersonCode || '',
          reportingDesignation: employeeDetailsVO.reportingDesignation || '',
          dateOfBirth: employeeDetailsVO.dateOfBirth || '',
          bloodGroup: employeeDetailsVO.bloodGroup || '',
          mobileNumber: employeeDetailsVO.mobileNumber || '',
          emergencyMobileNumber: employeeDetailsVO.emergencyMobileNumber || '',
          aadhaarNumber: employeeDetailsVO.aadhaarNumber || '',
          panNo: employeeDetailsVO.panNo || '',
          accountNo: employeeDetailsVO.accountNo || '',
          bankName: employeeDetailsVO.bankName || '',
          ifscCode: employeeDetailsVO.ifscCode || '',
          active: employeeDetailsVO.active === 'Active' ? true : false,
          id: employeeDetailsVO.id || '',
          roleName: employeeDetailsVO.roleName || '',
        });
        // const profileImageBlob = result.paramObjectsMap.Employee.profileImage;
        setLogo(result.paramObjectsMap.Employee.passportphoto);

        // if (employeeCode) {
        //   await getAllReportingPerson(employeeCode);
        // }

        console.log('DataToEdit', employeeDetailsVO);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
  };
  const getEmployeeCode = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/master/getEmployeeDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prev) => ({
        ...prev,
        employeeCode: response.paramObjectsMap.employeeDocId
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const handleImageUpload = async (id) => {
    if (!logo) {
      console.error('No image found');
      return;
    }
    console.log('ID:', id);
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', logo); // Append the actual file

      console.log('Test==>', logo);

      const uploadResponse = await apiCalls(
        'post',
        `/master/uploadEmployeePhotoInBloob?id=${id}`,
        formDataToSend,
        {},
        { 'Content-Type': 'multipart/form-data' } // Ensure proper headers
      );

      console.log('Upload Response:', uploadResponse); // Debugging

      if (uploadResponse?.status === true) {
        setFormData((prev) => ({
          ...prev,
          profileImage: uploadResponse.paramObjectsMap?.imagePath || uploadResponse.imageUrl
        }));
        // showToast("success", "Profile image uploaded successfully");
      } else {
        showToast('error', uploadResponse?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('error', error.response?.data?.message || 'Error uploading image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape' // Landscape for better table layout
    });

    doc.setProperties({
      title: 'Employee Details Report',
      subject: 'Employee Information',
      author: 'Your Organization Name',
      keywords: 'employee, details, report',
      creator: 'Your Application Name'
    });

    // Report Title
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('EMPLOYEE DETAILS REPORT', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    // Prepare table data
    const tableData = listViewData.map((employee, index) => [
      index + 1,
      employee.employeeCode,
      employee.employeeName,
      employee.branch,
      employee.joiningDate,
      employee.grade,
      employee.team,
      employee.department,
      employee.designation,
      employee.active ? 'Active' : 'Inactive'
    ]);

    // Auto Table
    doc.autoTable({
      head: [['#', 'Employee Name', 'Employee Code', 'Branch', 'Date of Join', 'Grade', 'Team', 'Department', 'Designation', 'Status']],
      body: tableData,
      startY: 40, // Positioning below title
      theme: 'grid', // Uses full-page width
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [103, 58, 183], // Purple header background
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Light gray alternate row
      },
      margin: { top: 40, left: 5, right: 5 }, // Expands to fill the page
      tableWidth: 'auto', // Adjusts width dynamically
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
    });

    // Save the PDF
    doc.save(`Employee_Details_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl mb-3" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
          {!showForm && (
            <>
              <ActionButton title="New Entry" icon={AddIcon} onClick={handleList} />
              <ActionButton
                title="Download PDF"
                icon={PictureAsPdfIcon} // Fixed: passing the component directly
                onClick={handleDownloadPDF}
                isLoading={isLoading}
                margin="0 10px 0 10px"
              />
            </>
          )}
          {showForm && (
            <>
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
            </>
          )}
        </div>

        {showForm ? (
          <>
            <div className="row">
              <h5 className="mb-4">Employee Details</h5>

              {/* Employee Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeeName}
                  helperText={fieldErrors.employeeName}
                // disabled={isViewMode}
                />
              </div>

              {/* Employee Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.employeeCode}
                  helperText={fieldErrors.employeeCode}
                  disabled
                />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={branchList}
                  getOptionLabel={(option) => option.branch || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={branchList.find((c) => c.branch === formData.branchName) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({
                      target: {
                        name: 'branchName',
                        value: newValue ? newValue.branch : ''
                      }
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Branch"
                      name="branchName"
                      error={Boolean(fieldErrors.branchName)}
                      helperText={fieldErrors.branchName || ''}
                    />
                  )}
                />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={genderList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: '100%' }}
                  size="small"
                  value={genderList.find((c) => c.value === formData.gender) || null}
                  onChange={(event, newValue) => handleInputChange({ target: { name: 'gender', value: newValue ? newValue.value : '' } })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Gender"
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

              {/* Email */}
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

              {/* joiningDate */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Join"
                      value={formData.joiningDate ? dayjs(formData.joiningDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('joiningDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.joiningDate}
                      helperText={fieldErrors.joiningDate && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Team"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={departmentList}
                  getOptionLabel={(option) => option.departmentName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={departmentList.find((c) => c.departmentName === formData.department) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({ target: { name: 'department', value: newValue ? newValue.departmentName : '' } })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      name="department"
                      // error={Boolean(fieldErrors.department)}
                      // helperText={fieldErrors.department || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={designationList}
                  getOptionLabel={(option) => option.designationName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={designationList.find((c) => c.designationName === formData.designation) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({ target: { name: 'designation', value: newValue ? newValue.designationName : '' } })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Designation"
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
              <div className="col-md-3 mb-3">
                <TextField
                  label="Role"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.roleName}
                  helperText={fieldErrors.roleName}
                />
              </div>
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={allReportingPerson || []}
                  getOptionLabel={(option) =>
                    option?.employeeCode && option?.employeeName
                      ? `${option.employeeCode} - ${option.employeeName}`
                      : ''
                  }
                  value={
                    allReportingPerson.find(
                      (item) => item.employeeCode === formData.reportingPersonCode
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        reportingPerson: newValue.employeeName || '',
                        reportingPersonCode: newValue.employeeCode || '',
                        reportingDesignation: newValue.role || '', // ✅ auto-fill designation from API
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        reportingPerson: '',
                        reportingPersonCode: '',
                        reportingDesignation: '',
                      }));
                    }
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.employeeCode === value.employeeCode
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Person"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </div>
              {/* <div className="col-md-3 mb-3">
                <Autocomplete
                  options={allReportingPerson}
                  getOptionLabel={(option) => option.employeeName || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={allReportingPerson.find((c) => c.employeeName === formData.reportingPerson) || null}
                  onChange={(event, newValue) =>
                    handleInputChange({ target: { name: 'reportingPerson', value: newValue ? newValue.employeeName : '' } })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Person"
                      name="reportingPerson"
                      error={Boolean(fieldErrors.reportingPerson)}
                      helperText={fieldErrors.reportingPerson || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div> */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Reporting Designation"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="reportingDesignation"
                  value={formData.reportingDesignation}
                  onChange={handleInputChange}
                  error={!!fieldErrors.reportingDesignation}
                  helperText={fieldErrors.reportingDesignation}
                  disabled
                  InputLabelProps={{ shrink: true }}
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
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-md-3 mb-3">
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    multiline
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      color: '#374151',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: '#374151',
                        backgroundColor: 'rgba(193, 86, 255, 0.08)' // light hover effect
                      }
                    }}
                  >
                    {logo ? (typeof logo === 'object' && logo.name ? logo.name : '') : 'Emp Img'}

                    <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                  </Button>

                  {logo && (
                    <IconButton
                      variant="contained"
                      sx={{
                        whiteSpace: 'nowrap',
                        color: '#374151'
                      }}
                      onClick={handleOpen}
                    >
                      <ControlCameraIcon />
                    </IconButton>
                  )}
                </Box>
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                  <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        whiteSpace: 'nowrap',
                        color: '#374151'
                      }}
                    >
                      Emp Img
                    </Typography>
                    {logo ? (
                      <Box>
                        <Avatar
                          src={typeof logo === 'object' ? URL.createObjectURL(logo) : `data:image/jpeg;base64,${logo}`}
                          alt="Emp Img"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            borderRadius: 2,
                            backgroundColor: 'transparent'
                          }}
                        />
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleRemoveLogo}
                          >
                            Delete
                          </IconButton>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '13px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Avatar sx={{ width: 150, height: 150, bgcolor: '#F0F0F0', borderRadius: 2 }}>
                          <Typography variant="caption">Emp Img</Typography>
                        </Avatar>
                        <Box display="flex" gap={2} mt={2}>
                          <IconButton
                            variant="contained"
                            sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)', fontSize: '15px' }}
                            onClick={handleClose}
                          >
                            Close
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <h5 className="mb-4 mt-2">Personal Details</h5>

              {/* Date of Birth */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dateOfBirth ? dayjs(formData.dateOfBirth, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('dateOfBirth', date)}
                      maxDate={maxDate}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                      error={fieldErrors.dateOfBirth}
                      helperText={fieldErrors.dateOfBirth && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              {/* Blood Group */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Blood Group"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  error={!!fieldErrors.bloodGroup}
                  helperText={fieldErrors.bloodGroup}
                />
              </div>

              {/* Mobile Number */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  error={!!fieldErrors.mobileNumber}
                  helperText={fieldErrors.mobileNumber}
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric'
                  }}
                />
              </div>

              {/* Alternative Mobile No */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Emergency Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="emergencyMobileNumber"
                  value={formData.emergencyMobileNumber}
                  onChange={handleInputChange}
                  error={!!fieldErrors.emergencyMobileNumber}
                  helperText={fieldErrors.emergencyMobileNumber}
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric'
                  }}
                />
              </div>

              {/* Aadhaar Number */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Aadhaar No"
                  variant="outlined"
                  size="small"
                  // type='number'
                  fullWidth
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  error={!!fieldErrors.aadhaarNumber}
                  helperText={fieldErrors.aadhaarNumber}
                  inputProps={{
                    maxLength: 12
                  }}
                />
              </div>

              {/* Pan Number */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="PAN No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="panNo"
                  value={formData.panNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.panNo}
                  helperText={fieldErrors.panNo || 'Format: ABCDE1234F'}
                  inputProps={{
                    maxLength: 10,
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="UAN No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="uanNo"
                  inputProps={{ maxLength: 12 }}
                  value={formData.uanNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.uanNo}
                  helperText={fieldErrors.uanNo}
                />
              </div>

              {/* Active */}
              <div className="col-md-3 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
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
          <CommonListViewTable
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

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { Checkbox, FormControl, FormControlLabel, FormGroup, TextField, Autocomplete, Button } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ActionButton from 'utils/ActionButton';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { showToast } from 'utils/toast-component';
import { mobileModel } from 'react-device-detect';
import { useTheme } from '@mui/material/styles';
import { InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
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
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import CommonTable from 'views/basicMaster/CommonTable';

const EmployeeDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [empCode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState();
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  // const [roleList, setRoleList] = useState([]);
  const [allleaveType, setAllLeaveType] = useState([]);
  const [allReportingPerson, setAllReportingPerson] = useState([]);
  const aadhaarRegex = /^\d{12}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  const accountRegex = /^\d{9,18}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [listViewData, setListViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxDate = dayjs().subtract(18, 'years');
  const navigate = useNavigate();
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeCode: '',
    employeeAddress: '',
    branch: '',
    gender: '',
    email: '',
    dob: null,
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    bankName: '',
    ifscCode: '',
    doj: null,
    resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingPersonEmail: '',
    reportingPersonCode: '',
    reportingRole: '',
    department: '',
    designation: '',
    uan: '',
    // role: '',
    active: true,
    branchCode: '',
    profileImage: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    employeeName: '',
    employeeCode: '',
    employeeAddress: '',
    branch: '',
    gender: '',
    email: '',
    dob: '',
    bloodGroup: '',
    mobileNo: '',
    alternativeMobile: '',
    aadhaarNo: '',
    panNo: '',
    accountNo: '',
    bankName: '',
    ifscCode: '',
    doj: '',
    // resignationDate: '',
    grade: '',
    team: '',
    reportingPerson: '',
    reportingRole: '',
    department: '',
    designation: '',
    uan: '',
    // role: '',
    active: true,
    branchCode: '',
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [leaveTypeTable, setLeaveTypeTable] = useState([
    {
      id: 1,
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      // totalLeave: '',
      // effective: '',
      effectiveFrom: null
      // carryforward: ''
    }
  ]);
  const [leaveTypeErrors, setLeaveTypeErrors] = useState([
    {
      leaveType: '',
      leaveCode: '',
      leaveApplicable: '',
      // totalLeave: '',
      // effective: '',
      effectiveFrom: null
      // carryforward: ''
    }
  ]);

  const genderList = [
    // { label: "ALL", value: "ALL" },
    { label: 'MALE', value: 'MALE' },
    { label: 'FEMALE', value: 'FEMALE' }
  ];

  const gradeList = [
    { label: 'A GRADE', value: 'A GRADE' },
    { label: 'B GRADE', value: 'B GRADE' },
    { label: 'C GRADE', value: 'C GRADE' },
    { label: 'D GRADE', value: 'D GRADE' }
  ];

  const navigateToPayslip = (employeeCode) => {
    navigate(`/finance/payslip`, { state: { employeeCode } });
  };

  const columns = [
    {
      accessorKey: 'payslip',
      header: 'Payslip',
      size: 100,
      Cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'left' }}>
          <DescriptionIcon style={{ color: '#388e3c', cursor: 'pointer' }} onClick={() => navigateToPayslip(row.original.employeeCode)} />
        </div>
      )
    },
    {
      accessorKey: 'employee',
      header: 'Employee',
      size: 140,
      Cell: ({ row }) => (
        <span style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => getEmployeeDetailsById(row)}>
          {row.original.employee}
        </span>
      )
    },
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

  // useEffect(() => {
  //   getAllBranches();
  //   getAllEmployees();
  //   getAllDesignation();
  //   getAllDepartment();
  //   getAllReportingPerson();
  // }, []);
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
      const response = await apiCalls('get', `commonmaster/getDesignationByOrgId?orgid=${orgId}`);
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
      const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgid=${orgId}`);
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

  // const getAllEmployees = async () => {
  //   try {
  //     const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgId}`);
  //     console.log('API Response:', response);

  //     if (response.status === true) {
  //       setListViewData(response.paramObjectsMap.employeeVO);
  //     } else {
  //       console.error('API Error:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const getAllEmployees = async () => {
    try {
      setLoading(true); // show loader
      const response = await apiCalls('get', `master/getAllEmployeeByOrgId?orgId=${orgId}`);
      if (response.status === true) {
        setListViewData(response.paramObjectsMap.employeeVO);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // hide loader
    }
  };

  const getAllLeaveType = async (designationCode, gender) => {
    try {
      const response = await apiCalls(
        'get',
        `master/getLeaveDetailsFromDesignationLeave?designationCode=${designationCode}&leaveApplicable=${gender}&orgId=${orgId}`
      );

      console.log('API Response:', response);

      if (response.status === true && response.paramObjectsMap?.employeeVO) {
        setAllLeaveType(response.paramObjectsMap.employeeVO); // Ensure correct mapping
      } else {
        console.error('API Error:', response);
        setAllLeaveType([]); // Set empty array to avoid undefined issues
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAllLeaveType([]); // Handle errors gracefully
    }
  };

  const getAllReportingPerson = async (employeeCode) => {
    try {
      const response = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?orgId=${orgId}&branchCode=${branchCode}&employeeCode=${employeeCode}`
      );
      console.log('API Response:', response);

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

    const nameRegex = /^[A-Za-z ]*$/;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\ ]*$/;
    const numberRegex = /^[0-9]*$/;
    const aadhaarRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const accountRegex = /^\d{9,18}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const uanRegex = /^[A-Za-z]{0,12}$/; // Only alphabets up to 12 characters

    let errorMessage = '';
    let inputValue = value;

    // Handle checkbox early
    if (type === 'checkbox') {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
      return;
    }

    // Input sanitization
    switch (name) {
      case 'aadhaarNo':
      case 'accountNo':
      case 'mobileNo':
      case 'altMobileNo':
        inputValue = value.replace(/\D/g, ''); // Only digits
        break;

      case 'panNo':
      case 'ifscCode':
        inputValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        break;

      case 'uan':
        if (/[^0-9]/.test(value)) {
          errorMessage = 'Only numbers are allowed';
        }

        inputValue = value.replace(/\D/g, ''); // Allow only digits

        if (inputValue.length > 12) {
          errorMessage = 'UAN cannot exceed 12 digits.';
          inputValue = inputValue.slice(0, 12);
        }
        break;

      default:
        break;
    }

    // Validation logic
    if (name === 'aadhaarNo') {
      if (!aadhaarRegex.test(inputValue)) {
        errorMessage = 'Aadhaar must be 12 digits';
      }
    } else if (name === 'panNo') {
      if (inputValue.length === 10 && !panRegex.test(inputValue)) {
        errorMessage = 'Invalid PAN format (e.g., ABCDE1234F)';
      }
    } else if (name === 'accountNo') {
      if (!accountRegex.test(inputValue)) {
        errorMessage = 'Account must be 9-18 digits';
      }
    } else if (name === 'ifscCode') {
      if (inputValue.length === 11 && !ifscRegex.test(inputValue)) {
        errorMessage = 'Invalid IFSC format (e.g., SBIN0123456)';
      }
    } else if (name === 'mobileNo' || name === 'altMobileNo') {
      if (inputValue.length === 10 && !mobileRegex.test(inputValue)) {
        errorMessage = 'Invalid Mobile Number';
      } else if (inputValue.length > 0 && inputValue.length !== 10) {
        errorMessage = 'Mobile number must be 10 digits';
      }
    }

    if (name === 'employeeName' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'employeeCode' && !codeRegex.test(value)) {
      errorMessage = 'Invalid Format';
    } else if (name === 'mobileNo' || name === 'alternativeMobile') {
      if (!numberRegex.test(value)) {
        errorMessage = 'Only numbers are allowed.';
      } else if (value.length > 10) {
        errorMessage = 'Mobile number cannot exceed 10 digits.';
      }
    }

    // Set error and value
    setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

    // Additional logic
    if (name === 'employeeCode' && !errorMessage) {
      getAllReportingPerson(value);
    }

    if (!errorMessage) {
      if (name === 'branch') {
        const selectedBranch = branchList.find((br) => br.branch === value);
        setFormData((prevData) => ({
          ...prevData,
          branch: value,
          branchCode: selectedBranch ? selectedBranch.branchCode : ''
        }));
      } else {
        if (name === 'email') {
          inputValue = value.toLowerCase();
        } else if (type === 'text' || type === 'textarea') {
          inputValue = value.toUpperCase();
        }

        setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

        if (name === 'reportingPerson') {
          const selectedEmployee = allReportingPerson.find((emp) => emp.employeeName === value);
          setFormData((prevData) => ({
            ...prevData,
            reportingPerson: value,
            reportingPersonEmail: selectedEmployee?.email || '',
            reportingPersonCode: selectedEmployee?.employeeCode || '',
            reportingRole: selectedEmployee?.role || ''
          }));
        }

        if (name === 'gender' || name === 'designation') {
          const selectedDesignation = designationList.find(
            (row) => row.designationName === (name === 'designation' ? value : formData.designation)
          );
          const updatedGender = name === 'gender' ? value : formData.gender;
          const updatedDesignationCode = selectedDesignation ? selectedDesignation.designationCode : '';

          if (updatedGender && updatedDesignationCode) {
            getAllLeaveType(updatedDesignationCode, updatedGender);
          }
        }

        if (type === 'text' || type === 'textarea') {
          setTimeout(() => {
            const inputElement = document.getElementsByName(name)[0];
            if (inputElement?.setSelectionRange) {
              inputElement.setSelectionRange(selectionStart, selectionEnd);
            }
          }, 0);
        }
      }
    }
  };

  const handleAddRow = () => {
    if (isLastRowEmpty(leaveTypeTable)) {
      displayRowError(leaveTypeTable);
      return;
    }
    const newRow = {
      id: Date.now(),
      leaveType: '',
      leaveCode: '',
      leaveApplicable: ''
      // totalLeave: '',
      // effective: '',
      // carryforward: ''
    };
    setLeaveTypeTable([...leaveTypeTable, newRow]);
    setLeaveTypeErrors([...leaveTypeErrors, { leaveCode: '', totalLeave: '', effective: '', effectiveFrom: '', carryforward: '' }]);
  };
  const isLastRowEmpty = (table) => {
    if (!table || table.length === 0) return false;

    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === leaveTypeTable) {
      return !lastRow.leaveCode || !lastRow.effectiveFrom;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === leaveTypeTable) {
      setLeaveTypeErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          leaveType: !table[table.length - 1].leaveType ? 'Leave Type is required' : '',
          leaveCode: !table[table.length - 1].leaveCode ? 'Leave Code is required' : '',
          leaveApplicable: !table[table.length - 1].leaveApplicable ? 'Leave Applicable is required' : '',
          // totalLeave: !table[table.length - 1].totalLeave ? 'Total Leave is required' : '',
          // effective: !table[table.length - 1].effective ? 'Effective is required' : '',
          effectiveFrom: !table[table.length - 1].effectiveFrom ? 'Effective From is required' : ''
          // carryforward: !table[table.length - 1].carryforward ? 'Carry Forward is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  const handleClear = () => {
    setFormData({
      employeeName: '',
      employeeCode: '',
      employeeAddress: '',
      branch: '',
      gender: '',
      email: '',
      dob: null,
      bloodGroup: '',
      mobileNo: '',
      alternativeMobile: '',
      aadhaarNo: '',
      panNo: '',
      accountNo: '',
      bankName: '',
      ifscCode: '',
      doj: null,
      resignationDate: '',
      grade: '',
      team: '',
      reportingPerson: '',
      reportingRole: '',
      department: '',
      designation: '',
      uan: '',
      // role: '',
      active: true,
      branchCode: '',
      profileImage: ''
    });
    setFieldErrors({});
    setLeaveTypeTable([
      {
        id: 1,
        leaveType: '',
        leaveCode: '',
        leaveApplicable: '',
        // totalLeave: '',
        // effective: '',
        effectiveFrom: null
        // carryforward: ''
      }
    ]);
    setLeaveTypeErrors('');
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
    let detailsTableDataValid = true;

    if (!formData.employeeName) errors.employeeName = 'Employee Name is required';
    if (!formData.branch) errors.branch = 'Branch is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.dob) errors.dob = 'Date of Birth is required';
    if (!formData.mobileNo) errors.mobileNo = 'Mobile No is required';
    if (!formData.aadhaarNo) errors.aadhaarNo = 'Aadhaar Number is required';
    if (!formData.panNo) errors.panNo = 'Pan Number is required';
    if (!formData.doj) errors.doj = 'Date of Join is required';
    if (!formData.grade) errors.grade = 'Grade is required';
    if (!formData.designation) errors.designation = 'Designation is required';

    if (!leaveTypeTable || !Array.isArray(leaveTypeTable) || leaveTypeTable.length === 0) {
      detailsTableDataValid = false;
      setLeaveTypeErrors([{ general: 'Leave Type Table Data is required' }]);
    } else {
      const newTableErrors = leaveTypeTable.map((row, index) => {
        const rowErrors = {};
        if (!row.leaveType) {
          rowErrors.leaveType = 'Leave Type is required';
          detailsTableDataValid = false;
        }
        if (!row.effectiveFrom) {
          rowErrors.effectiveFrom = 'Effective From is required';
          detailsTableDataValid = false;
        }
        const isDuplicate = leaveTypeTable.some((r, idx) => r.leaveType === row.leaveType && idx !== index);

        if (isDuplicate) {
          rowErrors.leaveType = 'You have already selected this leave type.';
          detailsTableDataValid = false;
        }
        return rowErrors;
      });
      setLeaveTypeErrors(newTableErrors);
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0 && detailsTableDataValid) {
      setIsLoading(true);

      const detailsVo = leaveTypeTable.map((row) => ({
        ...(editId && { id: row.id }),
        effectiveFrom: row.effectiveFrom,
        leaveCode: row.leaveCode,
        leaveType: row.leaveType,
        totalLeave: parseInt(row.totalLeave)
      }));

      const selectedBranch = branchList.find((br) => br.branch === formData.branch);
      console.log('brr', selectedBranch.branch);

      const branchCode = selectedBranch ? selectedBranch.branchCode : '';

      const saveFormData = {
        ...(editId && { id: editId }),
        aadharNo: parseInt(formData.aadhaarNo),
        bankName: formData.bankName,
        accountNo: formData.accountNo,
        active: formData.active,
        alternativeMobileNo: parseInt(formData.alternativeMobile),
        bloodGroup: formData.bloodGroup,
        branch: selectedBranch.branch,
        branchCode: branchCode,
        cancel: true,
        cancelRemark: null,
        createdBy: loginUserName,
        dateOfBirth: formData.dob,
        department: formData.department,
        designation: formData.designation,
        uanNo: parseInt(formData.uan),
        email: formData.email,
        employeeAddress: formData.employeeAddress,
        employeeCode: formData.employeeCode,
        employeeLeaveDTO: detailsVo,
        employeeName: formData.employeeName,
        gender: formData.gender,
        grade: formData.grade,
        ifscCode: formData.ifscCode,
        joiningDate: formData.doj,
        mobileNo: parseInt(formData.mobileNo),
        orgId: orgId,
        panNo: formData.panNo,
        reportingPerson: formData.reportingPerson,
        reportingPersonEmail: formData.reportingPersonEmail,
        reportningPersonCode: formData.reportingPersonCode,
        reportingRole: formData.reportingRole,
        // resignDate: formData.resignationDate || null,
        resignDate: isValidDate(formData.resignationDate) ? formData.resignationDate : null,
        // role: formData.role,
        team: formData.team,
        updatedBy: loginUserName
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

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const getEmployeeDetailsById = async (row) => {
    console.log('Fetching employee details for:', row);
    setIsViewMode(true);
    setShowForm(true);

    try {
      const result = await apiCalls('get', `/master/employee/${row.original.employeeId}`);

      if (result) {
        const employeeDetailsVO = result.paramObjectsMap.Employee;
        setEditId(row.original.employeeId);

        const designationCode = designationList.find((d) => d.designationName === employeeDetailsVO.designation)?.designationCode || '';
        const gender = employeeDetailsVO.gender || '';
        const employeeCode = employeeDetailsVO.employeeCode || '';

        if (designationCode && gender) {
          await getAllLeaveType(designationCode, gender);
        }

        setFormData({
          employeeName: employeeDetailsVO.employeeName || '',
          employeeCode: employeeDetailsVO.employeeCode || '',
          employeeAddress: employeeDetailsVO.employeeAddress || '',
          branch: employeeDetailsVO.branch || '',
          gender: gender,
          email: employeeDetailsVO.email || '',
          doj: employeeDetailsVO.joiningDate || '',
          resignationDate: employeeDetailsVO.resignDate || '',
          grade: employeeDetailsVO.grade || '',
          team: employeeDetailsVO.team || '',
          department: employeeDetailsVO.department || '',
          designation: employeeDetailsVO.designation || '',
          uan: employeeDetailsVO.uanNo || '',
          reportingPerson: employeeDetailsVO.reportnigPerson || '',
          reportingRole: employeeDetailsVO.reportingRole || '',
          reportingPersonEmail: employeeDetailsVO.reportnigPersonEmail || '',
          reportingPersonCode: employeeDetailsVO.reportningPersonCode || '',
          dob: employeeDetailsVO.dateOfBirth || '',
          bloodGroup: employeeDetailsVO.bloodGroup || '',
          mobileNo: employeeDetailsVO.mobileNo || '',
          alternativeMobile: employeeDetailsVO.alternativeMobileNo || '',
          aadhaarNo: employeeDetailsVO.aadharNo || '',
          panNo: employeeDetailsVO.panNo || '',
          accountNo: employeeDetailsVO.accountNo || '',
          bankName: employeeDetailsVO.bankName || '',
          ifscCode: employeeDetailsVO.ifscCode || '',
          active: employeeDetailsVO.active === 'Active',
          id: employeeDetailsVO.employeeId || 0
        });

        setLeaveTypeTable(
          employeeDetailsVO.employeeLeaveVO.map((cl) => ({
            id: cl.id,
            leaveType: cl.leaveType,
            leaveCode: cl.leaveCode,
            totalLeave: cl.totalLeave,
            effectiveFrom: cl.effectiveFrom
          }))
        );

        const profileImageBlob = result.paramObjectsMap.Employee.profileImage;
        // const fileProfileImage = blobToFile(profileImageBlob, "profile_image.jpg");
        setLogo(profileImageBlob);

        if (employeeCode) {
          await getAllReportingPerson(employeeCode);
        }

        console.log('DataToEdit', employeeDetailsVO);
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

  const handleLeaveTypeChange = (event, newValue, row, index) => {
    const isDuplicate = leaveTypeTable.some((r, idx) => r.leaveType === newValue?.leaveType && idx !== index);

    setLeaveTypeTable((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
            ...r,
            leaveType: newValue ? newValue.leaveType : '',
            leaveCode: newValue ? newValue.leaveCode : '',
            totalLeave: newValue ? newValue.totalLeave : ''
          }
          : r
      )
    );

    setLeaveTypeErrors((prevErrors) => {
      if (!Array.isArray(prevErrors)) return [];

      const newErrors = [...prevErrors];
      while (newErrors.length < leaveTypeTable.length) {
        newErrors.push({});
      }

      return newErrors.map((err, idx) => {
        if (idx === index) {
          return isDuplicate
            ? { ...err, leaveType: 'You have already selected this leave type.' }
            : { ...err, leaveType: '', leaveCode: '', totalLeave: '' };
        }
        return err;
      });
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      console.log('Handle==>', file);
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
        `/master/uploadEmployeeImageInBloob?id=${id}`,
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
      employee.doj || employee.joiningDate,
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
        <div className="d-flex flex-wrap justify-content-start mb-4">
          {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} isLoading={isLoading} />
          {!showForm && (
            <ActionButton
              title="Download PDF"
              icon={PictureAsPdfIcon} // Fixed: passing the component directly
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />
              </div>

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={branchList}
                  getOptionLabel={(option) => option.branch || ''}
                  sx={{ width: '100%' }}
                  size="small"
                  value={branchList.find((c) => c.branch === formData.branch) || null}
                  onChange={(event, newValue) => handleInputChange({ target: { name: 'branch', value: newValue ? newValue.branch : '' } })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Branch"
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

              {/* DOJ */}
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
              {editId && (
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Resignation Date"
                        value={formData.resignationDate ? dayjs(formData.resignationDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('resignationDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true }
                        }}
                        format="DD-MM-YYYY"
                      // error={fieldErrors.resignationDate}
                      // helperText={fieldErrors.resignationDate && 'Required'}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
              )}

              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={gradeList}
                  getOptionLabel={(option) => option.label}
                  sx={{ width: '100%' }}
                  size="small"
                  value={gradeList.find((c) => c.value === formData.grade) || null}
                  onChange={(event, newValue) => handleInputChange({ target: { name: 'grade', value: newValue ? newValue.value : '' } })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Grade"
                      name="grade"
                      error={Boolean(fieldErrors.grade)}
                      helperText={fieldErrors.grade || ''}
                      InputProps={{
                        ...params.InputProps,
                        style: { height: 40 }
                      }}
                    />
                  )}
                />
              </div>

              {/* Team */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Team"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                // error={!!fieldErrors.team}
                // helperText={fieldErrors.team}
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
              </div>

              {/* Reporting Designation */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Reporting Designation"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="reportingRole"
                  value={formData.reportingRole}
                  onChange={handleInputChange}
                  error={!!fieldErrors.reportingRole}
                  helperText={fieldErrors.reportingRole}
                  disabled
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
                  error={!!fieldErrors.employeeAddress}
                  helperText={fieldErrors.employeeAddress}
                />
              </div>

              {/* Image Upload Section */}
              <div className="col-md-3 mb-3">
                {/* Hidden file input */}
                <input
                  accept="image/*"
                  id="image-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  disabled={isLoading}
                />

                {/* Main container */}
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  {/* Upload area */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: selectedImage || logo ? 1 : 0
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

                    {(selectedImage || logo) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedImage(null);
                          setLogo('');
                        }}
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

                  {/* File info display */}
                  {(selectedImage || logo) && (
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
                      onClick={() => {
                        /* Add preview modal trigger here */
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
                        {selectedImage?.name || logo?.name || 'image.jpg'}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      ></Box>
                    </Box>
                  )}

                  {isLoading && (
                    <LinearProgress
                      sx={{
                        height: 2,
                        mt: 1
                      }}
                    />
                  )}
                </Box>
              </div>

              <h5 className="mb-4 mt-2">Personal Details</h5>

              {/* Date of Birth */}
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

              {/* Alternative Mobile No */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Emergency Mobile No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="alternativeMobile"
                  value={formData.alternativeMobile}
                  onChange={handleInputChange}
                  error={!!fieldErrors.alternativeMobile}
                  helperText={fieldErrors.alternativeMobile}
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
                  fullWidth
                  name="aadhaarNo"
                  value={formData.aadhaarNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.aadhaarNo}
                  helperText={fieldErrors.aadhaarNo}
                  inputProps={{
                    maxLength: 12,
                    inputMode: 'numeric'
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
                  name="uan"
                  inputProps={{ maxLength: 12 }}
                  value={formData.uan}
                  onChange={handleInputChange}
                  error={!!fieldErrors.uan}
                  helperText={fieldErrors.uan}
                />
              </div>

              <h5 className="mb-4 mt-2">Bank Details</h5>

              {/* Account Number */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Account No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.accountNo}
                  helperText={fieldErrors.accountNo}
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: 18
                  }}
                />
              </div>

              {/* Bank Name */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="Bank Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                // error={!!fieldErrors.bankName}
                // helperText={fieldErrors.bankName}
                />
              </div>

              {/* IFSC Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  label="IFSC Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.ifscCode}
                  helperText={fieldErrors.ifscCode || 'Format: SBIN0123456'}
                  inputProps={{
                    maxLength: 11,
                    style: { textTransform: 'uppercase' }
                  }}
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
                  <Tab value={0} label="Leave" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      {/* <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div> */}
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered ">
                              <thead>
                                <tr>
                                  <th className="px-2 py-2 text-center" style={{ width: '68px', color: 'white' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-center" style={{ width: '50px', color: 'white' }}>
                                    #
                                  </th>
                                  <th className="px-2 py-2 text-center" style={{ width: '150px', color: 'white' }}>
                                    Type
                                  </th>
                                  <th className="px-2 py-2 text-center" style={{ width: '150px', color: 'white' }}>
                                    Code
                                  </th>
                                  <th className="px-2 py-2 text-center" style={{ width: '200px', color: 'white' }}>
                                    Total Leave
                                  </th>
                                  <th className="px-2 py-2 text-center" style={{ width: '200px', color: 'white' }}>
                                    <div className="d-flex justify-content-end align-items-center">
                                      <div className="pe-5 pt-3"> Eff From</div>
                                      <div className="d-flex justify-content-end">
                                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {leaveTypeTable.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() =>
                                          handleDeleteRow(row.id, leaveTypeTable, setLeaveTypeTable, leaveTypeErrors, setLeaveTypeErrors)
                                        }
                                      />
                                    </td>
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>
                                    <td className="border px-2 py-2">
                                      <Autocomplete
                                        key={row.id}
                                        options={allleaveType}
                                        getOptionLabel={(option) => option.leaveType || ''}
                                        value={row.leaveType ? allleaveType.find((a) => a.leaveType === row.leaveType) : null}
                                        onChange={(event, newValue) => handleLeaveTypeChange(event, newValue, row, index)}
                                        size="small"
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="Leave Type"
                                            variant="outlined"
                                            error={!!leaveTypeErrors[index]?.leaveType}
                                            helperText={leaveTypeErrors[index]?.leaveType}
                                          />
                                        )}
                                        sx={{ width: 250, marginBottom: 2 }}
                                      />
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.leaveCode}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, leaveCode: value } : r)));
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              leaveCode: !value ? 'Leave Code is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.leaveCode ? 'error form-control' : 'form-control'}
                                        disabled
                                      />
                                      {leaveTypeErrors[index]?.leaveCode && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].leaveCode}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.totalLeave}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, totalLeave: value } : r)));
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              totalLeave: !value ? 'No Of Days is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={leaveTypeErrors[index]?.totalLeave ? 'error form-control' : 'form-control'}
                                        disabled
                                      />
                                      {leaveTypeErrors[index]?.totalLeave && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].totalLeave}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="date"
                                        value={row.effectiveFrom}
                                        className={leaveTypeErrors[index]?.effectiveFrom ? 'error form-control' : 'form-control'}
                                        onChange={(e) => {
                                          const date = e.target.value; // Capture the date string from input

                                          // Update the effectiveFrom in the row
                                          setLeaveTypeTable((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, effectiveFrom: date } : r))
                                          );

                                          // Handle error validation for effectiveFrom
                                          setLeaveTypeErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              effectiveFrom: !date ? 'Effective From is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        min={row.effectiveFrom || new Date().toISOString().split('T')[0]} // Ensure the minDate is properly set
                                      />
                                      {leaveTypeErrors[index]?.effectiveFrom && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {leaveTypeErrors[index].effectiveFrom}
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
        ) : loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50px' }}>
            <CircularProgress />
          </div>
        ) : (
          <CommonListViewTable data={listViewData} columns={columns} blockEdit={true} toEdit={getEmployeeDetailsById} enableEditing={false} />
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;

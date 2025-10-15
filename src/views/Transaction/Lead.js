import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField, Box, Tab, Tabs, MenuItem, Select, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import {
  Avatar,
  Typography,
  Autocomplete,
  FormHelperText,
  Button,
  Dialog,
  DialogContent,
  Checkbox,
  FormControlLabel,
  FormControl
} from '@mui/material';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonTableWithStatus from 'views/basicMaster/CommonTableWithStatus';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';

const Lead = ({ selectedRow }) => {
  const [listViewData, setListViewData] = useState([]);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
  const [createdBy] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [value, setValue] = useState(0);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listView, setListView] = useState(true);
  const [docId, setDocId] = useState('');
  const [open, setOpen] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [assignToList, setAssignToList] = useState([]);
  const [sources] = useState(['Call', 'Email', 'Existing Customer', 'Partner', 'Public Relations', 'Campaign', 'Website', 'Other']);
  const [clientTypes] = useState(['Company', 'Individual']);
  const [industries] = useState(['IT', 'Agriculture', 'Health Care', 'Transport', 'CFO Services', 'Manufacturing', 'Construction']);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getLeadById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [formData, setFormData] = useState({
    docDate: dayjs(),
    source: '',
    clientType: '',
    clientName: '',
    mail: '',
    contactNo: '',
    industry: '',
    website: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    customer: '',
    address: '',
    probability: '',
    assignTo: '',
    stage: '',
    finYear: finYear,
    orgId: orgId,
    branch: branch,
    branchCode: branchCode,
    createdBy: createdBy
  });

  const [fieldErrors, setFieldErrors] = useState({
    source: '',
    clientType: '',
    clientName: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    address: ''
  });

  const [leadBranches, setLeadBranches] = useState([
    {
      branch: '',
      gstNo: '',
      city: '',
      state: '',
      country: '',
      address: ''
    }
  ]);

  const [branchErrors, setBranchErrors] = useState([
    {
      branch: '',
      address: '',
      city: '',
      country: '',
      state: '',
      gstNo: ''
    }
  ]);

  const [leadContacts, setLeadContacts] = useState([
    {
      preferredContact: false,
      branchName: '',
      name: '',
      mobileNo: '',
      email: '',
      designation: '',
      dob: '',
      workAnniversaryDate: '',
      anniversaryDate: ''
    }
  ]);

  const [contactErrors, setContactErrors] = useState([
    {
      name: '',
      mobileNo: '',
      email: '',
      designation: ''
    }
  ]);

  const listViewColumns = [
    { accessorKey: 'clientName', header: 'Client Name', size: 140 },
    { accessorKey: 'clientType', header: 'Client Type', size: 140 },
    { accessorKey: 'contactNo', header: 'Contact No', size: 140 },
    { accessorKey: 'mail', header: 'Email', size: 140 },
    { accessorKey: 'industry', header: 'Industry', size: 140 },
    { accessorKey: 'source', header: 'Source', size: 140 },
    { accessorKey: 'city', header: 'City', size: 140 },
    { accessorKey: 'state', header: 'State', size: 140 }
  ];

  useEffect(() => {
    getAllLeads();
    getLeadDocId();
    getCityName();
    getAssignTo();
  }, []);
  const getLeadDocId = async () => {
    if (editId) return;
    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/transaction/getLeadDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (response.status) {
        setDocId(response.paramObjectsMap.leadDocId);
      }
    } catch (err) {
      console.error('Error fetching lead docId:', err);
      showToast('error', 'Failed to generate lead ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllLeads = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getAllLeadByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`);
      console.log('getAll Leads', response.status);

      if (response.status === true && response.paramObjectsMap?.leadVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.leadVO].reverse());

        const counts = {
          New: 0,
          Qualified: 0,
          Unqualified: 0,
          InProgress: 0
        };

        response.paramObjectsMap.leadVO.forEach((lead) => {
          switch (lead.stage) {
            case 'Progressing':
            case 'Proposal':
            case 'Negotiation':
              counts.InProgress += 1;
              break;
            case 'Closed Won':
              counts.Qualified += 1;
              break;
            case 'Closed Lost':
              counts.Unqualified += 1;
              break;
            default:
              break;
          }
        });
        setSummaryCounts(counts);
        setSummaryCounts((prev) => ({
          ...prev,
          New: response.paramObjectsMap.leadVO.length
        }));
      } else {
        setListViewData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('error', 'Failed to fetch leads');
      setIsLoading(false);
    }
  };
  // useEffect(() => {
  //     console.log("Get all leads", listViewData);
  //     listViewData.length > 0 ? setIsLoading(false) : setIsLoading(true);
  // }, [listViewData])
  const getLeadById = async (row) => {
    setIsLoading(true);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/transaction/getLeadById?id=${row.original.id}`);
      if (response.status) {
        setListView(false);
        const lead = response.paramObjectsMap.leadVO;
        setCompanyLogo(response.paramObjectsMap.leadVO.companyLogo);
        // Map API fields to formData state
        setFormData({
          address: lead.address || '',
          docDate: lead.docDate || null,
          city: lead.city || '',
          clientName: lead.clientName || '',
          clientType: lead.clientType || '',
          contactNo: lead.contactNo || '',
          country: lead.country || '',
          customer: lead.customer || '',
          finYear: lead.finYear || '',
          industry: lead.industry || '',
          mail: lead.mail || '',
          pinCode: lead.pinCode || '',
          source: lead.source || '',
          state: lead.state || '',
          stage: lead.stage || '',
          website: lead.website || '',
          probability: lead.probability || '',
          assignTo: lead.assignTo || ''
        });

        // Set document ID
        setDocId(lead.docId || '');

        // Map branches
        const branches =
          lead.leadBranchVO?.map((branch) => ({
            address: branch.address || '',
            branch: branch.branch || '',
            // branchCode: branch.branchCode || '',
            city: branch.city || '',
            country: branch.country || '',
            gstNo: branch.gstNo || '',
            state: branch.state || ''
          })) || [];

        setLeadBranches(
          branches.length > 0
            ? branches
            : [
                {
                  address: '',
                  branch: '',
                  city: '',
                  country: '',
                  gstNo: '',
                  state: ''
                }
              ]
        );

        // Map contacts
        const contacts =
          lead.leadContactVO?.map((contact) => ({
            branchName: contact.branchName || '',
            designation: contact.designation || '',
            dob: contact.dob || null,
            email: contact.email || '',
            mobileNo: contact.mobileNo || '',
            name: contact.name || '',
            preferredContact: contact.preferedContact,
            workAnniversaryDate: contact.workAniversaryDate || null,
            anniversaryDate: contact.aniversary || null
          })) || [];

        setLeadContacts(
          contacts.length > 0
            ? contacts
            : [
                {
                  branchName: '',
                  designation: '',
                  dob: '',
                  email: '',
                  mobileNo: '',
                  name: '',
                  preferredContact: 0,
                  workAnniversaryDate: ''
                }
              ]
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      showToast('error', 'Failed to fetch lead details');
      setIsLoading(false);
    }
  };
  const getCityName = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getCityNameFromMaster?orgId=${orgId}`);
      if (response.status === true) {
        setCityList(response.paramObjectsMap.cityName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getAssignTo = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getAssignedNameSales?orgId=${orgId}`);
      if (response.status === true) {
        setAssignToList(response.paramObjectsMap.assignedUser || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert to string if it's the contactNo field
    const processedValue = name === 'contactNo' ? String(value) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateMainField = (field, value) => {
    const newErrors = { ...fieldErrors };

    if (field === 'mail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors[field] = 'Invalid email format';
    } else if (field === 'contactNo' && value && !/^[0-9+\-\s]{10,15}$/.test(value)) {
      newErrors[field] = 'Invalid contact number';
    } else if (!value) {
      newErrors[field] = 'This field is required';
    } else {
      newErrors[field] = '';
    }

    setFieldErrors(newErrors);
  };

  const validateContactField = (index, field, value) => {
    const newErrors = [...contactErrors];
    if (!newErrors[index]) newErrors[index] = {};

    if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors[index][field] = 'Invalid email format';
    } else if (field === 'mobileNo' && value && !/^[0-9+\-\s]{10,15}$/.test(value)) {
      newErrors[index][field] = 'Invalid mobile number';
    } else if (!value && ['name', 'mobileNo', 'email', 'designation'].includes(field)) {
      newErrors[index][field] = 'This field is required';
    } else {
      newErrors[index][field] = '';
    }

    setContactErrors(newErrors);
  };

  const validateBranchField = (index, field, value) => {
    const newErrors = [...branchErrors];
    if (!newErrors[index]) newErrors[index] = {};

    if (!value && ['branch', 'address', 'city', 'country', 'state'].includes(field)) {
      newErrors[index][field] = 'This field is required';
    } else {
      newErrors[index][field] = '';
    }

    setBranchErrors(newErrors);
  };

  const validateFields = () => {
    const errors = {};
    if (!formData.source) errors.source = 'Source is required';
    if (!formData.clientType) errors.clientType = 'Client type is required';
    if (!formData.clientName.trim()) errors.clientName = 'Client name is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.pinCode) errors.pinCode = 'Pin Code is required';
    if (!formData.customer) errors.customer = 'Customer is required';
    if (!formData.address) errors.address = 'Address is required';

    if (formData.mail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
      errors.mail = 'Invalid email format';
    }

    if (String(formData.contactNo).trim() && !/^[0-9+\-\s]{10,15}$/.test(String(formData.contactNo))) {
      errors.contactNo = 'Invalid contact number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBranches = () => {
    const errors = leadBranches.map((branch) => {
      const error = {};
      if (!branch.branch.trim()) error.branch = 'Branch name is required';
      if (!branch.gstNo.trim()) error.gstNo = 'Reg No name is required';
      if (!branch.city.trim()) error.city = 'City is required';
      if (!branch.state.trim()) error.state = 'State is required';
      if (!branch.country.trim()) error.country = 'Country is required';
      if (!branch.address.trim()) error.address = 'Address is required';
      return error;
    });

    setBranchErrors(errors);
    return errors.every((e) => Object.keys(e).length === 0);
  };

  const validateContacts = () => {
    const errors = leadContacts.map((contact) => {
      const error = {};
      if (!contact.branchName.trim()) error.branchName = 'Branch Name is required';
      if (!contact.name.trim()) error.name = 'Name is required';
      if (!contact.mobileNo.trim()) error.mobileNo = 'Mob No is required';
      if (!contact.email.trim()) error.email = 'Email is required';
      if (!contact.designation.trim()) error.designation = 'Designation is required';

      if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        error.email = 'Invalid email format';
      }

      if (contact.mobileNo.trim() && !/^[0-9+\-\s]{10,15}$/.test(contact.mobileNo)) {
        error.mobileNo = 'Invalid mobile number';
      }

      return error;
    });

    setContactErrors(errors);
    return errors.every((e) => Object.keys(e).length === 0);
  };

  const handleSave = async () => {
    const isFormValid = validateFields();
    const isBranchesValid = validateBranches();
    const isContactsValid = validateContacts();

    if (!isFormValid || !isBranchesValid || !isContactsValid) {
      showToast('error', 'Please correct the highlighted fields');
      return;
    }
    setIsLoading(true);
    const payload = {
      ...(editId && { id: editId }),
      address: formData.address || '',
      branch: branch || '',
      branchCode: branchCode || '',
      city: formData.city || '',
      clientName: formData.clientName,
      clientType: formData.clientType,
      contactNo: formData.contactNo,
      country: formData.country || '',
      createdBy: createdBy,
      customer: formData.customer || '',
      finYear: formData.finYear,
      industry: formData.industry,
      mail: formData.mail,
      orgId: orgId,
      pinCode: formData.pinCode ? parseInt(formData.pinCode) : 0,
      source: formData.source,
      state: formData.state || '',
      stage: formData.stage || '',
      website: formData.website || '',
      assignTo: formData.assignTo || '',
      probability: formData.probability || '',
      leadBranchDTO: leadBranches.map((branch) => ({
        address: branch.address,
        branch: branch.branch,
        // branchCode: branch.branchCode,
        city: branch.city,
        country: branch.country,
        gstNo: branch.gstNo || '',
        state: branch.state
      })),
      leadContactDTO: leadContacts.map((contact) => ({
        dob: contact.dob || null,
        branchName: contact.branchName || '',
        designation: contact.designation,
        dob: contact.dob || '',
        email: contact.email,
        mobileNo: contact.mobileNo,
        name: contact.name,
        preferedContact: contact.preferredContact ? 1 : 0,
        workAniversaryDate: contact.workAnniversaryDate || null,
        aniversary: contact.anniversaryDate || null
      }))
    };

    try {
      const response = await apiCalls('put', '/transaction/createUpdateLead', payload);
      console.log('data to save', payload);

      if (response.status) {
        showToast('success', editId ? 'Lead updated successfully' : 'Lead created successfully');
        const generatedId = response.paramObjectsMap.leadVO.id;
        if (generatedId && typeof companyLogo === 'object') {
          console.log('Generated ID:', generatedId);
          console.log('Uploaded Item', companyLogo);
          handleFileUpload(generatedId);
        } else {
          console.log('handle Img Upload failed');
        }
        handleClear();
        getAllLeads();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving lead:', error);
      showToast('error', 'Failed to save lead: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCompanyLogo(null);
    setFormData({
      docDate: dayjs(),
      source: '',
      clientType: '',
      clientName: '',
      mail: '',
      stage: '',
      contactNo: '',
      industry: '',
      website: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      customer: '',
      address: '',
      probability: '',
      assignTo: '',
      finYear: finYear,
      orgId: orgId,
      branch: branch,
      branchCode: branchCode,
      createdBy: createdBy
    });
    setFieldErrors({
      source: '',
      clientType: '',
      clientName: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      address: ''
    });
    setLeadBranches([
      {
        branch: '',
        gstNo: '',
        city: '',
        state: '',
        country: '',
        address: ''
      }
    ]);
    setLeadContacts([
      {
        preferredContact: false,
        branchName: '',
        name: '',
        mobileNo: '',
        email: '',
        designation: '',
        dob: '',
        workAnniversaryDate: '',
        anniversaryDate: ''
      }
    ]);
    setEditId('');
    getLeadDocId();
  };

  const handleAddBranch = () => {
    setTimeout(() => {
      setLeadBranches((prev) => [
        ...prev,
        {
          branch: '',
          gstNo: '',
          city: '',
          state: '',
          country: '',
          address: ''
        }
      ]);

      setBranchErrors((prev) => [
        ...prev,
        {
          branch: '',
          gstNo: '',
          city: '',
          state: '',
          country: '',
          address: ''
        }
      ]);
    }, 0);
  };
  const handleDeleteBranch = (index) => {
    if (leadBranches.length <= 1) {
      showToast('warning', 'At least one branch is required');
      return;
    }

    const newBranches = leadBranches.filter((_, i) => i !== index);
    const newErrors = branchErrors.filter((_, i) => i !== index);

    setLeadBranches(newBranches);
    setBranchErrors(newErrors);
  };

  const handleBranchChange = (index, field, value) => {
    const newBranches = [...leadBranches];
    newBranches[index] = { ...newBranches[index], [field]: value };
    setLeadBranches(newBranches);

    if (value) {
      const newErrors = [...branchErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      setBranchErrors(newErrors);
    }
  };

  const handleAddContact = () => {
    // const lastContact = leadContacts[leadContacts.length - 1];
    // if (!lastContact.name || !lastContact.mobileNo || !lastContact.email || !lastContact.designation) {
    //     const newErrors = [...contactErrors];
    //     const lastIndex = newErrors.length - 1;
    //     newErrors[lastIndex] = {
    //         name: !lastContact.name ? 'Name is required' : '',
    //         mobileNo: !lastContact.mobileNo ? 'Mobile number is required' : '',
    //         email: !lastContact.email ? 'Email is required' : '',
    //         designation: !lastContact.designation ? 'Designation is required' : ''
    //     };
    //     setContactErrors(newErrors);
    //     showToast('warning', 'Please fill current contact before adding new');
    //     return;
    // }

    setLeadContacts((prev) => [
      ...prev,
      {
        branchName: '',
        designation: '',
        dob: '',
        email: '',
        mobileNo: '',
        name: '',
        preferredContact: false,
        workAnniversaryDate: ''
      }
    ]);

    setContactErrors((prev) => [
      ...prev,
      {
        name: '',
        mobileNo: '',
        email: '',
        designation: ''
      }
    ]);
  };

  const handleDeleteContact = (index) => {
    if (leadContacts.length <= 1) {
      showToast('warning', 'At least one contact is required');
      return;
    }

    const newContacts = leadContacts.filter((_, i) => i !== index);
    const newErrors = contactErrors.filter((_, i) => i !== index);

    setLeadContacts(newContacts);
    setContactErrors(newErrors);
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...leadContacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value
    };
    setLeadContacts(newContacts);
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };
  const handleTabChange = (_, newValue) => setValue(newValue);
  const [companyLogo, setCompanyLogo] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setCompanyLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };
  const handleFileUpload = async (generatedId) => {
    if (!generatedId) {
      console.warn('Generated ID is missing');
      showToast('error', 'Generated ID is required');
      return;
    }
    const formData = new FormData();
    formData.append('file', companyLogo);
    try {
      const response = await apiCalls(
        'post',
        `/transaction/uploadLeadCompanyLogoInBloob?id=${generatedId}`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      console.log('Logo Upload Response:', response);

      if (response.status === true) {
        showToast('success', response.message || 'Image Uploaded successfully!');
      } else {
        console.warn('Logo upload failed:', response);
        showToast('error', 'Logo upload failed');
      }
    } catch (error) {
      console.error('Logo Upload Error:', error);
      showToast('error', 'Failed to upload Logo');
    }
  };
  useEffect(() => {
    return () => {
      if (companyLogo && typeof companyLogo === 'object') {
        URL.revokeObjectURL(companyLogo);
      }
    };
  }, [companyLogo]);
  const handleRemoveLogo = () => setCompanyLogo(null);
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };
  const [summaryCounts, setSummaryCounts] = useState({
    New: 0,
    Qualified: 0,
    Unqualified: 0,
    InProgress: 0
  });

  return (
    <>
      {isLoading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          {!selectedRow && (
            <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
              {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
              {!listView && (
                <>
                  <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                  <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                  <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                </>
              )}
            </div>
          )}
          {listView && !isLoading ? (
            <CommonTableWithStatus
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              toEdit={getLeadById}
              summaryCounts={summaryCounts}
            />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Lead ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="leadDocId"
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Doc Date"
                        value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('docDate', date)}
                        slotProps={{
                          textField: {
                            size: 'small'
                          }
                        }}
                        format="DD-MM-YYYY"
                        disabled
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.source}>
                    <InputLabel>
                      Source<span className="asterisk">*</span>
                    </InputLabel>
                    <Select
                      label="Source *"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      // error={!!fieldErrors.source}
                      // helperText={fieldErrors.source}
                    >
                      {sources.map((source) => (
                        <MenuItem key={source} value={source}>
                          {source}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.source && <FormHelperText style={{ color: 'red' }}>{fieldErrors.source}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.clientType}>
                    <InputLabel>
                      Client Type<span className="asterisk">*</span>
                    </InputLabel>
                    <Select
                      label="Client Type *"
                      name="clientType"
                      value={formData.clientType}
                      onChange={handleInputChange}
                      error={!!fieldErrors.clientType}
                      helperText={fieldErrors.clientType}
                    >
                      {clientTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.clientType && <FormHelperText style={{ color: 'red' }}>{fieldErrors.clientType}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Client Name <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    error={!!fieldErrors.clientName}
                    helperText={fieldErrors.clientName}
                    onBlur={(e) => validateMainField('clientName', e.target.value)}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Email"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="mail"
                    value={formData.mail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Contact No"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small">
                    <InputLabel>Industry</InputLabel>
                    <Select label="Industry" name="industry" value={formData.industry} onChange={handleInputChange}>
                      {industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Website"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={cityList}
                    getOptionLabel={(option) => (option?.city ? `${option.city}` : '')}
                    value={cityList.find((item) => item.city === formData.city) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          city: newValue.city,
                          state: newValue.state,
                          country: newValue.country || ''
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          city: '',
                          state: '',
                          country: ''
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          city: '',
                          state: '',
                          country: ''
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            City <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        fullWidth
                        error={!!fieldErrors.city}
                        helperText={fieldErrors.city}
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        State <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled
                    error={!!fieldErrors.state}
                    helperText={fieldErrors.state}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Country <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                    error={!!fieldErrors.country}
                    helperText={fieldErrors.country}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Pin Code <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    type="number"
                    error={!!fieldErrors.pinCode}
                    helperText={fieldErrors.pinCode}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small" error={!!fieldErrors.customer}>
                    <InputLabel id="demo-simple-select-label">
                      Customer <span style={{ color: 'red', fontSize: '20px' }}>*</span>
                    </InputLabel>
                    <Select
                      labelId="customer"
                      value={formData.customer}
                      onChange={handleInputChange}
                      label="Existing Customer"
                      name="customer"
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                    {fieldErrors.customer && <FormHelperText style={{ color: 'red' }}>{fieldErrors.customer}</FormHelperText>}
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Address <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="address"
                    multiline
                    value={formData.address}
                    onChange={handleInputChange}
                    error={!!fieldErrors.address}
                    helperText={fieldErrors.address}
                    onBlur={(e) => validateMainField('address', e.target.value)}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Probability %"
                    variant="outlined"
                    type="number"
                    size="small"
                    fullWidth
                    name="probability"
                    value={formData.probability}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={assignToList}
                    getOptionLabel={(option) =>
                      option?.empoyeeCode && option?.employeeName ? `${option.empoyeeCode} - ${option.employeeName}` : ''
                    }
                    value={assignToList.find((item) => item.empoyeeCode === formData.assignTo) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          assignTo: newValue.empoyeeCode,
                          assignName: newValue.employeeName
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          assignTo: '',
                          assignName: ''
                        }));
                      }
                    }}
                    renderInput={(params) => <TextField {...params} label={<span>Assign To</span>} size="small" fullWidth />}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">Stage</InputLabel>
                    <Select
                      labelId="stage"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      label="Stage"
                    >
                      <MenuItem value="Progressing">Progressing</MenuItem>
                      {/* <MenuItem value="Prospecting">Prospecting</MenuItem> */}
                      {/* <MenuItem value="Qualification">Qualification</MenuItem> */}
                      <MenuItem value="Proposal">Proposal</MenuItem>
                      <MenuItem value="Negotiation">Negotiation</MenuItem>
                      <MenuItem value="Closed Won">Closed Won</MenuItem>
                      <MenuItem value="Closed Lost">Closed Lost</MenuItem>
                    </Select>
                  </FormControl>
                </div>
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
                      {companyLogo ? (typeof companyLogo === 'object' && companyLogo.name ? companyLogo.name : '') : 'Attachment'}

                      <input type="file" hidden accept="image/png, image/jpeg" onChange={handleLogoChange} />
                    </Button>

                    {companyLogo && (
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
                    <DialogContent
                      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}
                    >
                      <Typography variant="h5" sx={{ whiteSpace: 'nowrap', color: 'rgb(103 58 183)' }}>
                        Attachment
                      </Typography>
                      {companyLogo ? (
                        <Box>
                          <Avatar
                            src={
                              typeof companyLogo === 'object' ? URL.createObjectURL(companyLogo) : `data:image/jpeg;base64,${companyLogo}`
                            }
                            alt="Attachment"
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
                            <Typography variant="caption">Attachment</Typography>
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
              </div>

              <div className="row mt-2">
                <Box sx={{ width: '100%' }}>
                  <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                    <Tab value={0} label="Branches" />
                    <Tab value={1} label="Contacts" />
                  </Tabs>
                </Box>

                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="mb-1">
                        <ActionButton title="Add Branch" icon={AddIcon} onClick={handleAddBranch} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr style={{ background: '#374151', color: '#ede7f6' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    #
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Branch *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Reg No *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    City *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    State *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Country *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Address *
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {leadBranches.map((branch, index) => (
                                  <tr key={index}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteBranch(index)} />
                                    </td>
                                    <td className="text-center pt-3">{index + 1}</td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={branch.branch}
                                        onChange={(e) => handleBranchChange(index, 'branch', e.target.value)}
                                        onBlur={(e) => validateBranchField(index, 'branch', e.target.value)}
                                        error={!!branchErrors[index]?.branch}
                                        helperText={branchErrors[index]?.branch}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={branch.gstNo}
                                        onChange={(e) => handleBranchChange(index, 'gstNo', e.target.value)}
                                        error={!!branchErrors[index]?.gstNo}
                                        helperText={branchErrors[index]?.gstNo}
                                      />
                                    </td>

                                    <td>
                                      <Box sx={{ minWidth: 150, flexGrow: 1 }}>
                                        <Autocomplete
                                          options={cityList}
                                          getOptionLabel={(option) => (option?.city ? `${option.city}` : '')}
                                          value={cityList.find((item) => item.city === branch.city) || null}
                                          onChange={(event, newValue) => {
                                            const updatedBranches = [...leadBranches];
                                            const updatedBranchesErrors = [...branchErrors];
                                            if (newValue) {
                                              updatedBranches[index] = {
                                                ...updatedBranches[index],
                                                city: newValue.city,
                                                state: newValue.state,
                                                country: newValue.country || ''
                                              };
                                              updatedBranchesErrors[index] = {
                                                ...updatedBranchesErrors[index],
                                                city: '',
                                                state: '',
                                                country: ''
                                              };
                                            } else {
                                              updatedBranches[index] = {
                                                ...updatedBranches[index],
                                                city: '',
                                                state: '',
                                                country: ''
                                              };
                                            }
                                            setBranchErrors(updatedBranchesErrors);
                                            setLeadBranches(updatedBranches);
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label={
                                                <span>
                                                  City <span className="asterisk">*</span>
                                                </span>
                                              }
                                              size="small"
                                              fullWidth
                                            />
                                          )}
                                        />
                                      </Box>
                                      {/* <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={branch.city}
                                                                                onChange={(e) => handleBranchChange(index, 'city', e.target.value)}
                                                                                onBlur={(e) => validateBranchField(index, 'city', e.target.value)}
                                                                                error={!!branchErrors[index]?.city}
                                                                                helperText={branchErrors[index]?.city} 
                                                                            />*/}
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={branch.state}
                                        disabled
                                        onChange={(e) => handleBranchChange(index, 'state', e.target.value)}
                                        onBlur={(e) => validateBranchField(index, 'state', e.target.value)}
                                        error={!!branchErrors[index]?.state}
                                        helperText={branchErrors[index]?.state}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={branch.country}
                                        disabled
                                        onChange={(e) => handleBranchChange(index, 'country', e.target.value)}
                                        onBlur={(e) => validateBranchField(index, 'country', e.target.value)}
                                        error={!!branchErrors[index]?.country}
                                        helperText={branchErrors[index]?.country}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        multiline
                                        value={branch.address}
                                        onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                                        onBlur={(e) => validateBranchField(index, 'address', e.target.value)}
                                        error={!!branchErrors[index]?.address}
                                        helperText={branchErrors[index]?.address}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {value === 1 && (
                    <>
                      <div className="mb-1">
                        <ActionButton title="Add Contact" icon={AddIcon} onClick={handleAddContact} />
                      </div>
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr style={{ background: '#374151', color: '#ede7f6' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    #
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '80px' }}>
                                    Pref. Cont
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Branch Name *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Name *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Mobile No *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Email *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Designation *
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Date of Birth
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Anniversary
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '140px' }}>
                                    Work Anniversary
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {leadContacts.map((contact, index) => (
                                  <tr key={index}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteContact(index)} />
                                    </td>
                                    <td className="text-center pt-3">{index + 1}</td>

                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90px' }}>
                                      <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                          <Checkbox
                                            checked={contact.preferredContact}
                                            onChange={(e) => handleContactChange(index, 'preferredContact', e.target.checked)}
                                          />
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Box sx={{ minWidth: 150, flexGrow: 1 }}>
                                        <Autocomplete
                                          options={leadBranches}
                                          getOptionLabel={(option) => option?.branch || ''}
                                          value={leadBranches.find((item) => item.branch === contact.branchName) || null}
                                          onChange={(event, newValue) => {
                                            const updatedContacts = [...leadContacts];
                                            updatedContacts[index] = {
                                              ...updatedContacts[index],
                                              branchName: newValue?.branch || ''
                                            };
                                            setLeadContacts(updatedContacts);
                                          }}
                                          isOptionEqualToValue={(option, value) => option.branch === value.branch}
                                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                                        />
                                      </Box>
                                    </td>
                                    <td>
                                      <TextField
                                        sx={{ minWidth: 150, flexGrow: 1 }}
                                        fullWidth
                                        size="small"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                        onBlur={(e) => validateContactField(index, 'name', e.target.value)}
                                        error={!!contactErrors[index]?.name}
                                        helperText={contactErrors[index]?.name}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        sx={{ minWidth: 150, flexGrow: 1 }}
                                        fullWidth
                                        size="small"
                                        value={contact.mobileNo}
                                        onChange={(e) => handleContactChange(index, 'mobileNo', e.target.value)}
                                        onBlur={(e) => validateContactField(index, 'mobileNo', e.target.value)}
                                        error={!!contactErrors[index]?.mobileNo}
                                        helperText={contactErrors[index]?.mobileNo}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        sx={{ minWidth: 150, flexGrow: 1 }}
                                        fullWidth
                                        size="small"
                                        value={contact.email}
                                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                        onBlur={(e) => validateContactField(index, 'email', e.target.value)}
                                        error={!!contactErrors[index]?.email}
                                        helperText={contactErrors[index]?.email}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        sx={{ minWidth: 150, flexGrow: 1 }}
                                        fullWidth
                                        size="small"
                                        value={contact.designation}
                                        onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                                        onBlur={(e) => validateContactField(index, 'designation', e.target.value)}
                                        error={!!contactErrors[index]?.designation}
                                        helperText={contactErrors[index]?.designation}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        sx={{ minWidth: 150, flexGrow: 1 }}
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={contact.dob || ''}
                                        onChange={(e) => handleContactChange(index, 'dob', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={contact.anniversaryDate || ''}
                                        onChange={(e) => handleContactChange(index, 'anniversaryDate', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={contact.workAnniversaryDate || ''}
                                        onChange={(e) => handleContactChange(index, 'workAnniversaryDate', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Box>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Lead;

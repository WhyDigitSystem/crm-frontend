import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { TextField, Autocomplete, FormControl, Dialog, DialogContent, DialogTitle, MenuItem, Select, Box, Tab, Tabs } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import CommonTableWithStatus from 'views/basicMaster/CommonTableWithStatus';
import FullScreenLoader from 'utils/FullScreenLoader';
import { Button, CircularProgress } from '@mui/material';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import CommonReportTable from 'utils/CommonReportTable';

const Opportunity = ({ selectedRow }) => {
  // State management
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myOpportunities, setMyOpportunities] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [isDocIdLoading, setIsDocIdLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listView, setListView] = useState(true);
  const [editId, setEditId] = useState('');
  const [docId, setDocId] = useState('');
  const [clientNameList, setClientNameList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [contactNameList, setContactNameList] = useState([]);
  const [productNameList, setProductNameList] = useState([]);
  const [value, setValue] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  useEffect(() => {
    if (selectedRow) {
      setIsLoading(true);
      getOpportunityById({ original: selectedRow });
    }
  }, [selectedRow]);
  const [summaryCounts, setSummaryCounts] = useState({
    New: 0,
    Qualified: 0,
    Unqualified: 0,
    InProgress: 0
  });

  // User session data
  const orgId = parseInt(localStorage.getItem('orgId'));
  const finYear = parseInt(localStorage.getItem('finYear'));
  const branch = localStorage.getItem('branch') || '';
  const branchCode = localStorage.getItem('branchcode') || '';
  const createdBy = localStorage.getItem('userName');

  // Static options
  const statusOptions = ['Open', 'Closed', 'Lost', 'Won', 'In Progress'];
  const productStatusOptions = ['New', 'Assigned', 'Open', 'In-Progress', 'Recycled', 'Dead', 'Completed'];

  // Form data
  const [formData, setFormData] = useState({
    address: '',
    branchName: '',
    clientName: '',
    opportunityDate: dayjs(),
    closedDate: dayjs().add(30, 'day'),
    contactName: '',
    description: '',
    designation: '',
    email: '',
    finYear: finYear,
    gstNo: '',
    mobileNo: '',
    status: 'Open'
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({
    clientName: '',
    contactName: '',
    mobileNo: '',
    email: '',
    branch: ''
  });

  // Opportunity details
  const [opportunityDetails, setOpportunityDetails] = useState([
    {
      category: '',
      description: '',
      opportunityAmount: 0,
      productName: '',
      quantity: 1,
      remarks: '',
      status: '',
      subCategory: ''
    }
  ]);

  const [detailErrors, setDetailErrors] = useState([
    {
      productName: '',
      category: '',
      opportunityAmount: ''
    }
  ]);

  // Table columns for list view
  const listViewColumns = useMemo(
    () => [
      { accessorKey: 'docId', header: 'Opportunity ID', size: 140 },
      { accessorKey: 'clientName', header: 'Client Name', size: 140 },
      { accessorKey: 'contactName', header: 'Contact', size: 140 },
      { accessorKey: 'mobileNo', header: 'Mobile No', size: 140 },
      { accessorKey: 'email', header: 'Email', size: 140 },
      { accessorKey: 'status', header: 'Status', size: 140 },
      { accessorKey: 'totalAmount', header: 'Total Amount', size: 140 }
    ],
    []
  );

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return opportunityDetails.reduce((sum, item) => sum + (parseFloat(item.opportunityAmount) || 0), 0);
  }, [opportunityDetails]);

  // Initial data fetch
  useEffect(() => {
    getAllOpportunities();
    getOpportunityDocId();
    getAllCategories();
    getClientName();
    getProductName();
  }, []);

  const getAllCategories = async () => {
    try {
      const response = await apiCalls('get', `/ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      if (response.status) {
        setCategoryList(response.paramObjectsMap?.categoryVO || []);
      } else {
        showToast('error', response.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('error', 'Failed to load categories');
    }
  };
  const getBranch = async (clientName) => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getBranchNameFromLeadBranch?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
      );
      if (response.status === true) {
        setBranchList(response.paramObjectsMap.branchName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getClientName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getClientNameFromLeadScreen?orgId=${orgId}`);
      if (response.status === true) {
        setClientNameList(response.paramObjectsMap.clientName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getContactName = async (branchName, clientName) => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getContactNameFromLeadContact?branchName=${branchName}&clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
      );
      if (response.status === true) {
        setContactNameList(response.paramObjectsMap.contactDetails || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getProductName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getProductNameFromProduct?orgId=${orgId}`);
      if (response.status === true) {
        setProductNameList(response.paramObjectsMap.productName || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };

  const getOpportunityDocId = async () => {
    if (editId) return;

    try {
      setIsDocIdLoading(true);
      const response = await apiCalls(
        'get',
        `/transaction/getOpportunityDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );

      if (response.status && response.paramObjectsMap?.opportunityDocId) {
        setDocId(response.paramObjectsMap.opportunityDocId);
      } else {
        showToast('error', response.paramObjectsMap?.message || 'Failed to generate opportunity ID');
      }
    } catch (err) {
      console.error('Error fetching opportunity docId:', err);
      showToast('error', 'Failed to generate opportunity ID');
    } finally {
      setIsDocIdLoading(false);
    }
  };

  const getAllOpportunities = async () => {
    setIsLoading(true);
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getOpportunityByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      // if (response.status) {
      //     const opportunities = response.paramObjectsMap?.opportunityVO.reverse() || [];
      //     setListViewData(opportunities.map(opp => ({
      //         ...opp,
      //         totalAmount: opp.opportunityDetailsVO?.reduce((sum, item) => sum + (item.opportunityAmount || 0), 0) || 0
      //     })));
      // }
      if (response.status === true && response.paramObjectsMap?.opportunityVO?.length > 0) {
        setListViewData([...response.paramObjectsMap.opportunityVO].reverse());
        setIsLoading(false);
        const counts = {
          New: 0,
          Qualified: 0,
          Unqualified: 0,
          InProgress: 0
        };
        response.paramObjectsMap.opportunityVO.forEach((lead) => {
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
          New: response.paramObjectsMap.opportunityVO.length
        }));
      } else {
        setIsLoading(false);
        showToast('error', response.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching opportunities:', error);
      showToast('error', 'Failed to fetch opportunities');
    }
  };

  const getOpportunityById = async (row) => {
    setEditId(row.original.id);
    try {
      setIsLoading(true);
      const response = await apiCalls('get', `/transaction/getOpportunityById?id=${row.original.id}`);

      if (response.status) {
        setListView(false);
        const opportunity = response.paramObjectsMap.opportunityVO;

        if (!opportunity) {
          showToast('error', 'Opportunity not found');
          return;
        }
        getBranch(opportunity.clientName);
        getContactName(opportunity.branchName, opportunity.clientName);
        setFormData({
          address: opportunity.address || '',
          opportunityDate: opportunity.docDate || '',
          branchCode: opportunity.branchCode || branchCode,
          branch: opportunity.branch || branch,
          branchName: opportunity.branchName || '',
          clientName: opportunity.clientName || '',
          closedDate: opportunity.closedDate || dayjs().add(30, 'day').format('YYYY-MM-DD'),
          contactName: opportunity.contactName || '',
          description: opportunity.description || '',
          designation: opportunity.designation || '',
          email: opportunity.email || '',
          finYear: opportunity.finYear || finYear.toString(),
          gstNo: opportunity.gstNo || '',
          mobileNo: opportunity.mobileNo || '',
          status: opportunity.status || 'Open'
        });

        setDocId(opportunity.docId || '');

        // Set opportunity details
        const details = opportunity.opportunityDetailsVO?.map((detail) => ({
          id: detail.id, // Include id for existing items
          category: detail.category || '',
          description: detail.description || '',
          opportunityAmount: detail.opportunityAmount || 0,
          productName: detail.productName || '',
          quantity: detail.quantity || 1,
          remarks: detail.remarks || '',
          status: detail.status || '',
          subCategory: detail.subCategory || ''
        })) || [
          {
            category: '',
            description: '',
            opportunityAmount: 0,
            productName: '',
            quantity: 1,
            remarks: '',
            status: '',
            subCategory: ''
          }
        ];

        setOpportunityDetails(details);
        setDetailErrors(
          details.map(() => ({
            productName: '',
            category: '',
            opportunityAmount: ''
          }))
        );
      } else {
        showToast('error', response.message || 'Failed to fetch opportunity details');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      showToast('error', 'Failed to fetch opportunity details');
    } finally {
      setIsLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is modified
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateMainField = (field, value) => {
    const newErrors = { ...fieldErrors };

    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field] = 'Invalid email format';
        } else {
          newErrors[field] = '';
        }
        break;

      case 'mobileNo':
        if (value && !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(value)) {
          newErrors[field] = 'Invalid mobile number (10 digits required)';
        } else {
          newErrors[field] = '';
        }
        break;

      case 'clientName':
      case 'contactName':
        if (!value) {
          newErrors[field] = 'This field is required';
        } else {
          newErrors[field] = '';
        }
        break;

      default:
        break;
    }

    setFieldErrors(newErrors);
  };

  const validateDetailField = (index, field, value) => {
    const newErrors = [...detailErrors];
    if (!newErrors[index]) newErrors[index] = {};

    if (field === 'opportunityAmount') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        newErrors[index][field] = 'Must be a number';
      } else if (numValue <= 0) {
        newErrors[index][field] = 'Amount must be positive';
      } else {
        newErrors[index][field] = '';
      }
    } else if (!value && ['productName', 'category'].includes(field)) {
      newErrors[index][field] = 'This field is required';
    } else {
      newErrors[index][field] = '';
    }

    setDetailErrors(newErrors);
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { ...fieldErrors };

    // Required field validation
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
      isValid = false;
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
      isValid = false;
    }
    if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = 'Invalid mobile number (10 digits required)';
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.branchName) {
      newErrors.branch = 'Branch is required';
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const validateDetails = () => {
    let isValid = true;
    const newErrors = [];

    opportunityDetails.forEach((detail, index) => {
      const error = {};

      if (!detail.productName?.trim()) {
        error.productName = 'Product name is required';
        isValid = false;
      }

      if (!detail.category) {
        error.category = 'Category is required';
        isValid = false;
      }

      const amount = parseFloat(detail.opportunityAmount);
      if (isNaN(amount)) {
        error.opportunityAmount = 'Must be a valid number';
        isValid = false;
      } else if (amount <= 0) {
        error.opportunityAmount = 'Amount must be positive';
        isValid = false;
      }

      newErrors[index] = error;
    });

    setDetailErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    const isFormValid = validateFields();
    const isDetailsValid = validateDetails();

    if (!isFormValid || !isDetailsValid) {
      showToast('error', 'Please correct the highlighted fields');
      return;
    }

    setIsLoading(true);

    const selectedBranch = branchList.find((b) => b.branchCode === formData.branch);

    const payload = {
      ...(editId && { id: editId }),
      address: formData.address,
      branch: branch,
      branchName: formData.branchName,
      branchCode: branchCode,
      clientName: formData.clientName,
      closedDate: formData.closedDate,
      contactName: formData.contactName,
      description: formData.description,
      designation: formData.designation,
      email: formData.email,
      finYear: finYear,
      gstNo: formData.gstNo,
      mobileNo: formData.mobileNo,
      status: formData.status,
      active: true,
      orgId: orgId,
      createdBy: createdBy,
      opportunityDetailsDTO: opportunityDetails.map((detail) => ({
        ...(detail.id && { id: detail.id }), // Include id for existing items
        productName: detail.productName,
        category: detail.category,
        subCategory: detail.subCategory,
        opportunityAmount: parseFloat(detail.opportunityAmount) || 0,
        quantity: parseInt(detail.quantity) || 1,
        status: detail.status,
        description: detail.description,
        remarks: detail.remarks
      }))
    };

    try {
      const response = await apiCalls('put', '/transaction/createUpdateOpprtunity', payload);
      if (response.status) {
        showToast('success', editId ? 'Opportunity updated successfully' : 'Opportunity created successfully');
        handleClear();
        getAllOpportunities();
      } else {
        showToast('error', response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      showToast('error', 'Failed to save opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBranchList([]);
    setContactNameList([]);
    setFormData({
      address: '',
      opportunityDate: dayjs(),
      branchName: '',
      clientName: '',
      closedDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      contactName: '',
      description: '',
      designation: '',
      email: '',
      finYear: finYear.toString(),
      gstNo: '',
      mobileNo: '',
      status: 'Open'
    });

    setFieldErrors({
      clientName: '',
      contactName: '',
      mobileNo: '',
      email: '',
      branch: ''
    });

    setOpportunityDetails([
      {
        category: '',
        description: '',
        opportunityAmount: 0,
        productName: '',
        quantity: 1,
        remarks: '',
        status: '',
        subCategory: ''
      }
    ]);

    setDetailErrors([
      {
        productName: '',
        category: '',
        opportunityAmount: ''
      }
    ]);

    setEditId('');
    getOpportunityDocId();
  };

  const handleAddDetail = () => {
    const lastDetail = opportunityDetails[opportunityDetails.length - 1];
    const lastError = detailErrors[detailErrors.length - 1] || {};

    const productNameValid = lastDetail.productName?.trim();
    const categoryValid = lastDetail.category;
    const amount = parseFloat(lastDetail.opportunityAmount);
    const amountValid = !isNaN(amount) && amount > 0;

    // if (!productNameValid || !categoryValid || !amountValid) {
    //     const newErrors = [...detailErrors];
    //     newErrors[newErrors.length - 1] = {
    //         productName: !productNameValid ? 'Product name is required' : '',
    //         category: !categoryValid ? 'Category is required' : '',
    //         opportunityAmount: isNaN(amount)
    //             ? 'Must be a number'
    //             : amount <= 0
    //                 ? 'Amount must be positive'
    //                 : ''
    //     };
    //     setDetailErrors(newErrors);
    //     showToast('warning', 'Please fill current product details before adding new');
    //     return;
    // }

    setOpportunityDetails((prev) => [
      ...prev,
      {
        category: '',
        description: '',
        opportunityAmount: 0,
        productName: '',
        quantity: 1,
        remarks: '',
        status: '',
        subCategory: ''
      }
    ]);

    setDetailErrors((prev) => [
      ...prev,
      {
        productName: '',
        category: '',
        opportunityAmount: ''
      }
    ]);
  };

  const handleDeleteDetail = (index) => {
    if (opportunityDetails.length <= 1) {
      showToast('warning', 'At least one product is required');
      return;
    }

    const newDetails = opportunityDetails.filter((_, i) => i !== index);
    const newErrors = detailErrors.filter((_, i) => i !== index);

    setOpportunityDetails(newDetails);
    setDetailErrors(newErrors);
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...opportunityDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setOpportunityDetails(newDetails);

    if (value && detailErrors[index]?.[field]) {
      const newErrors = [...detailErrors];
      newErrors[index] = { ...newErrors[index], [field]: '' };
      setDetailErrors(newErrors);
    }
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };
  const handleDateChange = (field, date) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : null;
    setFormData((prev) => ({ ...prev, [field]: formattedDate }));
  };
  // const handleMyLeads = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //     setMyOpportunities(!myOpportunities);
  //   }, 300);
  // };
  const handleMyOpportunities = async (tab) => {
    setLoading(true);
    try {
      let response = await apiCalls(
        'get',
        `/transaction/getMyOpportunity?assginedName=${createdBy}&branchCode=${branchCode}&orgId=${orgId}`
      );
      if (response) {
        setMyOpportunities(!myOpportunities);
        setRowData(response?.paramObjectsMap?.myOpportunity || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setRowData([]);
      showToast('error', 'Report Fetch failed');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => setMyOpportunities(false);
  const myOppColumns = [
    // { accessorKey: 'docId', header: 'Doc No', size: 100 },
    {
      accessorKey: 'docId',
      header: 'Doc Id',
      size: 100,
      Cell: ({ row }) => {
        const docId = row.original.docId;
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMyOpportunities(false);
              getBranch(row.original.clientName);
              getContactName(row.original.branchName, row.original.clientName);
              setFormData((prev) => ({
                ...prev,
                clientName: row.original.clientName || '',
                branchName: row.original.branchName || '',
                gstNo: row.original.gstNo || '',
                address: row.original.address || '',
                contactName: row.original.contactName || '',
                designation: row.original.designation || '',
                mobileNo: row.original.mobileNo || '',
                email: row.original.email || ''
              }));
            }}
            style={{
              color: '#f59e0b', // Amber
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s, text-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#fbbf24'; // Brighter yellow on hover
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#f59e0b';
            }}
          >
            {docId}
          </a>
        );
      }
    },
    { accessorKey: 'docDate', header: 'Date', size: 100 },
    { accessorKey: 'clientName', header: 'Client Name', size: 100 },
    { accessorKey: 'gstNo', header: 'Reg No', size: 100 },
    { accessorKey: 'contactName', header: 'Name', size: 100 },
    { accessorKey: 'designation', header: 'Designation', size: 100 },
    { accessorKey: 'mobileNo', header: 'Mobile No', size: 100 },
    { accessorKey: 'branchName', header: 'Branch', size: 100 },
    { accessorKey: 'email', header: 'Email', size: 100 },
    { accessorKey: 'address', header: 'Address', size: 80 }
  ];
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
            <div className="d-flex justify-content-between mb-4" style={{ marginBottom: '20px' }}>
              <div className="d-flex flex-wrap">
                {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
                {!listView && (
                  <>
                    <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} loading={isLoading} />
                  </>
                )}
              </div>
              {!listView && (
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleMyOpportunities}
                    startIcon={<PersonPinCircleIcon />}
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      py: 0.5,
                      fontSize: '14px',
                      borderRadius: '30px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: loading ? 'none' : 'scale(1.08)',
                        boxShadow: loading ? 'none' : '0px 6px 15px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'My Opportunities'}
                  </Button>
                </div>
              )}
            </div>
          )}
          {listView && !isLoading ? (
            <CommonTableWithStatus
              data={listViewData}
              columns={listViewColumns}
              enableEditing={true}
              toEdit={getOpportunityById}
              summaryCounts={summaryCounts}
            />
          ) : (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Opportunity ID"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    value={isDocIdLoading ? 'Generating...' : docId}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Opportunity Date"
                        value={formData.opportunityDate ? dayjs(formData.opportunityDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('opportunityDate', date)}
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
                  <Autocomplete
                    options={clientNameList}
                    getOptionLabel={(option) => (option?.clientName ? `${option.clientName}` : '')}
                    value={clientNameList.find((item) => item.clientName === formData.clientName) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          clientName: newValue.clientName
                        }));
                        setFieldErrors((prev) => ({ ...prev, clientName: '' }));
                        getBranch(newValue.clientName);
                      } else {
                        setFormData((prev) => ({ ...prev, clientName: '' }));
                        setFieldErrors((prev) => ({ ...prev, clientName: 'Client Name is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Client Name <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.clientName}
                        helperText={fieldErrors.clientName}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={branchList}
                    getOptionLabel={(option) => (option?.branch ? `${option.branch}` : '')}
                    value={branchList.find((item) => item.branch === formData.branchName) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          branchName: newValue.branch,
                          gstNo: newValue.gstNo,
                          address: newValue.address
                        }));
                        setFieldErrors((prev) => ({ ...prev, branch: '', address: '' }));
                        getContactName(newValue.branch, formData.clientName);
                      } else {
                        setFormData((prev) => ({ ...prev, branchName: '' }));
                        setFieldErrors((prev) => ({ ...prev, branch: 'Branch is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Branch <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.branch}
                        helperText={fieldErrors.branch}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label={
                      <span>
                        Gst No <span className="asterisk">*</span>
                      </span>
                    }
                    variant="outlined"
                    size="small"
                    disabled
                    fullWidth
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleInputChange}
                  />
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
                    disabled
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <Autocomplete
                    options={contactNameList}
                    getOptionLabel={(option) => (option?.name ? `${option.name}` : '')}
                    value={contactNameList.find((item) => item.name === formData.contactName) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          contactName: newValue.name,
                          designation: newValue.designation,
                          mobileNo: newValue.mobileNumber,
                          email: newValue.email
                        }));
                        setFieldErrors((prev) => ({ ...prev, contactName: '', designation: '', mobileNo: '', email: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, contactName: '' }));
                        setFieldErrors((prev) => ({ ...prev, contactName: 'Contact Name is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Contact Name <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.contactName}
                        helperText={fieldErrors.contactName}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Designation"
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Mobile No"
                    variant="outlined"
                    disabled
                    size="small"
                    fullWidth
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    // error={!!fieldErrors.mobileNo}
                    helperText={fieldErrors.mobileNo}
                    onBlur={(e) => validateMainField('mobileNo', e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Email"
                    disabled
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    helperText={fieldErrors.email}
                    onBlur={(e) => validateMainField('email', e.target.value)}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Expected Closed Date"
                        value={formData.closedDate ? dayjs(formData.closedDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('closedDate', date)}
                        slotProps={{
                          textField: {
                            size: 'small'
                          }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Description"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                  />
                </div>
              </div>

              <div className="row mt-2">
                <Box sx={{ width: '100%' }}>
                  <Tabs value={value} textColor="secondary" indicatorColor="secondary">
                    <Tab value={0} label="Details" />
                  </Tabs>
                </Box>

                <Box sx={{ padding: 2 }}>
                  {value === 0 && (
                    <>
                      <div className="mb-1">
                        <ActionButton title="Add Product" icon={AddIcon} onClick={handleAddDetail} />
                      </div>
                      <div className="col-lg-12">
                        <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                          <Box
                          // sx={{
                          //     '&::-webkit-scrollbar': {
                          //         height: '8px',
                          //     },
                          //     '&::-webkit-scrollbar-track': {
                          //         backgroundColor: 'transparent',
                          //     },
                          //     '&::-webkit-scrollbar-thumb': {
                          //         backgroundColor: '#555',
                          //         borderRadius: '10px',
                          //     },
                          //     '&::-webkit-scrollbar-thumb:hover': {
                          //         backgroundColor: '#888',
                          //     },
                          //     borderRadius: '8px',
                          //     backgroundColor: '#1c1f3a',
                          //     boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.4)',
                          //     overflowX: 'auto',
                          // }}
                          >
                            <table className="table table-bordered">
                              <thead>
                                <tr style={{ background: '#374151', color: '#ede7f6' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    #
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">Product Name *</th>
                                  <th className="px-2 py-2 text-white text-center">Category *</th>
                                  <th className="px-2 py-2 text-white text-center">Sub Category</th>
                                  <th className="px-2 py-2 text-white text-center">Amt *</th>
                                  <th className="px-2 py-2 text-white text-center">Quantity</th>
                                  <th className="px-2 py-2 text-white text-center">Status</th>
                                  <th className="px-2 py-2 text-white text-center">Remarks</th>
                                  <th className="px-2 py-2 text-white text-center">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {opportunityDetails.map((detail, index) => (
                                  <tr key={index}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton
                                        title="Delete"
                                        icon={DeleteIcon}
                                        onClick={() => handleDeleteDetail(index)}
                                        aria-label={`Delete product ${index + 1}`}
                                      />
                                    </td>
                                    <td className="text-center pt-3">{index + 1}</td>
                                    <td>
                                      <Box sx={{ minWidth: 150, flexGrow: 1 }}>
                                        <Autocomplete
                                          options={productNameList}
                                          getOptionLabel={(option) => option?.productName || ''}
                                          value={productNameList.find((item) => item.productName === detail.productName) || null}
                                          onChange={(event, newValue) => {
                                            const updatedOpportunities = [...opportunityDetails];
                                            const updatedOpportunitiesErrors = [...detailErrors];
                                            if (newValue) {
                                              updatedOpportunities[index] = {
                                                ...updatedOpportunities[index],
                                                productName: newValue.productName || '',
                                                category: newValue.category || '',
                                                subCategory: newValue.subCategory || ''
                                              };
                                              updatedOpportunitiesErrors[index] = {
                                                ...updatedOpportunitiesErrors[index],
                                                productName: '',
                                                category: '',
                                                subCategory: ''
                                              };
                                            } else {
                                              updatedOpportunities[index] = {
                                                ...updatedOpportunities[index],
                                                productName: '',
                                                subCategory: '',
                                                category: ''
                                              };
                                            }
                                            setOpportunityDetails(updatedOpportunities);
                                            setDetailErrors(updatedOpportunitiesErrors);
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              size="small"
                                              fullWidth
                                              error={!!detailErrors[index]?.productName}
                                              helperText={detailErrors[index]?.productName}
                                            />
                                          )}
                                        />
                                      </Box>
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={detail.category}
                                        disabled
                                        sx={{ minWidth: '100px' }}
                                        onChange={(e) => handleDetailChange(index, 'category', e.target.value)}
                                        onBlur={(e) => validateDetailField(index, 'category', e.target.value)}
                                        error={!!detailErrors[index]?.category}
                                        helperText={detailErrors[index]?.category}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        value={detail.subCategory}
                                        disabled
                                        sx={{ minWidth: '120px' }}
                                        onChange={(e) => handleDetailChange(index, 'subCategory', e.target.value)}
                                        onBlur={(e) => validateDetailField(index, 'subCategory', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        sx={{ minWidth: '120px' }}
                                        value={detail.opportunityAmount}
                                        onChange={(e) => handleDetailChange(index, 'opportunityAmount', e.target.value)}
                                        onBlur={(e) => validateDetailField(index, 'opportunityAmount', e.target.value)}
                                        error={!!detailErrors[index]?.opportunityAmount}
                                        helperText={detailErrors[index]?.opportunityAmount}
                                        inputProps={{ min: 0, step: '0.01' }}
                                      />
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={detail.quantity}
                                        onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                                        inputProps={{ min: 1 }}
                                      />
                                    </td>

                                    <td>
                                      <FormControl fullWidth size="small">
                                        <Select
                                          sx={{ minWidth: '100px' }}
                                          value={detail.status}
                                          onChange={(e) => handleDetailChange(index, 'status', e.target.value)}
                                        >
                                          {productStatusOptions.map((status) => (
                                            <MenuItem key={status} value={status}>
                                              {status}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </td>
                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        multiline
                                        sx={{ minWidth: '150px' }}
                                        value={detail.remarks}
                                        onChange={(e) => handleDetailChange(index, 'remarks', e.target.value)}
                                      />
                                    </td>

                                    <td>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        sx={{ minWidth: '150px' }}
                                        value={detail.description}
                                        onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                                        multiline
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
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
      {myOpportunities && (
        <>
          <Dialog open={myOpportunities} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }} id="draggable-dialog-title">
              My Opportunity
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  color: 'white'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                p: 0,
                backgroundColor: '#0f0f1a'
              }}
            >
              <CommonReportTable
                data={rowData}
                columns={myOppColumns}
                isListView={listView}
                fileName={'My Opportunities'}
                // sumFields={['tdsAmt', 'receivableAmount', 'arapSettled', 'arApOutstanding', 'onAccount']}
                // handleDownloadPdf={() =>
                //     handleDownloadPdf({
                //         logo: listViewData[0]?.companyLogo,
                //         columns: reportColumns,
                //         data: rowData,
                //         formData,
                //         fileName: 'Lead Report',
                //         loginUserName
                //     })
                // }
                // handleDownloadExcel={() => handleDownloadExcel({ logo: listViewData[0]?.companyLogo })}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default Opportunity;

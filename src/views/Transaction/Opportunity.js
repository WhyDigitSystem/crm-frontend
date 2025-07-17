import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, Box, Tab, Tabs, FormControlLabel, Checkbox } from '@mui/material';
import { useState, useEffect } from 'react';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import apiCalls from 'apicall';

const Opportunity = () => {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(parseInt(localStorage.getItem('orgId')));
    const [createdBy] = useState(localStorage.getItem('userName'));
    const [branchCode] = useState(localStorage.getItem('branchCode') || '');
    const [branchName] = useState(localStorage.getItem('branch') || '');
    const [value, setValue] = useState(0);
    const [editId, setEditId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [listView, setListView] = useState(false);
    const [docId, setDocId] = useState('');

    const [formData, setFormData] = useState({
        active: true,
        address: '',
        branch: branchName,
        branchCode: branchCode,
        clientName: '',
        closedDate: '',
        contactName: '',
        description: '',
        email: '',
        finYear: '2025',
        gstNo: '',
        mobileNo: '',
        cancelRemarks: ''
    });

    const [fieldErrors, setFieldErrors] = useState({
        clientName: '',
        contactName: '',
        mobileNo: ''
    });

    const [opportunityDetailsData, setOpportunityDetailsData] = useState([{
        id: null,
        category: '',
        subCategory: '',
        productName: '',
        description: '',
        quantity: 0,
        opportunityAmount: 0,
        status: '',
        remarks: ''
    }]);

    const [opportunityDetailsErrors, setOpportunityDetailsErrors] = useState([{
        category: '',
        productName: '',
        opportunityAmount: ''
    }]);

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Opportunity ID', size: 140 },
        { accessorKey: 'clientName', header: 'Client Name', size: 140 },
        { accessorKey: 'contactName', header: 'Contact Name', size: 140 },
        { accessorKey: 'mobileNo', header: 'Mobile No', size: 140 },
        { accessorKey: 'branchName', header: 'Branch', size: 140 },
        { accessorKey: 'status', header: 'Status', size: 140 },
        { accessorKey: 'totalAmount', header: 'Amount', size: 140 }
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            await getAllOpportunities();
            await generateDocId();
        };
        fetchInitialData();
    }, []);

    const generateDocId = async () => {
        try {
            const response = await apiCalls('get',
                `/transaction/getOpportunityDocId?branch=${branchName}&branchCode=${branchCode}&finYear=2025&orgId=${orgId}`);

            if (response.status) {
                setDocId(response.paramObjectsMap.opportunityDocId);
                setFormData(prev => ({
                    ...prev,
                    docId: response.paramObjectsMap.opportunityDocId
                }));
            }
        } catch (error) {
            console.error('Error generating doc ID:', error);
            showToast('error', 'Failed to generate document ID');
        }
    };

    const getAllOpportunities = async () => {
        try {
            const response = await apiCalls('get',
                `/transaction/getOpportunityByOrgId?branchCode=${branchCode}&finYear=2025&orgId=${orgId}`);

            if (response.status) {
                setListViewData(response.paramObjectsMap.opportunityVO || []);
            } else {
                showToast('error', response.message || 'Failed to fetch opportunities');
            }
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            showToast('error', 'Failed to fetch opportunities');
        }
    };

    const getOpportunityById = async (row) => {
        setEditId(row.original.id);
        try {
            const response = await apiCalls('get', `/transaction/getOpportunityById?id=${row.original.id}`);

            if (response.status && response.paramObjectsMap.opportunityVO) {
                setListView(false);
                const opportunity = response.paramObjectsMap.opportunityVO;

                setFormData({
                    active: opportunity.active,
                    address: opportunity.address,
                    branch: opportunity.branch,
                    branchCode: opportunity.branchCode,
                    branchName: opportunity.branchName,
                    clientName: opportunity.clientName,
                    closedDate: opportunity.closedDate,
                    contactName: opportunity.contactName,
                    description: opportunity.description,
                    email: opportunity.email,
                    finYear: opportunity.finYear,
                    gstNo: opportunity.gstNo,
                    mobileNo: opportunity.mobileNo,
                    cancelRemarks: opportunity.cancelRemarks,
                    docId: opportunity.docId
                });

                setOpportunityDetailsData(
                    opportunity.opportunityDetailsDTO.map(detail => ({
                        id: detail.id,
                        category: detail.category,
                        subCategory: detail.subCategory,
                        productName: detail.productName,
                        description: detail.description,
                        quantity: detail.quantity,
                        opportunityAmount: detail.opportunityAmount,
                        status: detail.status,
                        remarks: detail.remarks
                    })) || [{
                        id: null,
                        category: '',
                        subCategory: '',
                        productName: '',
                        description: '',
                        quantity: 0,
                        opportunityAmount: 0,
                        status: '',
                        remarks: ''
                    }]
                );
            }
        } catch (error) {
            console.error('Error fetching opportunity details:', error);
            showToast('error', 'Failed to fetch opportunity details');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const updatedValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));

        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSave = async () => {
        // Validate main form fields
        const errors = {};
        if (!formData.clientName) errors.clientName = 'Client name is required';
        if (!formData.contactName) errors.contactName = 'Contact name is required';
        if (!formData.mobileNo) errors.mobileNo = 'Mobile number is required';

        // Validate details
        const detailsErrors = opportunityDetailsData.map(detail => {
            const error = {};
            if (!detail.category) error.category = 'Category is required';
            if (!detail.productName) error.productName = 'Product name is required';
            if (!detail.opportunityAmount || detail.opportunityAmount <= 0)
                error.opportunityAmount = 'Valid amount is required';
            return error;
        });

        if (Object.keys(errors).length > 0 || detailsErrors.some(e => Object.keys(e).length > 0)) {
            setFieldErrors(errors);
            setOpportunityDetailsErrors(detailsErrors);
            showToast('error', 'Please fill all required fields');
            return;
        }

        setIsLoading(true);

        // Prepare details payload
        const opportunityDetailsDTO = opportunityDetailsData.map(row => ({
            ...(row.id && { id: row.id }),
            category: row.category,
            subCategory: row.subCategory,
            productName: row.productName,
            description: row.description,
            quantity: row.quantity,
            opportunityAmount: row.opportunityAmount,
            status: row.status,
            remarks: row.remarks
        }));

        const payload = {
            ...(editId && { id: editId }),
            ...formData,
            orgId: orgId,
            branch:branchName,
            branchCode:branchCode,
            createdBy: createdBy,
            opportunityDetailsDTO: opportunityDetailsDTO
        };

        try {
            const response = await apiCalls('put', '/transaction/createUpdateOpprtunity', payload);
            if (response.status) {
                showToast('success', editId ? 'Opportunity updated successfully' : 'Opportunity created successfully');
                handleClear();
                getAllOpportunities();
                await generateDocId();
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
        setFormData({
            active: true,
            address: '',
            branch: branchName,
            branchCode: branchCode,
            branchName: branchName,
            clientName: '',
            closedDate: '',
            contactName: '',
            description: '',
            email: '',
            finYear: '2025',
            gstNo: '',
            mobileNo: '',
            cancelRemarks: '',
            docId: docId
        });

        setFieldErrors({
            clientName: '',
            contactName: '',
            mobileNo: ''
        });

        setOpportunityDetailsData([{
            id: null,
            category: '',
            subCategory: '',
            productName: '',
            description: '',
            quantity: 0,
            opportunityAmount: 0,
            status: '',
            remarks: ''
        }]);

        setOpportunityDetailsErrors([{
            category: '',
            productName: '',
            opportunityAmount: ''
        }]);

        setEditId('');
    };

    const handleAddRow = () => {
        const lastRow = opportunityDetailsData[opportunityDetailsData.length - 1];

        if (!lastRow.category || !lastRow.productName || !lastRow.opportunityAmount) {
            const newErrors = [...opportunityDetailsErrors];
            const lastIndex = newErrors.length - 1;
            newErrors[lastIndex] = {
                category: !lastRow.category ? 'Category is required' : '',
                productName: !lastRow.productName ? 'Product name is required' : '',
                opportunityAmount: !lastRow.opportunityAmount ? 'Valid amount is required' : ''
            };
            setOpportunityDetailsErrors(newErrors);
            showToast('warning', 'Please fill current row before adding new');
            return;
        }

        const newId = opportunityDetailsData.length > 0 ? Math.min(...opportunityDetailsData.map(d => d.id)) - 1 : -1;

        setOpportunityDetailsData(prev => [
            ...prev,
            {
                id: newId,
                category: '',
                subCategory: '',
                productName: '',
                description: '',
                quantity: 0,
                opportunityAmount: 0,
                status: '',
                remarks: ''
            }
        ]);

        setOpportunityDetailsErrors(prev => [
            ...prev,
            {
                category: '',
                productName: '',
                opportunityAmount: ''
            }
        ]);
    };

    const handleDeleteRow = (id) => {
        if (opportunityDetailsData.length <= 1) {
            showToast('warning', 'At least one opportunity detail is required');
            return;
        }

        const index = opportunityDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = opportunityDetailsData.filter(d => d.id !== id);
        const newErrors = opportunityDetailsErrors.filter((_, i) => i !== index);

        setOpportunityDetailsData(newData);
        setOpportunityDetailsErrors(newErrors);
    };

    const handleDetailChange = (id, field, value) => {
        const index = opportunityDetailsData.findIndex(d => d.id === id);
        if (index === -1) return;

        const newData = [...opportunityDetailsData];
        newData[index] = { ...newData[index], [field]: value };
        setOpportunityDetailsData(newData);

        if (value) {
            const newErrors = [...opportunityDetailsErrors];
            newErrors[index] = { ...newErrors[index], [field]: '' };
            setOpportunityDetailsErrors(newErrors);
        }
    };

    const handleView = () => setListView(!listView);
    const handleTabChange = (_, newValue) => setValue(newValue);

    return (
        <>
            <div>
                <ToastComponent />
            </div>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} disabled={isLoading} />
                    </div>

                    {!listView ? (
                        <>
                            <div className="row d-flex ml">
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Opportunity ID"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={formData.docId || docId}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Client Name*"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.clientName}
                                        helperText={fieldErrors.clientName}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Contact Name*"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.contactName}
                                        helperText={fieldErrors.contactName}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Mobile No*"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.mobileNo}
                                        helperText={fieldErrors.mobileNo}
                                    />
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
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="GST No"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="gstNo"
                                        value={formData.gstNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Address"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Branch"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={formData.branch}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        label="Closed Date"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        name="closedDate"
                                        value={formData.closedDate}
                                        onChange={handleInputChange}
                                    />
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
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.active}
                                                onChange={handleInputChange}
                                                name="active"
                                                color="primary"
                                            />
                                        }
                                        label="Active Status"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <TextField
                                        label="Cancel Remarks"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="cancelRemarks"
                                        value={formData.cancelRemarks}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                        <Tab value={0} label="Opportunity Details" />
                                    </Tabs>
                                </Box>

                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="mb-1">
                                                <ActionButton title="Add Row" icon={AddIcon} onClick={handleAddRow} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr
                                                                    style={{ background: '#5e35b1', color: '#ede7f6' }}
                                                                >
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                                                        Action
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="px-2 py-2 text-white text-center">Category*</th>
                                                                    <th className="px-2 py-2 text-white text-center">Sub Category</th>
                                                                    <th className="px-2 py-2 text-white text-center">Product Name*</th>
                                                                    <th className="px-2 py-2 text-white text-center">Description</th>
                                                                    <th className="px-2 py-2 text-white text-center">Quantity</th>
                                                                    <th className="px-2 py-2 text-white text-center">Amount*</th>
                                                                    <th className="px-2 py-2 text-white text-center">Status</th>
                                                                    <th className="px-2 py-2 text-white text-center">Remarks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {opportunityDetailsData.map((row, index) => (
                                                                    <tr key={row.id}>
                                                                        <td className="border px-2 py-2 text-center">
                                                                            <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteRow(row.id)} />
                                                                        </td>
                                                                        <td className="text-center pt-3">{index + 1}</td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.category}
                                                                                onChange={(e) => handleDetailChange(row.id, 'category', e.target.value)}
                                                                                error={!!opportunityDetailsErrors[index]?.category}
                                                                                helperText={opportunityDetailsErrors[index]?.category}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.subCategory}
                                                                                onChange={(e) => handleDetailChange(row.id, 'subCategory', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.productName}
                                                                                onChange={(e) => handleDetailChange(row.id, 'productName', e.target.value)}
                                                                                error={!!opportunityDetailsErrors[index]?.productName}
                                                                                helperText={opportunityDetailsErrors[index]?.productName}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.description}
                                                                                onChange={(e) => handleDetailChange(row.id, 'description', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                type="number"
                                                                                value={row.quantity}
                                                                                onChange={(e) => handleDetailChange(row.id, 'quantity', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                type="number"
                                                                                value={row.opportunityAmount}
                                                                                onChange={(e) => handleDetailChange(row.id, 'opportunityAmount', e.target.value)}
                                                                                error={!!opportunityDetailsErrors[index]?.opportunityAmount}
                                                                                helperText={opportunityDetailsErrors[index]?.opportunityAmount}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.status}
                                                                                onChange={(e) => handleDetailChange(row.id, 'status', e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                value={row.remarks}
                                                                                onChange={(e) => handleDetailChange(row.id, 'remarks', e.target.value)}
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
                    ) : (
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing={true}
                            toEdit={getOpportunityById}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Opportunity;
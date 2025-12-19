import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    Box,
    Autocomplete,
    Paper,
    Checkbox,
    FormControlLabel,
    Typography,
    Button,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    IconButton,
    Alert,
    Snackbar,
    Tooltip,
    Fade,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Pagination,
    Stack,
    Avatar,
    TextField,
    Divider
} from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import { AddCircle, Delete } from '@mui/icons-material';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import KPIBox from 'views/basicMaster/KPIBox';
export const ExpenseClaims = ({ selectedRow }) => {
    useEffect(() => {
        if (selectedRow) {
            setIsLoading(true);
            getExpenseClaimsById({ original: selectedRow });
        }
    }, [selectedRow]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [employeeName] = useState(localStorage.getItem('employeeName'));
    const [isLoading, setIsLoading] = useState(false);
    const [expenseTypeList, setExpenseTypeList] = useState([]);
    const [transportModeList, setTransportModeList] = useState([]);
    const [mealTypeList, setMealTypeList] = useState([]);
    const [paymentModeList, setPaymentModeList] = useState([]);
    const [purpostOfCostList, setPurpostOfCostList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [docId, setDocId] = useState('');
    // const [isDocIdLoading, setIsDocIdLoading] = useState(false);
    const [formData, setFormData] = useState({
        expenseType: '',
        expenseDate: dayjs(),
        docDate: dayjs(),
        fromDestination: '',
        toDestination: '',
        distanceTraveled: '',
        modeOfTravel: '',
        departureDate: null,
        returnDate: null,
        totalAmount: '',
        currency: '',
        mealType: '',
        description: '',
        status: '',
        paymentMode: '',
        purpostOfCost: ''
    });
    const [editId, setEditId] = useState('');
    const [listView, setListView] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        expenseType: '',
        docDate: '',
        expenseDate: '',
        fromDestination: '',
        toDestination: '',
        distanceTraveled: '',
        modeOfTravel: '',
        departureDate: '',
        returnDate: '',
        totalAmount: '',
        currency: '',
        mealType: '',
        description: '',
        status: '',
        paymentMode: '',
        purpostOfCost: ''
    });
    const [listViewData, setListViewData] = useState([]);
    const listViewColumns = [
        { accessorKey: 'expenseType', header: 'Expense Type', size: 140 },
        { accessorKey: 'expenseDate', header: 'Date', size: 140 },
        { accessorKey: 'paymentMode', header: 'Payment Mode', size: 140 },
        { accessorKey: 'totalAmount', header: 'Amount', size: 140 },
        { accessorKey: 'approveStatus', header: 'Status', size: 140 },
    ];

    useEffect(() => {
        getAllExpenseClaims();
        getMealType();
        getExpenseType();
        getTransportMode();
        getAllCurrency();
        getPaymentMode();
        getExpenseClaimsDocId();
        getProductName();
        getKPIDetails();
    }, []);
    const getProductName = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllProductNames?orgId=${orgId}`);
            setPurpostOfCostList(response.paramObjectsMap.productName);
        } catch (error) {
            console.error('Error fetching gate passes:', error);
        }
    };
    const getExpenseClaimsDocId = async () => {
        if (editId) return;
        try {
            // setIsDocIdLoading(true);
            const response = await apiCalls(
                'get',
                `/expensedetails/getExpenseDetailsDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );
            if (response.status) {
                // setIsDocIdLoading(false);
                setDocId(response.paramObjectsMap.expenseDetailsDocId);
            }
        } catch (err) {
            console.error('Error fetching lead docId:', err);
            showToast('error', 'Failed to generate lead ID');
            // setIsDocIdLoading(false);
        } finally {
            // setIsDocIdLoading(false);
        }
    };
    const getAllCurrency = async () => {
        try {
            const currencyData = await getAllActiveCurrency(orgId);

            // ✅ Remove duplicates (by currency + country)
            const uniqueCurrencyList = Array.from(
                new Map(
                    (currencyData || []).map((item) => [
                        `${item.currency}-${item.country}`, // unique key
                        item
                    ])
                ).values()
            );

            // ✅ Set the cleaned list to state
            setCurrencyList(uniqueCurrencyList);
        } catch (error) {
            console.error('Error fetching currency data:', error);
        }
    };
    const getMealType = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=MealType&orgId=${orgId}`);
            if (response.status === true) {
                setMealTypeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getPaymentMode = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=PaymentMode&orgId=${orgId}`);
            if (response.status === true) {
                setPaymentModeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getExpenseType = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=ExpenseType&orgId=${orgId}`);
            if (response.status === true) {
                setExpenseTypeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getTransportMode = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=ModeOfTravel&orgId=${orgId}`);
            if (response.status === true) {
                setTransportModeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getAllExpenseClaims = async () => {
        try {
            const result = await apiCalls('get', `/expensedetails/getAllExpenseDetailsByOrgId?branchCode=${branchCode}&createdBy=${employeeCode}&finYear=${finYear}&orgId=${orgId}`);
            setListViewData(result.paramObjectsMap.expenseDetailsVO.reverse() || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const getExpenseClaimsById = async (row) => {
        const id = row.original.id;
        setEditId(id);
        try {
            const response = await apiCalls('get', `/expensedetails/getExpenseDetailsById?id=${id}`);
            if (response.status === true) {
                const expense = response.paramObjectsMap.expenseDetailsVO;
                setLogo(response.paramObjectsMap.expenseDetailsVO.attachments);
                setDocId(response.paramObjectsMap.expenseDetailsVO.docId);
                setFormData({
                    expenseType: expense.expenseType || '',
                    docDate: expense.docDate ? dayjs(expense.docDate) : null,
                    expenseDate: expense.expenseDate ? dayjs(expense.expenseDate) : null,
                    fromDestination: expense.fromDestination || '',
                    toDestination: expense.toDestination || '',
                    distanceTraveled: expense.distanceTraveled || '',
                    modeOfTravel: expense.modeOfTravel || '',
                    departureDate: expense.departureDate ? dayjs(expense.departureDate) : null,
                    returnDate: expense.returnDate ? dayjs(expense.returnDate) : null,
                    totalAmount: expense.totalAmount || '',
                    currency: expense.currency || '',
                    mealType: expense.mealType || '',
                    description: expense.description || '',
                    status: expense.status || '',
                    paymentMode: expense.paymentMode || '',
                    purpostOfCost: expense.project || '',
                    employeeName: employeeName || '',
                    employeeCode: employeeCode || '',
                });
                setListView(false);
            }
        } catch (error) {
            console.error('Error fetching category by ID:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, selectionStart, selectionEnd, type } = e.target;
        setFormData({ ...formData, [name]: value });
        setFieldErrors({ ...fieldErrors, [name]: '' });

        if (type === 'text' || type === 'textarea') {
            setTimeout(() => {
                const inputElement = document.getElementsByName(name)[0];
                // ✅ Only call setSelectionRange if it actually exists
                if (
                    inputElement &&
                    typeof inputElement.setSelectionRange === 'function'
                ) {
                    inputElement.setSelectionRange(selectionStart, selectionEnd);
                }
            }, 0);
        }
    };

    const handleClear = () => {
        getExpenseClaimsDocId();
        setFormData({
            expenseType: '',
            docDate: dayjs(),
            expenseDate: dayjs(),
            fromDestination: '',
            toDestination: '',
            distanceTraveled: '',
            modeOfTravel: '',
            departureDate: null,
            returnDate: null,
            totalAmount: '',
            currency: '',
            mealType: '',
            description: '',
            status: '',
            paymentMode: '',
            purpostOfCost: ''
        });
        setFieldErrors({
            expenseType: '',
            docDate: '',
            expenseDate: '',
            fromDestination: '',
            toDestination: '',
            distanceTraveled: '',
            modeOfTravel: '',
            departureDate: '',
            returnDate: '',
            totalAmount: '',
            currency: '',
            mealType: '',
            description: '',
            status: '',
            paymentMode: '',
            purpostOfCost: ''
        });
        setEditId('');
        setDocId('');
        setLogo(null);
    };

    const handleSave = async () => {
        const errors = {};

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);

            const safeDate = (dateValue) => {
                return dateValue && dayjs(dateValue).isValid()
                    ? dayjs(dateValue).format("YYYY-MM-DD")
                    : null;
            };

            const saveFormData = {
                ...(editId && { id: editId }),
                toDestination: formData.toDestination || '',
                returnDate: safeDate(formData.returnDate),
                project: formData.purpostOfCost || '',
                orgId: parseInt(orgId),
                paymentMode: formData.paymentMode || '',
                modeOfTravel: formData.modeOfTravel || '',
                mealType: formData.mealType || '',
                fromDestination: formData.fromDestination || '',
                finYear: finYear,
                expenseType: formData.expenseType || '',
                expenseDate: safeDate(formData.expenseDate),
                docDate: safeDate(formData.docDate),
                employeeName: employeeName,
                employeeCode: employeeCode,
                distanceTraveled: formData.distanceTraveled
                    ? parseFloat(formData.distanceTraveled)
                    : 0,
                description: formData.description || '',
                departureDate: safeDate(formData.departureDate),
                currency: formData.currency || '',
                totalAmount: formData.totalAmount
                    ? parseFloat(formData.totalAmount)
                    : 0,
                createdBy: loginUserName,
                branchCode: branchCode,
                branch: branch,
                active: true
            };

            try {
                const result = await apiCalls('put', `/expensedetails/updateCreateExpenseDetails`, saveFormData);

                if (result.status === true) {
                    showToast('success', editId ? 'Expense updated successfully' : 'Expense Created Successfully');
                    const generatedId = result.paramObjectsMap.expenseDetailsVO.id;
                    if (generatedId && typeof logo === 'object') {
                        console.log('Generated ID:', generatedId);
                        console.log('Uploaded Item', logo);
                        handleFileUpload(generatedId);
                    } else {
                        console.log('handle Img Upload failed');
                    }
                    handleClear();
                    getExpenseClaimsDocId();
                    await getAllExpenseClaims();
                } else {
                    showToast('error', result.paramObjectsMap?.errorMessage || 'Save failed');
                }
            } catch (err) {
                console.error('Save error:', err);
                showToast('error', 'Error occurred while saving');
            } finally {
                setIsLoading(false);
            }
        } else {
            setFieldErrors(errors);
        }
    };

    const handleView = () => {
        setListView(!listView);
        handleClear();
    };

    const [open, setOpen] = useState(false);
    const [logo, setLogo] = useState(null);
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
    const handleFileUpload = async (generatedId) => {
        if (!generatedId) {
            console.warn('Generated ID is missing');
            showToast('error', 'Generated ID is required');
            return;
        }
        console.log("Logo", logo);

        const formData = new FormData();
        formData.append('file', logo);
        try {
            const response = await apiCalls(
                'post',
                `/expensedetails/uploadAttachmentsExpenseDetailsInBloob?id=${generatedId}`,
                formData,
                {},
                { 'Content-Type': 'multipart/form-data' }
            );
            console.log('Attachment Upload Response:', response);

            if (response.status === true) {
                showToast('success', response.message || 'Attachment Uploaded successfully!');
            } else {
                console.warn('Attachment upload failed:', response);
                showToast('error', 'Attachment upload failed');
            }
        } catch (error) {
            console.error('Attachment Upload Error:', error);
            showToast('error', 'Failed to upload Attachment');
        }
    };
    useEffect(() => {
        return () => {
            if (logo && typeof logo === 'object') {
                URL.revokeObjectURL(logo);
            }
        };
    }, [logo]);
    const handleRemoveLogo = () => setLogo(null);
    const [summaryCounts, setSummaryCounts] = useState({
        pending: 0,
        rejected: 0,
        approved: 0,
        totalAmount: 0
    });
    const getKPIDetails = async () => {
        try {
            const response = await apiCalls('get', `/expensedetails/getExpenseDetailsCount?branchCode=${branchCode}&createdBy=${loginUserName}&finYear=${finYear}&orgId=${orgId}`);
            if (response.status === true) {
                const quality = response.paramObjectsMap.expenseDetailsCounts[0];
                setSummaryCounts({
                    pending: quality.pending || 0,
                    rejected: quality.rejected || 0,
                    approved: quality.approved || 0,
                    totalAmount: quality.totalAmount || 0
                });
            } else {
                summaryCounts([]);
            }
            // setIsLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast('error', 'Failed to fetch leads');
            // setIsLoading(false);
        }
    };
    return (
        <>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-3" style={{ marginBottom: '20px' }}>
                        {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
                        {!listView && (
                            <>
                                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                                <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                                <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                            </>
                        )}
                    </div>
                </div>

                {listView && !isLoading ? (
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPIBox
                                    summaryData={{
                                        label: 'Total Expense',
                                        count: summaryCounts.totalAmount,
                                        color: '#1976d2',
                                        icon: <AttachMoneyIcon fontSize="large" />,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <KPIBox
                                    summaryData={{
                                        label: 'Pending Claims',
                                        count: summaryCounts.pending,
                                        color: '#ffb300',
                                        icon: <HourglassEmptyIcon fontSize="large" />,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <KPIBox
                                    summaryData={{
                                        label: 'Approved Claims',
                                        count: summaryCounts.approved,
                                        color: '#43a047',
                                        icon: <CheckCircleIcon fontSize="large" />,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <KPIBox
                                    summaryData={{
                                        label: 'Rejected Claims',
                                        count: summaryCounts.rejected,
                                        color: '#e53935',
                                        icon: <CancelIcon fontSize="large" />,
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={1} sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <CommonListViewTable
                                    data={listViewData}
                                    columns={listViewColumns}
                                    enableEditing
                                    toEdit={getExpenseClaimsById}
                                />
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <>
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        label="Doc ID"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        disabled
                                        name="docId"
                                        value={docId}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <DatePicker
                                        label="Doc Date"
                                        // disabled
                                        format="DD-MM-YYYY"
                                        value={formData.docDate ? dayjs(formData.docDate, 'DD-MM-YYYY') : null}
                                        onChange={(newValue) =>
                                            handleInputChange({
                                                target: {
                                                    name: 'docDate',
                                                    value: newValue ? newValue.format('DD-MM-YYYY') : ''
                                                }
                                            })
                                        }
                                        slotProps={{ textField: { size: 'small', fullWidth: true, disabled: isLoading } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <DatePicker
                                        label="Expense Date"
                                        format="DD-MM-YYYY"
                                        value={formData.expenseDate ? dayjs(formData.expenseDate, 'DD-MM-YYYY') : null}
                                        onChange={(newValue) =>
                                            handleInputChange({
                                                target: {
                                                    name: 'expenseDate',
                                                    value: newValue ? newValue.format('DD-MM-YYYY') : ''
                                                }
                                            })
                                        }
                                        slotProps={{ textField: { size: 'small', fullWidth: true, disabled: isLoading } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={expenseTypeList}
                                        getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                        value={expenseTypeList.find((item) => item.listOfValues === formData.expenseType) || null}
                                        onChange={(event, newValue) =>
                                            handleInputChange({
                                                target: { name: 'expenseType', value: newValue?.listOfValues || '' }
                                            })
                                        }
                                        // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={<span>Expense Type</span>}
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                {formData.expenseType === 'Travel' &&
                                    <>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="From"
                                                name="fromDestination"
                                                value={formData.fromDestination}
                                                onChange={handleInputChange}
                                                required
                                                size="small"
                                            // disabled={isLoading}
                                            // helperText={isEditing ? "From Place Required" : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="To"
                                                name="toDestination"
                                                value={formData.toDestination}
                                                onChange={handleInputChange}
                                                required
                                                size="small"
                                            // disabled={isLoading}
                                            // helperText={isEditing ? "To Place Required" : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Distance Traveled"
                                                name="distanceTraveled"
                                                value={formData.distanceTraveled}
                                                onChange={handleInputChange}
                                                required
                                                size="small"
                                            // disabled={isLoading}
                                            // helperText={isEditing ? "To Place Required" : ""}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <DatePicker
                                                label="Departure Date"
                                                format="DD-MM-YYYY"
                                                value={formData.departureDate ? dayjs(formData.departureDate, 'DD-MM-YYYY') : null}
                                                onChange={(newValue) =>
                                                    handleInputChange({
                                                        target: {
                                                            name: 'departureDate',
                                                            value: newValue ? newValue.format('DD-MM-YYYY') : ''
                                                        }
                                                    })
                                                }
                                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <DatePicker
                                                label="Return Date"
                                                format="DD-MM-YYYY"
                                                value={formData.returnDate ? dayjs(formData.returnDate, 'DD-MM-YYYY') : null}
                                                onChange={(newValue) =>
                                                    handleInputChange({
                                                        target: {
                                                            name: 'returnDate',
                                                            value: newValue ? newValue.format('DD-MM-YYYY') : ''
                                                        }
                                                    })
                                                }
                                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Autocomplete
                                                options={transportModeList}
                                                getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                                value={transportModeList.find((item) => item.listOfValues === formData.modeOfTravel) || null}
                                                onChange={(event, newValue) =>
                                                    handleInputChange({
                                                        target: { name: 'modeOfTravel', value: newValue?.listOfValues || '' }
                                                    })
                                                }
                                                // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                                isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={<span>Mode of Travel</span>}
                                                        size="small"
                                                        name='modeOfTravel'
                                                        // error={!!fieldErrors.categories}
                                                        // helperText={fieldErrors.categories}
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </>}
                                {formData.expenseType === 'Food' &&
                                    <>
                                        <Grid item xs={12} sm={3}>
                                            <Autocomplete
                                                options={mealTypeList}
                                                getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                                value={mealTypeList.find((item) => item.listOfValues === formData.mealType) || null}
                                                onChange={(event, newValue) =>
                                                    handleInputChange({
                                                        target: { name: 'mealType', value: newValue?.listOfValues || '' }
                                                    })
                                                }
                                                // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                                isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Meal Type"
                                                        size="small"
                                                        name='mealType'
                                                        // error={!!fieldErrors.categories}
                                                        // helperText={fieldErrors.categories}
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </>
                                }
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        type='number'
                                        name="totalAmount"
                                        value={formData.totalAmount}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 10,000"
                                        size="small"
                                    // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={currencyList || []}
                                        size="small"
                                        fullWidth
                                        autoHighlight
                                        getOptionLabel={(option) =>
                                            option?.currency && option?.country
                                                ? `${option.currency} - ${option.country}`
                                                : option?.currency || ''
                                        }
                                        value={
                                            currencyList.find(
                                                (item) => item.currency === formData.currency
                                            ) || null
                                        }
                                        onChange={(event, newValue) => {
                                            handleInputChange({
                                                target: {
                                                    name: 'currency',
                                                    value: newValue?.currency || '', // ✅ store only currency string
                                                },
                                            });
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                            option?.currency === value?.currency
                                        }
                                        filterOptions={(options, { inputValue }) =>
                                            options.filter((option) => {
                                                const currency = option?.currency?.toLowerCase() || '';
                                                const country = option?.country?.toLowerCase() || '';
                                                const search = inputValue.toLowerCase();
                                                return currency.includes(search) || country.includes(search);
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Currency"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={paymentModeList}
                                        getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                        value={paymentModeList.find((item) => item.listOfValues === formData.paymentMode) || null}
                                        onChange={(event, newValue) =>
                                            handleInputChange({
                                                target: { name: 'paymentMode', value: newValue?.listOfValues || '' }
                                            })
                                        }
                                        // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={<span>Payment Mode</span>}
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={purpostOfCostList}
                                        getOptionLabel={(option) =>
                                            option?.productCode && option?.productName ? `${option.productCode} - ${option.productName}` : ''
                                        }
                                        value={purpostOfCostList.find((item) => item.productCode === formData.purpostOfCost) || null}
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    purpostOfCost: newValue.productCode,
                                                }));
                                            } else {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    purpostOfCost: '',
                                                }));
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label={<span>Purpose of Cost</span>} size="small" fullWidth />}
                                    />
                                    {/* <Autocomplete
                                        options={purpostOfCostList}
                                        getOptionLabel={(option) => (option?.listOfValues ? `${option.listOfValues}` : '')}
                                        value={purpostOfCostList.find((item) => item.listOfValues === formData.purpostOfCost) || null}
                                        onChange={(event, newValue) =>
                                            handleInputChange({
                                                target: { name: 'purpostOfCost', value: newValue?.listOfValues || '' }
                                            })
                                        }
                                        // disabled={isLoading || (selectedExpense.approveStatus === 'Approved' || selectedExpense.approveStatus === 'Rejected')}
                                        isOptionEqualToValue={(option, value) => option.listOfValues === value.listOfValues}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={<span>Purpose of Cost</span>}
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    /> */}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        // rows={3}
                                        variant="outlined"
                                        value={formData.description || ""}
                                        onChange={handleInputChange}
                                        name="description"
                                        placeholder="Additional Description about the Expense..."
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                                            borderRadius: '50px',
                                            padding: '2px',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            width: 'fit-content',
                                            mx: 'auto',
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<CloudUploadIcon sx={{ color: '#2563eb' }} />}
                                            sx={{
                                                backgroundColor: 'white',
                                                color: '#2563eb',
                                                borderRadius: '20px',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                fontSize: '0.7rem',
                                                px: 2.5,
                                                py: 0.8,
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: '#f3f4f6',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                },
                                            }}
                                        >
                                            {logo ? (typeof logo === 'object' && logo.name ? logo.name : 'Attachment') : 'Attachment'}
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

                                    {/* Dialog for preview */}
                                    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                                        <DialogContent
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                gap: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}
                                            >
                                                Attachment
                                            </Typography>

                                            {logo ? (
                                                <Box textAlign="center">
                                                    <Avatar
                                                        src={
                                                            typeof logo === 'object'
                                                                ? URL.createObjectURL(logo)
                                                                : `data:image/jpeg;base64,${logo}`
                                                        }
                                                        alt="Attachment"
                                                        sx={{
                                                            width: 150,
                                                            height: 150,
                                                            borderRadius: 2,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }}
                                                    />
                                                    <Box display="flex" justifyContent="center" gap={2} mt={2}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleRemoveLogo}
                                                            sx={{
                                                                backgroundColor: '#ef4444',
                                                                color: 'white',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                                '&:hover': { backgroundColor: '#dc2626' },
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleClose}
                                                            sx={{
                                                                color: '#2563eb',
                                                                borderColor: '#2563eb',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                                '&:hover': { backgroundColor: 'rgba(37,99,235,0.1)' },
                                                            }}
                                                        >
                                                            Close
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box textAlign="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 150,
                                                            height: 150,
                                                            bgcolor: '#F0F0F0',
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <Typography variant="caption" color="text.secondary">
                                                            Attachment
                                                        </Typography>
                                                    </Avatar>
                                                    <Box display="flex" justifyContent="center" gap={2} mt={2}>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleClose}
                                                            sx={{
                                                                color: '#2563eb',
                                                                borderColor: '#2563eb',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                            }}
                                                        >
                                                            Close
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </Grid>
                            </Grid>
                            {/* <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: '#fafafa' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Expense In Detail
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        value={row.itemName}
                                                        onChange={(e) => handleChange(index, 'itemName', e.target.value)}
                                                        placeholder="e.g., Bulb"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        fullWidth
                                                        value={row.quantity}
                                                        onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                                                        placeholder="Qty"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        value={row.unit}
                                                        onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                                        placeholder="e.g., pcs, m"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        fullWidth
                                                        value={row.rate}
                                                        onChange={(e) => handleChange(index, 'rate', e.target.value)}
                                                        placeholder="Rate"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        disabled
                                                        value={row.total}
                                                        placeholder="0.00"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton color="error" onClick={() => handleDeleteRow(index)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddCircle />}
                                                    onClick={handleAddRow}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderColor: '#2563eb',
                                                        color: '#2563eb',
                                                        '&:hover': { backgroundColor: 'rgba(37,99,235,0.1)' }
                                                    }}
                                                >
                                                    Add Item
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper> */}
                        </>
                    </LocalizationProvider>
                )}
            </div>
            <ToastComponent />
        </>
    );
};

export default ExpenseClaims;

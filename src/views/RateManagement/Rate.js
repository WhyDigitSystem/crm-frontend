import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { FormControl, Autocomplete, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import apiCalls from 'apicall';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import FullScreenLoader from 'utils/FullScreenLoader';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import RATESample from '../../assets/sample-files/freightDetails.xlsx';

const Rate = () => {
    const [showForm, setShowForm] = useState(true);
    const [data, setData] = useState(true);
    const [branch, setBranch] = useState(localStorage.getItem('branch'));
    const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
    const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [docId, setDocId] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [calcList, setCalcList] = useState([]);
    // const [carrierList, setCarrierList] = useState([]);
    // const [containerTypeList, setContainerTypeList] = useState([]);
    const cargoTypeList = {
        'Air Freight': ['General Cargo', 'Perishable Goods', 'Dangerous Goods'],
        'Sea Freight': ['Full Container Load (FCL)', 'Less Container Load (LCL)'],
        'Rail Freight': ['Bulk Cargo', 'Container Cargo'],
        'Road Freight': ['Dry Van', 'Flatbed', 'Refrigerated'],
        'Courier': ['Documents', 'Small Parcels'],
        'Port Delivery': ['Container Delivery', 'Loose Cargo'],
        'Warehouse Pickup': ['Palletized', 'Non-Palletized'],
        'Door to Door': ['Parcel', 'Freight'],
        'Container Load (FCL)': ['20ft', '40ft'],
        'Less Container Load (LCL)': ['Small Boxes', 'Medium Crates'],
    };
    const containerTypeList = {
        'Air Freight': ['ULD', 'Cool Container'],
        'Sea Freight': ['20ft', '40ft High Cube', 'Open Top'],
        'Rail Freight': ['Bulk Wagon', 'Container Wagon'],
        'Road Freight': ['Reefer Truck', 'Flatbed', 'Box Truck'],
    };
    const carrierList = {
        'Air Freight': ['DHL Aviation', 'FedEx Air', 'Emirates Cargo'],
        'Sea Freight': ['Maersk', 'MSC', 'COSCO'],
        'Rail Freight': ['Indian Railways Cargo', 'DB Cargo'],
        'Road Freight': ['GATI', 'Delhivery', 'Blue Dart Road'],
    };
    const [freightList, setFreightList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [formData, setFormData] = useState({
        docDate: dayjs(),
        freightType: '',
        cargoType: '',
        carrier: '',
        orgin: '',
        designation: '',
        validFrom: dayjs(),
        validTo: dayjs(),
    });

    const [fieldErrors, setFieldErrors] = useState({
        freightType: '',
        cargoType: '',
        carrier: '',
        orgin: '',
        designation: '',
        validFrom: dayjs(),
        validTo: dayjs(),
    });

    const listViewColumns = [
        { accessorKey: 'docId', header: 'Doc No', size: 140 },
        { accessorKey: 'docDate', header: 'Doc Date', size: 140 },
        { accessorKey: 'freightType', header: 'Freight Type', size: 140 },
        { accessorKey: 'carrier', header: 'Carrier', size: 140 },
        { accessorKey: 'orgin', header: 'Orgin Port/Airport', size: 140 },
        { accessorKey: 'designation', header: 'Destination Port/Airport', size: 140 },
        { accessorKey: 'validFrom', header: 'Valid From', size: 140 },
        { accessorKey: 'validTo', header: 'Valid To', size: 140 }
    ];

    const [freightCharges, setFreightCharges] = useState([
        {
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        }
    ]);
    const [freightChargesErrors, setFreightChargesErrors] = useState([
        {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        }
    ]);
    const getOriginType = async (FreightType) => {
        try {
            const response = await apiCalls('get', `/rate/getPortNameFromPortMaster?orgId=${orgId}&type=${FreightType}`);
            if (response.status === true) {
                setOriginList(response.paramObjectsMap.portName || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getCalcType = async () => {
        try {
            const response = await apiCalls('get', `/rate/getUnitCodeFromUnitMaster?orgId=${orgId}`);
            if (response.status === true) {
                setCalcList(response.paramObjectsMap.unitCode || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getCurrency = async () => {
        try {
            const response = await apiCalls('get', `/commonmaster/currency?orgid=${orgId}`);
            if (response.status === true) {
                setCurrencyList(response.paramObjectsMap.currencyVO || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const getFreightType = async () => {
        try {
            const response = await apiCalls('get', `/commonmaster/getAllPortType?orgId=${orgId}`);
            if (response.status === true) {
                setFreightList(response.paramObjectsMap.typeDeatils || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    useEffect(() => {
        getCalcType();
        getFreightType();
        getCurrency();
        getAllRate();
        getDocIdRate();
    }, []);
    const getAllRate = async () => {
        setLoading(true);
        try {
            const result = await apiCalls('get', `/rate/getAllRateByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`);
            setData(result.paramObjectsMap.rateVO.reverse() || []);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log('error', err);
        }
    };
    const getDocIdRate = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/rate/getRateDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );
            setDocId(response.paramObjectsMap.RateDocId);
        } catch (error) {
            console.error('Error fetching gate passes:', error);
        }
    };
    const getRateById = async (row) => {
        setShowForm(true);
        setLoading(true);
        try {
            const result = await apiCalls('get', `/rate/getRateById?id=${row.original.id}`);

            if (result) {
                const rateVO = result.paramObjectsMap.rateVO;
                setEditId(row.original.id);
                setDocId(rateVO.docId);
                setFormData({
                    id: rateVO.id || '',
                    docDate: rateVO.docDate ? dayjs(rateVO.docDate, 'YYYY-MM-DD') : dayjs(),
                    freightType: rateVO.freightType || '',
                    cargoType: rateVO.cargoType || '',
                    carrier: rateVO.carrier || '',
                    orgin: rateVO.orgin || '',
                    designation: rateVO.designation || '',
                    validFrom: rateVO.validFrom ? dayjs(rateVO.validFrom, 'YYYY-MM-DD') : null,
                    validTo: rateVO.validTo ? dayjs(rateVO.validTo, 'YYYY-MM-DD') : null,
                });
                setFreightCharges(
                    rateVO.freightChargesVO.map((row) => ({
                        id: row.id,
                        chargeType: row.chargeType,
                        buyRate: row.buyRate,
                        currency: row.currency,
                        calcType: row.calculationType,
                        chargesType: row.type,
                    }))
                );
                setLoading(false);
            } else {
                setLoading(false);
                // Handle erro
            }
        } catch (error) {
            setLoading(false);
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, selectionStart, selectionEnd, type } = e.target;

        let errorMessage = '';

        if (errorMessage) {
            setFieldErrors({ ...fieldErrors, [name]: errorMessage });
        } else {
            setFormData({ ...formData, [name]: value.toUpperCase() });
            setFieldErrors({ ...fieldErrors, [name]: '' });
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
    const handleDateChange = (field, date) => {
        const formattedDate = dayjs(date);
        console.log('formattedDate', formattedDate);
        setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
    };
    const handleClear = () => {
        setFormData({
            docDate: dayjs(),
            freightType: '',
            cargoType: '',
            carrier: '',
            orgin: '',
            designation: '',
            validFrom: dayjs(),
            validTo: dayjs(),
        });
        setFieldErrors({});
        setFreightCharges([{
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        }]);
        setFreightChargesErrors([{
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        }]);
        setEditId('');
        getDocIdRate();
    };
    const handleAddRowFreight = () => {
        const newRow = {
            id: Date.now(),
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        };
        setFreightCharges([...freightCharges, newRow]);
        setFreightChargesErrors([...freightChargesErrors, {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
            chargesType: '',
        }]);
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

    const handleView = () => {
        setShowForm(!showForm);
        handleClear();
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleBulkUpload = () => {
        setUploadOpen(true);
    };
    const handleSave = async () => {
        setLoading(true);
        const errors = {};
        if (!formData.validFrom) {
            errors.validFrom = 'Valid From is required';
        }
        if (!formData.validTo) {
            errors.validTo = 'Valid To is required';
        }

        let detailTableDataValid = true;
        const newTableErrors = freightCharges.map((row) => {
            const rowErrors = {};
            return rowErrors;
        });
        setFieldErrors(errors);

        setFreightChargesErrors(newTableErrors);

        if (Object.keys(errors).length === 0 && detailTableDataValid) {
            const freightChargesVO = freightCharges.map((row) => ({
                ...(editId && { id: row.id }),
                chargeType: row.chargeType,
                buyRate: parseFloat(row.buyRate),
                currency: row.currency,
                calculationType: row.calcType,
                type: row.chargesType
            }));
            const saveFormData = {
                ...(editId && { id: editId }),
                branch: branch,
                branchCode: branchCode,
                finYear: finYear,
                orgId: orgId,
                createdBy: loginUserName,
                freightType: formData.freightType,
                cargoType: formData.cargoType,
                carrier: formData.carrier,
                orgin: formData.orgin,
                designation: formData.designation,
                active: true,
                validFrom: formData.validFrom?.format('YYYY-MM-DD'),
                validTo: formData.validTo?.format('YYYY-MM-DD'),
                freightChargesDTO: freightChargesVO,
            };
            console.log('DATA TO SAVE IS:', saveFormData);
            try {
                const response = await apiCalls('put', `/rate/createUpdateRate`, saveFormData);
                if (response.status === true) {
                    console.log('Response:', response);
                    showToast('success', editId ? 'Rate Updated Successfully' : 'Rate Created successfully');
                    getAllRate();
                    getDocIdRate();
                    handleClear();
                    setLoading(false);
                } else {
                    showToast('error', response.paramObjectsMap.errorMessage || 'Rate creation failed');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
                showToast('error', 'Rate creation failed');
            }
        } else {
            setFieldErrors(errors);
            setLoading(false);
        }
    };
    const handleBulkUploadClose = () => {
        setUploadOpen(false);
    };

    const handleSubmit = () => {
        console.log('Submit clicked');
        handleBulkUploadClose();
    };

    const handleFileUpload = (event) => {
        console.log(event.target.files[0]);
    };
    return (
        <>
            {loading && (
                <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
                    <FullScreenLoader />
                </div>
            )}
            <ToastComponent />
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
                <div className="row">
                    <div className="d-flex justify-content-between align-items-center mb-4" style={{ width: '100%' }}>

                        <div className="d-flex">
                            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                            {showForm && (
                                <>
                                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                                    <ActionButton title="BulkUpload" icon={CloudUploadIcon} onClick={handleBulkUpload} />
                                    {uploadOpen && (
                                        <CommonBulkUpload
                                            open={uploadOpen}
                                            handleClose={handleBulkUploadClose}
                                            title="Upload Files"
                                            uploadText="Upload file"
                                            downloadText="Sample File"
                                            onSubmit={handleSubmit}
                                            sampleFileDownload={RATESample}
                                            handleFileUpload={handleFileUpload}
                                            apiUrl={`rate/uploadRateDetails`}
                                            screen="RATE"
                                            loginUser={loginUserName}
                                            orgId={orgId}
                                        ></CommonBulkUpload>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {showForm ? (
                        <>
                            <div className="row d-flex ml">
                                <div className="col-md-3 mb-3">
                                    <TextField
                                        id="docId"
                                        label="Doc No"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        name="docId"
                                        value={docId}
                                        disabled
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <FormControl fullWidth variant="filled" size="small">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Doc Date"
                                                value={formData.docDate}
                                                onChange={(date) => handleDateChange('docDate', date)}
                                                disabled
                                                slotProps={{
                                                    textField: { size: 'small', clearable: true }
                                                }}
                                                format="DD-MM-YYYY"
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={freightList}
                                        getOptionLabel={(option) =>
                                            option?.type
                                                ? `${option.type}`
                                                : ''
                                        }
                                        value={
                                            freightList.find((item) => item.type === formData.freightType) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    freightType: newValue.type,
                                                }));
                                                getOriginType(newValue.type);
                                                setFieldErrors((prev) => ({ ...prev, freightType: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, freightType: '' }));
                                                setFieldErrors((prev) => ({ ...prev, freightType: 'Origin Port/Airport is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Freight Type
                                                    </span>
                                                }
                                                size="small"
                                                error={!!fieldErrors.freightType}
                                                helperText={fieldErrors.freightType}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={cargoTypeList[formData.freightType] || []}
                                        getOptionLabel={(option) => option || ''}
                                        value={formData.cargoType || null}
                                        onChange={(event, newValue) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                cargoType: newValue || '',
                                            }));
                                            setFieldErrors((prev) => ({ ...prev, cargoType: '' }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Cargo Type"
                                                size="small"
                                                error={!!fieldErrors.cargoType}
                                                helperText={fieldErrors.cargoType}
                                                fullWidth
                                            />
                                        )}
                                        disabled={!formData.freightType}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={containerTypeList[formData.freightType] || []}
                                        value={formData.containerType || null}
                                        onChange={(e, newValue) => {
                                            setFormData((prev) => ({ ...prev, containerType: newValue || '' }));
                                            setFieldErrors((prev) => ({ ...prev, containerType: '' }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Container Type"
                                                size="small"
                                                error={!!fieldErrors.containerType}
                                                helperText={fieldErrors.containerType}
                                                fullWidth
                                            />
                                        )}
                                        disabled={!formData.freightType}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={carrierList[formData.freightType] || []}
                                        value={formData.carrier || null}
                                        onChange={(e, newValue) => {
                                            setFormData((prev) => ({ ...prev, carrier: newValue || '' }));
                                            setFieldErrors((prev) => ({ ...prev, carrier: '' }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Carrier"
                                                size="small"
                                                error={!!fieldErrors.carrier}
                                                helperText={fieldErrors.carrier}
                                                fullWidth
                                            />
                                        )}
                                        disabled={!formData.freightType}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={originList}
                                        getOptionLabel={(option) =>
                                            option?.portName
                                                ? `${option.portName}`
                                                : ''
                                        }

                                        value={
                                            originList.find((item) => item.portName === formData.orgin) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    orgin: newValue.portName,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, orgin: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, orgin: '' }));
                                                setFieldErrors((prev) => ({ ...prev, orgin: 'Origin Port/Airport is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Origin Port/Airport
                                                        {/* <span className="asterisk">*</span> */}
                                                    </span>
                                                }

                                                size="small"
                                                error={!!fieldErrors.orgin}
                                                helperText={fieldErrors.orgin}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={originList}
                                        getOptionLabel={(option) =>
                                            option?.portName
                                                ? `${option.portName}`
                                                : ''
                                        }
                                        value={
                                            originList.find((item) => item.portName === formData.designation) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    designation: newValue.portName,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, designation: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, designation: '' }));
                                                setFieldErrors((prev) => ({ ...prev, designation: 'Destination Port/Airport is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Destination Port/Airport {/* <span className="asterisk">*</span> */}
                                                    </span>
                                                }
                                                size="small"
                                                error={!!fieldErrors.designation}
                                                helperText={fieldErrors.designation}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Valid From"
                                            value={formData.validFrom}
                                            onChange={(date) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    validFrom: date,
                                                    validTo: prev.validTo && dayjs(date).isAfter(prev.validTo) ? date : prev.validTo
                                                }));
                                            }}
                                            format="DD-MM-YYYY"
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                    </LocalizationProvider>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Valid To"
                                            value={formData.validTo}

                                            minDate={formData.validFrom}
                                            onChange={(date) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    validTo: date,
                                                }));
                                            }}
                                            format="DD-MM-YYYY"
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <Box sx={{ width: '100%' }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        aria-label="secondary tabs example"
                                    >
                                        <Tab value={0} label="Charges" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ padding: 2 }}>
                                    {value === 0 && (
                                        <>
                                            <div className="row d-flex ml">
                                                <div className="mb-1">
                                                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowFreight} />
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-lg-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered ">
                                                                <thead>
                                                                    <tr style={{ color: 'white' }}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
                                                                        <th className="table-header">Type</th>
                                                                        <th className="table-header">Charge Type</th>
                                                                        <th className="table-header">Buy Rate</th>
                                                                        <th className="table-header">Currency</th>
                                                                        <th className="table-header">Calclation Type</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {freightCharges.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteIcon}
                                                                                    onClick={() =>
                                                                                        handleDeleteRow(
                                                                                            row.id,
                                                                                            freightCharges,
                                                                                            setFreightCharges,
                                                                                            freightChargesErrors,
                                                                                            setFreightChargesErrors
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <div className="pt-2" style={{ color: 'white' }}>{index + 1}</div>
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <FormControl
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    fullWidth
                                                                                    error={!!freightChargesErrors[index]?.chargesType}
                                                                                >
                                                                                    <Select
                                                                                        labelId={`chargesType-label-${index}`}
                                                                                        id={`chargesType-${index}`}
                                                                                        name="chargesType"
                                                                                        value={row.chargesType || ''}
                                                                                        onChange={(event) => {
                                                                                            const newFreightCharges = [...freightCharges];
                                                                                            newFreightCharges[index].chargesType = event.target.value;
                                                                                            setFreightCharges(newFreightCharges);

                                                                                            const updatedErrors = [...freightChargesErrors];
                                                                                            updatedErrors[index].chargesType = event.target.value ? '' : 'Type is required';
                                                                                            setFreightChargesErrors(updatedErrors);
                                                                                        }}
                                                                                    >
                                                                                        <MenuItem value="Freight Charges">Freight Charges</MenuItem>
                                                                                        <MenuItem value="Origin Charges">Origin Charges</MenuItem>
                                                                                        <MenuItem value="Designation Charges">Designation Charges</MenuItem>
                                                                                        <MenuItem value="Additional Charges">Additional Charges</MenuItem>
                                                                                    </Select>
                                                                                </FormControl>
                                                                            </td>
                                                                            {/* <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={freightChargeType}
                                                                                    getOptionLabel={(option) => option.chargeType || ''}
                                                                                    value={
                                                                                        freightChargeType.find(
                                                                                            (option) => option.chargeType === row.chargeType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.chargeType || '';
                                                                                        const updatedData = [...freightCharges];
                                                                                        updatedData[index].chargeType = newFreightCharges;
                                                                                        setFreightCharges(updatedData);

                                                                                        const updatedErrors = [...freightChargesErrors];
                                                                                        updatedErrors[index].chargeType = newFreightCharges ? '' : 'Charge Type is required';
                                                                                        setFreightChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!freightChargesErrors[index]?.chargeType}
                                                                                            helperText={freightChargesErrors[index]?.chargeType}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td> */}
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={row.chargeType}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const updatedData = [...freightCharges];
                                                                                        updatedData[index].chargeType = value;
                                                                                        setFreightCharges(updatedData);
                                                                                        const updatedErrors = [...freightChargesErrors];
                                                                                        updatedErrors[index].chargeType = value ? '' : 'Charge Type is required';
                                                                                        setFreightChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    className={`form-control ${freightChargesErrors[index]?.chargeType ? 'error' : ''}`}
                                                                                />
                                                                                {freightChargesErrors[index]?.chargeType && (
                                                                                    <div className="text-danger" style={{ fontSize: '12px' }}>
                                                                                        {freightChargesErrors[index].chargeType}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.buyRate}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const updatedData = [...freightCharges];
                                                                                        updatedData[index].buyRate = value;
                                                                                        setFreightCharges(updatedData);
                                                                                        const updatedErrors = [...freightChargesErrors];
                                                                                        updatedErrors[index].buyRate = value ? '' : 'Buy Rate is required';
                                                                                        setFreightChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    className={`form-control ${freightChargesErrors[index]?.buyRate ? 'error' : ''}`}
                                                                                />
                                                                                {freightChargesErrors[index]?.buyRate && (
                                                                                    <div className="text-danger" style={{ fontSize: '12px' }}>
                                                                                        {freightChargesErrors[index].buyRate}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={currencyList}
                                                                                    getOptionLabel={(option) => option.currency || ''}
                                                                                    value={
                                                                                        currencyList.find(
                                                                                            (option) => option.currency === row.currency
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.currency || '';
                                                                                        const updatedData = [...freightCharges];
                                                                                        updatedData[index].currency = newFreightCharges;
                                                                                        setFreightCharges(updatedData);

                                                                                        const updatedErrors = [...freightChargesErrors];
                                                                                        updatedErrors[index].currency = newFreightCharges ? '' : 'Currency is required';
                                                                                        setFreightChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!freightChargesErrors[index]?.currency}
                                                                                            helperText={freightChargesErrors[index]?.currency}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={calcList}
                                                                                    getOptionLabel={(option) => option.unitCode || ''}
                                                                                    value={
                                                                                        calcList.find(
                                                                                            (option) => option.unitCode === row.calcType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.unitCode || '';
                                                                                        const updatedData = [...freightCharges];
                                                                                        updatedData[index].calcType = newFreightCharges;
                                                                                        setFreightCharges(updatedData);
                                                                                        const updatedErrors = [...freightChargesErrors];
                                                                                        updatedErrors[index].calcType = newFreightCharges ? '' : 'Calc Type is required';
                                                                                        setFreightChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!freightChargesErrors[index]?.calcType}
                                                                                            helperText={freightChargesErrors[index]?.calcType}
                                                                                        />
                                                                                    )}
                                                                                />
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
                        <CommonListViewTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getRateById} />
                    )}
                </div >
            </div >
        </>
    );
};
export default Rate;

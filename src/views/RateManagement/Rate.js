import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { FormControl, FormHelperText, InputLabel, MenuItem, Autocomplete, Select, Button, Chip, Stack, Avatar, Typography, Dialog, DialogContent } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import ConfirmationModal from 'utils/confirmationPopup';

import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import IconButton from '@mui/material/IconButton';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import FullScreenLoader from 'utils/FullScreenLoader';

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
    const [FreightChargeType, setFreightChargeType] = useState([]);
    const [originChargeType, setOriginChargeType] = useState([]);
    const [designationChargeType, setDesignationChargeType] = useState([]);
    const [additionalChargeType, setAdditionalChargeType] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [carrierList, setCarrierList] = useState([]);
    const [designationList, setDesignationList] = useState([]);
    const [containerTypeList, setContainerTypeList] = useState([]);
    const [cargoTypeList, setCargoTypeList] = useState([]);
    const [freightList, setFreightList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
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
        }
    ]);
    const [freightChargesErrors, setFreightChargesErrors] = useState([
        {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [originCharges, setOriginCharges] = useState([
        {
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [originChargesErrors, setOriginChargesErrors] = useState([
        {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [designationCharges, setDesignationCharges] = useState([
        {
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [designationChargesErrors, setDesignationChargesErrors] = useState([
        {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [additionalCharges, setAdditionalCharges] = useState([
        {
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    const [additionalChargesErrors, setAdditionalChargesErrors] = useState([
        {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }
    ]);
    // const getEmpCode = async () => {
    //     try {
    //         const response = await apiCalls('get', `/costEstimation/getAllEmployees?orgId=${orgId}`);
    //         if (response.status === true) {
    //             setEmpCode(response.paramObjectsMap.EmployeeVO || []);
    //         } else {
    //             console.error('API Error:', response);
    //             return response;
    //         }
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         return error;
    //     }
    // };
    useEffect(() => {
        // getEmpCode();
        getAllRate();
        getDocIdRate();
    }, []);
    const getAllRate = async () => {
        setLoading(true);
        try {
            const result = await apiCalls('get', `/costEstimation/getAllCostEstimationByOrgId?orgId=${orgId}&branchCode=${branchCode}&finYear=${finYear}`);
            setData(result.paramObjectsMap.costEstimationVO.reverse() || []);
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
                `/costEstimation/getCostEstimationDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
            );
            setDocId(response.paramObjectsMap.costEstimationDocId);
        } catch (error) {
            console.error('Error fetching gate passes:', error);
        }
    };
    const getRateById = async (row) => {
        setShowForm(true);
        setLoading(true);
        try {
            const result = await apiCalls('get', `/costEstimation/getAllCostEstimationById?id=${row.original.id}`);

            if (result) {
                const rateVO = result.paramObjectsMap.costEstimationVO;
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
                setOriginCharges(
                    rateVO.costEstimationDetailsVO.map((row) => ({
                        id: row.id,
                        chargeType: row.chargeType,
                        buyRate: row.buyRate,
                        currency: row.currency,
                        calcType: row.calcType
                    }))
                );
                setDesignationCharges(
                    rateVO.costEstimationDetailsVO.map((row) => ({
                        id: row.id,
                        chargeType: row.chargeType,
                        buyRate: row.buyRate,
                        currency: row.currency,
                        calcType: row.calcType
                    }))
                );
                setAdditionalCharges(
                    rateVO.costEstimationDetailsVO.map((row) => ({
                        id: row.id,
                        chargeType: row.chargeType,
                        buyRate: row.buyRate,
                        currency: row.currency,
                        calcType: row.calcType
                    }))
                );
                setFreightCharges(
                    rateVO.costEstimationDetailsVO.map((row) => ({
                        id: row.id,
                        chargeType: row.chargeType,
                        buyRate: row.buyRate,
                        currency: row.currency,
                        calcType: row.calcType
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
        }]);
        setFreightChargesErrors([{
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setOriginCharges([{
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setOriginChargesErrors([{
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setDesignationCharges([{
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setDesignationChargesErrors([{
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setAdditionalCharges([{
            id: 1,
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
        setAdditionalChargesErrors([{
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
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
        };
        setFreightCharges([...freightCharges, newRow]);
        setFreightChargesErrors([...freightChargesErrors, {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
    };
    const handleAddRowOrigin = () => {
        const newRow = {
            id: Date.now(),
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        };
        setOriginCharges([...originCharges, newRow]);
        setOriginChargesErrors([...originChargesErrors, {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
    };
    const handleAddRowDesignation = () => {
        const newRow = {
            id: Date.now(),
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        };
        setDesignationCharges([...designationCharges, newRow]);
        setDesignationChargesErrors([...designationChargesErrors, {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        }]);
    };
    const handleAddRowAdditional = () => {
        const newRow = {
            id: Date.now(),
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
        };
        setAdditionalCharges([...additionalCharges, newRow]);
        setAdditionalChargesErrors([...additionalChargesErrors, {
            chargeType: '',
            buyRate: '',
            currency: '',
            calcType: '',
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

    const handleBulkUpload = async () => {}
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
                calcType: row.calcType
            }));
            const originChargesVO = originCharges.map((row) => ({
                ...(editId && { id: row.id }),
                chargeType: row.chargeType,
                buyRate: parseFloat(row.buyRate),
                currency: row.currency,
                calcType: row.calcType
            }));
            const designationChargesVO = designationCharges.map((row) => ({
                ...(editId && { id: row.id }),
                chargeType: row.chargeType,
                buyRate: parseFloat(row.buyRate),
                currency: row.currency,
                calcType: row.calcType
            }));
            const additionalChargesVO = additionalCharges.map((row) => ({
                ...(editId && { id: row.id }),
                chargeType: row.chargeType,
                buyRate: parseFloat(row.buyRate),
                currency: row.currency,
                calcType: row.calcType
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
                validFrom: formData.validFrom?.format('YYYY-MM-DD'),
                validTo: formData.validTo?.format('YYYY-MM-DD'),
                costEstimationDetailsDTO: freightChargesVO,
                costEstimationDetailsDTO: originChargesVO,
                costEstimationDetailsDTO: designationChargesVO,
                costEstimationDetailsDTO: additionalChargesVO,
            };
            console.log('DATA TO SAVE IS:', saveFormData);
            try {
                const response = await apiCalls('put', `/costEstimation/updateCreateCostEstimation`, saveFormData);
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
                                            option?.freightType
                                                ? `${option.freightType}`
                                                : ''
                                        }

                                        value={
                                            freightList.find((item) => item.freightType === formData.freightType) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    freightType: newValue.freightType,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, freightType: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, freightType: '' }));
                                                setFieldErrors((prev) => ({ ...prev, freightType: 'Freight Type is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Freight Type {/* <span className="asterisk">*</span> */}
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
                                        options={cargoTypeList}
                                        getOptionLabel={(option) =>
                                            option?.cargoType
                                                ? `${option.cargoType}`
                                                : ''
                                        }

                                        value={
                                            cargoTypeList.find((item) => item.cargoType === formData.cargoType) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    cargoType: newValue.cargoType,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, cargoType: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, cargoType: '' }));
                                                setFieldErrors((prev) => ({ ...prev, cargoType: 'Cargo Type is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Cargo Type {/* <span className="asterisk">*</span> */}
                                                    </span>
                                                }

                                                size="small"
                                                error={!!fieldErrors.cargoType}
                                                helperText={fieldErrors.cargoType}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={containerTypeList}
                                        getOptionLabel={(option) =>
                                            option?.containerType
                                                ? `${option.containerType}`
                                                : ''
                                        }

                                        value={
                                            containerTypeList.find((item) => item.containerType === formData.containerType) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    containerType: newValue.containerType,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, containerType: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, containerType: '' }));
                                                setFieldErrors((prev) => ({ ...prev, containerType: 'Container Type is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Container Type {/* <span className="asterisk">*</span> */}
                                                    </span>
                                                }

                                                size="small"
                                                error={!!fieldErrors.containerType}
                                                helperText={fieldErrors.containerType}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={carrierList}
                                        getOptionLabel={(option) =>
                                            option?.carrier
                                                ? `${option.carrier}`
                                                : ''
                                        }

                                        value={
                                            carrierList.find((item) => item.carrier === formData.carrier) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    carrier: newValue.carrier,

                                                }));
                                                setFieldErrors((prev) => ({ ...prev, carrier: '' }));
                                            } else {
                                                setFormData((prev) => ({ ...prev, carrier: '' }));
                                                setFieldErrors((prev) => ({ ...prev, carrier: 'Carrier is required' }));
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={
                                                    <span>
                                                        Carrier {/* <span className="asterisk">*</span> */}
                                                    </span>
                                                }

                                                size="small"
                                                error={!!fieldErrors.carrier}
                                                helperText={fieldErrors.carrier}
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Autocomplete
                                        options={originList}
                                        getOptionLabel={(option) =>
                                            option?.orgin
                                                ? `${option.orgin}`
                                                : ''
                                        }

                                        value={
                                            originList.find((item) => item.orgin === formData.orgin) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    orgin: newValue.orgin,

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
                                        options={designationList}
                                        getOptionLabel={(option) =>
                                            option?.designation
                                                ? `${option.designation}`
                                                : ''
                                        }
                                        value={
                                            designationList.find((item) => item.designation === formData.designation) || null
                                        }
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    designation: newValue.designation,

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
                                        <Tab value={0} label="Freight Charges" />
                                        <Tab value={1} label="Origin Charges" />
                                        <Tab value={2} label="Destination Charges" />
                                        <Tab value={3} label="Additional Charges" />
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
                                                                    <tr style={{color: 'white'}}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
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
                                                                                <div className="pt-2">{index + 1}</div>
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.chargeType || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
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
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '30%' }}>
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
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.currency || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
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
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.calcType || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
                                                                                            (option) => option.calcType === row.calcType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.calcType || '';
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
                                    {value === 1 && (
                                        <>
                                            <div className="row d-flex ml">
                                                <div className="mb-1">
                                                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowOrigin} />
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-lg-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered ">
                                                                <thead>
                                                                    <tr style={{color: 'white'}}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
                                                                        <th className="table-header">Charge Type</th>
                                                                        <th className="table-header">Buy Rate</th>
                                                                        <th className="table-header">Currency</th>
                                                                        <th className="table-header">Calclation Type</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {originCharges.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteIcon}
                                                                                    onClick={() =>
                                                                                        handleDeleteRow(
                                                                                            row.id,
                                                                                            originCharges,
                                                                                            setOriginCharges,
                                                                                            originChargesErrors,
                                                                                            setOriginChargesErrors
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <div className="pt-2">{index + 1}</div>
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={originChargeType}
                                                                                    getOptionLabel={(option) => option.chargeType || ''}
                                                                                    value={
                                                                                        originChargeType.find(
                                                                                            (option) => option.chargeType === row.chargeType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.chargeType || '';
                                                                                        const updatedData = [...originCharges];
                                                                                        updatedData[index].chargeType = newFreightCharges;
                                                                                        setOriginCharges(updatedData);

                                                                                        const updatedErrors = [...originChargesErrors];
                                                                                        updatedErrors[index].chargeType = newFreightCharges ? '' : 'Charge Type is required';
                                                                                        setOriginChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!originChargesErrors[index]?.chargeType}
                                                                                            helperText={originChargesErrors[index]?.chargeType}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '30%' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.buyRate}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const updatedData = [...originCharges];
                                                                                        updatedData[index].buyRate = value;
                                                                                        setOriginCharges(updatedData);
                                                                                        const updatedErrors = [...originChargesErrors];
                                                                                        updatedErrors[index].buyRate = value ? '' : 'Buy Rate is required';
                                                                                        setOriginChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    className={`form-control ${originChargesErrors[index]?.buyRate ? 'error' : ''}`}
                                                                                />
                                                                                {originChargesErrors[index]?.buyRate && (
                                                                                    <div className="text-danger" style={{ fontSize: '12px' }}>
                                                                                        {originChargesErrors[index].buyRate}
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
                                                                                        const updatedData = [...originCharges];
                                                                                        updatedData[index].currency = newFreightCharges;
                                                                                        setOriginCharges(updatedData);

                                                                                        const updatedErrors = [...originChargesErrors];
                                                                                        updatedErrors[index].currency = newFreightCharges ? '' : 'Currency is required';
                                                                                        setOriginChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!originChargesErrors[index]?.currency}
                                                                                            helperText={originChargesErrors[index]?.currency}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.calcType || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
                                                                                            (option) => option.calcType === row.calcType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.calcType || '';
                                                                                        const updatedData = [...originCharges];
                                                                                        updatedData[index].calcType = newFreightCharges;
                                                                                        setOriginCharges(updatedData);
                                                                                        const updatedErrors = [...originChargesErrors];
                                                                                        updatedErrors[index].calcType = newFreightCharges ? '' : 'Calc Type is required';
                                                                                        setOriginChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!originChargesErrors[index]?.calcType}
                                                                                            helperText={originChargesErrors[index]?.calcType}
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
                                    {value === 2 && (
                                        <>
                                            <div className="row d-flex ml">
                                                <div className="mb-1">
                                                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowDesignation} />
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-lg-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered ">
                                                                <thead>
                                                                    <tr style={{color: 'white'}}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
                                                                        <th className="table-header">Charge Type</th>
                                                                        <th className="table-header">Buy Rate</th>
                                                                        <th className="table-header">Currency</th>
                                                                        <th className="table-header">Calclation Type</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {designationCharges.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteIcon}
                                                                                    onClick={() =>
                                                                                        handleDeleteRow(
                                                                                            row.id,
                                                                                            designationCharges,
                                                                                            setDesignationCharges,
                                                                                            designationChargesErrors,
                                                                                            setDesignationChargesErrors
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <div className="pt-2">{index + 1}</div>
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={designationChargeType}
                                                                                    getOptionLabel={(option) => option.chargeType || ''}
                                                                                    value={
                                                                                        designationChargeType.find(
                                                                                            (option) => option.chargeType === row.chargeType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.chargeType || '';
                                                                                        const updatedData = [...designationCharges];
                                                                                        updatedData[index].chargeType = newFreightCharges;
                                                                                        setDesignationCharges(updatedData);

                                                                                        const updatedErrors = [...designationChargesErrors];
                                                                                        updatedErrors[index].chargeType = newFreightCharges ? '' : 'Charge Type is required';
                                                                                        setDesignationChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!designationChargesErrors[index]?.chargeType}
                                                                                            helperText={designationChargesErrors[index]?.chargeType}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '30%' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.buyRate}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const updatedData = [...designationCharges];
                                                                                        updatedData[index].buyRate = value;
                                                                                        setDesignationCharges(updatedData);
                                                                                        const updatedErrors = [...designationChargesErrors];
                                                                                        updatedErrors[index].buyRate = value ? '' : 'Buy Rate is required';
                                                                                        setDesignationChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    className={`form-control ${designationChargesErrors[index]?.buyRate ? 'error' : ''}`}
                                                                                />
                                                                                {designationChargesErrors[index]?.buyRate && (
                                                                                    <div className="text-danger" style={{ fontSize: '12px' }}>
                                                                                        {designationChargesErrors[index].buyRate}
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
                                                                                        const updatedData = [...designationCharges];
                                                                                        updatedData[index].currency = newFreightCharges;
                                                                                        setDesignationCharges(updatedData);

                                                                                        const updatedErrors = [...designationChargesErrors];
                                                                                        updatedErrors[index].currency = newFreightCharges ? '' : 'Currency is required';
                                                                                        setDesignationChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!designationChargesErrors[index]?.currency}
                                                                                            helperText={designationChargesErrors[index]?.currency}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.calcType || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
                                                                                            (option) => option.calcType === row.calcType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.calcType || '';
                                                                                        const updatedData = [...designationCharges];
                                                                                        updatedData[index].calcType = newFreightCharges;
                                                                                        setDesignationCharges(updatedData);
                                                                                        const updatedErrors = [...designationChargesErrors];
                                                                                        updatedErrors[index].calcType = newFreightCharges ? '' : 'Calc Type is required';
                                                                                        setDesignationChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!designationChargesErrors[index]?.calcType}
                                                                                            helperText={designationChargesErrors[index]?.calcType}
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
                                    {value === 3 && (
                                        <>
                                            <div className="row d-flex ml">
                                                <div className="mb-1">
                                                    <ActionButton title="Add" icon={AddIcon} onClick={handleAddRowAdditional} />
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-lg-12">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered ">
                                                                <thead>
                                                                    <tr style={{color: 'white'}}>
                                                                        <th className="table-header">Action</th>
                                                                        <th className="table-header">#</th>
                                                                        <th className="table-header">Charge Type</th>
                                                                        <th className="table-header">Buy Rate</th>
                                                                        <th className="table-header">Currency</th>
                                                                        <th className="table-header">Calclation Type</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {additionalCharges.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="border px-2 py-2 text-center">
                                                                                <ActionButton
                                                                                    title="Delete"
                                                                                    icon={DeleteIcon}
                                                                                    onClick={() =>
                                                                                        handleDeleteRow(
                                                                                            row.id,
                                                                                            additionalCharges,
                                                                                            setAdditionalCharges,
                                                                                            additionalChargesErrors,
                                                                                            setAdditionalChargesErrors
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <div className="pt-2">{index + 1}</div>
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={additionalChargeType}
                                                                                    getOptionLabel={(option) => option.chargeType || ''}
                                                                                    value={
                                                                                        additionalChargeType.find(
                                                                                            (option) => option.chargeType === row.chargeType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.chargeType || '';
                                                                                        const updatedData = [...additionalCharges];
                                                                                        updatedData[index].chargeType = newFreightCharges;
                                                                                        setAdditionalCharges(updatedData);

                                                                                        const updatedErrors = [...additionalChargesErrors];
                                                                                        updatedErrors[index].chargeType = newFreightCharges ? '' : 'Charge Type is required';
                                                                                        setAdditionalChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!additionalChargesErrors[index]?.chargeType}
                                                                                            helperText={additionalChargesErrors[index]?.chargeType}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '30%' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={row.buyRate}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        const updatedData = [...additionalCharges];
                                                                                        updatedData[index].buyRate = value;
                                                                                        setAdditionalCharges(updatedData);
                                                                                        const updatedErrors = [...additionalChargesErrors];
                                                                                        updatedErrors[index].buyRate = value ? '' : 'Buy Rate is required';
                                                                                        setAdditionalChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    className={`form-control ${additionalChargesErrors[index]?.buyRate ? 'error' : ''}`}
                                                                                />
                                                                                {additionalChargesErrors[index]?.buyRate && (
                                                                                    <div className="text-danger" style={{ fontSize: '12px' }}>
                                                                                        {additionalChargesErrors[index].buyRate}
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
                                                                                        const updatedData = [...additionalCharges];
                                                                                        updatedData[index].currency = newFreightCharges;
                                                                                        setAdditionalCharges(updatedData);

                                                                                        const updatedErrors = [...additionalChargesErrors];
                                                                                        updatedErrors[index].currency = newFreightCharges ? '' : 'Currency is required';
                                                                                        setAdditionalChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!additionalChargesErrors[index]?.currency}
                                                                                            helperText={additionalChargesErrors[index]?.currency}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                            </td>
                                                                            <td className="border px-2 py-2" style={{ width: '20%' }}>
                                                                                <Autocomplete
                                                                                    options={FreightChargeType}
                                                                                    getOptionLabel={(option) => option.calcType || ''}
                                                                                    value={
                                                                                        FreightChargeType.find(
                                                                                            (option) => option.calcType === row.calcType
                                                                                        ) || null
                                                                                    }

                                                                                    onChange={(event, newValue) => {
                                                                                        const newFreightCharges = newValue?.calcType || '';
                                                                                        const updatedData = [...additionalCharges];
                                                                                        updatedData[index].calcType = newFreightCharges;
                                                                                        setAdditionalCharges(updatedData);
                                                                                        const updatedErrors = [...additionalChargesErrors];
                                                                                        updatedErrors[index].calcType = newFreightCharges ? '' : 'Calc Type is required';
                                                                                        setAdditionalChargesErrors(updatedErrors);
                                                                                    }}
                                                                                    renderInput={(params) => (
                                                                                        <TextField
                                                                                            {...params}
                                                                                            size="small"
                                                                                            error={!!additionalChargesErrors[index]?.calcType}
                                                                                            helperText={additionalChargesErrors[index]?.calcType}
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

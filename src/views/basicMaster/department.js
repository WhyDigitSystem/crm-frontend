import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

export const Department = () => {
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        active: true,
        departmentCode: '',
        departmentName: ''
    });
    const [editId, setEditId] = useState('');

    const theme = useTheme();
    const anchorRef = useRef(null);

    const [fieldErrors, setFieldErrors] = useState({
        departmentName: '',
        departmentCode: ''
    });
    const [listView, setListView] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const listViewColumns = [
        { accessorKey: 'departmentCode', header: 'Code', size: 140 },
        {
            accessorKey: 'departmentName',
            header: 'Name',
            size: 140
        },
        { accessorKey: 'active', header: 'Active', size: 140 }
    ];
    const [listViewData, setListViewData] = useState([]);

    useEffect(() => {
        getDepartmentByOrgId();
    }, []);

    const getDepartmentByOrgId = async () => {
        try {
            const result = await apiCalls('get', `/commonmaster/getDepartmentByOrgId?orgId=${orgId}`);
            setListViewData(result.paramObjectsMap.departmentVO);
            console.log('Test', result);
        } catch (err) {
            console.log('error', err);
        }
    };


    const getDepartmentById = async (row) => {
        const selectedId = row.original.id;
        console.log('Selected Department ID:', selectedId);
        setEditId(selectedId);
        try {
            const response = await apiCalls('get', `/commonmaster/getDepartmentById?id=${selectedId}`);
            console.log('API Response:', response);

            if (response.status === true) {
                setListView(false);
                const department = response.paramObjectsMap.departmentVO;

                setFormData({
                    departmentName: department.departmentName || '',
                    departmentCode: department.departmentCode || '',
                    active: department.active === 'Active' ? true : false
                });
            } else {
                console.error('Failed to fetch Department:', response.paramObjectsMap?.message);
            }
        } catch (error) {
            console.error('Error fetching Department:', error);
        }
    };


    const handleInputChange = (e) => {
        const { name, value, selectionStart, selectionEnd, type } = e.target;
        const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
        const nameRegex = /^[A-Za-z ]*$/;

        if (name === 'departmentCode' && !codeRegex.test(value)) {
            setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
        } else if (name === 'departmentName' && !nameRegex.test(value)) {
            setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
        } else {
            setFormData({ ...formData, [name]: value.toUpperCase() });
            setFieldErrors({ ...fieldErrors, [name]: '' });

            // Update the cursor position after the input change
            if (type === 'text' || type === 'textarea') {
                setTimeout(() => {
                    const inputElement = document.getElementsByName(name)[0];
                    if (inputElement) {
                        inputElement.setSelectionRange(selectionStart, selectionEnd);
                    }
                }, 0);
            }
        }
    };

    const handleClear = () => {
        setFormData({
            departmentName: '',
            departmentCode: '',
            active: true
        });
        setFieldErrors({
            departmentName: '',
            departmentCode: ''
        });
        setEditId('');
    };

    const handleSave = async () => {
        const errors = {};
        if (!formData.departmentCode) {
            errors.departmentCode = 'Country Code is required';
        }
        if (!formData.departmentName) {
            errors.departmentName = 'Country is required';
        }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            const saveFormData = {
                ...(editId && { id: editId }),
                active: formData.active,
                departmentCode: formData.departmentCode,
                departmentName: formData.departmentName,
                orgId: orgId,
                createdBy: loginUserName
            };

            console.log('DATA TO SAVE IS:', saveFormData);

            try {
                const result = await apiCalls('post', `commonmaster/createUpdateDepartment`, saveFormData);

                if (result.status === true) {
                    console.log('Response:', result);
                    showToast('success', editId ? ' Department Updated Successfully' : 'Department created successfully');
                    handleClear();
                    getDepartmentByOrgId();
                    setIsLoading(false);
                } else {
                    showToast('error', result.paramObjectsMap.errorMessage || 'Department creation failed');
                    setIsLoading(false);
                }
            } catch (err) {
                console.log('error', err);
                showToast('error', 'Department creation failed');
                setIsLoading(false);
            }
        } else {
            setFieldErrors(errors);
        }
    };

    const handleView = () => {
        setListView(!listView);
    };

    const handleClose = () => {
        setEditMode(false);
        setFormData({
            country: '',
            departmentCode: ''
        });
    };

    const handleCheckboxChange = (event) => {
        setFormData({
            ...formData,
            active: event.target.checked
        });
    };
    return (
        <>
            <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <div className="row d-flex ml">
                    <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
                        <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
                        <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                        <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                        <ActionButton
                            title="Save"
                            icon={SaveIcon}
                            isLoading={isLoading}
                            onClick={() => handleSave()}
                            margin="0 10px 0 10px"
                        /> &nbsp;{' '}
                    </div>
                </div>
                {listView ? (
                    <div>
                        <CommonListViewTable
                            data={listViewData}
                            columns={listViewColumns}
                            blockEdit={true}
                            toEdit={getDepartmentById}
                        />
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
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.departmentCode}
                                    helperText={fieldErrors.departmentCode}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleInputChange}
                                    error={!!fieldErrors.departmentName}
                                    helperText={fieldErrors.departmentName}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <FormControlLabel
                                    control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                                    label="Active"
                                    labelPlacement="end"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div>
                <ToastComponent />
            </div>
        </>
    );
};
export default Department;

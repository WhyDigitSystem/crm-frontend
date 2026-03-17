import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
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

export const UnitMaster = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    active: true,
    unitCode: '',
    unitDescription: ''
  });
  const [editId, setEditId] = useState('');

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    unitCode: '',
    unitDescription: ''
  });

  const [listView, setListView] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const listViewColumns = [
    { accessorKey: 'unitCode', header: 'Unit Code', size: 140 },
    { accessorKey: 'unitDescription', header: 'Unit Description', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllUnits();
  }, []);

  const getAllUnits = async () => {
    try {
      const result = await apiCalls('get', `ncontroller/getAllUnitMasterByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.unitMasterVO.reverse() || []);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  const getUnitById = async (row) => {
    const id = row.original.id;
    setEditId(id);
    try {
      const response = await apiCalls('get', `ncontroller/getUnitMasterById?id=${id}`);
      if (response.status === true) {
        const unit = response.paramObjectsMap.unitMasterVO;
        setFormData({
          unitCode: unit.unitCode || '',
          unitDescription: unit.unitDescription || '',
          active: unit.active === 'Active'
        });
        setListView(false);
      }
    } catch (error) {
      console.error('Error fetching unit by ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9_-]*$/;
    const descRegex = /^[A-Za-z0-9 ]*$/;

    if (name === 'unitCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'unitDescription' && !descRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      setFieldErrors({ ...fieldErrors, [name]: '' });

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
      unitCode: '',
      unitDescription: '',
      active: true
    });
    setFieldErrors({
      unitCode: '',
      unitDescription: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.unitCode) {
      errors.unitCode = 'Unit Code is required';
    }
    if (!formData.unitDescription) {
      errors.unitDescription = 'Unit Description is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        cancel: true,
        unitCode: formData.unitCode,
        unitDescription: formData.unitDescription,
        orgId: Number(orgId),
        createdBy: loginUserName
      };

      try {
        const result = await apiCalls('put', `ncontroller/createUpdateUnitMaster`, saveFormData);
        if (result.status === true) {
          showToast('success', editId ? 'Unit Updated Successfully' : 'Unit Created Successfully');
          handleClear();
          getAllUnits();
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

  const handleClose = () => {
    setEditMode(false);
    setFormData({
      unitCode: '',
      unitDescription: '',
      active: true
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
        {listView ? (
          <div>
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getUnitById} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Unit Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="unitCode"
                  value={formData.unitCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.unitCode}
                  helperText={fieldErrors.unitCode}
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Unit Description"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="unitDescription"
                  value={formData.unitDescription}
                  onChange={handleInputChange}
                  error={!!fieldErrors.unitDescription}
                  helperText={fieldErrors.unitDescription}
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

export default UnitMaster;

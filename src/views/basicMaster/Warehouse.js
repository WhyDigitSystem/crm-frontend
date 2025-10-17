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
import AddIcon from '@mui/icons-material/Add';

export const Warehouse = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [branchCode] = useState(localStorage.getItem('branchcode'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    active: true,
    warehouseCode: '',
    warehouse: ''
  });
  const [editId, setEditId] = useState('');

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    warehouse: '',
    warehouseCode: ''
  });
  const [listView, setListView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const listViewColumns = [
    { accessorKey: 'code', header: 'Code', size: 140 },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      size: 140
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllWarehouse();
  }, []);

  const getAllWarehouse = async () => {
    try {
      const result = await apiCalls('get', `/master/getAllWarehouseByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.warehouseVO);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getWarehouseById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/master/getWarehouseById?id=${row.original.id}`);

      if (response.status === true) {
        const warehouse = response.paramObjectsMap.warehouseVO;
        setFormData({
          warehouseCode: warehouse.code,
          warehouse: warehouse.warehouse,
          active: warehouse.active === 'Active' ? true : false
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (name === 'warehouseCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'warehouse' && !nameRegex.test(value)) {
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
      warehouse: '',
      warehouseCode: '',
      active: true
    });
    setFieldErrors({
      warehouse: '',
      warehouseCode: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.warehouseCode) {
      errors.warehouseCode = 'Warehouse Code is required';
    }
    if (!formData.warehouse) {
      errors.warehouse = 'Warehouse is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveFormData = {
        ...(editId && { id: editId }),
        branch: branch,
        branchCode: branchCode,
        active: formData.active,
        code: formData.warehouseCode,
        warehouse: formData.warehouse,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const result = await apiCalls('put', `/master/createUpdateWarehouse`, saveFormData);

        if (result.status === true) {
          console.log('Response:', result);
          showToast('success', editId ? ' Warehouse Updated Successfully' : 'Warehouse created successfully');
          handleClear();
          getAllWarehouse();
          setIsLoading(false);
        } else {
          showToast('error', result.paramObjectsMap.errorMessage || 'Warehouse creation failed');
          setIsLoading(false);
        }
      } catch (err) {
        console.log('error', err);
        showToast('error', 'Warehouse creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
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
            <CommonListViewTable
              data={listViewData}
              columns={listViewColumns}
              blockEdit={true} // DISAPLE THE MODAL IF TRUE
              toEdit={getWarehouseById}
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
                  name="warehouseCode"
                  value={formData.warehouseCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.warehouseCode}
                  helperText={fieldErrors.warehouseCode}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Warehouse"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleInputChange}
                  error={!!fieldErrors.warehouse}
                  helperText={fieldErrors.warehouse}
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
export default Warehouse;

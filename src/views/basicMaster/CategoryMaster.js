import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

export const CategoryMaster = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    categoryId: '',
    categoryName: ''
  });
  const [editId, setEditId] = useState('');
  const [listView, setListView] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    categoryId: '',
    categoryName: ''
  });
  const [listViewData, setListViewData] = useState([]);

  const listViewColumns = [
    { accessorKey: 'categoryId', header: 'Category ID', size: 140 },
    { accessorKey: 'categoryName', header: 'Category Name', size: 200 },
    { accessorKey: 'active', header: 'Active', size: 100 }
  ];

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    try {
      const result = await apiCalls('get', `ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.categoryVO.reverse() || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const getCategoryById = async (row) => {
    const id = row.original.id;
    setEditId(id);
    try {
      const response = await apiCalls('get', `ncontroller/getCategoryById?id=${id}`);
      if (response.status === true) {
        const category = response.paramObjectsMap.categoryVO;
        setFormData({
          categoryId: category.categoryId || '',
          categoryName: category.categoryName || '',
          active: category.active === 'Active'
        });
        setListView(false);
      }
    } catch (error) {
      console.error('Error fetching category by ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, selectionStart, selectionEnd, type } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z0-9 ]*$/;

    if (name === 'categoryId' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'categoryName' && !nameRegex.test(value)) {
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
      categoryId: '',
      categoryName: '',
      active: true
    });
    setFieldErrors({
      categoryId: '',
      categoryName: ''
    });
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.categoryId) {
      errors.categoryId = 'Category ID is required';
    }
    if (!formData.categoryName) {
      errors.categoryName = 'Category Name is required';
    }

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);

      const saveFormData = {
        ...(editId && { id: editId }),
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        active: formData.active,
        cancel: true,
        orgId: Number(orgId),
        createdBy: loginUserName
      };

      try {
        const result = await apiCalls('put', `ncontroller/createUpdateCategory`, saveFormData);
        if (result.status === true) {
          showToast('success', editId ? 'Category updated successfully' : 'Category created successfully');
          handleClear();
          getAllCategories();
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

        {listView ? (
          <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getCategoryById} />
        ) : (
          <div className="row">
            <div className="col-md-3 mb-3">
              <TextField
                label="Category ID"
                variant="outlined"
                size="small"
                fullWidth
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                error={!!fieldErrors.categoryId}
                helperText={fieldErrors.categoryId}
              />
            </div>

            <div className="col-md-3 mb-3">
              <TextField
                label="Category Name"
                variant="outlined"
                size="small"
                fullWidth
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                error={!!fieldErrors.categoryName}
                helperText={fieldErrors.categoryName}
              />
            </div>

            <div className="col-md-3 mb-3">
              <FormControlLabel control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />} label="Active" />
            </div>
          </div>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default CategoryMaster;

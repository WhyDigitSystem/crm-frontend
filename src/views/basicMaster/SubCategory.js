import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Autocomplete,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiCalls from 'apicall';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from './CommonListViewTable';

export const SubCategory = () => {
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    active: true,
    categoryName: '',
    docId: '',
    subCategoryName: ''
  });
  const [editId, setEditId] = useState('');
  const [categoryList, setCategoryList] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({
    categoryName: '',
    docId: '',
    subCategoryName: ''
  });
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  const listViewColumns = [
    { accessorKey: 'categoryName', header: 'Category Name', size: 160 },
    { accessorKey: 'docId', header: 'Subcategory ID', size: 140 },
    { accessorKey: 'subCategoryName', header: 'Subcategory Name', size: 160 },
    { accessorKey: 'active', header: 'Active', size: 100 }
  ];

  useEffect(() => {
    getAllSubCategories();
    getAllCategories();
  }, []);

  const getAllSubCategories = async () => {
    try {
      const result = await apiCalls('get', `master/getSubCategoryByOrgId?orgId=${orgId}`);
      setListViewData(result.paramObjectsMap.subCategoryVO.reverse() || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const getAllCategories = async () => {
    try {
      const result = await apiCalls('get', `ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      setCategoryList(result.paramObjectsMap.categoryVO || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const getSubCategoryById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `master/getSubCategoryById?id=${row.original.id}`);
      if (response.status === true && response.paramObjectsMap.subCategoryVO) {
        const data = response.paramObjectsMap.subCategoryVO;
        setFormData({
          categoryName: data.categoryName,
          docId: data.docId,
          subCategoryName: data.subCategoryName,
          active: data.active === 'Active'
        });
        setListView(false);
      } else {
        showToast('error', 'Subcategory not found');
      }
    } catch (error) {
      console.error('Error fetching subcategory by ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'subCategoryName') {
      updatedValue = value.toUpperCase(); // only this field needs uppercasing
    }

    setFormData({ ...formData, [name]: updatedValue });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData({
      active: true,
      categoryName: '',
      docId: '',
      subCategoryName: ''
    });
    setEditId('');
    setFieldErrors({
      categoryName: '',
      docId: '',
      subCategoryName: ''
    });
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.categoryName) errors.categoryName = 'Category is required';
    if (!formData.docId) errors.docId = 'Subcategory ID is required';
    if (!formData.subCategoryName) errors.subCategoryName = 'Subcategory Name is required';

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const payload = {
        ...(editId && { id: editId }),
        active: formData.active,
        categoryName: formData.categoryName,
        docId: formData.docId,
        subCategoryName: formData.subCategoryName,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log("Saving Payload:", payload); // debug log

      try {
        const response = await apiCalls('put', `master/createUpdateSubCatetory`, payload);
        if (response.status === true) {
          showToast('success', editId ? 'Subcategory updated successfully' : 'Subcategory created successfully');
          handleClear();
          getAllSubCategories();
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Operation failed');
        }
      } catch (error) {
        console.error('Error saving subcategory:', error);
        showToast('error', 'Subcategory creation failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleCheckboxChange = (event) => {
    setFormData({ ...formData, active: event.target.checked });
  };

  const handleView = () => {
    setListView(!listView);
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4">
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px" />
          </div>
        </div>

        {listView ? (
          <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getSubCategoryById} />
        ) : (
          <div className="row">
            {/* <div className="col-md-3 mb-3">
              <FormControl variant="outlined" size="small" fullWidth error={!!fieldErrors.categoryName}>
                <InputLabel id="category-label">Category Name</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryName"
                  value={formData.categoryName}
                  label="Category Name"
                  onChange={handleInputChange}
                >
                  {categoryList.map((row) => (
                    <MenuItem key={row.id} value={row.categoryName}>
                      {row.categoryName}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.categoryName && <FormHelperText>{fieldErrors.categoryName}</FormHelperText>}
              </FormControl>
            </div> */}
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={categoryList}
                getOptionLabel={(option) =>
                  option?.categoryName ? `${option.categoryName}` : ''
                }
                value={
                  categoryList.find((item) => item.categoryName === formData.categoryName) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      categoryName: newValue.categoryName || '',
                    }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      categoryName: '',
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      categoryName: '',
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Category Name <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    error={!!fieldErrors.categoryName}
                    helperText={fieldErrors.categoryName}
                  />
                )}
              />
            </div>
            {/* Subcategory ID */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Subcategory ID"
                variant="outlined"
                size="small"
                fullWidth
                name="docId"
                value={formData.docId}
                onChange={handleInputChange}
                error={!!fieldErrors.docId}
                helperText={fieldErrors.docId}
              />
            </div>

            {/* Subcategory Name */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Subcategory Name"
                variant="outlined"
                size="small"
                fullWidth
                name="subCategoryName"
                value={formData.subCategoryName}
                onChange={handleInputChange}
                error={!!fieldErrors.subCategoryName}
                helperText={fieldErrors.subCategoryName}
              />
            </div>

            {/* Active Checkbox */}
            <div className="col-md-3 mb-3">
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
                label="Active"
              />
            </div>
          </div>
        )}
      </div>
      <ToastComponent />
    </>
  );
};

export default SubCategory;

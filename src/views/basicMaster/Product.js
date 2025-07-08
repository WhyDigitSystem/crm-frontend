import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  ButtonBase,
  FormHelperText,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import CommonListViewTable from './CommonListViewTable';

export const Product = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    docId:'',
    productName: '',
    type: '',
    brand: '',
    subCategory: '',
    category: '',
    unit: '',
    description: '',
    active: true,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  useEffect(() => {
    getAllCategories();
    getAllUnits();
    getAllSubCategories();
    getAllProducts();
  }, []);

  const getAllCategories = async () => {
    try {
      const res = await apiCalls('get', `ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      setCategoryList(res.paramObjectsMap.categoryVO || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const getAllUnits = async () => {
    try {
      const res = await apiCalls('get', `ncontroller/getAllUnitMasterByOrgId?orgId=${orgId}`);
      setUnitList(res.paramObjectsMap.unitMasterVO || []);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  const getAllSubCategories = async () => {
    try {
      const res = await apiCalls('get', `master/getSubCategoryByOrgId?orgId=${orgId}`);
      setSubCategoryList(res.paramObjectsMap.subCategoryVO || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await apiCalls('get', `master/getAllProductByOrgId?orgId=${orgId}`);
      setListViewData(res.paramObjectsMap.productVO || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const getProductById = async (row) => {
    setEditId(row.original.id);
    try {
      const res = await apiCalls('get', `master/getProductById?id=${row.original.id}`);
      if (res.status) {
        const data = res.paramObjectsMap.productVO;
        setFormData({
          brand: data.brand,
          docId:data.docId,
          productName: data.productName,
          subCategory: data.subCategory,
          category: data.category,
          unit: data.unit,
          type: data.type,
          description: data.description,
          active: data.active === 'Active',
        });
        setListView(false);
      }
    } catch (err) {
      console.error('Error getting product by ID:', err);
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.productName) errors.productName = 'Product Name is required';
    if (!formData.docId) errors.docId = 'Product Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.subCategory) errors.subCategory = 'Sub Category is required';

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const saveData = {
        ...(editId && { id: editId }),
        active: formData.active,
        brand: formData.brand,
        category: formData.category,
        createdBy: loginUserName,
        description: formData.description,
        docId: '',
        orgId: orgId,
        productName: formData.productName,
        docId:formData.docId,
        subCategory: formData.subCategory,
        type: formData.type,
        unit: formData.unit,
      };

      try {
        const res = await apiCalls('put', `master/createUpdateProduct`, saveData);
        if (res.status) {
          showToast('success', editId ? 'Product updated successfully' : 'Product created successfully');
          handleClear();
          getAllProducts();
        } else {
          showToast('error', res.paramObjectsMap.errorMessage || 'Save failed');
        }
      } catch (err) {
        showToast('error', 'Save failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'active' ? checked : value.toUpperCase(),
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData({
      brand: '',
      productName: '',
      docId:'',
      subCategory: '',
      category: '',
      unit: '',
      type: '',
      description: '',
      active: true,
    });
    setFieldErrors({});
    setEditId('');
  };

  const handleView = () => setListView(!listView);

  const listViewColumns = [
    { accessorKey: 'docId', header: 'Product Code', size: 140 },
    { accessorKey: 'productName', header: 'Product', size: 140 },
    { accessorKey: 'brand', header: 'Brand', size: 140 },
    { accessorKey: 'category', header: 'Category', size: 140 },
    { accessorKey: 'unit', header: 'Unit', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'subCategory', header: 'Sub Category', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 },
  ];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => { }} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px" />
        </div>

        {listView ? (
          <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getProductById} />
        ) : (
          <div className="row">

            {/* Product Name */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Product Code"
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

            {/* Product Name */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Product Name"
                variant="outlined"
                size="small"
                fullWidth
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                error={!!fieldErrors.productName}
                helperText={fieldErrors.productName}
              />
            </div>

            {/* Brand */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Brand"
                variant="outlined"
                size="small"
                fullWidth
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                error={!!fieldErrors.brand}
                helperText={fieldErrors.brand}
              />
            </div>

            {/* Category */}
            <div className="col-md-3 mb-3">
              <FormControl size="small" fullWidth error={!!fieldErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={formData.category} onChange={handleInputChange} label="Category">
                  {categoryList.map((row) => (
                    <MenuItem key={row.id} value={row.categoryName}>
                      {row.categoryName}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.category && <FormHelperText>{fieldErrors.category}</FormHelperText>}
              </FormControl>
            </div>

            {/* Sub Category */}
            <div className="col-md-3 mb-3">
              <FormControl size="small" fullWidth error={!!fieldErrors.subCategory}>
                <InputLabel>Sub Category</InputLabel>
                <Select name="subCategory" value={formData.subCategory} onChange={handleInputChange} label="Sub Category">
                  {subCategoryList.map((row) => (
                    <MenuItem key={row.id} value={row.subCategoryName}>
                      {row.subCategoryName}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.subCategory && <FormHelperText>{fieldErrors.subCategory}</FormHelperText>}
              </FormControl>
            </div>

            {/* Unit */}
            <div className="col-md-3 mb-3">
              <FormControl size="small" fullWidth error={!!fieldErrors.unit}>
                <InputLabel>Unit</InputLabel>
                <Select name="unit" value={formData.unit} onChange={handleInputChange} label="Unit">
                  {unitList.map((row) => (
                    <MenuItem key={row.id} value={row.unitDescription}>
                      {row.unitDescription}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.unit && <FormHelperText>{fieldErrors.unit}</FormHelperText>}
              </FormControl>
            </div>

            {/* Type */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Type"
                variant="outlined"
                size="small"
                fullWidth
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
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

            {/* Active Checkbox */}
            <div className="col-md-3 mb-3">
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
                label="Active"
              />
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Product;

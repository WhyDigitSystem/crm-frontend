import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Autocomplete
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import CommonListViewTable from './CommonListViewTable';

export const Product = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(() => new Date().getFullYear().toString());
  const branch = localStorage.getItem('branch') || 'BANGALORE';
  const branchCode = localStorage.getItem('branchcode') || 'BLR';

  const initialFormState = {
    docId: '',
    brand: '',
    productName: '',
    productCode: '',
    subCategory: '',
    category: '',
    unit: '',
    type: '',
    description: '',
    active: true,
  };

  const typeOptions = ['Product', 'Service'];


  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  // Function to fetch product docId
  const getProductDocId = async () => {
    if (editId) return;
    try {
      const res = await apiCalls(
        'get',
        `/master/getProductDocId?branch=${branch}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
      );
      if (res.status) {
        setFormData(prev => ({
          ...prev,
          docId: res.paramObjectsMap.callsDocId
        }));
      }
    } catch (err) {
      console.error('Error fetching product docId:', err);
      showToast('error', 'Failed to generate product code');
    }
  };

  useEffect(() => {
    getAllCategories();
    getAllUnits();
    getAllSubCategories();
    getAllProducts();
    getProductDocId();
  }, []);

  const getAllCategories = async () => {
    try {
      const res = await apiCalls('get', `ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      setCategoryList(res.paramObjectsMap?.categoryVO || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showToast('error', 'Failed to load categories');
    }
  };

  const getAllUnits = async () => {
    try {
      const res = await apiCalls('get', `ncontroller/getAllUnitMasterByOrgId?orgId=${orgId}`);
      setUnitList(res.paramObjectsMap?.unitMasterVO || []);
    } catch (err) {
      console.error('Error fetching units:', err);
      showToast('error', 'Failed to load units');
    }
  };

  const getAllSubCategories = async () => {
    try {
      const res = await apiCalls('get', `master/getSubCategoryByOrgId?orgId=${orgId}`);
      setSubCategoryList(res.paramObjectsMap?.subCategoryVO || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      showToast('error', 'Failed to load subcategories');
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await apiCalls('get', `master/getAllProductByOrgId?orgId=${orgId}`);
      setListViewData(res.paramObjectsMap?.productVO || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('error', 'Failed to load products');
    }
  };

  const getProductById = async (row) => {
    setEditId(row.original.id);
    try {
      const res = await apiCalls('get', `master/getProductById?id=${row.original.id}`);
      if (res.status && res.paramObjectsMap?.productVO) {
        const data = res.paramObjectsMap.productVO;
        setFormData(prev => ({
          ...prev,
          brand: data.brand || '',
          productCode: data.productCode || '',
          productName: data.productName || '',
          subCategory: data.subCategory || '',
          category: data.category || '',
          unit: data.unit || '',
          type: data.type || '',
          description: data.description || '',
          active: data.active === 'Active',
        }));
        setListView(false);
      } else {
        showToast('error', 'Product not found');
      }
    } catch (err) {
      console.error('Error getting product by ID:', err);
      showToast('error', 'Failed to load product details');
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.productName) errors.productName = 'Product Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.subCategory) errors.subCategory = 'Sub Category is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    const productCode = editId ? formData.productCode : formData.docId;

    const saveData = {
      ...(editId && { id: editId }),
      active: formData.active,
      brand: formData.brand,
      category: formData.category,
      createdBy: loginUserName,
      description: formData.description,
      productCode: productCode,
      orgId: parseInt(orgId),
      productName: formData.productName,
      subCategory: formData.subCategory,
      type: formData.type,
      unit: formData.unit,
      branch: branch,
      branchCode: branchCode,
      finYear: finYear
    };

    try {
      const res = await apiCalls('put', `/master/createUpdateProduct`, saveData);
      if (res.status) {
        showToast('success', editId ? 'Product updated successfully' : 'Product created successfully');
        handleClear();
        getAllProducts();
      } else {
        const errorMsg = res.paramObjectsMap?.errorMessage || 'Save failed';
        showToast('error', errorMsg);
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('error', 'Save operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setFieldErrors({});
    setEditId('');
    getProductDocId();
  };

  const handleView = () => setListView(!listView);

  const listViewColumns = [
    { accessorKey: 'productCode', header: 'Product Code', size: 140 },
    { accessorKey: 'productName', header: 'Product', size: 140 },
    { accessorKey: 'brand', header: 'Brand', size: 140 },
    { accessorKey: 'category', header: 'Category', size: 140 },
    { accessorKey: 'unit', header: 'Unit', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'subCategory', header: 'Sub Category', size: 140 },
    {
      accessorKey: 'active',
      header: 'Active',
      size: 140,
      Cell: ({ cell }) => cell.getValue() ? 'Active' : 'Inactive'
    },
    // {
    //   accessorKey: 'actions',
    //   header: 'Actions',
    //   size: 100,
    //   Cell: ({ row }) => (
    //     <button
    //       onClick={() => getProductById(row.original.id)}
    //       className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    //     >
    //       Edit
    //     </button>
    //   )
    // }
  ];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => { }} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
          <ActionButton
            title={editId ? "Update" : "Save"}
            icon={SaveIcon}
            isLoading={isLoading}
            onClick={handleSave}
            margin="0 10px"
          />
        </div>

        {listView ? (
          <CommonListViewTable
            data={listViewData}
            columns={listViewColumns}
            blockEdit={false}
            toEdit={getProductById}
          />
        ) : (
          <div className="row">
            {/* Product Code */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Product Code"
                variant="outlined"
                size="small"
                fullWidth
                value={editId ? formData.productCode : formData.docId}
                disabled
              />
            </div>

            {/* Product Name */}
            <div className="col-md-3 mb-3">
              <TextField
                label="Product Name *"
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
                label="Brand *"
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
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category *"
                >
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
                <InputLabel>Sub Category *</InputLabel>
                <Select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  label="Sub Category *"
                >
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
                <InputLabel>Unit *</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  label="Unit *"
                >
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
              <Autocomplete
                size="small"
                fullWidth
                options={typeOptions}
                value={formData.type || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: {
                      name: 'type',
                      value: newValue || ''
                    }
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type"
                    variant="outlined"
                  />
                )}
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
                // multiline
                // rows={2}
              />
            </div>

            {/* Active Checkbox */}
            <div className="col-md-3 mb-3 d-flex align-items-center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active}
                    onChange={handleInputChange}
                    name="active"
                  />
                }
                label="Active"
              />
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Product;
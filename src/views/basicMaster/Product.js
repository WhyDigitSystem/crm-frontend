import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { TextField, Checkbox, FormControlLabel, FormControl, InputLabel, MenuItem, Select, Autocomplete } from '@mui/material';
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
  const branch = localStorage.getItem('branch');
  const branchCode = localStorage.getItem('branchcode');

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
    grade: '',
    pricePerUnit: '',
    lengthMM: '',
    diameter: '',
    weightPerMeter: '',
    yieldStrength: '',
    tensileStrength: '',
    elongation: '',
    standard: ''
  };

  const typeOptions = ['Product', 'Service'];
  const gradeOptions = ['A Grade', 'B Grade', 'C Grade'];

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
        setFormData((prev) => ({
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

  const getAllSubCategories = async (category) => {
    try {
      const res = await apiCalls('get', `/master/getSubCategoryName?category=${category}&orgId=${orgId}`);
      setSubCategoryList(res.paramObjectsMap?.subCategory || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      showToast('error', 'Failed to load subcategories');
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await apiCalls('get', `master/getAllProductByOrgId?orgId=${orgId}`);
      setListViewData(res.paramObjectsMap?.productVO.reverse() || []);
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
        setFormData((prev) => ({
          ...prev,
          brand: data.brand || '',
          productCode: data.productCode || '',
          productName: data.productName || '',
          subCategory: data.subCategory || '',
          category: data.category || '',
          unit: data.unit || '',
          type: data.type || '',
          description: data.description || '',
          active: data.active === 'Active' ? true : false,
          grade:data.grade,
          pricePerUnit:data.pricePerUnit,
          lengthMM:data.lengthMM,
          diameter:data.diameter,
          weightPerMeter:data.weightPerMeter,
          yieldStrength:data.yieldStrength,
          tensileStrength:data.tensileStrength,
          elongation:data.elongation,
          standard:data.standard
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
    if (!formData.pricePerUnit) errors.pricePerUnit = 'Price is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      console.log('Errors', errors);
      showToast('error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);

    const productCode = editId ? formData.productCode : formData.docId;

    const saveData = {
      ...(editId && { id: editId }),
      // productCode: productCode,
      // type: formData.type,
      
      active: formData.active,
      orgId: parseInt(orgId),
      branch: branch,
      branchCode: branchCode,
      brand: formData.brand,
      category: formData.category,
      createdBy: loginUserName,
      description: formData.description,
      diameter: parseInt(formData.diameter),
      elongation: parseFloat(formData.elongation),
      finYear: finYear,
      grade: formData.grade,
      lengthMM: parseInt(formData.lengthMM),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      productName: formData.productName,
      standard: formData.standard,
      subCategory: formData.subCategory,
      tensileStrength: parseFloat(formData.tensileStrength),
      unit: formData.unit,
      weightPerMeter: parseFloat(formData.weightPerMeter),
      yieldStrength: parseFloat(formData.yieldStrength),
    };

    try {
      const res = await apiCalls('put', `/master/createUpdateProduct`, saveData);
      if (res.status) {
        showToast('success', editId ? 'Product updated successfully' : 'Product created successfully');
        handleClear();
        getAllProducts();
        getProductDocId();
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
      [name]: type === 'checkbox' ? checked : value
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setFieldErrors({});
    setEditId('');
    getProductDocId();
  };

  const handleView = () => {
    setListView(!listView);
    handleClear();
  };

  const listViewColumns = [
    { accessorKey: 'productCode', header: 'Code', size: 140 },
    { accessorKey: 'productName', header: 'Name', size: 140 },
    { accessorKey: 'category', header: 'Category', size: 140 },
    { accessorKey: 'grade', header: 'Grade', size: 140 },
    { accessorKey: 'diameter', header: 'Diameter(mm)', size: 140 },
    { accessorKey: 'unit', header: 'Unit', size: 140 },
    { accessorKey: 'pricePerUnit', header: 'Price', size: 140 },
    {
      accessorKey: 'active',
      header: 'Active',
      size: 140,
      Cell: ({ cell }) => (cell.getValue() ? 'Active' : 'Inactive')
    }
  ];

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
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
        {listView ? (
          <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={false} toEdit={getProductById} />
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
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={categoryList}
                getOptionLabel={(option) => (option?.categoryName ? `${option.categoryName}` : '')}
                value={categoryList.find((item) => item.categoryName === formData.category) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      category: newValue.categoryName || ''
                    }));
                    getAllSubCategories(newValue.categoryName);
                    setFieldErrors((prev) => ({
                      ...prev,
                      category: ''
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      categoryName: ''
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Category<span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    error={!!fieldErrors.category}
                    helperText={fieldErrors.category}
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={subCategoryList}
                getOptionLabel={(option) => (option?.subCategory ? `${option.subCategory}` : '')}
                value={subCategoryList.find((item) => item.subCategory === formData.subCategory) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      subCategory: newValue.subCategory || ''
                    }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      subCategory: ''
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      subCategory: ''
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Sub Category<span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    error={!!fieldErrors.subCategory}
                    helperText={fieldErrors.subCategory}
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                size="small"
                fullWidth
                options={gradeOptions}
                value={formData.grade || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: {
                      name: 'grade',
                      value: newValue || ''
                    }
                  });
                }}
                renderInput={(params) => <TextField {...params} label="Grade" variant="outlined" />}
              />
            </div>
            <div className="col-md-3 mb-3">
              <Autocomplete
                options={unitList}
                getOptionLabel={(option) => (option?.unitDescription ? `${option.unitDescription}` : '')}
                value={unitList.find((item) => item.unitDescription === formData.unit) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      unit: newValue.unitDescription || ''
                    }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      unit: ''
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      unit: ''
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <span>
                        Unit<span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    error={!!fieldErrors.unit}
                    helperText={fieldErrors.unit}
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Price Per Unit"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                error={!!fieldErrors.pricePerUnit}
                helperText={fieldErrors.pricePerUnit}
              />
            </div>
            {/* <div className="col-md-3 mb-3">
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
                renderInput={(params) => <TextField {...params} label="Type" variant="outlined" />}
              />
            </div> */}

            {/* Description */}
            <div className="col-md-6 mb-3">
              <TextField
                label="Description"
                variant="outlined"
                size="small"
                fullWidth
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                // rows={2}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Length(mm)"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="lengthMM"
                value={formData.lengthMM}
                onChange={handleInputChange}
                error={!!fieldErrors.lengthMM}
                helperText={fieldErrors.lengthMM}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Diameter(mm)"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="diameter"
                value={formData.diameter}
                onChange={handleInputChange}
                error={!!fieldErrors.diameter}
                helperText={fieldErrors.diameter}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Weight Per Meter(KG)"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="weightPerMeter"
                value={formData.weightPerMeter}
                onChange={handleInputChange}
                error={!!fieldErrors.weightPerMeter}
                helperText={fieldErrors.weightPerMeter}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Yield Strength(MPa)"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="yieldStrength"
                value={formData.yieldStrength}
                onChange={handleInputChange}
                error={!!fieldErrors.yieldStrength}
                helperText={fieldErrors.yieldStrength}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Tensile Strength (MPa)"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="tensileStrength"
                value={formData.tensileStrength}
                onChange={handleInputChange}
                error={!!fieldErrors.tensileStrength}
                helperText={fieldErrors.tensileStrength}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Elongation %"
                variant="outlined"
                size="small"
                fullWidth
                type="number"
                name="elongation"
                value={formData.elongation}
                onChange={handleInputChange}
                error={!!fieldErrors.elongation}
                helperText={fieldErrors.elongation}
              />
            </div>
            <div className="col-md-3 mb-3">
              <TextField
                label="Standard"
                variant="outlined"
                size="small"
                fullWidth
                name="standard"
                value={formData.standard}
                onChange={handleInputChange}
                error={!!fieldErrors.standard}
                helperText={fieldErrors.standard}
              />
            </div>
            {/* Active Checkbox */}
            <div className="col-md-3 mb-3 d-flex align-items-center">
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />}
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

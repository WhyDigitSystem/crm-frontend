import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  FormHelperText,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CommonListViewTable from './CommonListViewTable';

export const PriceMaster = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName] = useState(localStorage.getItem('userName'));

  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  const [formData, setFormData] = useState({
    productName: '',
    fromDate: null,
    toDate: null,
    price: '',
    discount: '',
    sellingPrice: '',
    brand: '',
    category: '',
    subCategory: '',
    gstApplicable: '',
    hsn: '',
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllCategories();
    getAllSubCategories();
    getAllProducts();
    getAllPrices();
  }, []);

  const getAllPrices = async () => {
    try {
      const response = await apiCalls('get', `master/getAllPriceByOrgId?orgId=${orgId}`);
      if (response.status) {
        setListViewData(response.paramObjectsMap.priceVO);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  };

  const getPriceById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `master/getPriceById?id=${row.original.id}`);
      if (response.status) {
        const data = response.paramObjectsMap.priceVO;
        setFormData({
          productName: data.productName,
          fromDate: dayjs(data.fromDate),
          toDate: dayjs(data.toDate),
          price: data.price,
          discount: data.discount,
          sellingPrice: data.sellingPrice,
          brand: data.brand,
          category: data.category,
          subCategory: data.subCategory,
          gstApplicable: data.gstApplicable,
          hsn: data.hsn,
          active: data.active === 'Active'
        });
        setListView(false);
      }
    } catch (err) {
      console.error('Error getting price by ID:', err);
    }
  };

  const getAllProducts = async () => {
    try {
      const res = await apiCalls('get', `master/getAllProductByOrgId?orgId=${orgId}`);
      setProductList(res.paramObjectsMap.productVO || []);
    } catch (err) {
      console.error('Error fetching products:', err);
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

  const getAllCategories = async () => {
    try {
      const res = await apiCalls('get', `ncontroller/getAllCategoryByOrgId?orgId=${orgId}`);
      setCategoryList(res.paramObjectsMap.categoryVO || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'active' ? checked : value
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleClear = () => {
    setFormData({
      productName: '',
      fromDate: null,
      toDate: null,
      price: '',
      discount: '',
      sellingPrice: '',
      brand: '',
      category: '',
      subCategory: '',
      gstApplicable: '',
      hsn: '',
      active: true
    });
    setFieldErrors({});
    setEditId('');
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.productName) errors.productName = 'Product Name is required';
    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.subCategory) errors.subCategory = 'Sub Category is required';
    if (!formData.gstApplicable) errors.gstApplicable = 'GST field is required';

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const payload = {
        ...(editId && { id: editId }),
        productName: formData.productName,
        fromDate: formData.fromDate ? dayjs(formData.fromDate).format('YYYY-MM-DD') : null,
        toDate: formData.toDate ? dayjs(formData.toDate).format('YYYY-MM-DD') : null,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        sellingPrice: parseFloat(formData.sellingPrice),
        brand: formData.brand,
        category: formData.category,
        subCategory: formData.subCategory,
        gstApplicable: formData.gstApplicable,
        hsn: formData.hsn,
        active: formData.active,
        orgId,
        createdBy: loginUserName
      };
      try {
        const res = await apiCalls('put', `master/createUpdatePrice`, payload);
        if (res.status) {
          showToast('success', editId ? 'Price updated successfully' : 'Price created successfully');
          handleClear();
          getAllPrices();
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

  const handleView = () => setListView(!listView);

  const listViewColumns = [
    { accessorKey: 'productName', header: 'Product' },
    { accessorKey: 'brand', header: 'Brand' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'subCategory', header: 'Sub Category' },
    { accessorKey: 'price', header: 'Price' },
    { accessorKey: 'discount', header: 'Discount %' },
    { accessorKey: 'sellingPrice', header: 'Selling Price' },
    { accessorKey: 'gstApplicable', header: 'GST Applicable' },
    { accessorKey: 'hsn', header: 'HSN' },
    { accessorKey: 'active', header: 'Active' }
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
          <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getPriceById} />
        ) : (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" fullWidth error={!!fieldErrors.productName}>
                  <InputLabel>Product Name</InputLabel>
                  <Select
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    label="Product Name"
                  >
                    {productList.map((item) => (
                      <MenuItem key={item.id} value={item.productName}>
                        {item.productName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.productName && <FormHelperText>{fieldErrors.productName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <DatePicker label="From Date" value={formData.fromDate} onChange={(value) => setFormData({ ...formData, fromDate: value })} format="DD/MM/YYYY" slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              </div>
              <div className="col-md-3 mb-3">
                <DatePicker label="To Date" value={formData.toDate} onChange={(value) => setFormData({ ...formData, toDate: value })} format="DD/MM/YYYY" slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              </div>
              <div className="col-md-3 mb-3">
                <TextField label="Price" name="price" value={formData.price} onChange={handleInputChange} size="small" fullWidth />
              </div>
              <div className="col-md-3 mb-3">
                <TextField label="Discount %" name="discount" value={formData.discount} onChange={handleInputChange} size="small" fullWidth />
              </div>
              <div className="col-md-3 mb-3">
                <TextField label="Selling Price" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} size="small" fullWidth />
              </div>
              <div className="col-md-3 mb-3">
                <TextField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} size="small" fullWidth error={!!fieldErrors.brand} helperText={fieldErrors.brand} />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" fullWidth error={!!fieldErrors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select name="category" value={formData.category} onChange={handleInputChange} label="Category">
                    {categoryList.map((item) => (
                      <MenuItem key={item.id} value={item.categoryName}>
                        {item.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.category && <FormHelperText>{fieldErrors.category}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" fullWidth error={!!fieldErrors.subCategory}>
                  <InputLabel>Sub Category</InputLabel>
                  <Select name="subCategory" value={formData.subCategory} onChange={handleInputChange} label="Sub Category">
                    {subCategoryList.map((item) => (
                      <MenuItem key={item.id} value={item.subCategoryName}>
                        {item.subCategoryName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.subCategory && <FormHelperText>{fieldErrors.subCategory}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" fullWidth error={!!fieldErrors.gstApplicable}>
                  <InputLabel>GST Applicable</InputLabel>
                  <Select name="gstApplicable" value={formData.gstApplicable} onChange={handleInputChange} label="GST Applicable">
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                  {fieldErrors.gstApplicable && <FormHelperText>{fieldErrors.gstApplicable}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField label="HSN" name="hsn" value={formData.hsn} onChange={handleInputChange} size="small" fullWidth />
              </div>
              <div className="col-md-3 mb-3">
                <FormControlLabel control={<Checkbox checked={formData.active} onChange={handleInputChange} name="active" />} label="Active" />
              </div>
            </div>
          </LocalizationProvider>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default PriceMaster;

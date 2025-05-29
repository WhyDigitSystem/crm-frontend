import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import CommonTable from 'views/basicMaster/CommonTable';

export const ARAPDetail = () => {
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [formData, setFormData] = useState({
    active: true,
    chargeType: '',
    chargeCode: '',
    product: '',
    chargeDescription: '',
    localChargeDescripition: '',
    serviceAccountCode: '',
    sACDescription: '',
    salesAccount: '',
    purchaseAccount: '',
    taxType: '',
    ccFeeApplicable: '',
    taxable: '',
    taxablePercentage: '',
    ccJob: '',
    govtSac: '',
    excempted: '',
    orgId: orgId,
    gstTax: '',
    gstControl: '',
    service: '',
    type: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    chargeType: '',
    chargeCode: '',
    product: '',
    chargeDescription: '',
    localChargeDescripition: '',
    serviceAccountCode: '',
    sacDescripition: '',
    salesAccount: '',
    purchaseAccount: '',
    taxable: '',
    taxType: '',
    taxablePercentage: '',
    ccFeeApplicable: '',
    ccJob: '',
    govtSac: '',
    excempted: '',
    gstTax: '',
    gstControl: '',
    service: '',
    type: ''
  });

  const validateForm = () => {
    let errors = {};
    let hasError = false;

    if (!formData.chargeType) {
      errors.chargeType = '* Field is required';
      hasError = true;
    }
    if (!formData.chargeCode) {
      errors.chargeCode = '* Field is required';
      hasError = true;
    }
    if (!formData.product) {
      errors.product = '* Field is required';
      hasError = true;
    }
    if (!formData.chargeDescription) {
      errors.chargeDescription = '* Field is required';
      hasError = true;
    }
    if (!formData.localChargeDescripition) {
      errors.localChargeDescripition = '* Field is required';
      hasError = true;
    }
    if (!formData.serviceAccountCode) {
      errors.serviceAccountCode = '* Field is required';
      hasError = true;
    }
    if (!formData.sacDescripition) {
      errors.sacDescripition = '* Field is required';
      hasError = true;
    }
    if (!formData.salesAccount) {
      errors.salesAccount = '* Field is required';
      hasError = true;
    }
    if (!formData.purchaseAccount) {
      errors.purchaseAccount = '* Field is required';
      hasError = true;
    }
    if (!formData.taxable) {
      errors.taxable = '* Field is required';
      hasError = true;
    }
    if (!formData.taxablePercentage) {
      errors.taxablePercentage = '* Field is required';
      hasError = true;
    }

    if (!formData.taxType) {
      errors.taxType = '* Field is required';
      hasError = true;
    }
    if (!formData.ccFeeApplicable) {
      errors.ccFeeApplicable = '* Field is required';
      hasError = true;
    }
    if (!formData.ccJob) {
      errors.ccJob = '* Field is required';
      hasError = true;
    }
    if (!formData.govtSac) {
      errors.govtSac = '* Field is required';
      hasError = true;
    }
    if (!formData.excempted) {
      errors.excempted = '* Field is required';
      hasError = true;
    }
    if (!formData.gstTax) {
      errors.gstTax = '* Field is required';
      hasError = true;
    }
    if (!formData.gstControl) {
      errors.gstControl = '* Field is required';
      hasError = true;
    }
    if (!formData.service) {
      errors.service = '* Field is required';
      hasError = true;
    }
    if (!formData.type) {
      errors.type = '* Field is required';
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };


  
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission with formData
    console.log(formData);
    // Example: Submit formData to backend or perform further actions
  };

  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);

  const theme = useTheme();
  const anchorRef = useRef(null);

  // useEffect(() => {
  //   getSetTaxRate();
  // }, []);

  const getSetTaxRate = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/master/getAllChargeTypeRequestByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === 200) {
        setData(response.data.paramObjectsMap.chargeTypeRequestVO);

        console.log('Test', response.data.paramObjectsMap.chargeTypeRequestVO);
      } else {
        // Handle error
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = () => {
    const formDataToSend = {
      ...formData,
      taxablePercentage: formData.taxablePercentage ? parseInt(formData.taxablePercentage, 10) : 0
    };

    if (validateForm()) {
      axios
        .put(`${process.env.REACT_APP_API_URL}/api/master/updateCreateChargeTypeRequest`, formDataToSend)
        .then((response) => {
          if (response.data.status) {
            console.log('Response:', response.data);
            handleClear();
            toast.success('Set Tax Rate Created Successfully', {
              autoClose: 2000,
              theme: 'colored'
            });
          } else {
            console.error('API Error:', response.data);
            toast.error('Error in creating/updating charge type request', {
              autoClose: 2000,
              theme: 'colored'
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while saving', {
            autoClose: 2000,
            theme: 'colored'
          });
        });
    } else {
      toast.error('Please fill in all required fields', {
        autoClose: 2000,
        theme: 'colored'
      });
    }
  };

  const handleRowEdit = (rowId, newData) => {
    console.log('Edit', rowId, newData);
    // Send PUT request to update the row
    axios
      .put(`${process.env.REACT_APP_API_URL}/api/master/updateCreateChargeTypeRequest/${rowId}`, newData)
      .then((response) => {
        console.log('Edit successful:', response.data);
        // Handle any further actions after successful edit
        toast.success('Set Tax Rate Updated Successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
      })
      .catch((error) => {
        console.error('Error editing row:', error);
        // Handle error scenarios
        toast.error('Failed to Update Set Tax Rate', {
          autoClose: 2000,
          theme: 'colored'
        });
      });
  };

  const getAllChargeTypeById = async (emitterId) => {
    console.log('first', emitterId);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/master/getAllChargeTypeRequestById?id=${emitterId.original.id}`
      );
      console.log('API Response:', response);

      if (response.status === 200) {
        const chargeTypeRequestVO = response.data.paramObjectsMap.chargeTypeRequestVO[0];
        setShowForm(true);

        setFormData({
          active: chargeTypeRequestVO.active,
          chargeType: chargeTypeRequestVO.chargeType || '',
          chargeCode: chargeTypeRequestVO.chargeCode || '',
          product: chargeTypeRequestVO.product || '',
          chargeDescription: chargeTypeRequestVO.chargeDescripition || '',
          localChargeDescripition: chargeTypeRequestVO.localChargeDescripition || '',
          serviceAccountCode: chargeTypeRequestVO.serviceAccountCode || '',
          sACDescription: chargeTypeRequestVO.sacDescripition || '',
          salesAccount: chargeTypeRequestVO.salesAccount || '',
          purchaseAccount: chargeTypeRequestVO.purchaseAccount || '',
          taxType: chargeTypeRequestVO.taxType || '',
          ccFeeApplicable: chargeTypeRequestVO.ccFeeApplicable || '',
          taxable: chargeTypeRequestVO.taxable || '',
          taxablePercentage: chargeTypeRequestVO.taxablePercentage || '',
          ccJob: chargeTypeRequestVO.ccJob || '',
          govtSac: chargeTypeRequestVO.govtSac || '',
          excempted: chargeTypeRequestVO.excempted || '',
          orgId: chargeTypeRequestVO.orgId || orgId,
          gstTax: chargeTypeRequestVO.gstTax || '',
          gstControl: chargeTypeRequestVO.gstControl || '',
          service: chargeTypeRequestVO.service || '',
          type: chargeTypeRequestVO.type || ''
        });

        console.log('DataToEdit', chargeTypeRequestVO);
      } else {
        // Handle error
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleList = () => {
    setShowForm(!showForm);
    // setFieldErrors({
    //   chapter: false,
    //   subChapter: false,
    //   hsnCode: false,
    //   branch: false,
    //   newRate: false,
    //   excepmted: false
    // });

    getSetTaxRate();
  };
  const handleClear = () => {
    setFormData({
      active: true,
      chargeType: '',
      chargeCode: '',
      product: '',
      chargeDescription: '',
      localChargeDescripition: '',
      serviceAccountCode: '',
      sACDescription: '',
      salesAccount: '',
      purchaseAccount: '',
      taxType: '',
      ccFeeApplicable: '',
      taxable: '',
      taxablePercentage: '',
      ccJob: '',
      govtSac: '',
      excempted: '',
      orgId: orgId,
      gstTax: '',
      gstControl: '',
      service: '',
      type: ''
    });

    setFieldErrors({
      chargeType: '',
      chargeCode: '',
      product: '',
      chargeDescription: '',
      localChargeDescripition: '',
      serviceAccountCode: '',
      sacDescripition: '',
      salesAccount: '',
      purchaseAccount: '',
      taxable: '',
      taxType: '',
      taxablePercentage: '',
      ccFeeApplicable: '',
      ccJob: '',
      govtSac: '',
      excempted: '',
      gstTax: '',
      gstControl: '',
      service: '',
      type: ''
    });
  };

  const columns = [
    { accessorKey: 'chargeType', header: 'Charge Type', size: 140 },
    { accessorKey: 'chargeCode', header: 'Charge Code', size: 140 },
    { accessorKey: 'product', header: 'Product', size: 140 },
    { accessorKey: 'chargeDescription', header: 'Charge Description', size: 140 },
    // { accessorKey: 'localChargeDescripition', header: 'Local Charge Description', size: 140 },
    // { accessorKey: 'serviceAccountCode', header: 'Service Account Code', size: 140 },
    // { accessorKey: 'sACDescription', header: 'SAC Description', size: 140 },
    // { accessorKey: 'salesAccount', header: 'Sales Account', size: 140 },
    // { accessorKey: 'purchaseAccount', header: 'Purchase Account', size: 140 },
    // { accessorKey: 'taxType', header: 'Tax Type', size: 140 },
    // { accessorKey: 'ccFeeApplicable', header: 'CC Fee Applicable', size: 140 },
    // { accessorKey: 'taxable', header: 'Taxable', size: 140 },
    // { accessorKey: 'taxablePercentage', header: 'Taxable Percentage', size: 140 },
    // { accessorKey: 'ccJob', header: 'CC Job', size: 140 },
    // { accessorKey: 'govtSac', header: 'Govt SAC', size: 140 },
    // { accessorKey: 'excempted', header: 'Exempted', size: 140 },
    { accessorKey: 'gSTTax', header: 'GST Tax', size: 140 },
    { accessorKey: 'gSTControl', header: 'GST Control', size: 140 },
    { accessorKey: 'service', header: 'Service', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} margin="0 10px 0 10px" />
          </div>

          {showForm ? (
            <div className="row d-flex ml">
              {/* Branch */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.branch}>
                  <InputLabel id="branch-select-label">Branch</InputLabel>
                  <Select
                    labelId="branch-select-label"
                    id="branch-select"
                    label="Branch"
                    required
                    value={formData.branch}
                    name="branch"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="branch1">Branch 1</MenuItem>
                    <MenuItem value="branch2">Branch 2</MenuItem>
                  </Select>
                  {fieldErrors.branch && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.branch}
                    </p>
                  )}
                </FormControl>
              </div>

              {/* FinYr */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="finyr"
                  label="FinYr"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="finyr"
                  value={formData.finyr}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.finyr}
                  helperText={fieldErrors.finyr}
                />
              </div>

              {/* Source TransID */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="sourceTransid"
                  label="Source TransID"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="sourceTransid"
                  value={formData.sourceTransid}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.sourceTransid}
                  helperText={fieldErrors.sourceTransid}
                />
              </div>

              {/* Doc ID */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="docId"
                  label="Doc ID"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="docId"
                  value={formData.docId}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.docId}
                  helperText={fieldErrors.docId}
                />
              </div>

              {/* Ref. No. */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="refNo"
                  label="Ref. No."
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.refNo}
                  helperText={fieldErrors.refNo}
                />
              </div>

              {/* Account Name */}
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small" error={!!fieldErrors.accountName}>
                  <InputLabel id="accountName-select-label">Account Name</InputLabel>
                  <Select
                    labelId="accountName-select-label"
                    id="accountName-select"
                    label="Account Name"
                    required
                    value={formData.accountName}
                    name="accountName"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="account1">Account 1</MenuItem>
                    <MenuItem value="account2">Account 2</MenuItem>
                  </Select>
                  {fieldErrors.accountName && (
                    <p className="error-text" style={{ color: 'red', fontSize: '12px', paddingLeft: '15px', paddingTop: '4px' }}>
                      {fieldErrors.accountName}
                    </p>
                  )}
                </FormControl>
              </div>

              {/* Currency */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="currency"
                  label="Currency"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.currency}
                  helperText={fieldErrors.currency}
                />
              </div>

              {/* Account Currency */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="accountCurrency"
                  label="Account Currency"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="accountCurrency"
                  value={formData.accountCurrency}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.accountCurrency}
                  helperText={fieldErrors.accountCurrency}
                />
              </div>

              {/* Ex. Rate */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="exRate"
                  label="Ex. Rate"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="exRate"
                  value={formData.exRate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.exRate}
                  helperText={fieldErrors.exRate}
                />
              </div>

              {/* Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="amount"
                  label="Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.amount}
                  helperText={fieldErrors.amount}
                />
              </div>

              {/* Base Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="baseAmount"
                  label="Base Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="baseAmount"
                  value={formData.baseAmount}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.baseAmount}
                  helperText={fieldErrors.baseAmount}
                />
              </div>

              {/* Native Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="nativeAmount"
                  label="Native Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="nativeAmount"
                  value={formData.nativeAmount}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.nativeAmount}
                  helperText={fieldErrors.nativeAmount}
                />
              </div>

              {/* Chargeable Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="chargeableAmount"
                  label="Chargeable Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="chargeableAmount"
                  value={formData.chargeableAmount}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.chargeableAmount}
                  helperText={fieldErrors.chargeableAmount}
                />
              </div>

              {/* GST Flag */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="gstFlag"
                  label="GST Flag"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="gstFlag"
                  value={formData.gstFlag}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.gstFlag}
                  helperText={fieldErrors.gstFlag}
                />
              </div>

              {/* Doc Type Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="docTypeCode"
                  label="Doc Type Code"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="docTypeCode"
                  value={formData.docTypeCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.docTypeCode}
                  helperText={fieldErrors.docTypeCode}
                />
              </div>

              {/* Sub Type Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="subTypeCode"
                  label="Sub Type Code"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="subTypeCode"
                  value={formData.subTypeCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.subTypeCode}
                  helperText={fieldErrors.subTypeCode}
                />
              </div>

              {/* Subledger Division */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="subledgerDivision"
                  label="Subledger Division"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="subledgerDivision"
                  value={formData.subledgerDivision}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.subledgerDivision}
                  helperText={fieldErrors.subledgerDivision}
                />
              </div>

              {/* Doc Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="docDate"
                  label="Doc Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="docDate"
                  value={formData.docDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.docDate}
                  helperText={fieldErrors.docDate}
                />
              </div>

              {/* Ref. Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="refDate"
                  label="Ref. Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="refDate"
                  value={formData.refDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.refDate}
                  helperText={fieldErrors.refDate}
                />
              </div>

              {/* Supp. Ref. No. */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="suppRefNo"
                  label="Supp. Ref. No."
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="suppRefNo"
                  value={formData.suppRefNo}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.suppRefNo}
                  helperText={fieldErrors.suppRefNo}
                />
              </div>

              {/* Supp. Ref. Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="suppRefDate"
                  label="Supp. Ref. Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="suppRefDate"
                  value={formData.suppRefDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.suppRefDate}
                  helperText={fieldErrors.suppRefDate}
                />
              </div>

              {/* Subledger Code */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="subledgerCode"
                  label="Subledger Code"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="subledgerCode"
                  value={formData.subledgerCode}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.subledgerCode}
                  helperText={fieldErrors.subledgerCode}
                />
              </div>

              {/* Credit Days */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="creditDays"
                  label="Credit Days"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="creditDays"
                  value={formData.creditDays}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.creditDays}
                  helperText={fieldErrors.creditDays}
                />
              </div>

              {/* Due Date */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="dueDate"
                  label="Due Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.dueDate}
                  helperText={fieldErrors.dueDate}
                />
              </div>

              {/* TDS Amount */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="tdsAmount"
                  label="TDS Amount"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="tdsAmount"
                  value={formData.tdsAmount}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.tdsAmount}
                  helperText={fieldErrors.tdsAmount}
                />
              </div>

              {/* HNO */}
              <div className="col-md-3 mb-3">
                <TextField
                  id="hno"
                  label="HNO"
                  placeholder="Placeholder"
                  variant="outlined"
                  size="small"
                  name="hno"
                  value={formData.hno}
                  onChange={handleInputChange}
                  className="w-100"
                  error={!!fieldErrors.hno}
                  helperText={fieldErrors.hno}
                />
              </div>
            </div>
          ) : (
            <CommonTable data={data} columns={columns} onRowEditTable={handleRowEdit} blockEdit={true} toEdit={getAllChargeTypeById} />
          )}
        </div>
      </div>
    </>
  );
};
export default ARAPDetail;

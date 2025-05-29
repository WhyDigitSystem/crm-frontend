import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveCurrency } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';

const ExRates = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));

  const [formData, setFormData] = useState({
    docDate: null,
    docMonth: null,
    currency: '',
    sellRate: '',
    buyRate: '',
    avgRate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currencyData = await getAllActiveCurrency(orgId);
        setCurrencies(currencyData);

        console.log('currency', currencyData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };

    fetchData();
    getExRates();
  }, []);

  const getExRates = async () => {
    try {
      const response = await apiCalls('get', `master/getAllExRatesByOrgId?orgId=${orgId}`);
      setData(response.paramObjectsMap.exRatesVO);
      console.log('exRatesVO', response.paramObjectsMap.exRatesVO);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleDateChange = (name, value) => {
    const formattedDate = value ? dayjs(value).format('YYYY-MM-DD') : null;

    setFormData({ ...formData, [name]: formattedDate });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  // const handleDateChange = (name, value) => {
  //   let formattedDate;

  //   if (name === 'docMonth') {
  //     formattedDate = dayjs(value).format('YYYY-MM');
  //   } else {
  //     formattedDate = dayjs(value).format('YYYY-MM-DD');
  //   }

  //   setFormData({ ...formData, [name]: formattedDate });
  //   setFieldErrors({ ...fieldErrors, [name]: false });
  // };

  const columns = [
    { accessorKey: 'docDate', header: 'Document Date', size: 140 },
    { accessorKey: 'docMonth', header: 'Document Month', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 100 },
    { accessorKey: 'sellRate', header: 'Sell Rate', size: 100 },
    { accessorKey: 'buyRate', header: 'Buy Rate', size: 100 },
    { accessorKey: 'avgRate', header: 'Avg Rate', size: 100 }
  ];

  const handleClear = () => {
    setFormData({
      docDate: null,
      docMonth: null,
      currency: '',
      sellRate: '',
      buyRate: '',
      avgRate: ''
    });
    setFieldErrors({});
  };

  const handleList = () => {
    setShowForm(!showForm);
    setFieldErrors({});
    getExRates();
  };

  const getExRateById = async (row) => {
    handleClear();
    setEditId(row.original.id);
    console.log('Editing Exchange Rate:', row.original.id);
    try {
      const response = await apiCalls('get', `master/getAllExRatesById?id=${row.original.id}`);

      if (response.status === true) {
        const exRate = response.paramObjectsMap.exRatesVO[0];
        setShowForm(true);
        setFormData({
          docDate: exRate.docDate ? dayjs(exRate.docDate) : null,
          docMonth: exRate.docMonth ? dayjs(exRate.docMonth) : null,
          currency: exRate.currency || '',
          sellRate: exRate.sellRate || '',
          buyRate: exRate.buyRate || '',
          id: exRate.id || 0,
          avgRate: exRate.avgRate || ''
        });

        console.log('DataToEdit', exRate);
      } else {
        console.error('API Error:', response.paramObjectsMap.errorMessage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validateForm = () => {
    let errors = {};
    let hasError = false;

    if (!formData.docDate) {
      errors.docDate = 'Document Date is required';
      hasError = true;
    }
    if (!formData.docMonth) {
      errors.docMonth = 'Document Month is required';
      hasError = true;
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
      hasError = true;
    }
    if (!formData.sellRate) {
      errors.sellRate = 'Sell Rate is required';
      hasError = true;
    }
    if (!formData.buyRate) {
      errors.buyRate = 'Buy Rate is required';
      hasError = true;
    }
    if (!formData.avgRate) {
      errors.avgRate = 'Average Rate is required';
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const formDataToSend = {
        ...(editId && { id: editId }),
        docDate: formData.docDate,
        docMonth: formData.docMonth,
        currency: formData.currency,
        sellRate: formData.sellRate,
        buyRate: formData.buyRate,
        avgRate: formData.avgRate,
        orgId: orgId,
        createdBy: loginUserName
        // active: formData.active
      };

      console.log('Saving Exchange Rate with payload:', formDataToSend);

      try {
        const response = await apiCalls('put', `master/updateCreateExRates`, formDataToSend);

        if (response.status === true || response.statusFlag === 'Ok') {
          handleClear();
          showToast('success', editId ? 'Exchange Rate Updated Successfully' : 'Exchange Rate Created successfully');
          getExRates();
        } else {
          console.error('API Error:', response);
          showToast('error', response.paramObjectsMap.errorMessage || 'Failed to Save Exchange Rate');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', error.response?.paramObjectsMap?.errorMessage || 'Failed to Save Exchange Rate');
      }
    } else {
      showToast('error', 'Please fill in all required fields');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-4">
          <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
          <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
          <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
        </div>
        <div className="row d-flex">
          {showForm ? (
            <>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Document Date"
                      value={formData.docDate ? dayjs(formData.docDate, 'YYYY-MM-DD') : null}
                      onChange={(date) => handleDateChange('docDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                  {fieldErrors.docDate && <p className="dateErrMsg">Document Date is required</p>}
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Document Month"
                      openTo="month"
                      views={['year', 'month']}
                      value={formData.docMonth ? dayjs(formData.docMonth, 'YYYY-MM-DD') : null}
                      onChange={(newValue) => handleDateChange('docMonth', newValue)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                    />
                  </LocalizationProvider>
                  {fieldErrors.docMonth && <p className="dateErrMsg">Document Month is required</p>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label">
                    {
                      <span>
                        Currency <span className="asterisk">*</span>
                      </span>
                    }
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Currency"
                    onChange={handleInputChange}
                    name="currency"
                    value={formData.currency}
                  >
                    {currencies.map((item) => (
                      <MenuItem key={item.id} value={item.currency}>
                        {item.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText style={{ color: 'red' }}>Currency is required</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label={
                      <span>
                        Sell Rate <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    name="sellRate"
                    value={formData.sellRate}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.sellRate}
                    helperText={fieldErrors.sellRate}
                  />
                  {/* {fieldErrors.sellRate && <span style={{ color: 'red' }}>Sell Rate is required</span>} */}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label={
                      <span>
                        Buy Rate <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    name="buyRate"
                    value={formData.buyRate}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.buyRate}
                    helperText={fieldErrors.buyRate}
                  />
                  {/* {fieldErrors.buyRate && <span style={{ color: 'red' }}>Buy Rate is required</span>} */}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    label={
                      <span>
                        Avg Rate <span className="asterisk">*</span>
                      </span>
                    }
                    size="small"
                    name="avgRate"
                    value={formData.avgRate}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 30 }}
                    error={!!fieldErrors.avgRate}
                    helperText={fieldErrors.avgRate}
                  />
                  {/* {fieldErrors.avgRate && <span style={{ color: 'red' }}>Avg Rate is required</span>} */}
                </FormControl>
              </div>
            </>
          ) : (
            <CommonTable columns={columns} data={data} blockEdit={true} toEdit={getExRateById} />
          )}
        </div>
      </div>
    </>
  );
};

export default ExRates;

import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  ButtonBase,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaxMaster = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    active: true,
    taxType: '',
    taxPercentage: 0,
    taxDescription: '',
    taxMaster2DTO: [
      {
        inputAccount: '',
        outputAccount: '',
        sgstRcmPayable: true
      }
    ]
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name.startsWith('taxMaster2DTO')) {
      const [fieldName, dtoIndex] = name.split('.');
      const updatedTaxMaster2DTO = [...formData.taxMaster2DTO];
      updatedTaxMaster2DTO[dtoIndex] = {
        ...updatedTaxMaster2DTO[dtoIndex],
        [fieldName]: value
      };

      setFormData({
        ...formData,
        taxMaster2DTO: updatedTaxMaster2DTO
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTabSelect = (index) => {
    setTabIndex(index);
  };

  const handleSave = () => {
    // Check if any field is empty
    const errors = Object.keys(formData).reduce((acc, key) => {
      if (!formData[key]) {
        acc[key] = true;
      }
      return acc;
    }, {});

    // Check nested fields in taxMaster2DTO
    const dtoErrors = formData.taxMaster2DTO.reduce((acc, dto, index) => {
      if (!dto.inputAccount || !dto.outputAccount || !dto.sgstRcmPayable) {
        acc[index] = true;
      }
      return acc;
    }, {});

    // If there are errors, set the corresponding fieldErrors state to true
    if (Object.keys(errors).length > 0 || Object.keys(dtoErrors).length > 0) {
      setFieldErrors({ ...errors, ...dtoErrors });
      return; // Prevent API call if there are errors
    }

    axios
      .put(`${process.env.REACT_APP_API_URL}/api/master/updateCreateTaxMaster`, formData)
      .then((response) => {
        console.log('Response:', response.data);
        toast.success('Tax Master Updated Successfully', {
          autoClose: 2000,
          theme: 'colored'
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Error updating Tax Master', {
          autoClose: 2000,
          theme: 'colored'
        });
      });
  };

  return (
    <>
      <ToastContainer />

      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="d-flex flex-wrap justify-content-start mb-2" style={{ marginBottom: '20px' }}>
          <Tooltip title="Search" placement="top">
            <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                aria-haspopup="true"
                color="inherit"
              >
                <SearchIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>

          <Tooltip title="Clear" placement="top">
            <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                aria-haspopup="true"
                color="inherit"
              >
                <ClearIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>

          <Tooltip title="List View" placement="top">
            <ButtonBase sx={{ borderRadius: '12px' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                aria-haspopup="true"
                color="inherit"
              >
                <FormatListBulletedTwoToneIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>

          <Tooltip title="Save" placement="top">
            <ButtonBase sx={{ borderRadius: '12px', marginLeft: '10px' }} onClick={handleSave}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                aria-haspopup="true"
                color="inherit"
              >
                <SaveIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>
        </div>

        <div className="row d-flex mt-3">
          <div className="col-md-3 mb-3">
            <FormControl fullWidth size="small">
              <InputLabel id="taxType-label">Tax Type</InputLabel>
              <Select
                labelId="taxType-label"
                id="taxType"
                name="taxType"
                value={formData.taxType}
                onChange={handleChange}
                label="Tax Type"
                error={fieldErrors.hasOwnProperty('taxType')}
              >
                <MenuItem value="SGST">SGST</MenuItem>
                <MenuItem value="Option1">Option1</MenuItem>
              </Select>
              {fieldErrors.hasOwnProperty('taxType') && <FormHelperText error={true}>This field is required</FormHelperText>}
            </FormControl>
          </div>

          <div className="col-md-3 mb-3">
            <TextField
              id="taxPercentage"
              label="Tax Percentage"
              variant="outlined"
              size="small"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.hasOwnProperty('taxPercentage')}
              helperText={fieldErrors.hasOwnProperty('taxPercentage') ? 'This field is required' : ''}
            />
          </div>

          <div className="col-md-3 mb-3">
            <TextField
              id="taxDescription"
              label="Tax Description"
              variant="outlined"
              size="small"
              name="taxDescription"
              value={formData.taxDescription}
              onChange={handleChange}
              fullWidth
              error={fieldErrors.hasOwnProperty('taxDescription')}
              helperText={fieldErrors.hasOwnProperty('taxDescription') ? 'This field is required' : ''}
            />
          </div>

          <div className="col-md-3 mb-3">
            <FormGroup>
              <FormControlLabel control={<Checkbox name="active" checked={formData.active} onChange={handleChange} />} label="Active" />
            </FormGroup>
          </div>
        </div>

        <Tabs selectedIndex={tabIndex} onSelect={handleTabSelect}>
          <TabList>
            <Tab>SGST</Tab>
          </TabList>

          <TabPanel>
            <div className="row d-flex mt-3">
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="inputAccount"
                    label="Input Account"
                    variant="outlined"
                    size="small"
                    name="taxMaster2DTO.0.inputAccount"
                    value={formData.taxMaster2DTO[0].inputAccount}
                    onChange={handleChange}
                    fullWidth
                    error={fieldErrors.hasOwnProperty('taxMaster2DTO.0.inputAccount')}
                    helperText={fieldErrors.hasOwnProperty('taxMaster2DTO.0.inputAccount') ? 'This field is required' : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="outputAccount"
                    label="Output Account"
                    variant="outlined"
                    size="small"
                    name="taxMaster2DTO.0.outputAccount"
                    value={formData.taxMaster2DTO[0].outputAccount}
                    onChange={handleChange}
                    fullWidth
                    error={fieldErrors.hasOwnProperty('taxMaster2DTO.0.outputAccount')}
                    helperText={fieldErrors.hasOwnProperty('taxMaster2DTO.0.outputAccount') ? 'This field is required' : ''}
                  />
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled">
                  <TextField
                    id="sgstRcmPayable"
                    label="SGST RCM Payable"
                    variant="outlined"
                    size="small"
                    name="taxMaster2DTO.0.sgstRcmPayable"
                    value={formData.taxMaster2DTO[0].sgstRcmPayable}
                    onChange={handleChange}
                    fullWidth
                    error={fieldErrors.hasOwnProperty('taxMaster2DTO.0.sgstRcmPayable')}
                    helperText={fieldErrors.hasOwnProperty('taxMaster2DTO.0.sgstRcmPayable') ? 'This field is required' : ''}
                  />
                </FormControl>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
};

export default TaxMaster;

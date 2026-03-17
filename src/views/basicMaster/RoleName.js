import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import { FormControlLabel, Checkbox, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import FullScreenLoader from 'utils/FullScreenLoader';
import AddIcon from '@mui/icons-material/Add';

const RoleName = () => {
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState(true);
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchcode'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [formData, setFormData] = useState({
    active: true,
    roleName: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    roleName: ''
  });

  const listViewColumns = [
    { accessorKey: 'roleName', header: 'Role', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllRoleByOrgId();
  }, []);

  const getAllRoleByOrgId = async () => {
    setLoading(true);
    try {
      const result = await apiCalls('get', `/master/getAllRoleNameByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.roleNameVO.reverse() || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('error', err);
    }
  };
  const getRoleById = async (row) => {
    setShowForm(true);
    setLoading(true);
    try {
      const result = await apiCalls('get', `/master/getRoleNameById?id=${row.original.id}`);

      const RoleVo = result?.paramObjectsMap?.roleNameVO;

      if (RoleVo) {
        setEditId(row.original.id);
        setFormData({
          roleName: RoleVo.roleName || '',
          active: RoleVo.active === 'Active' ? true : false
        });
      } else {
        console.error('Role not found in response:', result);
        // You can also show an error toast here
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let regex;

    switch (name) {
      case 'roleName':
        regex = /^[a-zA-Z\s]*$/; // only alphabets and space
        if (!regex.test(value)) return;
        break;

      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };
  const handleClear = () => {
    setFormData({
      active: true,
      roleName: ''
    });
    setFieldErrors({});
    setEditId('');
  };
  const handleView = () => {
    setShowForm(!showForm);
    handleClear();
  };

  const handleSave = async () => {
    setLoading(true);
    const errors = {};

    if (!formData.roleName.trim()) {
      errors.roleName = 'Role Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.roleName)) {
      errors.roleName = 'Role Name should contain only alphabets';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      const saveFormData = {
        ...(editId && { id: editId }),
        orgId: orgId,
        createdBy: loginUserName,
        roleName: formData.roleName,
        active: formData.active
      };
      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/master/createUpdateRoleName`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Role Updated Successfully' : 'Role Created successfully');
          getAllRoleByOrgId();
          handleClear();
          setLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Role creation failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        showToast('error', 'Role creation failed');
      }
    } else {
      setFieldErrors(errors);
      setLoading(false);
    }
  };
  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
  };
  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}
      <ToastComponent />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {!showForm && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
            {showForm && (
              <>
                <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
              </>
            )}
          </div>
          {showForm ? (
            <>
              <div className="row d-flex ml">
                <div className="col-md-3 mb-3">
                  <TextField
                    id="roleName"
                    label="Role Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleInputChange}
                    error={!!fieldErrors.roleName}
                    helperText={fieldErrors.roleName}
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
          ) : (
            <CommonListViewTable data={data} columns={listViewColumns} blockEdit={true} toEdit={getRoleById} />
          )}
        </div>
      </div>
    </>
  );
};
export default RoleName;

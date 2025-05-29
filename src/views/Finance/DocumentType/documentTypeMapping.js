import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';

export const DocumentTypeMappingMaster = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [finYrId, setFinYrId] = useState(null);
  const [branchCodeId, setBranchCodeId] = useState(null);
  const [branchNameGrid, setBranchNameGrid] = useState(null);
  const [finYearGrid, setFinYearGrid] = useState(null);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    branchName: '',
    finYr: ''
  });
  const [value, setValue] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({
    branchName: '',
    finYr: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'finYear', header: 'Fin Year', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [finYearList, setFinYearList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    getAllBranches();
    getAllFinYear();
    getAllDocumentTypeMapping();
  }, []);

  useEffect(() => {
    if (branchNameGrid && finYearGrid) {
      getAllFillGrid();
    }
  }, [branchNameGrid, finYearGrid]);

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };

  const getAllFinYear = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/getAllAciveFInYear?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setFinYearList(response.paramObjectsMap.financialYearVOs);
        console.log('fin', response.paramObjectsMap.financialYearVOs);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllDocumentTypeMapping = async () => {
    try {
      const response = await apiCalls('get', `/documentType/getAllDocumentTypeMapping?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.documentTypeMappingVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllFillGrid = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/documentType/getPendingDocumentTypeMapping?branch=${branchNameGrid}&branchCode=${branchCodeId}&finYear=${finYearGrid}&finYearIdentifier=${finYrId}&orgId=${orgId}`
      );

      console.log('API Response:', response);

      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.documentTypeMappingVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllDocumentTypeMappingById = async (row) => {
    setIsEditMode(true);
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/documentType/documentTypeMappingById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularUser = response.paramObjectsMap.documentTypeMappingVO;
        // const foundBranch1 = branchList.find((branch) => branch.branchCode === particularUser.branchAccessibleVO.branchcode);
        // console.log('THE FOUND BRANCH 1 IS:', foundBranch1);

        setFormData({
          branchName: particularUser.branch,
          finYr: particularUser.finYear,
          active: particularUser.active === 'Active' ? true : false
        });
        setFillGridData(
          particularUser.documentTypeMappingDetailsVO.map((role) => ({
            id: role.id,
            screenName: role.screenName,
            screenCode: role.screenCode,
            client: role.client,
            clientCode: role.clientCode,
            docCode: role.docCode,
            prefixField: role.prefixField
          }))
        );
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let errorMessage = '';

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === 'branchName') {
        const selectedBranch = branchList.find((branch) => branch.branch === value);
        if (selectedBranch) {
          console.log('Selected branchId:', selectedBranch.branchCode); // Log the finYrId value
          setBranchNameGrid(selectedBranch.branch);
          setBranchCodeId(selectedBranch.branchCode);
          setFormData((prevData) => ({
            ...prevData,
            branchName: selectedBranch.branch
            // branchCode: selectedBranch.branchCode
          }));
        }
      } else if (name === 'finYr') {
        const selectedFinYr = finYearList.find((fin) => fin.finYear === value);
        if (selectedFinYr) {
          console.log('Selected FinYrId:', selectedFinYr.finYearIdentifier); // Log the finYrId value
          setFinYearGrid(selectedFinYr.finYear);
          setFinYrId(selectedFinYr.finYearIdentifier);
          setFormData((prevData) => ({
            ...prevData,
            finYr: selectedFinYr.finYear
            // finYrId: selectedFinYr.finYearIdentifier
          }));
          // getAllFillGrid();
        }
      }
      const formattedValue = name === 'finYr' ? value : value.toUpperCase();

      setFormData((prevData) => ({ ...prevData, [name]: formattedValue }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleClear = () => {
    setFormData({
      branchName: '',
      finYr: '',
      active: true
    });
    setFillGridData([]);

    setFieldErrors({
      branchName: '',
      branchCode: ''
    });
    setEditId('');
    setIsEditMode(false);
  };

  const handleSave = async () => {
    console.log('handle save is working');

    const errors = {};
    if (!formData.branchName) {
      errors.branchName = 'Branch is required';
    }
    if (!formData.finYr) {
      errors.finYr = 'Fin Year is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const mappingVo = fillGridData.map((row) => ({
        screenName: row.screenName,
        screenCode: row.screenCode,
        client: row.client,
        clientCode: row.clientCode,
        branch: row.branch,
        branchCode: row.branchCode,
        finYear: row.finYear,
        finYearIdentifier: row.finYearIdentifier,
        docCode: row.docCode,
        prefixField: row.prefixField
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        branch: formData.branchName,
        branchCode: branchCodeId,
        finYear: formData.finYr,
        finYearIdentifier: finYrId,
        documentTypeMappingDetailsDTO: mappingVo,
        // active: formData.active,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/documentType/createDocumentTypeMapping`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'DocumentType Mapping Updated Successfully' : 'DocumentType Mapping created successfully');
          handleClear();
          getAllDocumentTypeMapping();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'DocumentType Mapping creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message);
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClose = () => {
    setFormData({
      branchName: '',
      branchCode: ''
    });
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getAllDocumentTypeMappingById} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.branchName}>
                  <InputLabel id="branchName-label">Branch Name</InputLabel>
                  <Select
                    labelId="branchName-label"
                    label="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    name="branchName"
                    disabled={isEditMode}
                  >
                    {branchList?.map((row) => (
                      <MenuItem key={row.id} value={row.branch}>
                        {row.branch}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.branchName && <FormHelperText>{fieldErrors.branchName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.finYr}>
                  <InputLabel id="finYr-label">Fin Year</InputLabel>
                  <Select
                    labelId="finYr-label"
                    label="finYr"
                    value={formData.finYr}
                    onChange={handleInputChange}
                    name="finYr"
                    disabled={isEditMode}
                  >
                    {finYearList?.map((row) => (
                      <MenuItem key={row.id} value={row.finYear}>
                        {row.finYear}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.finYr && <FormHelperText>{fieldErrors.finYr}</FormHelperText>}
                </FormControl>
              </div>
            </div>
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="Mapping Details" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      {/* <div className="mb-1">
                        <ActionButton title="Fill Grid" icon={GridOnIcon} onClick={getAllFillGrid} />
                      </div> */}

                      {/* <div className="row mt-2">
                        <div className="col-lg-12"> */}
                      <div className="table-responsive mt-3">
                        <table className="table table-bordered ">
                          <thead>
                            <tr style={{ backgroundColor: '#673AB7' }}>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                S.No
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                                Screen Name
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '250px' }}>
                                Screen Code
                              </th>
                              {/* <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                Client
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                Client Code
                              </th> */}
                              <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                Doc Code
                              </th>
                              <th className="px-2 py-2 text-white text-center" style={{ width: '200px' }}>
                                Prefix
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {fillGridData.length > 0 ? (
                              fillGridData.map((row, index) => (
                                <tr key={index}>
                                  <td className="text-center">
                                    <div className="pt-2">{index + 1}</div>
                                  </td>
                                  <td className="text-center">
                                    <div className="pt-2">{row.screenName}</div>
                                  </td>
                                  <td className="text-center">
                                    <div className="pt-2">{row.screenCode}</div>
                                  </td>
                                  {/* <td className="text-center">
                                    <div className="pt-2">{row.client}</div>
                                  </td>
                                  <td className="text-center">
                                    <div className="pt-2">{row.clientCode}</div>
                                  </td> */}
                                  <td className="text-center">
                                    <div className="pt-2">{row.docCode}</div>
                                  </td>
                                  <td className="text-center">
                                    <div className="pt-2">{row.prefixField}</div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="11" className="text-center">
                                  <strong>No Data Available</strong>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* </div>
                      </div> */}
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};
export default DocumentTypeMappingMaster;

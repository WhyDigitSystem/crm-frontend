import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import { Button, Typography, Box, TextField } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import apiCalls from 'apicall';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import GridOnIcon from '@mui/icons-material/GridOn';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const MultipleDocumentIdGeneration = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [finYrId, setFinYrId] = useState('');
  const [branchCodeId, setBranchCodeId] = useState('');
  // const [docCode, setDocCode] = useState('');
  const [branchNameGrid, setBranchNameGrid] = useState('');
  const [finYearGrid, setFinYearGrid] = useState('');
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [formData, setFormData] = useState({
    screenCode: '',
    screenName: '',
    docCode: '',
    branchName: '',
    finYr: ''
  });
  const [value, setValue] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({
    branchName: '',
    screenCode: '',
    screenName: '',
    docCode: '',
    finYr: ''
  });
  const [detailsTableData, setDetailsTableData] = useState([]);
  // const [detailsTableErrors, setDetailsTableErrors] = useState([
  //   {
  //     screenName:'',
  //     screenCode:'',
  //     documentCode:'',
  //     prefixField:''
  //   }
  // ]);
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'branch', header: 'Branch', size: 140 },
    { accessorKey: 'finYear', header: 'Fin Year', size: 140 },
    { accessorKey: 'screenName', header: 'Screen Name', size: 140 },
    { accessorKey: 'screenCode', header: 'Screen Code', size: 140 }
  ];
  const [screenList, setScreenList] = useState([]);
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
    getAllScreens();
    getAllMultipleDocumentIdByOrgId();
  }, []);

  const handleFullGrid = () => {
    setModalOpen(true);
    if (branchNameGrid && finYearGrid && formData.docCode) {
          getAllFillGrid();
        }
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(fillGridData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmitSelectedRows = async () => {
    const selectedData = selectedRows.map((index) => fillGridData[index]);
  
    const newData = selectedData.filter((data) => {
      return !detailsTableData.some(
        (item) =>
          item.screenName === data.screenName &&
          item.screenCode === data.screenCode &&
          item.docCode === data.docCode
      );
    });
  
    if (newData.length < selectedData.length) {
      showToast('warning', 'Some of the selected items are already added!');
    }
    if (newData.length === 0) {
      return; 
    }
    setDetailsTableData((prev) => [...prev, ...newData]);
    console.log('New Data added:', newData);
    setSelectedRows([]);
    setSelectAll(false);
    handleCloseModal(); 
  };
  
  const getAllScreens = async () => {
    try {
      const response = await apiCalls('get', `/commonmaster/getAllScreenNames`);
      console.log('All Screens :', response);

      if (response.status === true) {
        setScreenList(response.paramObjectsMap.screenNamesVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
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

  const getAllMultipleDocumentIdByOrgId = async () => {
    try {
      const response = await apiCalls('get', `/multipleDocIdGeneration/getMultipleDocIdGenerationByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.multipleDocIdGenerationVO);
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
        `/multipleDocIdGeneration/getPendingMultipleDocIdGeneration?branch=${branchNameGrid}&branchCode=${branchCodeId}&docCode=${formData.docCode}&finYear=${finYearGrid}&finYearIdentifier=${finYrId}&orgId=${orgId}`
        );

      console.log('API Response:', response);

      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.multipleDocIdGenerationVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllMultipleDocumentIdById = async (row) => {
    setIsEditMode(true);
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `/multipleDocIdGeneration/getMultipleDocIdGenerationById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularUser = response.paramObjectsMap.multipleDocIdGenerationVO;
        setFormData({
          branchName: particularUser.branch,
          finYr: particularUser.finYear,
          screenName: particularUser.screenName,
          screenCode: particularUser.screenCode,
          docCode: particularUser.docCode
        });
        setDetailsTableData(
          particularUser.multipleDocIdGenerationDetailsVO.map((role) => ({
            id: role.id,
            screenName: role.screenName,
            screenCode: role.screenCode,
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
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;

    switch (name) {
      case 'docCode':
        if (!alphaNumericRegex.test(value)) {
          errorMessage = 'Only alphanumeric characters are allowed';
        } else if (value.length > 10) {
          errorMessage = 'Invalid Format';
        }
        break;
    }

    if (errorMessage) {
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    } else {
      if (name === 'screenCode') {
        const selectedScreen = screenList.find((scr) => scr.screenCode === value);
        if (selectedScreen) {
          setFormData((prevData) => ({
            ...prevData,
            screenName: selectedScreen.screenName,
            screenCode: selectedScreen.screenCode
          }));
        }
      }
      if (name === 'branchName') {
        const selectedBranch = branchList.find((branch) => branch.branch === value);
        if (selectedBranch) {
          console.log('Selected branchId:', selectedBranch.branchCode);
          setBranchNameGrid(selectedBranch.branch);
          setBranchCodeId(selectedBranch.branchCode);
          setFormData((prevData) => ({
            ...prevData,
            branchName: selectedBranch.branch,
            branchCode: selectedBranch.branchCode
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
            finYr: selectedFinYr.finYear,
            finYrId: selectedFinYr.finYearIdentifier
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
      screenCode: '',
      screenName: '',
      docCode: '',
      branchName: '',
      finYr: '',
      active: true
    });
    setFillGridData([]);

    setFieldErrors({
      screenCode: '',
      screenName: '',
      docCode: '',
      branchName: '',
      branchCode: ''
    });
    setDetailsTableData([])
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
    if (!formData.docCode) {
      errors.docCode = 'Doc Code is required';
    }
    if (!formData.screenCode) {
      errors.screenCode = 'Screen Code is required';
    }
    if (!formData.screenName) {
      errors.screenName = 'Screen Name is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const mappingVo = detailsTableData.map((row) => ({
        screenName: row.screenName,
        screenCode: row.screenCode,
        // client: row.client,
        // clientCode: row.clientCode,
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
        docCode: formData.docCode,
        screenCode: formData.screenCode,
        screenName: formData.screenName,
        finYearIdentifier: finYrId,
        multipleDocIdGenerationDetailsDTO: mappingVo,
        orgId: orgId,
        createdBy: loginUserName
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `/multipleDocIdGeneration/createUpdateMultipleDocIdGeneration`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast(
            'success',
            editId ? 'Multiple Document Id Generation Updated Successfully' : 'Multiple Document Id Generation created successfully'
          );
          handleClear();
          getAllMultipleDocumentIdByOrgId();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Multiple Document Id Generation creation failed');
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

  //   const handleClose = () => {
  //     setFormData({
  //       branchName: '',
  //       branchCode: ''
  //     });
  //   };

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
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getAllMultipleDocumentIdById} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.screenCode}>
                  <InputLabel id="screenCode-label">Screen Code</InputLabel>
                  <Select
                    labelId="screenCode-label"
                    label="screenCode"
                    value={formData.screenCode}
                    onChange={handleInputChange}
                    name="screenCode"
                  >
                    {screenList?.map((row) => (
                      <MenuItem key={row.id} value={row.screenCode}>
                        {row.screenCode}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.screenCode && <FormHelperText>{fieldErrors.screenCode}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Screen Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="screenName"
                  value={formData.screenName}
                  onChange={handleInputChange}
                  error={!!fieldErrors.screenName}
                  helperText={fieldErrors.screenName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Doc Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="docCode"
                  value={formData.docCode}
                  onChange={handleInputChange}
                  error={!!fieldErrors.docCode}
                  helperText={fieldErrors.docCode}
                />
              </div>
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
                      <div className="mb-1">
                        <ActionButton title="Fill Grid" icon={GridOnIcon} onClick={handleFullGrid} />
                      </div>

                      <div className="row mt-2">
                        <div className="col-lg-12">
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
                                {detailsTableData.length > 0 ? (
                                  detailsTableData.map((row, index) => (
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
                        </div>
                      </div>
                    </div>
                    <Dialog
                      open={modalOpen}
                      maxWidth={'md'}
                      fullWidth={true}
                      onClose={handleCloseModal}
                      PaperComponent={PaperComponent}
                      aria-labelledby="draggable-dialog-title"
                    >
                      <DialogTitle textAlign="center" style={{ cursor: 'move' }} id="draggable-dialog-title">
                        <h6>Grid Details</h6>
                      </DialogTitle>
                      <DialogContent className="pb-0">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="table-responsive">
                              <table className="table table-bordered">
                                <thead>
                                  <tr style={{ backgroundColor: '#673AB7' }}>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      <Checkbox checked={selectAll} onChange={handleSelectAll} />
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                      S.No
                                    </th>
                                    <th className="table-header">Screen Name</th>
                                    <th className="table-header">Screen Code</th>
                                    <th className="table-header">Document Code</th>
                                    <th className="table-header">Prefix</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {fillGridData?.map((row, index) => (
                                    <tr key={row.id}>
                                      <td className="border p-0 text-center">
                                        <Checkbox
                                          checked={selectedRows.includes(index)}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setSelectedRows((prev) => (isChecked ? [...prev, index] : prev.filter((i) => i !== index)));
                                          }}
                                        />
                                      </td>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                        {row.screenName || ''}
                                      </td>
                                      <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                        {row.screenCode || ''}
                                      </td>
                                      <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                        {row.docCode || ''}
                                      </td>
                                      <td className="border px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                                        {row.prefixField || ''}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                      <DialogActions sx={{ p: '1.25rem' }} className="pt-0">
                        <Button onClick={handleCloseModal} sx={{ color: '#673AB7' }}>
                          Cancel
                        </Button>
                        <Button
                          color="secondary"
                          onClick={handleSubmitSelectedRows}
                          variant="contained"
                          sx={{ backgroundColor: '#673AB7' }}
                        >
                          Proceed
                        </Button>
                      </DialogActions>
                    </Dialog>
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

export default MultipleDocumentIdGeneration;

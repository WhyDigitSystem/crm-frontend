import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormControl, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
import FullScreenLoader from 'utils/FullScreenLoader';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
function LeadJourney() {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [formData, setFormData] = useState({
    clientName: 'All'
  });
  const [fieldErrors, setFieldErrors] = useState({
    clientName: ''
  });
  const handleClear = () => {
    setListView(false);
    setFormData({
      clientName: 'All'
    });
    setFieldErrors({
      clientName: ''
    });
    setRowData([]);
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };
  useEffect(() => {
    getClientName();
    getCompanyDetails();
  }, []);
  const reportColumns = [
    { accessorKey: 'docDate', header: 'Date', size: 100 },
    { accessorKey: 'clientName', header: 'Dealer', size: 100 },
    { accessorKey: 'dealerType', header: 'Dealer Type', size: 100 },
    { accessorKey: 'manger', header: 'Manager', size: 100 },
    { accessorKey: 'contactPerson', header: 'Contact Person', size: 100 },
    { accessorKey: 'mobileNumber', header: 'Mobile No', size: 100 },
    { accessorKey: 'palce', header: 'Palce', size: 100 },
    { accessorKey: 'address', header: 'Address', size: 100 },
    { accessorKey: 'gst', header: 'Reg No', size: 100 },
    { accessorKey: 'dateOfBirth', header: 'DOB', size: 100 }
  ];

  const handleGo = async () => {
    const errors = {};
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setListView(false);
      try {
        let response = await apiCalls('get', `/transaction/getAllClientNameBasedHistory?clientName=${formData.clientName}&orgId=${orgId}`);
        if (response.status === true) {
          console.log('Response:', response);
          setRowData(response.paramObjectsMap.clientInformation || []);
          setIsLoading(false);
          setListView(true);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Report Fetch failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Report Fetch failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      console.log('API Response:', response);
      setListViewData(response.paramObjectsMap.companyVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getClientName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getClientNameFromLeadScreen?orgId=${orgId}`);
      setClientNameList(response.paramObjectsMap.clientName);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  // Utility function to group by headers
  const groupByHeader = (data) => {
    let grouped = [];
    let currentGroup = null;

    data.forEach((item) => {
      if (!item.createdon) {
        // Treat this as a new section header
        currentGroup = { header: item.particulurs, children: [] };
        grouped.push(currentGroup);
      } else if (currentGroup) {
        // Attach to last section
        currentGroup.children.push(item);
      }
    });
    return grouped;
  };
  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        {/* Header */}
        {/* <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Lead Journey</h2>
          <p className="text-sm text-gray-500">Track the complete history of client activities and transitions</p>
        </div> */}

        <div className="row">
          <div className="col-md-3 mb-3">
            <Autocomplete
              options={['All', ...clientNameList.map((row) => row.clientName)]}
              value={formData.clientName || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  setFormData((prev) => ({ ...prev, clientName: newValue }));
                  setFieldErrors((prev) => ({ ...prev, clientName: '' }));
                } else {
                  setFormData((prev) => ({ ...prev, clientName: '' }));
                  setFieldErrors((prev) => ({ ...prev, clientName: 'Client Name is required' }));
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Client Name <span className="asterisk">*</span>
                    </span>
                  }
                  size="small"
                  error={!!fieldErrors.clientName}
                  helperText={fieldErrors.clientName}
                  fullWidth
                />
              )}
            />
          </div>
          <div className="row d-flex ml">
            <div className="d-flex flex-wrap justify-content-start mb-4 mt-1" style={{ marginBottom: '20px' }}>
              <ActionButton title="Search" icon={SearchIcon} onClick={handleGo} isLoading={isLoading} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            </div>
          </div>
        </div>
        <Dialog
          open={listView}
          onClose={() => setListView(false)}
          fullWidth
          maxWidth="lg"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          PaperProps={{ sx: { p: 0, m: 0, borderRadius: 2 } }}
        >
          <DialogTitle
            style={{
              cursor: 'move',
              background: '#0f0f1a',
              color: 'white',
              fontWeight: '600'
            }}
            id="draggable-dialog-title"
          >
            Lead Journey Report
            <IconButton onClick={() => setListView(false)} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Box sx={{ p: 3, backgroundColor: '#f9fafb' }}>
            {rowData.length > 0 ? (
              groupByHeader(rowData).map((section, sectionIndex) => (
                <Box key={sectionIndex} sx={{ mb: 5 }}>
                  {/* Section Header */}
                  <Typography variant="h6" fontWeight={700} mb={2} color="primary">
                    {section.header}
                  </Typography>

                  {/* Child Items */}
                  <Box sx={{ position: 'relative', ml: 4 }}>
                    {section.children.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                        {/* Timeline Dot */}
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: index === 0 ? '#4f46e5' : '#10b981',
                            border: '2px solid white',
                            zIndex: 1,
                            mt: '6px',
                            mr: 2,
                            boxShadow: '0 0 0 2px #e5e7eb'
                          }}
                        />

                        {/* Connector Line */}
                        {index !== section.children.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 6,
                              top: 20,
                              bottom: 0,
                              width: 2,
                              backgroundColor: '#d1d5db'
                            }}
                          />
                        )}

                        {/* Timeline Card */}
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            p: 2,
                            borderRadius: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            flex: 1
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.particulurs}
                          </Typography>
                          {item.createdon && (
                            <Typography variant="caption" color="text.disabled">
                              {dayjs(item.createdon).format('DD-MM-YYYY , HH:mm:ss')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No data found
              </Typography>
            )}
          </Box>
        </Dialog>
      </div>
    </>
  );
}
export default LeadJourney;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

const BulkEmail = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [formData, setFormData] = useState({ bccEmail: '' });
  const [formDataErrors, setFormDataErrors] = useState({});

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchText, setSearchText] = useState('');

  const allSelected = selected.length === rows.length && rows.length > 0;
  const someSelected = selected.length > 0 && !allSelected;

  const getAllData = async () => {
    try {
      const res = await apiCalls('get', '/mail');
      const rowsWithId = (Array.isArray(res) ? res : []).map((row, idx) => ({
        ...row,
        id: row.id ?? `row-${idx}`
      }));
      setRows(rowsWithId);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRows([]);
      showToast('error', 'Error fetching mail data');
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((rowId) => rowId !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const filteredRows = rows.filter(
    (row) =>
      row.employeeCode?.toLowerCase().includes(searchText.toLowerCase()) || row.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'bccEmail') {
      if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(value)) {
        setFormDataErrors({
          ...formDataErrors,
          bccEmail: 'Invalid Gmail format'
        });
      } else {
        setFormDataErrors({
          ...formDataErrors,
          bccEmail: ''
        });
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const getPDF = (pdfFileName) => {
    if (!pdfFileName) {
      showToast('error', 'PDF filename is missing');
      return;
    }
    window.open(`${API_URL}/api/mail/download/${pdfFileName}`, '_blank');
  };

  const getView = async (filename) => {
    if (!filename) {
      showToast('error', 'Filename missing for preview');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/mail/content/${filename}`);
      setPreviewContent(response.data);
      setPreviewFile(filename);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      showToast('error', 'Failed to load document content');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    const selectedEmployeeCodes = rows.filter((row) => selected.includes(row.id)).map((row) => row.employeeCode);

    if (selectedEmployeeCodes.length === 0) {
      showToast('warning', 'Please select at least one employee');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/mail/send-emails`, {
        bccAddress: formData.bccEmail,
        employeeCodes: selectedEmployeeCodes
      });
      showToast('success', 'Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('error', 'Failed to send email');
    } finally {
      setLoading(false);
      setSelected([]);
      setFormData({ bccEmail: '' });
      setSearchText('');
      getAllData();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
        <div className="row d-flex">
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled">
              <TextField
                placeholder="Employee code or Email"
                size="small"
                value={searchText}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControl fullWidth variant="filled">
              <TextField
                id="bccEmail"
                label="BCC Email Address"
                size="small"
                name="bccEmail"
                placeholder="user@gmail.com"
                value={formData.bccEmail}
                onChange={handleInputChange}
                error={!!formDataErrors.bccEmail}
                helperText={formDataErrors.bccEmail}
              />
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <Button variant="contained" color="primary" onClick={handleSendEmail}>
              Send<span>{selected.length > 0 ? `(${selected.length})` : ''}</span>
            </Button>
          </div>
        </div>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          <Table>
            <TableHead stickyHeader>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox indeterminate={someSelected} checked={allSelected} onChange={handleSelectAll} sx={{ color: 'white' }} />
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', padding: '10px' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', padding: '10px' }}>Emp Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', padding: '10px' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', padding: '10px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.includes(row.id)} onChange={() => handleSelectOne(row.id)} />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.employeeCode}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          sx={{
                            '&:hover': { backgroundColor: 'black' },
                            color: '#673AB7',
                            fontSize: 25,
                            '&:hover': { color: 'black' },
                            transform: 'scale(1.2)',
                            transition: 'transform 0.2s ease-in-out'
                          }}
                          onClick={() => getView(row.textFileName)}
                        >
                          <RemoveRedEyeOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF" arrow>
                        <IconButton
                          sx={{
                            '&:hover': { backgroundColor: 'black' },
                            color: '#673AB7',
                            fontSize: 25,
                            '&:hover': { color: 'black' },
                            transform: 'scale(1.2)',
                            transition: 'transform 0.2s ease-in-out'
                          }}
                          onClick={() => getPDF(row.pdfFileName)}
                        >
                          <PictureAsPdfOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isModalVisible} onClose={() => setIsModalVisible(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#673AB7', color: 'white', fontSize: '20px', padding: '10px' }}>
            Preview
          </DialogTitle>
          <DialogContent dividers style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 400, overflowY: 'auto' }}>
            {loading ? 'Loading...' : previewContent || 'No content to display'}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              width: '100%'
            }}
          >
            <CircularProgress size={40} />
          </div>
        )}
      </div>
    </>
  );
};

export default BulkEmail;

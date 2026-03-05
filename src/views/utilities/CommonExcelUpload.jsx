import React, { useState } from 'react';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, CircularProgress } from '@mui/material';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { showToast } from 'utils/toast-component';
import { ToastContainer } from 'react-toastify';

const CommonExcelUpload = ({
  open,
  handleClose,
  dialogTitle = 'Excel Upload',
  uploadText = 'Upload File',
  downloadText = 'Download Sample',
  onSubmit,
  sampleFileDownload,
  maxFileSizeMB = 5
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Only Excel files are allowed (.xls, .xlsx)');
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      showToast('error', `File size must be less than ${maxFileSizeMB} MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select a file');
      return;
    }

    try {
      setLoading(true);

      if (onSubmit) {
        await onSubmit(selectedFile);
      }

    //   showToast('success', 'File uploaded successfully');
      setSelectedFile(null);
      handleClose();
    } catch (error) {
      showToast('error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }}
      >
        {/* 🔹 Header */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1.5,
            py: 1,
            fontWeight: 600,
            fontSize: '12px'
          }}
        >
          {dialogTitle}

          <IconButton
            onClick={handleClose}
            sx={{
              color: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ff4d4f' 
              }
            }}
          >
            <IoMdClose size={16} />
          </IconButton>
        </DialogTitle>

        {/* 🔹 Content */}
        <DialogContent sx={{ py: 3, mt: 2 }}>
          <Typography align="center" mb={1} fontSize="0.95rem">
            Choose Excel file to upload
          </Typography>

          {/* Upload Button */}
          <Box display="flex" justifyContent="center" mb={1}>
            <Button
              component="label"
              variant="contained"
              startIcon={<FaCloudUploadAlt />}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 0.5,
                color: '#fff',
                background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16325c, #1f3f7a)'
                }
              }}
            >
              {uploadText}
              <input type="file" hidden accept=".xls,.xlsx" onChange={handleFileChange} />
            </Button>
          </Box>

          {/* Selected File */}
          {selectedFile && (
            <Typography align="center" fontSize="0.85rem">
              {selectedFile.name}
              <Button size="small" onClick={handleCancelFile} sx={{ textTransform: 'none', ml: 1 }}>
                Remove
              </Button>
            </Typography>
          )}

          {/* Sample Download */}
          {sampleFileDownload && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                size="small"
                component="a"
                href={sampleFileDownload}
                startIcon={<FiDownload />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 0.7,
                  fontWeight: 500,
                  color: '#1e3c72',
                  background: 'transparent',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(135deg, #1e3c72, #2a5298)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  transition: 'all 0.3s ease',

                  '&:hover': {
                    backgroundColor: 'rgba(30,60,114,0.08)'
                  }
                }}
              >
                {downloadText}
              </Button>
            </Box>
          )}
        </DialogContent>

        
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              border: '1px solid #cbd5e1',
              color: '#475569',
              backgroundColor: '#f8fafc',
              '&:hover': {
                backgroundColor: '#e2e8f0'
              }
            }}
          >
            Cancel
          </Button>

      
          <Button
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              color: '#fff',
              background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
              boxShadow: '0 4px 12px rgba(30,60,114,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #16325c, #1f3f7a)',
                boxShadow: '0 6px 16px rgba(30,60,114,0.4)'
              },
              '&:disabled': {
                background: '#94a3b8',
                color: '#fff'
              }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommonExcelUpload;

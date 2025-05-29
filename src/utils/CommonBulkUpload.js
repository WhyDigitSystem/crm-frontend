import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Slide, Typography } from '@mui/material';
import apiCalls from 'apicall';
import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { showToast } from './toast-component';

const VisuallyHiddenInput = ({ ...props }) => <input type="file" style={{ display: 'none' }} {...props} />;

const CommonBulkUpload = ({
  open,
  handleClose,
  dialogTitle,
  uploadText,
  downloadText,
  onSubmit,
  sampleFileDownload,
  handleFileUpload,
  onOpenClick,
  apiUrl,
  screen
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successfulUploads, setSuccessfulUploads] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    handleFileUpload(event);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setSuccessMessage('');
    setSuccessfulUploads(0);
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('files', selectedFile);
      try {
        const headers = {
          'Content-Type': 'multipart/form-data'
        };
        const response = await apiCalls('post', `${apiUrl}`, formData, {}, headers);
        if (response.status === true) {
          console.log('File uploaded successfully:', response);
          const message = response.paramObjectsMap.paramObjectsMap.message;
          const successfulUploads = response.paramObjectsMap.successfulUploads;
          setSuccessMessage(message);
          setSuccessfulUploads(successfulUploads);
          setSuccessDialogOpen(true);
          setSelectedFile(null);
          showToast('success', message);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || `${screen} Bulk Uploaded failed`);
          // showToast('error', response.paramObjectsMap.errorMessage || 'Buyer Order Bulk Uploaded failed');
          setErrorMessage(response.paramObjectsMap.errorMessage);
          setErrorDialogOpen(true);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', ' failed');
        setErrorMessage(errorMessage);
        setErrorDialogOpen(true);
      }

      handleClose();
      onSubmit();
    }
  };

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  return (
    <>
      <Dialog fullWidth={true} maxWidth="xs" open={open} onClose={handleClose}>
        <div className="d-flex justify-content-between align-items-center p-1">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <IconButton onClick={handleClose} color="secondary">
            <IoMdClose style={{ fontSize: '1.5rem' }} />
          </IconButton>
        </div>
        <DialogContent>
          <DialogContentText className="text-center mb-2">Choose a file to upload</DialogContentText>
          <div className="d-flex justify-content-center mb-2">
            <Button
              component="label"
              variant="contained"
              color="secondary"
              startIcon={<FaCloudUploadAlt />}
              style={{ textTransform: 'none', padding: '6px 12px' }}
            >
              {uploadText}
              <VisuallyHiddenInput onChange={handleFileChange} />
            </Button>
          </div>
          {selectedFile && (
            <div className="text-center mb-2" style={{ fontSize: '0.875rem' }}>
              Selected file: {selectedFile.name}
              <Button
                size="small"
                onClick={handleCancelFile}
                variant="text"
                color="secondary"
                style={{
                  marginLeft: '10px',
                  textTransform: 'none',
                  padding: '2px 4px'
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          {/* <div className="d-flex justify-content-center mb-2">
            <Button
              size="small"
              component="a"
              href={sampleFileDownload}
              variant="outlined"
              color="secondary"
              startIcon={<FiDownload />}
              style={{ textTransform: 'none', padding: '4px 8px' }}
            >
              {downloadText}
            </Button>
          </div> */}
          <div className="d-flex justify-content-center mb-2">
            <Button
              size="small"
              component="a"
              href={sampleFileDownload}
              variant="outlined"
              color="secondary"
              startIcon={<FiDownload />}
              style={{
                textTransform: 'none',
                padding: '4px 8px',
                color: '#9CA4AF'
              }}
            >
              {downloadText}
            </Button>
          </div>
        </DialogContent>
        <DialogActions className="d-flex justify-content-between p-2">
          <Button onClick={handleClose} color="secondary" style={{ textTransform: 'none', padding: '4px 8px' }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="secondary" variant="contained" style={{ textTransform: 'none', padding: '4px 8px' }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={errorDialogOpen}
        onClose={handleErrorDialogClose}
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '10px',
            borderRadius: '10px'
          }
        }}
      >
        <DialogTitle style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://cdn-icons-png.flaticon.com/128/753/753345.png"
            width={30}
            height={30}
            alt="Error Icon"
            style={{ marginRight: '10px' }}
          />
          <Typography variant="h6" component="span" style={{ flexGrow: 1 }}>
            Upload Failed
          </Typography>
          <IconButton onClick={handleErrorDialogClose} style={{ color: 'grey' }}>
            <IoMdClose style={{ fontSize: '1.5rem' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage.split(', ').map((msg, index) => (
              <Typography key={index} variant="body2" style={{ marginBottom: '5px' }}>
                {msg}
              </Typography>
            ))}
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '10px',
            borderRadius: '10px'
          }
        }}
      >
        <DialogTitle style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://cdn-icons-png.flaticon.com/128/14090/14090371.png"
            height={40}
            width={40}
            alt="Success Icon"
            style={{ marginRight: '10px' }}
          />
          <Typography variant="h6" component="span" style={{ flexGrow: 1 }}>
            Upload Successful
          </Typography>
          <IconButton onClick={handleSuccessDialogClose} style={{ color: '#4caf50' }}>
            <IoMdClose style={{ fontSize: '1.5rem' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body2">Successful Uploads: {successfulUploads}</Typography>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommonBulkUpload;

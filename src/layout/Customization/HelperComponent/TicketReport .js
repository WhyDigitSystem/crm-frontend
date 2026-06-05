import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';

import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  ConfirmationNumber as TicketIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

import apiCalls from 'apicall';

const TicketReport = () => {
  const orgId = localStorage.getItem('orgId');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const reportRef = useRef();

  const getTicketReport = async () => {
    try {
      setLoading(true);

      const response = await apiCalls('get', `ticketcontroller/getTicketReport?orgId=${orgId}`);

      if (response?.status) {
        setReports(response.paramObjectsMap?.ticketVO || []);
      }
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTicketReport();
  }, []);

  const totalTickets = reports.length;

  const openTickets = reports.filter((t) => t.status?.toLowerCase() === 'open').length;

  const closedTickets = reports.filter((t) => t.status?.toLowerCase() === 'closed').length;

  const inProgressTickets = reports.filter(
    (t) => t.status?.toLowerCase() === 'inprogress' || t.status?.toLowerCase() === 'in progress'
  ).length;

  const getStatusChip = (status) => {
    const colors = {
      Open: 'warning',
      Closed: 'success',
      InProgress: 'info'
    };

    return <Chip label={status} color={colors[status] || 'default'} size="small" variant="outlined" />;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Ticket Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Subject', 'Description', 'User', 'Status', 'Created On']],
      body: reports.map((item) => [item.id, item.subject, item.description, item.userName, item.status, item.commonDate?.createdon]),
      theme: 'grid',
      headStyles: {
        fillColor: [58, 107, 109]
      }
    });

    doc.save('Ticket_Report.pdf');
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}

      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #6a11cb, #2575fc)',
          color: '#fff'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              Ticket Reports
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Analyze and view ticket performance reports
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{
              bgcolor: '#fff',
              color: '#2a4b4d',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* TABLE */}

      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: '#f5f7fa'
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created On</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>

                    <TableCell>{row.subject}</TableCell>

                    <TableCell>{row.description}</TableCell>

                    <TableCell>{row.userName}</TableCell>

                    <TableCell>{getStatusChip(row.status)}</TableCell>

                    <TableCell>{dayjs(row.commonDate?.createdon, 'DD-MM-YYYY hh:mm:ss A').format('DD MMM YYYY')}</TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          if (row.screenShot) {
                            setPreviewImage(
                              row.screenShot.startsWith('data:') ? row.screenShot : `data:image/png;base64,${row.screenShot}`
                            );
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DETAILS DIALOG */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>

        <DialogContent dividers>
          {selectedTicket && (
            <Stack spacing={2}>
              <Typography>
                <b>ID:</b> {selectedTicket.id}
              </Typography>
              <Typography>
                <b>Subject:</b> {selectedTicket.subject}
              </Typography>
              <Typography>
                <b>Description:</b> {selectedTicket.description}
              </Typography>
              <Typography>
                <b>User:</b> {selectedTicket.userName}
              </Typography>
              <Typography>
                <b>Email:</b> {selectedTicket.email}
              </Typography>
              <Typography>
                <b>Status:</b> {selectedTicket.status}
              </Typography>
              <Typography>
                <b>Created:</b> {selectedTicket.commonDate?.createdon}
              </Typography>
              <Typography>
                <b>Modified:</b> {selectedTicket.commonDate?.modifiedon}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="sm">
        <DialogTitle sx={{ py: 1.5 }}>Screenshot Preview</DialogTitle>

        <DialogContent
          dividers
          sx={{
            textAlign: 'center',
            p: 2
          }}
        >
          <img
            src={previewImage}
            alt="Screenshot"
            style={{
              maxWidth: '400px',
              maxHeight: '300px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketReport;

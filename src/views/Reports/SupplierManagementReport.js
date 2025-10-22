import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormControl } from '@mui/material';
import { Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import CommonReportTable from 'utils/CommonReportTable';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import FullScreenLoader from 'utils/FullScreenLoader';
import SupplierManagement from 'views/Transaction/SupplierManagement';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
function SupplierManagementReport() {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branch] = useState(localStorage.getItem('branch'));
  const [isLoading, setIsLoading] = useState(false);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [compNameList, setCompName] = useState([]);
  const [selectedSections, setSelectedSections] = useState({
    date: false,
    companyName: false
  });
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedSections((prevState) => ({
      ...prevState,
      [name]: checked
    }));
  };

  const [formData, setFormData] = useState({
    fromDate: null,
    toDate: null,
    companyName: 'All'
  });
  const [fieldErrors, setFieldErrors] = useState({
    fromDate: '',
    toDate: '',
    companyName: ''
  });
  const handleClear = () => {
    setListView(false);
    setFormData({
      fromDate: null,
      toDate: null,
      companyName: 'All'
    });
    setFieldErrors({
      fromDate: '',
      toDate: '',
      companyName: ''
    });
    setRowData([]);
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };
  useEffect(() => {
    getCompanyDetails();
    getCompName();
  }, []);
  const getCompName = async () => {
    try {
      const response = await apiCalls('get', `/inventoryitem/getCompanyName?orgId=${orgId}`);
      if (response.status === true) {
        setCompName(response.paramObjectsMap.companyNameDetails || []);
      } else {
        console.error('API Error:', response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return error;
    }
  };
  const getStockColor = (value, reorderLevel) => {
    if (value <= 0) return 'error'; // Red for out of stock
    if (value <= reorderLevel) return 'warning'; // Orange if below reorder level
    return 'success'; // Green otherwise
  };

const reportColumns = [
  {
    accessorKey: 'docId',
    header: 'Doc ID',
    size: 100,
    Cell: ({ row }) => {
      const { docId, screenCode } = row.original;
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleDocClick(docId, screenCode);
          }}
          style={{
            color: '#f59e0b',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.color = '#fbbf24')}
          onMouseLeave={(e) => (e.target.style.color = '#f59e0b')}
        >
          {docId}
        </a>
      );
    }
  },
  { accessorKey: 'docDate', header: 'Date', size: 120 },
  { accessorKey: 'companyName', header: 'Company Name', size: 220 },
  { accessorKey: 'contactPerson', header: 'Contact Person', size: 180 },
  { accessorKey: 'gstNumber', header: 'GST No.', size: 150 },
  { accessorKey: 'state', header: 'State', size: 120 },
  { accessorKey: 'address', header: 'Address', size: 220 },
  { accessorKey: 'phone', header: 'Phone', size: 150 },
  { accessorKey: 'paymentTerms', header: 'Email', size: 220 },
  {
    accessorKey: 'creditLimit',
    header: 'Credit Limit',
    size: 150,
    Cell: ({ cell }) => {
      const value = parseFloat(cell.getValue() || 0);
      return value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  },
  { accessorKey: 'paymentTerms', header: 'Payment Terms', size: 150 }
];


  const handleGo = async () => {
    const errors = {};
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setListView(false);
      try {
        let response;
        if (formData.fromDate && formData.toDate) {
          response = await apiCalls(
            'get',
            `/inventoryitem/getSupplierReport?branch=${branch}&companyName=${formData.companyName}&finyear=${finYear}&orgId=${orgId}&toDate=${formData.toDate}&fromDate=${formData.fromDate}`
          );
        } else {
          response = await apiCalls(
            'get',
            `/inventoryitem/getSupplierReport?branch=${branch}&companyName=${formData.companyName}&finyear=${finYear}&orgId=${orgId}`
          );
        }
        if (response.status === true) {
          setRowData(response.paramObjectsMap.supplierDetails || []);
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
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleDocClick = async (docId, screenCode) => {
    setModalOpen(true);
    try {
      const response = await apiCalls('get', `/inventoryitem/getInventoryItemByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.inventoryItemVO || []);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      setListViewData(response.paramObjectsMap.companyVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleDownloadPdf = ({ logo, columns, data, fileName, loginUserName, formData }) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // 1) Logo
    if (logo) {
      const imgProps = doc.getImageProperties(logo);
      const desiredWidth = 40; // 👈 set your preferred width here
      const aspectRatio = imgProps.height / imgProps.width;
      const calculatedHeight = desiredWidth * aspectRatio;
      doc.addImage(logo, 'PNG', 10, 10, desiredWidth, calculatedHeight);
    }
    // 2) Title
    const title = fileName;
    const textW = doc.getTextWidth(title);
    const boxW = textW;
    doc
      .setFillColor('#e7ebeb')
      .roundedRect((pageW - boxW) / 2, 18, boxW, 10, 4, 4, 'F')
      //  .roundedRect((pageW - boxW) / 2, 25 - 10, boxW, 10, 4, 4, 'F')
      .setTextColor('#34449B')
      .setFontSize(12)
      .text(title, pageW / 2, 25, { align: 'center' });

    // 3) Footer
    doc.setFontSize(8).setTextColor('#555555');
    doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
    doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });

    // 4) Filter metadata
    let xPos = 8;
    if (selectedSections.date && formData.fromDate && formData.toDate) {
      doc.setFont(undefined, 'bold');
      doc.text('From Date', xPos, 40);
      doc.setFont(undefined, 'normal');
      doc.text(dayjs(formData.fromDate).format('DD-MM-YYYY'), xPos, 45);
      xPos += 30;
      doc.setFont(undefined, 'bold');
      doc.text('To Date', xPos, 40);
      doc.setFont(undefined, 'normal');
      doc.text(dayjs(formData.toDate).format('DD-MM-YYYY'), xPos, 45);
      xPos += 30;
    }
    doc.setFont(undefined, 'bold');
    doc.text('Comp Name', xPos, 40);
    doc.setFont(undefined, 'normal');
    doc.text(formData.companyName || 'All', xPos, 45);

    // 5) Table
    const headerLabels = columns.map((c) => c.header);
    const body = data.map((row) =>
      columns.map((col) => {
        const key = col.accessorKey;
        let raw = key ? row[key] : '';
        if (key?.toLowerCase().includes('date')) {
          const d = dayjs(raw);
          return d.isValid() ? d.format('DD-MM-YYYY') : '-';
        }
        if (typeof raw === 'number') return raw === 0 ? '' : raw.toLocaleString('en-IN');
        return raw ?? '';
      })
    );

    autoTable(doc, {
      startY: 50,
      head: [headerLabels],
      body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [52, 68, 155], textColor: 255, halign: 'center' },
      theme: 'grid',
      margin: { left: 5, right: 5 },
      didDrawPage: () => {
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
      }
    });

    doc.save(`${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };
  const handleDownloadExcel = async ({ logo, columns, data, fileName }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.created = new Date();
      const sheet = workbook.addWorksheet(fileName || 'Report');

      // 1) Logo
      if (logo) {
        try {
          const base64Data = logo.split(',')[1] || logo;
          if (base64Data && base64Data.length >= 100) {
            const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
            const imageId = workbook.addImage({ base64: base64Data, extension });
            sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 80 } });
          }
        } catch (err) {
          console.error('Logo error:', err);
        }
      }

      // 2) Title
      sheet.mergeCells('C1:I1');
      const titleCell = sheet.getCell('C1');
      titleCell.value = fileName;
      titleCell.font = { size: 18, bold: true, color: { argb: 'FF34449B' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // 3) Metadata
      const metadata = [];
      if (selectedSections.date) {
        metadata.push({ label: 'From Date', value: dayjs(formData.fromDate).format('DD-MM-YYYY') });
        metadata.push({ label: 'To Date', value: dayjs(formData.toDate).format('DD-MM-YYYY') });
      }
      metadata.push({ label: 'Comp Name', value: formData.companyName || 'All' });
      metadata.push({ label: 'Generated By', value: localStorage.getItem('userName') || 'System' });
      metadata.push({ label: 'Generated On', value: dayjs().format('DD-MM-YYYY HH:mm') });

      metadata.forEach((meta, index) => {
        const rowIndex = (index % 4) + 2;
        const colStart = 4 + Math.floor(index / 4) * 2;
        const row = sheet.getRow(rowIndex);
        row.getCell(colStart).value = meta.label;
        row.getCell(colStart).font = { bold: true };
        row.getCell(colStart + 1).value = meta.value;
      });

      // 4) Table Header
      const headerRow = sheet.getRow(6);
      columns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = col.header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34449B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      headerRow.height = 20;

      // 5) Table Data
      data.forEach((rowItem) => {
        const rowValues = columns.map((col) => {
          let value = rowItem[col.accessorKey];

          // ✅ Format if value looks like a date
          if (col.accessorKey?.toLowerCase().includes('date') && value) {
            const d = dayjs(value);
            return d.isValid() ? d.format('DD-MM-YYYY') : '';
          }

          // ✅ Format numbers nicely too
          if (typeof value === 'number') {
            return value === 0 ? '' : value.toLocaleString('en-IN');
          }

          return value ?? '';
        });

        const row = sheet.addRow(rowValues);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      });
      // 6) Column Widths (optional)
      sheet.columns = columns.map(() => ({ width: 20 }));

      // 7) Export
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    } catch (error) {
      console.error('Excel error:', error);
      showToast('error', 'Failed to generate Excel file');
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <>
          <div className="row">
            <div className="row">
              <div className="col-md-2 mb-3">
                <FormControlLabel
                  control={<Checkbox checked={selectedSections.date} onChange={handleCheckboxChange} name="date" color="secondary" />}
                  label="Date"
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={
                    <Checkbox checked={selectedSections.companyName} onChange={handleCheckboxChange} name="companyName" color="secondary" />
                  }
                  label="Company"
                />
              </div>
            </div>
            {selectedSections.date && (
              <>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="From Date"
                        value={formData.fromDate ? dayjs(formData.fromDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('fromDate', date)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            clearable: true,
                            error: Boolean(fieldErrors.fromDate),
                            helperText: fieldErrors.fromDate
                          }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
                <div className="col-md-3 mb-3">
                  <FormControl fullWidth variant="filled" size="small">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="To Date"
                        value={formData.toDate ? dayjs(formData.toDate, 'YYYY-MM-DD') : null}
                        onChange={(date) => handleDateChange('toDate', date)}
                        slotProps={{
                          textField: { size: 'small', clearable: true, error: Boolean(fieldErrors.toDate), helperText: fieldErrors.toDate }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
              </>
            )}

            {selectedSections.companyName && (
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', ...compNameList.map((row) => row.companyName)]}
                  value={formData.companyName || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        companyName: newValue
                      }));
                      setFieldErrors((prev) => ({ ...prev, companyName: '' }));
                    } else {
                      setFormData((prev) => ({ ...prev, companyName: '' }));
                      setFieldErrors((prev) => ({ ...prev, companyName: 'Comp Name is required' }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<span>Comp Name</span>}
                      size="small"
                      error={!!fieldErrors.companyName}
                      helperText={fieldErrors.companyName}
                      fullWidth
                    />
                  )}
                />
              </div>
            )}
            {(selectedSections.date || selectedSections.companyName) && (
              <div className="col-md-3 mb-2">
                <div className="row d-flex ml">
                  <div className="d-flex flex-wrap justify-content-start mb-3 mt-1" style={{ marginBottom: '20px' }}>
                    <ActionButton title="Search" icon={SearchIcon} onClick={handleGo} isLoading={isLoading} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
        <Dialog
          open={listView}
          onClose={() => setListView(false)}
          fullWidth
          maxWidth="xl"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          PaperProps={{
            sx: { p: 0, m: 0, borderRadius: 1 }
          }}
        >
          <DialogTitle style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }} id="draggable-dialog-title">
            Supplier Report
            <IconButton
              onClick={() => setListView(false)}
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                color: 'white'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              p: 0,
              backgroundColor: '#0f0f1a'
            }}
          >
            <CommonReportTable
              data={rowData}
              columns={reportColumns}
              isListView={listView}
              fileName={'Supplier Report'}
              handleDownloadPdf={() =>
                handleDownloadPdf({
                  logo: listViewData[0]?.companyLogo,
                  columns: reportColumns,
                  data: rowData,
                  formData,
                  fileName: 'Supplier Report',
                  loginUserName
                })
              }
              handleDownloadExcel={() =>
                handleDownloadExcel({
                  logo: listViewData[0]?.companyLogo,
                  columns: reportColumns,
                  data: rowData,
                  fileName: 'Supplier Report'
                })
              }
            />
          </DialogContent>
        </Dialog>
        <>
          <Dialog
            open={modalOpen}
            maxWidth={'xl'}
            fullWidth={true}
            onClose={handleCloseModal}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
          >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <h6 style={{ margin: 0, textAlign: 'center' }}>Report Details</h6>
                <IconButton onClick={handleCloseModal} color="error">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {fillGridData && <>{isLoading ? <FullScreenLoader open={true} /> : <SupplierManagement selectedRow={fillGridData} />}</>}
            </DialogContent>
          </Dialog>
        </>
      </div>
    </>
  );
}
export default SupplierManagementReport;

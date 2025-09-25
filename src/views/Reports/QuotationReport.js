import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormHelperText, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Chip } from '@mui/material';
import { Button } from '@mui/material';
import { IconButton } from '@mui/material';
import { Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import apiCalls from 'apicall';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import CommonReportTable from 'utils/CommonReportTable';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import FullScreenLoader from 'utils/FullScreenLoader';
import Quotation from 'views/Transaction/Quotation';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
function QuotationReport() {
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [countOpen, setCountOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [countData, setCountData] = useState([]);
  const [selectedSections, setSelectedSections] = useState({
    date: false,
    clientName: false,
    branch: false,
    productName: false
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
    clientName: 'All',
    branch: 'All',
    productName: 'All'
  });
  const [fieldErrors, setFieldErrors] = useState({
    fromDate: '',
    toDate: '',
    clientName: '',
    branch: '',
    productName: ''
  });
  const groupByDocId = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.docId]) {
        acc[item.docId] = {
          docId: item.docId,
          docDate: item.docDate,
          count: item.count,
          clientName: item.clientName,
          contactName: item.contactName,
          email: item.email,
          status: item.status,
          screenCode: item.screenCode,
          children: []
        };
      }
      acc[item.docId].children.push({
        subCategory: item.subCategory,
        category: item.category,
        productName: item.productName,
        qty: item.qty,
        sellingPrice: item.sellingPrice,
        amount: item.amount
      });
      return acc;
    }, {});
  };
  const groupQuoteRevisions = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.docId]) {
        acc[item.docId] = {
          docId: item.docId,
          docDate: item.docDate,
          clientName: item.clientName,
          branchName: item.branchName,
          contactName: item.contactName,
          email: item.email,
          mobileNumber: item.mobileNumber,
          gstNo: item.gstNo,
          status: item.status,
          iterations: item.iterations,
          grossAmount: item.grossAmount,
          discount: item.discount,
          netAmount: item.netAmount,
          narration: item.narration,
          count: item.count,
          screenCode: item.screenCode,
          sourceScreenName: item.sourceScreenName,
          children: []
        };
      }

      acc[item.docId].children.push({
        subCategory: item.subCategory,
        category: item.category,
        productName: item.productName,
        qty: item.qty,
        sellingPrice: item.sellingPrice,
        amount: item.amount
      });

      return acc;
    }, {});
  };

  const handleClear = () => {
    setListView(false);
    setFormData({
      fromDate: null,
      toDate: null,
      clientName: 'All',
      branch: 'All',
      productName: 'All'
    });
    setFieldErrors({
      fromDate: '',
      toDate: '',
      clientName: '',
      branch: '',
      productName: ''
    });
    setRowData([]);
  };
  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };
  useEffect(() => {
    getClientName();
    getBranch('All');
    getProductName();
    getCompanyDetails();
  }, []);
  const getClientName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getClientNameFromLeadScreen?orgId=${orgId}`);
      setClientNameList(response.paramObjectsMap.clientName);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const getBranch = async (clientName) => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getAllBranchesFromLead?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`
      );
      setBranchList(response.paramObjectsMap.branches);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const getProductName = async () => {
    try {
      const response = await apiCalls('get', `/master/getAllProductNames?orgId=${orgId}`);
      setProductList(response.paramObjectsMap.productName);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const handleGo = async () => {
    const errors = {};
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setListView(false);
      try {
        let response;
        if (selectedSections.date) {
          response = await apiCalls(
            'get',
            `/transaction/getQuotationReport?branchName=${formData.branch}&clientName=${encodeURIComponent(formData.clientName)}&finYear=${finYear}&orgId=${orgId}&productName=${formData.productName}&fromDate=${formData.fromDate}&toDate=${formData.toDate}`
          );
        } else {
          response = await apiCalls(
            'get',
            `/transaction/getQuotationReport?branchName=${formData.branch}&clientName=${encodeURIComponent(formData.clientName)}&finYear=${finYear}&orgId=${orgId}&productName=${formData.productName}`
          );
        }
        if (response.status === true) {
          const grouped = Object.values(groupByDocId(response.paramObjectsMap.quotationReportDeatils));
          setRowData(grouped);
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
  const handleDocIdClick = async (docId, screenCode) => {
    setModalOpen(true);
    try {
      const response = await apiCalls('get', `/transaction/getQuotationByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.quotationVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleIterationClick = async (docId) => {
    setCountOpen(true);
    try {
      const response = await apiCalls('get', `/transaction/getCountQuoteRevision?docId=${docId}&orgId=${orgId}`);
      if (response.status) {
        const grouped = Object.values(groupQuoteRevisions(response.paramObjectsMap.quoteRevisionVO));
        setCountData(grouped);
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
      console.log('API Response:', response);
      setListViewData(response.paramObjectsMap.companyVO.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleDownloadPdf = ({ logo, fileName = 'Quotation Report', loginUserName, formData, rowData }) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // 1) COMPANY LOGO
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 10, 30, 23);
    }

    // 2) TITLE
    const title = fileName;
    const textW = doc.getTextWidth(title);
    const boxW = textW + 20;
    const boxX = (pageW - boxW) / 2;
    doc
      .setFillColor('#e7ebeb')
      .roundedRect(boxX, 18, boxW, 10, 4, 4, 'F')
      .setTextColor('#34449B')
      .setFontSize(12)
      .text(title, pageW / 2, 25, { align: 'center' });

    // 3) FILTER METADATA
    const { fromDate, toDate, branch, clientName, productName } = formData;
    let metaX = 8;
    doc.setFontSize(9).setTextColor('#000');
    if (fromDate) {
      doc.text(`From Date: ${dayjs(fromDate).format('DD-MM-YYYY')}`, metaX, 40);
      metaX += 40;
    }
    if (toDate) {
      doc.text(`To Date: ${dayjs(toDate).format('DD-MM-YYYY')}`, metaX, 40);
      metaX += 40;
    }
    if (branch) {
      doc.text(`Branch: ${branch}`, metaX, 40);
      metaX += 40;
    }
    if (clientName) {
      doc.text(`Client: ${clientName}`, metaX, 40);
      metaX += 50;
    }
    if (productName) {
      doc.text(`Product: ${productName}`, metaX, 40);
    }

    // 4) TABLE HEADERS
    const headers = [
      'Doc Id',
      'Date',
      'Iterations',
      'Sub Category',
      'Category',
      'Product Name',
      'Qty',
      'SP',
      'Amount',
      'Client Name',
      'Contact',
      'Email',
      'Status'
    ];

    // 5) TABLE BODY WITH GROUPED MERGE
    const body = [];
    rowData.forEach((docRow) => {
      docRow.children.forEach((child, idx) => {
        body.push({
          docId: idx === 0 ? docRow.docId : '',
          date: idx === 0 ? dayjs(docRow.docDate).format('DD-MM-YYYY') : '',
          count: idx === 0 ? docRow.count : '',
          subCategory: child.subCategory,
          category: child.category,
          productName: child.productName,
          qty: child.qty,
          sp: Number(child.sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          amount: Number(child.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          client: idx === 0 ? docRow.clientName : '',
          contact: idx === 0 ? docRow.contactName : '',
          email: idx === 0 ? docRow.email : '',
          status: idx === 0 ? docRow.status : ''
        });
      });
    });

    autoTable(doc, {
      startY: 50,
      head: [headers],
      body: body.map((r) => [
        r.docId,
        r.date,
        r.count,
        r.subCategory,
        r.category,
        r.productName,
        r.qty,
        r.sp,
        r.amount,
        r.client,
        r.contact,
        r.email,
        r.status
      ]),
      styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [52, 68, 155], textColor: 255, halign: 'center', fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        6: { halign: 'right' }, // Qty
        7: { halign: 'right' }, // SP
        8: { halign: 'right' } // Amount
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
      margin: { left: 5, right: 5 },
      didDrawCell: (data) => {
        // merge grouped cells: hide repeated blanks & center vertically
        if (
          data.section === 'body' &&
          ['', null, undefined].includes(data.cell.raw) &&
          [0, 1, 2, 9, 10, 11, 12].includes(data.column.index)
        ) {
          data.cell.text = []; // remove text so it looks merged
        }
      }
    });

    // 6) FOOTER
    doc.setFontSize(8).setTextColor('#555');
    doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
    doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });

    doc.save(`${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };
  const handleDownloadExcel = async ({ logo, fileName = 'Quotation Report', formData, rowData }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Quotation Report');

      // LOGO
      sheet.mergeCells('A1:B5');
      if (logo) {
        try {
          const base64Data = logo.split(',')[1] || logo;
          const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
          const imageId = workbook.addImage({ base64: base64Data, extension });
          sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 80 } });
        } catch (err) {
          console.error('Logo error:', err);
        }
      }

      // TITLE
      sheet.mergeCells('C1:I1');
      const titleCell = sheet.getCell('C1');
      titleCell.value = fileName;
      titleCell.font = { size: 16, bold: true, color: { argb: 'FF34449B' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // METADATA
      const metadata = [];
      if (formData.fromDate) metadata.push(['From Date', dayjs(formData.fromDate).format('DD-MM-YYYY')]);
      if (formData.toDate) metadata.push(['To Date', dayjs(formData.toDate).format('DD-MM-YYYY')]);
      metadata.push(['Branch', formData.branch]);
      metadata.push(['Client', formData.clientName]);
      metadata.push(['Product', formData.productName]);
      metadata.push(['Generated By', localStorage.getItem('userName') || 'System']);
      metadata.push(['Generated On', dayjs().format('DD-MM-YYYY HH:mm')]);

      metadata.forEach((meta, idx) => {
        const rowIdx = idx + 2;
        sheet.getCell(`D${rowIdx}`).value = meta[0];
        sheet.getCell(`D${rowIdx}`).font = { bold: true };
        sheet.getCell(`E${rowIdx}`).value = meta[1];
      });

      // HEADERS
      const headers = [
        'Doc Id',
        'Date',
        'Iterations',
        'Sub Category',
        'Category',
        'Product Name',
        'Qty',
        'SP',
        'Amount',
        'Client Name',
        'Contact',
        'Email',
        'Status'
      ];
      const headerRow = sheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34449B' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      rowData.forEach((doc) => {
        const childCount = doc.children.length;
        doc.children.forEach((child, idx) => {
          const row = sheet.addRow([
            idx === 0 ? doc.docId : '',
            idx === 0 ? dayjs(doc.docDate).format('DD-MM-YYYY') : '',
            idx === 0 ? doc.count : '',
            child.subCategory,
            child.category,
            child.productName,
            child.qty,
            child.sellingPrice ? Number(child.sellingPrice) : '',
            child.amount ? Number(child.amount) : '',
            idx === 0 ? doc.clientName : '',
            idx === 0 ? doc.contactName : '',
            idx === 0 ? doc.email : '',
            idx === 0 ? doc.status : ''
          ]);

          // Zebra striping
          if (row.number % 2 === 0) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
          }

          // Right-align numbers
          row.getCell(7).alignment = { horizontal: 'right' };
          row.getCell(8).alignment = { horizontal: 'right' };
          row.getCell(9).alignment = { horizontal: 'right' };
        });

        // Merge grouped cells
        if (childCount > 1) {
          ['A', 'B', 'C', 'J', 'K', 'L', 'M'].forEach((col) => {
            sheet.mergeCells(`${col}${sheet.lastRow.number - childCount + 1}:${col}${sheet.lastRow.number}`);
            sheet.getCell(`${col}${sheet.lastRow.number - childCount + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
          });
        }
      });

      // Auto-fit width
      sheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const length = cell.value ? cell.value.toString().length : 10;
          if (length > maxLength) maxLength = length;
        });
        col.width = maxLength < 20 ? maxLength + 2 : 25;
      });

      // BORDER + WIDTH
      sheet.columns.forEach((col) => {
        col.width = 18;
      });
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // EXPORT
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Excel error:', err);
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
                    <Checkbox checked={selectedSections.clientName} onChange={handleCheckboxChange} name="clientName" color="secondary" />
                  }
                  label="Client Name"
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={<Checkbox checked={selectedSections.branch} onChange={handleCheckboxChange} name="branch" color="secondary" />}
                  label="Branch"
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={
                    <Checkbox checked={selectedSections.productName} onChange={handleCheckboxChange} name="productName" color="secondary" />
                  }
                  label="Product Name"
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
                          textField: { size: 'small', clearable: true, error: fieldErrors.fromDate, helperText: fieldErrors.fromDate }
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
                          textField: { size: 'small', clearable: true, error: fieldErrors.toDate, helperText: fieldErrors.toDate }
                        }}
                        format="DD-MM-YYYY"
                      />
                    </LocalizationProvider>
                  </FormControl>
                </div>
              </>
            )}
            {selectedSections.clientName && (
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', ...clientNameList.map((row) => row.clientName)]}
                  value={formData.clientName || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        clientName: newValue
                      }));
                      setFieldErrors((prev) => ({ ...prev, clientName: '' }));
                      getBranch(newValue);
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
            )}
            {selectedSections.branch && (
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', ...branchList.map((row) => row.branch)]}
                  value={formData.branch || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        branch: newValue
                      }));
                      setFieldErrors((prev) => ({ ...prev, branch: '' }));
                    } else {
                      setFormData((prev) => ({ ...prev, branch: '' }));
                      setFieldErrors((prev) => ({ ...prev, branch: 'Branch is required' }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <span>
                          Branch <span className="asterisk">*</span>
                        </span>
                      }
                      size="small"
                      error={!!fieldErrors.branch}
                      helperText={fieldErrors.branch}
                      fullWidth
                    />
                  )}
                />
              </div>
            )}
            {selectedSections.productName && (
              <div className="col-md-3 mb-3">
                <Autocomplete
                  options={['All', ...productList.map((row) => row.productName)]}
                  value={formData.productName || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        productName: newValue
                      }));
                      setFieldErrors((prev) => ({ ...prev, productName: '' }));
                    } else {
                      setFormData((prev) => ({ ...prev, productName: '' }));
                      setFieldErrors((prev) => ({ ...prev, productName: 'Product Name is required' }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <span>
                          Product Name <span className="asterisk">*</span>
                        </span>
                      }
                      size="small"
                      error={!!fieldErrors.productName}
                      helperText={fieldErrors.productName}
                      fullWidth
                    />
                  )}
                />
              </div>
            )}
            {(selectedSections.date || selectedSections.clientName || selectedSections.branch || selectedSections.productName) && (
              <div className="col-md-3 mb-2">
                <div className="row d-flex ml">
                  <div className="d-flex flex-wrap justify-content-start mb-4 mt-1" style={{ marginBottom: '20px' }}>
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
        >
          <DialogTitle style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }} id="draggable-dialog-title">
            Quotation Report
            {/* Close Button */}
            <IconButton onClick={() => setListView(false)} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
              <CloseIcon />
            </IconButton>
            {/* Excel Download */}
            <IconButton
              onClick={() =>
                handleDownloadExcel({
                  logo: listViewData[0]?.companyLogo,
                  fileName: 'Quotation Report',
                  rowData,
                  formData,
                  loginUserName
                })
              }
              sx={{ position: 'absolute', right: 50, top: 8, color: '#217346' }} // ✅ Excel green
            >
              <GetAppIcon />
            </IconButton>
            {/* PDF Download */}
            <IconButton
              onClick={() =>
                handleDownloadPdf({
                  logo: listViewData[0]?.companyLogo,
                  fileName: 'Quotation Report',
                  loginUserName,
                  formData,
                  rowData
                })
              }
              sx={{ position: 'absolute', right: 90, top: 8, color: '#D32F2F' }} // ✅ PDF red
            >
              <PictureAsPdfIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Doc Id</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>No. of Iterations</TableCell>
                    <TableCell>Sub Category</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">SP</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Contact Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowData.map((doc, docIndex) => {
                    const totalChildren = doc.children.length;
                    return doc.children.map((child, childIndex) => (
                      <TableRow key={`${doc.docId}-${childIndex}`}>
                        {childIndex === 0 && (
                          <>
                            <TableCell
                              rowSpan={totalChildren}
                              sx={{ color: 'blue', cursor: 'pointer', textDecoration: 'none' }}
                              onClick={() => handleDocIdClick(doc.docId, doc.screenCode)}
                            >
                              {doc.docId}
                            </TableCell>
                            <TableCell rowSpan={totalChildren}>{dayjs(doc.docDate).format('DD/MM/YYYY')}</TableCell>
                            <TableCell rowSpan={totalChildren} align="center">
                              <Chip
                                label={`View (${doc.count})`}
                                color="secondary"
                                size="small"
                                clickable
                                onClick={() => handleIterationClick(doc.docId, doc.count)}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell>{child.subCategory}</TableCell>
                        <TableCell>{child.category}</TableCell>
                        <TableCell>{child.productName}</TableCell>
                        <TableCell align="center">{child.qty}</TableCell>
                        <TableCell align="right">
                          {child.sellingPrice ? Number(child.sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {child.amount ? Number(child.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                        </TableCell>
                        {childIndex === 0 && (
                          <>
                            <TableCell rowSpan={totalChildren}>{doc.clientName}</TableCell>
                            <TableCell rowSpan={totalChildren}>{doc.contactName}</TableCell>
                            <TableCell rowSpan={totalChildren}>{doc.email}</TableCell>
                            {/* <TableCell rowSpan={totalChildren}>{doc.status}</TableCell> */}
                            <TableCell rowSpan={totalChildren} align="center">
                              <Chip
                                label={doc.status}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  color: 'white',
                                  ...(doc.status === 'APPROVED' && { backgroundColor: '#4caf50' }), // Green
                                  ...(doc.status === 'REJECTED' && { backgroundColor: '#f44336' }), // Red
                                  ...(doc.status === 'NEW' && { backgroundColor: '#2196f3' }), // Blue
                                  ...(doc.status === 'REVISED' && { backgroundColor: '#ff9800' }) // Orange
                                }}
                              />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
              {fillGridData && <>{isLoading ? <FullScreenLoader open={true} /> : <Quotation selectedRow={fillGridData} />}</>}
            </DialogContent>
          </Dialog>
        </>
        <Dialog
          open={countOpen}
          maxWidth="xl"
          fullWidth
          onClose={() => setCountOpen(false)}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <h6 style={{ margin: 0, textAlign: 'center' }}>Report Details</h6>
              <IconButton onClick={() => setCountOpen(false)} color="error">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {countData && (
              <>
                {isLoading ? (
                  <FullScreenLoader open={true} />
                ) : (
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Doc Id</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Iterations</TableCell>
                        <TableCell>Client Name</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Net Amount</TableCell>
                        <TableCell>Sub Category</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">SP</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {countData.map((doc, docIndex) => {
                        const totalChildren = doc.children.length;
                        return doc.children.map((child, childIndex) => (
                          <TableRow key={`${doc.docId}-${childIndex}`}>
                            {childIndex === 0 && (
                              <>
                                <TableCell rowSpan={totalChildren}>{doc.docId}</TableCell>
                                <TableCell rowSpan={totalChildren}>{dayjs(doc.docDate).format('DD/MM/YYYY')}</TableCell>
                                <TableCell rowSpan={totalChildren}>{doc.iterations}</TableCell>
                                <TableCell rowSpan={totalChildren}>{doc.clientName}</TableCell>
                                <TableCell rowSpan={totalChildren}>{doc.contactName}</TableCell>
                                <TableCell rowSpan={totalChildren}>
                                  <Chip
                                    label={doc.status}
                                    size="small"
                                    sx={{
                                      color: doc.status === 'APPROVED' ? 'white' : doc.status === 'REJECTED' ? 'white' : 'white',
                                      backgroundColor: doc.status === 'APPROVED' ? 'green' : doc.status === 'REJECTED' ? 'red' : '#1976d2',
                                      fontWeight: 600
                                    }}
                                  />
                                </TableCell>
                                <TableCell rowSpan={totalChildren} align="right">
                                  {doc.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </TableCell>
                              </>
                            )}

                            {/* Child rows */}
                            <TableCell>{child.subCategory}</TableCell>
                            <TableCell>{child.category}</TableCell>
                            <TableCell>{child.productName}</TableCell>
                            <TableCell align="center">{child.qty}</TableCell>
                            <TableCell align="right">{child.sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell align="right">{child.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
export default QuotationReport;

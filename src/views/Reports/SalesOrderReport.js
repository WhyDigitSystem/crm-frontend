import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormHelperText, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { IconButton } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import Tab from '@mui/material/Tab';
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
import SalesOrder from 'views/Transaction/SaleOrder';
function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}
function SalesOrderReport() {
  const [productList, setProductList] = useState([]);
  const [listViewData, setListViewData] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [finYear] = useState(localStorage.getItem('finYear'));
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [isLoading, setIsLoading] = useState(false);
  const [clientNameList, setClientNameList] = useState([]);
  const [fillGridData, setFillGridData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [branchList, setBranchList] = useState([]);
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
    getProductName();
    getBranch('All');
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
      const response = await apiCalls('get', `/transaction/getAllBranchesFromLead?clientName=${encodeURIComponent(clientName)}&orgId=${orgId}`);
      setBranchList(response.paramObjectsMap.branches);
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };
  const reportColumns = [
    {
      accessorKey: 'docId',
      header: 'Doc Id',
      size: 100,
      Cell: ({ row }) => {
        const docId = row.original.docId;
        const screenCode = row.original.screenCode;
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
              transition: 'color 0.2s, text-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#fbbf24';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#f59e0b';
            }}
          >
            {docId}
          </a>
        );
      }
    },
    { accessorKey: 'docDate', header: 'Date', size: 80 },
    { accessorKey: 'subCategory', header: 'Sub Category', size: 80 },
    { accessorKey: 'category', header: 'Category', size: 80 },
    { accessorKey: 'productName', header: 'Product Name', size: 80 },
    {
      accessorKey: 'qty',
      header: 'Qty',
      size: 50,
      Cell: ({ cell }) => (
        <div style={{ textAlign: 'center', width: '100%' }}>{cell.getValue() ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}</div>
      )
    },
    {
      accessorKey: 'sellingPrice',
      header: 'SP',
      size: 50,
      Cell: ({ cell }) => (
        <div style={{ textAlign: 'right', width: '100%' }}>{cell.getValue() ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}</div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amt',
      size: 50,
      Cell: ({ cell }) => (
        <div style={{ textAlign: 'right', width: '100%' }}>{cell.getValue() ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}</div>
      )
    },
    { accessorKey: 'clientName', header: 'Client Name', size: 80 },
    // { accessorKey: 'mobileNo', header: 'Mob No', size: 80 },
    { accessorKey: 'email', header: 'Email', size: 100 },
    { accessorKey: 'gstNo', header: 'Reg No', size: 100 },
    // { accessorKey: 'branchName', header: 'Branch', size: 80 },
    { accessorKey: 'status', header: 'Status', size: 80 },
  ];
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
            `/transaction/getSalesOrderReport?branchName=${formData.branch}&clientName=${encodeURIComponent(formData.clientName)}&finYear=${finYear}&orgId=${orgId}&productName=${formData.productName}&fromDate=${formData.fromDate}&toDate=${formData.toDate}`
          );
        } else {
          response = await apiCalls(
            'get',
            `/transaction/getSalesOrderReport?branchName=${formData.branch}&clientName=${encodeURIComponent(formData.clientName)}&finYear=${finYear}&orgId=${orgId}&productName=${formData.productName}`
          );
        }
        if (response.status === true) {
          console.log('Response:', response);
          setRowData(response.paramObjectsMap.salesOrderReportDeatils);
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
      const response = await apiCalls('get', `/transaction/getSalesOrderByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
      if (response.status === true) {
        setFillGridData(response.paramObjectsMap.salesOrderVO);
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
  // pdf download
  const handleDownloadPdf = ({ logo, columns, data, fileName, loginUserName, formData }) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // 1) COMPANY LOGO
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 10, 30, 23);
    }

    // 2) TITLE BOX
    const title = `${fileName}`;
    const textW = doc.getTextWidth(title);
    const boxW = textW + 20;
    const boxX = (pageW - boxW) / 2;
    doc
      .setFillColor('#e7ebeb')
      .roundedRect(boxX, 18, boxW, 10, 4, 4, 'F')
      .setTextColor('#34449B')
      .setFontSize(12)
      .text(title, pageW / 2, 25, { align: 'center' });

    // 3) FOOTER
    doc.setFontSize(8).setTextColor('#555555');
    doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
    doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });

    // 4) FILTER METADATA
    const { fromDate, toDate, branch, clientName, productName } = formData;
    doc.setFontSize(9);
    doc.setTextColor('#000000');
    doc.setFillColor(231, 235, 235);
    doc.roundedRect(2, 35, 292, 12, 2, 2, 'F');

    let xPos = 8;

    if (selectedSections.date) {
      if (fromDate && dayjs(fromDate).isValid()) {
        doc.setFont(undefined, 'bold').text('From Date', xPos, 40);
        doc.setFont(undefined, 'normal').text(dayjs(fromDate).format('DD-MM-YYYY'), xPos, 45);
        xPos += 24;
        doc.setFont(undefined, 'bold').text('To Date', xPos, 40);
        doc.setFont(undefined, 'normal').text(dayjs(toDate).format('DD-MM-YYYY'), xPos, 45);
        xPos += 24;
      }
    }

    if (branch) {
      doc.setFont(undefined, 'bold').text('Branch', xPos, 40);
      doc.setFont(undefined, 'normal').text(branch, xPos, 45);
      xPos += 34;
    }

    if (clientName) {
      doc.setFont(undefined, 'bold').text('Client Name', xPos, 40);
      doc.setFont(undefined, 'normal').text(clientName, xPos, 45);
      xPos += 34;
    }

    if (productName) {
      doc.setFont(undefined, 'bold').text('Product Name', xPos, 40);
      doc.setFont(undefined, 'normal').text(productName, xPos, 45);
      xPos += 34;
    }

    // 5) Table Header & Body
    const headerLabels = columns.map((c) => c.header);
    const body = data.map((row) =>
      columns.map((col) => {
        const raw = row[col.accessorKey];
        if (col.accessorKey?.toLowerCase().includes('date')) {
          const d = dayjs(raw);
          return d.isValid() ? d.format('DD-MM-YYYY') : '-';
        }
        if (typeof raw === 'number') {
          return raw === 0 ? '' : raw.toLocaleString('en-IN');
        }
        return raw ?? '';
      })
    );

    const columnStyles = {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 15 },
      5: { cellWidth: 15 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 40 },
      9: { cellWidth: 40 },
      10: { cellWidth: 30 },
      11: { cellWidth: 25 }
    };

    autoTable(doc, {
      startY: 50,
      head: [headerLabels],
      body,
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.1, lineColor: [220, 220, 220], overflow: 'linebreak' },
      headStyles: { fillColor: [52, 68, 155], textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'left' },
      theme: 'grid',
      margin: { left: 5, right: 5 },
      tableWidth: 'auto',
      columnStyles: columnStyles,
      didDrawPage: () => {
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
      }
    });

    // 8) Save File
    doc.save(`${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };
  // excel download
  const handleDownloadExcel = async ({ logo }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Sales Order Report');
      sheet.state = 'visible';

      // ====== LOGO ======
      sheet.mergeCells('A1:B5');
      if (logo) {
        try {
          const base64Data = logo.split(',')[1] || logo;
          if (base64Data.length >= 100) {
            const extension = logo.includes('jpeg') ? 'jpeg' : 'png';
            const imageId = workbook.addImage({ base64: base64Data, extension });
            sheet.addImage(imageId, {
              tl: { col: 0, row: 0 },
              ext: { width: 120, height: 80 }
            });
          }
        } catch (err) {
          console.error('Error adding logo:', err);
        }
      }

      // ====== TITLE ======
      sheet.mergeCells('C1:I1');
      const titleCell = sheet.getCell('C1');
      titleCell.value = 'Sales Order Report';
      titleCell.font = { size: 18, bold: true, color: { argb: 'FF34449B' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ====== METADATA ======
      // const metadata = [
      //   { label: 'From Date', value: formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : 'N/A' },
      //   { label: 'To Date', value: formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : 'N/A' },
      //   { label: 'Branch', value: formData.branch !== 'All' ? formData.branch : 'All' },
      //   { label: 'Client Name', value: formData.clientName },
      //   { label: 'Generated By', value: localStorage.getItem('userName') || 'System' },
      //   { label: 'Generated On', value: dayjs().format('DD-MM-YYYY HH:mm') }
      // ];
      const metadata = [];
      if (selectedSections.date) {
        metadata.push({ label: 'From Date', value: dayjs(formData.fromDate).format('DD-MM-YYYY') });
        metadata.push({ label: 'To Date', value: dayjs(formData.toDate).format('DD-MM-YYYY') });
      }
      metadata.push({ label: 'Branch', value: formData.branch !== 'All' ? formData.branch : 'All' });
      metadata.push({ label: 'Product Name', value: formData.productName !== 'All' ? formData.productName : 'All' });
      metadata.push({ label: 'Client Name', value: formData.clientName });
      metadata.push({ label: 'Generated By', value: localStorage.getItem('userName') || 'System' });
      metadata.push({ label: 'Generated On', value: dayjs().format('DD-MM-YYYY HH:mm') });


      metadata.forEach((meta, index) => {
        const rowIndex = (index % 4) + 2;
        const colGroup = Math.floor(index / 4);
        const colStart = 4 + colGroup * 2;
        const row = sheet.getRow(rowIndex);
        row.getCell(colStart).value = meta.label;
        row.getCell(colStart).font = { bold: true };
        row.getCell(colStart + 1).value = meta.value;
      });

      // ====== HEADERS ======
      const headerRowIndex = 7;
      const headerRow = sheet.getRow(headerRowIndex);
      const headers = [
        'Doc Id',
        'Date',
        'Sub Category',
        'Category',
        'Product Name',
        'Qty',
        'SP',
        'Amt',
        'Client Name',
        'Email',
        'Reg No',
        'Status'
      ];
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF34449B' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
      headerRow.height = 20;
      rowData.forEach((item) => {
        const row = sheet.addRow([
          item.docId || '',
          item.docDate ? dayjs(item.docDate).format('DD-MM-YYYY') : '-',
          item.subCategory || '-',
          item.category || '-',
          item.productName || '-',
          item.qty || '-',
          item.sellingPrice || '-',
          item.price || '-',
          item.clientName,
          item.email,
          item.gstNo,
          item.status
        ]);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
      });

      // ====== COLUMN WIDTHS ======
      sheet.columns = [
        { width: 25 },
        { width: 20 },
        { width: 30 },
        { width: 35 },
        { width: 20 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 },
        { width: 25 }
      ];

      // ====== EXPORT ======
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, `Sales_Order_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
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
                  control={
                    <Checkbox
                      checked={selectedSections.date}
                      onChange={handleCheckboxChange}
                      name="date"
                      color="secondary"
                    />
                  }
                  label="Date"
                  
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSections.clientName}
                      onChange={handleCheckboxChange}
                      name="clientName"
                      color="secondary"
                    />
                  }
                  label="Client Name"
                  
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSections.branch}
                      onChange={handleCheckboxChange}
                      name="branch"
                      color="secondary"
                    />
                  }
                  label="Branch"
                  
                />
              </div>
              <div className="col-md-2 mb-1">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSections.productName}
                      onChange={handleCheckboxChange}
                      name="productName"
                      color="secondary"
                    />
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
                        branch: newValue,
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
                        productName: newValue,
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
          PaperProps={{
            sx: { p: 0, m: 0, borderRadius: 1 }
          }}
        >
          <DialogTitle
            style={{ cursor: 'move', backgroundColor: '#0f0f1a', color: 'white' }}
            id="draggable-dialog-title"
          >
            Sales Order Report
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
              fileName={'Sales Order Report'}
              handleDownloadPdf={() =>
                handleDownloadPdf({
                  logo: listViewData[0]?.companyLogo,
                  columns: reportColumns,
                  data: rowData,
                  formData,
                  fileName: 'Sales Order Report',
                  loginUserName
                })
              }
              handleDownloadExcel={() => handleDownloadExcel({ logo: listViewData[0]?.companyLogo })}
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
              {fillGridData && (
                <>
                  {isLoading ? (
                    <FullScreenLoader open={true} />
                  ) : (
                    <SalesOrder selectedRow={fillGridData} />
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      </div>
    </>
  );
}
export default SalesOrderReport;

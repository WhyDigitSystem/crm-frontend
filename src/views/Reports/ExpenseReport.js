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
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Autocomplete from '@mui/material/Autocomplete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import FullScreenLoader from 'utils/FullScreenLoader';
import ExpenseClaims from 'views/Finance/ExpenseClaims';
function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}
function ExpenseReport() {

    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);
    const [clientNameList, setClientNameList] = useState([]);
    const [fillGridData, setFillGridData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [listView, setListView] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [expenseTypeList, setExpenseTypeList] = useState([]);
    const [selectedSections, setSelectedSections] = useState({
        date: false,
        clientName: false,
        expenseType: false
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
        expenseType: 'All'
    });
    const [fieldErrors, setFieldErrors] = useState({
        fromDate: '',
        toDate: '',
        clientName: '',
        expenseType: ''
    });
    const handleClear = () => {
        setListView(false);
        setFormData({
            fromDate: null,
            toDate: null,
            clientName: 'All',
            expenseType: 'All'
        });
        setFieldErrors({
            fromDate: '',
            toDate: '',
            clientName: '',
            expenseType: ''
        });
        setRowData([]);
    };
    const handleDateChange = (field, date) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
        setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
    };
    useEffect(() => {
        getClientName();
        getExpenseType();
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
    const getExpenseType = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllListValues?listDescription=ExpenseType&orgId=${orgId}`);
            if (response.status === true) {
                setExpenseTypeList(response.paramObjectsMap.listValues || []);
            } else {
                console.error('API Error:', response);
                return response;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return error;
        }
    };
    const reportColumns = [
        {
            accessorKey: 'docId',
            header: 'Doc ID',
            size: 120,
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
                            transition: 'color 0.2s, text-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.color = '#fbbf24')}
                        onMouseLeave={(e) => (e.target.style.color = '#f59e0b')}
                    >
                        {docId}
                    </a>
                );
            },
        },
        { accessorKey: 'docDate', header: 'Date', size: 120 },
        { accessorKey: 'employeeName', header: 'Name', size: 150 },
        { accessorKey: 'employeeCode', header: 'Code', size: 130 },
        { accessorKey: 'paymentMode', header: 'Payment Mode', size: 120 },
        { accessorKey: 'totalAmount', header: 'Total Amount', size: 120 },
        { accessorKey: 'description', header: 'Description', size: 180 },
        {
            accessorKey: 'approveStatus',
            header: 'Approval Status',
            size: 130,
            Cell: ({ cell }) => {
                const status = cell.getValue();
                const color =
                    status === 'Approved'
                        ? '#16a34a' // Green
                        : status === 'Rejected'
                            ? '#dc2626' // Red
                            : '#f59e0b'; // Amber for Pending
                return (
                    <span
                        style={{
                            backgroundColor: color,
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                        }}
                    >
                        {status}
                    </span>
                );
            },
        },
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
                        `/expensedetails/getExpenseDetailsReport?branchCode=${branchCode}&clientName=${encodeURIComponent(formData.clientName)}&expenseType=${formData.expenseType}&finYear=${finYear}&orgId=${orgId}&fromDate=${formData.fromDate}&toDate=${formData.toDate}`
                    );
                } else {
                    response = await apiCalls(
                        'get',
                        `/expensedetails/getExpenseDetailsReport?branchCode=${branchCode}&clientName=${encodeURIComponent(formData.clientName)}&expenseType=${formData.expenseType}&finYear=${finYear}&orgId=${orgId}`
                    );
                }
                if (response.status === true) {
                    console.log('Response:', response);
                    setRowData(response.paramObjectsMap.expenseDeatils);
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
            const response = await apiCalls('get', `/expensedetails/getExpenseDetailsByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
            if (response.status === true) {
                setFillGridData(response.paramObjectsMap.expenseDetailsVO);
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
    // PDF download - replace your existing handleDownloadPdf with this
    const handleDownloadPdf = ({ logo, columns, data, fileName, loginUserName, formData }) => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        // --- Logo (if any)
        if (logo) {
            try {
                const logoWidth = 30;
                const logoHeight = 23;
                doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);
            } catch (e) {
                console.warn('Could not add logo to PDF', e);
            }
        }

        // --- Title
        const title = fileName || 'Report';
        doc.setFontSize(12).setTextColor('#34449B');
        doc.text(title, pageW / 2, 26, { align: 'center' });

        // --- Footer info (will be re-drawn on each page via didDrawPage)
        const generatedOnStr = dayjs().format('DD-MM-YYYY hh:mm A');

        // --- Filter / metadata box
        doc.setFontSize(9);
        doc.setFillColor(231, 235, 235);
        doc.roundedRect(6, 30, pageW - 12, 12, 2, 2, 'F');

        let xPos = 10;
        doc.setFont(undefined, 'bold');
        if (selectedSections.date) {
            doc.text('From:', xPos, 36);
            doc.setFont(undefined, 'normal');
            doc.text(formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-', xPos + 14, 36);
            xPos += 40;
            doc.setFont(undefined, 'bold');
            doc.text('To:', xPos, 36);
            doc.setFont(undefined, 'normal');
            doc.text(formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-', xPos + 10, 36);
            xPos += 40;
        }
        doc.setFont(undefined, 'bold');
        doc.text('Client Name:', xPos, 36);
        doc.setFont(undefined, 'normal');
        doc.text(formData.clientName || '-', xPos + 28, 36);

        // --- Prepare headers & body based on columns
        const headerLabels = columns.map((c) => c.header || '');
        const body = data.map((row) =>
            columns.map((col) => {
                const key = col.accessorKey;
                const raw = key ? row[key] : '';

                if (key?.toLowerCase().includes('date')) {
                    const d = dayjs(raw);
                    return d.isValid() ? d.format('DD-MM-YYYY') : '-';
                }

                if (key?.toLowerCase().includes('amount')) {
                    const num = Number(raw || 0);
                    // format with commas and 2 decimals
                    return num === 0 ? '' : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Approval status: keep as is
                if (key === 'approveStatus' && raw == null) return '';

                return raw ?? '';
            })
        );

        // --- Compute columnStyles (right-align amounts)
        const columnStyles = {};
        columns.forEach((col, idx) => {
            if (col.accessorKey?.toLowerCase().includes('amount')) {
                columnStyles[idx] = { halign: 'right', cellWidth: 'auto' };
            } else if (col.accessorKey?.toLowerCase().includes('date')) {
                columnStyles[idx] = { halign: 'center', cellWidth: 'auto' };
            } else {
                columnStyles[idx] = { halign: 'left', cellWidth: 'auto' };
            }
        });

        // --- Render table
        autoTable(doc, {
            startY: 46,
            head: [headerLabels],
            body,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [52, 68, 155],
                textColor: 255,
                halign: 'center',
                fontStyle: 'bold',
            },
            bodyStyles: {
                halign: 'left'
            },
            columnStyles,
            theme: 'grid',
            margin: { left: 6, right: 6, top: 6 },
            didDrawPage: (dataArg) => {
                // footer with generated on/by
                doc.setFontSize(8).setTextColor('#555555');
                doc.text(`Generated On: ${generatedOnStr}`, pageW - 10, pageH - 8, { align: 'right' });
                doc.text(`Generated By: ${loginUserName || 'System'}`, 10, pageH - 8, { align: 'left' });
            }
        });

        // --- Save
        doc.save(`${fileName || 'Report'}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
    };
    // Excel download - replace your existing handleDownloadExcel with this
    const handleDownloadExcel = async ({ logo }) => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Expense Report', { properties: { tabColor: { argb: 'FF34449B' } } });

            // --- Add logo (top-left) if present
            if (logo) {
                try {
                    const base64Data = logo.split(',')[1] || logo;
                    if (base64Data && base64Data.length > 100) {
                        const extension = logo.includes('jpeg') || logo.includes('jpg') ? 'jpeg' : 'png';
                        const imageId = workbook.addImage({ base64: base64Data, extension });
                        sheet.addImage(imageId, {
                            tl: { col: 0, row: 0 },
                            ext: { width: 120, height: 80 }
                        });
                    }
                } catch (err) {
                    console.warn('Error adding logo to excel:', err);
                }
            }

            // --- Title row (merged)
            sheet.mergeCells('C1', 'I1');
            const titleCell = sheet.getCell('C1');
            titleCell.value = 'Expense Report';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FF34449B' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(1).height = 24;

            // --- Metadata (From Date, To Date, Client Name, Generated By/On)
            const metadataStartRow = 2;
            const metadata = [];
            if (selectedSections.date) {
                metadata.push(['From Date', formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : '-']);
                metadata.push(['To Date', formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : '-']);
            }
            metadata.push(['Client Name', formData.clientName || '-']);
            metadata.push(['Generated By', localStorage.getItem('userName') || 'System']);
            metadata.push(['Generated On', dayjs().format('DD-MM-YYYY HH:mm')]);

            metadata.forEach((m, i) => {
                const row = sheet.getRow(metadataStartRow + Math.floor(i / 2));
                const col = (i % 2) * 3 + 3; // place metadata in columns C/D and F/G etc
                row.getCell(col).value = m[0];
                row.getCell(col).font = { bold: true };
                row.getCell(col + 1).value = m[1];
            });

            // --- Headers from reportColumns (use same order)
            const headerRowIndex = 6;
            const headerRow = sheet.getRow(headerRowIndex);
            const headers = reportColumns.map((c) => c.header || '');
            headers.forEach((h, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = h;
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34449B' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
            headerRow.height = 20;

            // --- Data rows (match accessorKey order)
            rowData.forEach((item) => {
                const rowValues = reportColumns.map((col) => {
                    const key = col.accessorKey;
                    let val = key ? item[key] : '';
                    if (key?.toLowerCase().includes('date')) {
                        // pass as JS Date so Excel shows as date
                        const d = dayjs(val);
                        return d.isValid() ? d.toDate() : val || '-';
                    }
                    if (key?.toLowerCase().includes('amount')) {
                        // numeric value for excel cell
                        const num = Number(val || 0);
                        return isNaN(num) ? val : num;
                    }
                    return val ?? '';
                });

                const newRow = sheet.addRow(rowValues);

                // Style each cell based on column type
                newRow.eachCell((cell, colNumber) => {
                    const colDef = reportColumns[colNumber - 1];
                    const key = colDef?.accessorKey;

                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    if (key?.toLowerCase().includes('amount')) {
                        cell.alignment = { horizontal: 'right' };
                        cell.numFmt = '#,##0.00'; // show two decimals with comma separator
                    } else if (key?.toLowerCase().includes('date')) {
                        cell.alignment = { horizontal: 'center' };
                        // if cell.value is a Date, format it
                        if (cell.value instanceof Date) {
                            cell.numFmt = 'dd-mm-yyyy';
                        }
                    } else {
                        cell.alignment = { horizontal: 'left' };
                    }

                    // small font for data rows
                    cell.font = { size: 11 };
                });
            });

            // --- Column widths - make a reasonable default, can be tuned per column
            sheet.columns = reportColumns.map((col) => {
                const key = col.accessorKey || '';
                if (key.toLowerCase().includes('id')) return { width: 18 };
                if (key.toLowerCase().includes('date')) return { width: 14 };
                if (key.toLowerCase().includes('name')) return { width: 22 };
                if (key.toLowerCase().includes('description')) return { width: 32 };
                if (key.toLowerCase().includes('amount')) return { width: 14 };
                return { width: 18 };
            });

            // --- Write workbook and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Expense_Report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
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
                                    control={
                                        <Checkbox checked={selectedSections.expenseType} onChange={handleCheckboxChange} name="expenseType" color="secondary" />
                                    }
                                    label="Expense Type"
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
                        {selectedSections.expenseType && (
                            <div className="col-md-3 mb-3">
                                <Autocomplete
                                    options={['All', ...expenseTypeList.map((row) => row.listOfValues)]}
                                    value={formData.expenseType || null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({ ...prev, expenseType: newValue }));
                                            setFieldErrors((prev) => ({ ...prev, expenseType: '' }));
                                        } else {
                                            setFormData((prev) => ({ ...prev, expenseType: '' }));
                                            setFieldErrors((prev) => ({ ...prev, expenseType: 'Expense Type is required' }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    Expense Type
                                                </span>
                                            }
                                            size="small"
                                            error={!!fieldErrors.expenseType}
                                            helperText={fieldErrors.expenseType}
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {(selectedSections.date || selectedSections.clientName || selectedSections.expenseType) && (
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
                        Expense Report
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
                            fileName={'Expense Report'}
                            // sumFields={['tdsAmt', 'receivableAmount', 'arapSettled', 'arApOutstanding', 'onAccount']}
                            handleDownloadPdf={() =>
                                handleDownloadPdf({
                                    logo: listViewData[0]?.companyLogo,
                                    columns: reportColumns,
                                    data: rowData,
                                    formData,
                                    fileName: 'Expense Report',
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
                                <h6 style={{ margin: 0, textAlign: 'center' }}>Expense Details</h6>
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
                                        <ExpenseClaims selectedRow={fillGridData} />
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
export default ExpenseReport;

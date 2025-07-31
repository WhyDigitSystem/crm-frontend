import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { TextField, Checkbox, FormControlLabel, FormHelperText, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ClearIcon from '@mui/icons-material/Clear';
import ActionButton from 'utils/ActionButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { getAllActiveBranches } from 'utils/CommonFunctions';
import apiCalls from 'apicall';
import { TabContext } from '@mui/lab';
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Button, Chip, Stack } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { showToast } from 'utils/toast-component';
import CommonReportTable from 'utils/CommonReportTable';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}
function AllNominationEnquiries() {
    const [totalSums, setTotalSums] = useState({});
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);
    const [branchCodeList, setBranchCodeList] = useState([]);
    const [partyNameList, setPartyNameList] = useState([]);
    const [fillGridData, setFillGridData] = useState([]);
    const [listView, setListView] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('1');
    const [selectedSections, setSelectedSections] = useState({
        date: false,
        branchCode: false,
        customer: false
    });

    const [visibleSections, setVisibleSections] = useState({
        date: false,
        branchCode: false,
        customer: false
    });
    const [listViewData, setListViewData] = useState([]);
    const getCompanyDetails = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/company/${orgId}`);
            console.log('API Response:', response);
            setListViewData(response.paramObjectsMap.companyVO.reverse());
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedSections((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    };
    const handleCloseModal = () => {
        setModalOpen(false);
    };
    const handleModal = () => {
        setOpen(false);
    };
    const [formData, setFormData] = useState({
        fromDate: null,
        toDate: null,
        // dateRange: [null, null],
        branchCode: 'All',
        customer: 'All',
        customerCode: 'All'
    });
    const [fieldErrors, setFieldErrors] = useState({
        fromDate: '',
        toDate: '',
        branchCode: '',
        customer: '',
        customerCode: ''
    });
    const handleClear = () => {
        setListView(false);
        // setVisibleSections({
        //   date: false,
        //   branchCode: false,
        //   customer: false,
        // });
        // setSelectedSections({
        //   date: false,
        //   branchCode: false,
        //   customer: false,
        // });
        setFormData({
            // dateRange: [null, null],
            fromDate: null,
            toDate: null,
            branchCode: 'All',
            customer: 'All',
            customerCode: 'All'
        });
        setFieldErrors({
            fromDate: '',
            toDate: '',
            customer: '',
            customerCode: '',
            branchCode: ''
        });
        setRowData([]);
    };
    const handleSelectPartyChange = (e) => {
        const value = e.target.value;
        console.log('Selected employeeCode value:', value);
        const selectedEmp = partyNameList.find((emp) => emp.partyName === value);
        if (value === 'All') {
            setFormData((prevData) => ({
                ...prevData,
                customer: 'All'
            }));
        } else {
            if (selectedEmp) {
                console.log('Selected party:', selectedEmp);
                setFormData((prevData) => ({
                    ...prevData,
                    customer: selectedEmp.partyName,
                    customerCode: selectedEmp.partyCode
                }));
            } else {
                console.log('No party found with the given code:', value);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, selectionStart, selectionEnd } = e.target;

        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ''
        }));

        if (name === 'branchCode') {
            if (value === 'All') {
                setFormData((prevData) => ({
                    ...prevData,
                    branchCode: 'All'
                }));
            } else {
                const selectedBranch = branchCodeList.find((br) => br.branchCode === value);
                setFormData((prevData) => ({
                    ...prevData,
                    branchCode: selectedBranch ? selectedBranch.branchCode : ''
                }));
            }
        } else {
            let inputValue = value;
            if (type === 'text' || type === 'textarea') {
                inputValue = value.toUpperCase();
            }
            setFormData((prevData) => ({ ...prevData, [name]: inputValue }));

            setTimeout(() => {
                const inputElement = document.getElementsByName(name)[0];
                if (inputElement && inputElement.setSelectionRange) {
                    inputElement.setSelectionRange(selectionStart, selectionEnd);
                }
            }, 0);
        }
    };
    // const handleDateChange = (newValue) => {
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     dateRange: newValue,
    //   }));
    //   console.log("date range",formData.dateRange);

    // };
    const handleDateChange = (field, date) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
        setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
    };
    useEffect(() => {
        getAllBranches();
        getPartyName();
        getCompanyDetails();
    }, []);

    const getAllBranches = async () => {
        try {
            const branchData = await getAllActiveBranches(orgId);
            setBranchCodeList(branchData);
        } catch (error) {
            console.error('Error fetching country data:', error);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };
    const getPartyName = async () => {
        try {
            const response = await apiCalls('get', `/taxInvoice/getPartyNameByPartyType?orgId=${orgId}&partyType=customer`);
            setPartyNameList(response.paramObjectsMap.partyMasterVO);
        } catch (error) {
            console.error('Error fetching gate passes:', error);
        }
    };
    const reportColumns = [
        { accessorKey: 'JobOrderNo', header: 'Origin', size: 100 },
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
                            color: 'crimson',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s, text-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = 'red';
                            // e.target.style.textShadow = '0 0 2px rgba(255, 0, 0, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = 'crimson';
                            e.target.style.textShadow = 'none';
                        }}
                    >
                        {docId}
                    </a>
                );
            }
        },
        { accessorKey: 'docDate', header: 'Partner Name', size: 100 },
        // { accessorKey: 'screenCode', header: 'Screen', size: 100 },
        { accessorKey: 'Vid', header: '# Invoice', size: 100 },
        { accessorKey: 'Vdate', header: 'Date', size: 100 },
        { accessorKey: 'BillToParty', header: 'Customer', size: 140 },
        {
            accessorKey: 'BillAmount',
            header: 'Amount',
            size: 80,
            Cell: ({ cell }) => (
                <div style={{ textAlign: 'right', width: '100%' }}>
                    {cell.getValue() !== undefined && cell.getValue() !== null ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}
                </div>
            ),
            muiTableHeadCellProps: {
                align: 'right'
            }
        },
        {
            accessorKey: 'TotalTaxAmountLC',
            header: 'TAX',
            size: 80,
            Cell: ({ cell }) => (
                <div style={{ textAlign: 'right', width: '100%' }}>
                    {cell.getValue() !== undefined && cell.getValue() !== null ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}
                </div>
            )
        },
        {
            accessorKey: 'TotalInvAmountLC',
            header: 'Total',
            size: 80,
            Cell: ({ cell }) => (
                <div style={{ textAlign: 'right', width: '100%' }}>
                    {cell.getValue() !== undefined && cell.getValue() !== null ? Number(cell.getValue()).toLocaleString('en-IN') : '-'}
                </div>
            )
        }
    ];
    const handleGo = async () => {
        const errors = {};
        // if (!formData.partyName) {
        //   errors.partyName = 'Sub ledger name is required';
        // }
        // if (!formData.branchCode) {
        //   errors.branchCode = 'Branch Code is required';
        // }

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            setListView(false);
            try {
                let response;
                if (formData.fromDate && formData.toDate) {
                    response = await apiCalls(
                        'get',
                        `/taxInvoice/getReportDetailsForSalesRegister?finYear=${finYear}&branchCode=${formData.branchCode}&fromDate=${formData.fromDate}&orgId=${orgId}&partyCode=${formData.customerCode}&toDate=${formData.toDate}`
                    );
                } else {
                    response = await apiCalls(
                        'get',
                        `/taxInvoice/getReportDetailsForSalesRegister?finYear=${finYear}&branchCode=${formData.branchCode}&orgId=${orgId}&partyCode=${formData.customerCode}`
                    );
                }
                if (response.status === true) {
                    console.log('Response:', response);
                    setRowData(response.paramObjectsMap.taxInvoiceVO);
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
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const handleDocClick = async (docId, screenCode) => {
        setModalOpen(true);
        try {
            let response;
            if (screenCode === 'TI') {
                response = await apiCalls('get', `/taxInvoice/getTaxInvoiceByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
            } else {
                response = await apiCalls('get', `/taxInvoice/getCreditNoteByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
            }

            if (response.status === true) {
                // const dataKey = screenCode === 'TI' ? 'taxIn
                {
                    screenCode === 'TI'
                        ? setFillGridData(response.paramObjectsMap.taxInvoiceVO)
                        : setFillGridData(response.paramObjectsMap.irnCreditNoteVO);
                }
            } else {
                console.error('API Error:', response);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // pdf Download
    const handleDownloadPdf = ({ logo, columns, data, fileName = 'Sales Register', loginUserName, formData }) => {
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
        const boxH = 10;
        const yTitle = 25;

        doc
            .setFillColor('#e7ebeb')
            .roundedRect(boxX, yTitle - boxH + 3, boxW, boxH, 4, 4, 'F')
            .setTextColor('#34449B')
            .setFontSize(12)
            .text(title, pageW / 2, yTitle, { align: 'center' });

        // 3) FOOTER
        doc.setFontSize(8).setTextColor('#555555');
        doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
        doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });

        // 4) FILTER METADATA
        const { fromDate, toDate, branchCode, customer } = formData;

        doc.setFontSize(9);
        doc.setTextColor('#000000');
        doc.setFillColor(231, 235, 235);
        doc.roundedRect(2, 35, 292, 12, 2, 2, 'F');

        doc.setFont(undefined, 'bold');
        doc.text('From Date', 8, 40);
        doc.text('To Date', 32, 40);
        doc.text('Branch Code', 56, 40);
        doc.text('Customer', 90, 40);

        doc.setFont(undefined, 'normal');
        doc.text(dayjs(fromDate).format('DD-MM-YYYY'), 8, 45);
        doc.text(dayjs(toDate).format('DD-MM-YYYY'), 32, 45);
        doc.text(branchCode || '-', 56, 45);
        doc.text(customer || '-', 90, 45);

        // 5) TABLE HEADERS
        const headerLabels = columns.map((c) => c.header);
        const numericFields = columns
            .map((c) => c.accessorKey)
            .filter((k) => k && /(LcAmount|TotalTaxAmountBC|TotalInvAmountLC|Amount|Tax|Total)/i.test(k));

        // 6) TABLE BODY
        const body = data.map((row) =>
            columns.map((col) => {
                const key = col.accessorKey;
                const raw = key ? row[key] : '';
                if (key?.toLowerCase().includes('date')) {
                    const d = dayjs(raw);
                    return d.isValid() ? d.format('DD-MM-YYYY') : '-';
                }
                if (typeof raw === 'number') {
                    return raw === 0 ? '' : raw.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                }
                return raw ?? '';
            })
        );

        // 7) TOTAL ROW for last 3 columns
        const totalFields = ['BillAmount', 'TotalTaxAmountLC', 'TotalInvAmountLC'];
        const totals = totalFields.map((key) => data.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0));

        const totalRow = columns.map((col, idx) => {
            const key = col.accessorKey;
            if (idx === 0) return 'Total';
            if (totalFields.includes(key)) {
                const index = totalFields.indexOf(key);
                return totals[index].toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            return '';
        });

        body.push(totalRow);

        // 8) CUSTOM COLUMN WIDTHS
        const columnStyles = {
            0: { cellWidth: 27 }, // Origin
            1: { cellWidth: 26 }, // Doc Id
            2: { cellWidth: 25 }, // Partner Name
            3: { cellWidth: 23 }, // Invoice
            4: { cellWidth: 25 }, // Date
            5: { cellWidth: 50 }, // Customer
            6: { cellWidth: 25 }, // Amount
            7: { cellWidth: 25 }, // Tax
            8: { cellWidth: 25 } // Total
        };

        // 9) RENDER TABLE
        autoTable(doc, {
            startY: 50,
            head: [headerLabels],
            body,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                lineWidth: 0.1,
                lineColor: [220, 220, 220],
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [52, 68, 155],
                textColor: 255,
                halign: 'center'
            },
            bodyStyles: {
                halign: 'left'
            },
            theme: 'grid',
            margin: { left: 5, right: 5 },
            tableWidth: 'auto',
            columnStyles: columnStyles,
            didDrawPage: () => {
                doc.setFontSize(8).setTextColor('#555555');
                doc.text(`Generated On: ${dayjs().format('DD-MM-YYYY hh:mm A')}`, pageW - 15, pageH - 10, { align: 'right' });
                doc.text(`Generated By: ${loginUserName}`, 15, pageH - 10, { align: 'left' });
            },
            didParseCell: (cellHookData) => {
                const { cell, column, section, row } = cellHookData;
                const key = columns[column.index]?.accessorKey;

                if (section === 'body' && numericFields.includes(key)) {
                    cell.styles.halign = 'right';
                }

                // Highlight last row (total)
                if (section === 'body' && row.index === body.length - 1) {
                    cell.styles.fontStyle = 'bold';
                    cell.styles.textColor = [0, 0, 0];
                    cell.styles.fillColor = [240, 240, 240];
                }
            }
        });

        // 10) SAVE
        doc.save(`${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
    };

    //
    // Excel Download
    const handleDownloadExcel = async ({ logo }) => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Sales Register');
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
            titleCell.value = 'SALES REGISTER';
            titleCell.font = { size: 18, bold: true, color: { argb: 'FF34449B' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // ====== METADATA ======
            const metadata = [
                { label: 'From Date', value: formData.fromDate ? dayjs(formData.fromDate).format('DD-MM-YYYY') : 'N/A' },
                { label: 'To Date', value: formData.toDate ? dayjs(formData.toDate).format('DD-MM-YYYY') : 'N/A' },
                { label: 'Branch Code', value: formData.branchCode !== 'All' ? formData.branchCode : 'All' },
                { label: 'Customer', value: formData.customer },
                { label: 'Generated By', value: localStorage.getItem('userName') || 'System' },
                { label: 'Generated On', value: dayjs().format('DD-MM-YYYY HH:mm') }
            ];

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
            const headers = ['Origin', 'ID', 'Partner Name', '#Invoice', 'Date', 'Customer', 'Amount', 'Tax', 'Total'];
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

            // ====== DATA ROWS ======
            let totalLcAmount = 0;
            let totalTaxAmount = 0;
            let totalInvAmount = 0;

            rowData.forEach((item) => {
                const lcAmt = parseFloat(item.LcAmount || 0);
                const taxAmt = parseFloat(item.TotalTaxAmountBC || 0);
                const invAmt = parseFloat(item.TotalInvAmountLC || 0);

                totalLcAmount += lcAmt;
                totalTaxAmount += taxAmt;
                totalInvAmount += invAmt;

                const row = sheet.addRow([
                    item.JobOrderNo || '',
                    item.docId || '-',
                    item.docDate ? dayjs(item.docDate).format('DD-MM-YYYY') : '-',
                    item.Vid,
                    item.Vdate ? dayjs(item.Vdate).format('DD-MM-YYYY') : '-',
                    item.BillToParty,
                    lcAmt,
                    taxAmt,
                    invAmt
                ]);

                [7, 8, 9].forEach((colIndex) => {
                    const cell = row.getCell(colIndex);
                    if (typeof cell.value === 'number') {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                    }
                });

                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });
            });

            // ====== TOTAL ROW ======
            const totalRow = sheet.addRow(['Total', '', '', '', '', '', totalLcAmount, totalTaxAmount, totalInvAmount]);

            totalRow.eachCell((cell, colNumber) => {
                cell.font = { bold: true };
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if ([7, 8, 9].includes(colNumber)) {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                } else {
                    cell.alignment = { horizontal: 'left' };
                }
            });

            // ====== COLUMN WIDTHS ======
            sheet.columns = [
                { width: 15 }, // Origin
                { width: 15 }, // Doc ID
                { width: 15 }, // Partner Name
                { width: 15 }, // Invoice
                { width: 15 }, // Date
                { width: 30 }, // Customer
                { width: 15 }, // Amount
                { width: 15 }, // Tax
                { width: 20 } // Total
            ];

            // ====== EXPORT ======
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            //   saveAs(blob, `Sales_Register_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
        } catch (error) {
            console.error('Error generating Excel:', error);
            showToast('error', 'Failed to generate Excel file');
        }
    };

    return (
        <>
            <div className="card w-full bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
                <>
                    <div className="row">
                        <div className="row">

                            <div className="col-md-3 mb-1">
                                <FormControlLabel
                                    control={
                                        <Checkbox checked={selectedSections.customer} onChange={handleCheckboxChange} name="customer" color="secondary" />
                                    }
                                    label="Nomination Enquiries"
                                />
                            </div>
                        </div>

                        {selectedSections.customer && (
                            <>
                                {/* Freight Type */}
                                <div className="col-md-3 mb-2">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.customer}>
                                        <InputLabel id="customer-label">Freight Type</InputLabel>
                                        <Select
                                            labelId="customer-label"
                                            label="Freight Type"
                                            value={formData.customer}
                                            onChange={handleSelectPartyChange}
                                            name="customer"
                                        >
                                            <MenuItem value="All">All Freight Types</MenuItem>

                                            {partyNameList?.map((row) => (
                                                <MenuItem key={row.id} value={row.partyName}>
                                                    {row.partyName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.customer && <FormHelperText>{fieldErrors.customer}</FormHelperText>}
                                    </FormControl>
                                </div>

                                {/* Freight Type */}
                                <div className="col-md-3 mb-2">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.customer}>
                                        <InputLabel id="customer-label">Trade Type</InputLabel>
                                        <Select
                                            labelId="customer-label"
                                            label="Trade Type"
                                            value={formData.customer}
                                            onChange={handleSelectPartyChange}
                                            name="customer"
                                        >
                                            <MenuItem value="All">All Trade Types</MenuItem>

                                            {partyNameList?.map((row) => (
                                                <MenuItem key={row.id} value={row.partyName}>
                                                    {row.partyName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.customer && <FormHelperText>{fieldErrors.customer}</FormHelperText>}
                                    </FormControl>
                                </div>

                                {/* Origin Port  */}
                                <div className="col-md-3 mb-2">
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Origin Port"
                                        name="invoiceNumber"
                                        variant="outlined"
                                        value={formData.invoiceNumber || ''}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.invoiceNumber}
                                        helperText={fieldErrors.invoiceNumber}
                                    />
                                </div>

                                {/* Partner Name  */}
                                <div className="col-md-3 mb-2">
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Partner Name"
                                        name="invoiceNumber"
                                        variant="outlined"
                                        value={formData.invoiceNumber || ''}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.invoiceNumber}
                                        helperText={fieldErrors.invoiceNumber}
                                    />
                                </div>

                                {/* Enquiry Direction */}
                                <div className="col-md-3 mb-2 mt-2">
                                    <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.customer}>
                                        <InputLabel id="customer-label">Enquiry Direction</InputLabel>
                                        <Select
                                            labelId="customer-label"
                                            label="Enquiry Direction"
                                            value={formData.customer}
                                            onChange={handleSelectPartyChange}
                                            name="customer"
                                        >
                                            <MenuItem value="All">All Enquiry Direction</MenuItem>

                                            {partyNameList?.map((row) => (
                                                <MenuItem key={row.id} value={row.partyName}>
                                                    {row.partyName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.customer && <FormHelperText>{fieldErrors.customer}</FormHelperText>}
                                    </FormControl>
                                </div>

                            </>
                        )}
                        {(selectedSections.date || selectedSections.branchCode || selectedSections.customer) && (
                            <div className="col-md-3 mb-2 mt-2">
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
                {listView && (
                    <div>
                        <CommonReportTable
                            data={rowData}
                            columns={reportColumns}
                            isListView={listView}
                            fileName={'Sales Register'}
                            sumFields={['TotalInvAmountLC', 'TotalTaxAmountLC', 'BillAmount']}
                            handleDownloadPdf={() =>
                                handleDownloadPdf({
                                    logo: listViewData[0]?.companyLogo,
                                    columns: reportColumns,
                                    data: rowData,
                                    formData,
                                    fileName: 'Sales Register',
                                    loginUserName
                                })
                            }
                            handleDownloadExcel={() => handleDownloadExcel({ logo: listViewData[0]?.companyLogo })}
                        />
                    </div>
                )}
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
                        <DialogContent className="pb-0">
                            <div className="row mb-2 mb-1">
                                <div className="col-md-3 mb-1">
                                    <strong>ID:</strong> {fillGridData.docId}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Partner Name:</strong> {fillGridData.docDate ? dayjs(fillGridData.docDate).format('DD-MM-YYYY') : ''}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Direction:</strong> {fillGridData.vid}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Trade:</strong> {fillGridData.vdate ? dayjs(fillGridData.vdate).format('DD-MM-YYYY') : ''}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Shipper:</strong> {fillGridData.partyName}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Origin:</strong> {fillGridData.jobOrderNo}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Destination:</strong> {fillGridData.recipientGSTIN}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Freight:</strong> {fillGridData.gstType}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Sales:</strong> ₹{Number(fillGridData.totalChargeAmountLc || 0).toLocaleString('en-IN')}
                                </div>
                                <div className="col-md-3 mb-1">
                                    <strong>Date:</strong> ₹{Number(fillGridData.totalTaxAmountLc || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="card w-full p-6 bg-base-100 shadow-xl mb-3">
                                <Box sx={{ width: '100%', typography: 'body1' }}>
                                    <TabContext value={value}>
                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                            <TabList onChange={handleChange} textColor="secondary" indicatorColor="secondary" aria-label="lab API tabs example">
                                                <Tab label="Charge Particulars" value="1" />
                                                {/* {fillGridData.taxInvoiceAnnexureVO.length > 0 && <Tab label="Annexure" value="2" />} */}
                                                <Tab label="Gst" value="2" />
                                            </TabList>
                                        </Box>
                                        <TabPanel value="1">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#673AB7' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="table-header">Charge Type</th>
                                                                    <th className="table-header">Charge Code</th>
                                                                    <th className="table-header">SAC Code</th>
                                                                    <th className="table-header">ledger</th>
                                                                    <th className="table-header">Charge Name</th>
                                                                    <th className="table-header">Qty</th>
                                                                    <th className="table-header">Rate</th>
                                                                    <th className="table-header">Currency</th>
                                                                    <th className="table-header">Ex Rate</th>
                                                                    <th className="table-header">GST Percent</th>
                                                                    <th className="table-header">GST Amount</th>
                                                                    <th className="table-header">FC Amount</th>
                                                                    <th className="table-header">LC Amount</th>
                                                                    <th className="table-header">Bill Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {fillGridData.taxInvoiceDetailsVO && fillGridData.taxInvoiceDetailsVO.length > 0
                                                                    ? fillGridData.taxInvoiceDetailsVO.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="text-center">{index + 1}</td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeType || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.govChargeCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.ledger || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeName || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.qty || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.rate || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.currency || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.exRate || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstpercent || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.fcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.lcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.billAmount || 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                    : fillGridData.irnCreditNoteDetailsVO?.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="text-center">{index + 1}</td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeType || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.govChargeCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.ledger || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.chargeName || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.qty || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.rate || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.currency || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.exRate || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstpercent || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.fcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.lcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.billAmount || 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabPanel>
                                        <TabPanel value="2">
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr style={{ backgroundColor: '#673AB7' }}>
                                                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                                                        S.No
                                                                    </th>
                                                                    <th className="table-header">GST Charge Acc</th>
                                                                    <th className="table-header">GST Subledger Code</th>
                                                                    <th className="table-header">GST Db BillAmount</th>
                                                                    <th className="table-header">GST Cr Bill Amount</th>
                                                                    <th className="table-header">GST Db Lc Amount</th>
                                                                    <th className="table-header">GST Cr Lc Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {fillGridData.irnCreditNoteGstVO && fillGridData.irnCreditNoteGstVO.length > 0
                                                                    ? fillGridData.irnCreditNoteGstVO.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="text-center">{index + 1}</td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstChargeAcc || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstSubledgerCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstDbBillAmount || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstCrBillAmount || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstDbLcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstCrLcAmount || 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                    : fillGridData.taxInvoiceGstVO?.map((row, index) => (
                                                                        <tr key={row.id}>
                                                                            <td className="text-center">{index + 1}</td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstChargeAcc || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstSubledgerCode || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstDbBillAmount || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstCrBillAmount || ''}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstDbLcAmount || 0}
                                                                            </td>
                                                                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                                                                {row.gstCrLcAmount || 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabPanel>
                                    </TabContext>
                                </Box>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            </div>
        </>
    );
}

export default AllNominationEnquiries;

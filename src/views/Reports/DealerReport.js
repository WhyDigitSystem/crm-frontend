import React from 'react';
import { TextField, Checkbox, FormControlLabel, FormControl } from '@mui/material';
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
import Dealer from 'views/Dealers/Dealers';
function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}
function DealerReport() {
    const [listViewData, setListViewData] = useState([]);
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [isLoading, setIsLoading] = useState(false);
    const [dealerNameList, setDealerNameList] = useState([]);
    const [fillGridData, setFillGridData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [listView, setListView] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [selectedSections, setSelectedSections] = useState({
        date: false,
        dealerName: false
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
        dealerName: 'All',
    });
    const [fieldErrors, setFieldErrors] = useState({
        fromDate: '',
        toDate: '',
        dealerName: '',
    });
    const handleClear = () => {
        setListView(false);
        setFormData({
            fromDate: null,
            toDate: null,
            dealerName: 'All',
        });
        setFieldErrors({
            fromDate: '',
            toDate: '',
            dealerName: ''
        });
        setRowData([]);
    };
    const handleDateChange = (field, date) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD') || null;
        setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
    };
    useEffect(() => {
        getDealerName();
        getCompanyDetails();
    }, []);
    const getDealerName = async () => {
        try {
            const response = await apiCalls('get', `/dealer/getDealerName?orgId=${orgId}`);
            setDealerNameList(response.paramObjectsMap.dealerNameDetails || []);
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
                            e.target.style.color = '#fbbf24'; // Brighter yellow on hover
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
        { accessorKey: 'docDate', header: 'Date', size: 100 },
        { accessorKey: 'dealerName', header: 'Dealer', size: 100 },
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
                let response;
                if (formData.fromDate && formData.toDate) {
                    response = await apiCalls(
                        'get',
                        `/dealer/getDealerReport?dealerName=${formData.dealerName}&finYear=${finYear}&orgId=${orgId}&fromDate=${formData.fromDate}&toDate=${formData.toDate}`
                    );
                } else {
                    response = await apiCalls(
                        'get',
                        `/dealer/getDealerReport?dealerName=${formData.dealerName}&finYear=${finYear}&orgId=${orgId}`
                    );
                }
                if (response.status === true) {
                    console.log('Response:', response);
                    setRowData(response.paramObjectsMap.dealerDetails || []);
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
            const response = await apiCalls('get', `/dealer/getDealerByDocIdandScreenCode?docId=${docId}&ScreenCode=${screenCode}`);
            if (response.status === true) {
                setFillGridData(response.paramObjectsMap.dealerVO);
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
        const logoBase64 = logo;
        const logoWidth = 30;
        const logoHeight = 23;
        const logoX = 10;
        const logoY = 10;
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        }

        // 2) TITLE BOX
        const title = `${fileName}`;
        const textW = doc.getTextWidth(title);
        const padX = 10,
            boxH = 10,
            yTitle = 25;
        const boxW = textW + padX * 2;
        const boxX = (pageW - boxW) / 2;

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
        const { fromDate, toDate, dealerName } = formData;
        doc.setFontSize(9);
        doc.setTextColor('#000000');
        doc.setFillColor(231, 235, 235);
        doc.roundedRect(2, 35, 292, 12, 2, 2, 'F');

        doc.setFont(undefined, 'bold');

        let xPos = 8; // start X position for first label

        if (selectedSections.date) {
            doc.text('From Date', xPos, 40);
            doc.setFont(undefined, 'normal');
            doc.text(dayjs(fromDate).format('DD-MM-YYYY'), xPos, 45);
            xPos += 24;
            doc.setFont(undefined, 'bold');
            doc.text('To Date', xPos, 40);
            doc.setFont(undefined, 'normal');
            doc.text(dayjs(toDate).format('DD-MM-YYYY'), xPos, 45);
            xPos += 24;
        }
        doc.setFont(undefined, 'bold');
        // doc.text('Branch', xPos, 40);
        doc.text('Dealer', xPos, 40);

        doc.setFont(undefined, 'normal');

        // xPos = 8; 
        // doc.text(branch || '', xPos, 45);
        doc.text(dealerName || '', xPos, 45);

        // 5) Table Header & Body
        const headerLabels = columns.map((c) => c.header);

        const body = data.map((row) =>
            columns.map((col) => {
                const key = col.accessorKey;
                const raw = key ? row[key] : '';
                if (key?.toLowerCase().includes('date')) {
                    const d = dayjs(raw);
                    return d.isValid() ? d.format('DD-MM-YYYY') : '-';
                }
                if (typeof raw === 'number') {
                    return raw === 0 ? '' : raw.toLocaleString('en-IN');
                }
                return raw ?? '';
            })
        );

        // 6) Define Column Widths (should match your table structure)
        const columnStyles = {
            0: { cellWidth: 25 }, // Doc
            1: { cellWidth: 20 }, // Date
            2: { cellWidth: 35 }, // Customer
            3: { cellWidth: 20 }, // Pro
            4: { cellWidth: 20 }, // Task Name 
            5: { cellWidth: 20 }, // Start time
            6: { cellWidth: 20 }, // End Time
            7: { cellWidth: 20 }, // Dealer
            8: { cellWidth: 40 }, // assn name
        };

        // 7) Draw Table
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

                // if (section === 'body') {
                //   cell.styles.halign = 'right';
                // }
            }
        });

        // 8) Save File
        doc.save(`${fileName}_${dayjs().format('YYYY_MM_DD_HHmmss')}.pdf`);
    };
    // excel download
    const handleDownloadExcel = async ({ logo }) => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Dealer Report');
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
            titleCell.value = 'Dealer Report';
            titleCell.font = { size: 18, bold: true, color: { argb: 'FF34449B' } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // ====== METADATA ======
            const metadata = [];
            if (selectedSections.date) {
                metadata.push({ label: 'From Date', value: dayjs(formData.fromDate).format('DD-MM-YYYY') });
                metadata.push({ label: 'To Date', value: dayjs(formData.toDate).format('DD-MM-YYYY') });
            }
            // metadata.push({ label: 'Branch', value: formData.branch !== 'All' ? formData.branch : 'All' });
            metadata.push({ label: 'Dealer', value: formData.dealerName });
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
            const headerRowIndex = 6;
            const headerRow = sheet.getRow(headerRowIndex);
            const headers = [
                'Doc Id',
                'Date',
                'Dealer',
                'Dealer Type',
                'Manager',
                'Contact Person',
                'Mobile No',
                'Place',
                'Address',
                'Reg No',
                'DOB'
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
                    item.dealerName || '-',
                    item.dealerType || '-',
                    item.manger || '-',
                    item.contactPerson || '-',
                    item.mobileNumber || '-',
                    item.palce || '-',
                    item.address || '-',
                    item.gst || '-',
                    item.dateOfBirth ? dayjs(item.dateOfBirth).format('DD-MM-YYYY') : '-',
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
                { width: 25 },
                { width: 25 }
            ];

            // ====== EXPORT ======
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            saveAs(blob, `Dealer_Report_${dayjs().format('YYYY_MM_DD_HHmmss')}.xlsx`);
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
                                    style={{ color: 'white' }}
                                />
                            </div>
                            <div className="col-md-2 mb-1">
                                <FormControlLabel
                                    control={
                                        <Checkbox checked={selectedSections.dealerName} onChange={handleCheckboxChange} name="dealerName" color="secondary" />
                                    }
                                    label="Dealer"
                                    style={{ color: 'white' }}
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
                        {selectedSections.dealerName && (
                            <div className="col-md-3 mb-3">
                                {/* <Autocomplete
                  options={['All', ...dealerNameList.map((row) => row.dealerName)]} */}
                                <Autocomplete
                                    options={['All', ...(dealerNameList ? dealerNameList.map((row) => row.dealerName) : [])]}
                                    value={formData.dealerName || null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                dealerName: newValue
                                            }));
                                            setFieldErrors((prev) => ({ ...prev, dealerName: '' }));
                                        } else {
                                            setFormData((prev) => ({ ...prev, dealerName: '' }));
                                            setFieldErrors((prev) => ({ ...prev, dealerName: 'Dealer is required' }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                <span>
                                                    Dealer
                                                </span>
                                            }
                                            size="small"
                                            error={!!fieldErrors.dealerName}
                                            helperText={fieldErrors.dealerName}
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {(selectedSections.date || selectedSections.dealerName) && (
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
                        Dealer Report
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
                            fileName={'Dealer Report'}
                            sumFields={['tdsAmt', 'receivableAmount', 'arapSettled', 'arApOutstanding', 'onAccount']}
                            handleDownloadPdf={() =>
                                handleDownloadPdf({
                                    logo: listViewData[0]?.companyLogo,
                                    columns: reportColumns,
                                    data: rowData,
                                    formData,
                                    fileName: 'Dealer Report',
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
                                        <Dealer selectedRow={fillGridData} />
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
export default DealerReport;
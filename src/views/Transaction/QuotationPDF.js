// QuotationPDF.js
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import apiCalls from 'apicall';

const dummyImageURL = 'https://t3.ftcdn.net/jpg/04/62/93/66/240_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg';

const safeText = (value) => (value ? String(value) : '-');

const QuotationPDF = ({ row, modalClose, companyDetails }) => {
  const [open, setOpen] = useState(false);
  //   const [companyDetails, setCompanyDetails] = useState([]);
  const [orgId] = useState(localStorage.getItem('orgId'));
  //   const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    if (row && companyDetails?.companyName) {
      setTimeout(() => {
        handleDownloadPdf();
        modalClose();
      }, 500);
    }
  }, [row, companyDetails]);

  //   useEffect(() => {
  //     // if (row?.status === 'APPROVED' || row?.status === 'REJECTED') {
  //     if (row?.status) {
  //       setOpen(true);
  //       getCompanyDetails();
  //     } else {
  //       setOpen(false);
  //     }

  //     const now = new Date();
  //     const formattedDate = now.toLocaleDateString('en-GB');
  //     const formattedTime = now.toLocaleTimeString('en-GB');
  //     setCurrentDateTime(`${formattedDate} ${formattedTime}`);
  //   }, [row]);

  //   const getCompanyDetails = async () => {
  //     try {
  //       const response = await apiCalls('get', `commonmaster/company/${orgId}`);
  //       if (response.status === true) {
  //         setCompanyDetails(response.paramObjectsMap.companyVO[0]);
  //       } else {
  //         console.error('API Error:', response);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching company details:', error);
  //     }
  //   };

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const blue = [37, 99, 235];
    const gray = [243, 244, 246];

    pdf.setFont('Poppins', 'normal');

    // --- HEADER ---
    const logo = companyDetails?.companyLogo ? `data:image/jpeg;base64,${companyDetails.companyLogo}` : dummyImageURL;

    const headerTop = 10;
    const logoWidth = 22;

    // Add logo (sync mode)
    try {
      pdf.addImage(logo, 'JPEG', margin, headerTop, logoWidth, logoWidth * 0.8);
    } catch (e) {
      console.warn('Logo render skipped:', e);
    }

    pdf.setFont('Poppins', 'bold');
    pdf.setFontSize(14);
    pdf.text(safeText(localStorage.getItem('companyName') || 'Company Name'), pageWidth / 2, headerTop + 6, { align: 'center' });

    pdf.setFont('Poppins', 'normal');
    pdf.setFontSize(9);
    let lineY = headerTop + 11;

    if (companyDetails?.cin) {
      pdf.text(`CIN: ${safeText(companyDetails.cin)}`, pageWidth / 2, lineY, { align: 'center' });
      lineY += 4;
    }
    if (companyDetails?.gst) {
      pdf.text(`GSTIN: ${safeText(companyDetails.gst)}`, pageWidth / 2, lineY, { align: 'center' });
      lineY += 4;
    }
    if (companyDetails?.address) {
      pdf.text(safeText(companyDetails.address), pageWidth / 2, lineY, {
        align: 'center',
        maxWidth: 160
      });
      lineY += 4;
    }
    if (companyDetails?.city) {
      pdf.text(`${safeText(companyDetails.city)} - ${safeText(companyDetails.zip)}`, pageWidth / 2, lineY, { align: 'center' });
      lineY += 6;
    }

    pdf.setFont('Poppins', 'bold');
    pdf.setTextColor(blue[0], blue[1], blue[2]);
    pdf.setFontSize(15);
    pdf.text('QUOTATION', pageWidth / 2, lineY + 3, { align: 'center' });

    pdf.setDrawColor(blue[0], blue[1], blue[2]);
    pdf.setLineWidth(0.4);
    pdf.line(margin, lineY + 5, pageWidth - margin, lineY + 5);

    let currentY = lineY + 12;

    // --- CLIENT + QUOTATION INFO ---
    const leftX = margin;
    const rightX = pageWidth / 2 + 10;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    pdf.setFillColor(230, 240, 255); // light blue background
    pdf.rect(leftX, currentY - 5, 30, 6, 'F');
    pdf.rect(rightX, currentY - 5, 35, 6, 'F');
    pdf.setTextColor(37, 99, 235);
    pdf.setFont('Poppins', 'bold');
    pdf.text('Client Details', leftX + 2, currentY - 1);
    pdf.text('Quotation Details', rightX + 2, currentY - 1);
    pdf.setTextColor(0, 0, 0);
    currentY += 6;

    pdf.setFontSize(10);
    pdf.setFont('Poppins', 'normal');

    const clientDetails = [
      ['Client Name', safeText(row.clientName)],
      ['Branch', safeText(row.branchName)],
      ['Contact', safeText(row.contactName)],
      ['Email', safeText(row.email)],
      ['Mobile No', safeText(row.mobileNumber)],
      ['GST No', safeText(row.gstNo)],
      ['Address', safeText(row.address)]
    ];

    const quotationDetails = [
      ['Quotation No', safeText(row.docId)],
      ['Date', dayjs(row.docDate).isValid() ? dayjs(row.docDate).format('DD-MM-YYYY') : '-'],
      ['Opportunity ID', safeText(row.oppurtunityId)],
      ['Iteration', safeText(row.iterations)]
    ];

    const lineHeight = 6;
    let yLeft = currentY;
    clientDetails.forEach(([label, value]) => {
      pdf.setFont('Poppins', 'bold');
      pdf.text(`${label}:`, leftX, yLeft);
      //   pdf.setFont('Poppins', 'normal');
      pdf.setFont('Poppins', 'normal');
      const wrappedValue = pdf.splitTextToSize(value, 70);
      pdf.text(wrappedValue, leftX + 35, yLeft);
      yLeft += lineHeight * wrappedValue.length;
      //   yLeft += lineHeight;

      //   pdf.text(value, leftX + 35, yLeft, { maxWidth: 70 });
    });

    let yRight = currentY;
    quotationDetails.forEach(([label, value]) => {
      pdf.setFont('Poppins', 'bold');
      pdf.text(`${label}:`, rightX, yRight);
      pdf.setFont('Poppins', 'normal');
      pdf.text(value, rightX + 35, yRight);
      yRight += lineHeight;
    });

    // --- PRODUCT TABLE ---
    const tableStartY = Math.max(yLeft, yRight) + 4;
    const tableHeaders = ['#', 'Product', 'Category', 'Sub Category', 'Qty', 'Price', 'Discount %', 'Amount'];

    const tableBody = (row.quotationDetailsVO || []).map((item, i) => [
      i + 1, // serial number
      safeText(item.productName),
      safeText(item.category),
      safeText(item.subCategory),
      (item.qty || 0).toLocaleString('en-IN'),
      (item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      (item.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      (item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    ]);

    autoTable(pdf, {
      startY: tableStartY,
      head: [tableHeaders],
      body: tableBody,
      margin: { left: margin, right: margin },
      styles: { font: 'times', fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: blue, textColor: 255, halign: 'center' },
      alternateRowStyles: { fillColor: gray },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // serial number centered
        1: { halign: 'left', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 25 },
        3: { halign: 'left', cellWidth: 30 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'right', cellWidth: 25 },
        6: { halign: 'right', cellWidth: 20 },
        7: { halign: 'right', cellWidth: 25 }
      }
    });

    currentY = pdf.lastAutoTable.finalY + 10;

    // --- SUMMARY TOTALS ---
    pdf.setFont('Poppins', 'bold');
    pdf.setFontSize(10);
    // pdf.text('Summary', leftX, currentY);
    currentY += 3;

    const totals = [
      ['Gross Amount', row.grossAmount],
      ['Discount %', row.discount],
      ['Net Amount', row.netAmount]
    ];

    totals.forEach(([label, val]) => {
      pdf.text(label, rightX + 35, currentY);
      pdf.text((val || '-').toLocaleString('en-IN'), pageWidth - margin, currentY, { align: 'right' });
      currentY += 6;
    });

    // --- AMOUNT IN WORDS & NARRATION ---
    currentY += 8;
    pdf.setFont('Poppins', 'bold');
    pdf.text('Amount in Words:', leftX, currentY);
    pdf.setFont('Poppins', 'normal');
    pdf.text(safeText(row.amountInWords), leftX + 30, currentY, { maxWidth: 130 });

    currentY += 6;
    pdf.setFont('Poppins', 'bold');
    pdf.text('Narration:', leftX, currentY);
    pdf.setFont('Poppins', 'normal');
    pdf.text(safeText(row.narration), leftX + 20, currentY, { maxWidth: 130 });

    // --- FOOTER ---
    currentY += 10;
    pdf.setFont('Poppins', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(blue[0], blue[1], blue[2]);
    pdf.text('Terms & Conditions', leftX, currentY);

    pdf.setFont('Poppins', 'normal');
    pdf.setTextColor(0, 0, 0);
    currentY += 5;

    const terms = companyDetails?.termsAndConditions?.split('\n') || [];
    terms.forEach((term, index) => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.text(`${index + 1}. ${safeText(term)}`, leftX + 4, currentY, {
        maxWidth: pageWidth - 2 * margin
      });
      currentY += 5;
    });

    pdf.setLineWidth(0.2);
    pdf.setDrawColor(blue[0], blue[1], blue[2]);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(8);
    pdf.text(`${safeText(companyDetails.address)} | System Generated Quotation`, margin, pageHeight - 10);
    // pdf.text(`${safeText(companyDetails.address)} | ${safeText(currentDateTime)} | System Generated Quotation`, margin, pageHeight - 10);

    pdf.save(`${safeText(row.screenCode || 'Quotation')}_${safeText(row.clientName)}_${safeText(row.docId)}.pdf`);
  };

  return (
    <Dialog open={open} onClose={modalClose} fullWidth maxWidth="md">
      <DialogTitle>Quotation Preview</DialogTitle>
      <DialogContent>
        <p>
          Quotation ready to download for <strong>{safeText(row?.clientName)}</strong>
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadPdf} color="primary" variant="contained" startIcon={<DownloadIcon />}>
          Download PDF
        </Button>
        <Button onClick={modalClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuotationPDF;

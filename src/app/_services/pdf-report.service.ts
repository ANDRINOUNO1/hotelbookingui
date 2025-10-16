import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '../_models/booking.model';
import { Archive } from './archive.service';

export interface MonthlyReportData {
  bookings: Booking[];
  archives: Archive[];
  totalRevenue: number;
  totalBookings: number;
  totalArchived: number;
  month: string;
  year: number;
  // Enhanced data
  checkInList?: Booking[];
  checkOutList?: Booking[];
  totalCheckIns?: number;
  totalCheckOuts?: number;
  totalNetPaid?: number;
  totalAdditionalIncome?: number;
  // Enhanced pricing metrics
  totalReservationFees?: number;
  totalPaymentsReceived?: number;
  totalBasePrices?: number;
  netRevenue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {

  constructor() { }

  generateMonthlyRevenueReport(data: MonthlyReportData): void {
    const doc = new jsPDF();
    
    // Set up colors consistent with BC Flats theme
    const primaryColor = '#0b0b31';
    const secondaryColor = '#e5c07b';
    const accentColor = '#b4884d';
    const textColor = '#333333';
    const lightGray = '#f8f9fa';

    // PAGE 1: Monthly Revenue Summary
    this.addHeader(doc, data.month, data.year, primaryColor, secondaryColor);
    this.addSummarySection(doc, data, primaryColor, secondaryColor, accentColor);
    this.addPageFooter(doc, 1, 5, primaryColor, secondaryColor);
    
    // PAGE 2: Reservations List
    doc.addPage();
    this.addPageHeader(doc, 2, primaryColor, secondaryColor);
    this.addReservationsTable(doc, data.bookings || [], primaryColor, secondaryColor);
    this.addPageFooter(doc, 2, 5, primaryColor, secondaryColor);
    
    // PAGE 3: Check-In List
    doc.addPage();
    this.addPageHeader(doc, 3, primaryColor, secondaryColor);
    this.addCheckInTable(doc, data.checkInList || [], primaryColor, secondaryColor);
    this.addPageFooter(doc, 3, 5, primaryColor, secondaryColor);
    
    // PAGE 4: Check-Out List
    doc.addPage();
    this.addPageHeader(doc, 4, primaryColor, secondaryColor);
    this.addCheckOutTable(doc, data.checkOutList || [], primaryColor, secondaryColor);
    this.addPageFooter(doc, 4, 5, primaryColor, secondaryColor);
    
    // PAGE 5: Archived Records
    doc.addPage();
    this.addPageHeader(doc, 5, primaryColor, secondaryColor);
    this.addArchivesTable(doc, data.archives || [], primaryColor, secondaryColor);
    this.addPageFooter(doc, 5, 5, primaryColor, secondaryColor);

    // Save the PDF
    const fileName = `Monthly_Revenue_Report_${data.month}_${data.year}.pdf`;
    doc.save(fileName);
  }

  private addHeader(doc: jsPDF, month: string, year: number, primaryColor: string, secondaryColor: string): void {
    // Company Logo Area
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Company Name
    doc.setTextColor(secondaryColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BC Flats Hotel', 20, 20);
    
    // Report Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Revenue Report', 20, 35);
    
    // Date Generated
    doc.setFontSize(10);
    doc.text(`Report Period: ${month} ${year}`, 20, 45);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Add decorative line
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(2);
    doc.line(20, 55, 190, 55);
  }

  private addSummarySection(doc: jsPDF, data: MonthlyReportData, primaryColor: string, secondaryColor: string, accentColor: string): void {
    let yPosition = 70;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Summary Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Summary', 20, yPosition);
    yPosition += 15;
    
    // Summary Box
    doc.setFillColor(lightGray);
    doc.rect(20, yPosition - 5, 170, 80, 'F');
    doc.setDrawColor('#dee2e6');
    doc.rect(20, yPosition - 5, 170, 80, 'S');
    
    // Summary Content
    doc.setTextColor(textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // First row - Basic metrics
    const summaryDataRow1 = [
      { label: 'Total Bookings:', value: (data.totalBookings || 0).toString() },
      { label: 'Check-ins:', value: (data.totalCheckIns || 0).toString() },
      { label: 'Check-outs:', value: (data.totalCheckOuts || 0).toString() },
      { label: 'Archived:', value: (data.totalArchived || 0).toString() }
    ];
    
    summaryDataRow1.forEach((item, index) => {
      const x = 30 + (index * 40);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x, yPosition + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(accentColor);
      doc.text(item.value, x, yPosition + 12);
      doc.setTextColor(textColor);
    });
    
    // Second row - Revenue metrics
    const summaryDataRow2 = [
      { label: 'Payments Received:', value: this.formatCurrency(data.totalPaymentsReceived || 0) },
      { label: 'Reservation Fees:', value: this.formatCurrency(data.totalReservationFees || 0) },
      { label: 'Net Revenue:', value: this.formatCurrency(data.netRevenue || 0) }
    ];
    
    summaryDataRow2.forEach((item, index) => {
      const x = 30 + (index * 55);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x, yPosition + 25);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(accentColor);
      doc.text(item.value, x, yPosition + 32);
      doc.setTextColor(textColor);
    });
    
    // Third row - Additional metrics
    const summaryDataRow3 = [
      { label: 'Base Prices:', value: this.formatCurrency(data.totalBasePrices || 0) },
      { label: 'Net Paid:', value: this.formatCurrency(data.totalNetPaid || 0) },
      { label: 'Total Revenue:', value: this.formatCurrency(data.totalRevenue || 0) }
    ];
    
    summaryDataRow3.forEach((item, index) => {
      const x = 30 + (index * 55);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x, yPosition + 45);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(accentColor);
      doc.text(item.value, x, yPosition + 52);
      doc.setTextColor(textColor);
    });
  }

  private addReservationsTable(doc: jsPDF, bookings: Booking[], primaryColor: string, secondaryColor: string): void {
    let yPosition = 40;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reservations List', 20, yPosition);
    yPosition += 15;
    
    // Handle empty state
    if (bookings.length === 0) {
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No reservation records found', 20, yPosition + 10);
      return;
    }
    
    // Prepare table data
    const tableData = bookings.map(booking => {
      const reservationFee = this.calculateReservationFee(booking);
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        this.calculateDaysOfStay(booking).toString(),
        booking.availability?.checkIn ? new Date(booking.availability.checkIn).toLocaleDateString() : 'N/A',
        booking.availability?.checkOut ? new Date(booking.availability.checkOut).toLocaleDateString() : 'N/A',
        this.formatCurrency(reservationFee),
        booking.pay_status ? 'Paid' : 'Pending',
        booking.status || 'Reserved'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Days', 'Check-in', 'Check-out', 'Reservation Fee', 'Payment Status', 'Reservation Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'right', cellWidth: 20 },
        7: { halign: 'center', cellWidth: 20 },
        8: { halign: 'center', cellWidth: 20 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      tableWidth: 'auto',
      showHead: 'everyPage'
    });
  }

  private addCheckInTable(doc: jsPDF, checkIns: Booking[], primaryColor: string, secondaryColor: string): void {
    let yPosition = 40;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Check-In List', 20, yPosition);
    yPosition += 15;
    
    // Handle empty state
    if (checkIns.length === 0) {
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No check-in records found', 20, yPosition + 10);
      return;
    }
    
    // Prepare table data
    const tableData = checkIns.map(booking => {
      const basePrice = booking.room?.roomType?.basePrice || 0;
      const reservationFee = this.calculateReservationFee(booking);
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        this.calculateDaysOfStay(booking).toString(),
        this.formatCurrency(basePrice),
        this.formatCurrency(reservationFee),
        this.formatCurrency(booking.paidamount || 0),
        booking.availability?.checkIn ? new Date(booking.availability.checkIn).toLocaleDateString() : 'N/A',
        booking.pay_status ? 'Paid' : 'Pending',
        booking.status || 'Checked In'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Days', 'Base Price', 'Reservation Fee', 'Payment Received', 'Check-in Date', 'Payment Status', 'Reservation Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { cellWidth: 25 },
        2: { cellWidth: 18 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'right', cellWidth: 18 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 20 },
        8: { halign: 'center', cellWidth: 18 },
        9: { halign: 'center', cellWidth: 18 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      tableWidth: 'auto',
      showHead: 'everyPage'
    });
  }

  private addCheckOutTable(doc: jsPDF, checkOuts: Booking[], primaryColor: string, secondaryColor: string): void {
    let yPosition = 40;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Check-Out List', 20, yPosition);
    yPosition += 15;
    
    // Handle empty state
    if (checkOuts.length === 0) {
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No check-out records found', 20, yPosition + 10);
      return;
    }
    
    // Prepare table data
    const tableData = checkOuts.map(booking => {
      const paymentReceived = booking.paidamount || 0;
      const reservationFee = this.calculateReservationFee(booking);
      const basePrice = booking.room?.roomType?.basePrice || 0;
      
      const totalAmount = basePrice + reservationFee;
      const netPaid = paymentReceived >= totalAmount ? 
        totalAmount - reservationFee : 
        Math.max(0, paymentReceived - reservationFee);
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        this.calculateDaysOfStay(booking).toString(),
        booking.availability?.checkIn ? new Date(booking.availability.checkIn).toLocaleDateString() : 'N/A',
        booking.availability?.checkOut ? new Date(booking.availability.checkOut).toLocaleDateString() : 'N/A',
        this.formatCurrency(paymentReceived),
        this.formatCurrency(reservationFee),
        this.formatCurrency(netPaid),
        booking.pay_status ? 'Paid' : 'Pending',
        booking.status || 'Checked Out'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Days', 'Check-in Date', 'Check-out Date', 'Payment Received', 'Reservation Fee', 'Net Paid', 'Payment Status', 'Reservation Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16 },
        1: { cellWidth: 22 },
        2: { cellWidth: 16 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'right', cellWidth: 18 },
        8: { halign: 'right', cellWidth: 18 },
        9: { halign: 'center', cellWidth: 16 },
        10: { halign: 'center', cellWidth: 16 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      tableWidth: 'auto',
      showHead: 'everyPage'
    });
  }

  private addArchivesTable(doc: jsPDF, archives: Archive[], primaryColor: string, secondaryColor: string): void {
    let yPosition = 40;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Archived Records', 20, yPosition);
    yPosition += 15;
    
    // Handle empty state
    if (archives.length === 0) {
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No archived records found', 20, yPosition + 10);
      return;
    }
    
    // Prepare table data
    const tableData = archives.map(archive => [
      archive.id?.toString() || 'N/A',
      archive.guest || 'N/A',
      archive.roomType || 'N/A',
      archive.createdAt ? new Date(archive.createdAt).toLocaleDateString() : 'N/A',
      archive.arrivalDate ? new Date(archive.arrivalDate).toLocaleDateString() : 'N/A',
      archive.status || 'N/A'
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [['Archive ID', 'Guest Name', 'Room Type', 'Booking Date', 'Archived Date', 'Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 25 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      tableWidth: 'auto',
      showHead: 'everyPage'
    });
  }

  private addPageHeader(doc: jsPDF, pageNumber: number, primaryColor: string, secondaryColor: string): void {
    // Page header background
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Page title
    doc.setTextColor(secondaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    
    let pageTitle = '';
    switch(pageNumber) {
      case 2:
        pageTitle = 'Reservations List';
        break;
      case 3:
        pageTitle = 'Check-In List';
        break;
      case 4:
        pageTitle = 'Check-Out List';
        break;
      case 5:
        pageTitle = 'Archived Records';
        break;
      default:
        pageTitle = 'Monthly Revenue Report';
    }
    
    doc.text(pageTitle, 20, 18);
    
    // Page number
    doc.setFontSize(10);
    doc.text(`Page ${pageNumber}`, 190, 18, { align: 'right' });
    
    // Decorative line
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(1);
    doc.line(20, 30, 190, 30);
  }

  private addPageFooter(doc: jsPDF, pageNumber: number, totalPages: number, primaryColor: string, secondaryColor: string): void {
    // Footer background
    doc.setFillColor(primaryColor);
    doc.rect(0, 280, 210, 20, 'F');
    
    // Footer content
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Left side - Prepared by
    doc.text('Prepared by: Frontdesk Manager', 20, 290);
    
    // Center - System info
    doc.text('BC Flats Hotel Management System', 105, 290, { align: 'center' });
    
    // Right side - Page X of Y
    doc.text(`Page ${pageNumber} of ${totalPages}`, 190, 290, { align: 'right' });
    
    // Signature line
    doc.setDrawColor(secondaryColor);
    doc.line(20, 295, 80, 295);
    doc.text('Signature', 50, 300, { align: 'center' });
    
    // Generated timestamp
    doc.setFontSize(7);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 300);
  }

  private calculateDaysOfStay(booking: Booking): number {
    if (!booking.availability?.checkIn || !booking.availability?.checkOut) {
      return 0;
    }
    
    const checkIn = new Date(booking.availability.checkIn);
    const checkOut = new Date(booking.availability.checkOut);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return 0;
    }
    
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff);
  }

  private calculateReservationFee(booking: Booking): number {
    if (!booking.room?.roomType?.reservationFeePercentage || !booking.room?.roomType?.basePrice) {
      return 0;
    }
    
    const basePrice = booking.room.roomType.basePrice;
    const feePercentage = booking.room.roomType.reservationFeePercentage;
    
    if (isNaN(basePrice) || isNaN(feePercentage) || !isFinite(basePrice) || !isFinite(feePercentage)) {
      return 0;
    }
    
    const fee = (basePrice * feePercentage) / 100;
    return isNaN(fee) || !isFinite(fee) ? 0 : fee;
  }

  // Helper method to format currency
  private formatCurrency(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
      return '₱0.00';
    }
    
    let numericAmount: number;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        return '₱0.00';
      }
    } else {
      numericAmount = amount;
    }
    
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      return '₱0.00';
    }
    
    const formattedAmount = numericAmount.toFixed(2);
    return `₱${formattedAmount}`;
  }

  // Helper method to get month name
  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Unknown';
  }
}
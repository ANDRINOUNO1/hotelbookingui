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
    const borderColor = '#dee2e6';

    // Header
    this.addHeader(doc, data.month, data.year, primaryColor, secondaryColor);
    
    // Enhanced Summary Section
    this.addEnhancedSummarySection(doc, data, primaryColor, secondaryColor, accentColor);
    
    // Reservations Table
    this.addReservationsTable(doc, data.bookings, primaryColor, secondaryColor, borderColor);
    
    // Check-In List Table
    if (data.checkInList && data.checkInList.length > 0) {
      this.addCheckInTable(doc, data.checkInList, primaryColor, secondaryColor, borderColor);
    }
    
    // Check-Out List Table with Net Paid calculations
    if (data.checkOutList && data.checkOutList.length > 0) {
      this.addCheckOutTable(doc, data.checkOutList, primaryColor, secondaryColor, borderColor);
    }
    
    // Archives Table
    this.addArchivesTable(doc, data.archives, primaryColor, secondaryColor, borderColor);
    
    // Footer
    this.addFooter(doc, primaryColor, secondaryColor);

    // Save the PDF
    const fileName = `Monthly_Revenue_Report_${data.month}_${data.year}.pdf`;
    doc.save(fileName);
  }

  private addHeader(doc: jsPDF, month: string, year: number, primaryColor: string, secondaryColor: string): void {
    // Company Logo Area (placeholder)
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

  private addEnhancedSummarySection(doc: jsPDF, data: MonthlyReportData, primaryColor: string, secondaryColor: string, accentColor: string): void {
    let yPosition = 70;
    const lightGray = '#f8f9fa';
    const borderColor = '#dee2e6';
    const textColor = '#333333';
    
    // Summary Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Summary', 20, yPosition);
    yPosition += 10;
    
    // Summary Box - Larger to accommodate enhanced pricing data
    doc.setFillColor(lightGray);
    doc.rect(20, yPosition - 5, 170, 70, 'F');
    doc.setDrawColor(borderColor);
    doc.rect(20, yPosition - 5, 170, 70, 'S');
    
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

  private addReservationsTable(doc: jsPDF, bookings: Booking[], primaryColor: string, secondaryColor: string, borderColor: string): void {
    let yPosition = 110;
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reservations List', 20, yPosition);
    yPosition += 10;
    
    // Prepare table data
    const tableData = bookings.map(booking => {
      const basePrice = booking.room?.roomType?.basePrice || 0;
      const reservationFee = this.calculateReservationFee(booking);
      const totalAmount = basePrice + reservationFee;
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        booking.availability?.checkIn ? new Date(booking.availability.checkIn).toLocaleDateString() : 'N/A',
        booking.availability?.checkOut ? new Date(booking.availability.checkOut).toLocaleDateString() : 'N/A',
        this.formatCurrency(totalAmount),
        booking.pay_status ? 'Paid' : 'Pending'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Check-in', 'Check-out', 'Amount', 'Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'center', cellWidth: 18 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      didDrawPage: (data: any) => {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(textColor);
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 285, { align: 'right' });
      }
    });
  }

  private addCheckInTable(doc: jsPDF, checkIns: Booking[], primaryColor: string, secondaryColor: string, borderColor: string): void {
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Check if we need a new page
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    let yPosition = finalY + 20;
    
    // If not enough space, add new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Check-In List', 20, yPosition);
    yPosition += 10;
    
    // Prepare table data with enhanced pricing information
    const tableData = checkIns.map(booking => {
      const basePrice = booking.room?.roomType?.basePrice || 0;
      const reservationFee = this.calculateReservationFee(booking);
      const totalAmount = basePrice + reservationFee;
      
      console.log('Check-In calculation:', {
        bookingId: booking.id,
        basePrice: basePrice,
        reservationFee: reservationFee,
        totalAmount: totalAmount
      });
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        this.formatCurrency(basePrice),
        this.formatCurrency(reservationFee),
        this.formatCurrency(totalAmount),
        booking.availability?.checkIn ? new Date(booking.availability.checkIn).toLocaleDateString() : 'N/A',
        booking.pay_status ? 'Paid' : 'Pending'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Base Price', 'Reservation Fee', 'Total Amount', 'Check-in Date', 'Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'center', cellWidth: 18 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      didDrawPage: (data: any) => {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(textColor);
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 285, { align: 'right' });
      }
    });
  }

  private addCheckOutTable(doc: jsPDF, checkOuts: Booking[], primaryColor: string, secondaryColor: string, borderColor: string): void {
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Check if we need a new page
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    let yPosition = finalY + 20;
    
    // If not enough space, add new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Check-Out List (with Net Paid Calculation)', 20, yPosition);
    yPosition += 10;
    
    // Prepare table data with enhanced net paid calculation
    const tableData = checkOuts.map(booking => {
      const paymentReceived = booking.paidamount || 0;
      const reservationFee = this.calculateReservationFee(booking);
      const netPaid = Math.max(0, paymentReceived - reservationFee);
      
      console.log('Check-Out calculation:', {
        bookingId: booking.id,
        paymentReceived: paymentReceived,
        reservationFee: reservationFee,
        netPaid: netPaid
      });
      
      return [
        booking.id?.toString() || 'N/A',
        `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
        booking.room?.roomType?.type || 'Standard Room',
        booking.availability?.checkOut ? new Date(booking.availability.checkOut).toLocaleDateString() : 'N/A',
        this.formatCurrency(paymentReceived),
        this.formatCurrency(reservationFee),
        this.formatCurrency(netPaid),
        booking.pay_status ? 'Paid' : 'Pending'
      ];
    });
    
    // Generate table
    autoTable(doc, {
      head: [['Booking ID', 'Guest Name', 'Room Type', 'Check-out Date', 'Payment Received', 'Reservation Fee', 'Net Paid', 'Status']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16 },
        1: { cellWidth: 25 },
        2: { cellWidth: 18 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 20 },
        5: { halign: 'right', cellWidth: 20 },
        6: { halign: 'right', cellWidth: 20 },
        7: { halign: 'center', cellWidth: 16 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      didDrawPage: (data: any) => {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(textColor);
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 285, { align: 'right' });
      }
    });
  }

  private calculateReservationFee(booking: Booking): number {
    if (!booking.room?.roomType?.reservationFeePercentage || !booking.room?.roomType?.basePrice) {
      console.log('Missing reservation fee data:', {
        bookingId: booking.id,
        hasRoom: !!booking.room,
        hasRoomType: !!booking.room?.roomType,
        basePrice: booking.room?.roomType?.basePrice,
        reservationFeePercentage: booking.room?.roomType?.reservationFeePercentage
      });
      return 0;
    }
    
    const basePrice = booking.room.roomType.basePrice;
    const feePercentage = booking.room.roomType.reservationFeePercentage;
    
    // Ensure both values are valid numbers
    if (isNaN(basePrice) || isNaN(feePercentage) || !isFinite(basePrice) || !isFinite(feePercentage)) {
      console.log('Invalid reservation fee data:', {
        bookingId: booking.id,
        basePrice: basePrice,
        feePercentage: feePercentage
      });
      return 0;
    }
    
    const fee = (basePrice * feePercentage) / 100;
    const result = isNaN(fee) || !isFinite(fee) ? 0 : fee;
    
    console.log('Reservation fee calculation:', {
      bookingId: booking.id,
      basePrice: basePrice,
      feePercentage: feePercentage,
      calculatedFee: fee,
      result: result
    });
    
    return result;
  }

  private calculateTotalReservationAmount(booking: Booking): number {
    if (!booking.room?.roomType?.basePrice) {
      return booking.paidamount || 0;
    }
    
    const basePrice = booking.room.roomType.basePrice;
    const reservationFee = this.calculateReservationFee(booking);
    
    // Ensure both values are valid numbers
    if (isNaN(basePrice) || !isFinite(basePrice)) {
      return booking.paidamount || 0;
    }
    
    const total = basePrice + reservationFee;
    return isNaN(total) || !isFinite(total) ? (booking.paidamount || 0) : total;
  }

  private calculateNetPaid(booking: Booking): number {
    const paymentReceived = booking.paidamount || 0;
    const reservationFee = this.calculateReservationFee(booking);
    
    // Ensure both values are valid numbers
    if (isNaN(paymentReceived) || !isFinite(paymentReceived)) {
      return 0;
    }
    
    const netPaid = paymentReceived - reservationFee;
    return Math.max(0, netPaid);
  }

  private addArchivesTable(doc: jsPDF, archives: Archive[], primaryColor: string, secondaryColor: string, borderColor: string): void {
    const lightGray = '#f8f9fa';
    const textColor = '#333333';
    
    // Check if we need a new page
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    let yPosition = finalY + 20;
    
    // If not enough space, add new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Table Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Archived Records', 20, yPosition);
    yPosition += 10;
    
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
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: secondaryColor,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'center', cellWidth: 20 }
      },
      margin: { left: 20, right: 20 },
      pageBreak: 'auto',
      didDrawPage: (data: any) => {
        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(textColor);
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 285, { align: 'right' });
      }
    });
  }

  private addFooter(doc: jsPDF, primaryColor: string, secondaryColor: string): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
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
      
      // Right side - Timestamp
      doc.text(`Generated: ${new Date().toLocaleString()}`, 190, 290, { align: 'right' });
      
      // Signature line
      doc.setDrawColor(secondaryColor);
      doc.line(20, 295, 80, 295);
      doc.text('Signature', 50, 300, { align: 'center' });
    }
  }

  // Helper method to format currency
  private formatCurrency(amount: number | string | null | undefined): string {
    // Handle null, undefined, or empty values
    if (amount === null || amount === undefined || amount === '') {
      return 'PHP 0.00';
    }
    
    // Convert string to number if needed
    let numericAmount: number;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
      // Check if conversion was successful
      if (isNaN(numericAmount)) {
        return 'PHP 0.00';
      }
    } else {
      numericAmount = amount;
    }
    
    // Handle NaN or invalid numbers
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      return 'PHP 0.00';
    }
    
    // Use explicit PHP prefix to avoid symbol issues
    const formattedAmount = numericAmount.toFixed(2);
    return `PHP ${formattedAmount}`;
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

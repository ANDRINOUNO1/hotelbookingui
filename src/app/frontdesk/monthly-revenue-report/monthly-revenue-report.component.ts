import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking as ServiceBooking } from '../../_services/booking.service';
import { Booking } from '../../_models/booking.model';
import { ArchiveDataService, Archive } from '../../_services/archive.service';
import { PdfReportService, MonthlyReportData } from '../../_services/pdf-report.service';
import { RoomService, Room, RoomType } from '../../_services/room.service';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-monthly-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-revenue-report.component.html',
  styleUrls: ['./monthly-revenue-report.component.scss']
})
export class MonthlyRevenueReportComponent implements OnInit {
  
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  isLoading = false;
  reportData: MonthlyReportData | null = null;
  errorMessage = '';

  // Additional data for enhanced report - always initialized
  checkInList: Booking[] = [];
  checkOutList: Booking[] = [];
  totalCheckIns = 0;
  totalCheckOuts = 0;
  totalNetPaid = 0;
  totalAdditionalIncome = 0;
  totalMonthlyRevenue = 0;
  
  // Enhanced pricing metrics
  totalReservationFees = 0;
  totalPaymentsReceived = 0;
  totalBasePrices = 0;
  netRevenue = 0;

  months = [
    { value: 0, name: 'January' },
    { value: 1, name: 'February' },
    { value: 2, name: 'March' },
    { value: 3, name: 'April' },
    { value: 4, name: 'May' },
    { value: 5, name: 'June' },
    { value: 6, name: 'July' },
    { value: 7, name: 'August' },
    { value: 8, name: 'September' },
    { value: 9, name: 'October' },
    { value: 10, name: 'November' },
    { value: 11, name: 'December' }
  ];

  years: number[] = [];

  constructor(
    private bookingService: BookingService,
    private archiveService: ArchiveDataService,
    private pdfService: PdfReportService,
    private roomService: RoomService
  ) {
    // Generate years from 2020 to current year + 1
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadReportData();
  }

  onMonthYearChange(): void {
    this.loadReportData();
  }

  // Refresh booking data from backend to get latest status
  refreshBookingData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get fresh data from all services
    forkJoin({
      bookings: this.bookingService.getAllBookings(),
      rooms: this.roomService.getAllRooms(),
      roomTypes: this.roomService.getRoomTypes()
    }).subscribe({
      next: ({ bookings, rooms, roomTypes }) => {
        // Convert ServiceBooking to Booking model
        const convertedBookings = bookings.map(booking => 
          this.convertServiceBookingToBooking(booking, rooms, roomTypes)
        );
        
        // Update the bookings in report data
        if (this.reportData) {
          this.reportData.bookings = this.filterBookingsByMonth(
            convertedBookings, 
            this.selectedMonth, 
            this.selectedYear
          );
          
          // Update check-in and check-out lists - always ensure lists are initialized
          this.checkInList = this.filterCheckInsByMonth(convertedBookings, this.selectedMonth, this.selectedYear) || [];
          this.checkOutList = this.filterCheckOutsByMonth(convertedBookings, this.selectedMonth, this.selectedYear) || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error refreshing booking data:', error);
        this.errorMessage = 'Failed to refresh booking data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadReportData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    forkJoin({
      bookings: this.bookingService.getAllBookings(),
      archives: this.archiveService.getAllArchives(),
      rooms: this.roomService.getAllRooms(),
      roomTypes: this.roomService.getRoomTypes()
    }).pipe(
      map(({ bookings, archives, rooms, roomTypes }) => {
        const monthName = this.pdfService.getMonthName(this.selectedMonth);
        
        // Convert ServiceBooking to Booking model with room information
        const convertedBookings = bookings.map(booking => this.convertServiceBookingToBooking(booking, rooms, roomTypes));
        
        // Filter data for selected month and year
        const filteredBookings = this.filterBookingsByMonth(convertedBookings, this.selectedMonth, this.selectedYear);
        const filteredArchives = this.filterArchivesByMonth(archives, this.selectedMonth, this.selectedYear);
        
        // Generate check-in and check-out lists - always ensure lists are initialized
        this.checkInList = this.filterCheckInsByMonth(convertedBookings, this.selectedMonth, this.selectedYear) || [];
        this.checkOutList = this.filterCheckOutsByMonth(convertedBookings, this.selectedMonth, this.selectedYear) || [];
        
        // Calculate enhanced totals based on room pricing management
        const totalBookings = filteredBookings.length;
        const totalArchived = filteredArchives.length;
        this.totalCheckIns = this.checkInList.length;
        this.totalCheckOuts = this.checkOutList.length;
        
        // Calculate pricing metrics - FIXED CALCULATIONS
        
        // Payments Received: Include ALL payments made (reservation fees + additional payments)
        this.totalPaymentsReceived = convertedBookings
          .filter(booking => booking.pay_status)
          .reduce((sum, booking) => sum + (booking.paidamount || 0), 0);
        
        // Reservation Fees: Calculate total reservation fees for all bookings
        this.totalReservationFees = convertedBookings.reduce((sum, booking) => {
          return sum + this.calculateReservationFee(booking);
        }, 0);
        
        // Base Prices: Calculate total base prices for all bookings
        this.totalBasePrices = convertedBookings.reduce((sum, booking) => {
          return sum + (booking.room?.roomType?.basePrice || 0);
        }, 0);
        
        // Net Paid for Check-outs: Additional payments made at checkout (excluding reservation fees)
        this.totalNetPaid = this.checkOutList.reduce((sum, booking) => {
          const totalPaymentReceived = booking.paidamount || 0;
          const reservationFee = this.calculateReservationFee(booking);
          const basePrice = booking.room?.roomType?.basePrice || 0;
          const daysOfStay = this.calculateDaysOfStay(booking);
          
          // Net Paid = Total Payment Received - Reservation Fee
          // This represents additional payment made at checkout
          const netPaid = Math.max(0, totalPaymentReceived - reservationFee);
          
          // Validation: Net Paid should not exceed (Base Price × Days of Stay)
          const maxNetPaid = basePrice * daysOfStay;
          const cappedNetPaid = Math.min(netPaid, maxNetPaid);
          
          return sum + cappedNetPaid;
        }, 0);
        
        // Net Revenue: Total of all Payments Received (reservation fees are income, not expenses)
        this.netRevenue = this.totalPaymentsReceived;
        
        // Total Monthly Revenue: Sum of all confirmed payments for the month
        this.totalMonthlyRevenue = this.totalPaymentsReceived;
        
        return {
          bookings: filteredBookings,
          archives: filteredArchives,
          totalRevenue: this.totalMonthlyRevenue,
          totalBookings,
          totalArchived,
          month: monthName,
          year: this.selectedYear,
          // Enhanced data
          checkInList: this.checkInList,
          checkOutList: this.checkOutList,
          totalCheckIns: this.totalCheckIns,
          totalCheckOuts: this.totalCheckOuts,
          totalNetPaid: this.totalNetPaid,
          totalAdditionalIncome: this.totalReservationFees,
          // Enhanced pricing metrics
          totalReservationFees: this.totalReservationFees,
          totalPaymentsReceived: this.totalPaymentsReceived,
          totalBasePrices: this.totalBasePrices,
          netRevenue: this.netRevenue
        } as MonthlyReportData;
      }),
      catchError(error => {
        console.error('Error loading report data:', error);
        this.errorMessage = 'Failed to load report data. Please try again.';
        return of(null);
      })
    ).subscribe(data => {
      this.reportData = data;
      this.isLoading = false;
    });
  }

  private filterBookingsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by reservation status = 'reserved' for the main reservations preview
      return booking.status && booking.status.toLowerCase() === 'reserved';
    }) || [];
  }

  private filterArchivesByMonth(archives: Archive[], month: number, year: number): Archive[] {
    // Show all archives regardless of date - always return array
    return archives || [];
  }

  private filterCheckInsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by reservation status = 'checked_in'
      return booking.status && booking.status.toLowerCase() === 'checked_in';
    }) || [];
  }

  private filterCheckOutsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by reservation status = 'checked_out'
      return booking.status && booking.status.toLowerCase() === 'checked_out';
    }) || [];
  }

  private calculateTotalNetPaid(checkOuts: Booking[]): number {
    return checkOuts.reduce((total, booking) => {
      const totalPayment = booking.paidamount || 0;
      const reservationFee = this.calculateReservationFee(booking);
      const netPaid = totalPayment - reservationFee;
      return total + Math.max(0, netPaid); // Ensure non-negative
    }, 0);
  }

  calculateReservationFee(booking: Booking): number {
    if (!booking.room?.roomType?.reservationFeePercentage || !booking.room?.roomType?.basePrice) {
      return 0;
    }
    
    const basePrice = booking.room.roomType.basePrice;
    const feePercentage = booking.room.roomType.reservationFeePercentage;
    
    // Ensure both values are valid numbers
    if (isNaN(basePrice) || isNaN(feePercentage) || !isFinite(basePrice) || !isFinite(feePercentage)) {
      return 0;
    }
    
    const fee = (basePrice * feePercentage) / 100;
    return isNaN(fee) || !isFinite(fee) ? 0 : fee;
  }

  // Calculate total days of stay for a booking
  calculateDaysOfStay(booking: Booking): number {
    if (!booking.availability?.checkIn || !booking.availability?.checkOut) {
      return 1; // Default to 1 day if dates are missing
    }
    
    const checkInDate = new Date(booking.availability.checkIn);
    const checkOutDate = new Date(booking.availability.checkOut);
    
    // Calculate difference in milliseconds
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    
    // Convert to days and round up
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    // Ensure minimum 1 day stay
    return Math.max(1, daysDifference);
  }

  // Calculate total reservation amount including days of stay
  calculateTotalReservationAmount(booking: Booking): number {
    if (!booking.room?.roomType?.basePrice) {
      return booking.paidamount || 0;
    }
    
    const basePrice = booking.room.roomType.basePrice;
    const reservationFee = this.calculateReservationFee(booking);
    const daysOfStay = this.calculateDaysOfStay(booking);
    
    // Ensure all values are valid numbers
    if (isNaN(basePrice) || !isFinite(basePrice) || isNaN(daysOfStay) || !isFinite(daysOfStay)) {
      return booking.paidamount || 0;
    }
    
    // Total Amount = (Base Price × Days of Stay) + Reservation Fee
    const total = (basePrice * daysOfStay) + reservationFee;
    return isNaN(total) || !isFinite(total) ? (booking.paidamount || 0) : total;
  }

  private calculateAdditionalIncome(bookings: Booking[]): number {
    return bookings.reduce((total, booking) => {
      const reservationFee = this.calculateReservationFee(booking);
      return total + reservationFee;
    }, 0);
  }

  generatePDF(): void {
    if (!this.reportData) {
      this.errorMessage = 'No report data available. Please select a month and year.';
      return;
    }

    try {
      this.pdfService.generateMonthlyRevenueReport(this.reportData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.errorMessage = 'Failed to generate PDF. Please try again.';
    }
  }

  getSelectedMonthName(): string {
    return this.months.find(m => m.value === this.selectedMonth)?.name || 'Unknown';
  }

  formatCurrency(amount: number | string | null | undefined): string {
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

  getPaymentStatusClass(status: boolean): string {
    return status ? 'status-paid' : 'status-pending';
  }

  getPaymentStatusText(status: boolean): string {
    return status ? 'Paid' : 'Pending';
  }

  getReservationStatus(booking: Booking): string {
    // Use the status from backend data
    if (booking.status) {
      switch (booking.status.toLowerCase()) {
        case 'reserved':
          return 'Reserved';
        case 'checked_in':
          return 'Checked In';
        case 'checked_out':
          return 'Checked Out';
        default:
          return 'Reserved'; // Default fallback
      }
    }
    
    // Fallback to date-based logic if status is not available
    const hasCheckIn = booking.availability?.checkIn;
    const hasCheckOut = booking.availability?.checkOut;
    
    if (hasCheckOut) {
      return 'Checked Out';
    } else if (hasCheckIn) {
      return 'Checked In';
    } else {
      return 'Reserved';
    }
  }

  getReservationStatusClass(booking: Booking): string {
    const status = this.getReservationStatus(booking);
    switch (status) {
      case 'Checked Out':
        return 'status-checked-out';
      case 'Checked In':
        return 'status-checked-in';
      case 'Reserved':
        return 'status-reserved';
      default:
        return 'status-reserved';
    }
  }

  calculateNetPaidForBooking(booking: Booking): number {
    const totalPaymentReceived = booking.paidamount || 0;
    const reservationFee = this.calculateReservationFee(booking);
    const basePrice = booking.room?.roomType?.basePrice || 0;
    const daysOfStay = this.calculateDaysOfStay(booking);
    const totalAmount = (basePrice * daysOfStay) + reservationFee;
    
    // Ensure all values are valid numbers
    if (isNaN(totalPaymentReceived) || !isFinite(totalPaymentReceived)) {
      return 0;
    }
    
    // Net Paid = Total Payment Received - Reservation Fee
    // This represents additional payment made at checkout (beyond reservation fee)
    const netPaid = Math.max(0, totalPaymentReceived - reservationFee);
    
    // Validation: Net Paid should not exceed (Base Price × Days of Stay)
    const maxNetPaid = basePrice * daysOfStay;
    return Math.min(netPaid, maxNetPaid);
  }

  getDateRange(): string {
    const monthName = this.getSelectedMonthName();
    return `${monthName} 1, ${this.selectedYear} - ${monthName} ${this.getDaysInMonth()}, ${this.selectedYear}`;
  }

  private getDaysInMonth(): number {
    return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
  }

  // Validation method to ensure data consistency
  validateBookingData(booking: Booking): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const basePrice = booking.room?.roomType?.basePrice || 0;
    const reservationFee = this.calculateReservationFee(booking);
    const daysOfStay = this.calculateDaysOfStay(booking);
    const totalAmount = (basePrice * daysOfStay) + reservationFee;
    const paymentReceived = booking.paidamount || 0;
    
    // Validate that payment received is not less than reservation fee (unless refunds exist)
    if (paymentReceived < reservationFee && booking.pay_status) {
      errors.push(`Payment received (${paymentReceived}) is less than reservation fee (${reservationFee})`);
    }
    
    // Validate that net paid is not negative unless it's a refund scenario
    const netPaid = paymentReceived - reservationFee;
    if (netPaid < 0 && booking.pay_status) {
      errors.push(`Net paid is negative: ${netPaid}`);
    }
    
    // Validate total amount calculation
    const calculatedTotal = (basePrice * daysOfStay) + reservationFee;
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      errors.push(`Total amount calculation mismatch: expected ${calculatedTotal}, got ${totalAmount}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to get payment status with more detail
  getDetailedPaymentStatus(booking: Booking): string {
    const paymentReceived = booking.paidamount || 0;
    const reservationFee = this.calculateReservationFee(booking);
    const basePrice = booking.room?.roomType?.basePrice || 0;
    const daysOfStay = this.calculateDaysOfStay(booking);
    const totalAmount = (basePrice * daysOfStay) + reservationFee;
    
    if (!booking.pay_status) {
      return 'Pending';
    }
    
    if (paymentReceived >= totalAmount) {
      return 'Fully Paid';
    } else if (paymentReceived >= reservationFee) {
      return 'Partially Paid';
    } else {
      return 'Underpaid';
    }
  }

  private convertServiceBookingToBooking(serviceBooking: ServiceBooking, rooms: Room[], roomTypes: RoomType[]): Booking {
    // Find the room for this booking
    const room = rooms.find(r => r.id === serviceBooking.room_id);
    // Find the room type for this room
    const roomType = room ? roomTypes.find(rt => rt.id === room.roomTypeId) : null;
    
    return {
      id: serviceBooking.id,
      room_id: serviceBooking.room_id,
      guest: serviceBooking.guest,
      availability: serviceBooking.availability,
      payment: serviceBooking.payment ? {
        paymentMode: serviceBooking.payment.paymentMode,
        paymentMethod: serviceBooking.payment.paymentMethod,
        amount: serviceBooking.payment.amount,
        mobileNumber: '', // Default empty string since it's not in service interface
        cardNumber: serviceBooking.payment.cardNumber,
        expiry: serviceBooking.payment.expiry,
        cvv: serviceBooking.payment.cvv
      } : undefined,
      pay_status: serviceBooking.pay_status,
      status: serviceBooking.status as 'reserved' | 'checked_in' | 'checked_out' | undefined,
      created_at: serviceBooking.created_at,
      updated_at: serviceBooking.updated_at,
      specialRequests: serviceBooking.specialRequests,
      paidamount: serviceBooking.paidamount,
      room: room ? {
        id: room.id,
        roomNumber: room.roomNumber,
        room_type_id: room.roomTypeId,
        floor: 1, // Default floor since it's not in the Room interface
        roomStatus: room.roomStatus as any,
        roomType: roomType ? {
          id: roomType.id,
          type: roomType.type,
          rate: roomType.rate,
          basePrice: roomType.basePrice,
          description: roomType.description,
          reservationFeePercentage: roomType.reservationFeePercentage
        } : undefined
      } : undefined
    };
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {
    // Generate years from 2020 to current year + 1
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    // Set to October (value 9) by default
    this.selectedMonth = 9; // October
    this.selectedYear = 2025;
    console.log(`🚀 Initializing with month: ${this.selectedMonth} (October), year: ${this.selectedYear}`);
    console.log(`🚀 Month type: ${typeof this.selectedMonth}, Value: ${this.selectedMonth}`);
    this.loadReportData();
  }

  onMonthYearChange(): void {
    console.log(`📅 Month/Year changed to: ${this.selectedMonth + 1}/${this.selectedYear}`);
    console.log(`📅 Raw selectedMonth value: ${this.selectedMonth} (type: ${typeof this.selectedMonth})`);
    console.log(`📅 Raw selectedYear value: ${this.selectedYear} (type: ${typeof this.selectedYear})`);
    this.loadReportData();
  }

  // Manual refresh method
  manualRefresh(): void {
    console.log('🔄 Manual refresh triggered');
    this.loadReportData();
  }

  // Test method to force October data
  testOctoberData(): void {
    console.log('🧪 Testing October data specifically');
    this.selectedMonth = 9; // October
    this.selectedYear = 2025;
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
    
    // Ensure selectedMonth is a number and convert to backend month (1-based)
    const selectedMonthNum = Number(this.selectedMonth);
    const backendMonth = selectedMonthNum + 1;
    
    console.log(`🔄 Loading report data for month ${backendMonth}, year ${this.selectedYear}`);
    console.log(`🔄 Original selectedMonth: ${this.selectedMonth} (${typeof this.selectedMonth}), Converted backendMonth: ${backendMonth}`);
    
    // Validate month range
    if (backendMonth < 1 || backendMonth > 12) {
      console.error(`❌ Invalid backend month: ${backendMonth}, resetting to October`);
      this.selectedMonth = 9; // October
      const correctedBackendMonth = 10;
      console.log(`🔄 Corrected to backend month: ${correctedBackendMonth}`);
    
    forkJoin({
        bookings: this.bookingService.getBookingsByMonth(correctedBackendMonth, this.selectedYear),
        archives: this.archiveService.getArchivesByMonth(correctedBackendMonth, this.selectedYear),
      rooms: this.roomService.getAllRooms(),
        roomTypes: this.roomService.getRoomTypes(),
        summary: this.bookingService.getMonthlySummary(correctedBackendMonth, this.selectedYear)
    }).pipe(
        map(({ bookings, archives, rooms, roomTypes, summary }) => {
          console.log(`📊 Received corrected data for ${correctedBackendMonth}/${this.selectedYear}:`, {
            bookings: bookings.length,
            archives: archives.length,
            summary: summary
          });
          
        const monthName = this.pdfService.getMonthName(this.selectedMonth);
        
        // Convert ServiceBooking to Booking model with room information
        const convertedBookings = bookings.map(booking => this.convertServiceBookingToBooking(booking, rooms, roomTypes));
        
        // Filter to only show reserved bookings in the reservations list
        const reservedBookings = convertedBookings.filter(booking => 
          booking.status === 'reserved' || booking.status === undefined
        );
        
        // Convert Archive data to include room type information
        const convertedArchives = archives.map(archive => this.convertArchiveData(archive));
        
          // Use summary data from backend
          const totalBookings = summary.totalBookings || 0;
          const totalArchived = summary.totalArchived || 0;
          this.totalCheckIns = summary.totalCheckIns || 0;
          this.totalCheckOuts = summary.totalCheckOuts || 0;
          
          // Use financial data from backend summary
          this.totalPaymentsReceived = summary.totalPaymentsReceived || 0;
          this.totalReservationFees = summary.totalReservationFees || 0;
          this.totalBasePrices = summary.totalBasePrices || 0;
          
          console.log('📊 Setting corrected component values:', {
            totalBookings,
            totalArchived,
            totalCheckIns: this.totalCheckIns,
            totalCheckOuts: this.totalCheckOuts,
            totalPaymentsReceived: this.totalPaymentsReceived,
            totalReservationFees: this.totalReservationFees
          });
          
          // Generate check-in and check-out lists for display
          this.checkInList = convertedBookings.filter(booking => 
            booking.status && booking.status.toLowerCase() === 'checked_in'
          ) || [];
          this.checkOutList = convertedBookings.filter(booking => 
            booking.status && booking.status.toLowerCase() === 'checked_out'
          ) || [];
          
          // Use additional data from backend summary
          this.totalNetPaid = summary.totalBasePrices || 0;
          this.totalAdditionalIncome = summary.totalReservationFees || 0;
          this.totalMonthlyRevenue = summary.totalRevenue || 0;
          this.netRevenue = summary.netRevenue || 0;
          
          return {
            bookings: reservedBookings,
            archives: convertedArchives,
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
          console.error('❌ Error loading corrected report data:', error);
          this.errorMessage = 'Failed to load report data. Please try again.';
          return of(null);
        })
      ).subscribe(data => {
        console.log('✅ Corrected report data loaded successfully:', data);
        this.reportData = data;
        this.isLoading = false;
        
        // Force change detection to update the template
        this.cdr.detectChanges();
        
        console.log('🔄 Template should now be updated with corrected data:', {
          totalBookings: this.reportData?.totalBookings,
          totalCheckIns: this.totalCheckIns,
          totalPaymentsReceived: this.totalPaymentsReceived
        });
      });
      
      return;
    }
    
    forkJoin({
      bookings: this.bookingService.getBookingsByMonth(backendMonth, this.selectedYear),
      archives: this.archiveService.getArchivesByMonth(backendMonth, this.selectedYear),
      rooms: this.roomService.getAllRooms(),
      roomTypes: this.roomService.getRoomTypes(),
      summary: this.bookingService.getMonthlySummary(backendMonth, this.selectedYear)
    }).pipe(
      map(({ bookings, archives, rooms, roomTypes, summary }) => {
        console.log(`📊 Received data for ${backendMonth}/${this.selectedYear}:`, {
          bookings: bookings.length,
          archives: archives.length,
          summary: summary
        });
        
        const monthName = this.pdfService.getMonthName(this.selectedMonth);
        
        // Convert ServiceBooking to Booking model with room information
        const convertedBookings = bookings.map(booking => this.convertServiceBookingToBooking(booking, rooms, roomTypes));
        
        // Filter to only show reserved bookings in the reservations list
        const reservedBookings = convertedBookings.filter(booking => 
          booking.status === 'reserved' || booking.status === undefined
        );
        
        // Convert Archive data to include room type information
        const convertedArchives = archives.map(archive => this.convertArchiveData(archive));
        
        // Use summary data from backend
        const totalBookings = summary.totalBookings || 0;
        const totalArchived = summary.totalArchived || 0;
        this.totalCheckIns = summary.totalCheckIns || 0;
        this.totalCheckOuts = summary.totalCheckOuts || 0;
        
        // Use financial data from backend summary
        this.totalPaymentsReceived = summary.totalPaymentsReceived || 0;
        this.totalReservationFees = summary.totalReservationFees || 0;
        this.totalBasePrices = summary.totalBasePrices || 0;
        
        console.log('📊 Setting component values:', {
          totalBookings,
          totalArchived,
          totalCheckIns: this.totalCheckIns,
          totalCheckOuts: this.totalCheckOuts,
          totalPaymentsReceived: this.totalPaymentsReceived,
          totalReservationFees: this.totalReservationFees
        });
        
        // Generate check-in and check-out lists for display
        this.checkInList = convertedBookings.filter(booking => 
          booking.status && booking.status.toLowerCase() === 'checked_in'
        ) || [];
        this.checkOutList = convertedBookings.filter(booking => 
          booking.status && booking.status.toLowerCase() === 'checked_out'
        ) || [];
        
        // Use additional data from backend summary
        this.totalNetPaid = summary.totalBasePrices || 0;
        this.totalAdditionalIncome = summary.totalReservationFees || 0;
        this.totalMonthlyRevenue = summary.totalRevenue || 0;
        this.netRevenue = summary.netRevenue || 0;
        
        return {
          bookings: reservedBookings,
          archives: convertedArchives,
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
        console.error('❌ Error loading report data:', error);
        this.errorMessage = 'Failed to load report data. Please try again.';
        return of(null);
      })
    ).subscribe(data => {
      console.log('✅ Report data loaded successfully:', data);
      this.reportData = data;
      this.isLoading = false;
      
      // Force change detection to update the template
      this.cdr.detectChanges();
      
      console.log('🔄 Template should now be updated with:', {
        totalBookings: this.reportData?.totalBookings,
        totalCheckIns: this.totalCheckIns,
        totalPaymentsReceived: this.totalPaymentsReceived
      });
    });
  }

  private filterBookingsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by month and year based on check-in date
      if (booking.availability && booking.availability.checkIn) {
        const checkInDate = new Date(booking.availability.checkIn);
        const bookingMonth = checkInDate.getMonth();
        const bookingYear = checkInDate.getFullYear();
        return bookingMonth === month && bookingYear === year;
      }
      return false;
    }) || [];
  }

  private filterArchivesByMonth(archives: Archive[], month: number, year: number): Archive[] {
    return archives.filter(archive => {
      // Filter by month and year based on created_at date
      if (archive.created_at) {
        const archiveDate = new Date(archive.created_at);
        const archiveMonth = archiveDate.getMonth();
        const archiveYear = archiveDate.getFullYear();
        return archiveMonth === month && archiveYear === year;
      }
      return false;
    }) || [];
  }

  private filterCheckInsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by reservation status = 'checked_in' and by month/year
      if (booking.status && booking.status.toLowerCase() === 'checked_in') {
        if (booking.availability && booking.availability.checkIn) {
          const checkInDate = new Date(booking.availability.checkIn);
          const bookingMonth = checkInDate.getMonth();
          const bookingYear = checkInDate.getFullYear();
          return bookingMonth === month && bookingYear === year;
        }
      }
      return false;
    }) || [];
  }

  private filterCheckOutsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      // Filter by reservation status = 'checked_out' and by month/year
      if (booking.status && booking.status.toLowerCase() === 'checked_out') {
        if (booking.availability && booking.availability.checkOut) {
          const checkOutDate = new Date(booking.availability.checkOut);
          const bookingMonth = checkOutDate.getMonth();
          const bookingYear = checkOutDate.getFullYear();
          return bookingMonth === month && bookingYear === year;
        }
      }
      return false;
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
      this.errorMessage = 'No report data available. Please select a month and year and refresh the data.';
      return;
    }

    try {
      console.log('Generating PDF for:', this.getSelectedMonthName(), this.selectedYear);
      console.log('Report data:', this.reportData);
      
      this.pdfService.generateMonthlyRevenueReport(this.reportData);
      
      // Clear any previous error messages
      this.errorMessage = '';
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.errorMessage = 'Failed to generate PDF. Please try again.';
    }
  }

  getSelectedMonthName(): string {
    console.log(`🔍 Getting month name for selectedMonth: ${this.selectedMonth} (type: ${typeof this.selectedMonth})`);
    
    // Ensure selectedMonth is a valid number
    const monthValue = Number(this.selectedMonth);
    console.log(`🔍 Converted month value: ${monthValue}`);
    
    const month = this.months.find(m => m.value === monthValue);
    console.log(`🔍 Found month:`, month);
    
    const monthName = month ? month.name : 'Unknown';
    console.log(`🔍 Returning month name: ${monthName}`);
    
    return monthName;
  }

  formatCurrency(amount: number | string | null | undefined): string {
    // Handle null, undefined, or empty values
    if (amount === null || amount === undefined || amount === '') {
      return '₱0.00';
    }
    
    // Convert string to number if needed
    let numericAmount: number;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount);
      // Check if conversion was successful
      if (isNaN(numericAmount)) {
        return '₱0.00';
      }
    } else {
      numericAmount = amount;
    }
    
    // Handle NaN or invalid numbers
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      return '₱0.00';
    }
    
    // Use explicit PHP prefix to avoid symbol issues
    const formattedAmount = numericAmount.toFixed(2);
    return `₱${formattedAmount}`;
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

  // Archive helper methods
  getArchiveGuestName(archive: any): string {
    if (archive.guest_firstName && archive.guest_lastName) {
      return `${archive.guest_firstName} ${archive.guest_lastName}`;
    }
    return 'N/A';
  }

  getArchiveRoomType(archive: any): string {
    // Try to get room type from room relationship or fallback to a default
    if (archive.Room && archive.Room.roomType) {
      return archive.Room.roomType.type;
    }
    return 'Standard Room'; // Default fallback
  }

  getArchiveStatus(archive: any): string {
    if (archive.pay_status === true) {
      return 'Completed';
    } else if (archive.pay_status === false) {
      return 'Cancelled';
    }
    return 'Archived';
  }

  getArchiveStatusClass(archive: any): string {
    const status = this.getArchiveStatus(archive);
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Archived':
        return 'status-archived';
      default:
        return 'status-archived';
    }
  }

  private convertServiceBookingToBooking(serviceBooking: ServiceBooking, rooms: Room[], roomTypes: RoomType[]): Booking {
    // Find the room for this booking
    const room = rooms.find(r => r.id === serviceBooking.room_id);
    // Find the room type for this room
    const roomType = room ? roomTypes.find(rt => rt.id === room.roomTypeId) : null;
    
    console.log(`🔄 Converting booking ${serviceBooking.id}:`, {
      guest_firstName: serviceBooking.guest_firstName,
      guest_lastName: serviceBooking.guest_lastName,
      guest_email: serviceBooking.guest_email,
      checkIn: serviceBooking.checkIn,
      checkOut: serviceBooking.checkOut,
      fullServiceBooking: serviceBooking
    });
    
    const convertedBooking = {
      id: serviceBooking.id,
      room_id: serviceBooking.room_id,
      guest: {
        first_name: serviceBooking.guest_firstName || '',
        last_name: serviceBooking.guest_lastName || '',
        email: serviceBooking.guest_email || '',
        phone: serviceBooking.guest_phone || '',
        address: serviceBooking.guest_address || '',
        city: serviceBooking.guest_city || ''
      },
      availability: {
        checkIn: serviceBooking.checkIn || '',
        checkOut: serviceBooking.checkOut || '',
        adults: serviceBooking.adults || 0,
        children: serviceBooking.children || 0,
        rooms: serviceBooking.rooms || 1
      },
      payment: {
        paymentMode: serviceBooking.paymentMode || '',
        paymentMethod: serviceBooking.paymentMethod || '',
        amount: serviceBooking.amount || 0,
        mobileNumber: '', // Default empty string since it's not in service interface
        cardNumber: serviceBooking.cardNumber || '',
        expiry: serviceBooking.expiry || '',
        cvv: serviceBooking.cvv || ''
      },
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
    
    console.log(`✅ Converted booking ${serviceBooking.id}:`, {
      guest_name: `${convertedBooking.guest.first_name} ${convertedBooking.guest.last_name}`,
      checkIn: convertedBooking.availability.checkIn,
      checkOut: convertedBooking.availability.checkOut
    });
    
    return convertedBooking;
  }

  // Helper method to convert archive data to include room type
  private convertArchiveData(archive: any): Archive {
    return {
      id: archive.id,
      roomNumber: archive.Room?.roomNumber || '',
      roomType: archive.Room?.roomType?.type || 'Standard Room',
      guest_firstName: archive.guest_firstName || '',
      guest_lastName: archive.guest_lastName || '',
      guest_email: archive.guest_email || '',
      guest_phone: archive.guest_phone || '',
      guest_address: archive.guest_address || '',
      guest_city: archive.guest_city || '',
      checkIn: archive.checkIn || '',
      checkOut: archive.checkOut || '',
      adults: archive.adults || 0,
      children: archive.children || 0,
      rooms: archive.rooms || 1,
      paymentMode: archive.paymentMode || '',
      paymentMethod: archive.paymentMethod || '',
      amount: archive.amount || 0,
      cardNumber: archive.cardNumber || '',
      expiry: archive.expiry || '',
      cvv: archive.cvv || '',
      room_id: archive.room_id,
      pay_status: archive.pay_status || false,
      created_at: archive.created_at,
      updated_at: archive.updated_at,
      requests: archive.specialRequests || '',
      paidamount: archive.paidamount || 0,
      deleted_at: archive.deleted_at || ''
    };
  }
}

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

  // Additional data for enhanced report
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
        
        // Generate check-in and check-out lists
        this.checkInList = this.filterCheckInsByMonth(convertedBookings, this.selectedMonth, this.selectedYear);
        this.checkOutList = this.filterCheckOutsByMonth(convertedBookings, this.selectedMonth, this.selectedYear);
        
        // Calculate enhanced totals based on room pricing management
        const totalBookings = filteredBookings.length;
        const totalArchived = filteredArchives.length;
        this.totalCheckIns = this.checkInList.length;
        this.totalCheckOuts = this.checkOutList.length;
        
        // Calculate pricing metrics - recalculate to ensure accuracy
        this.totalPaymentsReceived = filteredBookings
          .filter(booking => booking.pay_status)
          .reduce((sum, booking) => sum + (booking.paidamount || 0), 0);
        
        this.totalReservationFees = filteredBookings.reduce((sum, booking) => {
          return sum + this.calculateReservationFee(booking);
        }, 0);
        
        this.totalBasePrices = filteredBookings.reduce((sum, booking) => {
          return sum + (booking.room?.roomType?.basePrice || 0);
        }, 0);
        
        // Calculate net paid amounts for check-outs (Payment Received - Reservation Fee)
        this.totalNetPaid = this.checkOutList.reduce((sum, booking) => {
          const paymentReceived = booking.paidamount || 0;
          const reservationFee = this.calculateReservationFee(booking);
          const netPaid = Math.max(0, paymentReceived - reservationFee);
          return sum + netPaid;
        }, 0);
        
        // Calculate net revenue (Payments Received - Reservation Fees)
        this.netRevenue = this.totalPaymentsReceived - this.totalReservationFees;
        
        // Calculate total monthly revenue (Payments Received + Net Paid from check-outs)
        this.totalMonthlyRevenue = this.totalPaymentsReceived + this.totalNetPaid;
        
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
      if (!booking.availability?.checkIn) return false;
      
      const checkInDate = new Date(booking.availability.checkIn);
      return checkInDate.getMonth() === month && checkInDate.getFullYear() === year;
    });
  }

  private filterArchivesByMonth(archives: Archive[], month: number, year: number): Archive[] {
    return archives.filter(archive => {
      if (!archive.createdAt) return false;
      
      const archiveDate = new Date(archive.createdAt);
      return archiveDate.getMonth() === month && archiveDate.getFullYear() === year;
    });
  }

  private filterCheckInsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      if (!booking.availability?.checkIn) return false;
      
      const checkInDate = new Date(booking.availability.checkIn);
      return checkInDate.getMonth() === month && checkInDate.getFullYear() === year;
    });
  }

  private filterCheckOutsByMonth(bookings: Booking[], month: number, year: number): Booking[] {
    return bookings.filter(booking => {
      if (!booking.availability?.checkOut) return false;
      
      const checkOutDate = new Date(booking.availability.checkOut);
      return checkOutDate.getMonth() === month && checkOutDate.getFullYear() === year;
    });
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

  calculateTotalReservationAmount(booking: Booking): number {
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

  calculateNetPaidForBooking(booking: Booking): number {
    const paymentReceived = booking.paidamount || 0;
    const reservationFee = this.calculateReservationFee(booking);
    
    // Ensure both values are valid numbers
    if (isNaN(paymentReceived) || !isFinite(paymentReceived)) {
      return 0;
    }
    
    const netPaid = Math.max(0, paymentReceived - reservationFee);
    return netPaid;
  }

  getDateRange(): string {
    const monthName = this.getSelectedMonthName();
    return `${monthName} 1, ${this.selectedYear} - ${monthName} ${this.getDaysInMonth()}, ${this.selectedYear}`;
  }

  private getDaysInMonth(): number {
    return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
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

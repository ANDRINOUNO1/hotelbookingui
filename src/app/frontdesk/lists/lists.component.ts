import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoomAvailabilityService } from '../../_services/room-availability.service';
import { ReceiptComponent } from './pointofsale.modal';
import { Router } from '@angular/router';
import { RoomService } from '../../_services/room.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reservation {
  id: number;
  guest_firstName: string;
  guest_lastName: string;
  guest_email: string;
  guest_phone: string;
  roomType: string;
  roomTypeId?: number;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  room_id?: number;
  bookingStatus?: string;
  paymentMode?: string;
  requests?: {
    id: number;
    status: string;
    products: {
      id: number;
      name: string;
      price: number;
      quantity: number;
    }[];
  }[];
}

interface RoomType {
  id: number;
  type: string;
  basePrice: number;
  reservationFeePercentage: number;
}

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceiptComponent],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  checkedOutReservations: Reservation[] = [];
  filteredCheckedOutReservations: Reservation[] = [];
  roomRates: Record<string, number> = {};
  searchTerm: string = '';
  checkedOutSearchTerm: string = '';
  loading = false;
  error = '';
  showCheckoutModal = false;
  selectedReservation: Reservation | null = null;
  showExtendModal = false;
  extendDays = 1;
  newCheckoutDate = '';
  manualCheckoutDate = '';
  paymentMode: string = 'Cash';
  paymentAmount: number = 0;
  showPOS = false;
  receiptData: any = null;
  change: number = 0;
  grandTotalFromReceipt: number = 0;

  billbutton = false;   

  constructor(
    private http: HttpClient,
    private roomAvailabilityService: RoomAvailabilityService,
    private router: Router,
    private roomsService: RoomService
  ) {}

  ngOnInit() {
    this.loadReservations();
    this.loadRoomRates();
  }

  loadRoomRates() {
    this.roomsService.getRoomTypes().subscribe(types => {
        this.roomRates = types.reduce<Record<string, number>>((acc, t) => {
          acc[t.type.toLowerCase()] = typeof t.basePrice === 'string'
            ? parseFloat(t.basePrice)
            : t.basePrice;
          return acc;
        }, {});

      });
  }

  loadReservations() {
    this.loading = true;
    this.error = '';

    // Fetch rooms first so we can map roomType correctly
    this.http.get<any[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<any[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            const allReservations = bookingsData
              .map(booking => {
                const room = roomsData.find(r => r.id === booking.room_id);
                const checkIn = this.normalizeDate(booking.availability?.checkIn || booking.checkIn || null);
                const checkOut = this.normalizeDate(booking.availability?.checkOut || booking.checkOut || null);

                return {
                  id: booking.id,
                  guest_firstName: booking.guest?.first_name || booking.guest_firstName || '',
                  guest_lastName: booking.guest?.last_name || booking.guestLastName || '',
                  guest_email: booking.guest?.email || booking.guest_email || '',
                  guest_phone: booking.guest?.phone || booking.guest_phone || '',
                  
                  // ✅ Correctly fetch the room type
                  roomType: room?.roomType?.type || room?.RoomType?.type || booking.roomType?.type || booking.roomType || 'Classic',
                  roomTypeId: booking.roomTypeId || room?.roomTypeId,
                  
                  checkIn: checkIn,
                  checkOut: checkOut,
                  
                  // ✅ Correct rate fetch based on room type
                  roomRate: booking.roomRate || this.getRateForRoomType(room?.roomType || booking.roomType),
                  
                  totalAmount: booking.paidamount || booking.payment?.amount || 0,
                  status: booking.pay_status ? 'active' : 'pending',
                  room_id: booking.room_id,
                  bookingStatus: booking.status || 'reserved',
                  requests: booking.requests || []
                };
              })
              // Filter out archived
              .filter(reservation => reservation.status !== 'archived');

            // ✅ Separate active vs checked out
            this.reservations = allReservations.filter(r => r.bookingStatus !== 'checked_out');
            this.checkedOutReservations = allReservations.filter(r => r.bookingStatus === 'checked_out');

            // ✅ Apply search filters if any
            this.applySearch();
            this.applyCheckedOutSearch();

            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load bookings';
            this.loading = false;
            console.error('Error loading bookings:', err);
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        this.loading = false;
        console.error('Error loading rooms:', err);
      }
    });
  }

  getRateForRoomType(roomType: any): number {
    if (!roomType) return 0;

    // If roomType is an object (e.g. { type: 'Classic' })
    if (typeof roomType === 'object' && roomType.type) {
      roomType = roomType.type;
    }

    // Ensure it's a string before calling toLowerCase
    if (typeof roomType !== 'string') {
      console.warn('Unexpected roomType format:', roomType);
      return 0;
    }

    return this.roomRates[roomType.toLowerCase()] || 0;
  }


  calculateTotalAmount(reservation: Reservation): number {
    if (!reservation) return 0;

    // Room total
    const days = this.getDaysBetween(reservation.checkIn, reservation.checkOut);
    const roomRate = this.getRateForRoomType(reservation.roomType);
    const roomTotal = days * roomRate;

    // Requests total
    let requestsTotal = 0;
    const completedRequests = this.filterRequestsByStatus(reservation, 'completed');

    if (completedRequests && completedRequests.length > 0) {
      for (const req of completedRequests) {
        // Inner loop for products remains the same...
        for (const product of req.products) {
          requestsTotal += product.price * product.quantity;
        }
      }
    }

    return roomTotal + requestsTotal;
  }

  filterRequestsByStatus(reservation: Reservation, status: string): any[] {
    if (!reservation?.requests) {
      return [];
    }
    return reservation.requests.filter((req: any) => req.status === status);
  }

  applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      this.filteredReservations = this.reservations;
    } else {
      this.filteredReservations = this.reservations.filter(reservation => {
        const guestName = this.getGuestName(reservation).toLowerCase();
        const email = reservation.guest_email?.toLowerCase() || '';
        const phone = reservation.guest_phone?.toLowerCase() || '';
        const roomType = reservation.roomType?.toLowerCase() || '';
        const status = reservation.status?.toLowerCase() || '';
        
        return guestName.includes(term) || 
               email.includes(term) || 
               phone.includes(term) || 
               roomType.includes(term) || 
               status.includes(term);
      });
    }
  }

  applyCheckedOutSearch() {
    const term = this.checkedOutSearchTerm.trim().toLowerCase();
    
    if (!term) {
      this.filteredCheckedOutReservations = this.checkedOutReservations;
    } else {
      this.filteredCheckedOutReservations = this.checkedOutReservations.filter(reservation => {
        const guestName = this.getGuestName(reservation).toLowerCase();
        const email = reservation.guest_email?.toLowerCase() || '';
        const phone = reservation.guest_phone?.toLowerCase() || '';
        const roomType = reservation.roomType?.toLowerCase() || '';
        const status = reservation.status?.toLowerCase() || '';
        
        return guestName.includes(term) || 
               email.includes(term) || 
               phone.includes(term) || 
               roomType.includes(term) || 
               status.includes(term);
      });
    }
  }

  onSearchTermChange() {
    this.applySearch();
  }

  onCheckedOutSearchTermChange() {
    this.applyCheckedOutSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearch();
  }

  clearCheckedOutSearch() {
    this.checkedOutSearchTerm = '';
    this.applyCheckedOutSearch();
  }

  openExtendModal(reservation: Reservation) {
    this.http.get<any>(`${environment.apiUrl}/bookings/${reservation.id}`).subscribe({
      next: (latestBooking) => {
        if (latestBooking.status === 'checked_in') {
          
          this.selectedReservation = reservation;
          this.extendDays = 1; 
          this.manualCheckoutDate = '';

          if (reservation.checkOut && reservation.checkOut !== 'Invalid Date' && reservation.checkOut !== '') {
            try {
              const currentCheckout = new Date(reservation.checkOut);
              if (!isNaN(currentCheckout.getTime())) {
                const newCheckout = new Date(currentCheckout);
                newCheckout.setDate(currentCheckout.getDate() + 1);
                this.newCheckoutDate = newCheckout.toISOString().split('T')[0];
              } else {
                this.newCheckoutDate = '';
              }
            } catch (error) {
              console.error('Error setting default checkout date:', error);
              this.newCheckoutDate = '';
            }
          } else {
            this.newCheckoutDate = '';
          }
          
          this.showExtendModal = true;

        } else {
          alert('This booking is no longer active and cannot be extended.');
          this.loadReservations();
        }
      },
      error: (err) => {
        console.error('Could not verify booking status:', err);
        alert('Could not verify the booking status. Please refresh the page and try again.');
      }
    });
  }

  extendStay() {
    // Use either calendar input or manual input
    const checkoutDate = this.newCheckoutDate || this.manualCheckoutDate;
    
    if (!this.selectedReservation || !checkoutDate) {
      this.error = 'Please select a valid checkout date.';
      return;
    }

    try {
      // Validate the new checkout date
      const newCheckout = new Date(checkoutDate);
      const currentCheckout = new Date(this.selectedReservation.checkOut);
      
      if (isNaN(newCheckout.getTime())) {
        this.error = 'Invalid new checkout date. Please use format YYYY-MM-DD.';
        return;
      }
      
      if (isNaN(currentCheckout.getTime())) {
        this.error = 'Invalid current checkout date. Please contact support.';
        return;
      }
      
      if (newCheckout <= currentCheckout) {
        this.error = 'New checkout date must be after the current checkout date.';
        return;
      }
      
      // Check room availability for the extended period
      if (this.selectedReservation.room_id) {
        this.roomAvailabilityService.checkRoomAvailability(
          this.selectedReservation.room_id,
          this.selectedReservation.checkIn,
          checkoutDate,
          this.selectedReservation.id
        ).subscribe({
          next: (isAvailable) => {
            if (!isAvailable) {
              this.error = 'Room is not available for the extended date range. Please choose different dates.';
              return;
            }
            this.processExtension(checkoutDate);
          },
          error: (err) => {
            console.error('Error checking room availability:', err);
            this.error = 'Error checking room availability. Please try again.';
          }
        });
      } else {
        // If no room_id, proceed without availability check
        this.processExtension(checkoutDate);
      }
    } catch (error) {
      console.error('Error in extendStay:', error);
      this.error = 'Error processing extension. Please try again.';
    }
  }

  private processExtension(checkoutDate: string) {
    // Calculate the number of additional days
    const newCheckout = new Date(checkoutDate);
    const currentCheckout = new Date(this.selectedReservation!.checkOut);
    const additionalDays = Math.ceil((newCheckout.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate new total amount
    const ratePerNight = this.getRateForRoomType(this.selectedReservation!.roomType);
    const additionalAmount = additionalDays * ratePerNight;
    const newTotalAmount = this.selectedReservation!.totalAmount + additionalAmount;

    const updatedReservation = {
      checkOut: checkoutDate,
      totalAmount: newTotalAmount
    };

    this.http.patch(`${environment.apiUrl}/bookings/${this.selectedReservation!.id}/extend`, updatedReservation)
      .subscribe({
        next: () => {
          this.loadReservations();
          this.showExtendModal = false;
          this.selectedReservation = null;
          this.newCheckoutDate = '';
          this.manualCheckoutDate = '';
          this.error = '';
        },
        error: (err) => {
          console.error('Error extending stay:', err);
          this.error = 'Failed to extend stay';
        }
      });
  }

  openCheckoutModal(reservation: Reservation) {
    this.selectedReservation = reservation;
    const totalBill = this.calculateTotalAmount(reservation);
    this.paymentAmount = reservation.totalAmount;
    this.showCheckoutModal = true;
  }

  onTotalCalculated(total: number) {
    this.grandTotalFromReceipt = total;
  }

  canCheckout(): boolean {
    if (!this.selectedReservation) return false;

    const total = this.calculateTotalAmount(this.selectedReservation);
    return this.paymentAmount >= total;
  }

  confirmCheckout() {
    if (!this.selectedReservation) return;

    // Capture reservation and room details before making requests
    const reservationToCheckOut = this.selectedReservation;
    const roomId = reservationToCheckOut.room_id;
    

    // Step 1: Update the booking status to 'checked_out'
    this.http.patch(`${environment.apiUrl}/bookings/${reservationToCheckOut.id}/checkout`, {})
      .subscribe({
        next: () => {
          console.log('✅ Booking status updated to checked_out successfully');

          const revenuePayload = {
            source: 'Booking',
            amount: this.grandTotalFromReceipt || 0, 
            paymentType: this.paymentMode || 'Unknown',
            // ✅ Add the current timestamp for the transaction date.
            transactionDate: new Date().toISOString() 
          };

          // Step 2: POST the new revenue record to the server.
          this.http.post(`${environment.apiUrl}/revenues`, revenuePayload)
            .subscribe({
              next: (newRevenue) => {
                console.log('✅ New revenue record added successfully:', newRevenue);
              },
              error: (err) => {
                console.error('❌ Failed to add new revenue record:', err);
                this.error = 'Booking checked out, but revenue was not recorded.';
              }
            });

          // Step 3: If a room is associated, update its status
          if (roomId) {
            this.http.put(`${environment.apiUrl}/rooms/${roomId}`, { roomStatus: 'Vacant and Ready' })
              .subscribe({
                next: () => {
                  console.log('✅ Room status updated to Vacant and Ready');
                  this.loadReservations();
                  setTimeout(() => this.printReceipt(), 300);
                  this.showCheckoutModal = false;
                  this.selectedReservation = null;
                },
                error: (err) => {
                  console.error('❌ Failed to update room status:', err);
                  this.error = 'Booking was checked out, but failed to update the room status.';
                }
              });
          } else {
            // If no room was linked, just reload and close
            this.loadReservations();
            this.showCheckoutModal = false;
            this.selectedReservation = null;
          }
          this.receiptData = {
            date: new Date().toLocaleString(),
            guest: `${reservationToCheckOut.guest_firstName} ${reservationToCheckOut.guest_lastName}`,
            email: reservationToCheckOut.guest_email,
            phone: reservationToCheckOut.guest_phone,
            room: reservationToCheckOut.roomType,
            checkIn: reservationToCheckOut.checkIn,
            checkOut: reservationToCheckOut.checkOut,
            total: this.grandTotalFromReceipt,
            payment: this.paymentAmount,
            change: this.paymentAmount - this.grandTotalFromReceipt,
            mode: this.paymentMode,
          };

          this.showCheckoutModal = false;
          this.billbutton = true; // shows success modal
        },
        error: (err) => {
          console.error('❌ Error updating booking status:', err);
          this.error = 'Failed to check out the booking.';
        }
      });
  }

  generatePDF() {
    if (!this.receiptData) return;

    const doc = new jsPDF();

    doc.setFont('helvetica', ''); 
    doc.setFontSize(18);
    doc.text('🏨 Hotel Checkout Receipt', 60, 20);

    doc.setDrawColor(0, 0, 0);
    doc.line(14, 25, 195, 25);

    doc.setFontSize(12);
    const startY = 35;
    const lineHeight = 8;

    doc.text(`📅 Date: ${this.receiptData.date}`, 14, startY);
    doc.text(`👤 Guest: ${this.receiptData.guest}`, 14, startY + lineHeight);
    doc.text(`✉️ Email: ${this.receiptData.email}`, 14, startY + lineHeight * 2);
    doc.text(`📞 Phone: ${this.receiptData.phone}`, 14, startY + lineHeight * 3);
    doc.text(`🛏️ Room: ${this.receiptData.room}`, 14, startY + lineHeight * 4);
    doc.text(`⬅️ Check-In: ${this.receiptData.checkIn}`, 14, startY + lineHeight * 5);
    doc.text(`➡️ Check-Out: ${this.receiptData.checkOut}`, 14, startY + lineHeight * 6);

    const tableStartY = startY + lineHeight * 8;

    const formatCurrency = (amount: number) =>
      `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    autoTable(doc, {
      startY: tableStartY,
      head: [['Description', 'Amount (₱)']],
      body: [
        ['Total Bill', formatCurrency(this.receiptData.total)],
        ['Payment', formatCurrency(this.receiptData.payment)],
        ['Change', formatCurrency(this.receiptData.change)],
        ['Payment Mode', this.receiptData.mode],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold',
      },
      bodyStyles: {
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'right' },
      },
      styles: {
        fontSize: 11,
        cellPadding: 6,
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 20;
    doc.setFontSize(13);
    doc.setTextColor(50);
    doc.text('✨ Thank you for staying with us! ✨', 60, finalY + 20);

    doc.save(`Receipt-${this.receiptData.guest}.pdf`);
  }

  closeSuccessModal() {
    this.billbutton = false;
    this.receiptData = null;
  }

  printReceipt() {
    if (!this.receiptData) return;
    
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    receiptWindow!.document.write(`
      <html>
        <head><title>Receipt</title></head>
        <body style="font-family: Arial; padding: 10px;">
          <h2 style="text-align:center;">Hotel Receipt</h2>
          <p><strong>Date:</strong> ${this.receiptData.date}</p>
          <p><strong>Guest:</strong> ${this.receiptData.guest}</p>
          <p><strong>Email:</strong> ${this.receiptData.email}</p>
          <p><strong>Phone:</strong> ${this.receiptData.phone}</p>
          <p><strong>Room:</strong> ${this.receiptData.room}</p>
          <p><strong>Check-in:</strong> ${this.receiptData.checkIn}</p>
          <p><strong>Check-out:</strong> ${this.receiptData.checkOut}</p>
          <hr>
          <p><strong>Total:</strong> ₱${this.receiptData.total}</p>
          <p><strong>Payment:</strong> ₱${this.receiptData.payment}</p>
          <p><strong>Change:</strong> ₱${this.receiptData.change}</p>
          <p><strong>Mode:</strong> ${this.receiptData.mode}</p>
          <hr>
          <p style="text-align:center;">Thank you for staying with us!</p>
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `);
    receiptWindow!.document.close();
  }

  cancelCheckout() {
    this.showCheckoutModal = false;
    this.selectedReservation = null;
  }

  cancelExtend() {
    this.showExtendModal = false;
    this.selectedReservation = null;
    this.newCheckoutDate = '';
    this.manualCheckoutDate = '';
  }

  private getDaysBetween(checkIn: string, checkOut: string): number {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Invalid dates in getDaysBetween:', checkIn, checkOut);
        return 1; 
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure minimum of 1 day
      return Math.max(days, 1);
    } catch (error) {
      console.error('Error calculating days between dates:', error);
      return 1; 
    }
  }

  getGuestName(reservation: Reservation): string {
    return `${reservation.guest_firstName} ${reservation.guest_lastName}`;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString()}`;
  }


  // Helper method to normalize date formats from backend
  private normalizeDate(dateString: any): string {
    if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
      console.warn('Empty or null date string received:', dateString);
      return '';
    }
    
    try {
      let date: Date;
      
      // Handle different date formats
      if (typeof dateString === 'string') {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        
        // Try parsing as ISO or other formats
        date = new Date(dateString);
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Try to convert to string and parse
        date = new Date(String(dateString));
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return '';
      }
      
      // Return in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error normalizing date:', dateString, error);
      return '';
    }
  }

  getNewCheckoutDate(): string {
    if (!this.selectedReservation) return '';
    
    try {
      // Handle different date formats from backend
      let checkoutDate: Date;
      const checkoutString = this.selectedReservation.checkOut;
      
      // Try parsing the date string
      if (checkoutString.includes('T')) {
        // ISO format
        checkoutDate = new Date(checkoutString);
      } else if (checkoutString.includes('-')) {
        // YYYY-MM-DD format
        checkoutDate = new Date(checkoutString + 'T00:00:00');
      } else {
        // Try direct parsing
        checkoutDate = new Date(checkoutString);
      }
      
      // Validate the date
      if (isNaN(checkoutDate.getTime())) {
        console.error('Invalid checkout date:', checkoutString);
        return 'Invalid Date';
      }
      
      const newCheckout = new Date(checkoutDate);
      newCheckout.setDate(checkoutDate.getDate() + this.extendDays);
      
      return this.formatDate(newCheckout.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error calculating new checkout date:', error);
      return 'Error calculating date';
    }
  }

  getMinCheckoutDate(): string {
    if (!this.selectedReservation || !this.selectedReservation.checkOut) return '';
    try {
      const currentCheckout = new Date(this.selectedReservation.checkOut);
      if (isNaN(currentCheckout.getTime())) return '';
      
      // Minimum date is current checkout date + 1 day
      const minDate = new Date(currentCheckout);
      minDate.setDate(currentCheckout.getDate() + 1);
      return minDate.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  getMaxCheckoutDate(): string {
    if (!this.selectedReservation || !this.selectedReservation.checkOut) return '';
    try {
      const currentCheckout = new Date(this.selectedReservation.checkOut);
      if (isNaN(currentCheckout.getTime())) return '';
      const maxDate = new Date(currentCheckout);
      maxDate.setDate(currentCheckout.getDate() + 30);
      return maxDate.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  getAdditionalDays(): number {
    const checkoutDate = this.newCheckoutDate || this.manualCheckoutDate;
    if (!this.selectedReservation || !checkoutDate) return 0;
    try {
      const currentCheckout = new Date(this.selectedReservation.checkOut);
      const newCheckout = new Date(checkoutDate);
      
      if (isNaN(currentCheckout.getTime()) || isNaN(newCheckout.getTime())) {
        return 0;
      }
      
      const additionalDays = Math.ceil((newCheckout.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(additionalDays, 0);
    } catch (error) {
      return 0;
    }
  }

  showBilling(reservation: any) {
    const billNo = 'BILL-' + reservation?.id;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/billing'], {
        queryParams: {
          reservation: JSON.stringify(reservation),
          paymentAmount: this.paymentAmount,
          billNo: billNo
        }
      })
    );
    window.open(url, '_blank'); // Opens in a new tab
  }

}

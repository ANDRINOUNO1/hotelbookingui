import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RoomAvailabilityService } from '../../_services/room-availability.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  showCheckoutModal = false;
  selectedReservation: Reservation | null = null;
  showExtendModal = false;
  extendDays = 1;
  newCheckoutDate = '';
  manualCheckoutDate = '';

  constructor(
    private http: HttpClient,
    private roomAvailabilityService: RoomAvailabilityService
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (bookingsData) => {
        this.reservations = bookingsData
          .map(booking => {
            const checkIn = this.normalizeDate(booking.availability?.checkIn || booking.checkIn || null);
            const checkOut = this.normalizeDate(booking.availability?.checkOut || booking.checkOut || null);
            
            return {
              id: booking.id,
              guest_firstName: booking.guest?.first_name || booking.guest_firstName || '',
              guest_lastName: booking.guest?.last_name || booking.guest_lastName || '',
              guest_email: booking.guest?.email || booking.guest_email || '',
              guest_phone: booking.guest?.phone || booking.guest_phone || '',
              roomType: booking.roomType || 'Classic',
              roomTypeId: booking.roomTypeId,
              checkIn: checkIn,
              checkOut: checkOut,
              totalAmount: booking.paidamount || booking.payment?.amount || 0,
              status: booking.pay_status ? 'active' : 'pending',
              room_id: booking.room_id,
              bookingStatus: booking.status || 'reserved'
            };
          })
          .filter(reservation => 
            reservation.status !== 'archived' && 
            reservation.bookingStatus === 'checked_in'
          );
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reservations';
        this.loading = false;
        console.error('Error loading reservations:', err);
      }
    });
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

  onSearchTermChange() {
    this.applySearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearch();
  }

  openExtendModal(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.extendDays = 1; // Default to 1 day
    this.manualCheckoutDate = '';
    
    // Set default new checkout date (current checkout + 1 day)
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
    const currentDays = this.getDaysBetween(this.selectedReservation!.checkIn, this.selectedReservation!.checkOut);
    const ratePerNight = 1500;
    const additionalAmount = additionalDays * ratePerNight;
    const newTotalAmount = this.selectedReservation!.totalAmount + additionalAmount;

    const updatedReservation = {
      checkOut: checkoutDate,
      totalAmount: newTotalAmount,
      guest_firstName: this.selectedReservation!.guest_firstName,
      guest_lastName: this.selectedReservation!.guest_lastName,
      guest_email: this.selectedReservation!.guest_email,
      guest_phone: this.selectedReservation!.guest_phone,
      checkIn: this.selectedReservation!.checkIn,
      roomType: this.selectedReservation!.roomType,
      status: this.selectedReservation!.bookingStatus || 'checked_in'
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
    this.showCheckoutModal = true;
  }

  confirmCheckout() {
    if (!this.selectedReservation) return;

    // checkout reservation
    this.http.delete(`${environment.apiUrl}/bookings/${this.selectedReservation.id}`)
      .subscribe({
        next: () => {
          this.loadReservations();
          this.showCheckoutModal = false;
          this.selectedReservation = null;
        },
        error: (err) => {
          console.error('Error completing checkout:', err);
          this.error = 'Failed to complete checkout';
        }
      });
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
    return `P${amount.toLocaleString()}`;
  }

  calculateTotalAmount(reservation: Reservation): number {
    try {
      // Skip calculation if dates are invalid
      if (!reservation.checkIn || !reservation.checkOut) {
        return 0;
      }
      
      // Calculate days between check-in and check-out
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      
      // Validate dates
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return 0;
      }
      
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // Ensure days is not negative or zero
      if (days <= 0) {
        return 0;
      }
      
      // For now, use a default rate of 1500 per night if room type info is not available
      const ratePerNight = 1500;
      
      return days * ratePerNight;
    } catch (error) {
      return 0;
    }
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
      
      // Maximum date is current checkout date + 30 days (reasonable limit)
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
}

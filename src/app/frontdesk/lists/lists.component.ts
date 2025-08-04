import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  loading = false;
  error = '';
  showCheckoutModal = false;
  selectedReservation: Reservation | null = null;
  showExtendModal = false;
  extendDays = 1;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading = true;
    this.error = '';
    
    this.http.get<any[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<any[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            this.reservations = bookingsData
              .map(booking => {
                const room = roomsData.find(r => r.id === booking.room_id);
                if (room) {
                  return {
                    id: booking.id,
                    guest_firstName: booking.guest?.first_name || booking.guest_firstName || '',
                    guest_lastName: booking.guest?.last_name || booking.guest_lastName || '',
                    guest_email: booking.guest?.email || booking.guest_email || '',
                    guest_phone: booking.guest?.phone || booking.guest_phone || '',
                    roomType: room.RoomType?.type || 'Classic',
                    roomTypeId: room.room_type_id,
                    checkIn: booking.availability?.checkIn || booking.checkIn || '',
                    checkOut: booking.availability?.checkOut || booking.checkOut || '',
                    totalAmount: booking.paidamount || booking.payment?.amount || 0,
                    status: booking.pay_status ? 'active' : 'pending',
                    room_id: booking.room_id
                  };
                }
                return null;
              })
              .filter(reservation => reservation !== null);
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load reservations';
            this.loading = false;
            console.error('Error loading reservations:', err);
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load room data';
        this.loading = false;
        console.error('Error loading rooms:', err);
      }
    });
  }

  openExtendModal(reservation: Reservation) {
    this.selectedReservation = reservation;
    this.extendDays = 1;
    this.showExtendModal = true;
  }

  extendStay() {
    if (!this.selectedReservation) return;

    const newCheckOut = new Date(this.selectedReservation.checkOut);
    newCheckOut.setDate(newCheckOut.getDate() + this.extendDays);

    const updatedReservation = {
      ...this.selectedReservation,
      checkOut: newCheckOut.toISOString().split('T')[0],
      totalAmount: this.selectedReservation.totalAmount + (this.selectedReservation.totalAmount / this.getDaysBetween(this.selectedReservation.checkIn, this.selectedReservation.checkOut) * this.extendDays)
    };

    this.http.put(`${environment.apiUrl}/bookings/${this.selectedReservation.id}`, updatedReservation)
      .subscribe({
        next: () => {
          this.loadReservations();
          this.showExtendModal = false;
          this.selectedReservation = null;
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
  }

  private getDaysBetween(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getGuestName(reservation: Reservation): string {
    return `${reservation.guest_firstName} ${reservation.guest_lastName}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return `P${amount.toLocaleString()}`;
  }

  calculateTotalAmount(reservation: Reservation): number {
    // Calculate days between check-in and check-out
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // For now, use a default rate of 1500 per night if room type info is not available
    const ratePerNight = 1500; // This should be fetched from room type data
    
    return days * ratePerNight;
  }

  getNewCheckoutDate(): string {
    if (!this.selectedReservation) return '';
    const currentCheckout = new Date(this.selectedReservation.checkOut);
    const newCheckout = new Date(currentCheckout);
    newCheckout.setDate(currentCheckout.getDate() + this.extendDays);
    return this.formatDate(newCheckout.toISOString().split('T')[0]);
  }
}

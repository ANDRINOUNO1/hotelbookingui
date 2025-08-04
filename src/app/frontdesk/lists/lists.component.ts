import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Reservation {
  id: number;
  guest_firstName: string;
  guest_lastName: string;
  guest_email: string;
  guest_phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
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
    
    this.http.get<Reservation[]>('https://capstone2backenddeployment-production.up.railway.app/bookings')
      .subscribe({
        next: (data) => {
          this.reservations = data.filter(booking => booking.status !== 'archived');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load reservations';
          this.loading = false;
          console.error('Error loading reservations:', err);
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

    this.http.put(`https://capstone2backenddeployment-production.up.railway.app/bookings/${this.selectedReservation.id}`, updatedReservation)
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

    // Use the deleteBooking endpoint which already handles archiving
    this.http.delete(`https://capstone2backenddeployment-production.up.railway.app/bookings/${this.selectedReservation.id}`)
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
    return `₱${amount.toLocaleString()}`;
  }

  getNewCheckoutDate(): string {
    if (!this.selectedReservation) return '';
    const currentCheckout = new Date(this.selectedReservation.checkOut);
    const newCheckout = new Date(currentCheckout);
    newCheckout.setDate(currentCheckout.getDate() + this.extendDays);
    return this.formatDate(newCheckout.toISOString().split('T')[0]);
  }
}

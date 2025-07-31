import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Room, Booking } from '../../_models/booking.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent {
occupiedRooms: any[] = [];
  selectedBooking: any = null;
  selectedCustomer: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupiedRooms();
  }

  loadOccupiedRooms() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            const grouped: { [email: string]: any } = {};

            bookingsData.forEach(booking => {
              const guestEmail = booking.guest.email;
              const room = roomsData.find(r => r.id === booking.room_id);

              if (!grouped[guestEmail]) {
                grouped[guestEmail] = {
                  guest: booking.guest,
                  rooms: []
                };
              }

              grouped[guestEmail].rooms.push({
                number: room?.roomNumber,
                                 type: room?.RoomType?.type || '',
                status: room?.status ? 'Available' : 'Occupied',
                paymentStatus: booking.pay_status ? 'Paid' : 'Unpaid',
                booking
              });
            });

            this.occupiedRooms = Object.values(grouped);
          },
          error: (err) => console.error('Failed to load bookings:', err)
        });
      },
      error: (err) => console.error('Failed to load rooms:', err)
    });
  }

  updateBooking(id: number, changes: Partial<Booking>) {
    this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, changes).subscribe(() => {
      this.loadOccupiedRooms();
      this.closePopup();
    });
  }

  deleteBooking(id: number) {
    this.http.delete(`${environment.apiUrl}/bookings/${id}`).subscribe(() => {
      this.loadOccupiedRooms();
    });
  }
  editMode = false;
  openEditPopup(room: any) {
    this.selectedBooking = { 
      ...room.booking,
      payment: room.booking.payment || {
        cardNumber: '',
        expiry: '',
        cvv: ''
      }
    };
  }
  openViewPopup(room: any) {
    this.selectedBooking = { 
      ...room.booking,
      payment: room.booking.payment || {
        cardNumber: '',
        expiry: '',
        cvv: ''
      }
    };
    this.editMode = false;
  }

  openCustomerPopup(customer: any) {
    this.selectedCustomer = customer;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
  closePopup() {
    this.selectedCustomer = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Room, Booking } from '../../_models/booking.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-allbookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allbookings.component.html',
  styleUrl: './allbookings.component.scss'
})
export class AllbookingsComponent implements OnInit {
  occupiedRooms: any[] = [];
  selectedBooking: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupiedRooms();
  }

  loadOccupiedRooms() {
    this.http.get<Room[]>('/api/rooms').subscribe({
      next: (roomsData) => {
        this.http.get<Booking[]>('/api/bookings').subscribe({
          next: (bookingsData) => {
            this.occupiedRooms = roomsData
              .map(room => {
                const booking = bookingsData.find(
                  b => b.room_id === room.id
                );
                if (booking) {
                  return {
                    id: booking.id,
                    number: room.room_number,
                    guest: `${booking.guest.first_name} ${booking.guest.last_name}`,
                    address: `${booking.guest.address}, ${booking.guest.city}`,
                    type: room.roomType?.type || '',
                    status: 'occupied',
                    paymentStatus: booking.pay_status ? 'Paid' : 'Unpaid',
                    booking
                  };
                }
                return null;
              })
              .filter(room => room !== null);
          },
          error: (err) => console.error('Failed to load bookings:', err)
        });
      },
      error: (err) => console.error('Failed to load rooms:', err)
    });
  }

  updateBooking(id: number, changes: Partial<Booking>) {
    this.http.put<Booking>(`/api/bookings/${id}`, changes).subscribe(() => {
      this.loadOccupiedRooms();
      this.closePopup();
    });
  }

  deleteBooking(id: number) {
    this.http.delete(`/api/bookings/${id}`).subscribe(() => {
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
    this.editMode = false; // Always start in view mode
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
  closePopup() {
    this.selectedBooking = null;
    this.editMode = false;
  }
}

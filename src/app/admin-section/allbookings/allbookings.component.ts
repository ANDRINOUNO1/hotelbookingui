import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../_models/booking.model';
import { Room } from '../../_models/room.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-allbookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allbookings.component.html',
  styleUrl: './allbookings.component.scss'
})
export class AllbookingsComponent implements OnInit {
  occupiedRooms: any[] = [];
  filteredRooms: any[] = [];
  searchTerm: string = '';
  selectedBooking: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupiedRooms();
  }

  getStatusClass(booking: Booking): string {
    switch (booking.status) {
      case 'reserved':
        return booking.pay_status
          ? 'status-guaranteed'
          : 'status-not-guaranteed';
      case 'checked_in':
        return 'status-checked-in';
      case 'checked_out':
        return 'status-checked-out';
      default:
        return 'status-unknown';
    }
  }

  getPaymentClass(paymentStatus: string): string {
    return paymentStatus.toLowerCase() === 'paid'
      ? 'payment-paid'
      : 'payment-unpaid';
  }

  loadOccupiedRooms() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            this.occupiedRooms = bookingsData
              .map(booking => {
                const room = roomsData.find(r => r.id === booking.room_id);
                if (room) {
                  return {
                    id: booking.id,
                    roomId: room.id,
                    number: room.roomNumber || 'N/A',
                    guest: `${booking.guest.first_name} ${booking.guest.last_name}`,
                    address: `${booking.guest.address}, ${booking.guest.city}`,
                    type: room.roomType?.type || room.RoomType?.type || 'Classic',
                    statusText: booking.status === 'reserved'
                      ? (booking.pay_status ? 'Reserved - Guaranteed' : 'Reserved - Not Guaranteed')
                      : booking.status === 'checked_in'
                        ? 'Checked In'
                        : booking.status === 'checked_out'
                          ? 'Checked Out'
                          : booking.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Unknown',
                    statusClass: this.getStatusClass(booking),
                    paymentStatus: booking.pay_status ? 'Paid' : 'Unpaid',
                    booking
                  };
                }
                return null;
              })
              .filter(room => room !== null);
            this.applySearch();
          },
          error: (err) => {
            console.error('Failed to load bookings:', err);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
      }
    });
  }

  applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredRooms = this.occupiedRooms;
    } else {
      this.filteredRooms = this.occupiedRooms.filter(room =>
        (room.guest?.toLowerCase() || '').includes(term) ||
        (room.number?.toString() || '').includes(term) ||
        (room.type?.toLowerCase() || '').includes(term) ||
        (room.paymentStatus?.toLowerCase() || '').includes(term) ||
        (room.status?.toLowerCase() || '').includes(term) 
      );
    }
  }

  updateBooking(id: number, changes: Partial<Booking>) {
    this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, changes).subscribe(() => {
      this.loadOccupiedRooms();
      this.closePopup();
    });
  }

  deleteBooking(id: number, roomId: number) {
    if (!roomId) {
      console.error('deleteBooking called without a valid roomId for booking', id);
      this.http.delete(`${environment.apiUrl}/bookings/${id}`).subscribe(() => {
        this.loadOccupiedRooms();
        this.closePopup();
      }, err => console.error('Error deleting booking:', err));
      return;
    }

    this.http.delete(`${environment.apiUrl}/bookings/${id}`).subscribe(() => {
      this.setRoomVacant(roomId);
      this.loadOccupiedRooms();
      this.closePopup();
    }, err => console.error('Error deleting booking:', err));
  }

  setRoomVacant(roomId: number) {
    this.http.put(`${environment.apiUrl}/rooms/${roomId}`, { roomStatus: 'Vacant and Ready' })
      .subscribe({
        next: () => console.log(`Room ${roomId} set to Vacant and Ready`),
        error: err => console.error('Error updating room status:', err)
      });
  }

  editMode = false;
  openEditPopup(room: any) {
    // include room-level fields (roomId, number, type) so actions can reference them
    this.selectedBooking = { 
      ...room.booking,
      roomId: room.roomId,
      roomNumber: room.number,
      roomType: room.type,
      payment: room.booking.payment || {
        cardNumber: '',
        expiry: '',
        cvv: ''
      }
    };
  }
  openViewPopup(room: any) {
    // include room-level fields (roomId, number, type) so actions can reference them
    this.selectedBooking = { 
      ...room.booking,
      roomId: room.roomId,
      roomNumber: room.number,
      roomType: room.type,
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

  closeViewPopup() {
    this.selectedBooking = null;
    this.editMode = false;
  }

  onSearchTermChange() {
    this.applySearch();
  }
}

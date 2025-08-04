import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Room, Booking } from '../../_models/booking.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent implements OnInit{
  occupiedRooms: any[] = [];
  filteredRooms: any[] = [];
  searchTerm: string = '';
  selectedBooking: any = null;
  isLoading: boolean = true;


  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupiedRooms();
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
                    number: room.roomNumber || 'N/A',
                    guest: `${booking.guest.first_name} ${booking.guest.last_name}`,
                    address: `${booking.guest.address}, ${booking.guest.city}`,
                    type: room.RoomType?.type || 'Classic',
                    status: booking.pay_status ? 'paid' : 'occupied',
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
        (room.status?.toLowerCase() || '').includes(term) ||
        (room.paymentStatus?.toLowerCase() || '').includes(term)
      );
    }
  }
  confirmPayment(room: any) {
    const updatedBooking = {
      ...room.booking,
      pay_status: true
    };

    this.http.put<Booking>(`${environment.apiUrl}/bookings/${room.id}`, updatedBooking).subscribe({
      next: (updatedBooking) => {
        this.loadOccupiedRooms();
      },
      error: (err) => {
      }
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
      this.closePopup();
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

  onSearchTermChange() {
    this.applySearch();
  }
}

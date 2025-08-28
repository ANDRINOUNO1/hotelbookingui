import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../_models/booking.model';
import { Room } from '../../_models/room.model';
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
  filteredRooms: any[] = [];
  searchTerm: string = '';
  selectedBooking: any = null;
  selectedCustomer: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReservedBookings();
  }

  loadReservedBookings() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            const grouped: { [email: string]: any } = {};

            // Filter bookings to only show reserved (not checked in) bookings
            const reservedBookings = bookingsData.filter(booking => 
              booking.status === 'reserved' || !booking.status
            );

            reservedBookings.forEach(booking => {
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
                type: room?.roomType?.type || room?.RoomType?.type || '',
                status: room?.roomStatus ? 'Vacant and Ready' : 'Occupied',
                paymentStatus: booking.pay_status ? 'Paid' : 'Unpaid',
                booking
              });
            });

            this.occupiedRooms = Object.values(grouped);
            this.applySearch();
          },
          error: (err) => console.error('Failed to load bookings:', err)
        });
      },
      error: (err) => console.error('Failed to load rooms:', err)
    });
  }

  applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      this.filteredRooms = this.occupiedRooms;
    } else {
      this.filteredRooms = this.occupiedRooms.filter(customer => {
        const firstName = customer.guest.first_name?.toLowerCase() || '';
        const lastName = customer.guest.last_name?.toLowerCase() || '';
        const email = customer.guest.email?.toLowerCase() || '';
        const phone = customer.guest.phone?.toLowerCase() || '';
        const roomTypeMatch = customer.rooms.some((room: any) => room.type?.toLowerCase().includes(term));
        const roomNumberMatch = customer.rooms.some((room: any) => room.number?.toString().includes(term));
        
        return firstName.includes(term) || 
               lastName.includes(term) || 
               email.includes(term) || 
               phone.includes(term) || 
               roomTypeMatch || 
               roomNumberMatch;
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

  checkIn(bookingId: number, roomId: number) {
    // Step 1: update booking
    this.http.patch<Booking>(`${environment.apiUrl}/bookings/${bookingId}/check-in`, {}).subscribe({
      next: (response) => {
        console.log('✅ Booking checked in successfully:', response);

        // Step 2: update room status to Occupied
        this.http.put(`${environment.apiUrl}/rooms/${roomId}`, { roomStatus: 'Occupied' }).subscribe({
          next: () => {
            console.log('✅ Room status updated to Occupied');
            this.loadReservedBookings(); // refresh UI
            this.closePopup();
          },
          error: (err) => {
            console.error('❌ Failed to update room status:', err);
            alert('Booking checked in but room status update failed.');
          }
        });
      },
      error: (err) => {
        console.error('❌ Failed to check in booking:', err);
        alert('Failed to check in booking. Please try again.');
      }
    });
  }


  updateBooking(id: number, changes: Partial<Booking>) {
    this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, changes).subscribe(() => {
      this.loadReservedBookings();
      this.closePopup();
    });
  }

  deleteBooking(id: number) {
    this.http.delete(`${environment.apiUrl}/bookings/${id}`).subscribe(() => {
      this.loadReservedBookings();
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

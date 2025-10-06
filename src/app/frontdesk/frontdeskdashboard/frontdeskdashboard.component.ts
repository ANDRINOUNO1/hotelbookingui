import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room, RoomType, Booking } from '../../_models/booking.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Added for [(ngModel)]

@Component({
  selector: 'app-frontdeskdashboard',
  templateUrl: './frontdeskdashboard.component.html',
  styleUrls: ['./frontdeskdashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // ✅ Added FormsModule
  providers: [DatePipe]
})
export class FrontdeskdashboardComponent implements OnInit {
  rooms: Room[] = [];
  bookings: Booking[] = [];
  filteredBookings: Booking[] = []; // ✅ Filtered bookings based on selected date

  roomTypes: RoomType[] = [];
  roomsByType: { [key: string]: Room[] } = {};
  selectedType: string = '';
  availableRooms = 0;
  occupiedRooms = 0;
  reservedRooms = 0;
  otherRooms = 0;

  selectedDate: string = ''; // ✅ For date filter input
  isDropdownOpen = false;

  statusSummary: { label: string; count: number; class: string; icon: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0]; // ✅ default to today
    this.loadRooms();
    this.getBookings();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /** ✅ Get rooms from backend */
  loadRooms() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (data) => {
        this.rooms = data;
        this.roomTypes = this.getUniqueRoomTypes(data);
        this.selectedType = this.roomTypes.length ? this.roomTypes[0].type : '';
        this.buildRoomTypeMap();
        this.updateStatusSummary();
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
      }
    });
  }

  getBookings() {
    this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (data) => {
        console.log('Frontdesk - Bookings data received:', data);
        this.bookings = data.filter(booking => booking.status !== 'checked_out');
        this.filterBookingsByDate(); 
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  filterBookingsByDate() {
    if (!this.selectedDate) return;

    const selected = new Date(this.selectedDate);
    this.filteredBookings = this.bookings.filter(b => {
      const checkIn = new Date(b.availability.checkIn);
      const checkOut = new Date(b.availability.checkOut);
      return selected >= checkIn && selected <= checkOut; 
    });

    this.updateStatusSummary();
  }

  getUniqueRoomTypes(rooms: Room[]): RoomType[] {
    const types: { [key: string]: RoomType } = {};
    rooms.forEach(room => {
      let roomTypeObj = (room as any).roomType || room.RoomType;
      if (roomTypeObj && roomTypeObj.type) {
        types[roomTypeObj.type] = roomTypeObj;
      } else if ((room as any).roomTypeId || (room as any).room_type_id) {
        const id = (room as any).roomTypeId || (room as any).room_type_id;
        const pseudoType = `Type ${id}`;
        types[pseudoType] = { id, type: pseudoType } as RoomType;
      }
    });
    return Object.values(types);
  }

  buildRoomTypeMap() {
    this.roomsByType = {};
    this.roomTypes.forEach(type => {
      this.roomsByType[type.type] = this.rooms.filter(r => {
        const roomTypeObj = (r as any).roomType || r.RoomType;
        if (roomTypeObj && roomTypeObj.type) {
          return roomTypeObj.type === type.type;
        } else if ((r as any).roomTypeId || (r as any).room_type_id) {
          const id = (r as any).roomTypeId || (r as any).room_type_id;
          return `Type ${id}` === type.type;
        }
        return false;
      });
    });
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  updateStatusSummary() {
    const activeBookings = this.filteredBookings;

    const occupiedRoomIds = activeBookings
      .filter(b => b.status === 'checked_in')
      .map(b => b.room_id);

    const reservedRoomIds = activeBookings
      .filter(b => b.status === 'reserved')
      .map(b => b.room_id);

    this.occupiedRooms = occupiedRoomIds.length;
    this.reservedRooms = reservedRoomIds.length;
    this.availableRooms = this.rooms.length - (this.occupiedRooms + this.reservedRooms);
    this.otherRooms = Math.max(0, this.rooms.length - (this.availableRooms + this.occupiedRooms + this.reservedRooms));

    this.statusSummary = [
      { label: 'Available', count: this.availableRooms, class: 'card-available', icon: 'fa-circle-check' },
      { label: 'Reserved', count: this.reservedRooms, class: 'card-reserved', icon: 'fa-calendar-check' },
      { label: 'Occupied', count: this.occupiedRooms, class: 'card-occupied', icon: 'fa-door-closed' },
      { label: 'Other', count: this.otherRooms, class: 'card-other', icon: 'fa-question-circle' }
    ];
  }

  getGuestName(roomId: number): string {
    const booking = this.filteredBookings.find(b => b.room_id === roomId);
    if (booking?.guest) {
      return `${booking.guest.first_name} ${booking.guest.last_name}`;
    }
    return '';
  }

  getRoomType(room: any): string {
    return (room as any).roomType?.type || room.RoomType?.type || 'Unknown';
  }

  getRoomStatusClass(status: string): string {
    if (!status) return '';
    return status
      .toLowerCase()
      .replace(/\s*-\s*/g, '-') 
      .replace(/\s+/g, '-') 
      .trim();
  }

  /** ✅ Determine room color indicator dynamically by date */
  getRoomColorByDate(roomId: number): string {
    const booking = this.filteredBookings.find(b => b.room_id === roomId);
    if (!booking) {
      // No booking for this date → Room available
      return 'vacant-and-ready';
    }

    // Has booking → Check its status
    switch (booking.status?.toLowerCase()) {
      case 'checked_in':
        return 'occupied';
      case 'reserved':
        return 'reserved-guaranteed';
      case 'cleaning':
        return 'cleaning-in-progress';
      default:
        return 'vacant-and-ready';
    }
  }

  getBookingStatusClass(status: string): string {
    switch (status) {
      case 'reserved': return 'status-reserved';
      case 'checked_in': return 'status-checked-in';
      case 'checked_out': return 'status-checked-out';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(isPaid: boolean): string {
    return isPaid ? 'payment-paid' : 'payment-unpaid';
  }
}

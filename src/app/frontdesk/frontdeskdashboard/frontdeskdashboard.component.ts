import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room, RoomType, Booking } from '../../_models/booking.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-frontdeskdashboard',
  templateUrl: './frontdeskdashboard.component.html',
  styleUrls: ['./frontdeskdashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe]
})
export class FrontdeskdashboardComponent implements OnInit {
  rooms: Room[] = [];
  bookings: Booking[] = [];

  roomTypes: RoomType[] = [];
  roomsByType: { [key: string]: Room[] } = {};
  selectedType: string = '';
  availableRooms = 0;
  occupiedRooms = 0;
  reservedRooms = 0;
  otherRooms = 0;

  isDropdownOpen = false;

  statusSummary: { label: string; count: number; class: string; icon: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
        this.bookings = data;
        this.updateStatusSummary(); // Refresh after bookings load
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
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
    const availableStatuses = ['Vacant and Ready', 'Vacant and Clean'];
    const reservedStatuses = ['Reserved - Guaranteed', 'Reserved - Not Guaranteed'];
    const occupiedStatuses = [
      'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 'Cleaning in Progress',
      'Sleep Out', 'On Queue', 'Skipper', 'Lockout', 'Did Not Check Out',
      'Due Out', 'Check Out', 'Early Check In'
    ];

    this.availableRooms = this.rooms.filter(
      r => availableStatuses.includes(r.roomStatus)
    ).length;

    this.reservedRooms = this.rooms.filter(
      r => reservedStatuses.includes(r.roomStatus)
    ).length;

    this.occupiedRooms = this.rooms.filter(
      r => occupiedStatuses.includes(r.roomStatus)
    ).length;

    this.otherRooms = this.rooms.filter(
      r => !availableStatuses.includes(r.roomStatus) &&
           !reservedStatuses.includes(r.roomStatus) &&
           !occupiedStatuses.includes(r.roomStatus)
    ).length;

    this.statusSummary = [
      { label: 'Available', count: this.availableRooms, class: 'card-available', icon: 'fa-circle-check' },
      { label: 'Reserved', count: this.reservedRooms, class: 'card-reserved', icon: 'fa-calendar-check' },
      { label: 'Occupied', count: this.occupiedRooms, class: 'card-occupied', icon: 'fa-door-closed' },
      { label: 'Other', count: this.otherRooms, class: 'card-other', icon: 'fa-question-circle' }
    ];
  }

  getRoomType(room: any): string {
    return (room as any).roomType?.type || room.RoomType?.type || 'Unknown';
  }

  getRoomStatusClass(status: string): string {
    if (!status) return '';

    return status
      .toLowerCase()
      .replace(/\s*-\s*/g, '-')   // fix " - " into "-"
      .replace(/\s+/g, '-')       // replace spaces with single dash
      .trim();
  }

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking?.guest) {
      return `${booking.guest.first_name} ${booking.guest.last_name}`;
    }
    return '';
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
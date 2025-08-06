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

  
  statusSummary: { label: string; count: number; class: string; icon: string }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRooms();
    this.getBookings();
  }

  /** ✅ Get rooms from backend */
  loadRooms() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (data) => {
        // Ensure compatibility: if roomType or RoomType is missing, fallback to grouping by roomTypeId
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
      // Prefer roomType, then RoomType, fallback to roomTypeId/room_type_id
      let roomTypeObj = (room as any).roomType || room.RoomType;
      if (roomTypeObj && roomTypeObj.type) {
        types[roomTypeObj.type] = roomTypeObj;
      } else if ((room as any).roomTypeId || (room as any).room_type_id) {
        // Fallback: create a pseudo type string
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
          // Fallback: pseudo type
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
    const total = this.rooms.length;
    const reserved = this.bookings.filter(b => 
      b.status === 'reserved' || 
      (!b.status && !b.pay_status)
    ).length;
    const occupied = this.bookings.filter(b => 
      b.status === 'checked_in' || 
      (b.pay_status && b.status !== 'reserved')
    ).length;
    const available = total - reserved - occupied;

    console.log('Frontdesk Status Summary:', {
      total,
      reserved,
      occupied,
      available,
      totalBookings: this.bookings.length
    });

    this.statusSummary = [
      { label: 'Available', count: available, class: 'card-available', icon: 'fa-circle-check' },
      { label: 'Reserved', count: reserved, class: 'card-reserved', icon: 'fa-calendar-check' },
      { label: 'Occupied', count: occupied, class: 'card-occupied', icon: 'fa-door-closed' }
    ];
  }

  getRoomStatusClass(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking) {
      if (booking.status === 'checked_in') {
        return 'occupied'; // checked-in = fully occupied (red)
      } else if (booking.status === 'reserved' || !booking.pay_status) {
        return 'reserved'; // reserved or unpaid = reserved (yellow/orange)
      } else {
        return 'occupied'; // paid but not checked-in = occupied (red)
      }
    }
    return 'available'; 
  }

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking?.guest) {
      return `${booking.guest.first_name} ${booking.guest.last_name}`;
    }
    return '';
  }

  getRoomType(room: any): string {
    return (room as any).roomType?.type || room.RoomType?.type || 'Unknown';
  }
}

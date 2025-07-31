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
      if (room.RoomType) {
        types[room.RoomType.type] = room.RoomType;
      }
    });
    return Object.values(types);
  }

  buildRoomTypeMap() {
    this.roomsByType = {};
    this.roomTypes.forEach(type => {
      this.roomsByType[type.type] = this.rooms.filter(r => r.RoomType?.type === type.type);
    });
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  updateStatusSummary() {
    const total = this.rooms.length;
    const reserved = this.bookings.filter(b => !b.pay_status).length; // pay_status false = reserved
    const occupied = this.bookings.filter(b => b.pay_status).length; // pay_status true = fully occupied
    const available = total - reserved - occupied;

    this.statusSummary = [
      { label: 'Available', count: available, class: 'card-available', icon: 'fa-circle-check' },
      { label: 'Reserved', count: reserved, class: 'card-reserved', icon: 'fa-calendar-check' },
      { label: 'Occupied', count: occupied, class: 'card-occupied', icon: 'fa-door-closed' }
    ];
  }

  getRoomStatusClass(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking) {
      if (booking.pay_status) {
        return 'occupied'; // pay_status true = fully occupied (red)
      } else {
        return 'reserved'; // pay_status false = reserved (yellow/orange)
      }
    }
    return 'available'; // No booking = available (green)
  }

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking?.guest) {
      return `${booking.guest.first_name} ${booking.guest.last_name}`;
    }
    return '';
  }
}

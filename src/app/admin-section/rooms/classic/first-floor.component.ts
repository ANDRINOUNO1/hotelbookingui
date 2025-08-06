import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Booking } from '../../../_models/booking.model';

@Component({
  selector: 'app-first-floor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './first-floor.component.html',
  styleUrl: './first-floor.component.scss'
})
export class FirstFloorComponent {
  @Input() rooms: Room[] = [];
  @Input() bookings: Booking[] = [];

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    return booking ? `${booking.guest.first_name} ${booking.guest.last_name}` : '';
  }

  getRoomStatus(room: any): string {
    // Check if there's an active booking for this room
    const activeBooking = this.bookings.find(b => 
      b.room_id === room.id && 
      b.status !== 'checked_out'
    );

    if (activeBooking) {
      switch (activeBooking.status) {
        case 'checked_in':
          return 'Occupied';
        case 'reserved':
          return 'Reserved';
        default:
          return 'Occupied';
      }
    }

    // Check if room is marked as unavailable
    if (room.isAvailable === false) {
      return 'Maintenance';
    }

    return 'Vacant';
  }

  
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'vacant':
        return 'vacant';
      case 'occupied':
        return 'occupied';
      case 'reserved':
        return 'reserved';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'vacant';
    }
  }

  getRoomClass(room: Room): string {
    const status = this.getRoomStatus(room).toLowerCase();
    return `room-${status}`; 
  }
}

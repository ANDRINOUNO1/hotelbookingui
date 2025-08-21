import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Booking } from '../../../_models/booking.model';

@Component({
  selector: 'app-third-floor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './third-floor.component.html',
  styleUrl: './third-floor.component.scss'
})
export class ThirdFloorComponent {
    @Input() rooms: Room[] = [];
  @Input() bookings: Booking[] = [];

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    return booking ? `${booking.guest.first_name} ${booking.guest.last_name}` : '';
  }

  /** ✅ Now we just use the backend's roomStatus field directly */
  getRoomStatus(room: Room): string {
    return room.roomStatus || 'Unknown';
  }

  /** ✅ Add classes for each backend status */
  getStatusClass(status: string): string {
    switch (status) {
      case 'Occupied':
      case 'Stay Over':
      case 'Skipper':
        return 'status-occupied';

      case 'On Change':
      case 'Cleaning in Progress':
        return 'status-cleaning';

      case 'Do Not Disturb':
      case 'Sleep Out':
      case 'On Queue':
      case 'Lockout':
        return 'status-warning';

      case 'Vacant and Ready':
      case 'Vacant and Clean':
      case 'Early Check In':
      case 'Check Out':
      case 'Due Out':
        return 'status-vacant';

      case 'Out of Order':
      case 'Out of Service':
        return 'status-out';

      case 'Did Not Check Out':
        return 'status-critical';

      case 'Reserved - Guaranteed':
        return 'status-reserved-guaranteed';

      case 'Reserved - Not Guaranteed':
        return 'status-reserved-not';

      default:
        return 'status-default';
    }
  }

  getRoomClass(room: Room): string {
    const status = this.getRoomStatus(room).toLowerCase();
    return `room-${status.replace(/\s+/g, '-')}`; // e.g. "room-vacant-and-ready"
  }
}

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

  getRoomStatus(room: any): string {
    return room.isAvailable === false ? 'Occupied' : 'Vacant';
  }

  
  getRoomClass(room: Room): string {
    const status = this.getRoomStatus(room).toLowerCase();
    return `room-${status}`; 
  }
}

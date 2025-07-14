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

  getRoomStatus(room: Room): string {
    const booking = this.bookings.find(b => b.room_id === room.id);

    if (booking) {
      return booking.pay_status ? 'Occupied' : 'Pending';
    }

    return room.status === false ? 'Occupied' : 'Vacant';
  }

  
  getRoomClass(room: Room): string {
    const status = this.getRoomStatus(room).toLowerCase();
    return `room-${status}`; 
  }
}

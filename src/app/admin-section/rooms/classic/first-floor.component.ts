import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Booking } from '../../../_models/booking.model';

@Component({
  selector: 'app-first-floor',
  imports: [CommonModule],
  templateUrl: './first-floor.component.html',
  styleUrl: './first-floor.component.scss'
})
export class FirstFloorComponent {
  @Input() rooms: Room[] = [];
  @Input() bookings: Booking[] = []; // <-- Accept bookings dynamically

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(
      b => b.room_id === roomId && b.pay_status
    );
    return booking ? `${booking.first_name} ${booking.last_name}` : '';
  }

  getRoomStatus(room: Room): string {
    const occupied = this.bookings.some(b => b.room_id === room.id && b.pay_status);
    return occupied ? 'Occupied' : 'Vacant';
  }
}

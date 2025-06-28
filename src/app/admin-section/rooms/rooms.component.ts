import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirstFloorComponent } from './classic/first-floor.component';
import { SecondFloorComponent } from './deluxe/second-floor.component';
import { ThirdFloorComponent } from './prestige/third-floor.component';
import { FourthFloorComponent } from './luxury/fourth-floor.component';
import { ROOMS } from '../../models/entities'; // <-- Import your seeded rooms
import { Room } from '../../models/booking.model';
import { BookingService } from '../../booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FirstFloorComponent, SecondFloorComponent, ThirdFloorComponent, FourthFloorComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})

export class RoomsComponent {
  rooms: Room[] = ROOMS;
  bookings: Booking[] = [];

  constructor(private bookingService: BookingService) {
    this.bookings = this.bookingService.getBookings();
  }

  roomTabs = ['Classic', 'Deluxe', 'Prestige', 'Luxury'];
  selectedTab = 0;

  get classicRooms() {
    return this.rooms.filter(r => r.roomType?.type === 'Classic');
  }
  get deluxeRooms() {
    return this.rooms.filter(r => r.roomType?.type === 'Deluxe');
  }
  get prestigeRooms() {
    return this.rooms.filter(r => r.roomType?.type === 'Prestige');
  }
  get luxuryRooms() {
    return this.rooms.filter(r => r.roomType?.type === 'Luxury');
  }
}

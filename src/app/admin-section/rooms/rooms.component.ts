  import { CommonModule } from '@angular/common';
  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  import { FirstFloorComponent } from './classic/first-floor.component';
  import { SecondFloorComponent } from './deluxe/second-floor.component';
  import { ThirdFloorComponent } from './prestige/third-floor.component';
  import { FourthFloorComponent } from './luxury/fourth-floor.component';

  import { Room, Booking } from '../../_models/booking.model';

  @Component({
    selector: 'app-rooms',
    standalone: true,
    imports: [
      CommonModule,
      FirstFloorComponent,
      SecondFloorComponent,
      ThirdFloorComponent,
      FourthFloorComponent
    ],
    templateUrl: './rooms.component.html',
    styleUrl: './rooms.component.scss'
  })
  export class RoomsComponent implements OnInit {
    rooms: Room[] = [];
    bookings: Booking[] = [];

    roomTabs = ['Classic', 'Deluxe', 'Prestige', 'Luxury'];
    selectedTab = 0;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
      this.loadRooms();
      this.getBookings();
    }

    /** ✅ Get rooms from fake backend */
    loadRooms() {
      this.http.get<Room[]>('/api/rooms').subscribe({
        next: (data) => {
          this.rooms = data;
          console.log('Rooms loaded:', this.rooms);
        },
        error: (err) => {
          console.error('Failed to load rooms:', err);
        }
      });
    }

    /** ✅ Get bookings from fake backend */
    getBookings() {
      this.http.get<Booking[]>('/api/bookings').subscribe({
        next: (data) => {
          this.bookings = data;
          console.log('Bookings loaded:', this.bookings);
        },
        error: (err) => {
          console.error('Failed to load bookings:', err);
        }
      });
    }

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

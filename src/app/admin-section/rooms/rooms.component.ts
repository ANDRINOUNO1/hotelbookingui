  import { CommonModule } from '@angular/common';
  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  import { environment } from '../../../environments/environment';
  import { FirstFloorComponent } from './classic/first-floor.component';
  import { SecondFloorComponent } from './deluxe/second-floor.component';
  import { ThirdFloorComponent } from './prestige/third-floor.component';
  import { FourthFloorComponent } from './luxury/fourth-floor.component';

  import { Room, Booking } from '../../_models/booking.model';
  import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';

  @Component({
    selector: 'app-rooms',
    standalone: true,
    imports: [
      CommonModule,
      FirstFloorComponent,
      SecondFloorComponent,
      ThirdFloorComponent,
      FourthFloorComponent,
      LoadingSpinnerComponent
    ],
    templateUrl: './rooms.component.html',
    styleUrl: './rooms.component.scss'
  })
  export class RoomsComponent implements OnInit {
    rooms: Room[] = [];
    bookings: Booking[] = [];

    roomTabs = ['Classic', 'Deluxe', 'Prestige', 'Luxury'];
    selectedTab = 0;
    isLoading = true;

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
          console.log('Rooms loaded:', this.rooms);
          console.log('Room types found:', this.rooms.map(r => r.RoomType?.type));
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Failed to load rooms:', err);
          this.checkLoadingComplete();
        }
      });
    }

    /** ✅ Get bookings from fake backend */
    getBookings() {
      this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
        next: (data) => {
          this.bookings = data;
          console.log('Bookings loaded:', this.bookings);
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Failed to load bookings:', err);
          this.checkLoadingComplete();
        }
      });
    }

    checkLoadingComplete() {
      // Hide loading after data is loaded
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }

    get classicRooms() {
      const classic = this.rooms.filter(r => r.RoomType?.type === 'Classic');
      return classic;
    }
    get deluxeRooms() {
      const deluxe = this.rooms.filter(r => r.RoomType?.type === 'Deluxe');
      return deluxe;
    }
    get prestigeRooms() {
      const prestige = this.rooms.filter(r => r.RoomType?.type === 'Prestige');
      return prestige;
    }
    get luxuryRooms() {
      const luxury = this.rooms.filter(r => r.RoomType?.type === 'Luxury');
      return luxury;
    }

    getRoomCount(tabIndex: number): number {
      switch (tabIndex) {
        case 0: return this.classicRooms.length;
        case 1: return this.deluxeRooms.length;
        case 2: return this.prestigeRooms.length;
        case 3: return this.luxuryRooms.length;
        default: return 0;
      }
    }
  }

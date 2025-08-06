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
    selectedDate: string = '';

    roomTabs = ['Classic', 'Deluxe', 'Prestige', 'Luxury'];
    selectedTab = 0;
    isLoading = true;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
            this.selectedDate = this.formatDateForInput(new Date());
      this.loadRooms();
      this.getBookings();
    }

    //getrooms frombackend
    loadRooms() {
      this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
        next: (data) => {
          this.rooms = data;
          console.log('Rooms loaded:', this.rooms);
          console.log('Room types found:', this.rooms.map(r => r.roomType?.type));
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Failed to load rooms:', err);
          this.checkLoadingComplete();
        }
      });
    }

    //getbookings frombackend
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
      const classic = this.rooms.filter(r => r.roomType?.type === 'Classic');
      return classic;
    }
    get deluxeRooms() {
      const deluxe = this.rooms.filter(r => r.roomType?.type === 'Deluxe');
      return deluxe;
    }
    get luxuryRooms() {
      const luxury = this.rooms.filter(r => r.roomType?.type === 'Luxury');
      return luxury;
    }
    get prestigeRooms() {
      const prestige = this.rooms.filter(r => r.roomType?.type === 'Prestige');
      return prestige;
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

    formatDateForInput(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    onDateChange(event: any) {
      this.selectedDate = event.target.value;
    }

    getBookingsForDate(date: string): Booking[] {
      if (!date || !this.bookings.length) return [];
      
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      return this.bookings.filter(booking => {
        if (!booking.availability?.checkIn || !booking.availability?.checkOut) return false;
        
        const checkIn = new Date(booking.availability.checkIn);
        const checkOut = new Date(booking.availability.checkOut);
        
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        return selectedDate >= checkIn && selectedDate < checkOut;
      });
    }
  }

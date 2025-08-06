import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Room, Booking, RoomType } from '../../_models/booking.model';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  bookings: Booking[] = [];
  roomTypes: RoomType[] = [];
  selectedType: string = '';
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.rooms = roomsData;
        this.roomTypes = this.getUniqueRoomTypes(roomsData);
        this.selectedType = this.roomTypes.length ? this.roomTypes[0].type : '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.isLoading = false;
      }
    });
    this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (bookingsData) => {
        this.bookings = bookingsData;
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  getUniqueRoomTypes(rooms: Room[]): RoomType[] {
    const types: { [key: string]: RoomType } = {};
    rooms.forEach(room => {
      const roomTypeObj = (room as any).roomType || room.RoomType;
      if (roomTypeObj && roomTypeObj.type) {
        types[roomTypeObj.type] = roomTypeObj;
      }
    });
    return Object.values(types);
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  getRoomsForSelectedType(): Room[] {
    return this.rooms.filter(room => {
      const roomTypeObj = (room as any).roomType || room.RoomType;
      return roomTypeObj && roomTypeObj.type === this.selectedType;
    });
  }

  getRoomStatus(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    if (booking) {
      if (booking.status === 'checked_in') {
        return 'Occupied';
      } else if (booking.status === 'reserved' || !booking.pay_status) {
        return 'Reserved';
      } else {
        return 'Occupied';
      }
    }
    return 'Available';
  }
}

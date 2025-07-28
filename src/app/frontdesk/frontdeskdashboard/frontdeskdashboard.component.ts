import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room, RoomType } from '../../_models/booking.model';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Booking } from '../../_models/booking.model';
import { environment } from '../../environments/environments';
@Component({
  selector: 'app-frontdeskdashboard',
  templateUrl: './frontdeskdashboard.component.html',
  styleUrls: ['./frontdeskdashboard.component.scss'],
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  providers: [DatePipe]
})
export class FrontdeskdashboardComponent implements OnInit {
  roomTypes: RoomType[] = [];
  roomsByType: { [type: string]: Room[] } = {};
  selectedType: string = '';
  guestname: string = '';
  today = new Date();
  bookings: Booking[] = [];
  rooms: any[] = [];

  
  constructor(private http: HttpClient) {}

  ngOnInit() {

    this.fetchData();
    this.http.get<RoomType[]>(`${environment.apiUrl}/room-types`).subscribe((types) => {
      this.roomTypes = types;
      this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe((rooms) => {
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe((bookings) => {
          this.bookings = bookings;
          rooms.forEach(room => {
            const typeObj = this.roomTypes.find(t => t.id === room.room_type_id);
            const typeName = typeObj ? typeObj.type : 'Unknown';
            if (!this.roomsByType[typeName]) {
              this.roomsByType[typeName] = [];
            }
            room.roomType = typeObj;
            this.roomsByType[typeName].push(room);
          });
          this.selectedType = this.roomTypes[0]?.type || '';
        });
      });
    });
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  getGuestName(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);
    
    if (!booking) return 'No Guest';

    const guestName = `${booking.guest.first_name} ${booking.guest.last_name}`;
    return booking.pay_status ? guestName : `${guestName} - Reserved`;
  }

  fetchData() {
    this.http.get<any[]>('/api/rooms').subscribe(rooms => {
      this.rooms = rooms;
    });
    this.http.get<any[]>('/api/bookings').subscribe(bookings => {
      this.bookings = bookings;
    });
  }


  get vacantCount() {
    // Vacant: rooms with status true and not booked
    return this.rooms.filter(room => room.status === true).length;
  }

  get occupiedCount() {
    // Occupied: rooms with status false or with a paid booking
    return this.rooms.filter(room =>
      room.status === false ||
      this.bookings.some(b => b.room_id === room.id && b.pay_status == false)
    ).length;
  }

  get reservedCount() {
    // Reserved: rooms with a booking that is not yet paid (pay_status === false)
    return this.bookings.filter(b => !b.pay_status).length;
  }

  get allCount() {
    return this.rooms.length;
  }

  get statusSummary() {
    return [
      { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: this.vacantCount },
      { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: this.occupiedCount },
      { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: this.reservedCount },
      { label: 'All', icon: 'fa-list', class: 'status-all', count: this.allCount }
    ];
  }
  
  getRoomStatusClass(roomId: number): string {
    const booking = this.bookings.find(b => b.room_id === roomId);

    if (!booking) return 'vacant';
    return booking.pay_status ? 'occupied' : 'reserved';
  }


}
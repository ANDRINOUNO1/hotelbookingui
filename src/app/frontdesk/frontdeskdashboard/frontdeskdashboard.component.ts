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
  imports: [CommonModule, RouterModule, DatePipe], 
  providers: [DatePipe]
})
export class FrontdeskdashboardComponent implements OnInit {
  roomTypes: RoomType[] = [];
  roomsByType: { [type: string]: Room[] } = {};
  selectedType: string = '';
  guestname: string = '';
  today = new Date();
  bookings: Booking[] = [];
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
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
    console.log('Checking roomId:', roomId, 'Bookings:', this.bookings);
    const booking = this.bookings.find(b => b.room_id === roomId && b.pay_status);
    return booking ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'No Guest';
  }
  
}
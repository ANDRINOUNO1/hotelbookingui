import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface RoomAvailability {
  price: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  roomStatus: string;
  occupancy?: RoomOccupancy[];
}

export interface RoomOccupancy {
  bookingId: number;
  checkIn: string;
  checkOut: string;
  status: string;
  guestName: string;
}

export interface AvailabilityCalendar {
  roomId: number;
  roomNumber: string;
  roomType: string;
  occupancy: RoomOccupancy[];
}

@Injectable({
  providedIn: 'root'
})
export class RoomAvailabilityService {
  private apiUrl = `${environment.apiUrl}/room-availability`;

  constructor(private http: HttpClient) { }

  // Get available rooms for a specific date range
  getAvailableRooms(checkIn: string, checkOut: string, roomTypeId?: number): Observable<RoomAvailability[]> {
    let url = `${this.apiUrl}/available?checkIn=${checkIn}&checkOut=${checkOut}`;
    if (roomTypeId) {
      url += `&roomTypeId=${roomTypeId}`;
    }
    return this.http.get<RoomAvailability[]>(url);
  }

  // Check if a specific room is available for a date range
  checkRoomAvailability(roomId: number, checkIn: string, checkOut: string, excludeBookingId?: number): Observable<boolean> {
    let url = `${this.apiUrl}/check/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}`;
    if (excludeBookingId) {
      url += `&excludeBookingId=${excludeBookingId}`;
    }
    return this.http.get<{ available: boolean }>(url).pipe(
      map(response => response.available)
    );
  }

  // Get room availability calendar
  getAvailabilityCalendar(startDate: string, endDate: string, roomTypeId?: number): Observable<AvailabilityCalendar[]> {
    let url = `${this.apiUrl}/calendar?startDate=${startDate}&endDate=${endDate}`;
    if (roomTypeId) {
      url += `&roomTypeId=${roomTypeId}`;
    }
    return this.http.get<AvailabilityCalendar[]>(url);
  }

  // Get room occupancy for a specific room
  getRoomOccupancy(roomId: number, startDate?: string, endDate?: string): Observable<RoomOccupancy[]> {
    let url = `${this.apiUrl}/occupancy/${roomId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.http.get<RoomOccupancy[]>(url);
  }
} 
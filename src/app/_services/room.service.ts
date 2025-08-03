import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RoomType {
  id: number;
  type: string;
  description: string;
  basePrice: number;
  rate?: number;
  reservationFeePercentage?: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  price: number;
  isAvailable: boolean;
  RoomType?: RoomType;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  occupancyRate: string;
  roomTypes: {
    [key: string]: {
      total: number;
      available: number;
      occupied: number;
      price: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) { }

  // Get all rooms
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  // Get all room types
  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.apiUrl}/types`);
  }

  // Get available rooms by type
  getAvailableRoomsByType(type: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available/${type}`);
  }

  // Get room statistics
  getRoomStats(): Observable<RoomStats> {
    return this.http.get<RoomStats>(`${this.apiUrl}/stats`);
  }

  // Get room by ID
  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  // Create new room
  createRoom(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  // Update room
  updateRoom(id: number, room: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  // Update room availability
  updateRoomAvailability(id: number, isAvailable: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/availability`, { isAvailable });
  }

  // Bulk update room availability
  bulkUpdateAvailability(roomIds: number[], isAvailable: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-availability`, { roomIds, isAvailable });
  }

  // Delete room
  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get rooms for availability component (matching frontend structure)
  getAvailableRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.apiUrl}/types`);
  }

  // Get room availability for reservation
  checkRoomAvailability(roomType: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available/${roomType}`);
  }

  // Book a room (update availability to false)
  bookRoom(roomId: number): Observable<any> {
    return this.updateRoomAvailability(roomId, false);
  }

  // Release a room (update availability to true)
  releaseRoom(roomId: number): Observable<any> {
    return this.updateRoomAvailability(roomId, true);
  }
} 
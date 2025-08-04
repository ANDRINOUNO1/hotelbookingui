import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Room } from './models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;
  
  // Fallback data for development
  private rooms: Room[] = [
    { id: 1, number: '101', type: 'Deluxe', rate: 3500, floor: 1, building: 'A', available: true },
    { id: 2, number: '202', type: 'Suite', rate: 5000, floor: 2, building: 'B', available: true }
  ];

  constructor(private http: HttpClient) {}

  // API Methods
  getRoomsFromAPI(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getRoomByIdFromAPI(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Local Methods (for fallback)
  getRooms(): Room[] {
    return this.rooms;
  }

  getRoomById(id: number): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }
}

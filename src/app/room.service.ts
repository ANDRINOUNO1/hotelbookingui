import { Injectable } from '@angular/core';
import { Room } from './models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private rooms: Room[] = [
    { id: 1, number: '101', type: 'Deluxe', rate: 3500, floor: 1, building: 'A', available: true },
    { id: 2, number: '202', type: 'Suite', rate: 5000, floor: 2, building: 'B', available: true }
  ];

  getRooms(): Room[] {
    return this.rooms;
  }

  getRoomById(id: number): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }
}

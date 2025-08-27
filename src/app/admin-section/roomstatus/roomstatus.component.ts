import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../../_services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roomstatus',
  standalone: true, // <-- Add this if not present
  imports: [CommonModule, FormsModule], // <-- Add this line
  templateUrl: './roomstatus.component.html',
  styleUrls: ['./roomstatus.component.scss']
})
export class RoomstatusComponent implements OnInit {
  rooms: Room[] = [];
  editingRoomId: number | null = null;
  newStatus: string = '';
  roomTypes = [
    { id: 1, type: 'Classic', basePrice: 120.00 },
    { id: 2, type: 'Deluxe', basePrice: 200.00 },
    { id: 3, type: 'Prestige', basePrice: 350.00 },
    { id: 4, type: 'Luxury', basePrice: 800.00 }
  ];
  roomStatuses: string[] = [
    'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 'Cleaning in Progress',
    'Sleep Out', 'On Queue', 'Skipper', 'Vacant and Ready', 'Out of Order',
    'Out of Service', 'Lockout', 'Did Not Check Out', 'Due Out', 'Check Out',
    'Early Check In', 'Vacant and Clean', 'Reserved - Guaranteed', 'Reserved - Not Guaranteed'
  ];
  loading = false;
  error = '';

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rooms';
        this.loading = false;
      }
    });
  }

  startEdit(room: Room) {
    this.editingRoomId = room.id;
    this.newStatus = room.roomStatus;
  }

  cancelEdit() {
    this.editingRoomId = null;
    this.newStatus = '';
  }

  saveStatus(room: Room) {
    if (!this.newStatus) return;
    this.roomService.updateRoom(room.id, { roomStatus: this.newStatus }).subscribe({
      next: (updatedRoom) => {
        room.roomStatus = updatedRoom.roomStatus;
        this.cancelEdit();
      },
      error: () => {
        this.error = 'Failed to update room status';
      }
    });
  }
  getRoomTypeName(roomTypeId: number): string {
    const type = this.roomTypes.find(rt => rt.id === roomTypeId);
    return type ? type.type : 'Unknown';
  }

  resetAllRooms() {
    if (!confirm('Are you sure you want to reset all rooms to "Vacant and Ready"?')) return;
    this.loading = true;
    this.roomService.bulkUpdateRoomStatus('Vacant and Ready').subscribe({
      next: () => {
        this.rooms.forEach(room => room.roomStatus = 'Vacant and Ready');
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to reset all rooms';
        this.loading = false;
      }
    });
  }
}
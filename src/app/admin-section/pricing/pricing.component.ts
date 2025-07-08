import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomType } from '../../_models/booking.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  roomTypes: RoomType[] = [];
  editingId: number | null = null;
  editRate: number | null = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRoomTypes();
  }

  fetchRoomTypes() {
    this.loading = true;
    this.http.get<RoomType[]>('/api/room-types').subscribe(roomTypes => {
      this.roomTypes = roomTypes;
      this.loading = false;
    });
  }

  startEdit(roomType: RoomType) {
    this.editingId = roomType.id;
    this.editRate = roomType.rate ?? 0;
  }

  saveEdit(roomType: RoomType) {
    if (this.editingId === roomType.id && this.editRate !== null) {
      this.http.put<RoomType>(`/api/room-types/${roomType.id}`, { rate: this.editRate }).subscribe(updated => {
        roomType.rate = updated.rate;
        this.editingId = null;
        this.editRate = null;
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editRate = null;
  }
}

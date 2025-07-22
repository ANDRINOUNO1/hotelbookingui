import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomType, ReservationFee } from '../../_models/booking.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  roomTypes: RoomType[] = [];
  reservationFee: number = 0;

  editingId: number | null = null;
  editRate: number | null = null;

  editingReservationFee = false;
  editReservationFee: number | null = null;

  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRoomTypes();
    this.fetchReservationFee();
  }

  fetchRoomTypes() {
    this.loading = true;
    this.http.get<RoomType[]>('/api/room-types').subscribe(roomTypes => {
      this.roomTypes = roomTypes;
      this.loading = false;
    });
  }

  fetchReservationFee() {
    this.http.get<ReservationFee>('/api/reservation-fee').subscribe(fee => {
      this.reservationFee = fee.fee;
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

  // ✅ Reservation fee handlers
  startEditReservationFee() {
    this.editingReservationFee = true;
    this.editReservationFee = this.reservationFee;
  }

  saveEditReservationFee() {
    if (this.editReservationFee !== null) {
      this.http.put<ReservationFee>('/api/reservation-fee', { fee: this.editReservationFee }).subscribe(updated => {
        this.reservationFee = updated.fee;
        this.editingReservationFee = false;
        this.editReservationFee = null;
      });
    }
  }

  cancelEditReservationFee() {
    this.editingReservationFee = false;
    this.editReservationFee = null;
  }
}
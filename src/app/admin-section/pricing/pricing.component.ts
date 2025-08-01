import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomType, ReservationFee } from '../../_models/booking.model';
import { environment } from '../../../environments/environment';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
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
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRoomTypes();
    this.fetchReservationFee();
  }

  fetchRoomTypes() {
    this.loading = true;
    this.http.get<RoomType[]>(`${environment.apiUrl}/rooms/types`).subscribe({
      next: (roomTypes) => {
        this.roomTypes = roomTypes;
        console.log('Room types loaded:', roomTypes);
        this.loading = false;
        // Hide loading after data is loaded
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      },
      error: (err) => {
        console.error('Failed to fetch room types:', err);
        this.loading = false;
        // Fallback to mock data if API fails
        this.roomTypes = [
          { id: 1, type: 'Classic', rate: 120, basePrice: 120 },
          { id: 2, type: 'Deluxe', rate: 200, basePrice: 200 },
          { id: 3, type: 'Prestige', rate: 150, basePrice: 150 },
          { id: 4, type: 'Luxury', rate: 80, basePrice: 80 }
        ];
        // Hide loading after fallback data is loaded
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    });
  }

  fetchReservationFee() {
    this.http.get<ReservationFee>(`${environment.apiUrl}/rooms/reservation-fee`).subscribe({
      next: (fee) => {
        this.reservationFee = fee.fee;
        console.log('✅ Reservation fee loaded from database:', this.reservationFee);
      },
      error: (err) => {
        console.error('❌ Failed to fetch reservation fee:', err);
        this.reservationFee = 500; // Fallback to default
      }
    });
  }

  startEdit(roomType: RoomType) {
    this.editingId = roomType.id;
    this.editRate = roomType.rate ?? roomType.basePrice ?? 0;
  }

  saveEdit(roomType: RoomType) {
    if (this.editingId === roomType.id && this.editRate !== null) {
      this.http.put<RoomType>(`${environment.apiUrl}/rooms/types/${roomType.id}`, { rate: this.editRate }).subscribe({
        next: (updated) => {
          roomType.rate = updated.rate || updated.basePrice;
          roomType.basePrice = updated.basePrice;
          this.editingId = null;
          this.editRate = null;
        },
        error: (err) => {
          console.error('Failed to update room type:', err);
        }
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
      this.http.put<ReservationFee>(`${environment.apiUrl}/rooms/reservation-fee`, { fee: this.editReservationFee }).subscribe({
        next: (updated) => {
          this.reservationFee = updated.fee;
          this.editingReservationFee = false;
          this.editReservationFee = null;
          console.log('✅ Reservation fee updated in database:', updated.fee);
        },
        error: (err) => {
          console.error('❌ Failed to update reservation fee:', err);
          alert('Failed to update reservation fee. Please try again.');
        }
      });
    }
  }

  cancelEditReservationFee() {
    this.editingReservationFee = false;
    this.editReservationFee = null;
  }
}
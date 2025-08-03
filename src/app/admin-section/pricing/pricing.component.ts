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

  editingId: number | null = null;
  editRate: number | null = null;
  editReservationFee: number | null = null;

  loading = false;
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRoomTypes();
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
          { id: 1, type: 'Classic', rate: 120, basePrice: 120, description: 'Comfortable and affordable accommodation', reservationFeePercentage: 10.00 },
          { id: 2, type: 'Deluxe', rate: 200, basePrice: 200, description: 'Enhanced amenities and spacious rooms', reservationFeePercentage: 15.00 },
          { id: 3, type: 'Prestige', rate: 150, basePrice: 150, description: 'Luxury accommodations with premium services', reservationFeePercentage: 12.50 },
          { id: 4, type: 'Luxury', rate: 80, basePrice: 80, description: 'Ultimate luxury experience', reservationFeePercentage: 8.00 }
        ];
        // Hide loading after fallback data is loaded
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    });
  }

  startEdit(roomType: RoomType) {
    this.editingId = roomType.id;
    this.editRate = roomType.rate ?? roomType.basePrice ?? 0;
    this.editReservationFee = roomType.reservationFeePercentage ?? 0;
  }

  saveEdit(roomType: RoomType) {
    if (this.editingId === roomType.id && this.editRate !== null && this.editReservationFee !== null) {
      const updateData = {
        basePrice: this.editRate,
        reservationFeePercentage: this.editReservationFee
      };
      
      this.http.put<RoomType>(`${environment.apiUrl}/rooms/types/${roomType.id}`, updateData).subscribe({
        next: (updated) => {
          roomType.rate = updated.rate || updated.basePrice;
          roomType.basePrice = updated.basePrice;
          roomType.reservationFeePercentage = updated.reservationFeePercentage;
          this.editingId = null;
          this.editRate = null;
          this.editReservationFee = null;
          console.log('✅ Room type updated successfully:', updated);
        },
        error: (err) => {
          console.error('Failed to update room type:', err);
          alert('Failed to update room type. Please try again.');
        }
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editRate = null;
    this.editReservationFee = null;
  }
}
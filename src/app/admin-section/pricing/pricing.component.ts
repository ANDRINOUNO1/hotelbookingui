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

  // Properties for dropdown functionality
  selectedRoomTypeId: number | null = null;
  selectedRoomType: RoomType | null = null;

  loading = false;
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRoomTypes();
    // Test calculation after data loads
    setTimeout(() => {
      console.log('Room types loaded:', this.roomTypes);
      console.log('Testing calculation with first room type...');
      if (this.roomTypes.length > 0) {
        this.selectedRoomTypeId = this.roomTypes[0].id;
        this.onRoomTypeChange();
        console.log('Test calculation result:', this.getCalculatedReservationFee());
      }
    }, 1000);
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

  getAverageBasePrice(): string {
    if (this.roomTypes.length === 0) return '0.00';
    
    const total = this.roomTypes.reduce((sum, roomType) => {
      const price = roomType.rate || roomType.basePrice || 0;
      return sum + price;
    }, 0);
    
    const average = total / this.roomTypes.length;
    return average.toFixed(2);
  }

  getAverageReservationFee(): string {
    if (this.roomTypes.length === 0) return '0.00';
    
    const total = this.roomTypes.reduce((sum, roomType) => {
      const fee = roomType.reservationFeePercentage || 0;
      return sum + fee;
    }, 0);
    
    const average = total / this.roomTypes.length;
    return average.toFixed(2);
  }

  // Functions for dropdown functionality
  onRoomTypeChange() {
    console.log('Dropdown changed, selectedRoomTypeId:', this.selectedRoomTypeId);
    if (this.selectedRoomTypeId) {
      // Convert to number if it's a string
      const roomId = typeof this.selectedRoomTypeId === 'string' ? parseInt(this.selectedRoomTypeId) : this.selectedRoomTypeId;
      this.selectedRoomType = this.roomTypes.find(rt => rt.id === roomId) || null;
      console.log('Selected room type:', this.selectedRoomType);
    } else {
      this.selectedRoomType = null;
      console.log('No room type selected');
    }
  }

  getCalculatedReservationFee(): string {
    if (!this.selectedRoomType) return '0.00';
    
    const basePrice = this.selectedRoomType.rate || this.selectedRoomType.basePrice || 0;
    const feePercentage = this.selectedRoomType.reservationFeePercentage || 0;
    
    const calculatedFee = (basePrice * feePercentage) / 100;
    console.log('Calculating fee:', { basePrice, feePercentage, calculatedFee });
    return calculatedFee.toFixed(2);
  }
}
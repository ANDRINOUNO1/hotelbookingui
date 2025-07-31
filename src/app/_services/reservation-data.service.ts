import { Injectable } from '@angular/core';
import { RoomType } from '../_models/booking.model';

export interface ReservationData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  specialRequest?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationDataService {
  
  private selectedRoomType: RoomType | null = null;
  private reservationData: ReservationData | null = null;
  private customerDetails: CustomerDetails | null = null;

  setReservation(data: ReservationData) {
    this.reservationData = data;
  }

  getReservation(): ReservationData | null {
    return this.reservationData;
  }

  setSelectedRoomType(roomType: RoomType) {
    this.selectedRoomType = roomType;
  }

  getSelectedRoomType(): RoomType | null {
    return this.selectedRoomType;
  }

  setCustomerDetails(details: CustomerDetails) {
    this.customerDetails = details;
  }

  getCustomerDetails(): CustomerDetails | null {
    return this.customerDetails;
  }

  // Validation methods
  isReservationValid(): boolean {
    if (!this.reservationData) return false;
    return !!(this.reservationData.checkIn && 
              this.reservationData.checkOut && 
              this.reservationData.adults > 0 && 
              this.reservationData.rooms > 0);
  }

  isRoomTypeSelected(): boolean {
    return !!this.selectedRoomType;
  }

  isCustomerDetailsValid(): boolean {
    if (!this.customerDetails) return false;
    return !!(this.customerDetails.firstName && 
              this.customerDetails.lastName && 
              this.customerDetails.email && 
              this.customerDetails.phone);
  }

  // Clear all data (useful for new reservation)
  clearAllData() {
    this.reservationData = null;
    this.selectedRoomType = null;
    this.customerDetails = null;
  }

  // Get all data for confirmation
  getAllData() {
    return {
      reservation: this.reservationData,
      roomType: this.selectedRoomType,
      customerDetails: this.customerDetails
    };
  }
}

import { Injectable } from '@angular/core';
import { RoomType } from '../_models/booking.model';

// Define a key for sessionStorage to avoid typos
const RESERVATION_DATA_KEY = 'reservationState';

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

  // --- ADDED: Constructor to load data on initialization ---
  constructor() {
    this.loadFromSession();
  }

  setReservation(data: ReservationData) {
    this.reservationData = data;
    this.saveToSession(); // Save state after any change
  }

  getReservation(): ReservationData | null {
    return this.reservationData;
  }

  setSelectedRoomType(roomType: RoomType) {
    this.selectedRoomType = roomType;
    this.saveToSession(); // Save state after any change
  }

  getSelectedRoomType(): RoomType | null {
    return this.selectedRoomType;
  }

  setCustomerDetails(details: CustomerDetails) {
    this.customerDetails = details;
    this.saveToSession(); // Save state after any change
  }

  getCustomerDetails(): CustomerDetails | null {
    return this.customerDetails;
  }

  // --- Validation methods (no changes needed) ---
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

  // --- MODIFIED: Clear all data ---
  clearAllData() {
    this.reservationData = null;
    this.selectedRoomType = null;
    this.customerDetails = null;
    // Also remove the data from session storage
    sessionStorage.removeItem(RESERVATION_DATA_KEY);
    // You can also clear component-specific keys here for a full reset
    sessionStorage.removeItem('reservationStep');
    sessionStorage.removeItem('termsAccepted');
  }

  // --- Get all data for confirmation (no changes needed) ---
  getAllData() {
    return {
      reservation: this.reservationData,
      roomType: this.selectedRoomType,
      customerDetails: this.customerDetails
    };
  }

  private saveToSession(): void {
    const state = {
      reservationData: this.reservationData,
      selectedRoomType: this.selectedRoomType,
      customerDetails: this.customerDetails,
    };
    sessionStorage.setItem(RESERVATION_DATA_KEY, JSON.stringify(state));
  }
  
  private loadFromSession(): void {
    const savedState = sessionStorage.getItem(RESERVATION_DATA_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.reservationData = state.reservationData || null;
      this.selectedRoomType = state.selectedRoomType || null;
      this.customerDetails = state.customerDetails || null;
    }
  }
}
import { Injectable } from '@angular/core';
import { RoomType } from '../_models/booking.model';

@Injectable({ providedIn: 'root' })
export class ReservationDataService {
  
  private selectedRoomType: RoomType | null = null;
  private reservationData: any = {};
  private customerDetails: any = {};

  setReservation(data: any) {
    this.reservationData = data;
  }

  getReservation() {
    return this.reservationData;
  }

  setSelectedRoomType(roomType: RoomType) {
    this.selectedRoomType = roomType;
  }

  getSelectedRoomType(): RoomType | null {
    return this.selectedRoomType;
  }

  setCustomerDetails(details: any) {
    this.customerDetails = details;
  }

  getCustomerDetails() {
    return this.customerDetails;
  }
}

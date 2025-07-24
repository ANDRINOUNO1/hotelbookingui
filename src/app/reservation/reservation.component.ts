import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationFormComponent } from './reservation-form/reservation-form.component';
import { AvailabilityComponent } from './availability/availability.component';
import { ProcessComponent } from './process/process.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ReservationDataService } from '../_services/reservation-data.service';
import { RoomType } from '../_models/booking.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReservationFormComponent,
    AvailabilityComponent,
    ProcessComponent,
    ConfirmationComponent
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent {
  steps = ['Reservation', 'Availability', 'Guest Details', 'Confirmation'];
  currentStep = 1;

  goToStep(step: number) {
    this.currentStep = step;
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  handleReservationSubmitted(reservationData: any) {
    this.reservationDataService.setReservation(reservationData);
    this.currentStep = 2;
  }

  handleRoomSelected(roomType: RoomType) {
    this.reservationDataService.setSelectedRoomType(roomType);
    this.currentStep = 3;
  }

  handleCustomerDetails(customerDetails: any) {
    this.reservationDataService.setCustomerDetails(customerDetails);
    this.currentStep = 4;
  }
constructor(private reservationDataService: ReservationDataService) {}
}

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

  constructor(private reservationDataService: ReservationDataService) {}

  goToStep(step: number) {
    // Validate current step before allowing navigation
    if (!this.canProceedToStep(step)) {
      return;
    }
    this.currentStep = step;
  }

  canProceedToStep(targetStep: number): boolean {
    // Can always go back
    if (targetStep < this.currentStep) {
      return true;
    }

    // Check if previous steps are completed
    switch (targetStep) {
      case 2: // Availability
        return this.reservationDataService.isReservationValid();
      case 3: // Guest Details
        return this.reservationDataService.isReservationValid() && 
               this.reservationDataService.isRoomTypeSelected();
      case 4: // Confirmation
        return this.reservationDataService.isReservationValid() && 
               this.reservationDataService.isRoomTypeSelected() && 
               this.reservationDataService.isCustomerDetailsValid();
      default:
        return true;
    }
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

  // Method to start a new reservation (clear all data)
  startNewReservation() {
    this.reservationDataService.clearAllData();
    this.currentStep = 1;
  }

  // Get step completion status for UI
  isStepCompleted(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return this.reservationDataService.isReservationValid();
      case 2:
        return this.reservationDataService.isRoomTypeSelected();
      case 3:
        return this.reservationDataService.isCustomerDetailsValid();
      case 4:
        return true; // Confirmation step is always "completed" when reached
      default:
        return false;
    }
  }
}
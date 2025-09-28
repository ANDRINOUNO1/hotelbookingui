import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';
import { AvailabilityComponent } from './availability/availability.component';
import { ProcessComponent } from './process/process.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ReservationDataService } from '../_services/reservation-data.service';
import { RoomType } from '../_models/booking.model';
import { TermsNConditionsModalComponent } from '../reservation/termsnconditions.modal';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReservationFormComponent,
    AvailabilityComponent,
    ProcessComponent,
    ConfirmationComponent,
    FormsModule,
    TermsNConditionsModalComponent
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit {
  steps = ['Reservation', 'Availability', 'Guest Details', 'Confirmation'];
  currentStep = 1;
  termsAccepted = false;
  showTermsModal = false;
  termsChecked = false;
  showPolicyModal = false;

  constructor(
    private reservationDataService: ReservationDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // This part is correct: it loads the state on refresh
    const savedStep = sessionStorage.getItem('reservationStep');
    const savedTerms = sessionStorage.getItem('termsAccepted');

    if (savedTerms === 'true') {
      this.termsAccepted = true;
    }
    
    // Only restore the step if terms were already accepted
    if (this.termsAccepted && savedStep) {
      this.currentStep = parseInt(savedStep, 10);
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  showTerms() {
    this.showTermsModal = true;
  }

  hideTerms() {
    this.showTermsModal = false;
  }

  acceptTerms() {
    this.termsAccepted = true;
    this.showTermsModal = false;
    // ADDED: Save the 'termsAccepted' state to sessionStorage
    sessionStorage.setItem('termsAccepted', 'true');
  }

  goToStep(step: number) {
    if (!this.canProceedToStep(step)) {
      return;
    }
    this.currentStep = step;
    // ADDED: Save the current step to sessionStorage
    sessionStorage.setItem('reservationStep', this.currentStep.toString());
  }

  canProceedToStep(targetStep: number): boolean {
    if (targetStep < this.currentStep) {
      return true;
    }
    switch (targetStep) {
      case 2:
        return this.reservationDataService.isReservationValid();
      case 3:
        return this.reservationDataService.isReservationValid() && 
               this.reservationDataService.isRoomTypeSelected();
      case 4:
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
      // ADDED: Save the current step to sessionStorage
      sessionStorage.setItem('reservationStep', this.currentStep.toString());
    }
  }

  handleReservationSubmitted(reservationData: any) {
    this.reservationDataService.setReservation(reservationData);
    this.currentStep = 2;
    // ADDED: Save the current step to sessionStorage
    sessionStorage.setItem('reservationStep', '2');
  }

  handleRoomSelected(roomType: RoomType) {
    this.reservationDataService.setSelectedRoomType(roomType);
    this.currentStep = 3;
    // ADDED: Save the current step to sessionStorage
    sessionStorage.setItem('reservationStep', '3');
  }

  handleCustomerDetails(customerDetails: any) {
    this.reservationDataService.setCustomerDetails(customerDetails);
    this.currentStep = 4;
    // ADDED: Save the current step to sessionStorage
    sessionStorage.setItem('reservationStep', '4');
  }

  startNewReservation() {
    // This now also clears sessionStorage via the service method
    this.reservationDataService.clearAllData(); 
    this.currentStep = 1;
    // ADDED: Reset the local component state as well
    this.termsAccepted = false; 
  }

  isStepCompleted(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return this.reservationDataService.isReservationValid();
      case 2:
        return this.reservationDataService.isRoomTypeSelected();
      case 3:
        return this.reservationDataService.isCustomerDetailsValid();
      case 4:
        return this.currentStep === 4; // Or a more robust check if needed
      default:
        return false;
    }
  }

  openPolicyModal() {
    this.showPolicyModal = true;
  }

  closePolicyModal() {
    this.showPolicyModal = false;
  }
}
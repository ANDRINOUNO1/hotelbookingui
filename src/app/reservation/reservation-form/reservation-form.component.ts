import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationDataService, ReservationData } from '../../_services/reservation-data.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss']
})
export class ReservationFormComponent implements OnInit {
  @Output() next = new EventEmitter<ReservationData>();
  @Output() back = new EventEmitter<void>();

  booking: ReservationData = {
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    rooms: 1,
  };

  showModal: boolean = false;
  modalMessage: string = '';

  constructor(private reservationDataService: ReservationDataService) {}

  ngOnInit(): void {
    // Load saved data if available
    const savedData = this.reservationDataService.getReservation();
    if (savedData) {
      this.booking = { ...savedData };
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get maximum date (5 years from today) in YYYY-MM-DD format for max attribute
  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    return maxDate.toISOString().split('T')[0];
  }

  // Get minimum check-out date (day after check-in)
  getMinCheckOutDate(): string {
    if (!this.booking.checkIn) {
      return this.getTodayDate();
    }
    const checkIn = new Date(this.booking.checkIn);
    const nextDay = new Date(checkIn);
    nextDay.setDate(checkIn.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }

  // Limit input length and value for number fields
  limitInputLength(event: any, maxLength: number, maxValue: number) {
    const input = event.target;
    const value = input.value.toString();
    
    // Limit input length
    if (value.length > maxLength) {
      input.value = value.substring(0, maxLength);
    }
    
    // Limit the actual value
    let numValue = parseInt(input.value) || 0;
    if (numValue > maxValue) {
      numValue = maxValue;
      input.value = maxValue.toString();
    }
    
    // Update the model
    if (input.name === 'adults') {
      this.booking.adults = numValue;
    } else if (input.name === 'children') {
      this.booking.children = numValue;
    } else if (input.name === 'rooms') {
      this.booking.rooms = numValue;
    }
  }

  submit() {
    // Validate required fields
    if (!this.booking.checkIn || !this.booking.checkOut || 
        this.booking.adults <= 0 || this.booking.rooms <= 0) {
      this.openModal('Please fill in all required fields.');
      return;
    }

    // Validate dates
    const checkIn = new Date(this.booking.checkIn);
    const checkOut = new Date(this.booking.checkOut);
    const today = new Date();
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(today.getFullYear() + 5);
    
    today.setHours(0, 0, 0, 0);
    fiveYearsFromNow.setHours(23, 59, 59, 999);

    if (checkIn < today) {
      this.openModal('Check-in date cannot be in the past.');
      return;
    }

    if (checkIn > fiveYearsFromNow) {
      this.openModal('Check-in date cannot be more than 5 years from today.');
      return;
    }

    if (checkOut <= checkIn) {
      this.openModal('Check-out date must be after check-in date.');
      return;
    }

    if (checkOut > fiveYearsFromNow) {
      this.openModal('Check-out date cannot be more than 5 years from today.');
      return;
    }

    console.log('Submitting Reservation:', this.booking);
    this.reservationDataService.setReservation(this.booking);
    this.next.emit(this.booking);
  }

  openModal(message: string) {
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalMessage = '';
  }

  isFormValid(): boolean {
    return !!(this.booking.checkIn && 
              this.booking.checkOut && 
              this.booking.adults > 0 && 
              this.booking.rooms > 0);
  }
}
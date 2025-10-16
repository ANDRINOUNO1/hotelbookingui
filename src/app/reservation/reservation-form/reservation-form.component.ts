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
  hasDateError: boolean = false;

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

  // Enhanced date change handlers
  onCheckInChange() {
    console.log('Check-in changed:', this.booking.checkIn);
    this.hasDateError = false;
    if (this.booking.checkIn && this.booking.checkOut) {
      const checkIn = new Date(this.booking.checkIn);
      const checkOut = new Date(this.booking.checkOut);
      
      if (checkOut <= checkIn) {
        // Auto-adjust check-out to next day
        const nextDay = new Date(checkIn);
        nextDay.setDate(checkIn.getDate() + 1);
        this.booking.checkOut = nextDay.toISOString().split('T')[0];
        console.log('Auto-adjusted check-out to:', this.booking.checkOut);
      }
    }
  }

  onCheckOutChange() {
    console.log('Check-out changed:', this.booking.checkOut);
    this.hasDateError = false;
    if (this.booking.checkIn && this.booking.checkOut) {
      const checkIn = new Date(this.booking.checkIn);
      const checkOut = new Date(this.booking.checkOut);
      
      if (checkOut <= checkIn) {
        this.hasDateError = true;
        console.log('Date error detected');
      }
    }
  }

  // Enhanced date display methods
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  getStayDuration(): number {
    if (!this.booking.checkIn || !this.booking.checkOut) return 0;
    
    const checkIn = new Date(this.booking.checkIn);
    const checkOut = new Date(this.booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
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

  // Helper to format dates for MySQL (YYYY-MM-DD HH:MM:SS)
private formatForMySQL(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return ''; // fallback if invalid
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

submit() {
  // Validate required fields
  if (
    !this.booking.checkIn ||
    !this.booking.checkOut ||
    this.booking.adults <= 0 ||
    this.booking.rooms <= 0
  ) {
    this.openModal('Please fill in all required fields.');
    return;
  }

  // Parse as Date objects
  const checkInDate = new Date(this.booking.checkIn);
  const checkOutDate = new Date(this.booking.checkOut);
  const today = new Date();
  const fiveYearsFromNow = new Date();

  today.setHours(0, 0, 0, 0);
  fiveYearsFromNow.setFullYear(today.getFullYear() + 5);
  fiveYearsFromNow.setHours(23, 59, 59, 999);

  // Date validations
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    this.openModal('Please select valid check-in and check-out dates.');
    return;
  }

  if (checkInDate < today) {
    this.openModal('Check-in date cannot be in the past.');
    return;
  }

  if (checkInDate > fiveYearsFromNow) {
    this.openModal('Check-in date cannot be more than 5 years from today.');
    return;
  }

  if (checkOutDate <= checkInDate) {
    this.openModal('Check-out date must be after check-in date.');
    return;
  }

  if (checkOutDate > fiveYearsFromNow) {
    this.openModal('Check-out date cannot be more than 5 years from today.');
    return;
  }

  // Create formatted booking for backend
  const formattedBooking: ReservationData = {
    ...this.booking,
    checkIn: this.formatForMySQL(this.booking.checkIn),
    checkOut: this.formatForMySQL(this.booking.checkOut),
  };

  console.log('Submitting Reservation:', formattedBooking);

  // Save & emit
  this.reservationDataService.setReservation(formattedBooking);
  this.next.emit(formattedBooking);
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
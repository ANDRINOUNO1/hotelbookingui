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

  constructor(private reservationDataService: ReservationDataService) {}

  ngOnInit(): void {
    // Load saved data if available
    const savedData = this.reservationDataService.getReservation();
    if (savedData) {
      this.booking = { ...savedData };
    }
  }

  submit() {
    // Validate required fields
    if (!this.booking.checkIn || !this.booking.checkOut || 
        this.booking.adults <= 0 || this.booking.rooms <= 0) {
      alert('Please fill in all required fields: Check-in date, Check-out date, Number of adults, and Number of rooms.');
      return;
    }

    // Validate dates
    const checkIn = new Date(this.booking.checkIn);
    const checkOut = new Date(this.booking.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      alert('Check-in date cannot be in the past.');
      return;
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    console.log('Submitting Reservation:', this.booking);
    this.reservationDataService.setReservation(this.booking);
    this.next.emit(this.booking);
  }

  isFormValid(): boolean {
    return !!(this.booking.checkIn && 
              this.booking.checkOut && 
              this.booking.adults > 0 && 
              this.booking.rooms > 0);
  }
}
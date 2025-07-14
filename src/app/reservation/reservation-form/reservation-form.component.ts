import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss']
})
export class ReservationFormComponent {
  @Output() next = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();


  booking = {
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    rooms: 1,
  };

  constructor(private reservationDataService: ReservationDataService) {}

  submit() {
    console.log('Submitting Reservation:', this.booking);
    this.reservationDataService.setReservation(this.booking);
    this.next.emit(this.booking);
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../booking.service';
import { Booking } from '../../models/booking.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservation-form.component.html'
})
export class ReservationFormComponent {
  booking: Booking = {
    checkIn: '',
    checkOut: '',
    adults: 1,
    childs: 0,
    rooms: 1,
    requests: ''
  };

  constructor(private bookingService: BookingService, private router: Router) {}

  submit() {
    this.bookingService.addBooking(this.booking);
    alert('Reservation submitted!');
    this.router.navigate(['/']);
  }
}
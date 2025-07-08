import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../booking.service';
import { Availability } from '../../_models/booking.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservation-form.component.html'
})
export class ReservationFormComponent {
  booking: Availability = {
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    rooms: 1,
    requests: ''
  };

  constructor(private bookingService: BookingService, private router: Router) {}

  submit() {
    this.bookingService.addAvailability(this.booking);
    alert('Availability submitted! Proceed to confirmation.');
    this.router.navigate(['/']);
  }
}
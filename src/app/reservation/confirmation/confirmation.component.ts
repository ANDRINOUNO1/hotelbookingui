import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomType } from '../../_models/booking.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})

export class ConfirmationComponent implements OnInit {
  @Output() back = new EventEmitter<void>();

  selectedRoomType: RoomType | null = null;
  reservationData: any = {};
  customerDetails: any = {};

  ngOnInit(): void {
    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    this.reservationData = this.reservationDataService.getReservation();
    this.customerDetails = this.reservationDataService.getCustomerDetails();
  }

  constructor(private http: HttpClient, private reservationDataService: ReservationDataService) {}

confirmBooking() {
  const reservation = this.reservationDataService.getReservation();
  const roomType = this.reservationDataService.getSelectedRoomType();
  const guest = this.reservationDataService.getCustomerDetails();

  const bookingPayload = {
    roomTypeId: roomType?.id,
    guest:{
      first_name: guest?.firstName,
      last_name: guest?.lastName,
      email: guest?.email,
      phone: guest?.phone,
      address: guest?.address,
      city: guest?.city,
    },
    roomsCount: reservation?.rooms,
    availability: {
      checkIn: reservation?.checkIn,
      checkOut: reservation?.checkOut,
      adults: reservation?.adults,
      children: reservation?.children,
      rooms: reservation?.rooms
    }
  };

  this.http.post('/api/bookings', bookingPayload).subscribe({
    next: booking => {
      console.log('✅ Booking saved:', booking);
      alert('Booking confirmed!');
    },
    error: err => {
      alert(err.error?.message || 'Booking failed.');
    }
  });
}
}

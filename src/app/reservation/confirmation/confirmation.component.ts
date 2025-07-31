import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomType, ReservationFee} from '../../_models/booking.model';
import { HttpClient } from '@angular/common/http';
import { RESERVATION_FEES } from '../../_models/entities';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})

export class ConfirmationComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() newReservation = new EventEmitter<void>();


  selectedRoomType: RoomType | null = null;
  reservationData: any = {};
  customerDetails: any = {};

  paymentDetails: any = {
    paymentMode: '',
    paymentMethod: '',
    amount: 0,
    mobileNumber: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  reservationFee: number = 0;

  constructor(
    private http: HttpClient,
    private reservationDataService: ReservationDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    this.reservationData = this.reservationDataService.getReservation();
    this.customerDetails = this.reservationDataService.getCustomerDetails();

    this.fetchReservationFee();
  }

  fetchReservationFee() {
    this.http.get<ReservationFee>(`${environment.apiUrl}/rooms/reservation-fee`).subscribe({
      next: (fee) => {
        this.reservationFee = fee.fee;
        this.paymentDetails.amount = this.reservationFee;
      },
      error: (err) => {
        this.reservationFee = 500;
        this.paymentDetails.amount = this.reservationFee;
      }
    });
  }

  confirmBooking() {
    // Basic fee check
    if (this.paymentDetails.amount < this.reservationFee) {
      alert(`Reservation fee must be at least ₱${this.reservationFee}.`);
      return;
    }

    const mode = this.paymentDetails.paymentMode;

    // Validate required fields based on payment mode
    if (!mode) {
      alert('Please select a payment mode.');
      return;
    }

    if ((mode === 'GCash' || mode === 'Maya')) {
      if (!this.paymentDetails.mobileNumber) {
        alert('Mobile number is required for GCash/Maya payments.');
        return;
      }
    }

    if (mode === 'Card') {
      const { paymentMethod, cardNumber, expiry, cvv } = this.paymentDetails;
      if (!paymentMethod || !cardNumber || !expiry || !cvv) {
        alert('Please fill in all required card payment fields.');
        return;
      }
    }

    // Payload
    const bookingPayload = {
      roomTypeId: this.selectedRoomType?.id,
      guest: {
        first_name: this.customerDetails?.firstName,
        last_name: this.customerDetails?.lastName,
        email: this.customerDetails?.email,
        phone: this.customerDetails?.phone,
        address: this.customerDetails?.address,
        city: this.customerDetails?.city
      },
      roomsCount: this.reservationData?.rooms,
      availability: {
        checkIn: this.reservationData?.checkIn,
        checkOut: this.reservationData?.checkOut,
        adults: this.reservationData?.adults,
        children: this.reservationData?.children,
        rooms: this.reservationData?.rooms
      },
      requests: this.reservationData?.requests || '',
      payment: { ...this.paymentDetails },
      pay_status: false,
      paidamount: this.paymentDetails.amount
    };

    // Submit booking
    this.http.post(`${environment.apiUrl}/bookings`, bookingPayload).subscribe({
      next: booking => {
        console.log('Booking saved:', booking);
        this.showConfirmationAlert();
        this.clearPaymentForm();        // 👈 clear after success
        this.reservationDataService.clearAllData(); // 👈 reset service data
      },
      error: err => {
        alert(err.error?.message || 'Booking failed.');
      }
    });
  }
  clearPaymentForm() {
    this.paymentDetails = {
      paymentMode: '',
      paymentMethod: '',
      amount: 0,
      mobileNumber: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    };
  }


  showConfirmationAlert() {
    // Show alert and navigate to home after OK
    alert('Booking confirmed!');
    this.router.navigate(['/']);
  }

  startNewReservation() {
    this.reservationDataService.clearAllData();
    this.newReservation.emit();
  }

  goBack() {
    this.back.emit();
  }
}

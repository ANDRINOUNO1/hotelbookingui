import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomType, ReservationFee} from '../../_models/booking.model';
import { HttpClient } from '@angular/common/http';
import { RESERVATION_FEES } from '../../_models/entities';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})

export class ConfirmationComponent implements OnInit {
  @Output() back = new EventEmitter<void>();


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

    const feeData: ReservationFee | undefined = RESERVATION_FEES[0];
    this.reservationFee = feeData?.fee ?? 0;
  }

  confirmBooking() {
    if (this.paymentDetails.amount < this.reservationFee) {
      alert(`Reservation fee must be at least $${this.reservationFee}. Please enter the correct amount.`);
      return; 
    }

    if (
      (this.paymentDetails.paymentMode === 'GCash' || this.paymentDetails.paymentMode === 'Maya') &&
      !this.paymentDetails.mobileNumber
    ) {
      alert('⚠️ Mobile number is required for GCash/Maya.');
      return; 
    }

    if (this.paymentDetails.paymentMode === 'Card') {
      if (
        !this.paymentDetails.paymentMethod ||
        !this.paymentDetails.cardNumber ||
        !this.paymentDetails.expiry ||
        !this.paymentDetails.cvv
      ) {
        alert('⚠️ Please fill in all card payment fields.');
        return; 
      }
    }

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
      payment: {
        paymentMode: this.paymentDetails.paymentMode,
        paymentMethod: this.paymentDetails.paymentMethod,
        amount: this.paymentDetails.amount,
        cardNumber: this.paymentDetails.cardNumber,
        expiry: this.paymentDetails.expiry,
        cvv: this.paymentDetails.cvv,
        mobileNumber: this.paymentDetails.mobileNumber
      }
    };

    this.http.post(`${environment.apiUrl}/bookings`, bookingPayload).subscribe({
      next: booking => {
        console.log('Booking saved:', booking);
        this.showConfirmationAlert();
      },
      error: err => {
        alert(err.error?.message || 'Booking failed.');
      }
    });
  }
  showConfirmationAlert() {
    // Show alert and navigate to home after OK
    alert('Booking confirmed!');
    this.router.navigate(['/']);
  }
}

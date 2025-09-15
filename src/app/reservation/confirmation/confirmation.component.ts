import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomType, ReservationFee} from '../../_models/booking.model';
import { HttpClient } from '@angular/common/http';
import { RESERVATION_FEES } from '../../_models/entities';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    amount: '₱0',
    mobileNumber: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  reservationFee: number = 0;
  calculatedReservationFee: number = 0;
  mobileNumberError: string = '';

  constructor(
    private http: HttpClient,
    private reservationDataService: ReservationDataService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    this.reservationData = this.reservationDataService.getReservation();
    this.customerDetails = this.reservationDataService.getCustomerDetails();

    this.calculateReservationFee();
  }

  validateMobileNumber(mobileNumber: string): boolean {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!cleanNumber.startsWith('09')) {
      this.mobileNumberError = 'Mobile number must start with "09"';
      return false;
    }
    if (cleanNumber.length !== 11) {
      this.mobileNumberError = 'Mobile number must be exactly 11 digits';
      return false;
    }
    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(cleanNumber)) {
      this.mobileNumberError = 'Please enter a valid Philippine mobile number';
      return false;
    }
    this.mobileNumberError = '';
    return true;
  }

    cardIcon: SafeUrl = '';

    onCardNumberInput(event: any) {
      let rawValue = event.target.value.replace(/\D/g, ''); // digits only

      // Detect card type first (on raw digits)
      const detectedType = this.detectCardType(rawValue);

      // Apply length limits
      let maxLength = 16;
      if (detectedType === 'American Express') {
        maxLength = 15;
      }
      rawValue = rawValue.substring(0, maxLength);

      // Format as XXXX XXXX XXXX XXXX
      let formattedValue = rawValue.replace(/(.{4})/g, '$1 ').trim();

      this.paymentDetails.cardNumber = formattedValue;
      event.target.value = formattedValue;

      this.paymentDetails.paymentMethod = detectedType;
      this.cardIcon = this.getCardIcon(detectedType);
    }

    detectCardType(cardNumber: string): string {
      const bin = cardNumber.substring(0, 6);

      if (/^416511/.test(bin)) return 'Visa - Debit';
      if (/^545143/.test(bin)) return 'MasterCard - Credit';
      if (/^548809/.test(bin)) return 'MasterCard - Credit';
      if (/^3[47]/.test(cardNumber)) return 'American Express';
      if (/^6(?:011|5|4[4-9])/.test(cardNumber)) return 'Discover';
      if (/^3(?:0[0-5]|[68])/.test(cardNumber)) return 'Diners Club';
      if (/^35/.test(cardNumber)) return 'JCB';
      return '';
    }

    getCardIcon(cardType: string): SafeUrl {
      let url = '';
      switch (cardType) {
        case 'Visa':
          url = 'https://img.icons8.com/color/48/visa.png';
          break;
        case 'MasterCard':
          url = 'https://img.icons8.com/color/48/mastercard-logo.png';
          break;
        case 'American Express':
          url = 'https://img.icons8.com/color/48/amex.png';
          break;
        case 'Discover':
          url = 'https://img.icons8.com/color/48/discover.png';
          break;
        case 'Diners Club':
          url = 'https://img.icons8.com/color/48/diners-club.png';
          break;
        case 'JCB':
          url = 'https://img.icons8.com/color/48/jcb.png';
          break;
      }
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    onMobileNumberInput(event: any) {
    let value = event.target.value; 
    value = value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }  
    this.paymentDetails.mobileNumber = value;
    event.target.value = value;
    
    this.validateMobileNumber(value);
  }

  onMobileNumberBlur() {
    if (this.paymentDetails.mobileNumber) {
      this.validateMobileNumber(this.paymentDetails.mobileNumber);
    }
  }

  onMobileNumberKeyPress(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onAmountInput(event: any) {
    let value = event.target.value;
    
    // If user is typing and there's no peso sign, add it
    if (value && !value.startsWith('₱')) {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      let cleanValue = numericValue;
      if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
      }
      
      // Add peso sign if there's a value
      if (cleanValue) {
        value = '₱' + cleanValue;
      }
    } else if (value.startsWith('₱')) {
      // If peso sign is already there, clean and reformat
      const numericValue = value.substring(1).replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      let cleanValue = numericValue;
      if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
      }
      
      value = '₱' + cleanValue;
    }
    
    this.paymentDetails.amount = value;
    event.target.value = value;
  }

  onAmountFocus(event: any) {
    // Clear the input when focused if it's empty or just the peso sign
    if (!this.paymentDetails.amount || this.paymentDetails.amount === '₱0' || this.paymentDetails.amount === '0') {
      this.paymentDetails.amount = '';
      event.target.value = '';
    }
  }

  onAmountBlur(event: any) {
    // If empty, set to ₱0
    if (!this.paymentDetails.amount || this.paymentDetails.amount === '') {
      this.paymentDetails.amount = '₱0';
      event.target.value = '₱0';
    }
  }

  calculateReservationFee() {
    if (this.selectedRoomType?.reservationFeePercentage && this.selectedRoomType?.basePrice) {
      this.calculatedReservationFee = (this.selectedRoomType.basePrice * this.selectedRoomType.reservationFeePercentage) / 100;
      this.reservationFee = this.calculatedReservationFee;
      this.paymentDetails.amount = '₱' + this.reservationFee.toString();
    } else {
      // Fallback to default fee if room type doesn't have reservation fee percentage
      this.fetchReservationFee();
    }
  }

  fetchReservationFee() {
    this.http.get<ReservationFee>(`${environment.apiUrl}/rooms/reservation-fee`).subscribe({
      next: (fee) => {
        this.reservationFee = fee.fee;
        this.paymentDetails.amount = '₱' + this.reservationFee.toString();
      },
      error: (err) => {
        this.reservationFee = 500;
        this.paymentDetails.amount = '₱' + this.reservationFee.toString();
      }
    });
  }

  async confirmBooking() {
    // Convert amount to number for validation (remove peso sign)
    const numericAmount = this.paymentDetails.amount.replace('₱', '');
    const amount = parseFloat(numericAmount) || 0;
    
    // Basic fee check
    if (amount < this.reservationFee) {
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
      
      // Validate mobile number format
      if (!this.validateMobileNumber(this.paymentDetails.mobileNumber)) {
        alert(this.mobileNumberError || 'Please enter a valid mobile number.');
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

    // 1. Fetch all rooms from backend
    const allRooms: any[] = (await this.http.get<any[]>(`${environment.apiUrl}/rooms`).toPromise()) ?? [];

    // 2. Filter rooms by selected type and status
    const availableRooms = allRooms.filter(room =>
      room.roomTypeId === this.selectedRoomType?.id &&
      (room.roomStatus === 'Vacant and Ready' || room.roomStatus === 'Vacant and Clean')
    );

    if (!availableRooms.length) {
      alert('No available rooms for the selected type.');
      return;
    }

  // 3. Select the first available room (or more if needed)
  const selectedRoom = availableRooms[0];
  const selectedRooms = availableRooms.slice(0, this.reservationData?.rooms || 1);

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
      rooms: selectedRooms.map(r => ({ id: r.id, number: r.number })),
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
        mobileNumber: this.paymentDetails.mobileNumber,
        amount: amount,
        cardNumber: this.paymentDetails.cardNumber,
        expiry: this.paymentDetails.expiry,
        cvv: this.paymentDetails.cvv
      },
      pay_status: false,
      paidamount: amount
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
      amount: '₱0',
      mobileNumber: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    };
    this.mobileNumberError = '';
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

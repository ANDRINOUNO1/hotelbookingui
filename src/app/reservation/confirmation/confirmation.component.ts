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

  // Modal state
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' | 'info' = 'info';

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
    this.http.get<ReservationFee>(`${environment.apiUrl}/rooms/types`).subscribe({
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

  isPaymentFormValid(): boolean {
    const mode = this.paymentDetails.paymentMode;

    if (!mode) return false;

    if (mode === 'Online') {
      if (!this.paymentDetails.paymentMethod) return false;
      if (!this.paymentDetails.mobileNumber || this.mobileNumberError) return false;
      if (!this.paymentDetails.amount || this.paymentDetails.amount === '₱0') return false;
      return true;
    }

    if (mode === 'Card') {
      if (!this.paymentDetails.cardNumber ||
          !this.paymentDetails.expiry ||
          !this.paymentDetails.cvv ||
          !this.paymentDetails.amount ||
          this.paymentDetails.amount === '₱0') return false;
      return true;
    }

    return false;
  }

  async confirmBooking() {
    if (!this.isPaymentFormValid()) {
      this.openModal('Incomplete Payment', 'Please fill in all required payment details.', 'error');
      return;
    }
    // Convert amount to number for validation (remove peso sign)
    const numericAmount = this.paymentDetails.amount.replace('₱', '');
    const amount = parseFloat(numericAmount) || 0;
    
    // Basic fee check
    if (amount < this.reservationFee) {
      this.openModal('Payment Error', `Reservation fee must be at least ₱${this.reservationFee}.`, 'error');
      return;
    }

    const mode = this.paymentDetails.paymentMode;

    // Validate required fields based on payment mode
    if (!mode) {
      this.openModal('Payment Required', 'Please select a payment mode.', 'error');
      return;
    }

    if ((mode === 'GCash' || mode === 'Maya')) {
      if (!this.paymentDetails.mobileNumber) {
        this.openModal('Missing Information', 'Mobile number is required for GCash/Maya payments.', 'error');
        return;
      }
      
      // Validate mobile number format
      if (!this.validateMobileNumber(this.paymentDetails.mobileNumber)) {
        this.openModal('Invalid Mobile Number', this.mobileNumberError || 'Please enter a valid mobile number.', 'error');
        return;
      }
    }

    if (mode === 'Card') {
      const { paymentMethod, cardNumber, expiry, cvv } = this.paymentDetails;
      if (!paymentMethod || !cardNumber || !expiry || !cvv) {
        this.openModal('Missing Card Details', 'Please fill in all required card payment fields.', 'error');
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
      this.openModal('No Availability', 'No available rooms for the selected type.', 'error');
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
      availability: {
        checkIn: this.reservationData?.checkIn,
        checkOut: this.reservationData?.checkOut,
        adults: this.reservationData?.adults,
        children: this.reservationData?.children,
        rooms: this.reservationData?.rooms
      },
      specialRequests: this.reservationData?.specialRequests || '',
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
        this.showConfirmationModal();
        this.clearPaymentForm();        // 👈 clear after success
        this.reservationDataService.clearAllData(); // 👈 reset service data
      },
      error: err => {
        this.openModal('Booking Failed', err.error?.message || 'Booking failed.', 'error');
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


  showConfirmationModal() {
    this.openModal('Booking Confirmed', 'Your booking has been confirmed, please wait for an email for payment confirmation. Thank you!', 'success');
  }

  openModal(title: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.modalType === 'success') {
      this.router.navigate(['/']);
    }
  }

  startNewReservation() {
    this.reservationDataService.clearAllData();
    this.newReservation.emit();
  }

  goBack() {
    this.back.emit();
  }
}

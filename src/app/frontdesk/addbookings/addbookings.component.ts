import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Booking, Guest, Availability, PaymentDetails, RoomType } from '../../_models/booking.model';
import { RESERVATION_FEES } from '../../_models/entities';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-addbookings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addbookings.component.html',
  styleUrl: './addbookings.component.scss'
})
export class AddbookingsComponent implements OnInit {
  bookingForm!: FormGroup;
  roomTypes: RoomType[] = [];
  selectedRoomTypes: { [key: number]: boolean } = {};
  loading = false;
  errorMessage = '';
  successMessage = '';
  reservationFee = RESERVATION_FEES[0]?.fee;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRoomTypes();
    this.initForm();
  }

  initForm() {
    this.bookingForm = this.fb.group({
      guest: this.fb.group({
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required, Validators.minLength(2)]]
      }),

      availability: this.fb.group({
        checkIn: ['', Validators.required],
        checkOut: ['', Validators.required],
        adults: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
        children: [0, [Validators.min(0), Validators.max(10)]],
        rooms: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
      }),

      payment: this.fb.group({
        paymentMode: ['', Validators.required],
        paymentMethod: [''],
        amount: [this.reservationFee, [Validators.required, Validators.min(this.reservationFee)]], // Set initial value
        mobileNumber: [''],
        cardNumber: [''],
        expiry: [''],
        cvv: ['']
      }),

      requests: ['']
    });

    // Amount is already set in the form initialization

    const today = new Date().toISOString().split('T')[0];
    this.bookingForm.get('availability.checkIn')?.setValue(today);

    this.bookingForm.get('availability.checkIn')?.valueChanges.subscribe(checkIn => {
      if (checkIn) {
        const checkInDate = new Date(checkIn);
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        this.bookingForm.get('availability.checkOut')?.setValue(nextDayStr);
      }
    });

    this.bookingForm.get('payment.paymentMode')?.valueChanges.subscribe(mode => {
      const mobileNumberControl = this.bookingForm.get('payment.mobileNumber');
      const cardNumberControl = this.bookingForm.get('payment.cardNumber');
      const expiryControl = this.bookingForm.get('payment.expiry');
      const cvvControl = this.bookingForm.get('payment.cvv');
      const paymentMethodControl = this.bookingForm.get('payment.paymentMethod');

      // Clear all validators first
      mobileNumberControl?.clearValidators();
      cardNumberControl?.clearValidators();
      expiryControl?.clearValidators();
      cvvControl?.clearValidators();
      paymentMethodControl?.clearValidators();

      if (mode === 'GCash' || mode === 'Maya') {
        mobileNumberControl?.setValidators([Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]);
      } else if (mode === 'Card') {
        cardNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]);
        expiryControl?.setValidators([Validators.required]);
        cvvControl?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        paymentMethodControl?.setValidators([Validators.required]);
      }
      // For Cash mode, no additional validators needed

      mobileNumberControl?.updateValueAndValidity();
      cardNumberControl?.updateValueAndValidity();
      expiryControl?.updateValueAndValidity();
      cvvControl?.updateValueAndValidity();
      paymentMethodControl?.updateValueAndValidity();
    });
  }


  loadRoomTypes() {
    this.http.get<RoomType[]>(`${environment.apiUrl}/rooms/types`).subscribe({
      next: (types) => {
        this.roomTypes = types;
        types.forEach(roomType => {
          this.selectedRoomTypes[roomType.id] = false;
        });
      },
      error: (error) => {
        console.error('Error loading room types:', error);
        this.errorMessage = 'Failed to load room types';
      }
    });
  }

  onRoomTypeChange(roomTypeId: number, checked: boolean) {
    this.selectedRoomTypes[roomTypeId] = checked;
    
    this.updatePaymentAmount();
  }

  onCheckboxChange(event: Event, roomTypeId: number) {
    const target = event.target as HTMLInputElement;
    this.selectedRoomTypes[roomTypeId] = target.checked;
    
    this.updatePaymentAmount();
  }

  updatePaymentAmount() {
    const selectedTypes = this.roomTypes.filter(rt => this.selectedRoomTypes[rt.id]);
    const totalAmount = selectedTypes.reduce((sum, rt) => sum + (rt.rate || 0), 0);
    
    if (totalAmount > 0) {
      this.bookingForm.get('payment.amount')?.setValue(totalAmount);
    } else {
      this.bookingForm.get('payment.amount')?.setValue(this.reservationFee);
    }
  }

  getSelectedRoomTypes(): RoomType[] {
    return this.roomTypes.filter(rt => this.selectedRoomTypes[rt.id]);
  }

  hasSelectedRoomTypes(): boolean {
    return Object.values(this.selectedRoomTypes).some(selected => selected);
  }

  onSubmit() {
  if (this.bookingForm.invalid) {
    this.markFormGroupTouched();
    this.errorMessage = 'Please fill all required fields correctly.';
    return;
  }

  if (!this.hasSelectedRoomTypes()) {
    this.errorMessage = 'Please select at least one room type.';
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';

  const formValue = this.bookingForm.value;
  const selectedRoomTypes = this.getSelectedRoomTypes();

  // Basic validation for payment details
  const payment = formValue.payment;
  if (Number(payment.amount) < this.reservationFee) {
    this.loading = false;
    this.errorMessage = `Reservation fee must be at least ₱${this.reservationFee}.`;
    return;
  }

  const mode = payment.paymentMode;
  if ((mode === 'GCash' || mode === 'Maya') && !payment.mobileNumber) {
    this.loading = false;
    this.errorMessage = 'Mobile number is required for GCash/Maya payments.';
    return;
  }
  if (mode === 'Card' &&
      (!payment.paymentMethod || !payment.cardNumber || !payment.expiry || !payment.cvv)) {
    this.loading = false;
    this.errorMessage = 'Please fill in all required card payment fields.';
    return;
  }

  const bookingPayloads = selectedRoomTypes.map(roomType => ({
    roomTypeId: roomType.id,
    guest: formValue.guest,
    roomsCount: formValue.availability.rooms,
    availability: formValue.availability,
    requests: formValue.requests || '',
    payment: {
      ...payment,
      amount: Number(payment.amount)
    },
    pay_status: true,
    paidamount: payment.amount
  }));

  const postRequests = bookingPayloads.map(payload =>
    this.http.post(`${environment.apiUrl}/bookings`, payload).toPromise()
  );

  Promise.all(postRequests)
    .then(results => {
      this.successMessage = `Successfully created ${results.length} booking(s)!`;
      this.bookingForm.reset();
      this.selectedRoomTypes = {};
      this.roomTypes.forEach(roomType => this.selectedRoomTypes[roomType.id] = false);
      this.initForm();
      setTimeout(() => {
        this.router.navigate(['/frontdesk/frontdeskdashboard']);
      }, 2000);
    })
    .catch(err => {
      this.errorMessage = err.error?.message || 'Failed to create booking.';
    })
    .finally(() => {
      this.loading = false;
    });
}

  markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  getErrorMessage(controlName: string, nestedControl?: string): string {
    const control = nestedControl 
      ? this.bookingForm.get(controlName)?.get(nestedControl)
      : this.bookingForm.get(controlName);
    
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
      if (control.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  isFieldInvalid(controlName: string, nestedControl?: string): boolean {
    const control = nestedControl 
      ? this.bookingForm.get(controlName)?.get(nestedControl)
      : this.bookingForm.get(controlName);
    
    return !!(control?.invalid && control?.touched);
  }

  isFormValid(): boolean {
    // Check if basic form is valid
    if (this.bookingForm.invalid) {
      console.log('Form is invalid:', this.bookingForm.errors);
      this.logFormValidationErrors();
      return false;
    }
    
    // Check if at least one room type is selected
    if (!this.hasSelectedRoomTypes()) {
      console.log('No room types selected');
      return false;
    }
    
    // Check payment-specific validations
    const paymentMode = this.bookingForm.get('payment.paymentMode')?.value;
    const payment = this.bookingForm.get('payment');
    
    if (paymentMode === 'GCash' || paymentMode === 'Maya') {
      const mobileNumber = payment?.get('mobileNumber')?.value;
      if (!mobileNumber) {
        console.log('Mobile number required for GCash/Maya');
        return false;
      }
    } else if (paymentMode === 'Card') {
      const cardNumber = payment?.get('cardNumber')?.value;
      const expiry = payment?.get('expiry')?.value;
      const cvv = payment?.get('cvv')?.value;
      const paymentMethod = payment?.get('paymentMethod')?.value;
      
      if (!cardNumber || !expiry || !cvv || !paymentMethod) {
        console.log('Card payment fields incomplete:', { cardNumber, expiry, cvv, paymentMethod });
        return false;
      }
    }
    
    return true;
  }

  logFormValidationErrors() {
    console.log('Form validation errors:');
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey);
          if (nestedControl?.invalid) {
            console.log(`${key}.${nestedKey}:`, nestedControl.errors);
          }
        });
      } else if (control?.invalid) {
        console.log(`${key}:`, control.errors);
      }
    });
  }
}
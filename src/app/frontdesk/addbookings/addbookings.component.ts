import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Booking, Guest, Availability, PaymentDetails, RoomType } from '../../_models/booking.model';
import { RESERVATION_FEES } from '../../_models/entities';

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
  reservationFee = RESERVATION_FEES[0]?.fee || 50;

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
        amount: [this.reservationFee, [Validators.required, Validators.min(this.reservationFee)]],
        mobileNumber: [''],
        cardNumber: [''],
        expiry: [''],
        cvv: ['']
      }),
      
      requests: ['']
    });

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
      
      if (mode === 'GCash' || mode === 'Maya') {
        mobileNumberControl?.setValidators([Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]);
        cardNumberControl?.clearValidators();
        expiryControl?.clearValidators();
        cvvControl?.clearValidators();
        paymentMethodControl?.clearValidators();
      } else if (mode === 'Card') {
        mobileNumberControl?.clearValidators();
        cardNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]);
        expiryControl?.setValidators([Validators.required]);
        cvvControl?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        paymentMethodControl?.setValidators([Validators.required]);
      } else {
        mobileNumberControl?.clearValidators();
        cardNumberControl?.clearValidators();
        expiryControl?.clearValidators();
        cvvControl?.clearValidators();
        paymentMethodControl?.clearValidators();
      }
      
      mobileNumberControl?.updateValueAndValidity();
      cardNumberControl?.updateValueAndValidity();
      expiryControl?.updateValueAndValidity();
      cvvControl?.updateValueAndValidity();
      paymentMethodControl?.updateValueAndValidity();
    });
  }

  loadRoomTypes() {
    this.http.get<RoomType[]>('/api/room-types').subscribe({
      next: (types) => {
        this.roomTypes = types;
        // Initialize selected room types
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
    if (this.bookingForm.valid && this.hasSelectedRoomTypes()) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.bookingForm.value;
      const selectedRoomTypes = this.getSelectedRoomTypes();
      
      const bookingPromises = selectedRoomTypes.map(roomType => {
        const bookingData = {
          guest: formValue.guest,
          availability: formValue.availability,
          roomTypeId: roomType.id,
          roomsCount: formValue.availability.rooms,
          payment: {
            ...formValue.payment,
            amount: roomType.rate || this.reservationFee
          },
          requests: formValue.requests,
          pay_status: true
        };

        return this.http.post<Booking[]>('/api/bookings', bookingData).toPromise();
      });

      Promise.all(bookingPromises)
        .then((results) => {
          this.loading = false;
          const totalBookings = results.reduce((sum, result) => sum + (result?.length || 0), 0);
          this.successMessage = `Successfully created ${totalBookings} booking(s)!`;
          this.bookingForm.reset();
          this.selectedRoomTypes = {};
          this.roomTypes.forEach(roomType => {
            this.selectedRoomTypes[roomType.id] = false;
          });
          this.initForm(); 
          
          setTimeout(() => {
            this.router.navigate(['/frontdesk/frontdeskdashboard']);
          }, 2000);
        })
        .catch((error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Failed to create booking';
        });
    } else {
      this.markFormGroupTouched();
      if (!this.hasSelectedRoomTypes()) {
        this.errorMessage = 'Please select at least one room type';
      }
    }
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
}

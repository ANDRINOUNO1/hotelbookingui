import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { startWith, Subject, takeUntil } from 'rxjs';
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
  estimatedTotal: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRoomTypes();
    this.initForm();

    this.bookingForm.valueChanges.subscribe(() => this.updateEstimatedTotal());
  }

  get numberOfNights(): number {
    const checkInStr = this.bookingForm.get('availability.checkIn')?.value;
    const checkOutStr = this.bookingForm.get('availability.checkOut')?.value;

    if (!checkInStr || !checkOutStr) {
      return 0;
    }

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    
    // Calculate the difference in time (milliseconds) and convert to days
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
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

    // Auto-update checkout when check-in changes
    this.bookingForm.get('availability.checkIn')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(checkIn => {
        if (checkIn) {
          const checkInDate = new Date(checkIn);
          const nextDay = new Date(checkInDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          this.bookingForm.get('availability.checkOut')?.setValue(nextDayStr);
        }
      });
    
    // NEW: Listen to changes in dates to recalculate the total amount
    const checkInControl = this.bookingForm.get('availability.checkIn');
    const checkOutControl = this.bookingForm.get('availability.checkOut');

    if (checkInControl && checkOutControl) {
        checkInControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateTotalAmount());
        checkOutControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateTotalAmount());
    }

    // Dynamic validators for payment mode
    this.bookingForm.get('payment.paymentMode')?.valueChanges
      .pipe(startWith(this.bookingForm.get('payment.paymentMode')?.value), takeUntil(this.destroy$))
      .subscribe(mode => {
        this.updatePaymentValidators(mode);
      });
  }
  
  // NEW: Centralized logic for updating payment validators
  updatePaymentValidators(mode: string) {
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

    // Update validity for all controls
    [mobileNumberControl, cardNumberControl, expiryControl, cvvControl, paymentMethodControl].forEach(control => control?.updateValueAndValidity());
  }

  // Format phone number input with auto "09" prefix
  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Auto-add "09" prefix if user starts typing without it
    if (value.length > 0 && !value.startsWith('09')) {
      if (value.length <= 9) {
        value = '09' + value;
      } else {
        value = '09' + value.substring(0, 9);
      }
    }
    
    // Limit to 11 digits total
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    event.target.value = value;
    
    // Update the form control
    this.bookingForm.patchValue({ 
      guest: { 
        ...this.bookingForm.get('guest')?.value, 
        phone: value 
      } 
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

  updateTotalAmount() {
    const selectedTypes = this.roomTypes.filter(rt => this.selectedRoomTypes[rt.id]);
    const dailyRate = selectedTypes.reduce((sum, rt) => sum + (rt.rate || 0), 0);
    const nights = this.numberOfNights;

    // Ensure we charge for at least one night if dates are valid
    const effectiveNights = nights > 0 ? nights : 1;
    const totalAmount = dailyRate * effectiveNights;

    const amountControl = this.bookingForm.get('payment.amount');
    if (totalAmount > 0) {
      amountControl?.setValue(totalAmount);
    } else {
      amountControl?.setValue(this.reservationFee);
    }
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

  async onSubmit() {
    if (this.bookingForm.invalid || !this.hasSelectedRoomTypes()) {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill all required fields correctly and select at least one room type.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.bookingForm.getRawValue();
      const payment = formValue.payment;
      const selectedRoomTypes = this.getSelectedRoomTypes();

      // ✅ Payment minimum check
      if (payment.amount < this.reservationFee) {
        alert(`Reservation fee must be at least ₱${this.reservationFee}.`);
        this.loading = false;
        return;
      }

      // ✅ Payment mode validation
      const mode = payment.paymentMode;
      if (!mode) {
        alert('Please select a payment mode.');
        this.loading = false;
        return;
      }

      if ((mode === 'GCash' || mode === 'Maya')) {
        if (!payment.mobileNumber) {
          alert('Mobile number is required for GCash/Maya payments.');
          this.loading = false;
          return;
        }
      }

      if (mode === 'Card') {
        const { paymentMethod, cardNumber, expiry, cvv } = payment;
        if (!paymentMethod || !cardNumber || !expiry || !cvv) {
          alert('Please fill in all required card payment fields.');
          this.loading = false;
          return;
        }
      }

      // ✅ Normalize check-in / check-out
      const checkIn = new Date(formValue.availability.checkIn).toISOString();
      const checkOut = new Date(formValue.availability.checkOut).toISOString();

      // ✅ Fetch all rooms
      const allRooms: any[] = (await this.http.get<any[]>(`${environment.apiUrl}/rooms`).toPromise()) ?? [];

      const bookingPayloads: any[] = [];

      for (const roomType of selectedRoomTypes) {
        // Filter rooms by type + vacant status
        const availableRooms = allRooms.filter(room =>
          room.roomTypeId === roomType.id &&
          (room.roomStatus === 'Vacant and Ready' || room.roomStatus === 'Vacant and Clean')
        );

        if (!availableRooms.length) {
          throw new Error(`Not enough available rooms for ${roomType.type}.`);
        }

        // Select the first available room
        const selectedRoom = availableRooms[0];

        const bookingPayload = {
          roomId: selectedRoom.id,
          roomTypeId: roomType.id,
          guest: { ...formValue.guest },
          availability: {
            checkIn,
            checkOut,
            adults: formValue.availability.adults,
            children: formValue.availability.children,
            rooms: formValue.availability.rooms
          },
          roomsCount: formValue.availability.rooms,
          requests: formValue.requests || '',
          payment: {
            ...payment,
            amount: payment.amount
          },
          paidamount: payment.amount,
          pay_status: true,
          createdBy: 'Frontdesk'
        };

        bookingPayloads.push({ bookingPayload, selectedRoomId: selectedRoom.id });
      }

      // ✅ Update room status + submit bookings
      const results = [];
      for (const { bookingPayload, selectedRoomId } of bookingPayloads) {

        const newBooking: any = await this.http.post(`${environment.apiUrl}/bookings/frontdesk`, bookingPayload).toPromise();
        results.push(newBooking);

        this.updateRoomAndBookingStatus(selectedRoomId, newBooking.id);
      }

      this.successMessage = `Successfully created ${results.length} booking(s)!`;
      this.bookingForm.reset();
      this.selectedRoomTypes = {};
      this.roomTypes.forEach(rt => this.selectedRoomTypes[rt.id] = false);
      this.initForm();

      setTimeout(() => this.router.navigate(['/frontdesk/frontdeskdashboard']), 2000);

    } catch (err: any) {
      this.errorMessage = err.error?.message || err.message || 'Failed to create booking.';
    } finally {
      this.loading = false;
    }
  }


  private async updateRoomAndBookingStatus(roomId: number, bookingId: number) { // <--- This function is now correct
    try {
      await this.http.patch(`${environment.apiUrl}/rooms/${roomId}/status`, { roomStatus: 'Occupied' }).toPromise();

      await this.http.patch(`${environment.apiUrl}/bookings/${bookingId}/check-in`, {}).toPromise();
    } catch (err) {
      console.error('Error updating room or booking status:', err);
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

  isFormValid(): boolean {
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

  updateEstimatedTotal() {
    const formValue = this.bookingForm.getRawValue();
    const availability = formValue.availability;
    const nights = this.numberOfNights || 1;

    const dailyRate = this.getSelectedRoomTypes()
      .reduce((sum, rt) => sum + (rt.rate || 0), 0);

    this.estimatedTotal = dailyRate * nights * (availability.rooms || 1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
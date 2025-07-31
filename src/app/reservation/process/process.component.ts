import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationDataService, CustomerDetails } from '../../_services/reservation-data.service';
import { RoomType } from '../../_models/booking.model';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  @Output() next = new EventEmitter<CustomerDetails>();
  @Output() back = new EventEmitter<void>();

  customerForm!: FormGroup;
  selectedRoomType: RoomType | null = null;

  constructor(
    private fb: FormBuilder,
    private reservationDataService: ReservationDataService
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      specialRequest: [''] // Optional field
    });

    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    
    // Load saved customer details if available
    const savedDetails = this.reservationDataService.getCustomerDetails();
    if (savedDetails) {
      this.customerForm.patchValue(savedDetails);
    }
  }

  submitForm() {
    if (this.customerForm.valid) {
      const formData = this.customerForm.value;
      this.reservationDataService.setCustomerDetails(formData);
      this.next.emit(formData);
    } else {
      this.customerForm.markAllAsTouched();
      this.showValidationErrors();
    }
  }

  showValidationErrors() {
    const errors: string[] = [];
    
    if (this.customerForm.get('firstName')?.hasError('required')) {
      errors.push('First name is required');
    }
    if (this.customerForm.get('lastName')?.hasError('required')) {
      errors.push('Last name is required');
    }
    if (this.customerForm.get('email')?.hasError('required')) {
      errors.push('Email is required');
    } else if (this.customerForm.get('email')?.hasError('email')) {
      errors.push('Please enter a valid email address');
    }
    if (this.customerForm.get('phone')?.hasError('required')) {
      errors.push('Phone number is required');
    }
    if (this.customerForm.get('address')?.hasError('required')) {
      errors.push('Address is required');
    }
    if (this.customerForm.get('city')?.hasError('required')) {
      errors.push('City is required');
    }
    if (this.customerForm.get('postalCode')?.hasError('required')) {
      errors.push('Postal code is required');
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
    }
  }

  isFormValid(): boolean {
    return this.customerForm.valid;
  }
}
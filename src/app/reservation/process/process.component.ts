import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
  showErrors = false;

  constructor(
    private fb: FormBuilder,
    private reservationDataService: ReservationDataService
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, this.lettersOnlyValidator()]],
      lastName: ['', [Validators.required, this.lettersOnlyValidator()]],
      email: ['', [Validators.required, this.gmailValidator()]],
      phone: ['09', [Validators.required, this.phoneValidator()]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, this.postalCodeValidator()]],
      specialRequest: [''] 
    });

    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    
    const savedDetails = this.reservationDataService.getCustomerDetails();
    if (savedDetails) {
      this.customerForm.patchValue(savedDetails);
    } else {
      this.customerForm.patchValue({ phone: '09' });
    }

    // Real-time validation feedback
    this.customerForm.valueChanges.subscribe(() => {
      this.showErrors = false;
    });
  }

  // Custom validator for letters only
  lettersOnlyValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const lettersOnly = /^[A-Za-z\s]+$/.test(control.value);
      return lettersOnly ? null : { lettersOnly: true };
    };
  }

  // Custom validator for Gmail email
  gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const email = control.value as string;
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isGmail = email.toLowerCase().endsWith('@gmail.com');
      return isValidEmail && isGmail ? null : { gmailOnly: true };
    };
  }

  // Custom validator for phone number (exactly 11 digits)
  phoneValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const phone = control.value.toString().replace(/\D/g, ''); // Remove non-digits
      const isValidLength = phone.length === 11;
      const isAllDigits = /^\d{11}$/.test(phone);
      return isValidLength && isAllDigits ? null : { invalidPhone: true };
    };
  }

  // Custom validator for postal code (exactly 4 digits)
  postalCodeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const postalCode = control.value.toString().replace(/\D/g, ''); // Remove non-digits
      const isValidLength = postalCode.length === 4;
      const isAllDigits = /^\d{4}$/.test(postalCode);
      return isValidLength && isAllDigits ? null : { invalidPostalCode: true };
    };
  }

  // Format phone number input
  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (!value.startsWith('09')) {
      if (value.length > 0) {
        if (value.length <= 9) {
          value = '09' + value;
        } else {
          value = '09' + value.substring(0, 9);
        }
      } else {
        value = '09';
      }
    }
    
    // Limit to 11 digits total
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    event.target.value = value;
    
    this.customerForm.patchValue({ phone: value });
  }

  // Format postal code input
  formatPostalCode(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    event.target.value = value;
  }

  // Get error message for a specific field
  getErrorMessage(fieldName: string): string {
    const control = this.customerForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (control.hasError('lettersOnly')) {
          return `${this.getFieldDisplayName(fieldName)} must contain only letters`;
        }
        break;
      case 'email':
        if (control.hasError('gmailOnly')) {
          return 'Email must be a valid Gmail address (@gmail.com)';
        }
        break;
      case 'phone':
        if (control.hasError('invalidPhone')) {
          return 'Phone number must be exactly 11 digits';
        }
        break;
      case 'postalCode':
        if (control.hasError('invalidPostalCode')) {
          return 'Postal code must be exactly 4 digits';
        }
        break;
    }

    return '';
  }

  // Get display name for field
  getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal code'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Check if field has error
  hasError(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  // Check if field is valid
  isValid(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.valid && control.touched);
  }

  submitForm() {
    if (this.customerForm.valid) {
      const formData = this.customerForm.value;
      this.reservationDataService.setCustomerDetails(formData);
      this.next.emit(formData);
    } else {
      this.customerForm.markAllAsTouched();
      this.showErrors = true;
      this.showValidationErrors();
    }
  }

  showValidationErrors() {
    const errors: string[] = [];
    
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control && control.errors) {
        const errorMessage = this.getErrorMessage(key);
        if (errorMessage) {
          errors.push(errorMessage);
        }
      }
    });

    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
    }
  }

  isFormValid(): boolean {
    return this.customerForm.valid;
  }


}
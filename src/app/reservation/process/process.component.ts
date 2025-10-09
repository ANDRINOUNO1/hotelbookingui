import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationDataService, CustomerDetails } from '../../_services/reservation-data.service';
import { RoomType } from '../../_models/booking.model';
import { BookingService } from '../../_services/booking.service';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { ConsentPolicyModalComponent } from '../process/consent.modal';
import { TermsNConditionsModalComponent } from '../termsnconditions.modal';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConsentPolicyModalComponent, TermsNConditionsModalComponent],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<CustomerDetails>();
  @Output() back = new EventEmitter<void>();

  customerForm!: FormGroup;
  selectedRoomType: RoomType | null = null;
  showErrors = false;
  showConsentModal = false;
  phoneChecking = false;
  phoneValid: boolean | null = null;
  showPolicyModal = false;
  showTermsModal = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private reservationDataService: ReservationDataService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, this.lettersOnlyValidator()]],
      lastName: ['', [Validators.required, this.lettersOnlyValidator()]],
      email: ['', [Validators.required, this.gmailValidator()], [this.emailExistsValidator()]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+63\d{10}$/)], 
        [this.phoneApiValidator()]
      ],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, this.postalCodeValidator()]],
      specialRequests: [''],
      consentAccepted: [false, Validators.requiredTrue]
    });
  }

  private loadSavedData(): void {
    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
    const savedDetails = this.reservationDataService.getCustomerDetails();
    if (savedDetails) {
      this.customerForm.patchValue(savedDetails);
    }
  }

  private setupFormSubscriptions(): void {
    const valueChangesSub = this.customerForm.valueChanges.subscribe(() => {
      this.resetFormState();
    });
    this.subscriptions.push(valueChangesSub);

    // Monitor email field for validation state
    const emailStatusSub = this.customerForm.get('email')?.statusChanges.subscribe(status => {
      // Handle email validation state changes if needed
    });
    if (emailStatusSub) {
      this.subscriptions.push(emailStatusSub);
    }
  }



  // Method to handle consent checkbox changes
  onConsentChange() {
    const consent = this.customerForm.get('consentAccepted')?.value;
    console.log('Consent changed:', consent);
  }


  // ✅ Async Validator using Backend Phone Verification
  phoneApiValidator() {
    return (control: AbstractControl) => {
      const phone = control.value;
      if (!phone || phone.length < 13) { 
        this.phoneChecking = false;
        this.phoneValid = null;
        return of(null);
      }
      
      this.phoneChecking = true;
      this.phoneValid = null;
      
      // Use backend endpoint instead of direct API call
      return this.http.post<any>(`${environment.apiUrl}/rooms/verify-phone`, { phone }).pipe(
        map((res) => {
          this.phoneChecking = false;
          this.phoneValid = res.phone_valid;
          return res.phone_valid ? null : { invalidPhoneApi: true };
        }),
        catchError((error) => {
          this.phoneChecking = false;
          this.phoneValid = false;
          console.error('Phone validation error:', error);
          
          // Fallback: Basic pattern validation if API fails
          const phonePattern = /^\+63\d{10}$/;
          const isValidFormat = phonePattern.test(phone);
          
          if (isValidFormat) {
            // If format is correct but API failed, allow it (graceful degradation)
            this.phoneValid = true;
            return of (null);
          } else {
            return of({ invalidPhoneApi: true });
          }
        })
      );
    };
  }

  lettersOnlyValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^[A-Za-z\s]+$/.test(control.value) ? null : { lettersOnly: true };
    };
  }

  gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const email = control.value as string;
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isGmail = email.toLowerCase().endsWith('@gmail.com');
      return isValidEmail && isGmail ? null : { gmailOnly: true };
    };
  }

  postalCodeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const postalCode = control.value.toString().replace(/\D/g, '');
      return /^\d{4}$/.test(postalCode) ? null : { invalidPostalCode: true };
    };
  }

  emailExistsValidator() {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      const email = control.value as string;
      if (!email.endsWith('@gmail.com')) {
        return of(null);
      }
      return this.bookingService.checkEmailExists(email).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        map(response => response.exists ? { emailExists: true } : null),
        catchError((error) => {
          console.error('Email validation error:', error);
          return of(null); // Don't block form submission on API error
        })
      );
    };
  }

  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
  
    if (value.startsWith('63')) {
      value = value.substring(2);
    }
    
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Format with +63 prefix
    const formattedValue = value.length > 0 ? `+63${value}` : '';
    
    event.target.value = formattedValue;
    this.customerForm.patchValue({ phone: formattedValue });
    
    // Reset phone validation state when phone number changes
    this.phoneChecking = false;
    this.phoneValid = null;
  }

  formatPostalCode(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    event.target.value = value;
    this.customerForm.patchValue({ postalCode: value });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.customerForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (control.hasError('lettersOnly')) return `${this.getFieldDisplayName(fieldName)} must contain only letters`;
        break;
      case 'email':
        if (control.hasError('gmailOnly')) return 'Email must be a valid Gmail address (@gmail.com)';
        if (control.hasError('emailExists')) return 'This Gmail address is already associated with an active booking';
        break;
      case 'phone':
        if (control.hasError('pattern')) return 'Phone number must be in format: +63XXXXXXXXXX (10 digits after +63)';
        if (control.hasError('invalidPhoneApi')) return 'Phone number could not be verified';
        break;
      case 'postalCode':
        if (control.hasError('invalidPostalCode')) return 'Postal code must be exactly 4 digits';
        break;
    }
    return '';
  }

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

  hasError(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  isValid(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.valid && control.touched);
  }

  submitForm() {
    // Use the form control value instead of this.consentAccepted
    if (!this.customerForm.get('consentAccepted')?.value) {
      alert('Please accept the data collection consent before proceeding.');
      return;
    }

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

  // Method to handle form submission with loading state
  async submitFormWithLoading() {
    if (this.isFormProcessing()) {
      return; 
    }

    try {
      this.submitForm();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    }
  }

  showValidationErrors() {
    const summary = this.getFormValidationSummary();
    if (!summary.valid && summary.errors.length > 0) {
      alert('Please fix the following errors:\n' + summary.errors.join('\n'));
    }
  }

  isFormValid(): boolean {
    return this.customerForm.valid && this.customerForm.get('consentAccepted')?.value;
  }


  isFormProcessing(): boolean {
    return this.phoneChecking || this.customerForm.get('email')?.pending || false;
  }


  // Method to reset form state
  resetFormState() {
    this.showErrors = false;
    this.phoneChecking = false;
    this.phoneValid = null;
  }

  // Method to reset the entire form
  resetForm() {
    this.customerForm.reset();
    this.resetFormState();
  }


  // Method to handle field focus
  onFieldFocus(fieldName: string) {
    const control = this.customerForm.get(fieldName);
    if (control && control.errors) {
      this.showErrors = false; // Clear errors when user starts typing
    }
  }

  // Method to handle field blur
  onFieldBlur(fieldName: string) {
    const control = this.customerForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      this.showErrors = true; // Show errors when user leaves field
    }
  }

  // Method to check if a specific field is valid
  isFieldValid(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.valid && control.touched);
  }

  // Method to check if a specific field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const control = this.customerForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // Method to get form validation summary
  getFormValidationSummary(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let valid = true;

    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control && control.errors && control.touched) {
        const errorMessage = this.getErrorMessage(key);
        if (errorMessage) {
          errors.push(errorMessage);
          valid = false;
        }
      }
    });

    return { valid, errors };
  }

  openPolicyModal() {
    this.showPolicyModal = true;
  }

  closePolicyModal() {
    this.showPolicyModal = false;
  }

  openTermsModal() {
    this.showTermsModal = true;
  }

  closeTermsModal() {
    this.showTermsModal = false;
  }

  // Method to handle form field changes
  onFieldChange(fieldName: string) {
    const control = this.customerForm.get(fieldName);
    if (control && control.valid) {
      // Clear any previous errors for this field
      this.showErrors = false;
    }
  }
  capitalizeFirstLetter(controlName: string) {
    const control = this.customerForm.get(controlName);
    if (control) {
      let value: string = control.value || '';
      if (value.length > 0) {
        // Preserve spaces while capitalizing each word
        value = value.replace(/\b\w/g, (char: string) => char.toUpperCase());
        control.setValue(value, { emitEvent: false });
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

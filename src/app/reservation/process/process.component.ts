import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomType } from '../../_models/booking.model';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  @Output() next = new EventEmitter<any>();
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
      address: [''],
      city: [''],
      postalCode: [''],
      specialRequest: ['']
    });

    this.selectedRoomType = this.reservationDataService.getSelectedRoomType();
  }

  submitForm() {
    if (this.customerForm.valid) {
      this.reservationDataService.setCustomerDetails(this.customerForm.value);
      this.next.emit(this.customerForm.value);
    } else {
      this.customerForm.markAllAsTouched();
    }
  }
}

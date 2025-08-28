import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceiptComponent } from '../lists/pointofsale.modal';
import { BookingService } from '../../_services/booking.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, ReceiptComponent],
  template: `
    <div *ngIf="reservation">
      <app-receipt
        [selectedReservation]="reservation"
        [paymentAmount]="paymentAmount"
        [billNo]="'BILL-' + reservation.id">
      </app-receipt>
    </div>
    <p *ngIf="!reservation">Loading...</p>
  `
})
export class BillingComponent implements OnInit {
  reservation: any;
  paymentAmount: number = 0;

  constructor(private route: ActivatedRoute, private bookingService: BookingService) {}

    ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
        const id = Number(idParam); // ✅ convert to number
        this.bookingService.getBookingById(id).subscribe(data => {
        this.reservation = data;
        });
    }
    }

}

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
      <app-receipt
        [selectedReservation]="selectedReservation"
        [paymentAmount]="paymentAmount"
        [billNo]="'BILL-' + selectedReservation?.id"
        (totalCalculated)="onTotalCalculated($event)">
      </app-receipt>
  `
})
export class BillingComponent {
  selectedReservation: any;
  paymentAmount: number = 0;
  billNo: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedReservation = params['reservation'] ? JSON.parse(params['reservation']) : null;
      this.paymentAmount = Number(params['paymentAmount']) || 0;
      this.billNo = params['billNo'] || '';
    });
  }

  onTotalCalculated(total: number) {
    this.paymentAmount = total;
  }
}
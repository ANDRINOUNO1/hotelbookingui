import { CommonModule } from '@angular/common';
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { RoomService } from '../../_services/room.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="receipt">
    <div class="header">
      <h2>{{ hotelName }}</h2>
      <p>{{ hotelAddress }}</p>
      <p>Tel: {{ hotelPhone }} | Email: {{ hotelEmail }}</p>
    </div>

    <div class="guest-info">
      <h3>Guest Information</h3>
      <p><strong>{{ selectedReservation?.guest_firstName }} {{ selectedReservation?.guest_lastName }}</strong></p>
      <p>{{ selectedReservation?.guest_address }}, {{ selectedReservation?.guest_city }}</p>
      <p>Email: {{ selectedReservation?.guest_email }}</p>
      <p>Tel No: {{ selectedReservation?.guest_phone || 'N/A' }}</p>
    </div>

    <div class="booking-info">
      <p><strong>Booking ID:</strong> {{ selectedReservation?.id }}</p>
      <p><strong>Bill No:</strong> {{ billNo }}</p>
      <p><strong>Bill Date:</strong> {{ today | date: 'dd/MM/yyyy' }}</p>
      <p><strong>Check In:</strong> {{ selectedReservation?.checkIn | date: 'dd/MM/yyyy h:mm a' }}</p>
      <p><strong>Check Out:</strong> {{ selectedReservation?.checkOut | date: 'dd/MM/yyyy h:mm a' }}</p>
    </div>

    <table class="charges">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Charges</th>
          <th>Payments</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let day of breakdown">
          <td>{{ day.date | date: 'dd/MM/yy' }}</td>
          <td>{{ day.description }}</td>
          <td>{{ day.charge | currency:'PHP' }}</td>
          <td>{{ day.payment ? (day.payment | currency:'PHP') : '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div *ngIf="filterRequestsByStatus('completed').length > 0; else noRequests">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let req of filterRequestsByStatus('completed')">
            <tr *ngFor="let product of req.products">
              <td>{{ product.name }}</td>
              <td>{{ product.quantity }}</td>
              <td>₱{{ product.price.toFixed(2) }}</td>
              <td>₱{{ (product.price * product.quantity).toFixed(2) }}</td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>

    <!-- Show this if there are no completed requests -->
    <ng-template #noRequests>
      <p class="no-requests">No Requests</p>
    </ng-template>

    <div class="totals">
      <p><strong>Total (excl. Discount & Tax):</strong> {{ totalAmount | currency:'PHP' }}</p>
      <p *ngIf="discount"><strong>Discount:</strong> {{ discount | currency:'PHP' }}</p>
      <p><strong>Grand Total:</strong> {{ grandTotal | currency:'PHP' }}</p>
      <p><strong>Amount Paid:</strong> {{ paymentAmount | currency:'PHP' }}</p>
      
      <p *ngIf="remainingBalance > 0"><strong>Remaining Balance:</strong> {{ remainingBalance | currency:'PHP' }}</p>
      <p *ngIf="change > 0"><strong>Change:</strong> {{ change | currency:'PHP' }}</p>
    </div>
  </div>
  `,
  styleUrl: './pointofsale.modal.scss'
})
export class ReceiptComponent implements OnInit {
  @Input() selectedReservation: any;
  @Input() billNo: string = '001';
  @Output() totalCalculated = new EventEmitter<number>();

  // 👇 Updated to trigger recalculation whenever payment changes
  private _paymentAmount: number = 0;
  @Input() 
  set paymentAmount(value: number) {
    this._paymentAmount = value || 0;
    this.calculateBreakdown(); // Recalculate totals on payment update
  }
  get paymentAmount(): number {
    return this._paymentAmount;
  }

  today: Date = new Date();

  hotelName = 'BC Flats';
  hotelAddress = '6014 Sacris Rd, Mandaue, Central Visayas, Philippines';
  hotelPhone = '+123-456-7890';
  hotelEmail = 'BCflats.edu.ph';

  breakdown: any[] = [];
  requestBreakdown: any[] = [];
  totalAmount: number = 0;
  discount: number = 0;
  grandTotal: number = 0;
  change: number = 0;
  remainingBalance: number = 0;

  roomRates: { [key: string]: number } = {};

  constructor(private roomsService: RoomService) {}

  ngOnInit() {
    if (this.selectedReservation) {
      this.roomsService.getRoomTypes().subscribe(types => {
        this.roomRates = types.reduce<Record<string, number>>((acc, t) => {
          acc[t.type.toLowerCase()] = typeof t.basePrice === 'string'
            ? parseFloat(t.basePrice)
            : t.basePrice;
          return acc;
        }, {});

        this.calculateBreakdown();
      });
    }
  }

  filterRequestsByStatus(status: string): any[] {
    if (!this.selectedReservation?.requests) {
      return [];
    }
    return this.selectedReservation.requests.filter((req: any) => req.status === status);
  }

  calculateBreakdown() {
    if (!this.selectedReservation) return;

    const nights = this.getNights(this.selectedReservation.checkIn, this.selectedReservation.checkOut);
    const dailyRate = this.getRateForRoomType(this.selectedReservation.roomType);

    // Room rentals
    this.breakdown = Array.from({ length: nights }).map((_, i) => {
      const date = new Date(this.selectedReservation.checkIn);
      date.setDate(date.getDate() + i);

      return {
        date,
        description: `${this.selectedReservation.roomType} Day Rental`,
        charge: dailyRate,
        payment: null
      };
    });

    // Requests/products (only completed)
    this.requestBreakdown = [];
    const confirmedRequests = this.filterRequestsByStatus('completed');

    if (confirmedRequests && confirmedRequests.length > 0) {
      confirmedRequests.forEach((req: any) => {
        (req.products || []).forEach((product: any) => {
          this.requestBreakdown.push({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            subtotal: product.price * product.quantity
          });
        });
      });
    }

    // Compute totals
    const roomTotal = this.breakdown.reduce((sum, d) => sum + d.charge, 0);
    const requestsTotal = this.requestBreakdown.reduce((sum, p) => sum + p.subtotal, 0);

    this.totalAmount = roomTotal + requestsTotal;
    this.grandTotal = this.totalAmount - this.discount;

    // 💰 Deduct payment
    if (this.paymentAmount >= this.grandTotal) {
      this.change = this.paymentAmount - this.grandTotal;
      this.remainingBalance = 0;
    } else {
      this.change = 0;
      this.remainingBalance = this.grandTotal - this.paymentAmount;
    }

    this.totalCalculated.emit(this.grandTotal);
  }

  getNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    return Math.max(1, (outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24));
  }

  getRateForRoomType(roomType: string): number {
    return this.roomRates[roomType?.toLowerCase()] || 0;
  }
}

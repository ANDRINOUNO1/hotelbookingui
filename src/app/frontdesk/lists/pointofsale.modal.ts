import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
    <p><strong>Adults:</strong> {{ selectedReservation?.adults }}</p>
    <p><strong>Children:</strong> {{ selectedReservation?.children }}</p>
    <p><strong>Rooms:</strong> {{ selectedReservation?.rooms }}</p>
  </div>


  <!-- Charges Breakdown -->
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

  <div class="totals">
    <p><strong>Total (excl. Discount & Tax):</strong> {{ totalAmount | currency:'PHP' }}</p>
    <p *ngIf="discount"><strong>Discount:</strong> {{ discount | currency:'PHP' }}</p>
    <p><strong>Grand Total:</strong> {{ grandTotal | currency:'PHP' }}</p>
    <p><strong>Amount Paid:</strong> {{ paymentAmount | currency:'PHP' }}</p>
    <p><strong>Change:</strong> {{ change | currency:'PHP' }}</p>
  </div>
</div>
`,
  styles: `
  .receipt {
  font-family: Arial, sans-serif;
  width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #000;
  color: #000;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.guest-info, .booking-info {
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th, td {
  border: 1px solid #000;
  padding: 5px;
  text-align: left;
}

.totals {
  text-align: right;
}
`
})
export class ReceiptComponent implements OnInit {
  @Input() selectedReservation: any;
  @Input() paymentAmount: number = 0;
  @Input() billNo: string = '001';
  today: Date = new Date();

  hotelName = 'BC Flats';
  hotelAddress = '6014 Sacris Rd, Mandaue, Central Visayas, Philippines';
  hotelPhone = '+123-456-7890';
  hotelEmail = 'BCflats.edu.ph';

  breakdown: any[] = [];
  totalAmount: number = 0;
  discount: number = 0;
  grandTotal: number = 0;
  change: number = 0;

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


  calculateBreakdown() {
    if (this.selectedReservation) {
      const nights = this.getNights(this.selectedReservation.checkIn, this.selectedReservation.checkOut);
      const dailyRate = this.getRateForRoomType(this.selectedReservation.roomType);

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

      this.totalAmount = this.breakdown.reduce((sum, d) => sum + d.charge, 0);
      this.grandTotal = this.totalAmount - this.discount;
      this.change = this.paymentAmount - this.grandTotal;
    }
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
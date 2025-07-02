import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ROOMS } from '../../models/entities';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../booking.service';
import { AnalyticsComponent } from './analytics/analytics.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, AnalyticsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  rooms = ROOMS;
  bookings: Booking[] = [];

  constructor(private bookingService: BookingService) {
    this.bookings = this.bookingService.getBookings();
  }

  get vacantCount() {
    // Vacant: rooms with status true and not booked
    return this.rooms.filter(room => room.status === true).length;
  }

  get occupiedCount() {
    // Occupied: rooms with status false or with a paid booking
    return this.rooms.filter(room =>
      room.status === false ||
      this.bookings.some(b => b.room_id === room.id && b.pay_status)
    ).length;
  }

  get reservedCount() {
    // Reserved: rooms with a booking that is not yet paid (pay_status === false)
    return this.bookings.filter(b => !b.pay_status).length;
  }

  get allCount() {
    return this.rooms.length;
  }

  // Add more getters for other statuses as needed

  get statusSummary() {
    return [
      { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: this.vacantCount },
      { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: this.occupiedCount },
      { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: this.reservedCount },
      // Add more as needed
      { label: 'All', icon: 'fa-list', class: 'status-all', count: this.allCount }
    ];
  }
}
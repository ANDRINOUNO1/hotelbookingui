import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Booking } from './models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private storageKey = 'bookings';
  bookings: Booking[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadBookings();
  }

  addBooking(booking: Booking) {
    booking.id = this.bookings.length + 1;
    this.bookings.push(booking);
    this.saveBookings();
    console.log('Booking successful:', booking);
  }

  getBookings(): Booking[] {
    return this.bookings;
  }

  private saveBookings() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bookings));
    }
  }

  private loadBookings() {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.storageKey);
      this.bookings = data ? JSON.parse(data) : [];
    } else {
      this.bookings = [];
    }
  }
}
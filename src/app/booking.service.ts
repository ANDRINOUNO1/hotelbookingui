import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Booking, Availability } from './_models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookingStorageKey = 'bookings';
  private availabilityStorageKey = 'availabilities';
  bookings: Booking[] = [];
  availabilities: Availability[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadBookings();
    this.loadAvailabilities();
  }

  // Save Availability and return its ID
  addAvailability(availability: Availability): number {
    const id = this.availabilities.length + 1;
    const newAvailability = { ...availability, id };
    this.availabilities.push(newAvailability);
    this.saveAvailabilities();
    return id;
  }

  getAvailabilities(): Availability[] {
    return this.availabilities;
  }

  addBooking(booking: Booking) {
    booking.id = this.bookings.length + 1;
    this.bookings.push(booking);
    this.saveBookings();
  }

  getBookings(): Booking[] {
    return this.bookings;
  }

  private saveBookings() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.bookingStorageKey, JSON.stringify(this.bookings));
    }
  }

  private loadBookings() {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.bookingStorageKey);
      this.bookings = data ? JSON.parse(data) : [];
    }
  }

  private saveAvailabilities() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.availabilityStorageKey, JSON.stringify(this.availabilities));
    }
  }

  private loadAvailabilities() {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.availabilityStorageKey);
      this.availabilities = data ? JSON.parse(data) : [];
    }
  }
}
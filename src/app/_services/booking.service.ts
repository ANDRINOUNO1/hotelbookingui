import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id: number;
  guest: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  availability: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  };
  payment: {
    paymentMode: string;
    paymentMethod: string;
    amount: number;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
  room_id: number;
  pay_status: boolean;
  created_at: string;
  updated_at: string;
  requests: string;
  paidamount: number;
}

export interface EmailCheckResponse {
  exists: boolean;
  booking: Booking | null;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) { }

  // Check if email is already used in an active booking
  checkEmailExists(email: string): Observable<EmailCheckResponse> {
    return this.http.get<EmailCheckResponse>(`${this.apiUrl}/check-email/${email}`);
  }

  // Get all bookings
  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  // Get booking by ID
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // Create new booking
  createBooking(booking: any): Observable<Booking[]> {
    return this.http.post<Booking[]>(this.apiUrl, booking);
  }

  // Update booking
  updateBooking(id: number, booking: any): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  // Delete booking
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Request } from './requests.service';

export interface Booking {
  id: number;
  // Nested guest object (from backend)
  guest?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  // Nested availability object (from backend)
  availability?: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  };
  // Nested payment object (from backend)
  payment?: {
    paymentMode: string;
    paymentMethod: string;
    amount: number;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
  // Flattened guest fields (fallback)
  guest_firstName?: string;
  guest_lastName?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  guest_city?: string;
  // Flattened availability fields
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  // Flattened payment fields
  paymentMode: string;
  paymentMethod: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  // Room information
  room_id: number;
  roomNumber: string;
  roomType: string;
  roomTypeId: number;
  // Status fields
  status: string;
  pay_status: boolean;
  created_at: string;
  updated_at: string;
  requests: Request[];
  paidamount: number;
  specialRequests: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
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

  // Get all requests for a booking
  getRequests(bookingId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/${bookingId}/requests`);
  }

  // Get a single request by ID
  getRequestById(bookingId: number, requestId: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${bookingId}/requests/${requestId}`);
  }

  // Create a new request for a booking
  createRequest(bookingId: number, request: Partial<Request>): Observable<Request> {
    return this.http.post<Request>(`${this.apiUrl}/${bookingId}/requests`, request);
  }

  // Update an existing request
  updateRequest(bookingId: number, requestId: number, data: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${bookingId}/requests/${requestId}`, data);
  }

  // Delete a request
  deleteRequest(bookingId: number, requestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${bookingId}/requests/${requestId}`);
  }

  // Get bookings by month and year
  getBookingsByMonth(month: number, year: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/by-month/${month}/${year}`);
  }

  // Get monthly summary
  getMonthlySummary(month: number, year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary/${month}/${year}`);
  }

} 
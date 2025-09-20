// src/app/services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Request {
  id?: number;
  booking_id: number;
  type: 'meal' | 'extra_bed' | 'cleaning' | 'other';
  description?: string;
  extra_bed_size?: string; // single | double | queen | king
  food_options?: string; // comma-separated
  parking_space?: string; // none | standard | premium
  quantity?: number;
  price?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  // Create new request
  createRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  // Get all requests for a booking
  getRequestsByBooking(bookingId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/${bookingId}`);
  }

  // Update request status
  updateRequest(id: number, data: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}`, data);
  }
}

// src/app/services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Match backend Request model
export interface RequestProduct {
  quantity: number;
}

export interface Request {
  id?: number;
  booking_id: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  products?: {
    id: number;
    name: string;
    price: number;
    quantity: number;  // direct quantity field
  }[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  // Create new request
  createRequest(request: Partial<Request>): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  // Get all requests for a booking
  getRequestsByBooking(bookingId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/booking/${bookingId}`);
  }

  // Update request status
  updateRequest(id: number, data: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}`, data);
  }

  addProductsToRequest(requestId: number, products: { id: number; quantity: number }[]) {
    return this.http.post<Request>(`${this.apiUrl}/${requestId}/products`, {
      products
    });
  }

}

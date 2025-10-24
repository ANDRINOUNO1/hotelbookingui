import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Archive {
  id: number;
  roomNumber: string;
  roomType: string;
  guest_firstName: string;
  guest_lastName: string;
  guest_email: string;
  guest_phone: string;
  guest_address: string;
  guest_city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  paymentMode: string;
  paymentMethod: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  room_id: number;
  pay_status: boolean;
  created_at: string;
  updated_at: string;
  requests: string;
  paidamount: number;
  deleted_at: string;
}

@Injectable({ providedIn: 'root' })
export class ArchiveDataService {
  private baseUrl = `${environment.apiUrl}/archives`;
  constructor(private http: HttpClient) {}

  getAllArchives(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getArchiveById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getArchivesByMonth(month: number, year: number): Observable<Archive[]> {
    return this.http.get<Archive[]>(`${this.baseUrl}/by-month/${month}/${year}`);
  }
}

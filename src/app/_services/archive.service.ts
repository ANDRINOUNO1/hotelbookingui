import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Archive {
  id: number;
  roomNumber: string;
  roomType: string;
  guest: string;
  email: string;
  phone: string;
  arrivalDate: string;
  departureDate: string;
  payment: number;
  paymentMethod: string;
  payStatus: string;
  status: string;
  createdAt: string;
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
}

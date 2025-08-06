import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageFilters {
  status?: 'unread' | 'read' | 'replied';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ContactMessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactMessageService {
  private apiUrl = `${environment.apiUrl}/contact-messages`;

  constructor(private http: HttpClient) { }

  // Submit a new contact message (public endpoint)
  submitMessage(messageData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, messageData);
  }

  // Get all contact messages (admin only)
  getMessages(filters?: ContactMessageFilters): Observable<any> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      params = queryParams.toString();
    }
    
    const url = params ? `${this.apiUrl}?${params}` : this.apiUrl;
    return this.http.get(url);
  }

  // Get a single message by ID
  getMessage(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update message status
  updateStatus(id: number, status: 'unread' | 'read' | 'replied'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  // Mark message as read
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  // Mark message as replied
  markAsReplied(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/replied`, {});
  }

  // Delete a message
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get message statistics
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }
} 
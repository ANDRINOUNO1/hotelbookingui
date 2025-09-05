// services/login-history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginHistory {
  id: number;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  account: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginHistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getLogs(): Observable<LoginHistory[]> {
    return this.http.get<LoginHistory[]>(this.apiUrl);
  }

  getLogsByAccount(accountId: number): Observable<LoginHistory[]> {
    return this.http.get<LoginHistory[]>(`${this.apiUrl}/account/${accountId}`);
  }

  createLog(log: { accountId: number; action: 'login' | 'logout' }): Observable<LoginHistory> {
    return this.http.post<LoginHistory>(this.apiUrl, log);
  }
}

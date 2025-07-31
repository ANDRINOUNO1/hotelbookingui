import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private apiUrl = `${environment.apiUrl}/archives`;

  constructor(private http: HttpClient) {}

  getAllArchives(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getArchiveById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}

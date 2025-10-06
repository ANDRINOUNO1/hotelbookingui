import { Component, OnInit } from '@angular/core';
import { LoginHistoryService, LoginHistory } from '../../_services/login-history.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class LoginHistoryComponent implements OnInit {
  logs: any[] = [];
  paginatedLogs: any[] = [];

  currentPage = 1;
  pageSize = 10; // ✅ Show 10 logs per page
  totalPages = 0;

  isLoading = false;
  error: string | null = null;

  Math = Math;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  /** ✅ Fetch all login/logout logs */
  loadLogs(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/history`).subscribe({
      next: (data) => {
        this.logs = data;
        this.totalPages = Math.ceil(this.logs.length / this.pageSize);
        this.updatePaginatedLogs();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load logs.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /** ✅ Slice logs for current page */
  updatePaginatedLogs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLogs = this.logs.slice(startIndex, endIndex);
  }

  /** ✅ Go to next page */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedLogs();
    }
  }

  /** ✅ Go to previous page */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedLogs();
    }
  }
}
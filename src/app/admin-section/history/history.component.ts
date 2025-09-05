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
  logs: LoginHistory[] = [];
  isLoading = false;
  error = '';

  constructor(private historyService: LoginHistoryService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    this.error = '';

    this.historyService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load all login history.';
        console.error('Error fetching logs:', err);
        this.isLoading = false;
      }
    });
  }
}
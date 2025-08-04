import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Account } from '../../_models/account.model';
import { Role } from '../../_models/role.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {
  @Output() accountAdded = new EventEmitter<Account>();
  @Output() closed = new EventEmitter<void>();

  account: Account = new Account({ role: Role.frontdeskUser });
  error = '';
  success = false;
  loading = false;
  Role = Role;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Component initialized
  }

  addAccount() {
    this.error = '';
    this.success = false;
    this.loading = true;

    this.http.post(`${environment.apiUrl}/accounts/register`, this.account).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.accountAdded.emit(this.account);
        setTimeout(() => this.close(), 2000);
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to add account.';
        this.loading = false;
      }
    });
  }

  close() {
    this.closed.emit();
  }

  clearForm() {
    this.account = new Account({ role: Role.frontdeskUser });
    this.error = '';
    this.success = false;
  }
} 
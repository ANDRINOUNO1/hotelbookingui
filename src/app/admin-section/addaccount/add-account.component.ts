import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '../../_models/account.model';
import { Role } from '../../_models/role.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-add-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent {
  @Output() accountAdded = new EventEmitter<Account>();
  @Output() closed = new EventEmitter<void>();

  account: Account = new Account({ role: Role.frontdeskUser });
  error = '';
  success = false;
  Role = Role;

  constructor(private http: HttpClient) {}

  addAccount() {
    this.error = '';
    this.success = false;
    this.http.post(`${environment.apiUrl}/accounts/register`, this.account).subscribe({
      next: () => {
        this.success = true;
        this.accountAdded.emit(this.account);
        setTimeout(() => this.close(), 1000);
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to add account.';
      }
    });
  }

  close() {
    this.closed.emit();
  }
} 
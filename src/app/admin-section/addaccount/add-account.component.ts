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
  Role = Role;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Component initialized without loading spinner
  }

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
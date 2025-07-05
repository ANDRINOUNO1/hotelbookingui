import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '../../_models/account.model';
import { Role } from '../../_models/role.model';
import { AccountService } from '../../_services/account.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  editingId: string | null = null;
  editAccount: Account | null = null;
  search = '';
  page = 1;
  pageSize = 10;
  currentUserId: string | null = null;
  public Role = Role;

  newAccount: any = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: ''
  };

  constructor(private accountService: AccountService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadAccounts();
    });
  }

  ngOnInit() {
    this.loadAccounts();
    const current = this.accountService.accountValue;
    this.currentUserId = current?.id || null;
  }

  loadAccounts() {
    this.accountService.getAll().subscribe(accounts => {
      this.accounts = accounts;
      this.filteredAccounts = accounts; 
    });
  }

  applyFilter() {
    const term = this.search.toLowerCase();
    this.filteredAccounts = this.accounts.filter(a =>
      a.firstName?.toLowerCase().includes(term) ||
      a.lastName?.toLowerCase().includes(term) ||
      a.title?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      (a.role + '').toLowerCase().includes(term)
    );
    this.page = 1;
  }

  startEdit(account: Account) {
    this.editingId = account.id || null;
    this.editAccount = { ...account };
  }

  saveEdit() {
    if (this.editAccount && this.editingId) {
      this.accountService.update(this.editingId, this.editAccount).subscribe(() => {
        this.editingId = null;
        this.editAccount = null;
        this.loadAccounts();
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editAccount = null;
  }

  deleteAccount(id: string) {
    if (id === this.currentUserId) return;
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.delete(id).subscribe(() => this.loadAccounts());
    }
  }

  addAccount() {
    this.accountService.create(this.newAccount).subscribe({
      next: () => {
        this.loadAccounts();
        this.newAccount = { username: '', firstName: '', lastName: '', email: '', role: '', password: '' };
      },
      error: err => {
        alert('Failed to add account: ' + (err.error?.message || err.message));
      }
    });
  }

  get pagedAccounts() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAccounts.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredAccounts.length / this.pageSize);
  }
} 
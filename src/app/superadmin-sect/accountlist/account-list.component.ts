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
  showEditModal = false;
  
  // Custom delete confirmation modal
  showDeleteModal = false;
  accountToDelete: Account | null = null;

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
      // Only load accounts if user is logged in
      const account = this.accountService.accountValue;
      if (account) {
        this.loadAccounts();
      }
    });
  }

  ngOnInit() {
    // Check if user is logged in first
    const account = this.accountService.accountValue;
    if (!account) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadAccounts();
    const current = this.accountService.accountValue;
    this.currentUserId = current?.id || null;
  }

  loadAccounts() {
    this.accountService.getAll().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(acc => acc.status === 'Active');
        this.filteredAccounts = this.accounts;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.router.navigate(['/login']);
        }
      }
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
    this.showEditModal = true;
  }

  saveEdit() {
    if (this.editAccount && this.editingId) {
      this.accountService.update(this.editingId, this.editAccount).subscribe(() => {
        this.editingId = null;
        this.editAccount = null;
        this.showEditModal = false;
        this.loadAccounts();
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editAccount = null;
    this.showEditModal = false;
  }

  // Show custom delete confirmation modal
  showDeleteConfirmation(account: Account) {
    if (account.id === this.currentUserId) return;
    this.accountToDelete = account;
    this.showDeleteModal = true;
  }

  // Confirm delete action
  confirmDelete() {
    if (this.accountToDelete && this.accountToDelete.id) {
      this.accountService.delete(this.accountToDelete.id).subscribe(() => {
        this.loadAccounts();
        this.cancelDelete();
      });
    }
  }

  // Cancel delete action
  cancelDelete() {
    this.showDeleteModal = false;
    this.accountToDelete = null;
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
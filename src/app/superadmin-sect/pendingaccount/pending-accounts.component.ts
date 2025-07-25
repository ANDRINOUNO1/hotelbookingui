import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-pending-accounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-accounts.component.html',
  styleUrls: ['./pending-accounts.component.scss']
})
export class PendingAccountsComponent implements OnInit {
  accounts: any[] = [];
  page: number = 1;
  pageSize: number = 10;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadPendingAccounts();
  }

  loadPendingAccounts() {
    this.accountService.getAll().subscribe(accounts => {
      this.accounts = accounts.filter(acc => acc.status === 'Pending');
      console.log('Loaded pending accounts:', this.accounts);
    });
  }

  approveAccount(id: string) {
    this.accountService.update(id, { status: 'Active' }).subscribe(() => {
      this.loadPendingAccounts();
    });
  }

  deleteAccount(id: string) {
    this.accountService.delete(id).subscribe(() => {
      this.loadPendingAccounts();
    });
  }

  get pagedAccounts() {
    const start = (this.page - 1) * this.pageSize;
    return this.accounts.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.accounts.length / this.pageSize) || 1;
  }
} 
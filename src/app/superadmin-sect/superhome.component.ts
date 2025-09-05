import { Component, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LoginHistoryService } from '../_services/login-history.service';

@Component({
  selector: 'app-superhome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './superhome.component.html',
  styleUrl: './superhome.component.scss'
})
export class SuperhomeComponent {
  showAccountsDropdown = false;

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private el: ElementRef,
    private titleservice: Title,
    private loginHistoryService: LoginHistoryService
  ) {}

  logout() {
    const accountId = sessionStorage.getItem('accountId'); 

    if (accountId) {
      this.loginHistoryService.createLog({ accountId: +accountId, action: 'logout' })
        .subscribe({
          next: () => console.log('Logout recorded in history'),
          error: (err) => console.error('Failed to record logout history', err)
        });
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');        // 👈 clear user too
    }

    this.titleservice.setTitle('BC Flats');
    this.router.navigate(['/login']);
  }

  toggleAccountsDropdown() {
    this.showAccountsDropdown = !this.showAccountsDropdown;
  }
} 
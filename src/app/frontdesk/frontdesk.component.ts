import { Component, Renderer2, Inject, PLATFORM_ID, OnInit, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LoginHistoryService } from '../_services/login-history.service';

@Component({
  selector: 'app-frontdesk',
  standalone: true, // Assuming standalone, add if not already
  imports: [CommonModule, RouterModule],
  templateUrl: './frontdesk.component.html',
  styleUrl: './frontdesk.component.scss'
})
export class FrontdeskComponent implements OnInit {
  // --- NEW CODE ---
  public isSidebarOpen = true; // Sidebar is open by default on desktop

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private el: ElementRef,
    private titleService: Title,
    private loginHistoryService: LoginHistoryService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('BC Flats - Frontdesk');
    // --- NEW CODE ---
    // On smaller screens, start with the sidebar closed.
    if (isPlatformBrowser(this.platformId)) {
        if (window.innerWidth < 768) {
            this.isSidebarOpen = false;
        }
    }
  }
  
  // --- NEW FUNCTION ---
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

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
      localStorage.removeItem('user');
    }

    this.titleService.setTitle('BC Flats');
    this.router.navigate(['/login']);
  }
}
import { Component, Renderer2, Inject, PLATFORM_ID, ElementRef, OnInit, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { LoginHistoryService } from '../_services/login-history.service';

@Component({
  selector: 'app-superhome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './superhome.component.html',
  styleUrl: './superhome.component.scss'
})
export class SuperhomeComponent implements OnInit {
  showAccountsDropdown = false;
  isSidebarOpen = true; // Sidebar is open by default on desktop
  isMobileMenuOpen = false;

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private el: ElementRef,
    private titleservice: Title,
    private loginHistoryService: LoginHistoryService
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Close mobile menu on route change
      this.closeMobileMenu();
    });
  }

  ngOnInit(): void {
    this.titleservice.setTitle('BC Flats - Super Admin');
    // On smaller screens, start with the sidebar closed.
    if (isPlatformBrowser(this.platformId)) {
        if (window.innerWidth < 768) {
            this.isSidebarOpen = false;
        }
    }
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

    this.titleservice.setTitle('BC Flats');
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Close dropdown when sidebar is closed
    if (!this.isSidebarOpen) {
      this.showAccountsDropdown = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = this.el.nativeElement.querySelector('.superadmin-sidebar');
    const mobileToggle = this.el.nativeElement.querySelector('.mobile-menu-toggle');
    const overlay = this.el.nativeElement.querySelector('.mobile-overlay');
    
    if (sidebar) {
      if (this.isMobileMenuOpen) {
        this.renderer.addClass(sidebar, 'mobile-open');
        this.renderer.addClass(mobileToggle, 'active');
        if (overlay) {
          this.renderer.addClass(overlay, 'active');
        }
      } else {
        this.renderer.removeClass(sidebar, 'mobile-open');
        this.renderer.removeClass(mobileToggle, 'active');
        if (overlay) {
          this.renderer.removeClass(overlay, 'active');
        }
      }
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    const sidebar = this.el.nativeElement.querySelector('.superadmin-sidebar');
    const mobileToggle = this.el.nativeElement.querySelector('.mobile-menu-toggle');
    const overlay = this.el.nativeElement.querySelector('.mobile-overlay');
    
    if (sidebar) {
      this.renderer.removeClass(sidebar, 'mobile-open');
      this.renderer.removeClass(mobileToggle, 'active');
      if (overlay) {
        this.renderer.removeClass(overlay, 'active');
      }
    }
  }

  toggleAccountsDropdown() {
    this.showAccountsDropdown = !this.showAccountsDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownToggle = this.el.nativeElement.querySelector('.dropdown-toggle');
    const dropdownMenu = this.el.nativeElement.querySelector('.dropdown-menu');
    const sidebar = this.el.nativeElement.querySelector('.superadmin-sidebar');
    const mobileToggle = this.el.nativeElement.querySelector('.mobile-menu-toggle');
    
    // Close dropdown when clicking outside
    if (dropdownToggle && dropdownMenu) {
      if (!dropdownToggle.contains(target) && !dropdownMenu.contains(target)) {
        this.showAccountsDropdown = false;
      }
    }

    // Close mobile menu when clicking outside
    if (this.isMobileMenuOpen && 
        !sidebar?.contains(target) && 
        !mobileToggle?.contains(target)) {
      this.closeMobileMenu();
    }
  }
}

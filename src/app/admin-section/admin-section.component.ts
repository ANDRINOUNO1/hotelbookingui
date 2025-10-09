import { Component, Renderer2, Inject, PLATFORM_ID, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { LoginHistoryService } from '../_services/login-history.service';
import { AccountService } from '../_services/account.service';
import { Account } from '../_models/account.model';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.scss']
})
export class AdminSectionComponent implements OnInit {
  hotelName = 'BC Flats - Admin';
  user: Account | null = null;

  isDarkMode = false;
  openMenu: string | null = null;
  userMenuOpen = false;
  isLoading = false;
  isMobileMenuOpen = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private titleservice: Title,
    private loginHistoryService: LoginHistoryService,
    private accountService: AccountService
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showLoading();
      // Close mobile menu on route change
      this.closeMobileMenu();
    });
  }

  ngOnInit(): void {
    // Load user data from account service
    this.user = this.accountService.accountValue;
    
    // Subscribe to account changes
    this.accountService.account.subscribe(account => {
      this.user = account;
    });

    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('admin-theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
    }
    this.titleservice.setTitle('BC Flats - Admin');
  }
  

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close mobile menu when clicking outside
    const target = event.target as HTMLElement;
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
    const mobileToggle = this.el.nativeElement.querySelector('.mobile-menu-toggle');
    
    if (this.isMobileMenuOpen && 
        !sidebar?.contains(target) && 
        !mobileToggle?.contains(target)) {
      this.closeMobileMenu();
    }
  }

  showLoading() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000); // 2 seconds delay
  }

  navigateWithLoading(route: string) {
    this.isLoading = true;
    this.router.navigate([route]).then(() => {
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('admin-theme', this.isDarkMode ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(this.el.nativeElement, 'dark-mode');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'dark-mode');
    }
  }

  toggleMenu(menu: string) {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
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
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
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

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    setTimeout(() => this.userMenuOpen = false, 150); // Delay to allow click
  }

  goToProfile(event: Event) {
    event.preventDefault();
    this.userMenuOpen = false;
    // Navigate to profile page
    // Example: this.router.navigate(['/admin/profile']);
    console.log('Navigate to profile');
  }

  goToSettings(event: Event) {
    event.preventDefault();
    this.userMenuOpen = false;
    // Navigate to settings page
    // Example: this.router.navigate(['/admin/settings']);
    console.log('Navigate to settings');
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
      this.userMenuOpen = false;
    }
    const accountId = sessionStorage.getItem('accountId'); 

    if (accountId) {
      this.loginHistoryService.createLog({ accountId: +accountId, action: 'logout' })
        .subscribe({
          next: () => console.log('Logout recorded in history'),
          error: (err) => console.error('Failed to record logout history', err)
        });
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin-theme');
      localStorage.removeItem('user');        // 👈 clear user too
    }

    this.titleservice.setTitle('BC Flats');
    this.router.navigate(['/login']);
  }
  footerContent = {
    companyName: 'BC Flats',
    phone1: '+123-456-7890',
    phone2: '+696-969-69696',
    email: 'BCflats.edu.ph',
    address: 'A.S Fortuna - 400104',
    social: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#'
    },
    copyrightText: '',
    showDynamicYear: true,
    styles: {
      backgroundColor: '#0b0b31',
      textColor: '#e5c07b',
      linkColor: '#b4884d',
      copyrightBackgroundColor: '#f8f9fa'
    }
  };
  getDisplayRole(): string {
    if (!this.user?.role) return 'User';
    
    switch (this.user.role) {
      case 'Admin':
        return 'Admin';
      case 'frontdeskUser':
        return 'Frontdesk Manager';
      case 'SuperAdmin':
        return 'Super Admin';
      default:
        return this.user.role;
    }
  }

  getCopyrightText(): string {
    if (this.footerContent.copyrightText) {
      return this.footerContent.copyrightText;
    }
    
    if (this.footerContent.showDynamicYear) {
      return `© ${this.getCurrentYear()}-${this.getNextYear()} ${this.footerContent.companyName}. All rights reserved.`;
    }
    
    return `© ${this.footerContent.companyName}. All rights reserved.`;
  }
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getNextYear(): number {
    return new Date().getFullYear() + 1;
  }
}
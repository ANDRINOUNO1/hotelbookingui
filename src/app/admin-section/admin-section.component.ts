import { Component, Renderer2, Inject, PLATFORM_ID, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.scss']
})
export class AdminSectionComponent implements OnInit {
  hotelName = 'BC Flats - Admin';
  user = 'Admin';

  isDarkMode = false;
  openMenu: string | null = null;
  userMenuOpen = false;
  isLoading = false;
  isMobileMenuOpen = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
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

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('admin-theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
    }
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

  goToProfile() {
    // Navigate to profile page
    // Example: this.router.navigate(['/admin/profile']);
  }

  goToSettings() {
    // Navigate to settings page
    // Example: this.router.navigate(['/admin/settings']);
  }

  logout() {
    // Clear any stored data
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin-theme');
      sessionStorage.clear();
    }
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
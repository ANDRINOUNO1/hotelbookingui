import { Component, Renderer2, Inject, PLATFORM_ID, OnInit, ElementRef } from '@angular/core';
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
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('admin-theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this.router.navigate(['/']);
  }
}
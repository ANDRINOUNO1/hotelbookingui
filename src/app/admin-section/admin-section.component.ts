import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.scss'] // <-- This connects the HTML to the SCSS
})
export class AdminSectionComponent {
  hotelName = 'BC Flats - Admin';
  user = 'Admin';

  isDarkMode = false;

  constructor(private renderer: Renderer2, private router: Router) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  logout() {
    // Add your logout logic here (e.g., clear tokens, redirect)
    localStorage.removeItem('auth_token');
    this.router.navigate(['/']);
  }
}
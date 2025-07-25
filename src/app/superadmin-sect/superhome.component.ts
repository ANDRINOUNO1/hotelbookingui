import { Component, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
    private el: ElementRef
  ) {}

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      this.router.navigate(['/']);
    }
  }

  toggleAccountsDropdown() {
    this.showAccountsDropdown = !this.showAccountsDropdown;
  }
} 
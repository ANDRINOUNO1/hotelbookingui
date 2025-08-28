import { Component, Renderer2, Inject, PLATFORM_ID, OnInit, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-frontdesk',
  imports: [CommonModule, RouterModule],
  templateUrl: './frontdesk.component.html',
  styleUrl: './frontdesk.component.scss'
})
export class FrontdeskComponent {
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private el: ElementRef,
    private titleService: Title
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle('BC Flats - Frontdesk');
  }
  logout(){
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      this.titleService.setTitle('BC Flats');
    }
  }
}

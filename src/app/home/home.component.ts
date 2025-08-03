import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
Swiper.use([Navigation, Autoplay]);
import flatpickr from 'flatpickr';
import { ReservationComponent } from '../reservation/reservation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  title = 'hotel-reservation-app';
  isDarkMode = false;

  rooms = [
    {
      name: 'Classic Room',
      description: 'A cozy room with all the essentials for a comfortable stay.',
      image: 'assets/images/gallery-img-1.jpg',
      price: 80,
      brand: 'Classic',
      tags: ['Cozy', 'Affordable', 'Single Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/pic-1.png',
        'assets/images/pic-2.png',
        'assets/images/pic-3.png',
        'assets/images/pic-4.png'
      ]
    },
    {
      name: 'Deluxe Room',
      description: 'Spacious room with a beautiful view and modern amenities.',
      image: 'assets/images/gallery-img-2.webp',
      price: 120,
      brand: 'Deluxe',
      tags: ['Spacious', 'View', 'Double Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/pic-5.png',
        'assets/images/pic-6.png',
        'assets/images/about-img-1.jpg',
        'assets/images/about-img-2.jpg'
      ]
    },
    {
      name: 'Prestige Room',
      description: 'Experience luxury in our premium suite with exclusive services.',
      image: 'assets/images/gallery-img-3.webp',
      price: 200,
      brand: 'Luxury',
      tags: ['Luxury', 'Suite', 'King Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/about-img-3.jpg',
        'assets/images/home-img-1.jpg',
        'assets/images/home-img-2.jpg',
        'assets/images/home-img-3.jpg'
      ]
    },
    {
      name: 'Luxury Suite',
      description: 'Experience luxury in our premium suite with exclusive services.',
      image: 'assets/images/gallery-img-3.webp',
      price: 200,
      brand: 'Luxury',
      tags: ['Luxury', 'Suite', 'King Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/about-img-3.jpg',
        'assets/images/home-img-1.jpg',
        'assets/images/home-img-2.jpg',
        'assets/images/home-img-3.jpg'
      ]
    }
  ];

  activeRoom = 0;

  nextRoom() {
    this.activeRoom = (this.activeRoom + 1) % this.rooms.length;
  }
  prevRoom() {
    this.activeRoom = (this.activeRoom - 1 + this.rooms.length) % this.rooms.length;
  }
  getCardClass(i: number): string {
    if (i === this.activeRoom) return 'z-20 scale-100 opacity-100';
    if (i === (this.activeRoom + 1) % this.rooms.length) return 'z-10 translate-x-[40%] scale-95 opacity-60';
    if (i === (this.activeRoom - 1 + this.rooms.length) % this.rooms.length) return 'z-10 -translate-x-[40%] scale-95 opacity-60';
    return 'scale-90 opacity-0 pointer-events-none';
  }

  @ViewChild('navbar') navbar!: ElementRef;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    private router: Router
  ) {}

  toggleMenu() {
    this.navbar.nativeElement.classList.toggle('active');
  }

  toggleMobileMenu() {
    const nav = document.querySelector('.header-bar nav');
    if (nav) {
      nav.classList.toggle('mobile-open');
    }
  }

  ngOnInit() {
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
      }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)){
      // Navbar toggle for mobile (already handled by toggleMenu)
      window.onscroll = () => {
        this.navbar?.nativeElement.classList.remove('active');
      };

      // FAQ toggle
      document.querySelectorAll('.contact .row .faq .box h3').forEach(faqBox => {
        faqBox.addEventListener('click', () => {
          faqBox.parentElement?.classList.toggle('active');
        });
      });

      // Flatpickr initialization
      const checkin = document.querySelector('#checkin');
      if (checkin) {
        flatpickr(checkin as HTMLInputElement, {
          position: "below"
        });
      }

      // Swiper for home slider
      setTimeout(() => {
        const homeSlider = document.querySelector('.home-slider');
        if (homeSlider && homeSlider.querySelectorAll('.swiper-slide').length > 1) {
          new Swiper('.home-slider', {
            loop: true,
            grabCursor: true,
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            autoplay: {
              delay: 2500,
              disableOnInteraction: false
            },
            effect: 'slide',
            slidesPerView: 1,
            spaceBetween: 30
          });
        }
      }, 100); // Slightly longer delay to ensure DOM is ready

      // Swiper for gallery slider
      if (document.querySelector('.gallery-slider')) {
        new Swiper('.gallery-slider', {
          loop: true,
          effect: "coverflow",
          slidesPerView: "auto",
          centeredSlides: true,
          grabCursor: true,
          coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: true,
          },
          pagination: {
            el: ".swiper-pagination",
          },
        });
      }

      // Swiper for reviews slider
      if (document.querySelector('.reviews-slider')) {
        new Swiper('.reviews-slider', {
          loop: true,
          slidesPerView: "auto",
          grabCursor: true,
          spaceBetween: 30,
          pagination: {
            el: ".swiper-pagination",
          },
          breakpoints: {
            768: {
              slidesPerView: 1,
            },
            991: {
              slidesPerView: 2,
            },
          },
        });
      }
    }
  }
}
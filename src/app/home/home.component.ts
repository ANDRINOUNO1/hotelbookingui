import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper/bundle';
import flatpickr from 'flatpickr';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, ReservationFormComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  title = 'hotel-reservation-app';

  @ViewChild('navbar') navbar!: ElementRef;

  toggleMenu() {
    this.navbar.nativeElement.classList.toggle('active');
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
        if (document.querySelector('.home-slider')) {
          new Swiper('.home-slider', {
            loop: true,
            grabCursor: true,
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            autoplay: {
              delay: 3500,
              disableOnInteraction: false
            },
            effect: 'slide',
            slidesPerView: 1,
            spaceBetween: 30
          });
        }
      }, 0);

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
import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, Renderer2, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
Swiper.use([Navigation, Autoplay]);
import flatpickr from 'flatpickr';
import { ReservationComponent } from '../reservation/reservation.component';
import { ContactMessageService } from '../_services/contact-message.service';
import { ContentService, ContentItem } from '../_services/content.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {
  title = 'hotel-reservation-app';
  isDarkMode = false;

  rooms = [
    {
      name: 'Classic Room',
      description: 'A cozy room with all the essentials for a comfortable stay.',
      image: 'assets/images/Standard_Room1.jpg',
      price: 80,
      brand: 'Classic',
      tags: ['Cozy', 'Affordable', 'Single Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/Pic_1.jpg',
        'assets/images/Pic_2.jpg',
        'assets/images/Pic_3.jpg',
        'assets/images/Pic_4.jpg'
      ]
    },
    {
      name: 'Deluxe Room',
      description: 'Spacious room with a beautiful view and modern amenities.',
      image: 'assets/images/Deluxe_rooms1.jpg',
      price: 120,
      brand: 'Deluxe',
      tags: ['Spacious', 'View', 'Double Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/Deluxe_tv.jpg',
        'assets/images/Deluxe_view.jpg',
        'assets/images/Deluxe_dressing.jpg',
        'assets/images/Deluxe_Comfort.jpg'
      ]
    },
    {
      name: 'Prestige Room',
      description: 'Experience luxury in our premium suite with exclusive services.',
      image: 'assets/images/prestige_rooms.jpg',
      price: 200,
      brand: 'Luxury',
      tags: ['Luxury', 'Suite', 'King Bed'],
      link: '#',
      seasonalImages: [
        'assets/images/view_room.jpg',
        'assets/images/Prestige_Room.png',
        'assets/images/Prestige_tv.png',
        'assets/images/Prestige_Comfort.jpg'
      ]
    },
    {
      name: 'Luxury Suite',
      description: 'Experience luxury in our premium suite with exclusive services.',
      image: 'assets/images/Luxury_Rooms1.jpg',
      price: 200,
      brand: 'Luxury',
      tags: ['Luxury', 'Suite', 'King Bed'],  
      link: '#',
      seasonalImages: [
        'assets/images/tv_luxury.jpg',
        'assets/images/bath_luxury.png',
        'assets/images/balcony_luxury.png',
        'assets/images/pool_luxury.png'
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

  // Contact Form Properties
  contactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    nameError: '',
    emailError: '',
    phoneError: '',
    messageError: ''
  };

  isSubmitting = false;


  // Content management properties
  content: any = {};
  logoUrl: string = 'assets/images/bcflats.png';
  
  // Dynamic header content
  headerContent = {
    companyName: 'BC Flats',
    logoText: 'BC Flats',
    title: 'BC Flats',
    navigation: [
      { label: 'Home', href: '#home', isExternal: false },
      { label: 'Rooms', href: '#rooms', isExternal: false },
      { label: 'About', href: '#about', isExternal: false },
      { label: 'Services', href: '#services', isExternal: false },
      { label: 'Contact', href: '#contact', isExternal: false }
    ],
    ctaButton: {
      text: 'Book Now',
      href: '/reserve',
      isExternal: false
    },
    loginButton: {
      text: 'Login',
      href: '/login',
      isExternal: false
    },
    styles: {
      backgroundColor: '#0b0b31',
      textColor: '#e5c07b',
      accentColor: '#b4884d',
      fontFamily: 'Montserrat, sans-serif'
    }
  };

  // Dynamic footer content
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

  // About section content
  aboutContent = {
    staffTitle: 'best staff',
    staffDescription: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
    foodsTitle: 'best foods',
    foodsDescription: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
    poolTitle: 'swimming pool',
    poolDescription: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.'
  };

  heroImages: string[] = [
    'assets/images/Pool_home.jpg',
    'assets/images/Beach_view.jpg',
    'assets/images/Front_desk.jpg'
  ];
  aboutImages: { [key: string]: string } = {
    staff: 'assets/images/Staff.jpg',
    foods: 'assets/images/Foods.jpg',
    pool: 'assets/images/Pool.jpg'
  };
  // Add services content properties
  servicesContent: { [key: string]: any } = {};
  contactContent: { [key: string]: any } = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private contactMessageService: ContactMessageService,
    private contentService: ContentService
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

  onHeaderNavClick(event: Event, href: string | null | undefined): void {
    if (!href) return;
    if (href.startsWith('#')) {
      event.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  ngOnInit() {
    this.loadContent();
  }

  async loadContent() {
    try {
      console.log('Loading content from CMS...');
      this.content = await this.contentService.getAllContent().toPromise();
      console.log('Content loaded:', this.content);
      
      // Load header content
      await this.loadHeaderContent();
      
      // Load footer content
      await this.loadFooterContent();
      
      // Load about content
      await this.loadAboutContent();
      
      // Load logo
      try {
      const logoContent = await this.contentService.getContent('header', 'main-logo').toPromise();
      if (logoContent) {
        this.logoUrl = logoContent.optimizedUrl || logoContent.value || this.logoUrl;
          console.log('Logo loaded:', this.logoUrl);
        }
      } catch (logoError) {
        console.warn('Failed to load logo:', logoError);
      }
      
      // Load hero images
      const heroContent = this.content['hero'] || [];
      if (heroContent.length > 0) {
        this.heroImages = heroContent
          .filter((item: ContentItem) => item.type === 'image' || item.type === 'gallery')
          .map((item: ContentItem) => item.optimizedUrl || item.value)
          .filter(Boolean);
        console.log('Hero images loaded:', this.heroImages);
      }
      
      // Load about section images
      const aboutContent = this.content['about'] || [];
      aboutContent.forEach((item: ContentItem) => {
        if (item.type === 'image') {
          const key = item.key.replace('-image', '');
          const imageUrl = item.optimizedUrl || item.value;
          if (imageUrl) {
            this.aboutImages[key] = imageUrl;
          }
        }
      });
      console.log('About images loaded:', this.aboutImages);

      // Load rooms from CMS
      await this.loadRoomsFromContent();

      // Load services content
      const servicesContent = this.content['services'] || [];
      servicesContent.forEach((item: ContentItem) => {
        if (item.type === 'text') {
          this.servicesContent[item.key] = item.value;
        }
      });
      console.log('Services content loaded:', this.servicesContent);

      // Load contact content
      const contactContent = this.content['contact'] || [];
      contactContent.forEach((item: ContentItem) => {
        if (item.type === 'text') {
          this.contactContent[item.key] = item.value;
        }
      });
      console.log('Contact content loaded:', this.contactContent);
      
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to default images if content loading fails
    }
  }

  private async loadRoomsFromContent(): Promise<void> {
    try {
      const roomItems = await this.contentService.getSectionContent('rooms').toPromise();
      const map: { [key: string]: string } = {};
      (roomItems || []).forEach((it: ContentItem) => {
        map[it.key] = (it as any).optimizedUrl || it.value || '';
      });

      const get = (key: string, fallback: string) => map[key] || fallback;

      // Classic
      if (this.rooms[0]) {
        this.rooms[0].image = get('classic-room-main-image', this.rooms[0].image);
        this.rooms[0].seasonalImages = [
          get('classic-room-seasonal-image-1', this.rooms[0].seasonalImages[0]),
          get('classic-room-seasonal-image-2', this.rooms[0].seasonalImages[1]),
          get('classic-room-seasonal-image-3', this.rooms[0].seasonalImages[2]),
          get('classic-room-seasonal-image-4', this.rooms[0].seasonalImages[3])
        ];
      }

      // Deluxe
      if (this.rooms[1]) {
        this.rooms[1].image = get('deluxe-room-main-image', this.rooms[1].image);
        this.rooms[1].seasonalImages = [
          get('deluxe-room-seasonal-image-1', this.rooms[1].seasonalImages[0]),
          get('deluxe-room-seasonal-image-2', this.rooms[1].seasonalImages[1]),
          get('deluxe-room-seasonal-image-3', this.rooms[1].seasonalImages[2]),
          get('deluxe-room-seasonal-image-4', this.rooms[1].seasonalImages[3])
        ];
      }

      // Prestige
      if (this.rooms[2]) {
        this.rooms[2].image = get('prestige-room-main-image', this.rooms[2].image);
        this.rooms[2].seasonalImages = [
          get('prestige-room-seasonal-image-1', this.rooms[2].seasonalImages[0]),
          get('prestige-room-seasonal-image-2', this.rooms[2].seasonalImages[1]),
          get('prestige-room-seasonal-image-3', this.rooms[2].seasonalImages[2]),
          get('prestige-room-seasonal-image-4', this.rooms[2].seasonalImages[3])
        ];
      }

      // Luxury Suite
      if (this.rooms[3]) {
        this.rooms[3].image = get('luxury-suite-main-image', this.rooms[3].image);
        this.rooms[3].seasonalImages = [
          get('luxury-suite-seasonal-image-1', this.rooms[3].seasonalImages[0]),
          get('luxury-suite-seasonal-image-2', this.rooms[3].seasonalImages[1]),
          get('luxury-suite-seasonal-image-3', this.rooms[3].seasonalImages[2]),
          get('luxury-suite-seasonal-image-4', this.rooms[3].seasonalImages[3])
        ];
      }
    } catch (e) {
      console.error('Failed to load rooms from CMS:', e);
    }
  }

  getHeroTitle(index: number): string {
    const titles = ['luxurious rooms', 'foods and drinks', 'luxurious halls'];
    return titles[index] || 'Welcome';
  }

  getContentText(section: string, key: string): string {
    const sectionContent = this.content[section] || [];
    const contentItem = sectionContent.find((item: ContentItem) => item.key === key && item.type === 'text');
    return contentItem ? contentItem.value : '';
  }

  // Add helper methods for services and contact content
  getServiceContent(key: string): string {
    return this.servicesContent[key] || this.getDefaultServiceContent(key);
  }

  getContactContent(key: string): string {
    return this.contactContent[key] || this.getDefaultContactContent(key);
  }

  private getDefaultServiceContent(key: string): string {
    const defaults: { [key: string]: string } = {
      'food-drinks-title': 'food & drinks',
      'food-drinks-description': 'Enjoy delicious meals and refreshing drinks crafted by our expert chefs and bartenders.',
      'outdoor-dining-title': 'outdoor dining',
      'outdoor-dining-description': 'Dine under the stars with a gentle breeze and the soothing ambiance of nature.',
      'beach-view-title': 'beach view',
      'beach-view-description': 'Wake up to breathtaking views of the ocean right from your room or private balcony.',
      'decorations-title': 'decorations',
      'decorations-description': 'Experience a space thoughtfully decorated to provide elegance, warmth, and comfort.',
      'swimming-pool-title': 'swimming pool',
      'swimming-pool-description': 'Cool off in our luxurious pool, perfect for a relaxing dip or fun with family and friends.',
      'resort-beach-title': 'resort beach',
      'resort-beach-description': 'Step into paradise on our private beach, where golden sands meet turquoise waters.'
    };
    return defaults[key] || '';
  }

  private getDefaultContactContent(key: string): string {
    const defaults: { [key: string]: string } = {
      'contact-title': 'Contact Us',
      'contact-subtitle': 'Get in touch with us',
      'contact-address': '6014 Sacris Rd, Mandaue, Central Visayas, Philippines',
      'contact-phone': '+123-456-7890',
      'contact-email': 'BCflats.edu.ph'
    };
    return defaults[key] || '';
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

  // Contact Form Methods
  validatePhone(event: any) {
    const phone = event.target.value;
    const phoneRegex = /^09\d{9}$/;
    
    if (phone && !phoneRegex.test(phone)) {
      this.contactFormData.phoneError = 'Phone number must start with 09 and be 11 digits';
    } else {
      this.contactFormData.phoneError = '';
    }
  }

  validateForm(): boolean {
    let isValid = true;
    
    // Reset errors
    this.contactFormData.nameError = '';
    this.contactFormData.emailError = '';
    this.contactFormData.phoneError = '';
    this.contactFormData.messageError = '';

    // Validate name
    if (!this.contactFormData.name.trim()) {
      this.contactFormData.nameError = 'Name is required';
      isValid = false;
    } else if (this.contactFormData.name.trim().length < 2) {
      this.contactFormData.nameError = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.contactFormData.email.trim()) {
      this.contactFormData.emailError = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(this.contactFormData.email)) {
      this.contactFormData.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate phone
    const phoneRegex = /^09\d{9}$/;
    if (!this.contactFormData.phone.trim()) {
      this.contactFormData.phoneError = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(this.contactFormData.phone)) {
      this.contactFormData.phoneError = 'Phone number must start with 09 and be 11 digits';
      isValid = false;
    }

    // Validate subject
    if (!this.contactFormData.subject) {
      isValid = false;
    }

    // Validate message
    if (!this.contactFormData.message.trim()) {
      this.contactFormData.messageError = 'Message is required';
      isValid = false;
    } else if (this.contactFormData.message.trim().length < 10) {
      this.contactFormData.messageError = 'Message must be at least 10 characters';
      isValid = false;
    }

    return isValid;
  }

  submitContactForm() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const messageData = {
      name: this.contactFormData.name.trim(),
      email: this.contactFormData.email.trim(),
      phone: this.contactFormData.phone.trim(),
      subject: this.contactFormData.subject,
      message: this.contactFormData.message.trim()
    };

    this.contactMessageService.submitMessage(messageData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Thank you for your message! We will get back to you within 24 hours.');
          this.resetContactForm();
        } else {
          alert('Sorry, there was an error sending your message. Please try again.');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting contact message:', error);
        alert('Sorry, there was an error sending your message. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  resetContactForm() {
    this.contactFormData = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      nameError: '',
      emailError: '',
      phoneError: '',
      messageError: ''
    };
  }

  async loadHeaderContent(): Promise<void> {
    try {
      const headerItems = await this.contentService.getSectionContent('header').toPromise();
      
      if (headerItems && Array.isArray(headerItems)) {
        headerItems.forEach((item: ContentItem) => {
          switch (item.key) {
            case 'company_name':
              this.headerContent.companyName = item.value || 'BC Flats';
              break;
            case 'logo_text':
              this.headerContent.logoText = item.value || this.headerContent.companyName || 'BC Flats';
              break;
            case 'title':
              this.headerContent.title = item.value || 'BC Flats';
              break;
            case 'navigation':
              try {
                this.headerContent.navigation = JSON.parse(item.value || '[]');
              } catch (e) {
                console.warn('Invalid navigation JSON:', item.value);
              }
              break;
            case 'cta_button':
              try {
                this.headerContent.ctaButton = JSON.parse(item.value || '{}');
              } catch (e) {
                console.warn('Invalid CTA button JSON:', item.value);
              }
              break;
            case 'login_button':
              try {
                this.headerContent.loginButton = JSON.parse(item.value || '{}');
              } catch (e) {
                console.warn('Invalid login button JSON:', item.value);
              }
              break;
            case 'styles':
              try {
                this.headerContent.styles = { ...this.headerContent.styles, ...JSON.parse(item.value || '{}') };
              } catch (e) {
                console.warn('Invalid styles JSON:', item.value);
              }
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading header content:', error);
    }
  }

  getHeaderStyles(): string {
    const styles = this.headerContent.styles;
    return `
      background-color: ${styles.backgroundColor};
      color: ${styles.textColor};
      font-family: ${styles.fontFamily};
    `;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getNextYear(): number {
    return new Date().getFullYear() + 1;
  }

  async loadFooterContent(): Promise<void> {
    try {
      const footerItems = await this.contentService.getSectionContent('footer').toPromise();
      
      if (footerItems && Array.isArray(footerItems)) {
        footerItems.forEach((item: ContentItem) => {
          switch (item.key) {
            case 'company_name':
              this.footerContent.companyName = item.value || 'BC Flats';
              break;
            case 'phone1':
              this.footerContent.phone1 = item.value || '+123-456-7890';
              break;
            case 'phone2':
              this.footerContent.phone2 = item.value || '+696-969-69696';
              break;
            case 'email':
              this.footerContent.email = item.value || 'BCflats.edu.ph';
              break;
            case 'address':
              this.footerContent.address = item.value || 'A.S Fortuna - 400104';
              break;
            case 'social_links':
              try {
                this.footerContent.social = JSON.parse(item.value || '{}');
              } catch (e) {
                console.warn('Invalid social links JSON:', item.value);
              }
              break;
            case 'copyright_text':
              this.footerContent.copyrightText = item.value || '';
              break;
            case 'show_dynamic_year':
              this.footerContent.showDynamicYear = item.value === 'true';
              break;
            case 'styles':
              try {
                this.footerContent.styles = { ...this.footerContent.styles, ...JSON.parse(item.value || '{}') };
              } catch (e) {
                console.warn('Invalid footer styles JSON:', item.value);
              }
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading footer content:', error);
    }
  }

  getFooterStyles(): string {
    const styles = this.footerContent.styles;
    return `
      background-color: ${styles.backgroundColor};
      color: ${styles.textColor};
    `;
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

  async loadAboutContent(): Promise<void> {
    try {
      const aboutItems = await this.contentService.getSectionContent('about').toPromise();
      
      if (aboutItems && Array.isArray(aboutItems)) {
        aboutItems.forEach((item: ContentItem) => {
          switch (item.key) {
            case 'staff-title':
              this.aboutContent.staffTitle = item.value || 'best staff';
              break;
            case 'staff-description':
              this.aboutContent.staffDescription = item.value || 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.';
              break;
            case 'foods-title':
              this.aboutContent.foodsTitle = item.value || 'best foods';
              break;
            case 'foods-description':
              this.aboutContent.foodsDescription = item.value || 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.';
              break;
            case 'pool-title':
              this.aboutContent.poolTitle = item.value || 'swimming pool';
              break;
            case 'pool-description':
              this.aboutContent.poolDescription = item.value || 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.';
              break;
            case 'staff-image':
              this.aboutImages['staff'] = item.optimizedUrl || item.value || 'assets/images/about-img-1.jpg';
              break;
            case 'foods-image':
              this.aboutImages['foods'] = item.optimizedUrl || item.value || 'assets/images/about-img-2.jpg';
              break;
            case 'pool-image':
              this.aboutImages['pool'] = item.optimizedUrl || item.value || 'assets/images/about-img-3.jpg';
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService, ContentItem, GalleryImage } from '../../_services/content.service';
import { AlertService } from '../../_services/alert.service';

interface AboutImages {
  [key: string]: string;
}

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ContentManagementComponent implements OnInit {
  content: any = {};
  loading = false;
  uploading = false;
  
  // Form data
  selectedFile: File | null = null;
  selectedLogo: File | null = null;
  selectedGalleryFiles: File[] = [];
  altText: string = '';
  // Preview URLs for selected files (used in template)
  selectedPreviewUrl: string | null = null;
  selectedLogoPreviewUrl: string | null = null;
  
  // Backup system
  private contentBackup: any = null;
  public hasBackup: boolean = false;
  
  // Text content
  textContent: { [key: string]: string } = {};
  
  // Service Icons
  serviceIcons = [
    {
      name: 'Food & Drinks',
      description: 'Icon for food and drinks service',
      currentUrl: 'assets/images/icon-1.png',
      key: 'icon-1'
    },
    {
      name: 'Outdoor Dining',
      description: 'Icon for outdoor dining service',
      currentUrl: 'assets/images/icon-2.png',
      key: 'icon-2'
    },
    {
      name: 'Beach View',
      description: 'Icon for beach view service',
      currentUrl: 'assets/images/icon-3.png',
      key: 'icon-3'
    },
    {
      name: 'Decorations',
      description: 'Icon for decorations service',
      currentUrl: 'assets/images/icon-4.png',
      key: 'icon-4'
    },
    {
      name: 'Swimming Pool',
      description: 'Icon for swimming pool service',
      currentUrl: 'assets/images/icon-5.png',
      key: 'icon-5'
    },
    {
      name: 'Resort Beach',
      description: 'Icon for resort beach service',
      currentUrl: 'assets/images/icon-6.png',
      key: 'icon-6'
    }
  ];

  // Room Images
  roomImages = [
    {
      name: 'Classic Room',
      mainImage: 'assets/images/Standard_Room1.jpg',
      seasonalImages: [
        'assets/images/Pic_1.jpg',
        'assets/images/Pic_2.jpg',
        'assets/images/Pic_3.jpg',
        'assets/images/Pic_4.jpg'
      ]
    },
    {
      name: 'Deluxe Room',
      mainImage: 'assets/images/Deluxe_rooms1.jpg',
      seasonalImages: [
        'assets/images/Deluxe_tv.jpg',
        'assets/images/Deluxe_view.jpg',
        'assets/images/Deluxe_dressing.jpg',
        'assets/images/Deluxe_Comfort.jpg'
      ]
    },
    {
      name: 'Prestige Room',
      mainImage: 'assets/images/prestige_rooms.jpg',
      seasonalImages: [
        'assets/images/view_room.jpg',
        'assets/images/Prestige_Room.png',
        'assets/images/Prestige_tv.png',
        'assets/images/Prestige_Comfort.jpg'
      ]
    },
    {
      name: 'Luxury Suite',
      mainImage: 'assets/images/Luxury_Rooms1.jpg',
      seasonalImages: [
        'assets/images/tv_luxury.jpg',
        'assets/images/bath_luxury.png',
        'assets/images/balcony_luxury.png',
        'assets/images/pool_luxury.png'
      ]
    }
  ];
  
  // Tab management
  private activeTabs: { [key: string]: string } = {};
  private readonly TAB_STORAGE_KEY = 'cm_active_tabs_v1';
  
  // Sections
  sections = [
    { id: 'hero', name: 'Hero Section', description: 'Main banner images and text' },
    { id: 'about', name: 'About Section', description: 'About us content and images' },
    { id: 'services', name: 'Services Section', description: 'Services and amenities' },
    { id: 'rooms', name: 'Rooms Section', description: 'Room showcase images' },
    { id: 'contact', name: 'Contact Section', description: 'Contact information' }
  ];

  // Store original content values
  private originalContent: { [key: string]: string } = {};

  // Header content management
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

  // Footer content management
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

  savingHeader = false;
  savingFooter = false;
  savingHome = false;

  // Footer year editor fields
  footerStartYear: number = new Date().getFullYear();
  footerEndYear?: number;

  // Home content management
  homeContent = {
    heroImages: [
      'assets/images/Pool_home.jpg',
      'assets/images/Beach_view.jpg',
      'assets/images/Front_desk.jpg'
    ],
    aboutContent: {
      staffTitle: 'best staff',
      staffDescription: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
      foodsTitle: 'best foods',
      foodsDescription: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
      poolTitle: 'swimming pool',
      poolDescription: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.'
    },
    aboutImages: {
      staff: 'assets/images/about-img-1.jpg',
      foods: 'assets/images/about-img-2.jpg',
      pool: 'assets/images/about-img-3.jpg'
    }
  };

  selectedHeroImages: File[] = [];
  selectedAboutImage: File | null = null;
  selectedAboutImageType: string = '';

  // Text field definitions for each section
  private textFields = {
    hero: [
      { key: 'title', label: 'Hero Title', type: 'input', placeholder: 'Enter hero title' },
      { key: 'subtitle', label: 'Hero Subtitle', type: 'input', placeholder: 'Enter hero subtitle' }
    ],
    about: [
      { key: 'staff-title', label: 'Staff Title', type: 'input', placeholder: 'Enter staff section title' },
      { key: 'staff-description', label: 'Staff Description', type: 'textarea', placeholder: 'Enter staff description' },
      { key: 'foods-title', label: 'Foods Title', type: 'input', placeholder: 'Enter foods section title' },
      { key: 'foods-description', label: 'Foods Description', type: 'textarea', placeholder: 'Enter foods description' },
      { key: 'pool-title', label: 'Pool Title', type: 'input', placeholder: 'Enter pool section title' },
      { key: 'pool-description', label: 'Pool Description', type: 'textarea', placeholder: 'Enter pool description' }
    ],
    services: [
      { key: 'food-drinks-title', label: 'Food & Drinks Title', type: 'input', placeholder: 'Enter food & drinks title' },
      { key: 'food-drinks-description', label: 'Food & Drinks Description', type: 'textarea', placeholder: 'Enter food & drinks description' },
      { key: 'outdoor-dining-title', label: 'Outdoor Dining Title', type: 'input', placeholder: 'Enter outdoor dining title' },
      { key: 'outdoor-dining-description', label: 'Outdoor Dining Description', type: 'textarea', placeholder: 'Enter outdoor dining description' },
      { key: 'beach-view-title', label: 'Beach View Title', type: 'input', placeholder: 'Enter beach view title' },
      { key: 'beach-view-description', label: 'Beach View Description', type: 'textarea', placeholder: 'Enter beach view description' },
      { key: 'decorations-title', label: 'Decorations Title', type: 'input', placeholder: 'Enter decorations title' },
      { key: 'decorations-description', label: 'Decorations Description', type: 'textarea', placeholder: 'Enter decorations description' },
      { key: 'swimming-pool-title', label: 'Swimming Pool Title', type: 'input', placeholder: 'Enter swimming pool title' },
      { key: 'swimming-pool-description', label: 'Swimming Pool Description', type: 'textarea', placeholder: 'Enter swimming pool description' },
      { key: 'resort-beach-title', label: 'Resort Beach Title', type: 'input', placeholder: 'Enter resort beach title' },
      { key: 'resort-beach-description', label: 'Resort Beach Description', type: 'textarea', placeholder: 'Enter resort beach description' }
    ],
    contact: [
      { key: 'contact-title', label: 'Contact Title', type: 'input', placeholder: 'Enter contact section title' },
      { key: 'contact-subtitle', label: 'Contact Subtitle', type: 'input', placeholder: 'Enter contact section subtitle' },
      { key: 'contact-address', label: 'Contact Address', type: 'input', placeholder: 'Enter contact address' },
      { key: 'contact-phone', label: 'Contact Phone', type: 'input', placeholder: 'Enter contact phone number' },
      { key: 'contact-email', label: 'Contact Email', type: 'input', placeholder: 'Enter contact email' }
    ]
  };


  // Global reset to original content - this will reset the home page to show original content
  async globalReset(): Promise<void> {
    const confirmed = confirm(
      '⚠️ WARNING: This will reset ALL content to its original state!\n\n' +
      'This will restore the home page to show:\n' +
      '• Original BC logo (assets/images/bcflats.png)\n' +
      '• Original hero slider images (Pool_home.jpg, Beach_view.jpg, Front_desk.jpg)\n' +
      '• Original about section images (Staff.jpg, Foods.jpg, Pool.jpg)\n' +
      '• Original text content (luxurious rooms, foods and drinks, luxurious halls)\n' +
      '• Original services content (food & drinks, outdoor dining, beach view, etc.)\n' +
      '• Original rooms content (Classic, Deluxe, Prestige, Luxury Suite)\n' +
      '• Original contact and FAQ content\n' +
      '• All other content to default values\n\n' +
      'This action cannot be undone. Are you sure you want to continue?'
    );

    if (confirmed) {
      this.loading = true;
      this.contentService.resetAll().subscribe({
        next: (data) => {
          this.content = data || {};
          this.initializeTextContent();
          this.createBackup();
          this.alertService.success('All content has been reset to original defaults and saved. Visit the home page to see the original logo, slider images, about images, services text, rooms, and FAQ restored.');
          this.loading = false;
        },
        error: (err) => {
          console.error('Reset error:', err);
          this.alertService.error('Failed to reset content. Please ensure you are logged in as admin and the backend is running.');
          this.loading = false;
        }
      });
      return;
      try {
        this.loading = true;
        
        // Reset to original default content with actual home component content
        this.content = {
          header: [
            {
              id: 1,
              section: 'header',
              type: 'logo',
              key: 'main-logo',
              value: 'assets/images/bcflats.png',
              publicId: null,
              altText: 'BC Flats Logo',
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          hero: [
            {
              id: 2,
              section: 'hero',
              type: 'text',
              key: 'title',
              value: 'luxurious rooms',
              publicId: null,
              altText: null,
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 3,
              section: 'hero',
              type: 'text',
              key: 'description',
              value: 'foods and drinks',
              publicId: null,
              altText: null,
              order: 2,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 4,
              section: 'hero',
              type: 'text',
              key: 'subtitle',
              value: 'luxurious halls',
              publicId: null,
              altText: null,
              order: 3,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 5,
              section: 'hero',
              type: 'image',
              key: 'hero-image-1',
              value: 'assets/images/Pool_home.jpg',
              publicId: null,
              altText: 'Pool Home Image',
              order: 4,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 6,
              section: 'hero',
              type: 'image',
              key: 'hero-image-2',
              value: 'assets/images/Beach_view.jpg',
              publicId: null,
              altText: 'Beach View Image',
              order: 5,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 7,
              section: 'hero',
              type: 'image',
              key: 'hero-image-3',
              value: 'assets/images/Front_desk.jpg',
              publicId: null,
              altText: 'Front Desk Image',
              order: 6,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          about: [
            {
              id: 8,
              section: 'about',
              type: 'text',
              key: 'staff-title',
              value: 'best staff',
              publicId: null,
              altText: null,
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 9,
              section: 'about',
              type: 'text',
              key: 'staff-description',
              value: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
              publicId: null,
              altText: null,
              order: 2,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 10,
              section: 'about',
              type: 'image',
              key: 'staff-image',
              value: 'assets/images/Staff.jpg',
              publicId: null,
              altText: 'Best Staff',
              order: 3,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 11,
              section: 'about',
              type: 'text',
              key: 'foods-title',
              value: 'best foods',
              publicId: null,
              altText: null,
              order: 4,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 12,
              section: 'about',
              type: 'text',
              key: 'foods-description',
              value: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
              publicId: null,
              altText: null,
              order: 5,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 13,
              section: 'about',
              type: 'image',
              key: 'foods-image',
              value: 'assets/images/Foods.jpg',
              publicId: null,
              altText: 'Best Foods',
              order: 6,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 14,
              section: 'about',
              type: 'text',
              key: 'pool-title',
              value: 'swimming pool',
              publicId: null,
              altText: null,
              order: 7,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 15,
              section: 'about',
              type: 'text',
              key: 'pool-description',
              value: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.',
              publicId: null,
              altText: null,
              order: 8,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 16,
              section: 'about',
              type: 'image',
              key: 'pool-image',
              value: 'assets/images/Pool.jpg',
              publicId: null,
              altText: 'Swimming Pool',
              order: 9,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          services: [
            {
              id: 17,
              section: 'services',
              type: 'text',
              key: 'food-drinks-title',
              value: 'food & drinks',
              publicId: null,
              altText: null,
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 18,
              section: 'services',
              type: 'text',
              key: 'food-drinks-description',
              value: 'Enjoy delicious meals and refreshing drinks crafted by our expert chefs and bartenders.',
              publicId: null,
              altText: null,
              order: 2,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 19,
              section: 'services',
              type: 'text',
              key: 'outdoor-dining-title',
              value: 'outdoor dining',
              publicId: null,
              altText: null,
              order: 3,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 20,
              section: 'services',
              type: 'text',
              key: 'outdoor-dining-description',
              value: 'Dine under the stars with a gentle breeze and the soothing ambiance of nature.',
              publicId: null,
              altText: null,
              order: 4,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 21,
              section: 'services',
              type: 'text',
              key: 'beach-view-title',
              value: 'beach view',
              publicId: null,
              altText: null,
              order: 5,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 22,
              section: 'services',
              type: 'text',
              key: 'beach-view-description',
              value: 'Wake up to breathtaking views of the ocean right from your room or private balcony.',
              publicId: null,
              altText: null,
              order: 6,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 23,
              section: 'services',
              type: 'text',
              key: 'decorations-title',
              value: 'decorations',
              publicId: null,
              altText: null,
              order: 7,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 24,
              section: 'services',
              type: 'text',
              key: 'decorations-description',
              value: 'Experience a space thoughtfully decorated to provide elegance, warmth, and comfort.',
              publicId: null,
              altText: null,
              order: 8,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 25,
              section: 'services',
              type: 'text',
              key: 'swimming-pool-title',
              value: 'swimming pool',
              publicId: null,
              altText: null,
              order: 9,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 26,
              section: 'services',
              type: 'text',
              key: 'swimming-pool-description',
              value: 'Cool off in our luxurious pool, perfect for a relaxing dip or fun with family and friends.',
              publicId: null,
              altText: null,
              order: 10,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 27,
              section: 'services',
              type: 'text',
              key: 'resort-beach-title',
              value: 'resort beach',
              publicId: null,
              altText: null,
              order: 11,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 28,
              section: 'services',
              type: 'text',
              key: 'resort-beach-description',
              value: 'Step into paradise on our private beach, where golden sands meet turquoise waters.',
              publicId: null,
              altText: null,
              order: 12,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          rooms: [
            {
              id: 29,
              section: 'rooms',
              type: 'text',
              key: 'classic-room-name',
              value: 'Classic Room',
              publicId: null,
              altText: null,
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 30,
              section: 'rooms',
              type: 'text',
              key: 'classic-room-description',
              value: 'A cozy room with all the essentials for a comfortable stay.',
              publicId: null,
              altText: null,
              order: 2,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 31,
              section: 'rooms',
              type: 'image',
              key: 'classic-room-image',
              value: 'assets/images/Standard_Room1.jpg',
              publicId: null,
              altText: 'Classic Room',
              order: 3,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 32,
              section: 'rooms',
              type: 'text',
              key: 'deluxe-room-name',
              value: 'Deluxe Room',
              publicId: null,
              altText: null,
              order: 4,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 33,
              section: 'rooms',
              type: 'text',
              key: 'deluxe-room-description',
              value: 'Spacious room with a beautiful view and modern amenities.',
              publicId: null,
              altText: null,
              order: 5,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 34,
              section: 'rooms',
              type: 'image',
              key: 'deluxe-room-image',
              value: 'assets/images/Deluxe_rooms1.jpg',
              publicId: null,
              altText: 'Deluxe Room',
              order: 6,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 35,
              section: 'rooms',
              type: 'text',
              key: 'prestige-room-name',
              value: 'Prestige Room',
              publicId: null,
              altText: null,
              order: 7,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 36,
              section: 'rooms',
              type: 'text',
              key: 'prestige-room-description',
              value: 'Experience luxury in our premium suite with exclusive services.',
              publicId: null,
              altText: null,
              order: 8,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 37,
              section: 'rooms',
              type: 'image',
              key: 'prestige-room-image',
              value: 'assets/images/prestige_rooms.jpg',
              publicId: null,
              altText: 'Prestige Room',
              order: 9,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 38,
              section: 'rooms',
              type: 'text',
              key: 'luxury-suite-name',
              value: 'Luxury Suite',
              publicId: null,
              altText: null,
              order: 10,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 39,
              section: 'rooms',
              type: 'text',
              key: 'luxury-suite-description',
              value: 'Experience luxury in our premium suite with exclusive services.',
              publicId: null,
              altText: null,
              order: 11,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 40,
              section: 'rooms',
              type: 'image',
              key: 'luxury-suite-image',
              value: 'assets/images/Luxury_Rooms1.jpg',
              publicId: null,
              altText: 'Luxury Suite',
              order: 12,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          contact: [
            {
              id: 41,
              section: 'contact',
              type: 'text',
              key: 'contact-title',
              value: 'send us message',
              publicId: null,
              altText: null,
              order: 1,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 42,
              section: 'contact',
              type: 'text',
              key: 'faq-title',
              value: 'frequently asked questions',
              publicId: null,
              altText: null,
              order: 2,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 43,
              section: 'contact',
              type: 'text',
              key: 'faq-cancel-question',
              value: 'how to cancel?',
              publicId: null,
              altText: null,
              order: 3,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 44,
              section: 'contact',
              type: 'text',
              key: 'faq-cancel-answer',
              value: 'You can cancel your reservation by logging into your account and selecting the booking you want to cancel, or by contacting our front desk directly via phone or email.',
              publicId: null,
              altText: null,
              order: 4,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 45,
              section: 'contact',
              type: 'text',
              key: 'faq-vacancy-question',
              value: 'is there any vacancy?',
              publicId: null,
              altText: null,
              order: 5,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 46,
              section: 'contact',
              type: 'text',
              key: 'faq-vacancy-answer',
              value: 'Availability depends on your selected dates. Please check our online booking section or call our front desk for real-time updates on available rooms.',
              publicId: null,
              altText: null,
              order: 6,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 47,
              section: 'contact',
              type: 'text',
              key: 'faq-payment-question',
              value: 'what are payment methods?',
              publicId: null,
              altText: null,
              order: 7,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 48,
              section: 'contact',
              type: 'text',
              key: 'faq-payment-answer',
              value: 'We accept major credit/debit cards, online bank transfers, GCash, and cash payments at the front desk.',
              publicId: null,
              altText: null,
              order: 8,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 49,
              section: 'contact',
              type: 'text',
              key: 'faq-coupons-question',
              value: 'how to claim coupons codes?',
              publicId: null,
              altText: null,
              order: 9,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 50,
              section: 'contact',
              type: 'text',
              key: 'faq-coupons-answer',
              value: 'Apply your valid coupon code during checkout on our website or mention it during your booking call to enjoy exclusive discounts.',
              publicId: null,
              altText: null,
              order: 10,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 51,
              section: 'contact',
              type: 'text',
              key: 'faq-age-question',
              value: 'what are the age requirements?',
              publicId: null,
              altText: null,
              order: 11,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 52,
              section: 'contact',
              type: 'text',
              key: 'faq-age-answer',
              value: 'Guests must be at least 18 years old to make a reservation. Children under 12 stay for free when sharing a room with parents or guardians.',
              publicId: null,
              altText: null,
              order: 12,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 53,
              section: 'contact',
              type: 'text',
              key: 'location-address',
              value: '6014 Sacris Rd, Mandaue, Central Visayas, Philippines',
              publicId: null,
              altText: null,
              order: 13,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 54,
              section: 'contact',
              type: 'text',
              key: 'contact-phone',
              value: '+123-456-7890',
              publicId: null,
              altText: null,
              order: 14,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 55,
              section: 'contact',
              type: 'text',
              key: 'contact-email',
              value: 'BCflats.edu.ph',
              publicId: null,
              altText: null,
              order: 15,
              isActive: true,
              metadata: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        };

        // Update text content to reflect the reset
        this.initializeTextContent();
        
        // Create new backup of the reset content
        this.createBackup();
        
        this.alertService.success('All content has been reset to original state! The home page will now show the original BC logo, hero slider images (Pool_home.jpg, Beach_view.jpg, Front_desk.jpg), staff image (Staff.jpg), foods image (Foods.jpg), pool image (Pool.jpg), all original text content, rooms information, and FAQ content.');
      } catch (error) {
        this.alertService.error('Failed to reset content');
        console.error('Reset error:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  constructor(
    private contentService: ContentService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadContent();
    this.loadHeaderContent();
    this.loadFooterContent();
    this.loadHomeContent();
    this.initializeTabs();

    
    this.content = this.content || {};
    ['hero','about','services','rooms','contact','header','footer','home'].forEach(key => {
      if (!Array.isArray((this.content as any)[key])) {
        (this.content as any)[key] = [];
      }
    });
  }

  async loadContent(): Promise<void> {
    this.loading = true;
    try {
      this.content = await this.contentService.getAdminContent().toPromise();
     
      if (!this.content || typeof this.content !== 'object') {
        this.content = {} as any;
      }
      ['header','hero','about','services','rooms','contact'].forEach(key => {
        if (!Array.isArray((this.content as any)[key])) {
          (this.content as any)[key] = [];
        }
      });
      this.initializeTextContent();

      const headerItems = Array.isArray((this.content as any)['header']) ? (this.content as any)['header'] : [];
      const hasLogo = headerItems.some((i: any) => i.type === 'logo' && i.key === 'main-logo');
      if (!hasLogo) {
        (this.content as any)['header'] = headerItems.concat([{
          id: 0,
          section: 'header',
          type: 'logo',
          key: 'main-logo',
          value: 'assets/images/bcflats.png',
          publicId: null,
          altText: 'BC Flats Logo',
          order: 1,
          isActive: true,
          optimizedUrl: 'assets/images/bcflats.png'
        }]);
      }
      
      // Create backup on first successful load if no backup exists
      if (!this.hasBackup) {
        this.createBackup();
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      if (error.message && error.message.includes('Unable to connect to the server')) {
        this.alertService.error('Backend server is not running. Please start the backend server first.');
      } else {
        this.alertService.error('Failed to load content: ' + (error.message || 'Unknown error'));
      }
      // Initialize with empty content structure to prevent further errors
      this.content = {
        hero: [
          {
            id: 1,
            section: 'hero',
            type: 'text',
            key: 'title',
            value: 'luxurious rooms',
            publicId: null,
            altText: null,
            order: 1,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            section: 'hero',
            type: 'text',
            key: 'description',
            value: 'foods and drinks',
            publicId: null,
            altText: null,
            order: 2,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            section: 'hero',
            type: 'text',
            key: 'subtitle',
            value: 'luxurious halls',
            publicId: null,
            altText: null,
            order: 3,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 4,
            section: 'hero',
            type: 'image',
            key: 'hero-image-1',
            value: 'assets/images/Pool_home.jpg',
            publicId: null,
            altText: 'Pool Home Image',
            order: 4,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 5,
            section: 'hero',
            type: 'image',
            key: 'hero-image-2',
            value: 'assets/images/Beach_view.jpg',
            publicId: null,
            altText: 'Beach View Image',
            order: 5,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 6,
            section: 'hero',
            type: 'image',
            key: 'hero-image-3',
            value: 'assets/images/Front_desk.jpg',
            publicId: null,
            altText: 'Front Desk Image',
            order: 6,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        about: [
          {
            id: 7,
            section: 'about',
            type: 'text',
            key: 'staff-title',
            value: 'best staff',
            publicId: null,
            altText: null,
            order: 1,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 8,
            section: 'about',
            type: 'text',
            key: 'staff-description',
            value: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
            publicId: null,
            altText: null,
            order: 2,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 9,
            section: 'about',
            type: 'image',
            key: 'staff-image',
            value: 'assets/images/Staff.jpg',
            publicId: null,
            altText: 'Best Staff',
            order: 3,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 10,
            section: 'about',
            type: 'text',
            key: 'foods-title',
            value: 'best foods',
            publicId: null,
            altText: null,
            order: 4,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 11,
            section: 'about',
            type: 'text',
            key: 'foods-description',
            value: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
            publicId: null,
            altText: null,
            order: 5,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 12,
            section: 'about',
            type: 'image',
            key: 'foods-image',
            value: 'assets/images/Foods.jpg',
            publicId: null,
            altText: 'Best Foods',
            order: 6,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 13,
            section: 'about',
            type: 'text',
            key: 'pool-title',
            value: 'swimming pool',
            publicId: null,
            altText: null,
            order: 7,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 14,
            section: 'about',
            type: 'text',
            key: 'pool-description',
            value: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.',
            publicId: null,
            altText: null,
            order: 8,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 15,
            section: 'about',
            type: 'image',
            key: 'pool-image',
            value: 'assets/images/Pool.jpg',
            publicId: null,
            altText: 'Swimming Pool',
            order: 9,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        services: [
          {
            id: 16,
            section: 'services',
            type: 'text',
            key: 'food-drinks-title',
            value: 'food & drinks',
            publicId: null,
            altText: null,
            order: 1,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 17,
            section: 'services',
            type: 'text',
            key: 'food-drinks-description',
            value: 'Enjoy delicious meals and refreshing drinks crafted by our expert chefs and bartenders.',
            publicId: null,
            altText: null,
            order: 2,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 18,
            section: 'services',
            type: 'text',
            key: 'outdoor-dining-title',
            value: 'outdoor dining',
            publicId: null,
            altText: null,
            order: 3,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 19,
            section: 'services',
            type: 'text',
            key: 'outdoor-dining-description',
            value: 'Dine under the stars with a gentle breeze and the soothing ambiance of nature.',
            publicId: null,
            altText: null,
            order: 4,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 20,
            section: 'services',
            type: 'text',
            key: 'beach-view-title',
            value: 'beach view',
            publicId: null,
            altText: null,
            order: 5,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 21,
            section: 'services',
            type: 'text',
            key: 'beach-view-description',
            value: 'Wake up to breathtaking views of the ocean right from your room or private balcony.',
            publicId: null,
            altText: null,
            order: 6,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 22,
            section: 'services',
            type: 'text',
            key: 'decorations-title',
            value: 'decorations',
            publicId: null,
            altText: null,
            order: 7,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 23,
            section: 'services',
            type: 'text',
            key: 'decorations-description',
            value: 'Experience a space thoughtfully decorated to provide elegance, warmth, and comfort.',
            publicId: null,
            altText: null,
            order: 8,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 24,
            section: 'services',
            type: 'text',
            key: 'swimming-pool-title',
            value: 'swimming pool',
            publicId: null,
            altText: null,
            order: 9,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 25,
            section: 'services',
            type: 'text',
            key: 'swimming-pool-description',
            value: 'Cool off in our luxurious pool, perfect for a relaxing dip or fun with family and friends.',
            publicId: null,
            altText: null,
            order: 10,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 26,
            section: 'services',
            type: 'text',
            key: 'resort-beach-title',
            value: 'resort beach',
            publicId: null,
            altText: null,
            order: 11,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 27,
            section: 'services',
            type: 'text',
            key: 'resort-beach-description',
            value: 'Step into paradise on our private beach, where golden sands meet turquoise waters.',
            publicId: null,
            altText: null,
            order: 12,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        rooms: [
          {
            id: 28,
            section: 'rooms',
            type: 'text',
            key: 'classic-room-name',
            value: 'Classic Room',
            publicId: null,
            altText: null,
            order: 1,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 29,
            section: 'rooms',
            type: 'text',
            key: 'classic-room-description',
            value: 'A cozy room with all the essentials for a comfortable stay.',
            publicId: null,
            altText: null,
            order: 2,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 30,
            section: 'rooms',
            type: 'image',
            key: 'classic-room-image',
            value: 'assets/images/Standard_Room1.jpg',
            publicId: null,
            altText: 'Classic Room',
            order: 3,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 31,
            section: 'rooms',
            type: 'text',
            key: 'deluxe-room-name',
            value: 'Deluxe Room',
            publicId: null,
            altText: null,
            order: 4,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 32,
            section: 'rooms',
            type: 'text',
            key: 'deluxe-room-description',
            value: 'Spacious room with a beautiful view and modern amenities.',
            publicId: null,
            altText: null,
            order: 5,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 33,
            section: 'rooms',
            type: 'image',
            key: 'deluxe-room-image',
            value: 'assets/images/Deluxe_rooms1.jpg',
            publicId: null,
            altText: 'Deluxe Room',
            order: 6,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 34,
            section: 'rooms',
            type: 'text',
            key: 'prestige-room-name',
            value: 'Prestige Room',
            publicId: null,
            altText: null,
            order: 7,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 35,
            section: 'rooms',
            type: 'text',
            key: 'prestige-room-description',
            value: 'Experience luxury in our premium suite with exclusive services.',
            publicId: null,
            altText: null,
            order: 8,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 36,
            section: 'rooms',
            type: 'image',
            key: 'prestige-room-image',
            value: 'assets/images/prestige_rooms.jpg',
            publicId: null,
            altText: 'Prestige Room',
            order: 9,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 37,
            section: 'rooms',
            type: 'text',
            key: 'luxury-suite-name',
            value: 'Luxury Suite',
            publicId: null,
            altText: null,
            order: 10,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 38,
            section: 'rooms',
            type: 'text',
            key: 'luxury-suite-description',
            value: 'Experience luxury in our premium suite with exclusive services.',
            publicId: null,
            altText: null,
            order: 11,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 39,
            section: 'rooms',
            type: 'image',
            key: 'luxury-suite-image',
            value: 'assets/images/Luxury_Rooms1.jpg',
            publicId: null,
            altText: 'Luxury Suite',
            order: 12,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        contact: [
          {
            id: 40,
            section: 'contact',
            type: 'text',
            key: 'contact-title',
            value: 'send us message',
            publicId: null,
            altText: null,
            order: 1,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 41,
            section: 'contact',
            type: 'text',
            key: 'faq-title',
            value: 'frequently asked questions',
            publicId: null,
            altText: null,
            order: 2,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 42,
            section: 'contact',
            type: 'text',
            key: 'faq-cancel-question',
            value: 'how to cancel?',
            publicId: null,
            altText: null,
            order: 3,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 43,
            section: 'contact',
            type: 'text',
            key: 'faq-cancel-answer',
            value: 'You can cancel your reservation by logging into your account and selecting the booking you want to cancel, or by contacting our front desk directly via phone or email.',
            publicId: null,
            altText: null,
            order: 4,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 44,
            section: 'contact',
            type: 'text',
            key: 'faq-vacancy-question',
            value: 'is there any vacancy?',
            publicId: null,
            altText: null,
            order: 5,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 45,
            section: 'contact',
            type: 'text',
            key: 'faq-vacancy-answer',
            value: 'Availability depends on your selected dates. Please check our online booking section or call our front desk for real-time updates on available rooms.',
            publicId: null,
            altText: null,
            order: 6,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 46,
            section: 'contact',
            type: 'text',
            key: 'faq-payment-question',
            value: 'what are payment methods?',
            publicId: null,
            altText: null,
            order: 7,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 47,
            section: 'contact',
            type: 'text',
            key: 'faq-payment-answer',
            value: 'We accept major credit/debit cards, online bank transfers, GCash, and cash payments at the front desk.',
            publicId: null,
            altText: null,
            order: 8,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 48,
            section: 'contact',
            type: 'text',
            key: 'faq-coupons-question',
            value: 'how to claim coupons codes?',
            publicId: null,
            altText: null,
            order: 9,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 49,
            section: 'contact',
            type: 'text',
            key: 'faq-coupons-answer',
            value: 'Apply your valid coupon code during checkout on our website or mention it during your booking call to enjoy exclusive discounts.',
            publicId: null,
            altText: null,
            order: 10,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 50,
            section: 'contact',
            type: 'text',
            key: 'faq-age-question',
            value: 'what are the age requirements?',
            publicId: null,
            altText: null,
            order: 11,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 51,
            section: 'contact',
            type: 'text',
            key: 'faq-age-answer',
            value: 'Guests must be at least 18 years old to make a reservation. Children under 12 stay for free when sharing a room with parents or guardians.',
            publicId: null,
            altText: null,
            order: 12,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 52,
            section: 'contact',
            type: 'text',
            key: 'location-address',
            value: '6014 Sacris Rd, Mandaue, Central Visayas, Philippines',
            publicId: null,
            altText: null,
            order: 13,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 53,
            section: 'contact',
            type: 'text',
            key: 'contact-phone',
            value: '+123-456-7890',
            publicId: null,
            altText: null,
            order: 14,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 54,
            section: 'contact',
            type: 'text',
            key: 'contact-email',
            value: 'BCflats.edu.ph',
            publicId: null,
            altText: null,
            order: 15,
            isActive: true,
            metadata: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      this.initializeTextContent();
    } finally {
      this.loading = false;
    }
  }

  // Initialize text content from loaded data
  initializeTextContent(): void {
    // Initialize text content from loaded data
    this.sections.forEach(section => {
      if (this.content && this.content[section.id] && Array.isArray(this.content[section.id])) {
        this.content[section.id].forEach((item: ContentItem) => {
          if (item && item.type === 'text') {
            const key = `${section.id}_${item.key}`;
            // Always set the current value to ensure input fields are populated
            this.textContent[key] = item.value || '';
            // Store original value for reset functionality
            this.originalContent[key] = item.value || '';
          }
        });
      }
      
      // Initialize with default values if no content exists
      if (!this.textContent[`${section.id}_title`]) {
        this.textContent[`${section.id}_title`] = '';
        this.originalContent[`${section.id}_title`] = '';
      }
      if (!this.textContent[`${section.id}_description`]) {
        this.textContent[`${section.id}_description`] = '';
        this.originalContent[`${section.id}_description`] = '';
      }
    });
  }

  // Reset text content to original values
  resetTextContent(): void {
    this.sections.forEach(section => {
      const titleKey = `${section.id}_title`;
      const descKey = `${section.id}_description`;
      
      // Reset to original values if they exist, otherwise to current content
      if (this.originalContent[titleKey] !== undefined) {
        this.textContent[titleKey] = this.originalContent[titleKey];
      } else {
        this.textContent[titleKey] = this.getCurrentContent(section.id, 'title') || '';
      }
      
      if (this.originalContent[descKey] !== undefined) {
        this.textContent[descKey] = this.originalContent[descKey];
      } else {
        this.textContent[descKey] = this.getCurrentContent(section.id, 'description') || '';
      }
    });
  }

  // Get current content value for display
  getCurrentContent(section: string, key: string, type: 'text' | 'image' | 'logo' = 'text'): string {
    if (!this.content || !this.content[section]) return '';
    
    const sectionContent = this.content[section];
    const item = sectionContent.find((content: ContentItem) => content.key === key && content.type === type);
    
    if (item) {
      if (type === 'text') {
        return item.value || '';
      } else if (type === 'image' || type === 'logo') {
        return item.optimizedUrl || item.value || '';
      }
    }
    
    return '';
  }

  // Get current text content value for input fields
  getCurrentTextValue(section: string, key: string): string {
    const textKey = `${section}_${key}`;
    return this.textContent[textKey] || '';
  }

  // Get current content for specific sections
  getCurrentLogo(): string {
    return this.getCurrentContent('header', 'main-logo', 'logo') || 'assets/images/bcflats.png';
  }

  getCurrentHeroImages(): string[] {
    const hero = this.getSectionItemsSafe('hero');
    const urls: string[] = [];
    hero.forEach((item: ContentItem) => {
      if (item && (item.type === 'image' || item.type === 'gallery')) {
        const u = (item as any).optimizedUrl || item.value;
        if (typeof u === 'string' && u.length > 0) urls.push(u);
      }
    });
    return urls;
  }

  getCurrentAboutImages(): { [key: string]: string } {
    const images: { [key: string]: string } = {};
    
    if (this.content && this.content['about']) {
      this.content['about'].forEach((item: ContentItem) => {
        if (item.type === 'image') {
          const key = item.key.replace('-image', '');
          images[key] = item.optimizedUrl || item.value || '';
        }
      });
    }
    
    return images;
  }

  onFileSelected(event: any, type: 'image' | 'logo' | 'gallery'): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'image') {
        this.selectedFile = file;
        try { (window as any).URL?.revokeObjectURL?.((this as any).selectedPreviewUrl); } catch {}
        (this as any).selectedPreviewUrl = URL.createObjectURL(file);
      } else if (type === 'logo') {
        this.selectedLogo = file;
        try { (window as any).URL?.revokeObjectURL?.((this as any).selectedLogoPreviewUrl); } catch {}
        (this as any).selectedLogoPreviewUrl = URL.createObjectURL(file);
      } else if (type === 'gallery') {
        this.selectedGalleryFiles = Array.from(event.target.files);
      }
    }
  }

  async uploadImage(section: string, key: string, altText?: string): Promise<void> {
    if (!this.selectedFile) {
      this.alertService.error('Please select a file first');
      return;
    }

    this.uploading = true;
    try {
      await this.contentService.uploadImage(section, key, this.selectedFile, altText).toPromise();
      this.alertService.success('Image uploaded successfully');
      this.selectedFile = null;
      await this.loadContent();
    } catch (error) {
      this.alertService.error('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      this.uploading = false;
    }
  }

  async uploadLogo(altText?: string): Promise<void> {
    if (!this.selectedLogo) {
      this.alertService.error('Please select a logo file first');
      return;
    }

    this.uploading = true;
    try {
      await this.contentService.updateLogo(this.selectedLogo, altText).toPromise();
      this.alertService.success('Logo updated successfully');
      this.selectedLogo = null;
      await this.loadContent();
    } catch (error: any) {
      console.error('Error updating logo:', error);
      if (error.message && error.message.includes('Unable to connect to the server')) {
        this.alertService.error('Backend server is not running. Please start the backend server first.');
      } else {
        this.alertService.error('Failed to update logo: ' + (error.message || 'Unknown error'));
      }
    } finally {
      this.uploading = false;
    }
  }

  async uploadGallery(section: string): Promise<void> {
    if (this.selectedGalleryFiles.length === 0) {
      this.alertService.error('Please select gallery images first');
      return;
    }

    this.uploading = true;
    try {
      const galleryImages: GalleryImage[] = this.selectedGalleryFiles.map((file, index) => ({
        file,
        altText: `Image ${index + 1}`
      }));

      await this.contentService.updateGallery(section, galleryImages).toPromise();
      this.alertService.success('Gallery updated successfully');
      this.selectedGalleryFiles = [];
      await this.loadContent();
    } catch (error) {
      this.alertService.error('Failed to update gallery');
      console.error('Error updating gallery:', error);
    } finally {
      this.uploading = false;
    }
  }

  async updateText(section: string, key: string): Promise<void> {
    const value = this.textContent[`${section}_${key}`];
    if (value === undefined || value === null) {
      this.alertService.error('Please enter text content');
      return;
    }

    this.uploading = true;
    try {
      await this.contentService.updateText(section, key, value).toPromise();
      this.alertService.success('Text updated successfully');
      await this.loadContent();
    } catch (error) {
      this.alertService.error('Failed to update text');
      console.error('Error updating text:', error);
    } finally {
      this.uploading = false;
    }
  }

  // Replace an existing image by key using currently selected file
  async replaceImage(section: string, key: string): Promise<void> {
    if (!this.selectedFile) {
      this.alertService.error('Choose an image first');
      return;
    }
    await this.uploadImage(section, key, this.altText);
  }

  async deleteContent(id: number): Promise<void> {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await this.contentService.deleteContent(id).toPromise();
        this.alertService.success('Content deleted successfully');
        await this.loadContent();
      } catch (error) {
        this.alertService.error('Failed to delete content');
        console.error('Error deleting content:', error);
      }
    }
  }

  // Helper methods for template safety
  hasContent(): boolean {
    return this.content && Object.keys(this.content).length > 0;
  }

  hasHeroContent(): boolean {
    return this.content && this.content.hero && Array.isArray(this.content.hero) && this.content.hero.length > 0;
  }

  hasImageContent(section: string): boolean {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.length > 0 && sectionContent.some(item => item.type === 'image');
  }

  hasSectionContent(section: string): boolean {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.length > 0;
  }

  // Check if there's current content to display
  hasCurrentContentToShow(section: string): boolean {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.length > 0;
  }

  // Check if there's any content in the system
  hasAnyContent(): boolean {
    return this.content && Object.keys(this.content).length > 0 && 
           Object.values(this.content).some(section => Array.isArray(section) && section.length > 0);
  }

  // Get current content for display with better fallback
  getCurrentContentForDisplay(section: string, key: string, type: 'text' | 'image' | 'logo' = 'text'): string {
    if (!this.content || !this.content[section]) return '';
    
    const sectionContent = this.content[section];
    if (!Array.isArray(sectionContent)) return '';
    
    const item = sectionContent.find((content: ContentItem) => content.key === key && content.type === type);
    
    if (item) {
      if (type === 'text') {
        return item.value || '';
      } else if (type === 'image' || type === 'logo') {
        return item.optimizedUrl || item.value || '';
      }
    }
    
    return '';
  }

  getImageContent(section: string): ContentItem[] {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.filter(item => item.type === 'image');
  }

  getTextContent(section: string): ContentItem[] {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.filter(item => item.type === 'text');
  }

  getAllContent(section: string): ContentItem[] {
    return this.getContentBySection(section);
  }

  // Return content or fallback to sample data so admins see current context
  getSectionContentOrSample(section: string): ContentItem[] {
    const items = this.getAllContent(section);
    return items && items.length > 0 ? items : this.getSampleContent(section);
  }

  getContentKeys(): string[] {
    return this.content ? Object.keys(this.content) : [];
  }

  getContentBySection(section: string): ContentItem[] {
    return this.content && this.content[section] ? this.content[section] : [];
  }

  getContentByKey(section: string, key: string): ContentItem | null {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.find(item => item.key === key) || null;
  }

  getOptimizedImageUrl(publicId: string, type: string = 'default'): string {
    return this.contentService.getOptimizedImageUrl(publicId, type);
  }

  // Current value with fallback to sample content when none saved yet
  getCurrentContentWithFallback(section: string, key: string, type: 'text' | 'image' | 'logo' = 'text'): string {
    const live = this.getCurrentContent(section, key, type);
    if (live) return live;
    const sampleList = this.getSampleContent(section) || [];
    const sample = sampleList.find((c: ContentItem) => c.key === key && c.type === type);
    if (!sample) return '';
    if (type === 'text') return sample.value || '';
    return (sample as any).optimizedUrl || sample.value || '';
  }



  clearFileInputFromEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      target.value = '';
    }
  }

  getFileSize(file: File | null): string {
    if (!file) return '0 MB';
    const sizeInMB = file.size / (1024 * 1024);
    return sizeInMB.toFixed(2) + ' MB';
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Get sample content for demonstration when no real content exists
  getSampleContent(section: string): ContentItem[] {
    const sampleContent: { [key: string]: ContentItem[] } = {
      'hero': [
        {
          id: 1,
          section: 'hero',
          type: 'text',
          key: 'title',
          value: 'luxurious rooms',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          section: 'hero',
          type: 'text',
          key: 'description',
          value: 'foods and drinks',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          section: 'hero',
          type: 'text',
          key: 'subtitle',
          value: 'luxurious halls',
          publicId: undefined,
          altText: undefined,
          order: 3,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          section: 'hero',
          type: 'image',
          key: 'hero-image-1',
          value: 'assets/images/Pool_home.jpg',
          publicId: undefined,
          altText: 'Pool Home Image',
          order: 4,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          section: 'hero',
          type: 'image',
          key: 'hero-image-2',
          value: 'assets/images/Beach_view.jpg',
          publicId: undefined,
          altText: 'Beach View Image',
          order: 5,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 6,
          section: 'hero',
          type: 'image',
          key: 'hero-image-3',
          value: 'assets/images/Front_desk.jpg',
          publicId: undefined,
          altText: 'Front Desk Image',
          order: 6,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'about': [
        {
          id: 7,
          section: 'about',
          type: 'text',
          key: 'staff-title',
          value: 'best staff',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 8,
          section: 'about',
          type: 'text',
          key: 'staff-description',
          value: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 9,
          section: 'about',
          type: 'image',
          key: 'staff-image',
          value: 'assets/images/Staff.jpg',
          publicId: undefined,
          altText: 'Best Staff',
          order: 3,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 10,
          section: 'about',
          type: 'text',
          key: 'foods-title',
          value: 'best foods',
          publicId: undefined,
          altText: undefined,
          order: 4,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 11,
          section: 'about',
          type: 'text',
          key: 'foods-description',
          value: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
          publicId: undefined,
          altText: undefined,
          order: 5,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 12,
          section: 'about',
          type: 'image',
          key: 'foods-image',
          value: 'assets/images/Foods.jpg',
          publicId: undefined,
          altText: 'Best Foods',
          order: 6,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 13,
          section: 'about',
          type: 'text',
          key: 'pool-title',
          value: 'swimming pool',
          publicId: undefined,
          altText: undefined,
          order: 7,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 14,
          section: 'about',
          type: 'text',
          key: 'pool-description',
          value: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.',
          publicId: undefined,
          altText: undefined,
          order: 8,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 15,
          section: 'about',
          type: 'image',
          key: 'pool-image',
          value: 'assets/images/Pool.jpg',
          publicId: undefined,
          altText: 'Swimming Pool',
          order: 9,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'services': [
        {
          id: 16,
          section: 'services',
          type: 'text',
          key: 'food-drinks-title',
          value: 'food & drinks',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 17,
          section: 'services',
          type: 'text',
          key: 'food-drinks-description',
          value: 'Enjoy delicious meals and refreshing drinks crafted by our expert chefs and bartenders.',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 18,
          section: 'services',
          type: 'text',
          key: 'outdoor-dining-title',
          value: 'outdoor dining',
          publicId: undefined,
          altText: undefined,
          order: 3,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 19,
          section: 'services',
          type: 'text',
          key: 'outdoor-dining-description',
          value: 'Dine under the stars with a gentle breeze and the soothing ambiance of nature.',
          publicId: undefined,
          altText: undefined,
          order: 4,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 20,
          section: 'services',
          type: 'text',
          key: 'beach-view-title',
          value: 'beach view',
          publicId: undefined,
          altText: undefined,
          order: 5,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 21,
          section: 'services',
          type: 'text',
          key: 'beach-view-description',
          value: 'Wake up to breathtaking views of the ocean right from your room or private balcony.',
          publicId: undefined,
          altText: undefined,
          order: 6,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 22,
          section: 'services',
          type: 'text',
          key: 'decorations-title',
          value: 'decorations',
          publicId: undefined,
          altText: undefined,
          order: 7,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 23,
          section: 'services',
          type: 'text',
          key: 'decorations-description',
          value: 'Experience a space thoughtfully decorated to provide elegance, warmth, and comfort.',
          publicId: undefined,
          altText: undefined,
          order: 8,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 24,
          section: 'services',
          type: 'text',
          key: 'swimming-pool-title',
          value: 'swimming pool',
          publicId: undefined,
          altText: undefined,
          order: 9,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 25,
          section: 'services',
          type: 'text',
          key: 'swimming-pool-description',
          value: 'Cool off in our luxurious pool, perfect for a relaxing dip or fun with family and friends.',
          publicId: undefined,
          altText: undefined,
          order: 10,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 26,
          section: 'services',
          type: 'text',
          key: 'resort-beach-title',
          value: 'resort beach',
          publicId: undefined,
          altText: undefined,
          order: 11,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 27,
          section: 'services',
          type: 'text',
          key: 'resort-beach-description',
          value: 'Step into paradise on our private beach, where golden sands meet turquoise waters.',
          publicId: undefined,
          altText: undefined,
          order: 12,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'rooms': [
        {
          id: 28,
          section: 'rooms',
          type: 'text',
          key: 'classic-room-name',
          value: 'Classic Room',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 29,
          section: 'rooms',
          type: 'text',
          key: 'classic-room-description',
          value: 'A cozy room with all the essentials for a comfortable stay.',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 30,
          section: 'rooms',
          type: 'image',
          key: 'classic-room-image',
          value: 'assets/images/Standard_Room1.jpg',
          publicId: undefined,
          altText: 'Classic Room',
          order: 3,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 31,
          section: 'rooms',
          type: 'text',
          key: 'deluxe-room-name',
          value: 'Deluxe Room',
          publicId: undefined,
          altText: undefined,
          order: 4,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 32,
          section: 'rooms',
          type: 'text',
          key: 'deluxe-room-description',
          value: 'Spacious room with a beautiful view and modern amenities.',
          publicId: undefined,
          altText: undefined,
          order: 5,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 33,
          section: 'rooms',
          type: 'image',
          key: 'deluxe-room-image',
          value: 'assets/images/Deluxe_rooms1.jpg',
          publicId: undefined,
          altText: 'Deluxe Room',
          order: 6,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 34,
          section: 'rooms',
          type: 'text',
          key: 'prestige-room-name',
          value: 'Prestige Room',
          publicId: undefined,
          altText: undefined,
          order: 7,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 35,
          section: 'rooms',
          type: 'text',
          key: 'prestige-room-description',
          value: 'Experience luxury in our premium suite with exclusive services.',
          publicId: undefined,
          altText: undefined,
          order: 8,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 36,
          section: 'rooms',
          type: 'image',
          key: 'prestige-room-image',
          value: 'assets/images/prestige_rooms.jpg',
          publicId: undefined,
          altText: 'Prestige Room',
          order: 9,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 37,
          section: 'rooms',
          type: 'text',
          key: 'luxury-suite-name',
          value: 'Luxury Suite',
          publicId: undefined,
          altText: undefined,
          order: 10,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 38,
          section: 'rooms',
          type: 'text',
          key: 'luxury-suite-description',
          value: 'Experience luxury in our premium suite with exclusive services.',
          publicId: undefined,
          altText: undefined,
          order: 11,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 39,
          section: 'rooms',
          type: 'image',
          key: 'luxury-suite-image',
          value: 'assets/images/Luxury_Rooms1.jpg',
          publicId: undefined,
          altText: 'Luxury Suite',
          order: 12,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'contact': [
        {
          id: 40,
          section: 'contact',
          type: 'text',
          key: 'contact-title',
          value: 'send us message',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 41,
          section: 'contact',
          type: 'text',
          key: 'faq-title',
          value: 'frequently asked questions',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 42,
          section: 'contact',
          type: 'text',
          key: 'faq-cancel-question',
          value: 'how to cancel?',
          publicId: undefined,
          altText: undefined,
          order: 3,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 43,
          section: 'contact',
          type: 'text',
          key: 'faq-cancel-answer',
          value: 'You can cancel your reservation by logging into your account and selecting the booking you want to cancel, or by contacting our front desk directly via phone or email.',
          publicId: undefined,
          altText: undefined,
          order: 4,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 44,
          section: 'contact',
          type: 'text',
          key: 'faq-vacancy-question',
          value: 'is there any vacancy?',
          publicId: undefined,
          altText: undefined,
          order: 5,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 45,
          section: 'contact',
          type: 'text',
          key: 'faq-vacancy-answer',
          value: 'Availability depends on your selected dates. Please check our online booking section or call our front desk for real-time updates on available rooms.',
          publicId: undefined,
          altText: undefined,
          order: 6,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 46,
          section: 'contact',
          type: 'text',
          key: 'faq-payment-question',
          value: 'what are payment methods?',
          publicId: undefined,
          altText: undefined,
          order: 7,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 47,
          section: 'contact',
          type: 'text',
          key: 'faq-payment-answer',
          value: 'We accept major credit/debit cards, online bank transfers, GCash, and cash payments at the front desk.',
          publicId: undefined,
          altText: undefined,
          order: 8,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 48,
          section: 'contact',
          type: 'text',
          key: 'faq-coupons-question',
          value: 'how to claim coupons codes?',
          publicId: undefined,
          altText: undefined,
          order: 9,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 49,
          section: 'contact',
          type: 'text',
          key: 'faq-coupons-answer',
          value: 'Apply your valid coupon code during checkout on our website or mention it during your booking call to enjoy exclusive discounts.',
          publicId: undefined,
          altText: undefined,
          order: 10,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 50,
          section: 'contact',
          type: 'text',
          key: 'faq-age-question',
          value: 'what are the age requirements?',
          publicId: undefined,
          altText: undefined,
          order: 11,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 51,
          section: 'contact',
          type: 'text',
          key: 'faq-age-answer',
          value: 'Guests must be at least 18 years old to make a reservation. Children under 12 stay for free when sharing a room with parents or guardians.',
          publicId: undefined,
          altText: undefined,
          order: 12,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 52,
          section: 'contact',
          type: 'text',
          key: 'location-address',
          value: '6014 Sacris Rd, Mandaue, Central Visayas, Philippines',
          publicId: undefined,
          altText: undefined,
          order: 13,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 53,
          section: 'contact',
          type: 'text',
          key: 'contact-phone',
          value: '+123-456-7890',
          publicId: undefined,
          altText: undefined,
          order: 14,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 54,
          section: 'contact',
          type: 'text',
          key: 'contact-email',
          value: 'BCflats.edu.ph',
          publicId: undefined,
          altText: undefined,
          order: 15,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    
    return sampleContent[section] || [];
  }

  // Check if we should show sample content
  shouldShowSampleContent(section: string): boolean {
    return !this.hasCurrentContentToShow(section) && (section === 'hero' || section === 'about');
  }

  // Get current content for display with better formatting
  getCurrentContentDisplay(section: string, key: string, type: 'text' | 'image' | 'logo' = 'text'): string {
    const content = this.getCurrentContent(section, key, type);
    if (content) {
      return `Current: ${content}`;
    }
    return '';
  }

  // Get current text content for input placeholders
  getCurrentTextPlaceholder(section: string, key: string): string {
    const currentText = this.getCurrentContent(section, key, 'text');
    if (currentText) {
      return `Current: ${currentText}`;
    }
    return `Enter ${key}`;
  }

  // Initialize tabs for each section
  private initializeTabs(): void {
    try {
      const saved = localStorage.getItem(this.TAB_STORAGE_KEY);
      if (saved) this.activeTabs = JSON.parse(saved);
    } catch {}
    this.sections.forEach(section => {
      if (!this.activeTabs[section.id]) this.activeTabs[section.id] = 'text';
    });
  }

  // Tab management methods
  setActiveTab(sectionId: string, tabName: string): void {
    this.activeTabs[sectionId] = tabName;
    try { localStorage.setItem(this.TAB_STORAGE_KEY, JSON.stringify(this.activeTabs)); } catch {}
  }

  getActiveTab(sectionId: string): string {
    return this.activeTabs[sectionId] || 'text';
  }

  // Helper methods for the new interface
  getSectionIcon(sectionId: string): string {
    const icons: { [key: string]: string } = {
      'hero': 'fa fa-star',
      'about': 'fa fa-info-circle',
      'services': 'fa fa-cogs',
      'rooms': 'fa fa-bed',
      'contact': 'fa fa-envelope'
    };
    return icons[sectionId] || 'fa fa-file';
  }

  getSectionLocation(sectionId: string): string {
    const locations: { [key: string]: string } = {
      'hero': 'Main banner at top of page',
      'about': 'About section below hero',
      'services': 'Services section with icons',
      'rooms': 'Rooms showcase section',
      'contact': 'Contact form and information'
    };
    return locations[sectionId] || 'Website section';
  }

  getSectionStatus(sectionId: string): string {
    const sectionContent = this.getSectionItemsSafe(sectionId);
    if (sectionContent.length === 0) return 'Empty';
    if (sectionContent.some((item: any) => item.isActive)) return 'Active';
    return 'Inactive';
  }

  getSectionStatusClass(sectionId: string): string {
    const status = this.getSectionStatus(sectionId);
    switch (status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      default: return 'status-empty';
    }
  }

  getTextFields(sectionId: string): any[] {
    return this.textFields[sectionId as keyof typeof this.textFields] || [];
  }

  // Safely get items for a section even if content is not yet loaded
  private getSectionItemsSafe(sectionId: string): any[] {
    const content: any = this.content;
    if (!content || typeof content !== 'object') return [];
    const items = content[sectionId];
    return Array.isArray(items) ? items : [];
  }

  // File management methods
  clearLogoSelection(): void {
    this.selectedLogo = null;
    this.clearFileInput('logo-upload');
    // Cleanup preview URL if any (future-proof)
    try { (window as any).URL?.revokeObjectURL?.((this as any).selectedLogoPreviewUrl); } catch {}
  }

  clearFileSelection(): void {
    this.selectedFile = null;
    this.altText = '';
    // Cleanup preview URL if any (future-proof)
    try { (window as any).URL?.revokeObjectURL?.((this as any).selectedPreviewUrl); } catch {}
  }

  clearGallerySelection(): void {
    this.selectedGalleryFiles = [];
  }

  private clearFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // Content management methods
  onDragOver(event: DragEvent): void { event.preventDefault(); }
  onDropFile(event: DragEvent, type: 'image' | 'logo' | 'gallery'): void {
    event.preventDefault();
    const dt = event.dataTransfer;
    if (!dt || !dt.files?.length) return;
    if (type === 'gallery') {
      this.selectedGalleryFiles = Array.from(dt.files);
    } else if (type === 'image') {
      const file = dt.files[0];
      this.selectedFile = file;
      try { (window as any).URL?.revokeObjectURL?.((this as any).selectedPreviewUrl); } catch {}
      (this as any).selectedPreviewUrl = URL.createObjectURL(file);
    } else {
      const file = dt.files[0];
      this.selectedLogo = file;
      try { (window as any).URL?.revokeObjectURL?.((this as any).selectedLogoPreviewUrl); } catch {}
      (this as any).selectedLogoPreviewUrl = URL.createObjectURL(file);
    }
  }
  refreshContent(): void {
    this.loadContent();
  }

  exportContent(): void {
    const dataStr = JSON.stringify(this.content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Section-specific methods
  resetSectionText(sectionId: string): void {
    const fields = this.getTextFields(sectionId);
    fields.forEach(field => {
      const key = sectionId + '_' + field.key;
      const currentValue = this.getCurrentContent(sectionId, field.key);
      this.textContent[key] = currentValue || '';
    });
  }

  saveAllText(sectionId: string): void {
    const fields = this.getTextFields(sectionId);
    let savedCount = 0;
    
    fields.forEach(field => {
      const key = sectionId + '_' + field.key;
      const value = this.textContent[key];
      if (value && value.trim()) {
        this.updateText(sectionId, field.key);
        savedCount++;
      }
    });

    if (savedCount > 0) {
      this.alertService.success(`Successfully saved ${savedCount} text field(s)`);
    } else {
      this.alertService.error('No text content to save');
    }
  }

  uploadSectionImage(sectionId: string): void {
    if (this.selectedFile) {
      this.uploadImage(sectionId, 'main-image', this.altText);
    }
  }

  uploadGalleryImages(sectionId: string): void {
    if (this.selectedGalleryFiles.length > 0) {
      this.uploadGallery(sectionId);
    }
  }

  // Utility methods
  trackBySection(index: number, section: any): string {
    return section.id;
  }

  formatImageKey(key: string): string {
    return key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  hasGalleryContent(sectionId: string): boolean {
    const sectionContent = this.getSectionItemsSafe(sectionId);
    return sectionContent.some((item: any) => item.type === 'gallery');
  }

  getGalleryContent(sectionId: string): any[] {
    const sectionContent = this.getSectionItemsSafe(sectionId);
    return sectionContent.filter((item: any) => item.type === 'gallery');
  }

  // Header Management Methods
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
              (this.headerContent as any).logoText = item.value || this.headerContent.companyName || 'BC Flats';
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

  async saveHeaderContent(): Promise<void> {
    this.savingHeader = true;
    try {
      const headerItems = [
        { section: 'header', type: 'text', key: 'company_name', value: this.headerContent.companyName },
        { section: 'header', type: 'text', key: 'logo_text', value: (this.headerContent as any).logoText || this.headerContent.companyName },
        { section: 'header', type: 'text', key: 'title', value: this.headerContent.title },
        { section: 'header', type: 'text', key: 'navigation', value: JSON.stringify(this.headerContent.navigation) },
        { section: 'header', type: 'text', key: 'cta_button', value: JSON.stringify(this.headerContent.ctaButton) },
        { section: 'header', type: 'text', key: 'login_button', value: JSON.stringify(this.headerContent.loginButton) },
        { section: 'header', type: 'text', key: 'styles', value: JSON.stringify(this.headerContent.styles) }
      ];

      // Save each header item
      for (const item of headerItems) {
        await this.contentService.updateText(item.section, item.key, item.value).toPromise();
      }

      this.alertService.success('Header content saved successfully!');
      await this.loadContent();
      await this.loadHeaderContent();
    } catch (error) {
      this.alertService.error('Failed to save header content');
      console.error('Error saving header content:', error);
    } finally {
      this.savingHeader = false;
    }
  }

  addNavigationItem(): void {
    this.headerContent.navigation.push({
      label: 'New Item',
      href: '#',
      isExternal: false
    });
  }

  removeNavigationItem(index: number): void {
    if (this.headerContent.navigation.length > 1) {
      this.headerContent.navigation.splice(index, 1);
    } else {
      this.alertService.error('At least one navigation item is required');
    }
  }

  resetHeaderContent(): void {
    this.headerContent = {
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
    this.alertService.info('Header content reset to default values');
  }

  // Footer Management Methods
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

  async saveFooterContent(): Promise<void> {
    this.savingFooter = true;
    try {
      const footerItems = [
        { section: 'footer', type: 'text', key: 'company_name', value: this.footerContent.companyName },
        { section: 'footer', type: 'text', key: 'phone1', value: this.footerContent.phone1 },
        { section: 'footer', type: 'text', key: 'phone2', value: this.footerContent.phone2 },
        { section: 'footer', type: 'text', key: 'email', value: this.footerContent.email },
        { section: 'footer', type: 'text', key: 'address', value: this.footerContent.address },
        { section: 'footer', type: 'text', key: 'social_links', value: JSON.stringify(this.footerContent.social) },
        { section: 'footer', type: 'text', key: 'copyright_text', value: this.footerContent.copyrightText },
        { section: 'footer', type: 'text', key: 'show_dynamic_year', value: this.footerContent.showDynamicYear.toString() },
        { section: 'footer', type: 'text', key: 'styles', value: JSON.stringify(this.footerContent.styles) }
      ];

      // Save each footer item
      for (const item of footerItems) {
        await this.contentService.updateText(item.section, item.key, item.value).toPromise();
      }

      this.alertService.success('Footer content saved successfully!');
      await this.loadContent(); // Refresh the main content
    } catch (error) {
      this.alertService.error('Failed to save footer content');
      console.error('Error saving footer content:', error);
    } finally {
      this.savingFooter = false;
    }
  }

  resetFooterContent(): void {
    this.footerContent = {
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
    this.alertService.info('Footer content reset to default values');
  }

  // Footer year helpers
  setDynamicYear(enabled: boolean): void {
    this.footerContent.showDynamicYear = enabled;
  }

  updateFooterYearRange(startYear: number, endYear?: number): void {
    const normalizedStart = Math.max(1900, Math.floor(startYear));
    const normalizedEnd = endYear !== undefined ? Math.max(normalizedStart, Math.floor(endYear)) : normalizedStart;
    this.footerContent.showDynamicYear = false;
    this.footerContent.copyrightText = normalizedStart === normalizedEnd
      ? `${normalizedStart}`
      : `${normalizedStart}-${normalizedEnd}`;
  }

  async saveFooterYearRange(startYear: number, endYear?: number): Promise<void> {
    this.updateFooterYearRange(startYear, endYear);
    await this.saveFooterContent();
  }

  // Home Management Methods
  async loadHomeContent(): Promise<void> {
    try {
      // Load hero images
      const heroItems = await this.contentService.getSectionContent('hero').toPromise();
      if (heroItems && Array.isArray(heroItems)) {
        this.homeContent.heroImages = heroItems
          .filter((item: ContentItem) => item.type === 'image' || item.type === 'gallery')
          .map((item: ContentItem) => item.optimizedUrl || item.value)
          .filter((url): url is string => Boolean(url));
      }

      // Load about content
      const aboutItems = await this.contentService.getSectionContent('about').toPromise();
      if (aboutItems && Array.isArray(aboutItems)) {
        aboutItems.forEach((item: ContentItem) => {
          switch (item.key) {
            case 'staff-title':
              this.homeContent.aboutContent.staffTitle = item.value || 'best staff';
              break;
            case 'staff-description':
              this.homeContent.aboutContent.staffDescription = item.value || 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.';
              break;
            case 'foods-title':
              this.homeContent.aboutContent.foodsTitle = item.value || 'best foods';
              break;
            case 'foods-description':
              this.homeContent.aboutContent.foodsDescription = item.value || 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.';
              break;
            case 'pool-title':
              this.homeContent.aboutContent.poolTitle = item.value || 'swimming pool';
              break;
            case 'pool-description':
              this.homeContent.aboutContent.poolDescription = item.value || 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.';
              break;
            case 'staff-image':
              this.homeContent.aboutImages.staff = item.optimizedUrl || item.value || 'assets/images/about-img-1.jpg';
              break;
            case 'foods-image':
              this.homeContent.aboutImages.foods = item.optimizedUrl || item.value || 'assets/images/about-img-2.jpg';
              break;
            case 'pool-image':
              this.homeContent.aboutImages.pool = item.optimizedUrl || item.value || 'assets/images/about-img-3.jpg';
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error loading home content:', error);
    }
  }

  async saveHomeContent(): Promise<void> {
    this.savingHome = true;
    try {
      // Save about content
      const aboutItems = [
        { section: 'about', type: 'text', key: 'staff-title', value: this.homeContent.aboutContent.staffTitle },
        { section: 'about', type: 'text', key: 'staff-description', value: this.homeContent.aboutContent.staffDescription },
        { section: 'about', type: 'text', key: 'foods-title', value: this.homeContent.aboutContent.foodsTitle },
        { section: 'about', type: 'text', key: 'foods-description', value: this.homeContent.aboutContent.foodsDescription },
        { section: 'about', type: 'text', key: 'pool-title', value: this.homeContent.aboutContent.poolTitle },
        { section: 'about', type: 'text', key: 'pool-description', value: this.homeContent.aboutContent.poolDescription },
        { section: 'about', type: 'text', key: 'staff-image', value: this.homeContent.aboutImages.staff },
        { section: 'about', type: 'text', key: 'foods-image', value: this.homeContent.aboutImages.foods },
        { section: 'about', type: 'text', key: 'pool-image', value: this.homeContent.aboutImages.pool }
      ];

      // Save each about item
      for (const item of aboutItems) {
        await this.contentService.updateText(item.section, item.key, item.value).toPromise();
      }

      this.alertService.success('Home content saved successfully!');
      await this.loadContent(); // Refresh the main content
    } catch (error) {
      this.alertService.error('Failed to save home content');
      console.error('Error saving home content:', error);
    } finally {
      this.savingHome = false;
    }
  }

  onHeroImagesSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedHeroImages = Array.from(files);
      this.uploadHeroImages();
    }
  }

  async uploadHeroImages(): Promise<void> {
    if (this.selectedHeroImages.length === 0) return;

    this.uploading = true;
    try {
      for (const file of this.selectedHeroImages) {
        await this.contentService.uploadImage('hero', 'hero-image', file).toPromise();
      }
      this.alertService.success('Hero images uploaded successfully!');
      await this.loadHomeContent();
      this.selectedHeroImages = [];
    } catch (error) {
      this.alertService.error('Failed to upload hero images');
      console.error('Error uploading hero images:', error);
    } finally {
      this.uploading = false;
    }
  }

  removeHeroImage(index: number): void {
    this.homeContent.heroImages.splice(index, 1);
  }

  onAboutImageSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedAboutImage = file;
      this.selectedAboutImageType = type;
      this.uploadAboutImage();
    }
  }

  async uploadAboutImage(): Promise<void> {
    if (!this.selectedAboutImage || !this.selectedAboutImageType) return;

    this.uploading = true;
    try {
      const result = await this.contentService.uploadImage('about', `${this.selectedAboutImageType}-image`, this.selectedAboutImage).toPromise();
      if (result) {
        (this.homeContent.aboutImages as any)[this.selectedAboutImageType] = result.optimizedUrl || result.value || '';
        this.alertService.success('About image uploaded successfully!');
      } else {
        this.alertService.error('Failed to upload about image - no result returned');
      }
      this.selectedAboutImage = null;
      this.selectedAboutImageType = '';
    } catch (error) {
      this.alertService.error('Failed to upload about image');
      console.error('Error uploading about image:', error);
    } finally {
      this.uploading = false;
    }
  }

  resetHomeContent(): void {
    this.homeContent = {
      heroImages: [
        'assets/images/Pool_home.jpg',
        'assets/images/Beach_view.jpg',
        'assets/images/Front_desk.jpg'
      ],
      aboutContent: {
        staffTitle: 'best staff',
        staffDescription: 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
        foodsTitle: 'best foods',
        foodsDescription: 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
        poolTitle: 'swimming pool',
        poolDescription: 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.'
      },
      aboutImages: {
        staff: 'assets/images/about-img-1.jpg',
        foods: 'assets/images/about-img-2.jpg',
        pool: 'assets/images/about-img-3.jpg'
      }
    };
    this.alertService.info('Home content reset to default values');
  }

  // Enhanced Backup and Restore Methods
  createBackup(): void {
    try {
      this.contentBackup = JSON.parse(JSON.stringify(this.content));
      this.hasBackup = true;
      this.alertService.success('Backup created successfully!');
    } catch (error) {
      this.alertService.error('Failed to create backup');
      console.error('Error creating backup:', error);
    }
  }

  restoreFromBackup(): void {
    if (!this.hasBackup || !this.contentBackup) {
      this.alertService.error('No backup available to restore');
      return;
    }

    if (confirm('Are you sure you want to restore from backup? This will overwrite all current content.')) {
      try {
        this.content = JSON.parse(JSON.stringify(this.contentBackup));
        this.alertService.success('Content restored from backup successfully!');
        this.loadContent(); // Refresh the display
      } catch (error) {
        this.alertService.error('Failed to restore from backup');
        console.error('Error restoring from backup:', error);
      }
    }
  }


  async restoreToOriginal(): Promise<void> {
    if (confirm('Are you sure you want to restore to original content? This will overwrite ALL current content and cannot be undone.')) {
      try {
        // Reset header content to original values
        this.headerContent = {
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

        // Reset footer content to original values
        this.footerContent = {
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

        // Save header and footer content
        await this.saveHeaderContent();
        await this.saveFooterContent();

        // Reset text content to original values
        const originalTextContent = {
          'about_staff-title': 'best staff',
          'about_staff-description': 'Our professional and friendly staff are always ready to serve you with a smile—making every moment feel like home.',
          'about_foods-title': 'best foods',
          'about_foods-description': 'Savor our chef-crafted dishes made with the freshest ingredients. Every bite is an experience worth remembering.',
          'about_pool-title': 'swimming pool',
          'about_pool-description': 'Relax, unwind, and soak up the sun in our crystal-clear pools—designed for both serenity and fun.',
          'services_food-drinks-title': 'food & drinks',
          'services_food-drinks-description': 'Enjoy delicious meals and refreshing drinks crafted by our expert chefs and bartenders.',
          'services_outdoor-dining-title': 'outdoor dining',
          'services_outdoor-dining-description': 'Dine under the stars with a gentle breeze and the soothing ambiance of nature.',
          'services_beach-view-title': 'beach view',
          'services_beach-view-description': 'Wake up to breathtaking views of the ocean right from your room or private balcony.',
          'services_decorations-title': 'decorations',
          'services_decorations-description': 'Experience a space thoughtfully decorated to provide elegance, warmth, and comfort.',
          'services_swimming-pool-title': 'swimming pool',
          'services_swimming-pool-description': 'Cool off in our luxurious pool, perfect for a relaxing dip or fun with family and friends.',
          'services_resort-beach-title': 'resort beach',
          'services_resort-beach-description': 'Step into paradise on our private beach, where golden sands meet turquoise waters.',
          'contact_contact-title': 'Contact Us',
          'contact_contact-subtitle': 'Get in touch with us',
          'contact_contact-address': '6014 Sacris Rd, Mandaue, Central Visayas, Philippines',
          'contact_contact-phone': '+123-456-7890',
          'contact_contact-email': 'BCflats.edu.ph'
        };

        // Update text content
        for (const [key, value] of Object.entries(originalTextContent)) {
          const [section, fieldKey] = key.split('_');
          try {
            await this.contentService.updateText(section, fieldKey, value).toPromise();
          } catch (error) {
            console.warn(`Failed to update ${section}.${fieldKey}:`, error);
          }
        }

        this.alertService.success('Content restored to original values successfully!');
        await this.loadContent(); // Refresh the display
      } catch (error) {
        this.alertService.error('Failed to restore to original content');
        console.error('Error restoring to original:', error);
      }
    }
  }

  clearBackup(): void {
    this.contentBackup = null;
    this.hasBackup = false;
    this.alertService.info('Backup cleared');
  }

  // Service Icon Management
  replaceServiceIcon(iconIndex: number): void {
    if (!this.selectedFile) {
      this.alertService.error('Please select a file first');
      return;
    }

    const icon = this.serviceIcons[iconIndex];
    if (!icon) {
      this.alertService.error('Invalid icon selection');
      return;
    }

    this.uploading = true;
    this.alertService.info('Uploading service icon...');

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('section', 'services');
    formData.append('key', icon.key);
    formData.append('altText', icon.name);

    this.contentService.uploadImage(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the icon URL
          icon.currentUrl = response.data.optimizedUrl || response.data.value;
          this.alertService.success(`Service icon "${icon.name}" updated successfully!`);
          this.clearFileSelection();
        } else {
          this.alertService.error('Failed to update service icon');
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading service icon:', error);
        this.alertService.error('Failed to upload service icon');
        this.uploading = false;
      }
    });
  }

  // Room Image Management
  replaceRoomImage(roomIndex: number, imageType: 'main' | 'seasonal', seasonalIndex?: number): void {
    if (!this.selectedFile) {
      this.alertService.error('Please select a file first');
      return;
    }

    const room = this.roomImages[roomIndex];
    if (!room) {
      this.alertService.error('Invalid room selection');
      return;
    }

    this.uploading = true;
    this.alertService.info('Uploading room image...');

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('section', 'rooms');
    
    let key: string;
    let altText: string;
    
    if (imageType === 'main') {
      key = `${room.name.toLowerCase().replace(' ', '-')}-main-image`;
      altText = `${room.name} main image`;
    } else {
      key = `${room.name.toLowerCase().replace(' ', '-')}-seasonal-image-${seasonalIndex! + 1}`;
      altText = `${room.name} seasonal image ${seasonalIndex! + 1}`;
    }
    
    formData.append('key', key);
    formData.append('altText', altText);

    this.contentService.uploadImage(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const newUrl = response.data.optimizedUrl || response.data.value;
          
          if (imageType === 'main') {
            room.mainImage = newUrl;
          } else {
            room.seasonalImages[seasonalIndex!] = newUrl;
          }
          
          this.alertService.success(`Room image updated successfully!`);
          this.clearFileSelection();
        } else {
          this.alertService.error('Failed to update room image');
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading room image:', error);
        this.alertService.error('Failed to upload room image');
        this.uploading = false;
      }
    });
  }

  // Load service icons from content service
  async loadServiceIcons(): Promise<void> {
    try {
      const iconsContent = await this.contentService.getSectionContent('services').toPromise();
      
      if (iconsContent && Array.isArray(iconsContent)) {
        iconsContent.forEach((item: any) => {
          if (item.type === 'image' && item.key.startsWith('icon-')) {
            const iconIndex = this.serviceIcons.findIndex(icon => icon.key === item.key);
            if (iconIndex !== -1) {
              this.serviceIcons[iconIndex].currentUrl = item.optimizedUrl || item.value;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading service icons:', error);
    }
  }

  // Load room images from content service
  async loadRoomImages(): Promise<void> {
    try {
      const roomsContent = await this.contentService.getSectionContent('rooms').toPromise();
      
      if (roomsContent && Array.isArray(roomsContent)) {
        roomsContent.forEach((item: any) => {
          if (item.type === 'image') {
            const key = item.key;
            
            // Match main images
            this.roomImages.forEach(room => {
              const roomKey = room.name.toLowerCase().replace(' ', '-');
              if (key.includes(roomKey) && key.includes('main')) {
                room.mainImage = item.optimizedUrl || item.value;
              }
            });
            
            // Match seasonal images
            this.roomImages.forEach(room => {
              const roomKey = room.name.toLowerCase().replace(' ', '-');
              if (key.includes(roomKey) && key.includes('seasonal')) {
                const match = key.match(/seasonal-image-(\d+)/);
                if (match) {
                  const index = parseInt(match[1]) - 1;
                  if (index >= 0 && index < room.seasonalImages.length) {
                    room.seasonalImages[index] = item.optimizedUrl || item.value;
                  }
                }
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading room images:', error);
    }
  }

}

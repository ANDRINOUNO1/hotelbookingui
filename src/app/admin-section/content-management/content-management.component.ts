import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService, ContentItem, GalleryImage } from '../../_services/content.service';
import { AlertService } from '../../_services/alert.service';

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
  
  // Backup system
  private contentBackup: any = null;
  public hasBackup: boolean = false;
  
  // Text content
  textContent: { [key: string]: string } = {};
  
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

  // Create backup of current content
  createBackup(): void {
    this.contentBackup = JSON.parse(JSON.stringify(this.content));
    this.hasBackup = true;
    console.log('Content backup created');
  }

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
    this.initializeTabs();

    
    this.content = this.content || {};
    ['hero','about','services','rooms','contact','header'].forEach(key => {
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
}

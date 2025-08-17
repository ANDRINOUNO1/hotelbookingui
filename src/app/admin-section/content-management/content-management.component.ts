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
  
  // Text content
  textContent: { [key: string]: string } = {};
  
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

  constructor(
    private contentService: ContentService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadContent();
  }

  async loadContent(): Promise<void> {
    this.loading = true;
    try {
      this.content = await this.contentService.getAdminContent().toPromise();
      this.initializeTextContent();
    } catch (error: any) {
      console.error('Error loading content:', error);
      if (error.message && error.message.includes('Unable to connect to the server')) {
        this.alertService.error('Backend server is not running. Please start the backend server first.');
      } else {
        this.alertService.error('Failed to load content: ' + (error.message || 'Unknown error'));
      }
      // Initialize with empty content structure to prevent further errors
      this.content = {
        hero: [],
        about: [],
        services: [],
        rooms: [],
        contact: [],
        header: []
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
    return this.getCurrentContent('header', 'main-logo', 'logo');
  }

  getCurrentHeroImages(): string[] {
    if (!this.content || !this.content['hero']) return [];
    
    return this.content['hero']
      .filter((item: ContentItem) => item.type === 'image' || item.type === 'gallery')
      .map((item: ContentItem) => item.optimizedUrl || item.value)
      .filter(Boolean);
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
      } else if (type === 'logo') {
        this.selectedLogo = file;
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
      const galleryImages: GalleryImage[] = this.selectedGalleryFiles.map(file => ({
        file,
        altText: ''
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
    if (!value) {
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

  // Get section location description
  getSectionLocation(sectionId: string): string {
    const locations: { [key: string]: string } = {
      'hero': 'Hero section (main banner at top of page)',
      'about': 'About section (below hero, shows staff, food, pool info)',
      'services': 'Services section (amenities and features)',
      'rooms': 'Rooms section (room showcase and gallery)',
      'contact': 'Contact section (contact information and form)'
    };
    return locations[sectionId] || 'Main content area';
  }

  clearFileInput(input: HTMLInputElement | null): void {
    if (input) {
      input.value = '';
    }
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
          value: 'Welcome to BC Flats',
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
          value: 'Experience luxury and comfort in our premium accommodations',
          publicId: undefined,
          altText: undefined,
          order: 2,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      'about': [
        {
          id: 3,
          section: 'about',
          type: 'text',
          key: 'title',
          value: 'About BC Flats',
          publicId: undefined,
          altText: undefined,
          order: 1,
          isActive: true,
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          section: 'about',
          type: 'text',
          key: 'description',
          value: 'We provide exceptional service and unforgettable experiences',
          publicId: undefined,
          altText: undefined,
          order: 2,
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
}

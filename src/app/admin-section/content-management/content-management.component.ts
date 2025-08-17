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
      this.content = await this.contentService.getAdminContent().toPromise(); // Use getAdminContent for admin view
      this.initializeTextContent();
    } catch (error) {
      this.alertService.error('Failed to load content');
      console.error('Error loading content:', error);
    } finally {
      this.loading = false;
    }
  }

  initializeTextContent(): void {
    // Initialize text content from loaded data
    this.sections.forEach(section => {
      if (this.content[section.id]) {
        this.content[section.id].forEach((item: ContentItem) => {
          if (item.type === 'text') {
            this.textContent[`${section.id}_${item.key}`] = item.value || '';
          }
        });
      }
    });
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
    } catch (error) {
      this.alertService.error('Failed to update logo');
      console.error('Error updating logo:', error);
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

  getContentBySection(section: string): ContentItem[] {
    return this.content[section] || [];
  }

  getContentByKey(section: string, key: string): ContentItem | null {
    const sectionContent = this.getContentBySection(section);
    return sectionContent.find(item => item.key === key) || null;
  }

  getOptimizedImageUrl(publicId: string, type: string = 'default'): string {
    return this.contentService.getOptimizedImageUrl(publicId, type);
  }

  clearFileInput(input: HTMLInputElement | null): void {
    if (input) {
      input.value = '';
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
}

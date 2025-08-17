import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContentItem {
  id?: number;
  section: string;
  type: 'image' | 'text' | 'logo' | 'gallery';
  key: string;
  value?: string;
  publicId?: string;
  altText?: string;
  order?: number;
  isActive?: boolean;
  metadata?: any;
  optimizedUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  file: File;
  altText?: string;
}

export interface ReorderData {
  id: number;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/content`;

  constructor(private http: HttpClient) { }

  // Get all content
  getAllContent(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get content by section
  getSectionContent(section: string): Observable<ContentItem[]> {
    return this.http.get<ContentItem[]>(`${this.apiUrl}/section/${section}`);
  }

  // Get content by key
  getContentByKey(section: string, key: string): Observable<ContentItem> {
    return this.http.get<ContentItem>(`${this.apiUrl}/${section}/${key}`);
  }

  // Upload image content
  uploadImage(section: string, key: string, file: File, altText?: string): Observable<ContentItem> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);
    formData.append('key', key);
    if (altText) {
      formData.append('altText', altText);
    }

    return this.http.post<ContentItem>(`${this.apiUrl}/upload-image`, formData);
  }

  // Update text content
  updateText(section: string, key: string, value: string): Observable<ContentItem> {
    return this.http.put<ContentItem>(`${this.apiUrl}/text`, {
      section,
      key,
      value
    });
  }

  // Update logo
  updateLogo(file: File, altText?: string): Observable<ContentItem> {
    const formData = new FormData();
    formData.append('logo', file);
    if (altText) {
      formData.append('altText', altText);
    }

    return this.http.post<ContentItem>(`${this.apiUrl}/logo`, formData);
  }

  // Update gallery
  updateGallery(section: string, images: GalleryImage[]): Observable<ContentItem[]> {
    const formData = new FormData();
    formData.append('section', section);
    
    images.forEach((image, index) => {
      formData.append('images', image.file);
      if (image.altText) {
        formData.append(`altText_${index}`, image.altText);
      }
    });

    return this.http.post<ContentItem[]>(`${this.apiUrl}/gallery`, formData);
  }

  // Reorder gallery items
  reorderGallery(section: string, orderData: ReorderData[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/gallery/reorder`, {
      section,
      orderData
    });
  }

  // Delete content
  deleteContent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get admin content (all content including inactive)
  getAdminContent(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`);
  }

  // Helper method to get optimized image URL
  getOptimizedImageUrl(publicId: string, type: string = 'default'): string {
    if (!publicId) return '';
    
    const transformations: { [key: string]: string } = {
      hero: 'w_1920,h_1080,c_fill,q_auto',
      thumbnail: 'w_300,h_200,c_fill,q_auto',
      room: 'w_800,h_600,c_fill,q_auto',
      logo: 'w_200,h_100,c_fit,q_auto',
      gallery: 'w_600,h_400,c_fill,q_auto',
      default: 'w_800,h_600,c_fill,q_auto'
    };

    const transform = transformations[type] || transformations.default;
    return `https://res.cloudinary.com/dsheuvqdc/image/upload/${transform}/${publicId}`;
  }

  // Helper method to get content by section and key
  getContent(section: string, key: string): Observable<ContentItem> {
    return this.getContentByKey(section, key);
  }

  // Helper method to get multiple content items by section
  getContentBySection(section: string): Observable<ContentItem[]> {
    return this.getSectionContent(section);
  }
}

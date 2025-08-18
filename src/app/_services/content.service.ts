import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Get content by section
  getSectionContent(section: string): Observable<ContentItem[]> {
    return this.http.get<ContentItem[]>(`${this.apiUrl}/section/${section}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get content by key
  getContentByKey(section: string, key: string): Observable<ContentItem> {
    return this.http.get<ContentItem>(`${this.apiUrl}/${section}/${key}`).pipe(
      catchError(this.handleError)
    );
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

    return this.http.post<ContentItem>(`${this.apiUrl}/upload-image`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Update text content
  updateText(section: string, key: string, value: string): Observable<ContentItem> {
    return this.http.put<ContentItem>(`${this.apiUrl}/text`, {
      section,
      key,
      value
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Update logo
  updateLogo(file: File, altText?: string): Observable<ContentItem> {
    const formData = new FormData();
    formData.append('logo', file);
    if (altText) {
      formData.append('altText', altText);
    }

    return this.http.post<ContentItem>(`${this.apiUrl}/logo`, formData).pipe(
      catchError(this.handleError)
    );
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

    return this.http.post<ContentItem[]>(`${this.apiUrl}/gallery`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Reorder gallery items
  reorderGallery(section: string, orderData: ReorderData[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/gallery/reorder`, {
      section,
      orderData
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete content
  deleteContent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get admin content (all content including inactive)
  getAdminContent(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`).pipe(
      catchError(this.handleError)
    );
  }

  // Reset all content to defaults (admin only)
  resetAll(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-all`, {}).pipe(
      catchError(this.handleError)
    );
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

    const transform = transformations[type] || transformations['default'];
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

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend is running.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Content Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

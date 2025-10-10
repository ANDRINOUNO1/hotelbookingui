import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for content loading requests to prevent blocking the landing page
    const skipLoading = this.shouldSkipLoading(req);
    
    if (!skipLoading) {
      this.activeRequests++;
      this.showLoading();
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (!skipLoading) {
          this.activeRequests--;
          if (this.activeRequests === 0) {
            this.hideLoading();
          }
        }
      })
    );
  }

  private shouldSkipLoading(req: HttpRequest<any>): boolean {
    // Skip loading for content management and initial page load requests
    const skipPatterns = [
      '/api/content',           // Content management API calls
      '/api/rooms',             // Room data loading
      '/api/bookings',          // Booking data loading
      '/api/contact-messages',  // Contact form submissions
      '/api/room-types',        // Room type data
      '/api/room-availability', // Room availability checks
    ];
    
    // Also skip for GET requests to content endpoints (initial page load)
    const isContentRequest = req.url.includes('/api/content') && req.method === 'GET';
    const isRoomDataRequest = (req.url.includes('/api/rooms') || req.url.includes('/api/room-types')) && req.method === 'GET';
    
    return skipPatterns.some(pattern => req.url.includes(pattern)) || 
           isContentRequest || 
           isRoomDataRequest;
  }

  private showLoading(): void {
    // Only show loading for critical user actions, not content loading
    if (this.activeRequests === 1) {
      document.body.classList.add('loading');
    }
  }

  private hideLoading(): void {
    // Remove loading class from body
    document.body.classList.remove('loading');
  }
}

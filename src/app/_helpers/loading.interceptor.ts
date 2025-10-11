import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingTimeout: any;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for ALL API requests - let components handle their own loading states
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
    // Skip loading for ALL API requests - components handle their own loading states
    const isApiRequest = req.url.includes('/api/');
    
    // Only show global loading for non-API requests (like external resources, etc.)
    return isApiRequest;
  }

  private showLoading(): void {
    // Only show loading for critical user actions, not content loading
    if (this.activeRequests === 1) {
      document.body.classList.add('loading');
      
      // Set a timeout to automatically hide loading after 30 seconds
      this.loadingTimeout = setTimeout(() => {
        console.warn('Loading timeout reached, forcing hide loading');
        this.hideLoading();
      }, 30000);
    }
  }

  private hideLoading(): void {
    // Remove loading class from body
    document.body.classList.remove('loading');
    
    // Clear timeout if it exists
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }
}

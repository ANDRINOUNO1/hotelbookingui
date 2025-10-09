import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.activeRequests++;
    
    // Show loading indicator
    this.showLoading();

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.hideLoading();
        }
      })
    );
  }

  private showLoading(): void {
    // Add loading class to body or show loading component
    document.body.classList.add('loading');
  }

  private hideLoading(): void {
    // Remove loading class from body or hide loading component
    document.body.classList.remove('loading');
  }
}

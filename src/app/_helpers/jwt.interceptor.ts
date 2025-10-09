import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecureStorageService } from '../_services/secure-storage.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private secureStorage: SecureStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if we're in a server-side rendering context
    const isSSR = typeof window === 'undefined';
    
    if (isSSR) {
      // During SSR/build time, skip JWT token handling
      return next.handle(request);
    }

    // Get the account from secure storage (only in browser)
    const account = this.secureStorage.getSecureItem('account');
    const token = account?.jwtToken;

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
} 
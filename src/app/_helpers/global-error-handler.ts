import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorModalService } from '../_services/error-modal.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const router = this.injector.get(Router);
    const errorModalService = this.injector.get(ErrorModalService);

    console.error('Global Error Handler:', error);

    // Handle different types of errors
    if (error?.status === 401) {
      // Unauthorized - redirect to login
      router.navigate(['/login']);
      errorModalService.showError({
        title: 'Session Expired',
        message: 'Your session has expired. Please login again.',
        type: 'warning'
      });
    } else if (error?.status === 403) {
      // Forbidden
      errorModalService.showError({
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        type: 'error'
      });
    } else if (error?.status === 404) {
      // Not found
      errorModalService.showError({
        title: 'Not Found',
        message: 'The requested resource was not found.',
        type: 'warning'
      });
    } else if (error?.status >= 500) {
      // Server error
      errorModalService.showServerError();
    } else if (error?.message?.includes('Network Error')) {
      // Network error
      errorModalService.showNetworkError();
    } else {
      // Generic error
      errorModalService.showError({
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        showRetry: true,
        retryText: 'Retry'
      });
    }
  }
}

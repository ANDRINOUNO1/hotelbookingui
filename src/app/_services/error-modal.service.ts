import { Injectable, ComponentRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { ErrorModalComponent, ErrorModalData } from '../_components/error-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {
  private modalRef?: ComponentRef<ErrorModalComponent>;
  private viewContainerRef?: ViewContainerRef;

  constructor() {}

  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  showError(data: ErrorModalData, viewContainerRef?: ViewContainerRef): Promise<void> {
    return new Promise((resolve) => {
      // Remove existing modal if any
      this.hideError();

      // Create modal component
      const container = viewContainerRef || this.viewContainerRef;
      if (!container) {
        console.error('No view container available for modal');
        resolve();
        return;
      }
      
      this.modalRef = container.createComponent(ErrorModalComponent);
      
      // Set modal data
      this.modalRef.instance.modalData = data;
      this.modalRef.instance.isVisible = true;

      // Handle close event
      this.modalRef.instance.closeModal.subscribe(() => {
        this.hideError();
        resolve();
      });

      // Handle retry event
      this.modalRef.instance.retryAction.subscribe(() => {
        if (data.showRetry) {
          // Emit retry event or call retry callback
          resolve();
        }
      });
    });
  }

  showSuccess(message: string, title?: string): Promise<void> {
    return this.showError({
      message,
      title,
      type: 'success',
      autoClose: true,
      autoCloseDelay: 3000
    });
  }

  showWarning(message: string, title?: string): Promise<void> {
    return this.showError({
      message,
      title,
      type: 'warning'
    });
  }

  showInfo(message: string, title?: string): Promise<void> {
    return this.showError({
      message,
      title,
      type: 'info',
      autoClose: true,
      autoCloseDelay: 4000
    });
  }

  showNetworkError(): Promise<void> {
    return this.showError({
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'error',
      showRetry: true,
      retryText: 'Try Again'
    });
  }

  showServerError(): Promise<void> {
    return this.showError({
      title: 'Server Error',
      message: 'A server error occurred. Please try again later or contact support if the problem persists.',
      type: 'error',
      showRetry: true,
      retryText: 'Retry'
    });
  }

  showValidationError(message: string): Promise<void> {
    return this.showError({
      title: 'Validation Error',
      message,
      type: 'warning'
    });
  }

  showLoginError(message: string = 'Invalid credentials. Please check your email and password.'): Promise<void> {
    return this.showError({
      title: 'Login Failed',
      message,
      type: 'error',
      showRetry: true,
      retryText: 'Try Again'
    });
  }

  showContactSuccess(): Promise<void> {
    return this.showSuccess(
      'Thank you for your message! We will get back to you within 24 hours.',
      'Message Sent Successfully'
    );
  }

  showContactError(): Promise<void> {
    return this.showError({
      title: 'Message Failed',
      message: 'Sorry, there was an error sending your message. Please try again or contact us directly.',
      type: 'error',
      showRetry: true,
      retryText: 'Try Again'
    });
  }

  hideError(): void {
    if (this.modalRef) {
      this.modalRef.destroy();
      this.modalRef = undefined;
    }
  }

  private getRootViewContainer(): ViewContainerRef {
    // This is a simplified approach - in a real app you might want to use
    // a more sophisticated method to get the root view container
    const appElement = document.querySelector('app-root');
    if (appElement) {
      // This would need to be properly implemented with Angular's view container
      // For now, we'll use a simpler approach
      return null as any;
    }
    return null as any;
  }
}

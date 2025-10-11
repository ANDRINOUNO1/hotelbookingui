import { Injectable, ComponentRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { ConfirmationModalComponent } from '../_components/confirmation-modal.component';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  private modalRef: ComponentRef<ConfirmationModalComponent> | null = null;
  private viewContainerRef: ViewContainerRef | null = null;

  constructor() {}

  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  showConfirmation(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // If there's already a modal open, close it first
      if (this.modalRef) {
        this.closeModal();
      }

      // Use the injected ViewContainerRef
      if (!this.viewContainerRef) {
        console.error('ViewContainerRef not set');
        resolve(false);
        return;
      }

      this.modalRef = this.viewContainerRef.createComponent(ConfirmationModalComponent);
      
      // Set modal properties
      this.modalRef.instance.title = options.title || 'Confirmation';
      this.modalRef.instance.message = options.message;
      this.modalRef.instance.confirmText = options.confirmText || 'OK';
      this.modalRef.instance.cancelText = options.cancelText || 'Cancel';
      this.modalRef.instance.type = options.type || 'info';

      // Handle events
      this.modalRef.instance.confirmed.subscribe(() => {
        this.closeModal();
        resolve(true);
      });

      this.modalRef.instance.cancelled.subscribe(() => {
        this.closeModal();
        resolve(false);
      });
    });
  }

  private closeModal() {
    if (this.modalRef) {
      this.modalRef.destroy();
      this.modalRef = null;
    }
  }

  // Convenience methods for common confirmation types
  confirmPayment(guestName: string): Promise<boolean> {
    return this.showConfirmation({
      title: 'Confirm Payment',
      message: `Are you sure you want to confirm payment for ${guestName}? This will send a payment confirmation email.`,
      confirmText: 'Confirm Payment',
      cancelText: 'Cancel',
      type: 'success'
    });
  }

  confirmDelete(itemName: string): Promise<boolean> {
    return this.showConfirmation({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
  }

  confirmReset(message: string): Promise<boolean> {
    return this.showConfirmation({
      title: 'Reset Confirmation',
      message: message,
      confirmText: 'Reset',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }
}

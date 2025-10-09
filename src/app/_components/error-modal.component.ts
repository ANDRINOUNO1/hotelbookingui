import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ErrorModalData {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  showRetry?: boolean;
  retryText?: string;
  showClose?: boolean;
  closeText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.active]="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="getIconClass()">
            <i [ngClass]="getIconName()"></i>
          </div>
          <h3 class="modal-title">{{ modalData.title || getDefaultTitle() }}</h3>
          <button class="modal-close" (click)="close()" *ngIf="modalData.showClose !== false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ modalData.message }}</p>
        </div>
        
        <div class="modal-footer">
          <button 
            *ngIf="modalData.showRetry" 
            class="btn btn-retry" 
            (click)="retry()">
            {{ modalData.retryText || 'Retry' }}
          </button>
          <button 
            class="btn btn-primary" 
            (click)="close()">
            {{ modalData.closeText || 'OK' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-container {
      background: var(--popup-bg, #ffffff);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      transform: scale(0.9) translateY(-20px);
      transition: all 0.3s ease;
    }

    .modal-overlay.active .modal-container {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      display: flex;
      align-items: center;
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid var(--popup-border, #e5e7eb);
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.5rem;
    }

    .modal-icon.error {
      background: #fef2f2;
      color: #dc2626;
    }

    .modal-icon.warning {
      background: #fffbeb;
      color: #d97706;
    }

    .modal-icon.info {
      background: #eff6ff;
      color: #2563eb;
    }

    .modal-icon.success {
      background: #f0fdf4;
      color: #16a34a;
    }

    .modal-title {
      flex: 1;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color, #1f2937);
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-color, #6b7280);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: var(--button-hover, #f3f4f6);
      color: var(--text-color, #374151);
    }

    .modal-body {
      padding: 1rem 1.5rem;
    }

    .modal-message {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--text-color, #374151);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid var(--popup-border, #e5e7eb);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      min-height: 44px;
      min-width: 44px;
    }

    .btn-primary {
      background: var(--accent-color, #2563eb);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-color-hover, #1d4ed8);
    }

    .btn-retry {
      background: var(--button-bg, #f3f4f6);
      color: var(--text-color, #374151);
      border: 1px solid var(--input-border, #d1d5db);
    }

    .btn-retry:hover {
      background: var(--button-hover, #e5e7eb);
    }

    /* Dark mode support */
    :host-context(.dark-mode) {
      --popup-bg: #1a1a2e;
      --popup-border: #2a2a3e;
      --text-color: #e6e6e6;
      --button-bg: #2a2a3e;
      --button-hover: #3a3a4e;
      --input-border: #4a4a5e;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .modal-container {
        width: 95%;
        margin: 1rem;
      }

      .modal-header {
        padding: 1rem;
      }

      .modal-body {
        padding: 0.75rem 1rem;
      }

      .modal-footer {
        padding: 0.75rem 1rem 1rem 1rem;
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ErrorModalComponent implements OnInit, OnDestroy {
  @Input() modalData: ErrorModalData = { message: '' };
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() retryAction = new EventEmitter<void>();

  private autoCloseTimer?: number;

  ngOnInit() {
    if (this.modalData.autoClose && this.modalData.autoCloseDelay) {
      this.autoCloseTimer = window.setTimeout(() => {
        this.close();
      }, this.modalData.autoCloseDelay);
    }
  }

  ngOnDestroy() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  close() {
    this.isVisible = false;
    this.closeModal.emit();
  }

  retry() {
    this.retryAction.emit();
    this.close();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  getIconClass(): string {
    return this.modalData.type || 'error';
  }

  getIconName(): string {
    const icons = {
      error: 'fa fa-exclamation-circle',
      warning: 'fa fa-exclamation-triangle',
      info: 'fa fa-info-circle',
      success: 'fa fa-check-circle'
    };
    return icons[this.modalData.type || 'error'];
  }

  getDefaultTitle(): string {
    const titles = {
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      success: 'Success'
    };
    return titles[this.modalData.type || 'error'];
  }
}

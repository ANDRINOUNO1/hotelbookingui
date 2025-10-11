import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fa fa-question-circle"></i>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>
        
        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-cancel" 
            (click)="onCancel()"
            [disabled]="loading">
            <i class="fa fa-times"></i>
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-confirm" 
            (click)="onConfirm()"
            [disabled]="loading">
            <i class="fa fa-spinner fa-spin" *ngIf="loading"></i>
            <i class="fa fa-check" *ngIf="!loading"></i>
            {{ confirmText }}
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
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 90%;
      margin: 20px;
      animation: slideIn 0.3s ease-out;
      border: 1px solid rgba(229, 192, 123, 0.2);
    }

    .modal-header {
      padding: 24px 24px 16px;
      text-align: center;
      border-bottom: 1px solid rgba(229, 192, 123, 0.1);
    }

    .modal-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #e5c07b 0%, #b4884d 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 16px rgba(229, 192, 123, 0.3);
    }

    .modal-icon i {
      font-size: 24px;
      color: #1a1a2e;
    }

    .modal-title {
      color: #e5c07b;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .modal-body {
      padding: 20px 24px;
    }

    .modal-message {
      color: #ffffff;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
      text-align: center;
    }

    .modal-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-cancel:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #e5c07b 0%, #b4884d 100%);
      color: #1a1a2e;
      border: 1px solid #e5c07b;
      box-shadow: 0 4px 12px rgba(229, 192, 123, 0.3);
    }

    .btn-confirm:hover:not(:disabled) {
      background: linear-gradient(135deg, #f0d090 0%, #c49a5a 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(229, 192, 123, 0.4);
    }

    .btn-confirm:active:not(:disabled) {
      transform: translateY(0);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .modal-container {
        width: 95%;
        margin: 10px;
      }
      
      .modal-header {
        padding: 20px 20px 12px;
      }
      
      .modal-body {
        padding: 16px 20px;
      }
      
      .modal-footer {
        padding: 12px 20px 20px;
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationModalComponent implements OnInit {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Are you sure?';
  @Input() confirmText: string = 'OK';
  @Input() cancelText: string = 'Cancel';
  @Input() loading: boolean = false;
  @Input() type: 'info' | 'warning' | 'danger' | 'success' = 'info';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit() {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'auto';
  }

  onConfirm() {
    if (!this.loading) {
      this.confirmed.emit();
    }
  }

  onCancel() {
    if (!this.loading) {
      this.cancelled.emit();
    }
  }
}

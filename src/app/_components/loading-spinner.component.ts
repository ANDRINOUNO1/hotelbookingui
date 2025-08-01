import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="spinner-container">
        <div class="spinner" [class]="size"></div>
        <div *ngIf="message" class="loading-message">{{ message }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --main-color: #0b0b31;
      --sub-color: #e5c07b;
      --accent-color: #b4884d;
      --white: #f5f5f7;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(11, 11, 49, 0.8);
      backdrop-filter: blur(4px);
      z-index: 9999;
      padding: 0;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 4rem;
      height: 4rem;
      border: 3px solid rgba(229, 192, 123, 0.3);
      border-top: 3px solid var(--sub-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-message {
      color: var(--white);
      font-size: 1.4rem;
      font-weight: 500;
      text-align: center;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Small spinner variant */
    .spinner.small {
      width: 2rem;
      height: 2rem;
      border-width: 2px;
    }

    /* Large spinner variant */
    .spinner.large {
      width: 6rem;
      height: 6rem;
      border-width: 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .spinner {
        width: 3rem;
        height: 3rem;
      }
      
      .loading-message {
        font-size: 1.2rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
} 
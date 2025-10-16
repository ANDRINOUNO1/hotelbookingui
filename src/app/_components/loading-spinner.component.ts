import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="spinner"></div>
      <div *ngIf="message" class="loading-text">{{ message }}</div>
    </div>
  `,
  styles: [`
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(5px);
      z-index: 9999;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(43, 101, 236, 0.1);
      border-top: 3px solid #b4884d;
      border-radius: 50%;
      animation: spin 1s ease-in-out infinite;
    }

    .loading-text {
      position: absolute;
      margin-top: 70px;
      color: #b4884d;
      font-size: 1rem;
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
} 
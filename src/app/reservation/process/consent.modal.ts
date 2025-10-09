import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consent-policy-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-modal" *ngIf="isOpen" (click)="close()">
      <div class="policy-content" (click)="$event.stopPropagation()">
        <h2>Data Collection Policy</h2>
        <div class="consent-text">
          <h3>Personal Information Collection:</h3>
          <ul>
            <li>We collect your personal information (name, email, phone, address) for reservation purposes.</li>
            <li>Your contact information will be used to send booking confirmations and updates.</li>
            <li>We may contact you regarding your stay or for customer service purposes.</li>
            <li>Your information is stored securely and used only for hotel-related services.</li>
          </ul>

          <h3>Data Usage & Privacy:</h3>
          <ul>
            <li>Your personal data will be used solely for reservation and hotel service purposes.</li>
            <li>We do not sell, trade, or share your personal information with third parties.</li>
            <li>Your data may be shared with payment processors for transaction purposes only.</li>
            <li>We retain your information for the duration of your stay and as required by law.</li>
          </ul>

          <h3>Your Rights:</h3>
          <ul>
            <li>You have the right to access, correct, or delete your personal information.</li>
            <li>You can withdraw consent at any time by contacting our customer service.</li>
            <li>You may request a copy of the data we hold about you.</li>
            <li>We will notify you of any changes to our privacy policy.</li>
          </ul>

          <h3>Security Measures:</h3>
          <ul>
            <li>All personal data is encrypted and stored securely.</li>
            <li>We implement industry-standard security measures to protect your information.</li>
            <li>Access to your data is restricted to authorized personnel only.</li>
            <li>Regular security audits are conducted to ensure data protection.</li>
          </ul>
        </div>
        <button class="btn btn-secondary" (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .policy-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .policy-content {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      width: 90%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4);
      animation: slideInUp 0.6s ease-out;
    }
    h2 {
      margin-top: 0;
      color: #171725;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 2rem;
      text-align: center;
      border-bottom: 3px solid #b4884d;
      padding-bottom: 15px;
    }
    .consent-text {
      margin-bottom: 2rem;
    }
    .consent-text h3 {
      color: #171725;
      font-size: 20px;
      font-weight: 700;
      margin: 25px 0 15px 0;
      border-left: 4px solid #b4884d;
      padding-left: 15px;
    }
    .consent-text ul {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }
    .consent-text li {
      color: #171725;
      font-size: 16px;
      margin-bottom: 12px;
      padding-left: 20px;
      position: relative;
      line-height: 1.6;
    }
    .consent-text li:before {
      content: '•';
      color: #b4884d;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .btn {
      background: linear-gradient(135deg, #b4884d 0%, #d4a574 50%, #e6c088 100%);
      color: #171725;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(180, 136, 77, 0.3);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(180, 136, 77, 0.5);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #555;
      border: 2px solid rgba(180, 136, 77, 0.3);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ConsentPolicyModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}

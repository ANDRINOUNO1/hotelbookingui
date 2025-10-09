import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-modal" *ngIf="isOpen" (click)="close()">
      <div class="policy-content" (click)="$event.stopPropagation()">
        <h2>Terms and Conditions</h2>
        <div class="consent-text">
          <h3>Reservation & Stay Terms:</h3>
          <ul>
            <li>All bookings are subject to room availability.</li>
            <li>Check-in time: 3:00 PM, Check-out time: 11:00 AM.</li>
            <li>Early check-in or late check-out may incur additional charges and is subject to availability.</li>
            <li>A valid government-issued ID is required at check-in.</li>
          </ul>

          <h3>Payment & Cancellation:</h3>
          <ul>
            <li>All payments are <strong>non-refundable</strong> once confirmed.</li>
            <li>Free cancellation up to 24 hours before check-in, unless otherwise stated.</li>
            <li>No-shows will be charged the full booking amount.</li>
          </ul>

          <h3>Guest Responsibilities:</h3>
          <ul>
            <li>Guests are responsible for any damage to hotel property.</li>
            <li>Smoking is strictly prohibited inside the rooms.</li>
            <li>Pets are not allowed unless specifically permitted.</li>
          </ul>

          <h3>Privacy Policy:</h3>
          <ul>
            <li>Your personal information will be used solely for reservation purposes and may be shared with third-party partners for booking or payment processing.</li>
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
export class TermsNConditionsModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
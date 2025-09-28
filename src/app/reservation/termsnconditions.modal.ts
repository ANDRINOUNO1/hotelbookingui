import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-page-container">
      <div class="top-bar">
        <button class="back-button" (click)="close()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1 class="page-title">Reservation Terms & Policy</h1>
      </div>

      <div class="terms-text">
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
        <p>Your personal information will be used solely for reservation purposes and may be shared with third-party partners for booking or payment processing.</p>

        <h3>Liability:</h3>
        <p>The hotel is not responsible for loss or damage to personal belongings. Guests are advised to secure valuables in provided safes.</p>
      </div>
    </div>
  `,
  styles: [`
    /* Add styles for the new page container and top bar */
    .terms-page-container {
      padding: 20px;
    }

    .top-bar {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #333; /* Or your theme color */
      margin-right: 16px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .terms-text {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        padding: 40px;
        max-width: 800px;
        width: 100%;
        margin: 0 auto; /* Center the text box */
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    /* Rest of your existing styles... */
    h3 {
        color: black;
        font-size: 20px;
        font-weight: 600;
        margin: 25px 0 15px 0;
        border-left: 4px solid blue;
        padding-left: 15px;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0 0 20px 0;
    }
    li {
        color: black;
        font-size: 14px;
        margin-bottom: 8px;
        padding-left: 20px;
        position: relative;
    }
    li:before {
        content: '•';
        color: blue;
        font-weight: bold;
        position: absolute;
        left: 0;
    }
    p {
        color: black;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 15px;
    }
  `]
})
export class TermsNConditionsModalComponent {
  // The [isOpen] input is no longer needed since *ngIf handles visibility
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
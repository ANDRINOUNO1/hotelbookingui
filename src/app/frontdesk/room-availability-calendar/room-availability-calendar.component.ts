import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomAvailabilityService, AvailabilityCalendar } from '../../_services/room-availability.service';

@Component({
  selector: 'app-room-availability-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <h2>Room Availability Calendar</h2>
        <div class="date-filters">
          <div class="form-group">
            <label for="startDate">Start Date:</label>
            <input 
              type="date" 
              id="startDate"
              [(ngModel)]="startDate" 
              (change)="loadCalendar()"
              class="form-control"
            >
          </div>
          <div class="form-group">
            <label for="endDate">End Date:</label>
            <input 
              type="date" 
              id="endDate"
              [(ngModel)]="endDate" 
              (change)="loadCalendar()"
              class="form-control"
            >
          </div>
          <div class="form-group">
            <label for="roomTypeFilter">Room Type:</label>
            <select 
              id="roomTypeFilter"
              [(ngModel)]="selectedRoomType" 
              (change)="loadCalendar()"
              class="form-control"
            >
              <option value="">All Types</option>
              <option value="1">Classic</option>
              <option value="2">Deluxe</option>
              <option value="3">Prestige</option>
              <option value="4">Luxury</option>
            </select>
          </div>
        </div>
      </div>

      <div class="calendar-content" *ngIf="!loading">
        <div class="room-grid">
          <div class="room-card" *ngFor="let room of calendarData">
            <div class="room-header">
              <h3>{{ room.roomNumber }}</h3>
              <span class="room-type">{{ room.roomType }}</span>
            </div>
            
            <div class="occupancy-timeline">
              <div class="timeline-header">
                <span>Occupancy Timeline</span>
              </div>
              
              <div class="timeline-content">
                <div 
                  class="occupancy-block" 
                  *ngFor="let occupancy of room.occupancy"
                  [class.active]="occupancy.status === 'active'"
                  [class.completed]="occupancy.status === 'completed'"
                  [class.cancelled]="occupancy.status === 'cancelled'"
                >
                  <div class="occupancy-info">
                    <strong>{{ occupancy.guestName }}</strong>
                    <div class="dates">
                      {{ formatDate(occupancy.checkIn) }} - {{ formatDate(occupancy.checkOut) }}
                    </div>
                    <div class="status">{{ occupancy.status }}</div>
                  </div>
                </div>
                
                <div class="no-occupancy" *ngIf="room.occupancy.length === 0">
                  <span>No bookings in this period</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading room availability...</p>
      </div>

      <div class="error" *ngIf="error">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .calendar-header {
      margin-bottom: 30px;
    }

    .calendar-header h2 {
      color: #171725;
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 600;
    }

    .date-filters {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #171725;
      font-size: 14px;
    }

    .form-control {
      padding: 10px 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
    }

    .room-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .room-card {
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      padding: 20px;
      background: #f8f9fa;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .room-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e1e5e9;
    }

    .room-header h3 {
      margin: 0;
      color: #171725;
      font-size: 18px;
      font-weight: 600;
    }

    .room-type {
      background: #007bff;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .occupancy-timeline {
      margin-top: 15px;
    }

    .timeline-header {
      margin-bottom: 10px;
      font-weight: 600;
      color: #171725;
      font-size: 14px;
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .occupancy-block {
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .occupancy-block.active {
      border-left-color: #28a745;
      background: #d4edda;
    }

    .occupancy-block.completed {
      border-left-color: #6c757d;
      background: #f8f9fa;
    }

    .occupancy-block.cancelled {
      border-left-color: #dc3545;
      background: #f8d7da;
    }

    .occupancy-info strong {
      display: block;
      color: #171725;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .dates {
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 4px;
    }

    .status {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .no-occupancy {
      text-align: center;
      padding: 20px;
      color: #6c757d;
      font-style: italic;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 20px;
      color: #dc3545;
      background: #f8d7da;
      border-radius: 8px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .date-filters {
        flex-direction: column;
      }
      
      .room-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RoomAvailabilityCalendarComponent implements OnInit {
  calendarData: AvailabilityCalendar[] = [];
  loading = false;
  error = '';
  
  startDate = '';
  endDate = '';
  selectedRoomType = '';

  constructor(private roomAvailabilityService: RoomAvailabilityService) {}

  ngOnInit() {
    // Set default dates (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate = startOfMonth.toISOString().split('T')[0];
    this.endDate = endOfMonth.toISOString().split('T')[0];
    
    this.loadCalendar();
  }

  loadCalendar() {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.loading = true;
    this.error = '';

    const roomTypeId = this.selectedRoomType ? parseInt(this.selectedRoomType) : undefined;

    this.roomAvailabilityService.getAvailabilityCalendar(
      this.startDate,
      this.endDate,
      roomTypeId
    ).subscribe({
      next: (data) => {
        this.calendarData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load room availability calendar';
        this.loading = false;
        console.error('Error loading calendar:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  }
} 
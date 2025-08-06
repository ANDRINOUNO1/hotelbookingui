import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChartsComponent } from '../shared/chart/charts.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Room, Booking } from '../../../_models/booking.model';
import { SharedService, DashboardAnalytics } from '../../../_services/shared.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboardchartview',
  standalone: true,
  imports: [CommonModule, ChartsComponent],
  templateUrl: './dashboardchartview.component.html',
  styleUrl: './dashboardchartview.component.scss'
})
export class DashboardchartviewComponent implements OnInit {
  isBrowser: boolean;
  rooms: Room[] = [];
  bookings: Booking[] = [];
  analytics: DashboardAnalytics | null = null;
  
  statusSummary: { label: string; count: number; icon: string; class: string }[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient,
    private sharedService: SharedService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    // Try to fetch analytics data first (now calculates from real data)
    this.sharedService.getDashboardAnalytics()
      .pipe(
        catchError(() => {
          console.log('Analytics API not available, calculating from database data');
          return of(null);
        })
      )
      .subscribe(analytics => {
        this.analytics = analytics;
        if (analytics) {
          this.updateStatusSummaryFromAnalytics();
        } else {
          // Fallback to individual API calls
          this.fetchIndividualData();
        }
      });
  }

  fetchIndividualData() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomData) => {
        this.rooms = roomData;
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingData) => {
            this.bookings = bookingData;
            this.updateStatusSummary();
          },
          error: (err) => console.error('Failed to load bookings:', err)
        });
      },
      error: (err) => console.error('Failed to load rooms:', err)
    });
  }

  updateStatusSummaryFromAnalytics() {
    if (!this.analytics) return;

    const roomStatusData = this.analytics.roomStatusDistribution;
    this.statusSummary = roomStatusData.map(item => ({
      label: item.name,
      count: item.count,
      icon: this.getIconForStatus(item.name),
      class: this.getClassForStatus(item.name)
    }));
  }

  updateStatusSummary() {
    const total = this.rooms.length;
    const reserved = this.bookings.filter(b => !b.pay_status).length;
    const occupied = this.bookings.filter(b => b.pay_status).length;
    const vacant = total - reserved - occupied;

    this.statusSummary = [
      { label: 'Vacant', count: vacant, icon: 'fa-bed', class: 'bg-blue-50' },
      { label: 'Reserved', count: reserved, icon: 'fa-check-circle', class: 'bg-green-50' },
      { label: 'Occupied', count: occupied, icon: 'fa-calendar-alt', class: 'bg-yellow-50' },
      { label: 'Total', count: total, icon: 'fa-dollar-sign', class: 'bg-red-50' }
    ];
  }

  private getIconForStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'vacant': return 'fa-bed';
      case 'reserved': return 'fa-check-circle';
      case 'occupied': return 'fa-calendar-alt';
      case 'total': return 'fa-dollar-sign';
      default: return 'fa-info-circle';
    }
  }

  private getClassForStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'vacant': return 'bg-blue-50';
      case 'reserved': return 'bg-green-50';
      case 'occupied': return 'bg-yellow-50';
      case 'total': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  }
}

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';
import { DashboardchartviewComponent } from './dashboardchartview/dashboardchartview.component';
import { SharedService, DashboardAnalytics } from '../../_services/shared.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DashboardchartviewComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  paymentChartOptions: any[] = [];
  rooms: any[] = [];
  bookings: any[] = [];
  analytics: DashboardAnalytics | null = null;
  private dataLoaded = false;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.dataLoaded) {
      this.fetchData();
    }
  }

  fetchData() {
    // Fetch analytics data from backend (now calculates from real data)
    this.sharedService.getDashboardAnalytics()
      .pipe(
        catchError(() => {
          console.log('Analytics API not available, calculating from database data');
          return of(null);
        })
      )
      .subscribe(analytics => {
        this.analytics = analytics;
        this.checkLoadingComplete();
      });

    // Always fetch rooms and bookings for fallback calculations
    this.http.get<any[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.checkLoadingComplete();
      }
    });
    
    this.http.get<any[]>(`${environment.apiUrl}/bookings`).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete() {
    // Hide loading after data is loaded
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  get vacantCount() {
    if (this.analytics) {
      const vacantData = this.analytics.roomStatusDistribution.find(item => item.name === 'Vacant');
      return vacantData ? vacantData.count : 0;
    }
    // Fallback calculation
    return this.rooms.filter(room => room.status === true).length;
  }

  get occupiedCount() {
    if (this.analytics) {
      const occupiedData = this.analytics.roomStatusDistribution.find(item => item.name === 'Occupied');
      return occupiedData ? occupiedData.count : 0;
    }
    // Fallback calculation
    return this.rooms.filter(room =>
      room.status === false ||
      this.bookings.some(b => b.room_id === room.id && b.pay_status == false)
    ).length;
  }

  get reservedCount() {
    if (this.analytics) {
      const reservedData = this.analytics.roomStatusDistribution.find(item => item.name === 'Reserved');
      return reservedData ? reservedData.count : 0;
    }
    // Fallback calculation
    return this.bookings.filter(b => !b.pay_status).length;
  }

  get allCount() {
    return this.rooms.length;
  }

  get statusSummary() {
    return [
      { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: this.vacantCount },
      { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: this.occupiedCount },
      { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: this.reservedCount },
      { label: 'All', icon: 'fa-list', class: 'status-all', count: this.allCount }
    ];
  }

  // Calculate analytics data
  get totalRevenue() {
    if (this.analytics) {
      return this.analytics.totalRevenue;
    }
    // Fallback calculation
    return this.bookings
      .filter(b => b.pay_status)
      .reduce((sum, booking) => sum + (booking.paidamount || 0), 0);
  }

  get occupancyRate() {
    if (this.analytics) {
      return this.analytics.occupancyRate;
    }
    // Fallback calculation
    if (this.rooms.length === 0) return 0;
    return Math.round((this.occupiedCount / this.rooms.length) * 100);
  }

  get averageStay() {
    if (this.analytics) {
      return this.analytics.averageStay;
    }
    // Fallback calculation
    if (this.bookings.length === 0) return 0;
    const totalDays = this.bookings.reduce((sum, booking) => {
      const checkIn = booking.availability?.check_in ? new Date(booking.availability.check_in) : null;
      const checkOut = booking.availability?.check_out ? new Date(booking.availability.check_out) : null;
      if (checkIn && checkOut) {
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);
    return Math.round((totalDays / this.bookings.length) * 10) / 10;
  }

  get customerRating() {
    // Simulated rating based on booking data
    const paidBookings = this.bookings.filter(b => b.pay_status);
    if (paidBookings.length === 0) return 4.5;
    const avgAmount = paidBookings.reduce((sum, b) => sum + (b.paidamount || 0), 0) / paidBookings.length;
    const baseRating = 4.0;
    const amountBonus = Math.min(avgAmount / 1000, 0.5);
    const frequencyBonus = Math.min(paidBookings.length / 10, 0.3);
    return Math.round((baseRating + amountBonus + frequencyBonus) * 10) / 10;
  }
}
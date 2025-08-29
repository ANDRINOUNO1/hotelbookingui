import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';
import { DashboardchartviewComponent } from './dashboardchartview/dashboardchartview.component';
import { SharedService, DashboardAnalytics } from '../../_services/shared.service';
import { catchError, of } from 'rxjs';
import { DashboardService } from '../../_services/dashboard.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, DashboardchartviewComponent],
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
  totalRooms = 0;
  availableRooms = 0;
  reservedRooms = 0;
  occupiedRooms = 0;
  otherRooms = 0;

  revenues: any[] = [];        // all revenue records
  filteredRevenue = 0;         // displayed sum after filtering
  selectedSource: string = 'All'; // dropdown selected value

  dropdownOpen = {
    available: false,
    reserved: false,
    occupied: false,
    other: false
  };

  availableBreakdown: { name: string, count: number }[] = [];
  reservedBreakdown: { name: string, count: number }[] = [];
  occupiedBreakdown: { name: string, count: number }[] = [];
  otherBreakdown: { name: string, count: number }[] = [];

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.dataLoaded) {
      this.fetchData();
    }

    this.loadRevenue();

    this.dashboardService.getRoomStatusDistribution().subscribe(data => {
      // Room status categories
      const availableStatuses = ['Vacant and Ready', 'Vacant and Clean'];
      const reservedStatuses = ['Reserved - Guaranteed', 'Reserved - Not Guaranteed'];
      const occupiedStatuses = [
        'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 'Cleaning in Progress',
        'Sleep Out', 'On Queue', 'Skipper', 'Lockout', 'Did Not Check Out',
        'Due Out', 'Check Out', 'Early Check In'
      ];

      // Breakdown arrays
      this.availableBreakdown = data.filter(item => availableStatuses.includes(item.name));
      this.reservedBreakdown = data.filter(item => reservedStatuses.includes(item.name));
      this.occupiedBreakdown = data.filter(item => occupiedStatuses.includes(item.name));
      this.otherBreakdown = data.filter(item =>
        !availableStatuses.includes(item.name) &&
        !reservedStatuses.includes(item.name) &&
        !occupiedStatuses.includes(item.name)
      );

      // Totals
      this.availableRooms = this.availableBreakdown.reduce((sum, item) => sum + item.count, 0);
      this.reservedRooms = this.reservedBreakdown.reduce((sum, item) => sum + item.count, 0);
      this.occupiedRooms = this.occupiedBreakdown.reduce((sum, item) => sum + item.count, 0);
      this.otherRooms = this.otherBreakdown.reduce((sum, item) => sum + item.count, 0);
      this.totalRooms = data.reduce((sum, item) => sum + item.count, 0);
    });
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
        console.log('Rooms data received:', rooms);
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
        console.log('Bookings data received:', bookings);
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
    // Vacant: rooms with isAvailable true and not booked
    const count = this.rooms.filter(room => room.isAvailable === true).length;
    console.log('Vacant count:', count, 'Total rooms:', this.rooms.length);
    return count;
  }

  get occupiedCount() {
    // Occupied: rooms with isAvailable false or with a checked-in booking
    const count = this.rooms.filter(room =>
      room.isAvailable === false ||
      this.bookings.some(b => b.room_id === room.id && b.status === 'checked_in')
    ).length;
    console.log('Occupied count:', count);
    return count;
  }

  get reservedCount() {
    // Reserved: bookings with status 'reserved' or pay_status false
    const count = this.bookings.filter(b => 
      b.status === 'reserved' || 
      (!b.status && !b.pay_status)
    ).length;
    console.log('Reserved count:', count, 'Total bookings:', this.bookings.length);
    return count;
  }

  get allCount() {
    return this.rooms.length;
  }

  toggleDropdown(type: 'available' | 'reserved' | 'occupied' | 'other') {
    this.dropdownOpen[type] = !this.dropdownOpen[type];
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

  loadRevenue() {
    this.http.get<any[]>(`${environment.apiUrl}/revenues`).subscribe({
      next: (data) => {
        this.revenues = data;
        this.filterRevenue(); // initialize with All
      },
      error: (err) => {
        console.error('❌ Failed to load revenue:', err);
      }
    });
  }

  filterRevenue() {
    if (this.selectedSource === 'All') {
      this.filteredRevenue = this.revenues.reduce(
        (sum, r) => sum + Number(r.amount) || 0,
        0
      );
    } else {
      this.filteredRevenue = this.revenues
        .filter(r => r.source === this.selectedSource)
        .reduce((sum, r) => sum + Number(r.amount) || 0, 0);
    }

    console.log("Filtered Revenue:", this.filteredRevenue, typeof this.filteredRevenue);
  }

}
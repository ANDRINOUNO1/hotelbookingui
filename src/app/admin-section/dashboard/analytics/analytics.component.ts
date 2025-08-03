import { Component, OnInit, Input, PLATFORM_ID, Inject, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <!-- Statistics Cards -->
      <div class="statistics-section">
        <h2 class="section-title">Key Performance Indicators</h2>
        <div class="statistics-grid">
          <div class="stat-card" *ngFor="let stat of statistics">
            <div class="stat-header">
              <h3 class="stat-title">{{ stat.title }}</h3>
              <div class="stat-trend" [class]="'trend-' + stat.trend">
                <i class="fa" [ngClass]="stat.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                <span>{{ stat.change }}</span>
              </div>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section" *ngIf="isBrowser">
        <div class="charts-grid">
          <!-- Pie Chart -->
          <div class="chart-card">
            <h3 class="chart-title">Room Status Distribution</h3>
            <div class="chart-container" [class.loaded]="chartsLoaded">
              <canvas #pieChartCanvas></canvas>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="chart-card">
            <h3 class="chart-title">Bookings per Room Type</h3>
            <div class="chart-container" [class.loaded]="chartsLoaded">
              <canvas #barChartCanvas></canvas>
            </div>
          </div>

          <!-- Line Chart -->
          <div class="chart-card full-width">
            <h3 class="chart-title">Revenue Over Time</h3>
            <div class="chart-container" [class.loaded]="chartsLoaded">
              <canvas #lineChartCanvas></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!isBrowser" class="ssr-message">
        <p>Charts are only available in the browser.</p>
      </div>
    </div>
  `,
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('pieChartCanvas', { static: false }) pieChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef;

  @Input() rooms: any[] = [];
  @Input() bookings: any[] = [];

  isBrowser = false;
  chartsLoaded = false;
  chartInstances: any[] = [];
  private initAttempts = 0;
  private maxInitAttempts = 5;

  statistics = [
    { title: 'Total Revenue', value: '$0', change: '+0%', trend: 'up' },
    { title: 'Occupancy Rate', value: '0%', change: '+0%', trend: 'up' },
    { title: 'Average Stay', value: '0 days', change: '+0%', trend: 'up' },
    { title: 'Customer Rating', value: '0/5', change: '+0%', trend: 'up' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.updateStatistics();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rooms'] || changes['bookings']) {
      this.updateStatistics();
      if (this.isBrowser) {
        this.initAttempts = 0;
        setTimeout(() => this.initCharts(), 200);
      }
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Multiple attempts to ensure charts load
      setTimeout(() => this.initCharts(), 100);
      setTimeout(() => this.initCharts(), 500);
      setTimeout(() => this.initCharts(), 1000);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.destroyCharts();
    }
  }

  private updateStatistics() {
    const totalRevenue = this.bookings
      .filter(b => b.pay_status)
      .reduce((sum, booking) => sum + (booking.paidamount || 0), 0);
    
    const occupancyRate = this.rooms.length === 0 ? 0 : 
      Math.round((this.rooms.filter(room => room.status === false).length / this.rooms.length) * 100);
    
    const averageStay = this.bookings.length === 0 ? 0 : 
      Math.round((this.bookings.reduce((sum, booking) => {
        const checkIn = booking.availability?.checkIn ? new Date(booking.availability.checkIn) : null;
        const checkOut = booking.availability?.checkOut ? new Date(booking.availability.checkOut) : null;
        if (checkIn && checkOut) {
          const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / this.bookings.length) * 10) / 10;
    
    const paidBookings = this.bookings.filter(b => b.pay_status);
    const customerRating = paidBookings.length === 0 ? 4.5 : 
      Math.round(((4.0 + Math.min((paidBookings.reduce((sum, b) => sum + (b.paidamount || 0), 0) / paidBookings.length) / 1000, 0.5) + Math.min(paidBookings.length / 10, 0.3)) * 10)) / 10;

    this.statistics = [
      { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+0%', trend: 'up' },
      { title: 'Occupancy Rate', value: `${occupancyRate}%`, change: '+0%', trend: 'up' },
      { title: 'Average Stay', value: `${averageStay} days`, change: '+2%', trend: 'up' },
      { title: 'Customer Rating', value: `${customerRating}/5`, change: '+0%', trend: 'up' }
    ];
  }

  private destroyCharts() {
    this.chartInstances.forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        try {
          chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
      }
    });
    this.chartInstances = [];
    this.chartsLoaded = false;
  }

  private async initCharts() {
    if (!this.isBrowser || this.initAttempts >= this.maxInitAttempts) return;
    
    this.initAttempts++;
    
    try {
      // Check if canvas elements exist and are ready
      if (!this.pieChartCanvas?.nativeElement || 
          !this.barChartCanvas?.nativeElement || 
          !this.lineChartCanvas?.nativeElement) {
        console.log(`Canvas elements not ready, attempt ${this.initAttempts}/${this.maxInitAttempts}`);
        return;
      }

      this.destroyCharts();
      
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      
      await this.createPieChart(Chart);
      await this.createBarChart(Chart);
      await this.createLineChart(Chart);
      
      this.chartsLoaded = true;
      console.log('Charts initialized successfully');
    } catch (error) {
      console.error('Error initializing charts:', error);
      if (this.initAttempts < this.maxInitAttempts) {
        setTimeout(() => this.initCharts(), 500);
      }
    }
  }

  private async createPieChart(Chart: any) {
    if (!this.pieChartCanvas?.nativeElement) return;
    
    const canvas = this.pieChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;
    
    const vacantCount = this.rooms.filter(r => r.status === true).length;
    const occupiedCount = this.rooms.filter(r => r.status === false).length;
    const reservedCount = this.bookings.filter(b => !b.pay_status).length;
    
    const data = [vacantCount, occupiedCount, reservedCount];
    const labels = ['Vacant', 'Occupied', 'Reserved'];
    const colors = ['#10B981', '#3B82F6', '#F59E0B'];
    
    this.chartInstances.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Room Status Distribution',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        }
      }
    }));
  }

  private async createBarChart(Chart: any) {
    if (!this.barChartCanvas?.nativeElement) return;
    
    const canvas = this.barChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;
    
    const roomTypeCounts: { [type: string]: number } = {};
    this.bookings.forEach(b => {
      const type = b.room?.RoomType?.type || 'Unknown';
      roomTypeCounts[type] = (roomTypeCounts[type] || 0) + 1;
    });
    
    const labels = Object.keys(roomTypeCounts);
    const data = Object.values(roomTypeCounts);
    
    this.chartInstances.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Bookings',
          data: data.length ? data : [0],
          backgroundColor: '#3B82F6',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          title: {
            display: true,
            text: 'Bookings per Room Type',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    }));
  }

  private async createLineChart(Chart: any) {
    if (!this.lineChartCanvas?.nativeElement) return;
    
    const canvas = this.lineChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = canvas.offsetHeight || 300;
    
    const revenueByDate: { [date: string]: number } = {};
    this.bookings.forEach(b => {
      const date = b.availability?.checkIn || 'Unknown';
      revenueByDate[date] = (revenueByDate[date] || 0) + (b.paidamount || 0);
    });
    
    const sortedDates = Object.keys(revenueByDate).sort();
    const data = sortedDates.map(date => revenueByDate[date]);
    
    this.chartInstances.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedDates.length ? sortedDates : ['No Data'],
        datasets: [{
          label: 'Revenue',
          data: data.length ? data : [0],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Revenue Over Time',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    }));
  }
} 
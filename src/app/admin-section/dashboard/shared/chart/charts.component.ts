import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Highcharts from 'highcharts';
import { SharedService, ChartDataItem, DashboardAnalytics } from '../../../../_services/shared.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'dashboard-ng19-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;
  isBrowser: boolean;
  private destroy$ = new Subject<void>();
  isLoading = true;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadChartData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChartData(): void {
    // Load monthly bookings data for area chart
    this.sharedService.getChartsData()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => this.sharedService.getMockChartsData())
      )
      .subscribe(data => {
        this.createAreaChart(data);
      });

    // Load room status distribution for pie chart
    this.sharedService.getRoomStatusDistribution()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([
          { name: 'Vacant', count: 70 },
          { name: 'Reserved', count: 15 },
          { name: 'Occupied', count: 15 }
        ]))
      )
      .subscribe(data => {
        this.createPieChart(data);
      });

    // Load revenue data for line chart
    this.sharedService.getRevenueData()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([
          { name: 'Jan', count: 1200 },
          { name: 'Feb', count: 1800 },
          { name: 'Mar', count: 2500 },
          { name: 'Apr', count: 2200 },
          { name: 'May', count: 3000 },
          { name: 'Jun', count: 3500 }
        ]))
      )
      .subscribe(data => {
        this.createLineChart(data);
      });

      this.sharedService.getPaymentMethodDistribution()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of([
          { name: 'GCash', count: 45 },
          { name: 'Maya', count: 25 },
          { name: 'Card', count: 20 },
          { name: 'Cash', count: 10 }
        ]))
      )
      .subscribe(data => {
        this.createPaymentPieChart(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  createAreaChart(data: ChartDataItem[]): void {
    const chartData = data.map(item => item.count);
    const categories = data.map(item => item.name);

    Highcharts.chart('areaChart', {
      chart: { 
        type: 'area',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Monthly Bookings',
        style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
      },
      xAxis: {
        categories: categories,
        labels: { style: { color: '#6B7280' } }
      },
      yAxis: {
        title: { text: 'Number of Bookings', style: { color: '#6B7280' } },
        labels: { style: { color: '#6B7280' } }
      },
      series: [{
        name: 'Bookings',
        data: chartData,
        type: 'area',
        color: '#3B82F6',
        fillOpacity: 0.3
      }],
      credits: { enabled: false },
      legend: { enabled: false }
    });
  }

  createPieChart(data: ChartDataItem[]): void {
    const pieData = data.map(item => ({
      name: item.name,
      y: item.count,
      color: this.getColorForStatus(item.name)
    }));

    Highcharts.chart('pieChart', {
      chart: { 
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Room Status Distribution',
        style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
      },
      series: [{
        data: pieData,
        type: 'pie'
      }],
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          }
        }
      }
    });
  }

  private getColorForStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'vacant': return '#10B981';
      case 'reserved': return '#3B82F6';
      case 'occupied': return '#F59E0B';
      default: return '#6B7280';
    }
  }

  createLineChart(data: ChartDataItem[]): void {
    const chartData = data.map(item => item.count);
    const categories = data.map(item => item.name);

    Highcharts.chart('lineChart', {
      chart: { 
        type: 'line',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Revenue Trend',
        style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
      },
      xAxis: {
        categories: categories,
        labels: { style: { color: '#6B7280' } }
      },
      yAxis: {
        title: { text: 'Revenue ($)', style: { color: '#6B7280' } },
        labels: { style: { color: '#6B7280' } }
      },
      series: [{
        name: 'Revenue',
        data: chartData,
        type: 'line',
        color: '#10B981',
        marker: {
          enabled: true,
          radius: 4
        }
      }],
      credits: { enabled: false },
      legend: { enabled: false }
    });
  }

  createPaymentPieChart(data: ChartDataItem[]): void {
    const pieData = data.map(item => ({
      name: item.name,
      y: item.count,
      color: this.getColorForPaymentMethod(item.name)
    }));

    Highcharts.chart('paymentPieChart', {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Payment Method Distribution',
        style: { color: '#374151', fontSize: '16px', fontWeight: 'bold' }
      },
      series: [{
        data: pieData,
        type: 'pie'
      }],
      credits: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          }
        }
      }
    });
  }

  private getColorForPaymentMethod(method: string): string {
    switch (method.toLowerCase()) {
      case 'gcash': return '#2D8EFF'; // GCash brand blue
      case 'maya': return '#00C4B3';  // Maya brand teal
      case 'card': return '#FFB800';  // Gold for cards
      case 'cash': return '#4CAF50';  // Green for cash
      default: return '#6B7280';      // Default gray
    }
  }
}
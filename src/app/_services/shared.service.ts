import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DashboardService } from './dashboard.service';

export interface ChartDataItem {
  name: string;
  count: number;
}

export interface DashboardAnalytics {
  monthlyBookings: ChartDataItem[];
  roomStatusDistribution: ChartDataItem[];
  revenueData: ChartDataItem[];
  occupancyRate: number;
  totalRevenue: number;
  averageStay: number;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService
  ) { }

  getChartsData(): Observable<ChartDataItem[]> {
    return this.dashboardService.getMonthlyBookings();
  }

  getRoomStatusDistribution(): Observable<ChartDataItem[]> {
    return this.dashboardService.getRoomStatusDistribution();
  }

  getRevenueData(): Observable<ChartDataItem[]> {
    return this.dashboardService.getRevenueData();
  }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.dashboardService.getDashboardAnalytics();
  }

  getPaymentMethodDistribution(): Observable<ChartDataItem[]> {
    return this.dashboardService.getPaymentMethodDistribution();
  }

  // Fallback method with mock data if API is not available
  getMockChartsData(): Observable<ChartDataItem[]> {
    const mockData: ChartDataItem[] = [
      { name: 'Jan', count: 10 },
      { name: 'Feb', count: 15 },
      { name: 'Mar', count: 20 },
      { name: 'Apr', count: 25 },
      { name: 'May', count: 30 },
      { name: 'Jun', count: 35 },
      { name: 'Jul', count: 40 },
      { name: 'Aug', count: 45 },
      { name: 'Sep', count: 50 },
      { name: 'Oct', count: 55 },
      { name: 'Nov', count: 60 },
      { name: 'Dec', count: 65 }
    ];
    
    return of(mockData);
  }
} 
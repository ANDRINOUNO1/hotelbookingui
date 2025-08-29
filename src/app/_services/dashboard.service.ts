import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChartDataItem, DashboardAnalytics } from './shared.service';
import { Room, Booking } from '../_models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getMonthlyBookings(): Observable<ChartDataItem[]> {
    return this.calculateMonthlyBookingsFromData();
  }

  getRoomStatusDistribution(): Observable<ChartDataItem[]> {
    return this.calculateRoomStatusFromData();
  }

  getRevenueData(): Observable<ChartDataItem[]> {
    return this.http.get<ChartDataItem[]>(`${environment.apiUrl}/revenues`)
      .pipe(
        catchError(() => {
          console.log('Revenue API not available, calculating from bookings data');
          return this.calculateRevenueFromData();
        })
      );
  }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
   return this.calculateAnalyticsFromData();
  }

  getPaymentMethodDistribution(): Observable<ChartDataItem[]> {
    return this.calculatePaymentMethodsFromData();
  }

  // Calculate monthly bookings from actual booking data
  private calculateMonthlyBookingsFromData(): Observable<ChartDataItem[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).pipe(
      map(bookings => {
        const monthlyData: { [key: string]: number } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize all months with 0
        months.forEach(month => {
          monthlyData[month] = 0;
        });

        // Count bookings by month
        bookings.forEach(booking => {
          if (booking.availability?.checkIn) {
            const checkInDate = new Date(booking.availability.checkIn);
            const monthName = months[checkInDate.getMonth()];
            monthlyData[monthName]++;
          }
        });

        return months.map(month => ({
          name: month,
          count: monthlyData[month]
        }));
      }),
      catchError(() => of(this.getMockMonthlyBookings()))
    );
  }

  // Calculate room status from actual rooms and bookings data
  private calculateRoomStatusFromData(): Observable<ChartDataItem[]> {
    return this.http.get<Room[]>(`${environment.apiUrl}/rooms`).pipe(
      map(rooms => {
        const statusCounts: { [key: string]: number } = {};
        rooms.forEach(room => {
          const status = room.roomStatus || 'Unknown';
          if (!statusCounts[status]) {
            statusCounts[status] = 0;
          }
          statusCounts[status]++;
        });
        return Object.keys(statusCounts).map(status => ({
          name: status,
          count: statusCounts[status]
        }));
      }),
      catchError(() => of(this.getMockRoomStatus()))
    );
  }
  getRoomStatusSummary(): Observable<{ total: number, available: number, reserved: number, occupied: number }> {
    return this.http.get<Room[]>(`${environment.apiUrl}/rooms`).pipe(
      map(rooms => {
        const availableStatuses = ['Vacant and Ready', 'Vacant and Clean'];
        const reservedStatuses = ['Reserved - Guaranteed', 'Reserved - Not Guaranteed'];
        const occupiedStatuses = [
          'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 'Cleaning in Progress',
          'Sleep Out', 'On Queue', 'Skipper', 'Lockout', 'Did Not Check Out',
          'Due Out', 'Check Out', 'Early Check In'
        ];

        let available = 0, reserved = 0, occupied = 0;
        rooms.forEach(room => {
          const status = room.roomStatus || '';
          if (availableStatuses.includes(status)) {
            available++;
          } else if (reservedStatuses.includes(status)) {
            reserved++;
          } else if (occupiedStatuses.includes(status)) {
            occupied++;
          }
        });

        return {
          total: rooms.length,
          available,
          reserved,
          occupied
        };
      })
    );
  }

  // Calculate revenue from actual booking data
  private calculateRevenueFromData(): Observable<ChartDataItem[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).pipe(
      map(bookings => {
        const monthlyRevenue: { [key: string]: number } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize all months with 0
        months.forEach(month => {
          monthlyRevenue[month] = 0;
        });

        // Calculate revenue by month (only paid bookings)
        bookings.filter(b => b.pay_status === true).forEach(booking => {
          if (booking.availability?.checkIn) {
            const checkInDate = new Date(booking.availability.checkIn);
            const monthName = months[checkInDate.getMonth()];
            monthlyRevenue[monthName] += booking.paidamount || 0;
          }
        });

        return months.map(month => ({
          name: month,
          count: monthlyRevenue[month]
        }));
      }),
      catchError(() => of(this.getMockRevenueData()))
    );
  }

  // Calculate comprehensive analytics from database data
  private calculateAnalyticsFromData(): Observable<DashboardAnalytics> {
    return forkJoin({
      rooms: this.http.get<Room[]>(`${environment.apiUrl}/rooms`),
      bookings: this.http.get<Booking[]>(`${environment.apiUrl}/bookings`)
    }).pipe(
      map(({ rooms, bookings }) => {
        // Calculate room status distribution
        const totalRooms = rooms.length;
        const occupiedBookings = bookings.filter(b => b.pay_status === true);
        const reservedBookings = bookings.filter(b => b.pay_status === false);
        const vacantRooms = Math.max(0, totalRooms - occupiedBookings.length - reservedBookings.length);

        const roomStatusDistribution = [
          { name: 'Vacant', count: vacantRooms },
          { name: 'Reserved', count: reservedBookings.length },
          { name: 'Occupied', count: occupiedBookings.length }
        ];

        // Calculate monthly bookings
        const monthlyBookings = this.calculateMonthlyBookings(bookings);

        // Calculate monthly revenue
        const monthlyRevenue = this.calculateMonthlyRevenue(bookings);

        // Calculate occupancy rate
        const occupancyRate = totalRooms > 0 ? Math.round(((occupiedBookings.length + reservedBookings.length) / totalRooms) * 100) : 0;

        // Calculate total revenue
        const totalRevenue = bookings
          .filter(b => b.pay_status === true)
          .reduce((sum, booking) => sum + (booking.paidamount || 0), 0);

        // Calculate average stay
        const averageStay = this.calculateAverageStay(bookings);

        return {
          monthlyBookings,
          roomStatusDistribution,
          revenueData: monthlyRevenue,
          occupancyRate,
          totalRevenue,
          averageStay
        };
      }),
      catchError(() => of(this.getMockDashboardAnalytics()))
    );
  }

  private calculateMonthlyBookings(bookings: Booking[]): ChartDataItem[] {
    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    bookings.forEach(booking => {
      if (booking.availability?.checkIn) {
        const checkInDate = new Date(booking.availability.checkIn);
        const monthName = months[checkInDate.getMonth()];
        monthlyData[monthName]++;
      }
    });

    return months.map(month => ({
      name: month,
      count: monthlyData[month]
    }));
  }

  private calculateMonthlyRevenue(bookings: Booking[]): ChartDataItem[] {
    const monthlyRevenue: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyRevenue[month] = 0;
    });

    bookings.filter(b => b.pay_status === true).forEach(booking => {
      if (booking.availability?.checkIn) {
        const checkInDate = new Date(booking.availability.checkIn);
        const monthName = months[checkInDate.getMonth()];
        monthlyRevenue[monthName] += booking.paidamount || 0;
      }
    });

    return months.map(month => ({
      name: month,
      count: monthlyRevenue[month]
    }));
  }

  private calculateAverageStay(bookings: Booking[]): number {
    if (bookings.length === 0) return 0;

    const totalDays = bookings.reduce((sum, booking) => {
      const checkIn = booking.availability?.checkIn ? new Date(booking.availability.checkIn) : null;
      const checkOut = booking.availability?.checkOut ? new Date(booking.availability.checkOut) : null;
      
      if (checkIn && checkOut) {
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);

    return Math.round((totalDays / bookings.length) * 10) / 10;
  }
  private calculatePaymentMethodsFromData(): Observable<ChartDataItem[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).pipe(
      map(bookings => {
        const paymentMethodData: { [key: string]: number } = {};

        // Iterate over bookings to count each payment method
        bookings.forEach(booking => {
          const paymentMode = booking.payment?.paymentMode;
          if (paymentMode) {
            if (!paymentMethodData[paymentMode]) {
              paymentMethodData[paymentMode] = 0;
            }
            paymentMethodData[paymentMode]++;
          }
        });

        return Object.keys(paymentMethodData).map(key => ({
          name: key,
          count: paymentMethodData[key]
        }));
      }),
      catchError(() => of(this.getMockPaymentMethods()))
    );
  }

  // Mock data methods for fallback
  private getMockMonthlyBookings(): ChartDataItem[] {
    return [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 18 },
      { name: 'Mar', count: 25 },
      { name: 'Apr', count: 22 },
      { name: 'May', count: 30 },
      { name: 'Jun', count: 35 },
      { name: 'Jul', count: 40 },
      { name: 'Aug', count: 38 },
      { name: 'Sep', count: 45 },
      { name: 'Oct', count: 50 },
      { name: 'Nov', count: 48 },
      { name: 'Dec', count: 55 }
    ];
  }

  private getMockRoomStatus(): ChartDataItem[] {
    return [
      { name: 'Vacant', count: 15 },
      { name: 'Reserved', count: 8 },
      { name: 'Occupied', count: 12 }
    ];
  }

  private getMockRevenueData(): ChartDataItem[] {
    return [
      { name: 'Jan', count: 1200 },
      { name: 'Feb', count: 1800 },
      { name: 'Mar', count: 2500 },
      { name: 'Apr', count: 2200 },
      { name: 'May', count: 3000 },
      { name: 'Jun', count: 3500 },
      { name: 'Jul', count: 4000 },
      { name: 'Aug', count: 3800 },
      { name: 'Sep', count: 4500 },
      { name: 'Oct', count: 5000 },
      { name: 'Nov', count: 4800 },
      { name: 'Dec', count: 5500 }
    ];
  }

  private getMockDashboardAnalytics(): DashboardAnalytics {
    return {
      monthlyBookings: this.getMockMonthlyBookings(),
      roomStatusDistribution: this.getMockRoomStatus(),
      revenueData: this.getMockRevenueData(),
      occupancyRate: 75,
      totalRevenue: 45000,
      averageStay: 3.2
    };
  }

  private getMockPaymentMethods(): ChartDataItem[] {
    return [
      { name: 'GCash', count: 45 },
      { name: 'Maya', count: 25 },
      { name: 'Card', count: 20 },
      { name: 'Cash', count: 10 }
    ];
  }
} 
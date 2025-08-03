import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChartsComponent } from '../shared/chart/charts.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Room, Booking } from '../../../_models/booking.model';

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
  
  statusSummary: { label: string; count: number; icon: string; class: string }[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
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
}

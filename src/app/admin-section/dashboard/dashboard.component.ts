import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AnalyticsComponent } from './analytics/analytics.component';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  rooms: any[] = [];
  bookings: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
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

  get statusSummary() {
    return [
      { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: this.vacantCount },
      { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: this.occupiedCount },
      { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: this.reservedCount },
      { label: 'All', icon: 'fa-list', class: 'status-all', count: this.allCount }
    ];
  }
}
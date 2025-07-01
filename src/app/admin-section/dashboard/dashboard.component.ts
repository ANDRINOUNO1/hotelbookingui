import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ROOMS } from '../../models/entities';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../booking.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;

  selectedTab: 'day' | 'week' | 'month' = 'day';
  lineChart!: Chart;
  doughnutChart!: Chart;

  rooms = ROOMS;
  bookings: Booking[] = [];

  constructor(private bookingService: BookingService) {
    this.bookings = this.bookingService.getBookings();
  }

  ngAfterViewInit() {
    this.renderLineChart();
    this.renderDoughnutChart();
  }

  selectTab(tab: 'day' | 'week' | 'month') {
    this.selectedTab = tab;
    this.updateLineChart();
  }

  renderLineChart() {
    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: this.getLineChartData(),
      options: { responsive: true }
    });
  }

  updateLineChart() {
    this.lineChart.data = this.getLineChartData();
    this.lineChart.update();
  }

  getLineChartData() {
    // Replace with your real data logic
    const labels = this.selectedTab === 'day'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : this.selectedTab === 'week'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = this.selectedTab === 'day'
      ? [12, 19, 3, 5, 2, 3, 7]
      : this.selectedTab === 'week'
        ? [50, 60, 70, 80]
        : [200, 150, 180, 220, 170, 210];
    return {
      labels,
      datasets: [{
        label: 'Traffic',
        data,
        borderColor: '#009688',
        backgroundColor: 'rgba(0,150,136,0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  renderDoughnutChart() {
    this.doughnutChart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Direct', 'Referral', 'Social'],
        datasets: [{
          data: [55, 25, 20],
          backgroundColor: ['#009688', '#b4884d', '#e5c07b']
        }]
      },
      options: { responsive: true }
    });
  }

  get vacantCount() {
    // Vacant: rooms with status true and not booked
    return this.rooms.filter(room => room.status === true).length;
  }

  get occupiedCount() {
    // Occupied: rooms with status false or with a paid booking
    return this.rooms.filter(room =>
      room.status === false ||
      this.bookings.some(b => b.room_id === room.id && b.pay_status)
    ).length;
  }

  get reservedCount() {
    // Reserved: rooms with a booking that is not yet paid (pay_status === false)
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
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  statusSummary = [
    { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: 5 },
    { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: 27 },
    { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: 8 },
    { label: 'Out of Order', icon: 'fa-ban', class: 'status-outoforder', count: 0 },
    { label: 'Due Out', icon: 'fa-clock', class: 'status-dueout', count: 4 },
    { label: 'Dirty', icon: 'fa-broom', class: 'status-dirty', count: 0 },
    { label: 'All', icon: 'fa-list', class: 'status-all', count: 42 }
  ];
}

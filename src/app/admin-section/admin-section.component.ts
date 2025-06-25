import { Component, Renderer2 } from '@angular/core';

interface Room {
  number: string;
  type: string;
  guest: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'dueout' | 'dirty' | 'outoforder';
}

@Component({
  selector: 'app-hotel-dashboard',
  templateUrl: './admin-section.component.html',
  styleUrls: ['./admin-section.component.scss'],
})
export class HotelDashboardComponent {
  hotelName = 'eZee BC Flats - eZee FrontDesk Demo';
  user = 'Admin';

  statusSummary = [
    { label: 'Vacant', icon: 'fa-bed', class: 'status-vacant', count: 5 },
    { label: 'Occupied', icon: 'fa-bed', class: 'status-occupied', count: 27 },
    { label: 'Reserved', icon: 'fa-calendar-check', class: 'status-reserved', count: 8 },
    { label: 'Out of Order', icon: 'fa-ban', class: 'status-outoforder', count: 0 },
    { label: 'Due Out', icon: 'fa-clock', class: 'status-dueout', count: 4 },
    { label: 'Dirty', icon: 'fa-broom', class: 'status-dirty', count: 0 },
    { label: 'All', icon: 'fa-list', class: 'status-all', count: 42 }
  ];

  rooms: Room[] = [
    { number: '101', type: 'Delux', guest: 'eric dosdos', status: 'occupied' },
    { number: '102', type: 'Delux', guest: 'Michael Hermosa', status: 'occupied' },
    { number: '103', type: 'Delux', guest: 'Julian Buntis', status: 'occupied' },
    { number: '104', type: 'Delux', guest: 'Lourd Mendosa', status: 'vacant' },
    { number: '105', type: 'Delux', guest: 'Yamilo Yams', status: 'reserved' },
    { number: '106', type: 'Delux', guest: 'Harry Scougall', status: 'dueout' },
    { number: '107', type: 'Delux', guest: 'Sutton Summerell', status: 'dirty' },
    { number: '108', type: 'Delux', guest: 'Kein Andrew', status: 'outoforder' }
  ];

  roomTabs = ['First Floor', 'Second Floor', 'Top Floor'];
  selectedTab = 0;

  isDarkMode = false;

  constructor(private renderer: Renderer2) {}

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }
}
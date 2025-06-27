import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Room {
  number: string;
  type: string;
  guest: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'dueout' | 'dirty' | 'outoforder';
}

@Component({
  selector: 'app-rooms',
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})

export class RoomsComponent {
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
}

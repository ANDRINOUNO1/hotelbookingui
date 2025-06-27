import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirstFloorComponent } from './first-floor/first-floor.component';
import { SecondFloorComponent } from './second-floor/second-floor.component';
import { ThirdFloorComponent } from './third-floor/third-floor.component';
import { FourthFloorComponent } from './fourth-floor/fourth-floor.component';


interface Room {
  number: string;
  type: string;
  guest: string;
  status: 'occupied' | 'vacant' | 'reserved' | 'dueout' | 'dirty' | 'outoforder';
  floor: number;
}

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FirstFloorComponent, SecondFloorComponent, ThirdFloorComponent, FourthFloorComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})

export class RoomsComponent {
  rooms: Room[] = [
    { number: '101', type: 'Classic', guest: 'eric dosdos', status: 'occupied', floor: 1 },
    { number: '102', type: 'Deluxe', guest: 'Michael Hermosa', status: 'occupied', floor: 2 },
    { number: '103', type: 'Prestige', guest: 'Julian Buntis', status: 'occupied', floor: 3 },
    { number: '104', type: 'Luxury', guest: 'Lourd Mendosa', status: 'vacant', floor: 4},
    { number: '105', type: 'Classic', guest: 'Yamilo Yams', status: 'reserved', floor: 1 },
    { number: '106', type: 'Deluxe', guest: 'Harry Scougall', status: 'dueout', floor: 2 },
    { number: '107', type: 'Prestige', guest: 'Sutton Summerell', status: 'dirty', floor: 3 },
    { number: '108', type: 'Luxury', guest: 'Kein Andrew', status: 'outoforder', floor: 4 }
  ];

  roomTabs = ['First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'];
  selectedTab = 0;

  get firstFloorRooms() {
    return this.rooms.filter(r => r.floor === 1);
  }
  get secondFloorRooms() {
    return this.rooms.filter(r => r.floor === 2);
  }
  get thirdFloorRooms() {
    return this.rooms.filter(r => r.floor === 3);
  }
  get fourthFloorRooms() {
    return this.rooms.filter(r => r.floor === 4);
  }
}

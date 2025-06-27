import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-second-floor',
  imports: [CommonModule],
  templateUrl: './second-floor.component.html',
  styleUrl: './second-floor.component.scss'
})
export class SecondFloorComponent {
  @Input() rooms: any[] = [];
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-first-floor',
  imports: [CommonModule],
  templateUrl: './first-floor.component.html',
  styleUrl: './first-floor.component.scss'
})
export class FirstFloorComponent {
  @Input() rooms: any[] = [];
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-third-floor',
  imports: [CommonModule],
  templateUrl: './third-floor.component.html',
  styleUrl: './third-floor.component.scss'
})
export class ThirdFloorComponent {
  @Input() rooms: any[] = [];
}

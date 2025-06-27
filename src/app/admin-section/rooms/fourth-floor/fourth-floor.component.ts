import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fourth-floor',
  imports: [CommonModule],
  templateUrl: './fourth-floor.component.html',
  styleUrl: './fourth-floor.component.scss'
})
export class FourthFloorComponent {
  @Input() rooms: any[] = [];
}

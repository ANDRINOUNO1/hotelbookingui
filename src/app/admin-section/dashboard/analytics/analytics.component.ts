import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineComponent } from './line/line.component';
import { DonutComponent } from './donut/donut.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LineComponent, DonutComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {}
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-line',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './line.component.html',
  styleUrl: './line.component.scss'
})
export class LineComponent implements AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  linechart: any;

  public lineChart: any = {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Monthly Sales',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#4bc0c0',
          tension: 0.1
        }
      ]
    },
  }

  ngAfterViewInit(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.linechart = new Chart(ctx, this.lineChart);
    }
  }
}
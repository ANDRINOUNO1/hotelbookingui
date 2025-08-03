import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Highcharts from 'highcharts';
import { SharedService, ChartDataItem } from '../../../../_services/shared.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'dashboard-ng19-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="h-96">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">Monthly Data Overview</h3>
        <div id="areaChart" class="w-full h-full"></div>
      </div>
      <div class="h-96">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">Pie Chart Analytics</h3>
        <div id="pieChart" class="w-full h-full"></div>
      </div>
    </div>
  `
})
export class ChartsComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      Highcharts.chart('areaChart', {
        chart: { type: 'area' },
        series: [{ data: [3, 2, 3, 1, 5], type: 'area' }]
      });

      Highcharts.chart('pieChart', {
        chart: { type: 'pie' },
        series: [{
          data: [
            { name: 'Vacant', y: 70.67, color: '#90d300ff' },
            { name: 'Reserved', y: 14.77, color: '#00126dff' },
            { name: 'Occupied', y: 10.56, color: '#b94400ff' }
          ],
          type: 'pie'
        }]
      });
    }
  }
}
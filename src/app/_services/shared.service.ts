import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ChartDataItem {
  name: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  
  constructor() { }

  getChartsData(): Observable<ChartDataItem[]> {
    // Mock data - replace with actual API call
    const mockData: ChartDataItem[] = [
      { name: 'Jan', count: 10 },
      { name: 'Feb', count: 15 },
      { name: 'Mar', count: 20 },
      { name: 'Apr', count: 25 },
      { name: 'May', count: 30 },
      { name: 'Jun', count: 35 },
      { name: 'Jul', count: 40 },
      { name: 'Aug', count: 45 },
      { name: 'Sep', count: 50 },
      { name: 'Oct', count: 55 },
      { name: 'Nov', count: 60 },
      { name: 'Dec', count: 65 }
    ];
    
    return of(mockData);
  }
} 
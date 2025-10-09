import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitoringService {
  private performanceObserver?: PerformanceObserver;

  constructor() {
    if (environment.enablePerformanceMonitoring && 'PerformanceObserver' in window) {
      this.initializePerformanceMonitoring();
    }
  }

  private initializePerformanceMonitoring(): void {
    try {
      // Monitor Core Web Vitals
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logPerformanceMetric(entry);
        }
      });

      // Observe different types of performance entries
      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  private logPerformanceMetric(entry: PerformanceEntry): void {
    const metric = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now()
    };

    // Log to console in development, send to analytics in production
    if (environment.production) {
      this.sendToAnalytics(metric);
    } else {
      console.log('Performance Metric:', metric);
    }
  }

  private sendToAnalytics(metric: any): void {
    // Implement analytics service integration here
    // Example: Google Analytics, Mixpanel, etc.
    console.log('Sending performance metric to analytics:', metric);
  }

  // Manual performance measurement
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    const duration = end - start;
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    return result;
  }

  // Measure async operations
  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    const duration = end - start;
    console.log(`Async Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    return result;
  }

  // Get page load metrics
  getPageLoadMetrics(): any {
    if (!('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint()
    };
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

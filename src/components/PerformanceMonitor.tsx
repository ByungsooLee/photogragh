'use client';

import { useEffect } from 'react';
import { onCLS, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals';
import { sendToAnalytics, getMetricRating, logPerformanceMetrics } from '@/utils/performance';

const PerformanceMonitor = () => {
  useEffect(() => {
    const metrics: Array<{
      name: string;
      value: number;
      rating: 'good' | 'needs-improvement' | 'poor';
    }> = [];

    const handleMetric = (metric: Metric) => {
      const rating = getMetricRating({
        name: metric.name,
        value: metric.value,
        rating: 'good',
      });

      metrics.push({
        name: metric.name,
        value: metric.value,
        rating: rating as 'good' | 'needs-improvement' | 'poor',
      });

      // Log only in development.
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics);
      }

      // Send to analytics in production.
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(metric);
      }
    };

    // Start measuring Web Vitals.
    onCLS(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric); // Use INP instead of FID.

    // Observe performance entries.
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.initiatorType === 'img') {
              console.log(`Image load time: ${resourceEntry.duration}ms`, resourceEntry.name);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor; 
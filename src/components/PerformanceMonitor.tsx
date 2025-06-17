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

      // 開発環境でのみコンソールに出力
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics);
      }

      // 本番環境ではアナリティクスに送信
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(metric);
      }
    };

    // Web Vitalsの計測を開始
    onCLS(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric); // FIDの代わりにINPを使用

    // パフォーマンスエントリの監視
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
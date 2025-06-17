import { Metric } from 'web-vitals';

type MetricType = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithNetwork extends Navigator {
  connection?: NetworkInformation;
}

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed(): string {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as NavigatorWithNetwork).connection;
    return connection?.effectiveType || '';
  }
  return '';
}

export function sendToAnalytics(metric: Metric) {
  const body: Record<string, string> = {
    dsn: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
}

export function getMetricRating(metric: MetricType): string {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric.name as keyof typeof thresholds];
  if (!threshold) return 'unknown';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

export function logPerformanceMetrics(metrics: MetricType[]) {
  console.group('Performance Metrics');
  metrics.forEach((metric) => {
    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${
        metric.rating === 'good'
          ? '#4CAF50'
          : metric.rating === 'needs-improvement'
          ? '#FFC107'
          : '#F44336'
      }`
    );
  });
  console.groupEnd();
}

export const measurePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    console.log({
      'DOM読み込み時間': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      'ページ読み込み時間': navigation.loadEventEnd - navigation.loadEventStart,
      'First Contentful Paint': performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    });
  }
}; 
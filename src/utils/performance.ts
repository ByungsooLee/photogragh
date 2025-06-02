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
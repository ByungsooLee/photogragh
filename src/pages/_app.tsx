import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // パフォーマンスモニタリングの初期化
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance monitoring initialized');
    }
  }, []);

  return (
    <>
      <PerformanceMonitor />
      <Component {...pageProps} />
    </>
  );
} 
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LoadingScreen from '../components/LoadingScreen';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'L.MARK - Professional Photography Portfolio',
  description: 'BML Studio presents L.MARK - A curated collection of professional photography',
  openGraph: {
    title: 'L.MARK Photography',
    description: 'Professional photography portfolio',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className={inter.className}>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}

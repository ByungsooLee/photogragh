import type { Metadata } from 'next';
import './globals.css';
import { GlobalStyle } from '@/lib/styled-components';
import StyledComponentsRegistry from '@/lib/registry';
import { Noto_Serif_JP, Bebas_Neue, Inter } from 'next/font/google';

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-noto-serif-jp',
});
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bebas-neue',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bml-studio.com'),
  title: 'L.MARK Photography - Professional Photography Studio',
  description: 'プロフェッショナルな写真撮影スタジオ。ポートレート、商品撮影、イベント撮影など幅広く対応',
  authors: [{ name: 'L.MARK Photography' }],
  openGraph: {
    type: 'website',
    url: 'https://www.bml-studio.com/',
    title: 'L.MARK Photography',
    description: 'プロフェッショナルな写真撮影スタジオ。あなたの大切な瞬間を美しく記録します。',
    images: [
      {
        url: '/images/ogp-image.jpg',
        width: 1200,
        height: 630,
        alt: 'L.MARK Photography'
      }
    ],
    siteName: 'L.MARK Photography',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'L.MARK Photography',
    description: 'プロフェッショナルな写真撮影スタジオ。あなたの大切な瞬間を美しく記録します。',
    images: ['/images/ogp-image.jpg']
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${bebasNeue.variable} ${inter.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

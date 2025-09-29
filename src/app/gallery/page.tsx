'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getAllGallery, type GalleryItem } from '@/lib/microcms';
import React from 'react';
import Header from '@/components/Header';
import { CustomSelect } from '@/components/CustomSelect';
import GalleryLoadingScreen from '@/components/GalleryLoadingScreen';
import Head from 'next/head';

// スタイル定義
const GalleryContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #000;
  color: #fff;
  overflow: hidden;
  padding-top: 80px;
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  cursor: grab;
  padding-top: 40px;
  &:active {
    cursor: grabbing;
  }

  @media (max-width: 768px) {
    height: 100svh;
    padding-top: 30px;
    padding-bottom: 120px;
  }
`;

const ImageWrapper = styled.div<{ $isTransitioning: boolean; $translateX: number; $isLoading: boolean }>`
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isTransitioning ? 'scale(0.98)' : 'scale(1)'} translateX(${props => props.$translateX}px);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  touch-action: none;
  opacity: ${props => props.$isLoading ? 0.5 : 1};

  @media (max-width: 768px) {
    height: calc(100% - 30px);
  }
`;

const StyledImage = styled(Image)<{ $isLoading?: boolean }>`
  object-fit: contain !important;
  max-width: 100% !important;
  max-height: 90vh !important;
  width: auto !important;
  height: auto !important;
  position: relative !important;
  margin: auto !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.$isLoading ? 0 : 1};

  @media (max-width: 768px) {
    max-height: 65vh !important;
    max-width: 85vw !important;
  }
`;

// プレビュー画像用のスタイル
const PreviewImage = styled(Image)`
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  filter: blur(20px) !important;
  transform: scale(1.1) !important;
  transition: opacity 0.3s ease-in-out !important;
`;

const ThumbnailContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  z-index: 100;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    height: 90px;
    padding: 0 15px;
  }
`;

const ThumbnailWrapper = styled.div<{ $isActive: boolean }>`
  position: relative;
  min-width: 140px;
  height: 80px;
  margin-right: 8px;
  cursor: pointer;
  opacity: ${props => props.$isActive ? 1 : 0.5};
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$isActive ? '#fff' : 'transparent'};

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    height: 70px;
    margin-right: 6px;
  }
`;

const CategoryContainer = styled.div`
  position: fixed;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 20;
  transform: none;
  padding: 0 8px;
  box-sizing: border-box;
  @media (max-width: 599px) {
    top: 68px;
    padding: 0 6px;
  }
  @media (min-width: 600px) {
    justify-content: flex-start;
    align-items: flex-start;
    padding-left: 24px;
  }
  @media (min-width: 1025px) {
    top: 100px;
    left: 20px;
    width: auto;
    display: block;
    justify-content: flex-start;
    transform: scale(0.85);
    transform-origin: top left;
    z-index: 10;
    padding: 0;
  }
`;

// タイトル用のスタイルを追加
const MainImageTitle = styled.div`
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  text-align: center;
  font-size: 1.6rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  letter-spacing: 0.08em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  background: rgba(0,0,0,0.25);
  padding: 8px 32px;
  border-radius: 24px;
  z-index: 10;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  max-width: 80%;
  z-index: 100;
`;

const RetryButton = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }
`;

// 画像URLバリデーション関数
function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// imageUrlsが{"オリジナル画像":...}のJSON文字列や配列の場合に対応
function getOriginalImageUrl(imageUrls: string | string[] | undefined): string | undefined {
  if (!imageUrls) return undefined;
  if (Array.isArray(imageUrls)) return getOriginalImageUrl(imageUrls[0]);
  try {
    const obj = JSON.parse(imageUrls);
    if (typeof obj === 'object' && obj['オリジナル画像']) {
      return obj['オリジナル画像'];
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// 画像URLのJSONから最適なサイズを取得する関数を追加
function getResponsiveImageUrls(imageUrls: string | string[] | undefined): { large?: string, medium?: string, small?: string, original?: string } {
  if (!imageUrls) return {};
  if (Array.isArray(imageUrls)) return getResponsiveImageUrls(imageUrls[0]);
  try {
    const obj = JSON.parse(imageUrls);
    return {
      large: obj['大サイズ'],
      medium: obj['中サイズ'],
      small: obj['小サイズ'],
      original: obj['オリジナル画像'],
    };
  } catch {
    return {};
  }
}

// --- ギャラリー専用ローディング進捗管理 ---
const useGalleryLoading = (photoUrls: string[], onAllLoaded: () => void) => {
  const [progress, setProgress] = useState(0);
  const loadedSet = useRef<Set<string>>(new Set());
  const preloadStarted = useRef(false);

  useEffect(() => {
    if (photoUrls.length === 0) return;
    setProgress(0);
    loadedSet.current.clear();
    preloadStarted.current = false;
    // デバッグ用: プリロード対象のURLリストを出力
    // console.log('[GalleryLoading] Preload target URLs:', photoUrls);
  }, [photoUrls]);

  // プリロード専用ロジック
  useEffect(() => {
    if (photoUrls.length === 0 || preloadStarted.current) return;
    preloadStarted.current = true;
    photoUrls.forEach((url) => {
      if (!loadedSet.current.has(url)) {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          if (!loadedSet.current.has(url)) {
            loadedSet.current.add(url);
            setProgress(Math.round((loadedSet.current.size / photoUrls.length) * 100));
            if (loadedSet.current.size === photoUrls.length) {
              onAllLoaded();
            }
          }
        };
        img.onerror = () => {
          if (!loadedSet.current.has(url)) {
            loadedSet.current.add(url);
            setProgress(Math.round((loadedSet.current.size / photoUrls.length) * 100));
            if (loadedSet.current.size === photoUrls.length) {
              onAllLoaded();
            }
          }
        };
      }
    });
  }, [photoUrls, onAllLoaded]);

  // 既存のonLoadハンドラも維持
  const handleImageLoad = useCallback((url: string) => {
    if (!loadedSet.current.has(url)) {
      loadedSet.current.add(url);
      setProgress(Math.round((loadedSet.current.size / photoUrls.length) * 100));
      if (loadedSet.current.size === photoUrls.length) {
        onAllLoaded();
      }
    }
  }, [photoUrls.length, onAllLoaded]);

  return { progress, handleImageLoad };
};

// カテゴリー・月選択UIのラッパー
const CategoryMonthWrapper = styled.div`
  width: 100%;
  max-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 4px;
  @media (min-width: 600px) and (max-width: 1024px) {
    align-items: stretch;
    width: 140px;
    max-width: 140px;
    margin-left: 0;
    margin-bottom: 0;
    gap: 4px;
    flex-direction: column;
  }
  @media (max-width: 599px) {
    flex-direction: row;
    align-items: center;
    width: 100%;
    max-width: none;
    gap: 4px;
    margin-bottom: 0;
  }
`;
const MonthSelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 2px;
  width: 140px;
  @media (min-width: 600px) and (max-width: 1024px) {
    justify-content: flex-start;
    gap: 4px;
    margin-bottom: 0;
    width: 140px;
  }
  @media (max-width: 599px) {
    gap: 2px;
    margin-bottom: 0;
    width: auto;
    flex: 1;
    min-width: 0;
  }
`;
const MonthArrowButton = styled.button`
  font-size: 1.1rem;
  background: none;
  border: none;
  color: #ffe082;
  cursor: pointer;
  opacity: 1;
  padding: 0 2px;
  transition: opacity 0.15s;
  flex-shrink: 0;
  width: 24px;
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  @media (min-width: 600px) and (max-width: 1024px) {
    font-size: 0.95rem;
    padding: 0 2px;
  }
  @media (max-width: 599px) {
    font-size: 0.9rem;
    padding: 0 1px;
  }
`;
const MonthLabel = styled.span`
  font-weight: 700;
  font-size: 0.92rem;
  color: #ffe082;
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  text-align: center;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  @media (min-width: 600px) and (max-width: 1024px) {
    flex: 1;
    min-width: 0;
  }
  @media (max-width: 599px) {
    font-size: 0.88rem;
    height: 30px;
    flex: 1;
    min-width: 0;
  }
`;

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastTouchX = useRef<number>(0);
  const lastTouchY = useRef<number>(0);
  const SCROLL_THRESHOLD = 6;
  const SCROLL_COOLDOWN = 12;
  const SWIPE_THRESHOLD = 20;
  const SWIPE_VELOCITY_THRESHOLD = 0.1;
  const SWIPE_DISTANCE_MULTIPLIER = 0.5;
  const SCROLL_SMOOTHING = 0.6;
  const SCROLL_DECAY = 0.95;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // 撮影月リストを生成
  const shootingMonths = useMemo(() => {
    return Array.from(new Set(
      photos
        .map((photo: GalleryItem) => typeof photo.shootingDate === 'string' ? photo.shootingDate.slice(0, 7) : undefined)
        .filter((v: string | undefined): v is string => Boolean(v))
    )).sort((a, b) => b.localeCompare(a)) as string[];
  }, [photos]);

  // 月インデックスで管理
  const [monthIndex, setMonthIndex] = useState<number>(0);
  const selectedMonth = useMemo(
    () => shootingMonths[monthIndex] ? `month-${shootingMonths[monthIndex]}` : '',
    [shootingMonths, monthIndex]
  );

  // 左矢印: 過去（月index+1）、右矢印: 未来（月index-1）
  const handlePrevMonth = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMonthIndex((prev) => {
      const next = prev < shootingMonths.length - 1 ? prev + 1 : prev;
      if (next !== prev) setCurrentIndex(0);
      return next;
    });
  }, [shootingMonths.length]);
  const handleNextMonth = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMonthIndex((prev) => {
      const next = prev > 0 ? prev - 1 : prev;
      if (next !== prev) setCurrentIndex(0);
      return next;
    });
  }, []);

  // shootingMonthsが更新されたら最新月をデフォルト選択
  useEffect(() => {
    if (shootingMonths.length > 0) {
      setMonthIndex(0); // 0が最新月
    }
  }, [shootingMonths]);

  // カテゴリーリスト（英語表記）
  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'bath', label: 'Bath' },
    { value: 'person', label: 'Person' },
  ];

  const filteredPhotos = useMemo(() => {
    let result = photos;
    if (selectedCategory !== 'all') {
      result = result.filter((photo: GalleryItem) => {
        if (Array.isArray(photo.category3)) {
          return photo.category3
            .map((v: string) => typeof v === 'string' ? v.trim().toLowerCase() : '')
            .includes(selectedCategory.toLowerCase());
        }
        if (typeof photo.category3 === 'string') {
          return photo.category3.trim().toLowerCase() === selectedCategory.toLowerCase();
        }
        return false;
      });
    }
    if (selectedMonth) {
      const month = selectedMonth.replace('month-', '');
      result = result.filter((photo: GalleryItem) =>
        typeof photo.shootingDate === 'string' && photo.shootingDate.startsWith(month)
      );
    }
    return result;
  }, [photos, selectedCategory, selectedMonth]);

  // LCP画像のURLを取得
  const lcpImageUrl = useMemo(() => {
    if (filteredPhotos.length === 0) return undefined;
    const firstPhoto = filteredPhotos[0];
    if (!firstPhoto || !firstPhoto.imageUrls) return undefined;
    const urls = getResponsiveImageUrls(firstPhoto.imageUrls);
    return urls.large || urls.medium || urls.original || '';
  }, [filteredPhotos]);

  // マウント状態を管理
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getAllGallery();
        setPhotos(items);
      } catch (err) {
        setError('APIエラー: ' + String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // 画像取得後にcategory3の値をデバッグ出力
  useEffect(() => {
    if (photos.length > 0) {
      // console.log('category3 values:', photos.map(p => p.category3));
      // console.log('全データ:', photos);
    }
  }, [photos]);

  // カテゴリーが変更されたときにインデックスをリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  // currentIndexが範囲外の場合にリセット（filteredPhotos基準に修正）
  useEffect(() => {
    if (filteredPhotos.length > 0 && currentIndex >= filteredPhotos.length) {
      setCurrentIndex(0);
    }
  }, [filteredPhotos, currentIndex]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleScroll = useCallback((e: WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_COOLDOWN || photos.length === 0) return;

    const deltaY = e.deltaY * SCROLL_SMOOTHING;
    scrollAccumulator.current = scrollAccumulator.current * SCROLL_DECAY + deltaY;
    const absDelta = Math.abs(scrollAccumulator.current);

    if (absDelta > SCROLL_THRESHOLD) {
      lastScrollTime.current = now;

      if (scrollAccumulator.current > 0 && currentIndex < photos.length - 1) {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
        scrollAccumulator.current = 0;
      } else if (scrollAccumulator.current < 0 && currentIndex > 0) {
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
        scrollAccumulator.current = 0;
      }

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }
  }, [currentIndex, photos.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleScroll(e);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartTime.current = Date.now();
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      lastTouchX.current = touch.clientX;
      lastTouchY.current = touch.clientY;
      setIsDragging(true);
      setTranslateX(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const limitedDeltaX = Math.max(Math.min(deltaX, 80), -80);
        setTranslateX(limitedDeltaX * 0.4);
      }
      
      lastTouchX.current = touch.clientX;
      lastTouchY.current = touch.clientY;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      const touchEndTime = Date.now();
      const deltaX = lastTouchX.current - touchStartX.current;
      const deltaY = lastTouchY.current - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;
      const velocityX = Math.abs(deltaX) / deltaTime;

      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          (Math.abs(deltaX) > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
        setIsTransitioning(true);
        
        const swipeDistance = Math.abs(deltaX);
        const swipeVelocity = Math.abs(velocityX);
        const swipeIntensity = (swipeDistance * SWIPE_DISTANCE_MULTIPLIER) + (swipeVelocity * 60);
        const imageCount = Math.min(
          Math.max(Math.floor(swipeIntensity / 140), 1),
          photos.length - 1
        );

        if (deltaX > 0 && currentIndex > 0) {
          setCurrentIndex(prev => Math.max(0, prev - imageCount));
        } else if (deltaX < 0 && currentIndex < photos.length - 1) {
          setCurrentIndex(prev => Math.min(photos.length - 1, prev + imageCount));
        }
      }

      setIsDragging(false);
      setTranslateX(0);
      touchStartTime.current = 0;
      touchStartX.current = 0;
      touchStartY.current = 0;
      lastTouchX.current = 0;
      lastTouchY.current = 0;

      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll, currentIndex, photos.length, isDragging]);

  // サムネイルのスクロール位置を更新する関数
  const scrollToCurrentThumbnail = useCallback(() => {
    if (thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const thumbnails = container.children;
      if (thumbnails[currentIndex]) {
        const thumbnail = thumbnails[currentIndex] as HTMLElement;
        const containerWidth = container.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;
        
        // サムネイルが中央に来るようにスクロール
        const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // currentIndexが変更されたときにサムネイルをスクロール
  useEffect(() => {
    scrollToCurrentThumbnail();
  }, [currentIndex, scrollToCurrentThumbnail]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartTime.current = Date.now();
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    lastTouchX.current = touch.clientX;
    lastTouchY.current = touch.clientY;
    setIsDragging(true);
    setTranslateX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const limitedDeltaX = Math.max(Math.min(deltaX, 80), -80);
      setTranslateX(limitedDeltaX * 0.4);
    }
    
    lastTouchX.current = touch.clientX;
    lastTouchY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    const touchEndTime = Date.now();
    const deltaX = lastTouchX.current - touchStartX.current;
    const deltaY = lastTouchY.current - touchStartY.current;
    const deltaTime = touchEndTime - touchStartTime.current;
    const velocityX = Math.abs(deltaX) / deltaTime;

    if (Math.abs(deltaX) > Math.abs(deltaY) && 
        (Math.abs(deltaX) > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
      setIsTransitioning(true);
      
      const swipeDistance = Math.abs(deltaX);
      const swipeVelocity = Math.abs(velocityX);
      const swipeIntensity = (swipeDistance * SWIPE_DISTANCE_MULTIPLIER) + (swipeVelocity * 60);
      const imageCount = Math.min(
        Math.max(Math.floor(swipeIntensity / 140), 1),
        photos.length - 1
      );

      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(prev => Math.max(0, prev - imageCount));
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        setCurrentIndex(prev => Math.min(photos.length - 1, prev + imageCount));
      }
    }

    setIsDragging(false);
    setTranslateX(0);
    touchStartTime.current = 0;
    touchStartX.current = 0;
    touchStartY.current = 0;
    lastTouchX.current = 0;
    lastTouchY.current = 0;

    setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
  };

  // 画像のプリロード処理を最適化
  useEffect(() => {
    if (!mounted || filteredPhotos.length === 0) return;

    const preloadImages = () => {
      // 現在の画像の前後の画像をプリロード（前後2枚ずつ）
      const indices = [
        currentIndex > 1 ? currentIndex - 2 : currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1,
        currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1,
        currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0,
        currentIndex < filteredPhotos.length - 2 ? currentIndex + 2 : currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0
      ];

      // 重複を除去
      const uniqueIndices = Array.from(new Set(indices));

      uniqueIndices.forEach(index => {
        // インデックスが有効範囲内かチェック
        if (index < 0 || index >= filteredPhotos.length) return;
        
        const photo = filteredPhotos[index];
        if (!photo || !photo.imageUrls) return;
        
        const urls = getResponsiveImageUrls(photo.imageUrls);
        const url = urls.medium || urls.small || urls.original;
        if (isValidUrl(url) && !imagesLoaded.has(url!)) {
          const img = new window.Image();
          img.src = url!;
          img.onload = () => {
            setImagesLoaded(prev => {
              const newSet = new Set(prev);
              newSet.add(url!);
              // メモリリークを防ぐため、古い画像のURLを削除
              if (newSet.size > 10) {
                const urls = Array.from(newSet);
                newSet.clear();
                urls.slice(-10).forEach(url => newSet.add(url));
              }
              return newSet;
            });
          };
        }
      });
    };

    preloadImages();
  }, [currentIndex, filteredPhotos, mounted, imagesLoaded]);

  // ギャラリー用ローディング進捗管理
  const allImageUrls = useMemo(() => {
    // getOriginalImageUrlで取得し、バリデーション済みのみ
    const urls = filteredPhotos
      .filter(photo => photo && photo.imageUrls) // photoオブジェクトとimageUrlsの存在をチェック
      .map(photo => getOriginalImageUrl(photo.imageUrls))
      .filter(isValidUrl) as string[];
    return Array.from(new Set(urls));
  }, [filteredPhotos]);

  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryReady, setGalleryReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { progress, handleImageLoad } = useGalleryLoading(
    allImageUrls,
    () => {
      setGalleryLoading(false);
      setTimeout(() => setGalleryReady(true), 500); // フェードアウト用
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  );

  // タイムアウトによるフェイルセーフ（5秒）
  useEffect(() => {
    if (!galleryLoading) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setGalleryLoading(false);
      setTimeout(() => setGalleryReady(true), 500);
    }, 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [galleryLoading]);

  // セッションストレージで一度だけローディングを表示
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('gallery_loading_shown')) {
      setShowLoading(true);
      sessionStorage.setItem('gallery_loading_shown', '1');
    }
  }, []);

  useEffect(() => {
    if (galleryReady) {
      setShowLoading(false);
    }
  }, [galleryReady]);

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setIsLoading(true);
      const fetchPhotos = async () => {
        try {
          const items = await getAllGallery();
          setPhotos(items);
        } catch {
          setError('データの読み込みに失敗しました。もう一度お試しください。');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPhotos();
    } else {
      setError('申し訳ありません。しばらく時間をおいてから再度お試しください。');
    }
  }, [retryCount]);

  // キーボードナビゲーション用のハンドラー
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (filteredPhotos.length === 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        if (currentIndex > 0) {
          setIsTransitioning(true);
          setCurrentIndex(prev => prev - 1);
          setTimeout(() => setIsTransitioning(false), 200);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < filteredPhotos.length - 1) {
          setIsTransitioning(true);
          setCurrentIndex(prev => prev + 1);
          setTimeout(() => setIsTransitioning(false), 200);
        }
        break;
      case 'Home':
        if (currentIndex !== 0) {
          setIsTransitioning(true);
          setCurrentIndex(0);
          setTimeout(() => setIsTransitioning(false), 200);
        }
        break;
      case 'End':
        if (currentIndex !== filteredPhotos.length - 1) {
          setIsTransitioning(true);
          setCurrentIndex(filteredPhotos.length - 1);
          setTimeout(() => setIsTransitioning(false), 200);
        }
        break;
    }
  }, [currentIndex, filteredPhotos.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* LCP画像のpreloadをheadに追加 */}
      {lcpImageUrl && (
        <Head>
          <link rel="preload" as="image" href={lcpImageUrl} imageSrcSet={lcpImageUrl} />
        </Head>
      )}
      <Header />
      {showLoading && !galleryReady && <GalleryLoadingScreen progress={progress} isReady={galleryReady} />}
      <GalleryContainer>
        <CategoryContainer>
          <CategoryMonthWrapper>
            <MonthSelectorRow>
              <MonthArrowButton onClick={(e) => handlePrevMonth(e)} disabled={monthIndex === shootingMonths.length - 1} aria-label="Previous month" type="button">&#9664;</MonthArrowButton>
              <MonthLabel>{shootingMonths[monthIndex]?.replace('-', '/') || ''}</MonthLabel>
              <MonthArrowButton onClick={(e) => handleNextMonth(e)} disabled={monthIndex === 0} aria-label="Next month" type="button">&#9654;</MonthArrowButton>
            </MonthSelectorRow>
            <CustomSelect
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={setSelectedCategory}
              aria-label="Select category"
              style={{ width: '140px', minWidth: '0', maxWidth: 'none', flex: 1, boxSizing: 'border-box', fontSize: '0.92rem', height: '30px', padding: '0 6px', lineHeight: '30px', verticalAlign: 'middle', margin: 0 }}
            />
          </CategoryMonthWrapper>
        </CategoryContainer>
        {isLoading ? (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }} role="status" aria-live="polite">
              読み込み中...
            </div>
          </MainImageContainer>
        ) : error ? (
          <MainImageContainer>
            <ErrorMessage role="alert">
              {error}
              {retryCount < MAX_RETRIES && (
                <RetryButton onClick={handleRetry} aria-label="再試行">
                  再試行
                </RetryButton>
              )}
            </ErrorMessage>
          </MainImageContainer>
        ) : filteredPhotos.length > 0 ? (
          <>
            <MainImageContainer
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                overscrollBehavior: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
              role="region"
              aria-label="ギャラリー画像"
            >
              <ImageWrapper 
                $isTransitioning={isTransitioning}
                $translateX={translateX}
                $isLoading={isImageLoading}
              >
                {filteredPhotos[currentIndex] && (() => {
                  const urls = getResponsiveImageUrls(filteredPhotos[currentIndex]?.imageUrls);
                  const mainSrc = urls.large || urls.medium || urls.original || '';
                  const previewSrc = urls.small || urls.medium || urls.large || urls.original || '';
                  return (
                    <>
                      <PreviewImage
                        src={previewSrc}
                        alt=""
                        fill
                        sizes="100vw"
                        quality={20}
                        priority={true}
                        loading="eager"
                        aria-hidden="true"
                      />
                      <StyledImage
                        src={mainSrc}
                        alt={filteredPhotos[currentIndex]?.title || ''}
                        fill
                        sizes="100vw"
                        priority={true}
                        loading="eager"
                        data-priority="true"
                        onLoadStart={() => setIsImageLoading(true)}
                        onLoad={() => { 
                          setIsImageLoading(false);
                          handleImageLoad(mainSrc); 
                        }}
                        quality={85}
                        fetchPriority="high"
                        $isLoading={isImageLoading}
                        aria-label={`${filteredPhotos[currentIndex]?.title || ''} (${currentIndex + 1}/${filteredPhotos.length})`}
                      />
                    </>
                  );
                })()}
                <MainImageTitle>
                  {filteredPhotos[currentIndex]?.title || ''}
                </MainImageTitle>
              </ImageWrapper>
            </MainImageContainer>
            <ThumbnailContainer 
              ref={thumbnailContainerRef}
              role="navigation"
              aria-label="サムネイルナビゲーション"
            >
              {filteredPhotos.map((photo, index) => {
                if (!photo || !photo.imageUrls) return null; // photoオブジェクトとimageUrlsの存在をチェック
                const urls = getResponsiveImageUrls(photo.imageUrls);
                const thumbSrc = urls.small || urls.medium || urls.large || urls.original || '';
                return (
                  <ThumbnailWrapper
                    key={photo.id}
                    $isActive={index === currentIndex}
                    onClick={() => handleThumbnailClick(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${photo.title}を表示`}
                    aria-current={index === currentIndex ? 'true' : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleThumbnailClick(index);
                      }
                    }}
                  >
                    {isValidUrl(thumbSrc) && (
                      <Image
                        src={thumbSrc}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 140px, 140px"
                        priority={index < 2}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        data-priority={index < 2 ? 'true' : 'false'}
                        onLoad={() => { handleImageLoad(thumbSrc); }}
                        style={{ objectFit: 'cover' }}
                        quality={index < 2 ? 85 : 60}
                        fetchPriority={index < 2 ? 'high' : 'auto'}
                        aria-hidden="true"
                      />
                    )}
                  </ThumbnailWrapper>
                );
              })}
            </ThumbnailContainer>
          </>
        ) : (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }} role="status" aria-live="polite">
              ギャラリーが空です。
            </div>
          </MainImageContainer>
        )}
      </GalleryContainer>
    </>
  );
}
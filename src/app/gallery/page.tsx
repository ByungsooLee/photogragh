'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getPhotos, type Photo as MicroCMSPhoto } from '@/lib/microcms';
import React from 'react';
import Header from '@/components/Header';
import { CustomSelect } from '@/components/CustomSelect';

// カテゴリーの型定義
type Category = 'all' | 'portrait' | 'bath' | 'person';

// 写真データの型定義
interface Photo extends MicroCMSPhoto {
  category: Category;
  date: string;
}

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
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const ImageWrapper = styled.div<{ $isTransitioning: boolean; $translateX: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isTransitioning ? 'scale(0.98)' : 'scale(1)'} translateX(${props => props.$translateX}px);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  touch-action: none;
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
`;

const Title = styled.h1`
  position: fixed;
  top: 20px;
  left: 20px;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin: 0;
  z-index: 10;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const CategoryContainer = styled.div`
  position: fixed;
  top: 100px;
  left: 20px;
  z-index: 10;
  transform: scale(0.85);
  transform-origin: top left;
`;

const CATEGORIES: Category[] = ['all', 'portrait', 'bath', 'person'];

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollAccumulator = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastTouchX = useRef<number>(0);
  const lastTouchY = useRef<number>(0);
  const SCROLL_THRESHOLD = 10;
  const SCROLL_COOLDOWN = 20;
  const SWIPE_THRESHOLD = 20;
  const SWIPE_VELOCITY_THRESHOLD = 0.1;
  const SWIPE_DISTANCE_MULTIPLIER = 0.5;

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { photos: fetched } = await getPhotos({ limit: 50, offset: 0 });
        if (!fetched || fetched.length === 0) {
          setError('写真が見つかりませんでした');
          setPhotos([]);
          return;
        }
        const categories: Category[] = ['portrait', 'bath', 'person'];
        const withMeta = fetched.map((p, i) => ({
          ...p,
          category: categories[i % categories.length],
          date: '2024-03-01'
        }));
        setPhotos(withMeta);
      } catch (err) {
        console.error('写真の取得に失敗しました:', err);
        setError('写真の読み込みに失敗しました');
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // カテゴリーでフィルタリングされた写真を取得
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return photos;
    return photos.filter(photo => photo.category === selectedCategory);
  }, [photos, selectedCategory]);

  // カテゴリーが変更されたときにインデックスをリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  // currentIndexが範囲外の場合にリセット
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
    if (now - lastScrollTime.current < SCROLL_COOLDOWN || filteredPhotos.length === 0) return;

    scrollAccumulator.current += e.deltaY;
    const absDelta = Math.abs(scrollAccumulator.current);

    if (absDelta > SCROLL_THRESHOLD) {
      lastScrollTime.current = now;

      if (scrollAccumulator.current > 0 && currentIndex < filteredPhotos.length - 1) {
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
      }, 150);
    }
  }, [currentIndex, filteredPhotos.length]);

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
      
      // 水平方向の移動が垂直方向より大きい場合のみ、水平方向の移動を許可
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setTranslateX(deltaX);
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

      // 水平方向のスワイプ判定
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          (Math.abs(deltaX) > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
        setIsTransitioning(true);
        
        // スワイプの強度に基づいて切り替える枚数を計算
        const swipeDistance = Math.abs(deltaX);
        const swipeVelocity = Math.abs(velocityX);
        const swipeIntensity = (swipeDistance * SWIPE_DISTANCE_MULTIPLIER) + (swipeVelocity * 100);
        const imageCount = Math.min(
          Math.max(Math.floor(swipeIntensity / 100), 1), // 最低1枚、最大は計算値
          filteredPhotos.length - 1 // 最大でも残りの画像数まで
        );

        if (deltaX > 0 && currentIndex > 0) {
          // 右スワイプ：前の画像へ
          setCurrentIndex(prev => Math.max(0, prev - imageCount));
        } else if (deltaX < 0 && currentIndex < filteredPhotos.length - 1) {
          // 左スワイプ：次の画像へ
          setCurrentIndex(prev => Math.min(filteredPhotos.length - 1, prev + imageCount));
        }
      }

      // 状態をリセット
      setIsDragging(false);
      setTranslateX(0);
      touchStartTime.current = 0;
      touchStartX.current = 0;
      touchStartY.current = 0;
      lastTouchX.current = 0;
      lastTouchY.current = 0;

      // トランジション終了後に状態をリセット
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
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
  }, [handleScroll, currentIndex, filteredPhotos.length]);

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
    
    // 水平方向の移動が垂直方向より大きい場合のみ、水平方向の移動を許可
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setTranslateX(deltaX);
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

    // 水平方向のスワイプ判定
    if (Math.abs(deltaX) > Math.abs(deltaY) && 
        (Math.abs(deltaX) > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD)) {
      setIsTransitioning(true);
      
      // スワイプの強度に基づいて切り替える枚数を計算
      const swipeDistance = Math.abs(deltaX);
      const swipeVelocity = Math.abs(velocityX);
      const swipeIntensity = (swipeDistance * SWIPE_DISTANCE_MULTIPLIER) + (swipeVelocity * 100);
      const imageCount = Math.min(
        Math.max(Math.floor(swipeIntensity / 100), 1), // 最低1枚、最大は計算値
        filteredPhotos.length - 1 // 最大でも残りの画像数まで
      );

      if (deltaX > 0 && currentIndex > 0) {
        // 右スワイプ：前の画像へ
        setCurrentIndex(prev => Math.max(0, prev - imageCount));
      } else if (deltaX < 0 && currentIndex < filteredPhotos.length - 1) {
        // 左スワイプ：次の画像へ
        setCurrentIndex(prev => Math.min(filteredPhotos.length - 1, prev + imageCount));
      }
    }

    // 状態をリセット
    setIsDragging(false);
    setTranslateX(0);
    touchStartTime.current = 0;
    touchStartX.current = 0;
    touchStartY.current = 0;
    lastTouchX.current = 0;
    lastTouchY.current = 0;

    // トランジション終了後に状態をリセット
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <>
      <Header />
      <GalleryContainer>
        <Title>Gallery</Title>
        <CategoryContainer>
          <CustomSelect
            options={CATEGORIES.map(category => ({
              value: category,
              label: category.charAt(0).toUpperCase() + category.slice(1)
            }))}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value as Category)}
            style={{ minWidth: '140px' }}
          />
        </CategoryContainer>
        {isLoading ? (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }}>読み込み中...</div>
          </MainImageContainer>
        ) : error ? (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }}>{error}</div>
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
            >
              <ImageWrapper 
                $isTransitioning={isTransitioning}
                $translateX={translateX}
              >
                <Image
                  src={filteredPhotos[currentIndex].url}
                  alt={filteredPhotos[currentIndex].title}
                  fill
                  sizes="100vw"
                  priority={currentIndex === 0}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    touchAction: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    overscrollBehavior: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                />
              </ImageWrapper>
            </MainImageContainer>
            <ThumbnailContainer ref={thumbnailContainerRef}>
              {filteredPhotos.map((photo, index) => (
                <ThumbnailWrapper
                  key={photo.id}
                  $isActive={index === currentIndex}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 140px, 140px"
                    priority={index < 4}
                    style={{
                      objectFit: 'cover'
                    }}
                  />
                </ThumbnailWrapper>
              ))}
            </ThumbnailContainer>
          </>
        ) : (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }}>
              このカテゴリーには画像がありません
            </div>
          </MainImageContainer>
        )}
      </GalleryContainer>
    </>
  );
} 
'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getGallery, type GalleryItem } from '@/lib/microcms';
import React from 'react';
import Header from '@/components/Header';
import { CustomSelect } from '@/components/CustomSelect';
import GalleryLoadingScreen from '@/components/GalleryLoadingScreen';

// カテゴリーの型定義
type Category = 'all' | 'portrait' | 'bath' | 'person';

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

const ImageWrapper = styled.div<{ $isTransitioning: boolean; $translateX: number }>`
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isTransitioning ? 'scale(0.98)' : 'scale(1)'} translateX(${props => props.$translateX}px);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  touch-action: none;

  @media (max-width: 768px) {
    height: calc(100% - 30px);
  }
`;

const StyledImage = styled(Image)`
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

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
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
  const SCROLL_THRESHOLD = 10;
  const SCROLL_COOLDOWN = 20;
  const SWIPE_THRESHOLD = 20;
  const SWIPE_VELOCITY_THRESHOLD = 0.1;
  const SWIPE_DISTANCE_MULTIPLIER = 0.5;

  // filteredPhotosのuseMemoをここに移動
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return photos;
    return photos.filter(photo => {
      if (Array.isArray(photo.category3)) {
        return photo.category3
          .map((v) => typeof v === 'string' ? v.trim().toLowerCase() : '')
          .includes(selectedCategory.toLowerCase());
      }
      if (typeof photo.category3 === 'string') {
        return photo.category3.trim().toLowerCase() === selectedCategory.toLowerCase();
      }
      return false;
    });
  }, [photos, selectedCategory]);

  // マウント状態を管理
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getGallery({ limit: 100, offset: 0 });
        setPhotos(res.items);
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

    scrollAccumulator.current += e.deltaY;
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
      }, 150);
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
          photos.length - 1 // 最大でも残りの画像数まで
        );

        if (deltaX > 0 && currentIndex > 0) {
          // 右スワイプ：前の画像へ
          setCurrentIndex(prev => Math.max(0, prev - imageCount));
        } else if (deltaX < 0 && currentIndex < photos.length - 1) {
          // 左スワイプ：次の画像へ
          setCurrentIndex(prev => Math.min(photos.length - 1, prev + imageCount));
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
        photos.length - 1 // 最大でも残りの画像数まで
      );

      if (deltaX > 0 && currentIndex > 0) {
        // 右スワイプ：前の画像へ
        setCurrentIndex(prev => Math.max(0, prev - imageCount));
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        // 左スワイプ：次の画像へ
        setCurrentIndex(prev => Math.min(photos.length - 1, prev + imageCount));
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

  // 画像のプリロード処理を最適化
  useEffect(() => {
    if (!mounted || filteredPhotos.length === 0) return;

    const preloadImages = () => {
      // 現在の画像の前後の画像をプリロード
      const indices = [
        currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1,
        currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0
      ];

      indices.forEach(index => {
        const url = getOriginalImageUrl(filteredPhotos[index].imageUrls);
        if (isValidUrl(url) && !imagesLoaded.has(url!)) {
          const img = new window.Image();
          img.src = url!;
          img.onload = () => {
            setImagesLoaded(prev => new Set([...prev, url!]));
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header />
      {showLoading && !galleryReady && <GalleryLoadingScreen progress={progress} isReady={galleryReady} />}
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
        {(isLoading) ? (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center' }}>
              読み込み中...
            </div>
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
                {isValidUrl(getOriginalImageUrl(filteredPhotos[currentIndex]?.imageUrls)) && (
                  <>
                    {/* プレビュー画像 */}
                    <PreviewImage
                      src={getOriginalImageUrl(filteredPhotos[currentIndex].imageUrls)!}
                      alt={`${filteredPhotos[currentIndex].title} (プレビュー)`}
                      fill
                      sizes="100vw"
                      quality={20}
                      priority={true}
                      loading="eager"
                    />
                    {/* メイン画像 */}
                    <StyledImage
                      src={getOriginalImageUrl(filteredPhotos[currentIndex].imageUrls)!}
                      alt={filteredPhotos[currentIndex].title}
                      fill
                      sizes="100vw"
                      priority={true}
                      loading="eager"
                      data-priority="true"
                      onLoad={() => { 
                        handleImageLoad(getOriginalImageUrl(filteredPhotos[currentIndex].imageUrls)!);
                      }}
                      quality={85}
                      fetchPriority="high"
                    />
                  </>
                )}
                {/* タイトルを画像の上部中央に重ねて表示 */}
                <MainImageTitle>
                  {filteredPhotos[currentIndex]?.title}
                </MainImageTitle>
              </ImageWrapper>
            </MainImageContainer>
            <ThumbnailContainer ref={thumbnailContainerRef}>
              {filteredPhotos.map((photo, index) => (
                <ThumbnailWrapper
                  key={photo.id}
                  $isActive={index === currentIndex}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {isValidUrl(getOriginalImageUrl(photo.imageUrls)) && (
                    <Image
                      src={getOriginalImageUrl(photo.imageUrls)!}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 768px) 140px, 140px"
                      priority={index < 2}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      data-priority={index < 2 ? "true" : "false"}
                      onLoad={() => { handleImageLoad(getOriginalImageUrl(photo.imageUrls)!); }}
                      style={{
                        objectFit: 'cover'
                      }}
                      quality={index < 2 ? 85 : 60}
                      fetchPriority={index < 2 ? "high" : "auto"}
                    />
                  )}
                </ThumbnailWrapper>
              ))}
            </ThumbnailContainer>
          </>
        ) : (
          <MainImageContainer>
            <div style={{ color: '#fff', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              No images in this category
            </div>
          </MainImageContainer>
        )}
      </GalleryContainer>
    </>
  );
} 
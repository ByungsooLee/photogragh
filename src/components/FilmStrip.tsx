'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import type { Photo } from '../lib/microcms';

interface FilmStripProps {
  stripId: string;
  isVertical?: boolean;
  position?: 'left' | 'right' | 'center';
  onPhotoClick: (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => void;
  photos: Photo[];
  className?: string;
}

interface StripWrapperProps {
  $isVertical?: boolean;
  position?: string;
  $stripId?: string;
  className?: string;
}

const StripWrapper = styled.div<StripWrapperProps>`
  position: ${props => props.$isVertical ? 'absolute' : 'relative'};
  width: ${props => props.$isVertical ? '200px' : '100%'};
  height: ${props => props.$isVertical ? '120%' : 'auto'};
  min-height: ${props => props.$isVertical ? 'auto' : '220px'};
  left: ${props => {
    if (props.$isVertical) {
      switch (props.position) {
        case 'left': return '0%';
        case 'right': return '100%';
        default: return '50%';
      }
    }
    return '0';
  }};
  top: ${props => props.$isVertical ? '0' : 'auto'};
  overflow: hidden;
  margin: ${props => props.$isVertical ? '0' : '15px 0'};
  z-index: ${props => {
    if (props.$isVertical) {
      switch (props.position) {
        case 'left': return props.$stripId === 'vstripL' ? '6' : '5';
        case 'right': return '7';
        default: return '8';
      }
    }
    const zIndices: Record<string, number> = {
      'strip1': 5,
      'strip2': 7,
      'strip3': 6,
      'strip4': 8,
      'strip5': 9
    };
    return props.$stripId ? zIndices[props.$stripId] || 6 : 6;
  }};
  transform: ${props => {
    if (props.$isVertical) {
      const rotation = props.position === 'left' ? '-12deg' : 
                      props.position === 'right' ? '12deg' : '-3deg';
      return props.position === 'left' ? `rotate(${rotation})` :
             props.position === 'right' ? `translateX(-100%) rotate(${rotation})` :
             `translateX(-50%) rotate(${rotation})`;
    }
    const rotations: Record<string, string> = {
      'strip1': '-8deg',
      'strip2': '6deg',
      'strip3': '-4deg',
      'strip4': '7deg',
      'strip5': '-6deg'
    };
    return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
  }};
  transform-origin: ${props => props.$isVertical ? 'top center' : 'center center'};
  box-shadow: ${props => props.$isVertical ? 
    '0 0 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.1)' : 
    'none'};
  display: ${props => {
    if (props.$isVertical && (props.position === 'left' || props.position === 'right')) {
      return 'none';
    }
    return 'block';
  }};

  @media (min-width: 768px) {
    display: block;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 20%;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(180deg, var(--bg-dark) 0%, transparent 100%);
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
    transform: rotate(180deg);
  }

  @media (max-width: 1024px) {
    width: ${props => props.$isVertical ? '180px' : '100%'};
    height: ${props => props.$isVertical ? '120%' : 'auto'};
    min-height: ${props => props.$isVertical ? 'auto' : '200px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '0%';
          case 'right': return '100%';
          default: return '50%';
        }
      }
      return '0';
    }};
    top: ${props => props.$isVertical ? '0' : 'auto'};
    transform-origin: ${props => props.$isVertical ? 'top center' : 'center center'};
    transform: ${props => {
      if (props.$isVertical) {
        const rotation = props.position === 'left' ? '-8deg' : 
                        props.position === 'right' ? '8deg' : '-2deg';
        return props.position === 'left' ? `rotate(${rotation})` :
               props.position === 'right' ? `translateX(-100%) rotate(${rotation})` :
               `translateX(-50%) rotate(${rotation})`;
      }
      const rotations: Record<string, string> = {
        'strip1': '-8deg',
        'strip2': '6deg',
        'strip3': '-4deg',
        'strip4': '7deg',
        'strip5': '-6deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
    margin: ${props => props.$isVertical ? '0' : '12px 0'};
  }

  @media (max-width: 768px) {
    width: ${props => props.$isVertical ? '160px' : '100%'};
    height: ${props => props.$isVertical ? '120%' : 'auto'};
    min-height: ${props => props.$isVertical ? 'auto' : '180px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '0%';
          case 'right': return '100%';
          default: return '50%';
        }
      }
      return '0';
    }};
    top: ${props => props.$isVertical ? '0' : 'auto'};
    transform-origin: ${props => props.$isVertical ? 'top center' : 'center center'};
    transform: ${props => {
      if (props.$isVertical) {
        const rotation = props.position === 'left' ? '-7deg' : 
                        props.position === 'right' ? '7deg' : '-2deg';
        const translateY = props.position === 'center' ? 'translateY(10px)' : '';
        return props.position === 'left' ? `rotate(${rotation})` :
               props.position === 'right' ? `translateX(-100%) rotate(${rotation})` :
               `translateX(-50%) ${translateY} rotate(${rotation})`;
      }
      const rotations: Record<string, string> = {
        'strip1': '-8deg',
        'strip2': '6deg',
        'strip3': '-4deg',
        'strip4': '7deg',
        'strip5': '-6deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
    margin: ${props => props.$isVertical ? '0' : '10px 0'};
    z-index: ${props => {
      if (props.$isVertical) {
        if (props.position === 'center') {
          return '7';
        }
        return '5';
      }
      const zIndices: Record<string, number> = {
        'strip1': 6,
        'strip2': 8,
        'strip3': 7,
        'strip4': 9,
        'strip5': 10
      };
      return props.$stripId ? zIndices[props.$stripId] || 6 : 6;
    }};
    box-shadow: ${props => props.$isVertical ? 
      '0 0 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.08)' : 
      'none'};
  }

  @media (max-width: 480px) {
    width: ${props => props.$isVertical ? '140px' : '100%'};
    height: ${props => props.$isVertical ? '120%' : 'auto'};
    min-height: ${props => props.$isVertical ? 'auto' : '160px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '0%';
          case 'right': return '100%';
          default: return '50%';
        }
      }
      return '0';
    }};
    top: ${props => props.$isVertical ? '0' : 'auto'};
    transform-origin: ${props => props.$isVertical ? 'top center' : 'center center'};
    transform: ${props => {
      if (props.$isVertical) {
        const rotation = props.position === 'left' ? '-5deg' : 
                        props.position === 'right' ? '5deg' : '-1.5deg';
        const translateY = props.position === 'center' ? 'translateY(5px)' : '';
        return props.position === 'left' ? `rotate(${rotation})` :
               props.position === 'right' ? `translateX(-100%) rotate(${rotation})` :
               `translateX(-50%) ${translateY} rotate(${rotation})`;
      }
      const rotations: Record<string, string> = {
        'strip1': '-8deg',
        'strip2': '6deg',
        'strip3': '-4deg',
        'strip4': '7deg',
        'strip5': '-6deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
    margin: ${props => props.$isVertical ? '0' : '8px 0'};
    box-shadow: ${props => props.$isVertical ? 
      '0 0 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.05)' : 
      'none'};
  }
`;

// アニメーションの設定
const ANIMATION_CONFIG = {
  scroll: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]  // cubic-bezier
  },
  reset: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1]
  },
  auto: {
    duration: 0.1,
    ease: [0.4, 0, 0.2, 1]
  }
};

const Strip = styled.div<{ $isVertical?: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isVertical ? 'column' : 'row'};
  height: 100%;
  width: 100%;
  gap: ${props => props.$isVertical ? '20px' : '40px'};
  padding: ${props => props.$isVertical ? '20px 0' : '15px 30px'};
  position: relative;
  align-items: center;
  overflow: hidden;
  transition: transform ${ANIMATION_CONFIG.scroll.duration}s cubic-bezier(${ANIMATION_CONFIG.scroll.ease.join(',')});
  will-change: transform;
  cursor: grab;
  white-space: nowrap;
  flex-wrap: nowrap;
  min-width: max-content;

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 1024px) {
    gap: 30px;
    padding: 12px 25px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    padding: 10px 15px;
  }

  @media (max-width: 480px) {
    gap: 15px;
    padding: 8px 10px;
  }
`;

const Frame = styled.div<{ isPortrait?: boolean; $isVertical?: boolean }>`
  flex-shrink: 0;
  width: ${props => {
    if (props.$isVertical) return '140px';
    return props.isPortrait ? '140px' : '200px';
  }};
  height: ${props => {
    if (props.$isVertical) return '200px';
    return props.isPortrait ? '200px' : '140px';
  }};
  margin: ${props => props.isPortrait || props.$isVertical ? '0 auto' : '0'};
  background: var(--film-bg);
  border: 2px solid #222;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 5px 20px rgba(0,0,0,0.5),
    inset 0 0 15px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 
      0 10px 30px rgba(212, 175, 55, 0.3),
      0 5px 20px rgba(0,0,0,0.7),
      inset 0 0 20px rgba(212, 175, 55, 0.1);
    z-index: 10;
    border-color: var(--dark-gold);

    &::after {
      opacity: 1;
      background: radial-gradient(
        circle at center,
        transparent 0%,
        rgba(0,0,0,0.2) 30%,
        rgba(0,0,0,0.4) 100%
      );
    }
  }

  &.picked {
    animation: pickUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    z-index: 1000;
  }

  @keyframes pickUp {
    0% {
      transform: scale(1.05);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1.5);
    }
  }

  @media (max-width: 1024px) {
    width: ${props => {
      if (props.$isVertical) return '160px';
      return props.isPortrait ? '160px' : '200px';
    }};
    height: ${props => {
      if (props.$isVertical) return '200px';
      return props.isPortrait ? '200px' : '160px';
    }};
  }

  @media (max-width: 768px) {
    width: ${props => {
      if (props.$isVertical) return '140px';
      return props.isPortrait ? '140px' : '180px';
    }};
    height: ${props => {
      if (props.$isVertical) return '180px';
      return props.isPortrait ? '180px' : '140px';
    }};
  }

  @media (max-width: 480px) {
    width: ${props => {
      if (props.$isVertical) return '120px';
      return props.isPortrait ? '120px' : '160px';
    }};
    height: ${props => {
      if (props.$isVertical) return '160px';
      return props.isPortrait ? '160px' : '120px';
    }};
  }
`;

const Perforations = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 18px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 10px,
    #0a0a0a 10px,
    #0a0a0a 18px
  );
  z-index: 2;
  ${props => props.side === 'left' ? 'left: 0; border-right: 1px solid #333;' : 'right: 0; border-left: 1px solid #333;'}
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(34,34,34,0.8) 0%, rgba(17,17,17,0.8) 100%);
`;

// キャッシュの設定
const CACHE_CONFIG = {
  maxSize: 50,  // 最大キャッシュ数
  ttl: 5 * 60 * 1000,  // キャッシュの有効期限（5分）
};

interface CacheEntry {
  url: string;
  timestamp: number;
  data: string;  // base64エンコードされた画像データ
}

// キャッシュマネージャー
class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private queue: string[] = [];

  constructor(private maxSize: number, private ttl: number) {}

  async get(url: string): Promise<string | null> {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // TTLチェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(url);
      return null;
    }

    // 使用頻度の更新
    this.updateQueue(url);
    return entry.data;
  }

  async set(url: string, data: string): Promise<void> {
    // キャッシュサイズの制限チェック
    if (this.cache.size >= this.maxSize) {
      const oldestUrl = this.queue.shift();
      if (oldestUrl) this.delete(oldestUrl);
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
      data
    });
    this.updateQueue(url);
  }

  private delete(url: string): void {
    this.cache.delete(url);
    this.queue = this.queue.filter(u => u !== url);
  }

  private updateQueue(url: string): void {
    this.queue = this.queue.filter(u => u !== url);
    this.queue.push(url);
  }

  clear(): void {
    this.cache.clear();
    this.queue = [];
  }
}

const imageCache = new ImageCache(CACHE_CONFIG.maxSize, CACHE_CONFIG.ttl);

const Photo = styled.div<{ $isPicked?: boolean; $imageUrl?: string; $isCached?: boolean }>`
  width: 100%;
  height: 100%;
  background: ${props => {
    if (!props.$imageUrl) return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'><rect fill=\'%23333\' width=\'300\' height=\'200\'/><text x=\'150\' y=\'100\' text-anchor=\'middle\' fill=\'%23d4af37\' font-size=\'20\' font-family=\'serif\' opacity=\'0.5\'>PHOTO</text></svg>")';
    return props.$isCached ? `url(${props.$imageUrl})` : `url(${props.$imageUrl})`;
  }} center/cover;
  border-radius: 5px;
  filter: sepia(20%) contrast(1.1);
  transition: all 0.3s ease;

  ${Frame}:hover & {
    filter: sepia(0%) contrast(1.2) brightness(1.1);
  }

  ${props => props.$isPicked && `
    filter: sepia(0%) contrast(1.2) brightness(1.1);
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
  `}
`;

const Spotlight = styled.div<{ x: number; y: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at ${props => props.x}px ${props => props.y}px,
    rgba(212, 175, 55, 0.15) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 1000;
  mix-blend-mode: overlay;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

// グローバルなスクロール位置の状態
let globalScrollPosition = 0;
const scrollListeners = new Set<(position: number) => void>();

const updateGlobalScroll = (position: number) => {
  globalScrollPosition = position;
  scrollListeners.forEach(listener => listener(position));
};

// スクロール速度の設定
const SCROLL_SPEEDS = {
  vertical: {
    auto: 0.15,    // 自動スクロール
    wheel: 0.2,    // ホイール操作
    touch: 0.3,    // タッチ操作
    tablet: 0.25   // タブレット
  },
  horizontal: {
    auto: 0.4,     // 自動スクロール
    wheel: 0.5,    // ホイール操作
    touch: 0.6,    // タッチ操作
    tablet: 0.45   // タブレット
  }
};

const FilmStrip: React.FC<FilmStripProps> = ({
  stripId,
  isVertical,
  position,
  onPhotoClick,
  photos,
  className
}) => {
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);
  const [pickedFrame, setPickedFrame] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(globalScrollPosition);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isTablet, setIsTablet] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [preloadedPhotos, setPreloadedPhotos] = useState<Set<string>>(new Set());
  const [cachedPhotos, setCachedPhotos] = useState<Set<string>>(new Set());
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  // デバイスタイプの検出
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTabletDevice = /ipad|android(?!.*mobile)/.test(userAgent) || 
        (window.innerWidth <= 1024 && window.innerWidth > 768);
      setIsTablet(isTabletDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // スクロール速度の取得
  const getScrollSpeed = (type: 'auto' | 'wheel' | 'touch'): number => {
    const speeds = isVertical ? SCROLL_SPEEDS.vertical : SCROLL_SPEEDS.horizontal;
    return isTablet ? speeds.tablet : speeds[type];
  };

  // グローバルなスクロールイベントをリッスン
  useEffect(() => {
    const handleGlobalScroll = (position: number) => {
      setScrollPosition(position);
    };

    scrollListeners.add(handleGlobalScroll);
    return () => {
      scrollListeners.delete(handleGlobalScroll);
    };
  }, []);

  // 画像をbase64に変換
  const convertToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // 写真のプリロード（キャッシュ対応）
  const preloadImage = async (url: string): Promise<void> => {
    if (preloadedPhotos.has(url)) {
      return;
    }

    try {
      // キャッシュをチェック
      const cachedData = await imageCache.get(url);
      if (cachedData) {
        setPreloadedPhotos(prev => new Set([...prev, url]));
        setCachedPhotos(prev => new Set([...prev, url]));
        return;
      }

      // 画像をロードしてキャッシュに保存
      const base64Data = await convertToBase64(url);
      await imageCache.set(url, base64Data);
      
      setPreloadedPhotos(prev => new Set([...prev, url]));
      setCachedPhotos(prev => new Set([...prev, url]));
    } catch (error) {
      console.error('写真のプリロードに失敗しました:', error);
    }
  };

  // 写真の表示を初期化
  useEffect(() => {
    if (photos.length === 0) return;

    // 写真を3セット用意してエンドレスロールを実現
    const tripledPhotos = [...photos, ...photos, ...photos];
    setDisplayedPhotos(tripledPhotos);
    setIsInitialized(true);

    // 写真のプリロードを開始
    const preloadAllPhotos = async () => {
      try {
        await Promise.all(photos.map(photo => preloadImage(photo.url)));
      } catch (error) {
        console.error('写真のプリロードに失敗しました:', error);
      }
    };

    preloadAllPhotos();

    // コンポーネントのアンマウント時にキャッシュをクリア
    return () => {
      imageCache.clear();
    };
  }, [photos]);

  // 表示範囲内の写真をプリロード
  useEffect(() => {
    if (!isInitialized || !stripRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            const photo = displayedPhotos[index];
            if (photo && !preloadedPhotos.has(photo.url)) {
              preloadImage(photo.url).catch(error => {
                console.error('写真のプリロードに失敗しました:', error);
              });
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '100% 0px',
        threshold: 0.1
      }
    );

    const frames = stripRef.current.querySelectorAll('[data-index]');
    frames.forEach(frame => observer.observe(frame));

    return () => {
      frames.forEach(frame => observer.unobserve(frame));
    };
  }, [isInitialized, displayedPhotos, preloadedPhotos]);

  // スクロール位置の計算とリセット
  const calculateScrollPosition = (position: number): number => {
    const frameSize = isVertical ? 220 : 240;
    const gap = isVertical ? 20 : 40;
    const singleSetSize = (frameSize + gap) * photos.length;
    
    // 1セット分のサイズを超えた場合、滑らかにリセット
    if (Math.abs(position) >= singleSetSize) {
      const direction = position > 0 ? 1 : -1;
      const remainder = Math.abs(position) % singleSetSize;
      
      // トランジションを一時的に無効化して位置をリセット
      if (stripRef.current) {
        stripRef.current.style.transition = 'none';
        requestAnimationFrame(() => {
          if (stripRef.current) {
            stripRef.current.style.transition = `transform ${ANIMATION_CONFIG.reset.duration}s cubic-bezier(${ANIMATION_CONFIG.reset.ease.join(',')})`;
          }
        });
      }
      
      return direction * remainder;
    }
    
    return position;
  };

  // スクロール方向の決定
  const getScrollDirection = (): number => {
    if (isVertical) {
      switch (position) {
        case 'left': return -1;  // 左列は上方向
        case 'right': return 1;  // 右列は下方向
        default: return -1;      // 中央列は上方向
      }
    }
    return 1;  // 横列は右方向にスクロール
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsAutoScrolling(false);

    const scrollDirection = getScrollDirection();
    let delta = 0;
    if (isVertical) {
      delta = e.deltaY;
    } else {
      delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    }
    const scrollSpeed = getScrollSpeed('wheel');
    
    // デルタ値の補間
    const smoothedDelta = delta * (1 - Math.exp(-Math.abs(delta) / 100));
    const calculatedPosition = calculateScrollPosition(scrollPosition + (smoothedDelta * scrollSpeed * scrollDirection));
    
    setScrollPosition(calculatedPosition);
    updateGlobalScroll(calculatedPosition);

    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2000);
  };

  // グローバルなスクロールイベントをリッスン
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleGlobalWheel = (e: WheelEvent) => {
      if (stripRef.current?.contains(e.target as Node)) {
        return;
      }

      if (!isScrolling) {
        setIsAutoScrolling(false);
        isScrolling = true;
      }

      const scrollDirection = getScrollDirection();
      let delta = 0;
      if (isVertical) {
        delta = e.deltaY;
      } else {
        delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      }
      const scrollSpeed = getScrollSpeed('wheel');
      const calculatedPosition = calculateScrollPosition(scrollPosition + (delta * scrollSpeed * scrollDirection));
      
      setScrollPosition(calculatedPosition);
      updateGlobalScroll(calculatedPosition);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        setIsAutoScrolling(true);
      }, 2000);
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
      clearTimeout(scrollTimeout);
    };
  }, [isVertical, position, scrollPosition]);

  // 自動スクロールの処理
  useEffect(() => {
    if (!isAutoScrolling || !isInitialized) return;

    const scrollDirection = getScrollDirection();
    let lastTime = performance.now();
    const frameInterval = 1000 / 60; // 60fps
    let lastPosition = scrollPosition;

    const autoScroll = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= frameInterval) {
        const scrollSpeed = getScrollSpeed('auto');
        const newPosition = calculateScrollPosition(scrollPosition + (scrollSpeed * scrollDirection));
        
        // 位置の変化が大きすぎる場合は補間
        if (Math.abs(newPosition - lastPosition) > 5) {
          const interpolatedPosition = lastPosition + (newPosition - lastPosition) * 0.1;
          setScrollPosition(interpolatedPosition);
          updateGlobalScroll(interpolatedPosition);
          lastPosition = interpolatedPosition;
        } else {
          setScrollPosition(newPosition);
          updateGlobalScroll(newPosition);
          lastPosition = newPosition;
        }
        
        lastTime = currentTime;
      }
      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    autoScrollRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, scrollPosition, isVertical, position, isTablet, isInitialized]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setSpotlightPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setIsSpotlightVisible(true);
  };

  const handleMouseLeave = () => {
    setIsSpotlightVisible(false);
  };

  const handlePhotoClick = (photo: Photo, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onPhotoClick({
      url: photo.url,
      title: photo.title,
      caption: photo.caption,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    });
  };

  // タッチイベントの処理
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsAutoScrolling(false);
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const scrollDirection = getScrollDirection();
    let delta = 0;
    if (isVertical) {
      delta = deltaY;
    } else {
      delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    }

    const scrollSpeed = getScrollSpeed('touch');
    // タッチ操作のデルタ値の補間
    const smoothedDelta = delta * (1 - Math.exp(-Math.abs(delta) / 50));
    const calculatedPosition = calculateScrollPosition(scrollPosition + (smoothedDelta * scrollSpeed * scrollDirection));
    
    setScrollPosition(calculatedPosition);
    updateGlobalScroll(calculatedPosition);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    // タッチ操作終了後、2秒後に自動スクロールを再開
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2000);
  };

  // タッチイベントのグローバルリスナー
  useEffect(() => {
    let touchStart: { x: number; y: number } | null = null;
    let isTouching = false;

    const handleGlobalTouchStart = (e: TouchEvent) => {
      if (stripRef.current?.contains(e.target as Node)) {
        return;
      }
      isTouching = true;
      setIsAutoScrolling(false);
      const touch = e.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!touchStart || !isTouching) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      const scrollDirection = getScrollDirection();
      let delta = 0;
      if (isVertical) {
        delta = deltaY;
      } else {
        delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      }

      const scrollSpeed = getScrollSpeed('touch');
      const calculatedPosition = calculateScrollPosition(scrollPosition + (delta * scrollSpeed * scrollDirection));
      
      setScrollPosition(calculatedPosition);
      updateGlobalScroll(calculatedPosition);
      touchStart = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const handleGlobalTouchEnd = () => {
      isTouching = false;
      touchStart = null;
      // タッチ操作終了後、2秒後に自動スクロールを再開
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 2000);
    };

    window.addEventListener('touchstart', handleGlobalTouchStart, { passive: false });
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleGlobalTouchStart);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isVertical, position, scrollPosition, isTablet]);

  // フレームの位置を監視して必要に応じて写真を更新
  useEffect(() => {
    if (!isInitialized || !stripRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = frameRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              // 必要に応じて写真を更新
              const newPhotos = [...displayedPhotos];
              const photoIndex = index % photos.length;
              newPhotos[index] = photos[photoIndex];
              setDisplayedPhotos(newPhotos);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50% 0px',
        threshold: 0.1
      }
    );

    frameRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      frameRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isInitialized, displayedPhotos, photos]);

  // フレームのrefを設定する関数
  const setFrameRef = (index: number) => (el: HTMLDivElement | null) => {
    frameRefs.current[index] = el;
  };

  // ローディング状態の表示
  const LoadingOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;

    &.loading {
      opacity: 1;
    }
  `;

  return (
    <>
      <Spotlight 
        x={spotlightPosition.x} 
        y={spotlightPosition.y} 
        style={{ opacity: isSpotlightVisible ? 1 : 0 }}
      />
      <StripWrapper 
        $isVertical={isVertical} 
        position={position} 
        $stripId={stripId}
        className={className}
      >
        <Strip 
          ref={stripRef}
          $isVertical={isVertical}
          style={{ 
            transform: isVertical 
              ? `translateY(${scrollPosition}px)` 
              : `translateX(${scrollPosition}px)`
          }}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayedPhotos.map((photo, index) => (
            <Frame
              key={`${stripId}-${index}`}
              ref={setFrameRef(index)}
              $isVertical={isVertical}
              className={pickedFrame === index ? 'picked' : ''}
              onClick={(e) => handlePhotoClick(photo, e)}
              data-index={index}
            >
              <Perforations side="left" />
              <Perforations side="right" />
              <Content>
                <Photo 
                  $isPicked={pickedFrame === index} 
                  $imageUrl={photo.url}
                  $isCached={cachedPhotos.has(photo.url)}
                />
                <LoadingOverlay className={!preloadedPhotos.has(photo.url) ? 'loading' : ''}>
                  <LoadingSpinner />
                </LoadingOverlay>
              </Content>
            </Frame>
          ))}
        </Strip>
      </StripWrapper>
    </>
  );
};

// ローディングスピナーのスタイル
const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--dark-gold);
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default FilmStrip; 
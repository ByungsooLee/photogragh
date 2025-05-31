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

const Photo = styled.img<{ $isPicked?: boolean; $isLoaded?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  filter: sepia(20%) contrast(1.1);
  transition: all 0.3s ease, opacity 0.7s cubic-bezier(0.4,0,0.2,1);
  opacity: ${props => props.$isLoaded ? 1 : 0};

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

const FilmStrip: React.FC<FilmStripProps> = ({
  stripId,
  isVertical,
  position,
  onPhotoClick,
  photos,
  className
}) => {
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isTablet, setIsTablet] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoadedArr, setIsLoadedArr] = useState<boolean[]>([]);

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
    const speeds = isVertical ? SCROLL_SPEEDS.vertical : SCROLL_SPEEDS.horizontal;
    return isTablet ? speeds.tablet : speeds[type];
  };

  // 写真の表示を初期化
  useEffect(() => {
    if (photos.length === 0) return;

    // 写真を3セット用意してエンドレスロールを実現
    const tripledPhotos = [...photos, ...photos, ...photos];
    setDisplayedPhotos(tripledPhotos);
    setIsInitialized(true);
  }, [photos]);

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

    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 2000);
  };

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
          lastPosition = interpolatedPosition;
        } else {
          setScrollPosition(newPosition);
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
  }, [isAutoScrolling, scrollPosition, isVertical, isTablet, isInitialized]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setSpotlightPosition({ x: e.clientX, y: e.clientY });
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

  // displayedPhotosが変わるたびにisLoadedArrを初期化
  useEffect(() => {
    setIsLoadedArr(Array(displayedPhotos.length).fill(false));
  }, [displayedPhotos.length]);

  return (
    <>
      <Spotlight 
        x={spotlightPosition.x} 
        y={spotlightPosition.y} 
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
          {displayedPhotos.map((photo, index) => {
            console.log('photo.url', photo.url);
            return (
              <Frame
                key={`${stripId}-${index}`}
                ref={setFrameRef(index)}
                $isVertical={isVertical}
                className={''}
                onClick={(e) => handlePhotoClick(photo, e)}
                data-index={index}
              >
                <Perforations side="left" />
                <Perforations side="right" />
                <Content>
                  <Photo
                    src={photo.url}
                    alt={photo.title}
                    $isPicked={false}
                    $isLoaded={isLoadedArr[index]}
                    onLoad={() => {
                      console.log('onLoad fired', photo.url);
                      setIsLoadedArr(prev => {
                        const next = [...prev];
                        next[index] = true;
                        return next;
                      });
                    }}
                  />
                </Content>
              </Frame>
            );
          })}
        </Strip>
      </StripWrapper>
    </>
  );
};

export default FilmStrip; 
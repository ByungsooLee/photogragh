'use client';

import styled, { keyframes } from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import type { GalleryItem } from '../lib/microcms';
import Image from 'next/image';
import useIsMobileOrTablet from '../../hooks/useIsMobileOrTablet';

interface FilmStripProps {
  stripId: string;
  isVertical?: boolean;
  position?: 'left' | 'right' | 'center';
  onPhotoClick: (photo: GalleryItem & { position: { x: number; y: number } }) => void;
  photos: GalleryItem[];
  className?: string;
  showLogo?: boolean;
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
  height: ${props => props.$isVertical ? '100vh' : 'auto'};
  min-height: ${props => props.$isVertical ? '100vh' : '220px'};
  left: ${props => {
    if (props.$isVertical && props.position === 'center') {
      return '50%';
    }
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
        case 'left': return '6';
        case 'right': return '7';
        default: return '8';
      }
    }
    const zIndices: Record<string, number> = {
      'h1': 5,
      'h2': 7,
      'h3': 6
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
      'h1': '-8deg',
      'h2': '6deg',
      'h3': '-4deg'
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

  @media (max-width: 600px) {
    /* モバイルでは縦ストリップはcenterのみ表示 */
    display: ${props => {
      if (props.$isVertical && props.position !== 'center') {
        return 'none';
      }
      return 'block';
    }};
    left: ${props => {
      if (props.$isVertical && props.position === 'center') {
        return '50%';
      }
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '0%';
          case 'right': return '100%';
          default: return '50%';
        }
      }
      return '0';
    }};
    transform: ${props => {
      if (props.$isVertical && props.position === 'center') {
        return 'translateX(-50%) rotate(-2deg)';
      }
      return '';
    }};
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
        'h1': '-6deg',
        'h2': '4deg',
        'h3': '-3deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
    margin: ${props => props.$isVertical ? '0' : '15px 0'};
  }

  @media (max-width: 768px) {
    width: ${props => props.$isVertical ? '160px' : '100%'};
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
        const rotation = props.position === 'left' ? '-7deg' : 
                        props.position === 'right' ? '7deg' : '-2deg';
        const translateY = props.position === 'center' ? 'translateY(10px)' : '';
        return props.position === 'left' ? `rotate(${rotation})` :
               props.position === 'right' ? `translateX(-100%) rotate(${rotation})` :
               `translateX(-50%) ${translateY} rotate(${rotation})`;
      }
      const rotations: Record<string, string> = {
        'h1': '-8deg',
        'h2': '6deg',
        'h3': '-4deg'
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
        'h1': 6,
        'h2': 8,
        'h3': 7
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
        'h1': '-8deg',
        'h2': '6deg',
        'h3': '-4deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
    margin: ${props => props.$isVertical ? '0' : '8px 0'};
    box-shadow: ${props => props.$isVertical ? 
      '0 0 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.05)' : 
      'none'};
  }
`;

// 縦方向のアニメーション
const verticalScroll = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

// 横方向のアニメーション
const horizontalScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const Strip = styled.div<{ $isVertical?: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isVertical ? 'column' : 'row'};
  height: ${props => props.$isVertical ? '200%' : '100%'};
  width: 100%;
  gap: ${props => props.$isVertical ? '20px' : '40px'};
  padding: ${props => props.$isVertical ? '20px 0' : '15px 30px'};
  position: relative;
  align-items: center;
  overflow: hidden;
  animation: ${props => props.$isVertical ? verticalScroll : horizontalScroll} 120s linear infinite;
  will-change: transform;
  cursor: grab;
  white-space: nowrap;
  flex-wrap: nowrap;
  min-width: max-content;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    animation-play-state: paused;
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

const Frame = styled.div<{ isPortrait?: boolean; $isVertical?: boolean; position?: string }>`
  flex-shrink: 0;
  width: ${props => {
    if (props.$isVertical && props.position === 'center') return '90vw';
    if (props.$isVertical) return '140px';
    return props.isPortrait ? '140px' : '200px';
  }};
  min-width: 100px;
  min-height: 100px;
  margin: ${props => props.isPortrait || props.$isVertical ? '0 auto' : '0'};
  background: var(--film-bg);
  border: 2px solid #222;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 5px 20px rgba(0,0,0,0.5),
    inset 0 0 15px rgba(0,0,0,0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  will-change: transform, box-shadow;
  transform-origin: center center;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  role: "button";
  tabIndex: 0;
  aspect-ratio: 4 / 3;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 
      0 15px 40px rgba(212, 175, 55, 0.4),
      0 8px 25px rgba(0,0,0,0.8),
      inset 0 0 25px rgba(212, 175, 55, 0.15);
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

  &:active {
    transform: scale(0.98);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.picked {
    animation: pickUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    z-index: 1000;
  }

  @keyframes pickUp {
    0% {
      transform: scale(1.08);
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
  }

  @media (max-width: 768px) {
    width: ${props => {
      if (props.$isVertical) return '140px';
      return props.isPortrait ? '140px' : '180px';
    }};
  }

  @media (max-width: 480px) {
    width: ${props => {
      if (props.$isVertical) return '120px';
      return props.isPortrait ? '120px' : '160px';
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: linear-gradient(135deg, rgba(34,34,34,0.8) 0%, rgba(17,17,17,0.8) 100%);
  min-width: 100px;
  min-height: 100px;
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

// シードベースのランダム数生成
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 列IDと写真IDを組み合わせてユニークなシードを生成
const generateSeed = (stripId: string, photoId: string, isMobileOrTablet: boolean): number => {
  const deviceType = isMobileOrTablet ? 'mobile' : 'desktop';
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const deviceCategory = screenWidth <= 480 ? 'mobile' : screenWidth <= 768 ? 'tablet' : 'desktop';
  // リロードごとに変わる乱数を加える
  const randomValue = Math.floor(Math.random() * 1000000);
  const combinedString = `${stripId}-${photoId}-${deviceType}-${deviceCategory}-${randomValue}`;
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

// 各サイズの画像URLを取得する関数
function getImageUrls(imageUrls: string | string[] | undefined) {
  if (!imageUrls) return {};
  if (Array.isArray(imageUrls)) return getImageUrls(imageUrls[0]);
  try {
    const obj = JSON.parse(imageUrls);
    return obj;
  } catch {
    return {};
  }
}

// URLバリデーション関数を追加
function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const FilmStrip: React.FC<FilmStripProps> = ({
  stripId,
  isVertical,
  position,
  onPhotoClick,
  photos,
  className,
  showLogo
}) => {
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [displayedPhotos, setDisplayedPhotos] = useState<GalleryItem[]>([]);
  const isMobileOrTablet = useIsMobileOrTablet();
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchThreshold = 10;
  const tapThreshold = 300;
  const isLogoFrame = useRef(false);

  // ロゴの表示位置を決定する関数
  const getLogoPosition = () => {
    const seed = generateSeed(stripId, 'logo', isMobileOrTablet);
    return Math.floor(seededRandom(seed) * photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent, isLogo: boolean) => {
    isLogoFrame.current = isLogo;
    const touch = e.touches[0];
    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, photo: GalleryItem, link?: string) => {
    const touch = e.changedTouches[0];
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;
    
    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y);
    
    // ロゴフレームの場合
    if (isLogoFrame.current && link) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      window.location.href = link;
      return;
    }
    
    // 通常の画像の場合
    if (touchDuration <= tapThreshold && deltaX <= touchThreshold && deltaY <= touchThreshold) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      onPhotoClick({
        ...photo,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      });
    }
  };

  const handleClick = (e: React.MouseEvent, photo: GalleryItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onPhotoClick({
      ...photo,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, photo: GalleryItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      onPhotoClick({
        ...photo,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      });
    }
  };

  useEffect(() => {
    // 完全ランダムなシャッフル
    const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);
    // 画像を2回繰り返して途切れないようにする
    const duplicatedPhotos = [...shuffledPhotos, ...shuffledPhotos];
    // ランダムな開始位置を決定
    const startIndex = Math.floor(Math.random() * shuffledPhotos.length);
    const rotatedPhotos = duplicatedPhotos.slice(startIndex).concat(duplicatedPhotos.slice(0, startIndex));
    setDisplayedPhotos(rotatedPhotos);
  }, [photos, stripId, isMobileOrTablet]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleLogoClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = link;
  };

  return (
    <>
      <Spotlight x={spotlightPosition.x} y={spotlightPosition.y} />
      <StripWrapper 
        $isVertical={isVertical} 
        position={position} 
        $stripId={stripId}
        className={className}
      >
        <Strip 
          $isVertical={isVertical}
          onMouseMove={handleMouseMove}
        >
          {displayedPhotos.map((photo, index) => {
            const logoPosition = getLogoPosition();
            const galleryLogos = [
              { src: '/images/logo_gallery_01.jpg', alt: 'ギャラリーへ', link: '/gallery' },
              { src: '/images/logo_gallery_02.jpg', alt: 'ギャラリーへ', link: '/gallery' }
            ];
            const aboutLogo = { src: '/images/logo_about_01.jpg', alt: 'Aboutへ', link: '/about' };
            const randomGalleryLogo = galleryLogos[Math.floor(Math.random() * galleryLogos.length)];
            const logoImages = [randomGalleryLogo, aboutLogo];
            const urls = getImageUrls(photo.imageUrls);
            const originalUrl = urls['オリジナル画像'] || '';
            const thumbUrl = urls['サムネイル'] || '';
            const smallUrl = urls['小サイズ'] || '';
            const mediumUrl = urls['中サイズ'] || '';
            const largeUrl = urls['大サイズ'] || '';
            if (!isValidUrl(originalUrl)) return null;

            // ロゴの表示位置の場合のみロゴを表示
            if (index === logoPosition && showLogo) {
              const logo = logoImages[0];
              return (
                <Frame
                  key={`logo-${stripId}-${index}`}
                  $isVertical={isVertical}
                  position={position}
                  className={'logo-frame'}
                  onClick={(e) => handleLogoClick(e, logo.link)}
                  onTouchStart={(e) => handleTouchStart(e, true)}
                  onTouchEnd={(e) => handleTouchEnd(e, photo, logo.link)}
                  role="link"
                  tabIndex={0}
                  aria-label={logo.alt}
                  style={{ pointerEvents: 'auto' }}
                >
                  <Perforations side="left" />
                  <Perforations side="right" />
                  <Content style={{ pointerEvents: 'none' }}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 900px"
                      quality={85}
                      priority={index === 0}
                      placeholder="blur"
                      blurDataURL={thumbUrl}
                      style={{ objectFit: 'cover', pointerEvents: 'none' }}
                    />
                  </Content>
                </Frame>
              );
            }

            return (
              <Frame
                key={`${stripId}-${index}-${photo.id}`}
                $isVertical={isVertical}
                position={position}
                onClick={(e) => handleClick(e, photo)}
                onKeyDown={(e) => handleKeyDown(e, photo)}
              >
                <Perforations side="left" />
                <Perforations side="right" />
                <Content>
                  <img
                    src={mediumUrl || originalUrl}
                    alt={photo.title}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    srcSet={`
                      ${thumbUrl} 400w,
                      ${smallUrl} 600w,
                      ${mediumUrl} 900w,
                      ${largeUrl} 1400w,
                      ${originalUrl} 1920w
                    `}
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 900px"
                    loading={index === 0 ? 'eager' : 'lazy'}
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
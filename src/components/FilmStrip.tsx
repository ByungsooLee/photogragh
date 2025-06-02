'use client';

import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
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
  height: ${props => props.$isVertical ? '100vh' : 'auto'};
  min-height: ${props => props.$isVertical ? '100vh' : '220px'};
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
  animation: ${props => props.$isVertical ? verticalScroll : horizontalScroll} 180s linear infinite;
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
  min-width: 100px;
  min-height: 100px;
`;

const Photo = styled.img<{ $isPicked?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  filter: sepia(20%) contrast(1.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  will-change: filter, transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  ${Frame}:hover & {
    filter: sepia(0%) contrast(1.2) brightness(1.15);
    transform: scale(1.02);
  }

  ${props => props.$isPicked && `
    filter: sepia(0%) contrast(1.2) brightness(1.15);
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

// シード値でシャッフルする関数
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const random = (() => {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  })();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomSample<T>(array: T[], n: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

const FilmStrip: React.FC<FilmStripProps> = ({
  stripId,
  isVertical,
  position,
  onPhotoClick,
  photos,
  className
}) => {
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });

  // stripIdごとに異なるseedを割り当てる
  function getSeedFromId(id: string) {
    return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  }

  // フィルムを長くし、かつ同時に同じ画像が出ないようにする
  function generateLongUniqueFilm(photos: Photo[], repeat: number, stripId: string): Photo[] {
    const seed = getSeedFromId(stripId);
    let result: Photo[] = [];
    for (let i = 0; i < repeat; i++) {
      const shuffled = seededShuffle(photos, seed + i * 100);
      result = result.concat(shuffled);
    }
    // ランダムな開始位置からスタート
    const offset = Math.floor(Math.random() * photos.length);
    return result.slice(offset).concat(result.slice(0, offset));
  }

  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>(() => {
    if (!photos || photos.length === 0) return [];
    const sample = getRandomSample(photos, Math.min(100, photos.length));
    return generateLongUniqueFilm(sample, 6, stripId);
  });

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const sample = getRandomSample(photos, Math.min(100, photos.length));
    const seed = getSeedFromId(stripId);
    let result: Photo[] = [];
    for (let i = 0; i < 6; i++) {
      const shuffled = seededShuffle(sample, seed + i * 100);
      result = result.concat(shuffled);
    }
    const offset = Math.floor(Math.random() * sample.length);
    const finalPhotos = result.slice(offset).concat(result.slice(0, offset));
    setDisplayedPhotos(finalPhotos);
  }, [photos, stripId]);

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
          $isVertical={isVertical}
          onMouseMove={handleMouseMove}
        >
          {displayedPhotos.map((photo, index) => (
            <Frame
              key={`${stripId}-${index}-${photo.id}-${photo.url}`}
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
                  loading="eager"
                />
              </Content>
            </Frame>
          ))}
        </Strip>
      </StripWrapper>
    </>
  );
};

export default FilmStrip; 
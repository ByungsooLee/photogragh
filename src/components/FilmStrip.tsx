'use client';

import styled, { keyframes } from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import type { Photo } from '../lib/microcms';

interface FilmStripProps {
  baseDuration: number;
  stripId: string;
  isVertical?: boolean;
  position?: 'left' | 'right' | 'center';
  isReversed?: boolean;
  onPhotoClick: (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => void;
  photos: Photo[];
}

const scrollHorizontal = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-25%, 0, 0);
  }
`;

const scrollVertical = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(0, -25%, 0);
  }
`;

const fadeInStrip = keyframes`
  to { opacity: 1; }
`;

interface StripWrapperProps {
  $isVertical?: boolean;
  position?: string;
  $stripId?: string;
}

const StripWrapper = styled.div<StripWrapperProps>`
  position: ${props => props.$isVertical ? 'absolute' : 'relative'};
  width: ${props => props.$isVertical ? '200px' : '120%'};
  height: ${props => props.$isVertical ? '120%' : 'auto'};
  min-height: ${props => props.$isVertical ? 'auto' : '220px'};
  left: ${props => {
    if (props.$isVertical) {
      switch (props.position) {
        case 'left': return '18%';
        case 'right': return '82%';
        default: return '50%';
      }
    }
    return '-10%';
  }};
  top: ${props => props.$isVertical ? '-10%' : 'auto'};
  overflow: visible;
  opacity: 0;
  animation: ${fadeInStrip} 1s forwards;
  margin: ${props => props.$isVertical ? '0' : '15px 0'};
  z-index: ${props => {
    if (props.$isVertical) {
      switch (props.position) {
        case 'left': return props.$stripId === 'vstripL' ? '10' : '6';
        case 'right': return '8';
        default: return '7';
      }
    }
    const zIndices: Record<string, number> = {
      'strip1': 5,
      'strip2': 9,
      'strip3': 6,
      'strip4': 8,
      'strip5': 7
    };
    return props.$stripId ? zIndices[props.$stripId] || 6 : 6;
  }};
  transform: ${props => {
    if (props.$isVertical) {
      const rotation = props.position === 'left' ? '-7deg' : 
                      props.position === 'right' ? '7deg' : '-3deg';
      return `translateX(-50%) rotate(${rotation})`;
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
  transform-origin: center center;
  box-shadow: ${props => props.$isVertical ? 
    '0 0 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.1)' : 
    'none'};

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
    width: ${props => props.$isVertical ? '180px' : '130%'};
    min-height: ${props => props.$isVertical ? 'auto' : '200px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '15%';
          case 'right': return '85%';
          default: return '50%';
        }
      }
      return '-15%';
    }};
    margin: ${props => props.$isVertical ? '0' : '12px 0'};
  }

  @media (max-width: 768px) {
    width: ${props => props.$isVertical ? '160px' : '150%'};
    min-height: ${props => props.$isVertical ? 'auto' : '180px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '15%';
          case 'right': return '85%';
          default: return '50%';
        }
      }
      return '-25%';
    }};
    margin: ${props => props.$isVertical ? '0' : '10px 0'};
  }

  @media (max-width: 480px) {
    width: ${props => props.$isVertical ? '140px' : '150%'};
    min-height: ${props => props.$isVertical ? 'auto' : '160px'};
    left: ${props => {
      if (props.$isVertical) {
        switch (props.position) {
          case 'left': return '12%';
          case 'right': return '88%';
          default: return '50%';
        }
      }
      return '-25%';
    }};
    margin: ${props => props.$isVertical ? '0' : '8px 0'};
  }
`;

const Strip = styled.div<{ $isVertical?: boolean; duration: number; $isReversed?: boolean; $baseDuration: number; $stripWidth: number; $stripHeight: number }>`
  display: flex;
  flex-direction: ${props => props.$isVertical ? 'column' : 'row'};
  height: 100%;
  width: ${props => props.$isVertical ? '100%' : '200%'};
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
  animation: ${props => props.$isVertical ? scrollVertical : scrollHorizontal} ${props => props.duration}s infinite linear;
  animation-direction: ${props => props.$isReversed ? 'reverse' : 'normal'};
  gap: ${props => props.$isVertical ? '20px' : '40px'};
  padding: ${props => props.$isVertical ? '20px 0' : '15px 30px'};
  position: relative;
  align-items: center;

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
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
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
    transform: scale(1.05) translateZ(30px);
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
      transform: scale(1.05) translateZ(30px);
    }
    50% {
      transform: scale(1.2) translateZ(100px) rotate(5deg);
    }
    100% {
      transform: scale(1.5) translateZ(200px) rotate(0deg);
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

const Photo = styled.div<{ $isPicked?: boolean; $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'><rect fill=\'%23333\' width=\'300\' height=\'200\'/><text x=\'150\' y=\'100\' text-anchor=\'middle\' fill=\'%23d4af37\' font-size=\'20\' font-family=\'serif\' opacity=\'0.5\'>PHOTO</text></svg>")'} center/cover;
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

  &.visible {
    opacity: 1;
  }
`;

const FilmStrip: React.FC<FilmStripProps> = ({
  baseDuration,
  stripId,
  isVertical,
  position,
  isReversed = false,
  onPhotoClick,
  photos
}) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripWidth, setStripWidth] = useState(0);
  const [stripHeight, setStripHeight] = useState(0);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);
  const [pickedFrame, setPickedFrame] = useState<number | null>(null);

  useEffect(() => {
    if (stripRef.current) {
      const rect = stripRef.current.getBoundingClientRect();
      setStripWidth(rect.width);
      setStripHeight(rect.height);
    }
  }, []);

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

  return (
    <>
      <Spotlight 
        x={spotlightPosition.x} 
        y={spotlightPosition.y} 
        className={isSpotlightVisible ? 'visible' : ''}
      />
      <StripWrapper $isVertical={isVertical} position={position} $stripId={stripId} ref={stripRef}>
        <Strip $isVertical={isVertical} duration={baseDuration} $isReversed={isReversed} $baseDuration={baseDuration} $stripWidth={stripWidth} $stripHeight={stripHeight}>
          {photos.map((photo, index) => (
            <Frame 
              key={`${stripId}-${index}`}
              $isVertical={isVertical}
              className={pickedFrame === index ? 'picked' : ''}
              onClick={(e) => handlePhotoClick(photo, e)}
            >
              <Perforations side="left" />
              <Perforations side="right" />
              <Content>
                <Photo $isPicked={pickedFrame === index} $imageUrl={photo.url} />
              </Content>
            </Frame>
          ))}
          {Array.from({ length: 40 }).map((_, index) => (
            <Frame 
              key={`${stripId}-clone-${index}`}
              className={`clone ${pickedFrame === index + 40 ? 'picked' : ''}`}
              $isVertical={isVertical}
              onClick={(e) => handlePhotoClick(photos[index % photos.length], e)}
            >
              <Perforations side="left" />
              <Perforations side="right" />
              <Content>
                <Photo $isPicked={pickedFrame === index + 40} $imageUrl={photos[index % photos.length].url} />
              </Content>
            </Frame>
          ))}
        </Strip>
      </StripWrapper>
    </>
  );
};

export default FilmStrip; 
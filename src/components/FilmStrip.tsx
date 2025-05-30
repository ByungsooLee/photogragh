'use client';

import styled, { keyframes } from 'styled-components';
import { useState, useRef, useEffect } from 'react';

interface FilmStripProps {
  baseDuration: number;
  stripId: string;
  isVertical?: boolean;
  position?: 'left' | 'right';
  isReversed?: boolean;
  onPhotoClick: (photo: { url: string; title: string; caption: string; position: { x: number; y: number } }) => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scrollHorizontal = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-25%, 0, 0);
  }
`;

const scrollHorizontalReverse = keyframes`
  from {
    transform: translate3d(-25%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
`;

const scrollVertical = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -25%, 0);
  }
`;

const scrollVerticalReverse = keyframes`
  from {
    transform: translate3d(0, -25%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
`;

interface StripWrapperProps {
  $isVertical?: boolean;
  position?: 'left' | 'right';
  $stripId: string;
}

const StripWrapper = styled.div<StripWrapperProps>`
  position: ${props => props.$isVertical ? 'absolute' : 'relative'};
  width: ${props => props.$isVertical ? '200px' : '150%'};
  height: ${props => props.$isVertical ? '400%' : 'auto'};
  left: ${props => {
    if (props.$isVertical) {
      switch (props.position) {
        case 'left': return '18%';
        case 'right': return '82%';
        default: return '50%';
      }
    }
    return '-25%';
  }};
  top: ${props => props.$isVertical ? '-10%' : 'auto'};
  overflow: hidden;
  opacity: 0;
  animation: ${fadeIn} 1s forwards;
  margin: ${props => props.$isVertical ? '0' : '10px 0'};
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
      'strip1': '-12deg',
      'strip2': '8deg',
      'strip3': '-5deg',
      'strip4': '10deg',
      'strip5': '-8deg'
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

  @media (max-width: 768px) {
    width: ${props => props.$isVertical ? '160px' : '150%'};
    height: ${props => props.$isVertical ? '400%' : 'auto'};
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
    transform: ${props => {
      if (props.$isVertical) {
        const rotation = props.position === 'left' ? '-5deg' : 
                        props.position === 'right' ? '5deg' : '-3deg';
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
  }

  @media (max-width: 480px) {
    width: ${props => props.$isVertical ? '140px' : '150%'};
    height: ${props => props.$isVertical ? '400%' : 'auto'};
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
    transform: ${props => {
      if (props.$isVertical) {
        const rotation = props.position === 'left' ? '-3deg' : 
                        props.position === 'right' ? '3deg' : '-3deg';
        return `translateX(-50%) rotate(${rotation})`;
      }
      const rotations: Record<string, string> = {
        'strip1': '-5deg',
        'strip2': '4deg',
        'strip3': '-3deg',
        'strip4': '5deg',
        'strip5': '-4deg'
      };
      return `rotate(${props.$stripId ? rotations[props.$stripId] || '0deg' : '0deg'})`;
    }};
  }
`;

const Strip = styled.div<{ $isReversed: boolean; $speed: number; $isVertical: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isVertical ? 'column' : 'row'};
  height: 100%;
  width: ${props => props.$isVertical ? '100%' : '400%'};
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
  animation: ${props => {
    if (props.$isVertical) {
      return props.$isReversed ? scrollVerticalReverse : scrollVertical;
    }
    return props.$isReversed ? scrollHorizontalReverse : scrollHorizontal;
  }} ${props => props.$isVertical ? 120 / props.$speed : 80 / props.$speed}s infinite linear;
  animation-timing-function: linear;
  gap: ${props => props.$isVertical ? '20px' : '30px'};
  padding: ${props => props.$isVertical ? '20px 0' : '0 15px'};
  position: relative;

  &:hover {
    animation-play-state: paused;
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

  @media (max-width: 768px) {
    width: ${props => {
      if (props.$isVertical) return '120px';
      return props.isPortrait ? '120px' : '160px';
    }};
    height: ${props => {
      if (props.$isVertical) return '160px';
      return props.isPortrait ? '160px' : '120px';
    }};
    border-width: 1px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    width: ${props => {
      if (props.$isVertical) return '100px';
      return props.isPortrait ? '100px' : '140px';
    }};
    height: ${props => {
      if (props.$isVertical) return '140px';
      return props.isPortrait ? '140px' : '100px';
    }};
    border-width: 1px;
    border-radius: 4px;
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

const Photo = styled.div<{ $isPicked?: boolean }>`
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect fill="%23333" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23d4af37" font-size="20" font-family="serif" opacity="0.5">PHOTO</text></svg>') center/cover;
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

const Spotlight = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at ${props => props.$x}px ${props => props.$y}px,
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

export default function FilmStrip({ baseDuration, stripId, isVertical = false, isReversed = false, position, onPhotoClick }: FilmStripProps) {
  const [speed, setSpeed] = useState(1);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);
  const [pickedFrame, setPickedFrame] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newSpeed = Math.max(0.5, Math.min(20, speed + (e.deltaY > 0 ? -0.2 : 0.2)));
      setSpeed(newSpeed);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [speed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
    setIsSpotlightVisible(true);
  };

  const handleMouseLeave = () => {
    setIsSpotlightVisible(false);
  };

  const handleFrameClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPickedFrame(index);
    const rect = e.currentTarget.getBoundingClientRect();
    onPhotoClick({
      url: '/photos/photo1.jpg',
      title: 'Photo Title',
      caption: 'Photo Caption',
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    });

    // モーダルが閉じられた後に状態をリセット
    const resetPickedFrame = () => {
      setPickedFrame(null);
    };

    // モーダルが閉じられたことを検知するためのイベントリスナーを追加
    window.addEventListener('modalClosed', resetPickedFrame, { once: true });
  };

  // フィルムストリップのフレームを生成する関数
  const generateFrames = () => {
    const frames = [];
    const frameCount = 40;
    
    // 4セットのフレームを生成（よりスムーズなループのため）
    for (let set = 0; set < 4; set++) {
      for (let i = 0; i < frameCount; i++) {
        const frameIndex = set * frameCount + i;
        frames.push(
          <Frame 
            key={`${stripId}-set${set}-${i}`}
            className={`${set > 0 ? 'clone' : ''} ${pickedFrame === frameIndex ? 'picked' : ''}`}
            $isVertical={isVertical}
            onClick={(e) => handleFrameClick(frameIndex, e)}
          >
            <Perforations side="left" />
            <Perforations side="right" />
            <Content>
              <Photo $isPicked={pickedFrame === frameIndex} />
            </Content>
          </Frame>
        );
      }
    }
    return frames;
  };

  return (
    <>
      <Spotlight 
        $x={spotlightPosition.x} 
        $y={spotlightPosition.y} 
        className={isSpotlightVisible ? 'visible' : ''}
      />
      <StripWrapper $isVertical={isVertical} position={position} $stripId={stripId}>
        <Strip 
          $isReversed={isReversed} 
          $speed={speed} 
          $isVertical={isVertical}
          ref={stripRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {generateFrames()}
        </Strip>
      </StripWrapper>
    </>
  );
} 
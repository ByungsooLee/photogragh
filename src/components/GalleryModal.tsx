'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';
import type { Photo } from '../lib/microcms';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const filmGrain = keyframes`
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 5%); }
  60% { transform: translate(15%, 0); }
  70% { transform: translate(0, 10%); }
  80% { transform: translate(3%, 15%); }
  90% { transform: translate(-10%, 10%); }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.3s ease-out;
  touch-action: none;
  user-select: none;
`;

const ModalContent = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
`;

const ImageContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  cursor: grab;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  padding: 20px;

  &:active {
    cursor: grabbing;
  }
`;

const FilmFrame = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid rgba(212, 175, 55, 0.2);
  pointer-events: none;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.05),
      rgba(0, 0, 0, 0.05) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: ${filmGrain} 0.5s steps(10) infinite;
    pointer-events: none;
    opacity: 0.3;
  }
`;

const FilmStrip = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: ${filmGrain} 0.5s steps(10) infinite;
  }
`;

const FilmStripVertical = styled(FilmStrip)`
  &::before {
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 2px
    );
  }
`;

const FilmPerforations = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  z-index: 3;
`;

const FilmPerforationsTop = styled(FilmPerforations)`
  top: 0;
`;

const FilmPerforationsBottom = styled(FilmPerforations)`
  bottom: 0;
`;

const Perforation = styled.div`
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const CircleHint = styled.div<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction}: 20px;
  transform: translateY(-50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  animation: ${pulseAnimation} 2s ease-in-out infinite;
  animation-delay: 0.5s;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    animation: ${pulseAnimation} 2s ease-in-out infinite;
    animation-delay: 0.7s;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%);
    animation: ${pulseAnimation} 2s ease-in-out infinite;
    animation-delay: 0.9s;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    ${props => props.$direction}: 10px;
  }
`;

const ImageWrapper = styled.div<{ $direction: 'left' | 'right' | null }>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => {
    if (props.$direction === 'left') return 'translateX(-100%)';
    if (props.$direction === 'right') return 'translateX(100%)';
    return 'translateX(0)';
  }};
  max-width: 90vw;
  max-height: 90vh;
  margin: auto;
`;

const InfoPanel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
  padding: 40px 20px 20px;
  color: #fff;
  animation: ${fadeIn} 0.3s ease-out forwards;

  @media (max-width: 768px) {
    padding: 30px 15px 15px;
  }
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin: 0 0 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin: 0 0 8px;
  }
`;

const Caption = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.4;
  }
`;

const SwipeHint = styled.div<{ $aspectRatio: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffe9a7;
  font-size: 1.08rem;
  background: rgba(10, 10, 10, 0.7);
  padding: 8px 20px;
  border-radius: 20px;
  text-align: center;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-top: ${props => props.$aspectRatio > 1 ? '25vh' : '45vh'};
  pointer-events: none;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 6px 16px;
  }
`;

const ScrollHint = styled.div<{ $aspectRatio: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffe9a7;
  font-size: 1.08rem;
  background: rgba(10, 10, 10, 0.7);
  padding: 8px 20px;
  border-radius: 20px;
  text-align: center;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-top: ${props => props.$aspectRatio > 1 ? '25vh' : '45vh'};
  pointer-events: none;

  &::before {
    content: '←';
    margin-right: 10px;
    animation: slideLeft 1.5s infinite;
  }

  &::after {
    content: '→';
    margin-left: 10px;
    animation: slideRight 1.5s infinite;
  }

  @keyframes slideLeft {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-10px); }
  }

  @keyframes slideRight {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(10px); }
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 6px 16px;
  }
`;

const TopLeftTitle = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: #fff;
  font-size: 1.08rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  background: red;
  padding: 8px 20px;
  border-radius: 20px;
  z-index: 100;
  pointer-events: none;
`;

const ZoomModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const ZoomImage = styled.img`
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  box-shadow: 0 0 40px rgba(0,0,0,0.7);
`;

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onIndexChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onIndexChange(Math.max(0, currentIndex - 1));
      } else if (e.key === 'ArrowRight') {
        onIndexChange(Math.min(photos.length - 1, currentIndex + 1));
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleArrowKeys);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleArrowKeys);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, currentIndex, onIndexChange, photos.length]);

  useEffect(() => {
    if (imageRef.current) {
      const img = new window.Image();
      img.src = photos[currentIndex].url;
      img.onload = () => {
        setImageAspectRatio(img.width / img.height);
      };
    }
  }, [currentIndex, photos]);

  useEffect(() => {
    if (showScrollHint) {
      const timer = setTimeout(() => {
        setShowScrollHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showScrollHint]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    touchStartTime.current = Date.now();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setShowScrollHint(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const sensitivity = 1.2;
      const maxOffset = window.innerWidth * 0.8;
      setDragOffset({ 
        x: Math.max(Math.min(deltaX * sensitivity, maxOffset), -maxOffset), 
        y: 0 
      });
    } else {
      setDragOffset({ x: 0, y: deltaY });
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 30;
    const deltaX = touchStartX.current - startX;
    const deltaY = touchStartY.current - startY;
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);
    const touchDuration = Date.now() - touchStartTime.current;

    if (isVerticalSwipe && Math.abs(deltaY) > threshold && touchDuration < 300) {
      onClose();
    } else if (!isVerticalSwipe && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentIndex > 0) {
        setSlideDirection('right');
        setTimeout(() => {
          onIndexChange(currentIndex - 1);
          setSlideDirection(null);
        }, 200);
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        setSlideDirection('left');
        setTimeout(() => {
          onIndexChange(currentIndex + 1);
          setSlideDirection(null);
        }, 200);
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0 && currentIndex > 0) {
        setSlideDirection('right');
        onIndexChange(currentIndex - 1);
      } else if (e.deltaX < 0 && currentIndex < photos.length - 1) {
        setSlideDirection('left');
        onIndexChange(currentIndex + 1);
      }
    }
  };

  if (!isOpen) return null;

  // デバッグ用ログ（JSX外で実行）
  console.log('current photo:', photos[currentIndex]);

  return (
    <>
      {isZoomOpen && (
        <ZoomModalOverlay onClick={() => setIsZoomOpen(false)}>
          <ZoomImage
            src={photos[currentIndex].url}
            alt={photos[currentIndex].title}
            onClick={e => e.stopPropagation()}
          />
        </ZoomModalOverlay>
      )}
      <ModalOverlay 
        $isOpen={isOpen}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <ModalContent
          ref={modalRef}
          onClick={e => e.stopPropagation()}
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <TopLeftTitle>{photos[currentIndex]?.title ?? 'タイトルなし'}</TopLeftTitle>
          <ImageContainer>
            <FilmFrame />
            <FilmStrip />
            <FilmStripVertical />
            <FilmPerforationsTop>
              {Array.from({ length: 8 }).map((_, i) => (
                <Perforation key={`top-${i}`} />
              ))}
            </FilmPerforationsTop>
            <FilmPerforationsBottom>
              {Array.from({ length: 8 }).map((_, i) => (
                <Perforation key={`bottom-${i}`} />
              ))}
            </FilmPerforationsBottom>
            <ImageWrapper
              $direction={slideDirection}
              style={{ zIndex: 9999, position: 'relative', pointerEvents: 'auto' }}
              onClick={() => {
                alert('test');
                setIsZoomOpen(true);
              }}
            >
              <Image
                ref={imageRef}
                src={photos[currentIndex].url}
                alt={photos[currentIndex].title}
                fill
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  filter: 'sepia(5%) contrast(1.05) brightness(1.1)',
                  margin: 'auto',
                  cursor: 'zoom-in'
                }}
                priority
              />
            </ImageWrapper>
            {currentIndex > 0 && <CircleHint $direction="left" />}
            {currentIndex < photos.length - 1 && <CircleHint $direction="right" />}
            {showScrollHint && (
              <ScrollHint $aspectRatio={imageAspectRatio}>
                横スクロールで画像を切り替え
              </ScrollHint>
            )}
            <SwipeHint $aspectRatio={imageAspectRatio}>
              {imageAspectRatio > 1 ? '左右にスワイプで画像を切り替え' : '上下にスワイプで閉じる'}
            </SwipeHint>
          </ImageContainer>
          <InfoPanel>
            <Title>{photos[currentIndex].title}</Title>
            {photos[currentIndex].caption && (
              <Caption>{photos[currentIndex].caption}</Caption>
            )}
          </InfoPanel>
        </ModalContent>
      </ModalOverlay>
    </>
  );
};

export default GalleryModal; 
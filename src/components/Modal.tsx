'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption: string;
  sourcePosition?: { x: number; y: number };
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
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

const ModalOverlay = styled.div<{ $isOpen: boolean; $isDragging: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.25s cubic-bezier(0.4,0,0.2,1);
  touch-action: none;
  user-select: none;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  will-change: transform, opacity;
  role: "dialog";
  aria-modal: "true";
  aria-label: "画像モーダル";
`;

const ModalContent = styled.div<{ 
  $sourcePosition?: { x: number; y: number };
  $dragOffset: { x: number; y: number };
  $isDragging: boolean;
}>`
  position: relative;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 
    0 0 50px rgba(212, 175, 55, 0.3),
    0 0 100px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.25s cubic-bezier(0.4,0,0.2,1);
  transform-origin: ${props => props.$sourcePosition ? `${props.$sourcePosition.x}px ${props.$sourcePosition.y}px` : 'center'};
  transform: translate(${props => props.$dragOffset.x}px, ${props => props.$dragOffset.y}px);
  transition: ${props => props.$isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)'};
  will-change: transform, opacity;

  @media (max-width: 768px) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
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

    @media (max-width: 768px) {
      opacity: 0.15;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: sepia(5%) contrast(1.05) brightness(1.1);
  transition: all 0.3s ease;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    filter: sepia(0%) contrast(1.1) brightness(1.15);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }
`;

const ModalCloseButton = styled.button`
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  margin-bottom: 8px;
  align-self: flex-end;
  aria-label: "モーダルを閉じる";
`;

const InfoPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
  padding: 40px 20px 20px;
  color: var(--gold);
  transform: translateY(100%);
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1);
  animation: ${slideIn} 0.25s cubic-bezier(0.4,0,0.2,1) forwards;
  animation-delay: 0.15s;

  @media (max-width: 768px) {
    padding: 30px 15px 15px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.98), transparent);
  }
`;

const Caption = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.4;
    opacity: 0.9;
  }
`;

const BottomSwipeHint = styled.div`
  margin-top: 8px;
  color: #ffe9a7;
  font-size: 1.08rem;
  background: rgba(10,10,10,0.7);
  padding: 8px 20px;
  border-radius: 20px;
  text-align: center;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  @media (min-width: 769px) {
    display: none;
  }
`;

const TopLeftTitle = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: #fff;
  font-size: 1.08rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  background: rgba(10, 10, 10, 0.7);
  padding: 8px 20px;
  border-radius: 20px;
  z-index: 100;
  pointer-events: none;
`;

const ModalImageWithHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const ImageOverlayHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 10;
  pointer-events: none;
  padding: 0 8px;

  @media (max-width: 768px) {
    position: static;
    margin-bottom: 8px;
    top: unset;
    left: unset;
    padding: 0 4px;
  }
`;

const OverlayTitle = styled.div`
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  background: rgba(10, 10, 10, 0.7);
  padding: 4px 14px;
  border-radius: 20px;
  pointer-events: auto;
  display: flex;
  align-items: center;
`;

const OverlayCloseButton = styled.button`
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 20;
  transition: all 0.3s ease;
  will-change: transform, opacity;
  &:hover {
    transform: scale(1.1);
    background: rgba(0,0,0,0.9);
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
  }
  &:active {
    transform: scale(0.95);
  }
`;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  sourcePosition
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLandscape(img.width > img.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startY;
    const deltaX = currentX - startX;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 50;
    if (
      Math.abs(dragOffset.y) > threshold || 
      Math.abs(dragOffset.x) > threshold
    ) {
      onClose();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay 
      $isOpen={isOpen} 
      onClick={onClose}
      $isDragging={isDragging}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="画像モーダル"
    >
      <ModalContent
        ref={modalRef}
        $sourcePosition={sourcePosition}
        $dragOffset={dragOffset}
        $isDragging={isDragging}
        onClick={e => e.stopPropagation()}
      >
        <FilmFrame />
        <ImageContainer>
          {isLandscape ? (
            <ModalImageWithHeader>
              <ImageOverlayHeader>
                <OverlayTitle>{title}</OverlayTitle>
                <OverlayCloseButton 
                  onClick={onClose} 
                  aria-label="モーダルを閉じる"
                >
                  ×
                </OverlayCloseButton>
              </ImageOverlayHeader>
              <ModalImage 
                src={imageUrl} 
                alt={title || "モーダル画像"} 
              />
            </ModalImageWithHeader>
          ) : (
            <>
              <TopLeftTitle>{title}</TopLeftTitle>
              <ModalCloseButton 
                onClick={onClose} 
                aria-label="モーダルを閉じる"
              >
                ×
              </ModalCloseButton>
              <ModalImage 
                src={imageUrl} 
                alt={title || "モーダル画像"} 
              />
            </>
          )}
          <BottomSwipeHint>Swipe up or sideways to close</BottomSwipeHint>
        </ImageContainer>
        <InfoPanel>
          <Caption>{caption}</Caption>
        </InfoPanel>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal; 
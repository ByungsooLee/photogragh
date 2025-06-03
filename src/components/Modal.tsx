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
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: 0;
  box-shadow: none;
  animation: ${fadeIn} 0.25s cubic-bezier(0.4,0,0.2,1);
  transform-origin: ${props => props.$sourcePosition ? `${props.$sourcePosition.x}px ${props.$sourcePosition.y}px` : 'center'};
  transform: translate(${props => props.$dragOffset.x}px, ${props => props.$dragOffset.y}px);
  transition: ${props => props.$isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)'};
  will-change: transform, opacity;
`;

const ModalCard = styled.div<{ $isLandscape: boolean }>`
  background: #232323;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.25), 0 1.5px 8px rgba(0,0,0,0.10);
  padding: 32px 24px 24px 24px;
  width: 90vw;
  max-width: ${props => props.$isLandscape ? '420px' : '340px'};
  max-height: 90vh;
  min-height: ${props => props.$isLandscape ? '420px' : '520px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 18px 8px 16px 8px;
    max-width: ${props => props.$isLandscape ? '95vw' : '80vw'};
    min-height: ${props => props.$isLandscape ? '320px' : '400px'};
  }
`;

const ModalImage = styled.img<{ $isLandscape: boolean }>`
  max-width: ${props => props.$isLandscape ? '60vw' : '40vw'};
  max-height: ${props => props.$isLandscape ? '45vh' : '70vh'};
  object-fit: contain;
  filter: sepia(5%) contrast(1.05) brightness(1.1);
  transition: all 0.3s ease;
  margin: 0 auto;
  display: block;
  box-shadow:
    0 0 0 8px rgba(255,255,255,0.18),
    0 8px 32px 0 rgba(0,0,0,0.7),
    0 1.5px 8px rgba(0,0,0,0.10);

  @media (max-width: 1024px) {
    max-width: ${props => props.$isLandscape ? '80vw' : '60vw'};
    max-height: ${props => props.$isLandscape ? '32vh' : '60vh'};
  }

  @media (max-width: 768px) {
    max-width: ${props => props.$isLandscape ? '92vw' : '80vw'};
    max-height: ${props => props.$isLandscape ? '28vh' : '50vh'};
  }
`;

const ModalHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
        <ModalCard $isLandscape={isLandscape}>
          <ModalHeader>
            <OverlayTitle>{title}</OverlayTitle>
            <OverlayCloseButton 
              onClick={onClose} 
              aria-label="モーダルを閉じる"
            >
              ×
            </OverlayCloseButton>
          </ModalHeader>
          <ModalImage 
            src={imageUrl} 
            alt={title || "モーダル画像"} 
            $isLandscape={isLandscape}
          />
          <BottomSwipeHint>Swipe up or sideways to close</BottomSwipeHint>
          <InfoPanel>
            <Caption>{caption}</Caption>
          </InfoPanel>
        </ModalCard>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal; 
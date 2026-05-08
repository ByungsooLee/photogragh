'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import { useIsMaxWidth } from '@/hooks/useIsMaxWidth';
import { DESKTOP_MIN_WIDTH, MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from '@/lib/breakpoints';

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

const overlayFade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  /* Keep this above GlobalStyle body::before; pointer events are handled by the modal. */
  z-index: 2147483647;
  backdrop-filter: blur(10px);
  ${css`
    animation: ${overlayFade} 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  `}
  touch-action: none;
  user-select: none;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  will-change: opacity;
  overflow: hidden;
`;

const ModalMotionShell = styled.div<{ 
  $sourcePosition?: { x: number; y: number };
  $disableMotion?: boolean;
}>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: 0;
  box-shadow: none;
  ${props => props.$disableMotion
    ? css`
        animation: none;
      `
    : css`
        animation: ${fadeIn} 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      `}
  transform-origin: ${props => props.$disableMotion ? 'center center' : props.$sourcePosition ? `${props.$sourcePosition.x}px ${props.$sourcePosition.y}px` : 'center'};
  transform: translate3d(0, 0, 0);
  pointer-events: none;
`;

const ModalContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: 0;
  box-shadow: none;
  pointer-events: none;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #181c22 60%, #23272f 100%);
  border-radius: 16px;
  box-shadow: 0 2px 24px 0 rgba(80,100,160,0.18), 0 0 0 2px #23272f inset;
  border: 2.5px solid rgba(80,100,160,0.22);
  overflow: hidden;
  margin: 0 8px;
  height: auto;

  /* Film perforations, visible on every device. */
  &::before, &::after {
    content: '';
    position: absolute;
    left: 8px; right: 8px;
    height: 5px;
    border-radius: 2.5px;
    background: repeating-linear-gradient(
      to right,
      transparent 0 8px,
      #fff 8px 12px,
      transparent 12px 24px
    );
    opacity: 0.10;
    z-index: 2;
  }
  &::before { top: 6px; }
  &::after { bottom: 6px; }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    border-radius: 10px;
    margin: 0 2vw;
    border-width: 1.5px;
    box-shadow: 0 2px 16px 0 rgba(80,100,160,0.13), 0 0 0 1.5px #23272f inset;
    &::before, &::after {
      left: 4px; right: 4px; height: 3px; border-radius: 1.5px;
    }
    &::before { top: 3px; }
    &::after { bottom: 3px; }
  }
  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    border-radius: 0;
    margin: 0;
    border-width: 0.5px;
    box-shadow: 0 1px 8px 0 rgba(80,100,160,0.10), 0 0 0 1px #23272f inset;
    height: 60dvh;
    &::before, &::after {
      left: 2px; right: 2px; height: 2px; border-radius: 1px;
    }
    &::before { top: 1px; }
    &::after { bottom: 1px; }
  }
`;

const ModalCard = styled.div<{ $isLandscape: boolean }>`
  background: linear-gradient(135deg, #181818 60%, #232323 100%);
  border-radius: 20px;
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.45), 0 1.5px 8px 0 rgba(80,100,160,0.10);
  padding: 16px 0;
  width: 96%;
  max-width: ${props => props.$isLandscape ? '1200px' : '800px'};
  max-height: 94dvh;
  min-height: ${props => props.$isLandscape ? '600px' : '700px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  pointer-events: auto;
  border: 1.5px solid rgba(80,100,160,0.18);
  position: relative;
  overflow: visible;
  min-width: 0;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    padding: 8px 0;
    max-width: 98%;
    min-height: 0;
    max-height: 98dvh;
    border-radius: 14px;
  }
  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    padding: 0;
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    min-height: 0;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 80dvh;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 0 0 1.5px #23272f inset;
  background: #181818;
  z-index: 3;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    max-height: 70dvh;
    border-radius: 8px;
  }
  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    max-width: 100%;
    max-height: 60dvh;
    border-radius: 0;
    margin: auto;
    display: block;
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
  background: none;
  padding: 40px 20px 20px;
  color: var(--gold);
  /* Let slideIn own transform so it does not fight transitions or initial transforms. */
  ${css`
    animation: ${slideIn} 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    animation-delay: 0.15s;
  `}

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    padding: 30px 15px 15px;
    background: none;
  }
  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    position: static;
    flex-shrink: 0;
    width: 100%;
    margin-top: 12px;
    padding: 18px 8px 18px 8px;
    background: none;
  }
`;

const Caption = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
  color: #fff;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    font-size: 1rem;
    line-height: 1.4;
    opacity: 0.9;
  }
`;

const BottomSwipeHint = styled.div`
  margin-top: 8px;
  color: #f8f5ef;
  font-size: 1.08rem;
  background: rgba(10,10,10,0.7);
  padding: 8px 20px;
  border-radius: 20px;
  text-align: center;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  @media (min-width: ${DESKTOP_MIN_WIDTH}px) {
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

const MobileModalCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  background: linear-gradient(135deg, #181818 60%, #232323 100%);
  overflow: hidden;
  pointer-events: auto;
`;

const MobileModalHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 8px;
`;

const MobileImageStage = styled.div`
  position: relative;
  min-height: 0;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(120deg, #181c22 60%, #23272f 100%);
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 2px;
    right: 2px;
    height: 2px;
    border-radius: 1px;
    background: repeating-linear-gradient(
      to right,
      transparent 0 8px,
      #fff 8px 12px,
      transparent 12px 24px
    );
    opacity: 0.1;
    z-index: 2;
  }

  &::before { top: 1px; }
  &::after { bottom: 1px; }
`;

const MobileModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background: #181818;
`;

const MobileBottomArea = styled.div`
  display: grid;
  gap: 10px;
  padding: 10px 14px calc(env(safe-area-inset-bottom, 0px) + 14px);
  background: linear-gradient(180deg, rgba(24, 24, 24, 0.96), rgba(35, 35, 35, 0.98));
`;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  sourcePosition
}) => {
  const startRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMobileViewport = useIsMaxWidth(MOBILE_BREAKPOINT);
  const [isLandscape, setIsLandscape] = useState(false);
  const imageAlt = title || 'Modal image';
  const closeButtonLabel = 'Close modal';
  const swipeHintLabel = 'Swipe up or sideways to close';
  const captionText = caption.trim() || 'No caption available.';

  const resetDragState = useCallback(() => {
    setIsDragging(false);
    dragOffsetRef.current = { x: 0, y: 0 };
    startRef.current = { x: 0, y: 0 };
  }, []);

  const handleClose = useCallback(() => {
    flushSync(() => {
      resetDragState();
    });
    onClose();
  }, [onClose, resetDragState]);

  useLayoutEffect(() => {
    resetDragState();
  }, [imageUrl, isOpen, resetDragState]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    resetDragState();

    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [handleClose, isOpen, resetDragState]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLandscape(img.width > img.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    dragOffsetRef.current = {
      x: currentX - startRef.current.x,
      y: currentY - startRef.current.y,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    const threshold = 50;
    if (
      Math.abs(dragOffsetRef.current.y) > threshold || 
      Math.abs(dragOffsetRef.current.x) > threshold
    ) {
      window.requestAnimationFrame(() => {
        handleClose();
      });
    } else {
      resetDragState();
    }
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetDragState();
  };

  const stopPointerPropagation = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <ModalOverlay 
      $isOpen={isOpen} 
      onClick={handleClose}
      onPointerDown={stopPointerPropagation}
      onPointerMove={stopPointerPropagation}
      onPointerUp={stopPointerPropagation}
      onPointerCancel={stopPointerPropagation}
      $isDragging={isDragging}
      role="dialog"
      aria-modal="true"
      aria-label="Image modal"
    >
      <ModalMotionShell
        $sourcePosition={sourcePosition}
        $disableMotion={isMobileViewport}
      >
        <ModalContent>
          {isMobileViewport ? (
            <MobileModalCard
              onClick={(e) => e.stopPropagation()}
              onPointerDown={stopPointerPropagation}
              onPointerMove={stopPointerPropagation}
              onPointerUp={stopPointerPropagation}
              onPointerCancel={stopPointerPropagation}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <MobileModalHeader>
                <OverlayCloseButton 
                  onClick={handleClose} 
                  aria-label={closeButtonLabel}
                >
                  ×
                </OverlayCloseButton>
              </MobileModalHeader>
              <MobileImageStage>
                <MobileModalImage
                  src={imageUrl}
                  alt={imageAlt}
                />
              </MobileImageStage>
              <MobileBottomArea>
                <BottomSwipeHint>{swipeHintLabel}</BottomSwipeHint>
                <Caption>{captionText}</Caption>
              </MobileBottomArea>
            </MobileModalCard>
          ) : (
            <ModalCard
              $isLandscape={isLandscape}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={stopPointerPropagation}
              onPointerMove={stopPointerPropagation}
              onPointerUp={stopPointerPropagation}
              onPointerCancel={stopPointerPropagation}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <ModalHeader>
                <OverlayTitle>{title}</OverlayTitle>
                <OverlayCloseButton 
                  onClick={handleClose} 
                  aria-label={closeButtonLabel}
                >
                  ×
                </OverlayCloseButton>
              </ModalHeader>
              <ImageWrapper>
                <ModalImage 
                  src={imageUrl} 
                  alt={imageAlt} 
                />
              </ImageWrapper>
              <BottomSwipeHint>{swipeHintLabel}</BottomSwipeHint>
              <InfoPanel>
                <Caption>{captionText}</Caption>
              </InfoPanel>
            </ModalCard>
          )}
        </ModalContent>
      </ModalMotionShell>
    </ModalOverlay>,
    document.body
  );
};

export default Modal; 
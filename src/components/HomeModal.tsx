'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface HomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption: string;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
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
  touch-action: none;
  user-select: none;
`;
const ModalContent = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(212, 175, 55, 0.3), 0 0 100px rgba(0, 0, 0, 0.5);
  touch-action: none;
  @media (max-width: 768px) {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
`;
const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
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
const TopLeftTitle = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  margin: 16px;
  color: #fff;
  font-size: 1.08rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  background: rgba(10,10,10,0.7);
  padding: 8px 20px;
  border-radius: 20px;
  z-index: 20;
`;
const TopRightClose = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  margin: 16px;
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
  z-index: 20;
`;
const BottomRightSwipe = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 16px;
  color: #ffe9a7;
  font-size: 1.08rem;
  background: rgba(10,10,10,0.7);
  padding: 8px 20px;
  border-radius: 20px;
  text-align: right;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  z-index: 20;
  @media (min-width: 769px) {
    display: none;
  }
`;
const InfoPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
  padding: 40px 20px 20px;
  color: var(--gold);
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

const HomeModal: React.FC<HomeModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startY;
    const deltaX = currentX - startX;
    setDragOffset({ x: deltaX, y: deltaY });
  };
  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (
      dragOffset.y > 100 || dragOffset.y < -100 ||
      dragOffset.x > 100 || dragOffset.x < -100
    ) {
      onClose();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent
        onClick={e => e.stopPropagation()}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ImageContainer>
          <TopLeftTitle>{title}</TopLeftTitle>
          <TopRightClose onClick={onClose} aria-label="閉じる">×</TopRightClose>
          <ModalImage src={imageUrl} alt={title} />
          <BottomRightSwipe>Swipe to close</BottomRightSwipe>
        </ImageContainer>
        <InfoPanel>
          <Caption>{caption}</Caption>
        </InfoPanel>
      </ModalContent>
    </ModalOverlay>
  );
};

export default HomeModal; 
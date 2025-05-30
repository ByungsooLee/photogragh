'use client';

import { useEffect, useRef } from 'react';
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
  animation: ${fadeIn} 0.5s ease-out;
`;

const ModalContent = styled.div<{ $sourcePosition?: { x: number; y: number } }>`
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
  animation: ${fadeIn} 0.5s ease-out;
  transform-origin: ${props => props.$sourcePosition ? `${props.$sourcePosition.x}px ${props.$sourcePosition.y}px` : 'center'};
`;

const FilmFrame = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid rgba(212, 175, 55, 0.3);
  pointer-events: none;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: ${filmGrain} 0.5s steps(10) infinite;
    pointer-events: none;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: sepia(10%) contrast(1.1) brightness(1.05);
  transition: all 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--dark-gold);
  color: var(--gold);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: all 0.3s ease;

  &:hover {
    background: var(--dark-gold);
    color: #000;
    transform: scale(1.1);
  }
`;

const InfoPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 40px 20px 20px;
  color: var(--gold);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  animation: ${slideIn} 0.5s ease-out forwards;
  animation-delay: 0.3s;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin: 0 0 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const Caption = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
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

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent
        ref={modalRef}
        $sourcePosition={sourcePosition}
        onClick={e => e.stopPropagation()}
      >
        <FilmFrame />
        <ImageContainer>
          <ModalImage src={imageUrl} alt={title} />
        </ImageContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <InfoPanel>
          <Title>{title}</Title>
          <Caption>{caption}</Caption>
        </InfoPanel>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal; 
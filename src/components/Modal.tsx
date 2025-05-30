'use client';

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
    transform: scale(0.8);
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

const projectImage = keyframes`
  0% {
    clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
    transform: scale(0.3) translate(var(--source-x-offset), var(--source-y-offset)) rotate(var(--initial-rotation));
    filter: brightness(0.3) contrast(1.1) blur(10px);
    opacity: 0;
  }
  3% {
    clip-path: polygon(45% 45%, 55% 45%, 55% 55%, 45% 55%);
    transform: scale(0.6) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95)) rotate(calc(var(--initial-rotation) * 0.95));
    filter: brightness(0.4) contrast(1.15) blur(8px);
    opacity: 0.3;
  }
  6% {
    clip-path: polygon(40% 40%, 60% 40%, 60% 60%, 40% 60%);
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9)) rotate(calc(var(--initial-rotation) * 0.9));
    filter: brightness(0.5) contrast(1.2) blur(6px);
    opacity: 0.5;
  }
  9% {
    clip-path: polygon(30% 30%, 70% 30%, 70% 70%, 30% 70%);
    transform: scale(1.2) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85)) rotate(calc(var(--initial-rotation) * 0.85));
    filter: brightness(0.6) contrast(1.25) blur(4px);
    opacity: 0.7;
  }
  12% {
    clip-path: polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%);
    transform: scale(1.5) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8)) rotate(calc(var(--initial-rotation) * 0.8));
    filter: brightness(0.7) contrast(1.3) blur(3px);
    opacity: 0.8;
  }
  15% {
    clip-path: polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%);
    transform: scale(1.8) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7)) rotate(calc(var(--initial-rotation) * 0.7));
    filter: brightness(0.8) contrast(1.35) blur(2px);
    opacity: 0.9;
  }
  18% {
    clip-path: polygon(5% 5%, 95% 5%, 95% 95%, 5% 95%);
    transform: scale(1.9) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6)) rotate(calc(var(--initial-rotation) * 0.6));
    filter: brightness(0.9) contrast(1.4) blur(1px);
    opacity: 0.95;
  }
  21% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    transform: scale(1) translate(0, 0) rotate(0deg);
    filter: brightness(1) contrast(1.5) blur(0);
    opacity: 1;
  }
  100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    transform: scale(1) translate(0, 0) rotate(0deg);
    filter: brightness(1) contrast(1.5) blur(0);
    opacity: 1;
  }
`;

const beamLight = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3) translate(var(--source-x-offset), var(--source-y-offset)) rotate(var(--initial-rotation));
    filter: blur(30px);
  }
  3% {
    opacity: 0.2;
    transform: scale(0.6) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95)) rotate(calc(var(--initial-rotation) * 0.95));
    filter: blur(25px);
  }
  6% {
    opacity: 0.3;
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9)) rotate(calc(var(--initial-rotation) * 0.9));
    filter: blur(20px);
  }
  9% {
    opacity: 0.4;
    transform: scale(1.2) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85)) rotate(calc(var(--initial-rotation) * 0.85));
    filter: blur(15px);
  }
  12% {
    opacity: 0.5;
    transform: scale(1.5) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8)) rotate(calc(var(--initial-rotation) * 0.8));
    filter: blur(10px);
  }
  15% {
    opacity: 0.6;
    transform: scale(1.8) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7)) rotate(calc(var(--initial-rotation) * 0.7));
    filter: blur(8px);
  }
  18% {
    opacity: 0.4;
    transform: scale(2.0) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6)) rotate(calc(var(--initial-rotation) * 0.6));
    filter: blur(6px);
  }
  21% {
    opacity: 0.2;
    transform: scale(2.2) translate(calc(var(--source-x-offset) * 0.5), calc(var(--source-y-offset) * 0.5)) rotate(calc(var(--initial-rotation) * 0.5));
    filter: blur(4px);
  }
  24% {
    opacity: 0.1;
    transform: scale(2.4) translate(calc(var(--source-x-offset) * 0.3), calc(var(--source-y-offset) * 0.3)) rotate(calc(var(--initial-rotation) * 0.3));
    filter: blur(2px);
  }
  27% {
    opacity: 0;
    transform: scale(2.6) translate(calc(var(--source-x-offset) * 0.15), calc(var(--source-y-offset) * 0.15)) rotate(calc(var(--initial-rotation) * 0.15));
    filter: blur(1px);
  }
  30% {
    opacity: 0;
    transform: scale(2.8) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5)) rotate(0deg);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: scale(2.8) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5)) rotate(0deg);
    filter: blur(0);
  }
`;

const lensFlare = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3) translate(var(--source-x-offset), var(--source-y-offset));
    filter: blur(20px);
  }
  3% {
    opacity: 0.2;
    transform: scale(0.6) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95));
    filter: blur(18px);
  }
  6% {
    opacity: 0.3;
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9));
    filter: blur(16px);
  }
  9% {
    opacity: 0.4;
    transform: scale(1.2) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85));
    filter: blur(14px);
  }
  12% {
    opacity: 0.5;
    transform: scale(1.5) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8));
    filter: blur(12px);
  }
  15% {
    opacity: 0.6;
    transform: scale(1.8) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7));
    filter: blur(10px);
  }
  18% {
    opacity: 0.4;
    transform: scale(2.0) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6));
    filter: blur(8px);
  }
  21% {
    opacity: 0.2;
    transform: scale(2.2) translate(calc(var(--source-x-offset) * 0.5), calc(var(--source-y-offset) * 0.5));
    filter: blur(6px);
  }
  24% {
    opacity: 0.1;
    transform: scale(2.4) translate(calc(var(--source-x-offset) * 0.3), calc(var(--source-y-offset) * 0.3));
    filter: blur(4px);
  }
  27% {
    opacity: 0;
    transform: scale(2.6) translate(calc(var(--source-x-offset) * 0.15), calc(var(--source-y-offset) * 0.15));
    filter: blur(2px);
  }
  30% {
    opacity: 0;
    transform: scale(2.8) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5));
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: scale(2.8) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5));
    filter: blur(0);
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  perspective: 1000px;
`;

const ModalContent = styled.div<{ $isOpen: boolean; $sourceX: number; $sourceY: number }>`
  position: relative;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  background: var(--bg-dark);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 
    0 0 50px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(212, 175, 55, 0.1);
  border: 1px solid var(--dark-gold);
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.8)'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  --source-x: ${props => props.$sourceX}px;
  --source-y: ${props => props.$sourceY}px;
  --source-x-offset: ${props => props.$sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.$sourceY - window.innerHeight / 2}px;
  --initial-rotation: ${props => Math.random() * 10 - 5}deg;
`;

const ProjectionBeam = styled.div<{ $sourceX: number; $sourceY: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at var(--source-x) var(--source-y),
    rgba(212, 175, 55, 0.2) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 999;
  animation: ${beamLight} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --source-x: ${props => props.$sourceX}px;
  --source-y: ${props => props.$sourceY}px;
  --source-x-offset: ${props => props.$sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.$sourceY - window.innerHeight / 2}px;
  --initial-rotation: ${props => Math.random() * 10 - 5}deg;
`;

const LensFlare = styled.div<{ $sourceX: number; $sourceY: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at var(--source-x) var(--source-y),
    rgba(255, 255, 255, 0.3) 0%,
    rgba(212, 175, 55, 0.2) 20%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 998;
  animation: ${lensFlare} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --source-x: ${props => props.$sourceX}px;
  --source-y: ${props => props.$sourceY}px;
  --source-x-offset: ${props => props.$sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.$sourceY - window.innerHeight / 2}px;
`;

const ModalHeader = styled.div`
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  color: var(--gold);
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--gold);
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);

  &:hover {
    transform: rotate(90deg);
    background: rgba(212, 175, 55, 0.2);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(90vh - 120px);
  overflow: hidden;
  background: #000;
  animation: ${projectImage} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-style: preserve-3d;
  perspective: 1000px;
  box-shadow: 
    0 0 30px rgba(212, 175, 55, 0.1),
    0 0 60px rgba(212, 175, 55, 0.05);
`;

const ModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: sepia(10%) contrast(1.1);
  transition: all 0.3s ease;

  &:hover {
    filter: sepia(0%) contrast(1.2);
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  animation: ${slideIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalCaption = styled.p`
  color: var(--gold);
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  opacity: 0.9;
`;

export default function Modal({ isOpen, onClose, imageUrl, title, caption, sourcePosition }: ModalProps) {
  const handleClose = () => {
    onClose();
    // モーダルが閉じられたことを通知するイベントを発火
    window.dispatchEvent(new Event('modalClosed'));
  };

  if (!isOpen) return null;

  const sourceX = sourcePosition?.x || window.innerWidth / 2;
  const sourceY = sourcePosition?.y || window.innerHeight / 2;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <LensFlare $sourceX={sourceX} $sourceY={sourceY} />
      <ProjectionBeam $sourceX={sourceX} $sourceY={sourceY} />
      <ModalContent $isOpen={isOpen} $sourceX={sourceX} $sourceY={sourceY} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>
        <ImageContainer>
          <ModalImage 
            src={imageUrl} 
            alt={title}
            style={{
              transformOrigin: sourcePosition ? `${sourcePosition.x}px ${sourcePosition.y}px` : 'center'
            }}
          />
        </ImageContainer>
        <ModalFooter>
          <ModalCaption>{caption}</ModalCaption>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
} 
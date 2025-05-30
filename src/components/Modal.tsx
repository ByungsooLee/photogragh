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
    clip-path: circle(0% at var(--source-x) var(--source-y));
    transform: scale(0.5) translate(var(--source-x-offset), var(--source-y-offset)) rotate(var(--initial-rotation));
    filter: brightness(0.5) contrast(1.2);
  }
  10% {
    clip-path: circle(10% at var(--source-x) var(--source-y));
    transform: scale(0.52) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95)) rotate(calc(var(--initial-rotation) * 0.95));
    filter: brightness(0.55) contrast(1.22);
  }
  20% {
    clip-path: circle(20% at var(--source-x) var(--source-y));
    transform: scale(0.54) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9)) rotate(calc(var(--initial-rotation) * 0.9));
    filter: brightness(0.6) contrast(1.25);
  }
  30% {
    clip-path: circle(30% at var(--source-x) var(--source-y));
    transform: scale(0.58) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85)) rotate(calc(var(--initial-rotation) * 0.85));
    filter: brightness(0.65) contrast(1.28);
  }
  40% {
    clip-path: circle(40% at var(--source-x) var(--source-y));
    transform: scale(0.62) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8)) rotate(calc(var(--initial-rotation) * 0.8));
    filter: brightness(0.7) contrast(1.3);
  }
  50% {
    clip-path: circle(50% at var(--source-x) var(--source-y));
    transform: scale(0.68) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7)) rotate(calc(var(--initial-rotation) * 0.7));
    filter: brightness(0.75) contrast(1.32);
  }
  60% {
    clip-path: circle(60% at var(--source-x) var(--source-y));
    transform: scale(0.74) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6)) rotate(calc(var(--initial-rotation) * 0.6));
    filter: brightness(0.8) contrast(1.35);
  }
  70% {
    clip-path: circle(70% at var(--source-x) var(--source-y));
    transform: scale(0.82) translate(calc(var(--source-x-offset) * 0.5), calc(var(--source-y-offset) * 0.5)) rotate(calc(var(--initial-rotation) * 0.5));
    filter: brightness(0.85) contrast(1.38);
  }
  80% {
    clip-path: circle(80% at var(--source-x) var(--source-y));
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.3), calc(var(--source-y-offset) * 0.3)) rotate(calc(var(--initial-rotation) * 0.3));
    filter: brightness(0.9) contrast(1.42);
  }
  90% {
    clip-path: circle(90% at var(--source-x) var(--source-y));
    transform: scale(0.95) translate(calc(var(--source-x-offset) * 0.15), calc(var(--source-y-offset) * 0.15)) rotate(calc(var(--initial-rotation) * 0.15));
    filter: brightness(0.95) contrast(1.45);
  }
  100% {
    clip-path: circle(100% at var(--source-x) var(--source-y));
    transform: scale(1) translate(0, 0) rotate(0deg);
    filter: brightness(1) contrast(1.5);
  }
`;

const beamLight = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5) translate(var(--source-x-offset), var(--source-y-offset)) rotate(var(--initial-rotation));
    filter: blur(20px);
  }
  10% {
    opacity: 0.15;
    transform: scale(0.6) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95)) rotate(calc(var(--initial-rotation) * 0.95));
    filter: blur(19px);
  }
  20% {
    opacity: 0.25;
    transform: scale(0.7) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9)) rotate(calc(var(--initial-rotation) * 0.9));
    filter: blur(18px);
  }
  30% {
    opacity: 0.35;
    transform: scale(0.8) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85)) rotate(calc(var(--initial-rotation) * 0.85));
    filter: blur(16px);
  }
  40% {
    opacity: 0.45;
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8)) rotate(calc(var(--initial-rotation) * 0.8));
    filter: blur(14px);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7)) rotate(calc(var(--initial-rotation) * 0.7));
    filter: blur(12px);
  }
  60% {
    opacity: 0.45;
    transform: scale(1.3) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6)) rotate(calc(var(--initial-rotation) * 0.6));
    filter: blur(10px);
  }
  70% {
    opacity: 0.35;
    transform: scale(1.5) translate(calc(var(--source-x-offset) * 0.5), calc(var(--source-y-offset) * 0.5)) rotate(calc(var(--initial-rotation) * 0.5));
    filter: blur(8px);
  }
  80% {
    opacity: 0.25;
    transform: scale(1.7) translate(calc(var(--source-x-offset) * 0.3), calc(var(--source-y-offset) * 0.3)) rotate(calc(var(--initial-rotation) * 0.3));
    filter: blur(6px);
  }
  90% {
    opacity: 0.15;
    transform: scale(1.9) translate(calc(var(--source-x-offset) * 0.15), calc(var(--source-y-offset) * 0.15)) rotate(calc(var(--initial-rotation) * 0.15));
    filter: blur(4px);
  }
  100% {
    opacity: 0;
    transform: scale(2) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5)) rotate(0deg);
    filter: blur(2px);
  }
`;

const lensFlare = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5) translate(var(--source-x-offset), var(--source-y-offset));
  }
  10% {
    opacity: 0.2;
    transform: scale(0.6) translate(calc(var(--source-x-offset) * 0.95), calc(var(--source-y-offset) * 0.95));
  }
  20% {
    opacity: 0.35;
    transform: scale(0.7) translate(calc(var(--source-x-offset) * 0.9), calc(var(--source-y-offset) * 0.9));
  }
  30% {
    opacity: 0.5;
    transform: scale(0.8) translate(calc(var(--source-x-offset) * 0.85), calc(var(--source-y-offset) * 0.85));
  }
  40% {
    opacity: 0.65;
    transform: scale(0.9) translate(calc(var(--source-x-offset) * 0.8), calc(var(--source-y-offset) * 0.8));
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) translate(calc(var(--source-x-offset) * 0.7), calc(var(--source-y-offset) * 0.7));
  }
  60% {
    opacity: 0.65;
    transform: scale(1.3) translate(calc(var(--source-x-offset) * 0.6), calc(var(--source-y-offset) * 0.6));
  }
  70% {
    opacity: 0.5;
    transform: scale(1.5) translate(calc(var(--source-x-offset) * 0.5), calc(var(--source-y-offset) * 0.5));
  }
  80% {
    opacity: 0.35;
    transform: scale(1.7) translate(calc(var(--source-x-offset) * 0.3), calc(var(--source-y-offset) * 0.3));
  }
  90% {
    opacity: 0.2;
    transform: scale(1.9) translate(calc(var(--source-x-offset) * 0.15), calc(var(--source-y-offset) * 0.15));
  }
  100% {
    opacity: 0;
    transform: scale(2) translate(calc(var(--source-x-offset) * -0.5), calc(var(--source-y-offset) * -0.5));
  }
`;

const ModalOverlay = styled.div<{ isOpen: boolean }>`
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
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  perspective: 1000px;
`;

const ModalContent = styled.div<{ isOpen: boolean; sourceX: number; sourceY: number }>`
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
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'scale(1)' : 'scale(0.8)'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  --source-x: ${props => props.sourceX}px;
  --source-y: ${props => props.sourceY}px;
  --source-x-offset: ${props => props.sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.sourceY - window.innerHeight / 2}px;
  --initial-rotation: ${props => Math.random() * 10 - 5}deg;
`;

const ProjectionBeam = styled.div<{ sourceX: number; sourceY: number }>`
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
  animation: ${beamLight} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  --source-x: ${props => props.sourceX}px;
  --source-y: ${props => props.sourceY}px;
  --source-x-offset: ${props => props.sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.sourceY - window.innerHeight / 2}px;
  --initial-rotation: ${props => Math.random() * 10 - 5}deg;
`;

const LensFlare = styled.div<{ sourceX: number; sourceY: number }>`
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
  animation: ${lensFlare} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  --source-x: ${props => props.sourceX}px;
  --source-y: ${props => props.sourceY}px;
  --source-x-offset: ${props => props.sourceX - window.innerWidth / 2}px;
  --source-y-offset: ${props => props.sourceY - window.innerHeight / 2}px;
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
  animation: ${projectImage} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
  if (!isOpen) return null;

  const sourceX = sourcePosition?.x || window.innerWidth / 2;
  const sourceY = sourcePosition?.y || window.innerHeight / 2;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <LensFlare sourceX={sourceX} sourceY={sourceY} />
      <ProjectionBeam sourceX={sourceX} sourceY={sourceY} />
      <ModalContent isOpen={isOpen} sourceX={sourceX} sourceY={sourceY} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ImageContainer>
          <ModalImage src={imageUrl} alt={title} />
        </ImageContainer>
        <ModalFooter>
          <ModalCaption>{caption}</ModalCaption>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
} 
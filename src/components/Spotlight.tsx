'use client';

import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';

interface SpotlightProps {
  intensity?: number;
  size?: number;
  blur?: number;
}

const SpotlightContainer = styled.div<{ $sourceX: number; $sourceY: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at ${props => props.$sourceX}px ${props => props.$sourceY}px,
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

export default function Spotlight({ intensity = 0.4, size = 10, blur = 50 }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 50, y: 50 });
  const targetPosition = useRef({ x: 50, y: 50 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      };
    };

    const animate = () => {
      if (containerRef.current) {
        position.current.x += (targetPosition.current.x - position.current.x) * 0.05;
        position.current.y += (targetPosition.current.y - position.current.y) * 0.05;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsSpotlightVisible(true);
  };

  const handleMouseLeave = () => {
    setIsSpotlightVisible(false);
  };

  return (
    <SpotlightContainer
      ref={containerRef}
      $sourceX={position.current.x}
      $sourceY={position.current.y}
      className={isSpotlightVisible ? 'visible' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
} 
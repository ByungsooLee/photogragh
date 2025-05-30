'use client';

import styled from 'styled-components';
import { useEffect, useRef } from 'react';

interface SpotlightProps {
  intensity?: number;
  size?: number;
  blur?: number;
}

const SpotlightContainer = styled.div<{ x: number; y: number; intensity: number; size: number; blur: number }>`
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  background: radial-gradient(
    circle at ${props => props.x}% ${props => props.y}%,
    transparent ${props => props.size}%,
    rgba(0, 0, 0, ${props => props.intensity}) ${props => props.size + props.blur}%
  );
  mix-blend-mode: multiply;
`;

export default function Spotlight({ intensity = 0.4, size = 10, blur = 50 }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 50, y: 50 });
  const targetPosition = useRef({ x: 50, y: 50 });
  const animationFrameRef = useRef<number | undefined>(undefined);

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

  return (
    <SpotlightContainer
      ref={containerRef}
      x={position.current.x}
      y={position.current.y}
      intensity={intensity}
      size={size}
      blur={blur}
    />
  );
} 
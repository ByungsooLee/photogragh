'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const loadProgress = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const LoadingWrapper = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: ${props => props.$isVisible ? fadeIn : fadeOut} 0.5s ease-in-out forwards;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const LoadingLogo = styled.h1`
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  font-size: 3rem;
  color: var(--gold);
  letter-spacing: 0.2em;
  margin: 0;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
`;

const LoadingProgress = styled.div`
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const LoadingBar = styled.div`
  height: 100%;
  background: var(--gold);
  animation: ${loadProgress} 2s ease-out forwards;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
`;

const LoadingText = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  letter-spacing: 0.1em;
`;

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <LoadingWrapper $isVisible={isVisible}>
      <LoadingContent>
        <LoadingLogo>L.MARK</LoadingLogo>
        <LoadingProgress>
          <LoadingBar />
        </LoadingProgress>
        <LoadingText>Preparing your experience...</LoadingText>
      </LoadingContent>
    </LoadingWrapper>
  );
};

export default LoadingScreen; 
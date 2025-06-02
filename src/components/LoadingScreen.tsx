'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const drawLogo = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`;

const fadeOut = keyframes`
  to {
    opacity: 0;
    pointer-events: none;
  }
`;

const LoadingScreenWrapper = styled.div<{ isReady: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: ${props => props.isReady ? fadeOut : 'none'} 0.5s ease-out forwards;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const LogoAnimation = styled.svg`
  width: 200px;
  height: 100px;
  margin-bottom: 2rem;

  text {
    font-size: 48px;
    font-weight: bold;
    fill: none;
    stroke: #fff;
    stroke-width: 2;
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: ${drawLogo} 2s ease-out forwards;
  }
`;

const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 1rem auto;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background-color: #fff;
  width: ${props => props.progress}%;
  transition: width 0.3s ease-out;
`;

const LoadingPercentage = styled.p`
  color: #fff;
  font-size: 14px;
  margin-top: 0.5rem;
`;

const LoadingScreen = () => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const images = document.querySelectorAll('img');
      const loaded = Array.from(images).filter(img => img.complete).length;
      const total = images.length || 1;
      const progress = Math.round((loaded / total) * 100);
      setLoadProgress(progress);
      
      if (progress === 100) {
        setTimeout(() => setIsReady(true), 300);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <LoadingScreenWrapper isReady={isReady}>
      <LoadingContent>
        <LogoAnimation viewBox="0 0 200 100">
          <text x="50%" y="50%" textAnchor="middle" dy=".3em">
            L.MARK
          </text>
        </LogoAnimation>
        <ProgressContainer>
          <ProgressBar progress={loadProgress} />
        </ProgressContainer>
        <LoadingPercentage>{loadProgress}%</LoadingPercentage>
      </LoadingContent>
    </LoadingScreenWrapper>
  );
};

export default LoadingScreen; 
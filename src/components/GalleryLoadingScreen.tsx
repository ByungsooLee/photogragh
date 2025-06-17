import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface GalleryLoadingScreenProps {
  progress: number;
  isReady?: boolean;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const LoadingScreenWrapper = styled.div<{ $isReady?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${props => props.$isReady ? fadeOut : fadeIn} 0.5s;
  pointer-events: ${props => props.$isReady ? 'none' : 'all'};
  opacity: ${props => props.$isReady ? 0 : 1};
  transition: opacity 0.5s;
  will-change: opacity, transform;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.h1`
  color: #fff;
  font-size: 2.8rem;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  letter-spacing: 0.08em;
  margin-bottom: 2.5rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.25);
`;

const ProgressContainer = styled.div`
  width: 240px;
  height: 8px;
  background: #222;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.2rem;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #fff 0%, #d4af37 100%);
  border-radius: 8px;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  will-change: width;
  transform: translateZ(0);
`;

const LoadingPercentage = styled.p`
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  letter-spacing: 0.08em;
  text-align: center;
`;

const GalleryLoadingScreen: React.FC<GalleryLoadingScreenProps> = ({ progress, isReady }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!isVisible) return null;

  return (
    <LoadingScreenWrapper $isReady={isReady}>
      <LoadingContent>
        <Logo>L.MARK</Logo>
        <ProgressContainer>
          <ProgressBar $progress={progress} />
        </ProgressContainer>
        <LoadingPercentage>{progress}%</LoadingPercentage>
      </LoadingContent>
    </LoadingScreenWrapper>
  );
};

export default GalleryLoadingScreen; 
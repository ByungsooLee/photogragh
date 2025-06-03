'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

const LoadingScreenWrapper = styled.div<{ $isReady: boolean }>`
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
  animation: ${props => props.$isReady ? fadeOut : 'none'} 0.5s ease-out forwards;
  will-change: opacity;
`;

const LoadingContent = styled.div`
  text-align: center;
  transform: translateZ(0);
`;

const LogoAnimation = styled.svg`
  width: 200px;
  height: 100px;
  margin-bottom: 2rem;
  will-change: transform;

  text {
    font-size: 48px;
    font-weight: bold;
    fill: none;
    stroke: #fff;
    stroke-width: 2;
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: ${drawLogo} 2s ease-out forwards;
    will-change: stroke-dashoffset;
  }
`;

const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 1rem auto;
  transform: translateZ(0);
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: #fff;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease-out;
  will-change: width;
  transform: translateZ(0);
`;

const LoadingPercentage = styled.p`
  color: #fff;
  font-size: 14px;
  margin-top: 0.5rem;
  transform: translateZ(0);
`;

interface HomeLoadingScreenProps {
  onLoadingComplete?: () => void;
}

const HomeLoadingScreen: React.FC<HomeLoadingScreenProps> = ({ onLoadingComplete }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);
  const startTimeRef = useRef(Date.now());
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const lastProgressRef = useRef(0);
  const progressTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const retryCountRef = useRef(0);
  const imageLoadListenersRef = useRef<Map<string, (e: Event) => void>>(new Map());

  const handleImageLoad = useCallback((e: Event) => {
    if (!mountedRef.current) return;
    const img = e.target as HTMLImageElement;
    if (img.dataset.priority === 'true') {
      console.log('[HomeLoadingScreen] Priority image loaded:', img.src);
      loadedImagesRef.current.add(img.src);
      // イベントリスナーを削除
      const listener = imageLoadListenersRef.current.get(img.src);
      if (listener) {
        img.removeEventListener('load', listener);
        imageLoadListenersRef.current.delete(img.src);
      }
    }
  }, []);

  const addImageLoadListener = useCallback((img: HTMLImageElement) => {
    if (img.dataset.priority === 'true' && !loadedImagesRef.current.has(img.src)) {
      const listener = (e: Event) => handleImageLoad(e);
      img.addEventListener('load', listener);
      imageLoadListenersRef.current.set(img.src, listener);
    }
  }, [handleImageLoad]);

  const updateProgress = useCallback(() => {
    if (!mountedRef.current) return;

    const images = Array.from(document.querySelectorAll('img[data-priority="true"]')) as HTMLImageElement[];
    console.log('[HomeLoadingScreen] Priority images found:', images.length);
    
    // 新しい画像にイベントリスナーを追加
    images.forEach(img => {
      if (!loadedImagesRef.current.has(img.src)) {
        addImageLoadListener(img);
      }
    });
    
    const total = images.length || 1;
    const loaded = images.filter(img => img.complete || loadedImagesRef.current.has(img.src)).length;
    
    // 画像読み込みの進捗（最大90%）
    const imageProgress = Math.round((loaded / total) * 90);
    
    // 時間ベースの進捗（残り10%）
    const elapsed = Date.now() - startTimeRef.current;
    const timeProgress = Math.min(Math.round((elapsed / 1000) * 10), 10);
    
    const progress = Math.min(imageProgress + timeProgress, 100);

    if (progress !== lastProgressRef.current) {
      console.log('[HomeLoadingScreen] Progress update:', {
        total,
        loaded,
        imageProgress,
        timeProgress,
        totalProgress: progress
      });
      lastProgressRef.current = progress;
    }

    setLoadProgress(progress);
    
    if (progress === 100) {
      console.log('[HomeLoadingScreen] Loading complete');
      setTimeout(() => {
        if (mountedRef.current) {
          setIsReady(true);
          onLoadingComplete?.();
        }
      }, 300);
    } else {
      progressTimeoutRef.current = requestAnimationFrame(updateProgress);
    }
  }, [onLoadingComplete, addImageLoadListener]);

  useEffect(() => {
    mountedRef.current = true;
    console.log('[HomeLoadingScreen] Component mounted');

    // DOMの変更を監視して新しい画像を検出
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLImageElement && node.dataset.priority === 'true') {
            console.log('[HomeLoadingScreen] New priority image detected:', {
              src: node.src,
              complete: node.complete,
              priority: node.dataset.priority
            });
            if (node.complete) {
              loadedImagesRef.current.add(node.src);
            } else {
              addImageLoadListener(node);
            }
          }
        }
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初期進捗更新を最大10回リトライ
    function tryUpdateProgress() {
      updateProgress();
      retryCountRef.current++;
      if (retryCountRef.current < 10 && loadProgress < 100) {
        setTimeout(tryUpdateProgress, 100);
      }
    }
    tryUpdateProgress();

    return () => {
      console.log('[HomeLoadingScreen] Component unmounting');
      mountedRef.current = false;
      
      // クリーンアップ時にrefをローカル変数にコピー
      const listeners = imageLoadListenersRef.current;
      listeners.forEach((listener, src) => {
        const img = document.querySelector(`img[src='${src}']`);
        if (img) {
          img.removeEventListener('load', listener);
        }
      });
      listeners.clear();
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (progressTimeoutRef.current) {
        cancelAnimationFrame(progressTimeoutRef.current);
      }
    };
  }, [handleImageLoad, updateProgress, addImageLoadListener, loadProgress]);

  return (
    <LoadingScreenWrapper $isReady={isReady}>
      <LoadingContent>
        <LogoAnimation viewBox="0 0 200 100">
          <text x="50%" y="50%" textAnchor="middle" dy=".3em">
            L.MARK
          </text>
        </LogoAnimation>
        <ProgressContainer>
          <ProgressBar $progress={loadProgress} />
        </ProgressContainer>
        <LoadingPercentage>{loadProgress}%</LoadingPercentage>
      </LoadingContent>
    </LoadingScreenWrapper>
  );
};

export default HomeLoadingScreen; 
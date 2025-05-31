import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { movieQuotes, type MovieQuote } from '../lib/movieQuotes';
import type { Photo } from '../lib/microcms';

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1001;
  padding: 0.5rem;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const PhotoContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
`;

const Photo = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
`;

const PhotoInfo = styled.div`
  padding: 1rem;
  color: white;
  text-align: center;
`;

const PhotoTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
`;

const PhotoCaption = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.8;
`;

const SwipeHint = styled.div`
  margin-top: 1.2rem;
  color: #ffe9a7;
  font-size: 1.08rem;
  text-align: center;
  opacity: 0.7;
  letter-spacing: 0.05em;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
`;

const QuoteOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PhotoContainer}:hover & {
    opacity: 1;
  }
`;

const Quote = styled.p`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const MovieInfo = styled.p`
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
  opacity: 0.8;
`;

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose }) => {
  const [selectedQuote, setSelectedQuote] = useState<MovieQuote | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setSelectedQuote(null);
    touchStart.current = null;
    touchEnd.current = null;
    // ランダムでセリフを選択
    const randomIndex = Math.floor(Math.random() * movieQuotes.length);
    setSelectedQuote(movieQuotes[randomIndex]);
  }, [photo]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const threshold = 30;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchEnd.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchEnd = () => {
      if (touchStart.current && touchEnd.current) {
        const dx = Math.abs(touchStart.current.x - touchEnd.current.x);
        const dy = Math.abs(touchStart.current.y - touchEnd.current.y);
        if (dx > threshold || dy > threshold) {
          onClose();
        }
      }
      touchStart.current = null;
      touchEnd.current = null;
    };
    overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
    overlay.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      overlay.removeEventListener('touchstart', handleTouchStart);
      overlay.removeEventListener('touchmove', handleTouchMove);
      overlay.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);

  return (
    <ModalOverlay ref={overlayRef} onClick={onClose}>
      <ModalContent onClick={() => {}}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <PhotoContainer>
          <Photo
            src={photo.url}
            alt={photo.title}
            style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            onLoad={() => setIsLoaded(true)}
          />
          {selectedQuote && (
            <QuoteOverlay>
              <Quote>{selectedQuote.quote}</Quote>
              <MovieInfo>{selectedQuote.movie} ({selectedQuote.year})</MovieInfo>
            </QuoteOverlay>
          )}
        </PhotoContainer>
        <PhotoInfo>
          <PhotoTitle>{photo.title}</PhotoTitle>
          {photo.caption && <PhotoCaption>{photo.caption}</PhotoCaption>}
          <SwipeHint>Swipe up or sideways to close</SwipeHint>
        </PhotoInfo>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PhotoModal; 
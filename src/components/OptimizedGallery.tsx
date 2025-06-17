'use client';

import { useState, useCallback, useRef, memo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

// Modalを遅延読み込み
const Modal = dynamic(() => import('./Modal'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

interface ImageData {
  id: string;
  src: string;
  alt: string;
  filmType: string;
  placeholder?: string;
  width?: number;
  height?: number;
}

interface GalleryItemProps {
  image: ImageData;
  onHover: () => void;
  onClick: () => void;
  priority: boolean;
}

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithNetwork extends Navigator {
  connection?: NetworkInformation;
}

const GalleryContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 768px) {
    min-height: 100svh;
    padding: 1rem;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const GalleryItemWrapper = styled.div<{ $isLoaded: boolean }>`
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.3s ease;

  &:hover {
    .image-overlay {
      opacity: 1;
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const FilmType = styled.span`
  color: var(--gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  letter-spacing: 0.1em;
`;

const getOptimalImageQuality = () => {
  // ネットワーク状態に基づく品質設定の最適化
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as NavigatorWithNetwork).connection;
    if (connection?.effectiveType === '4g') return 80;
    if (connection?.effectiveType === '3g') return 60;
    if (connection?.effectiveType === '2g') return 40;
  }
  return 70;
};

const GalleryItem = memo(({ image, onHover, onClick, priority }: GalleryItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isProgressiveLoaded, setIsProgressiveLoaded] = useState(false);
  const [imageQuality, setImageQuality] = useState(getOptimalImageQuality());
  const imageRef = useRef<HTMLDivElement>(null);
  
  // ネットワーク状態の監視
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as NavigatorWithNetwork).connection;
      const updateQuality = () => {
        setImageQuality(getOptimalImageQuality());
      };

      connection?.addEventListener('change', updateQuality);
      return () => connection?.removeEventListener('change', updateQuality);
    }
  }, [setImageQuality]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    // プログレッシブローディングの完了を通知
    setTimeout(() => {
      setIsProgressiveLoaded(true);
    }, 100);
  }, []);
  
  return (
    <GalleryItemWrapper 
      ref={imageRef}
      $isLoaded={isLoaded} 
      onMouseEnter={onHover} 
      onClick={onClick}
    >
      <ImageWrapper>
        {isVisible && (
          <>
            {!isProgressiveLoaded && image.placeholder && (
              <Image
                src={image.placeholder}
                alt={`${image.alt} (プレビュー)`}
                fill
                quality={10}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover', filter: 'blur(10px)' }}
                priority={priority}
              />
            )}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority}
              onLoad={handleImageLoad}
              placeholder="blur"
              blurDataURL={image.placeholder}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ 
                objectFit: 'cover',
                opacity: isProgressiveLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out'
              }}
              loading={priority ? 'eager' : 'lazy'}
              quality={imageQuality}
              fetchPriority={priority ? 'high' : 'auto'}
            />
          </>
        )}
        <ImageOverlay className="image-overlay">
          <FilmType>{image.filmType}</FilmType>
        </ImageOverlay>
      </ImageWrapper>
    </GalleryItemWrapper>
  );
});

GalleryItem.displayName = 'GalleryItem';

interface OptimizedGalleryProps {
  images: ImageData[];
}

const OptimizedGallery = ({ images }: OptimizedGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const preloadedImagesRef = useRef<Set<string>>(new Set());
  
  const preloadImage = useCallback((src: string) => {
    if (preloadedImagesRef.current.has(src)) return;
    
    const img = new window.Image();
    img.src = src;
    preloadedImagesRef.current.add(src);
  }, []);

  const handleImageHover = useCallback(() => {
    // ホバー時に次の画像をプリロード
    const currentIndex = images.findIndex(img => img.src === selectedImage?.src);
    if (currentIndex !== -1) {
      const nextImage = images[currentIndex + 1];
      if (nextImage) preloadImage(nextImage.src);
    }
  }, [images, selectedImage, preloadImage]);

  useEffect(() => {
    // 最初の4枚の画像をプリロード
    images.slice(0, 4).forEach(image => {
      preloadImage(image.src);
    });
  }, [images, preloadImage]);

  return (
    <GalleryContainer>
      <GalleryGrid>
        {images.map((image, index) => (
          <GalleryItem
            key={image.id}
            image={image}
            onHover={() => handleImageHover()}
            onClick={() => setSelectedImage(image)}
            priority={index < 4} // 最初の4枚を優先的に読み込む
          />
        ))}
      </GalleryGrid>
      
      {selectedImage && (
        <Suspense fallback={<div>Loading...</div>}>
          <Modal
            isOpen={true}
            onClose={() => setSelectedImage(null)}
            imageUrl={selectedImage.src}
            title={selectedImage.alt}
            caption={selectedImage.filmType}
          />
        </Suspense>
      )}
    </GalleryContainer>
  );
};

export default OptimizedGallery; 
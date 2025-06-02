'use client';

import { useState, useCallback, useRef, memo, useEffect } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Modal from './Modal';

interface ImageData {
  id: string;
  src: string;
  alt: string;
  filmType: string;
  placeholder?: string;
}

interface GalleryItemProps {
  image: ImageData;
  onHover: () => void;
  onClick: () => void;
  priority: boolean;
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

const GalleryItem = memo(({ image, onHover, onClick, priority }: GalleryItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <GalleryItemWrapper $isLoaded={isLoaded} onMouseEnter={onHover} onClick={onClick}>
      <ImageWrapper>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          placeholder="blur"
          blurDataURL={image.placeholder}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
        />
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const preloadImage = useCallback((src: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const handleImageHover = useCallback(() => {
    if (images[1]) preloadImage(images[1].src);
    if (images[0]) preloadImage(images[0].src);
  }, [images, preloadImage]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, [images]);

  return (
    <GalleryContainer>
      <GalleryGrid>
        {images.map((image) => (
          <GalleryItem
            key={image.id}
            image={image}
            onHover={() => handleImageHover()}
            onClick={() => setSelectedImage(image)}
            priority={false}
          />
        ))}
      </GalleryGrid>
      
      {selectedImage && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.src}
          title={selectedImage.alt}
          caption={selectedImage.filmType}
        />
      )}
    </GalleryContainer>
  );
};

export default OptimizedGallery; 
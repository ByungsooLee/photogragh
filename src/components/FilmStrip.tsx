'use client';

import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Photo } from '@/lib/microcms';

const StripWrapper = styled.div<{ $isVertical: boolean }>`
  position: relative;
  width: ${props => props.$isVertical ? 'auto' : '100%'};
  height: ${props => props.$isVertical ? '100%' : 'auto'};
  overflow: visible;
  margin: 0 auto;
  padding: 20px 0;
  min-height: 220px;

  @media (max-width: 1024px) {
    min-height: 200px;
  }

  @media (max-width: 768px) {
    min-height: 180px;
  }

  @media (max-width: 480px) {
    min-height: 160px;
  }
`;

const Strip = styled(motion.div)<{ $isVertical: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isVertical ? 'column' : 'row'};
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 20px 30px;
  position: relative;
  width: 120%;
  left: -10%;
  margin: 0 auto;

  @media (max-width: 1024px) {
    width: 130%;
    left: -15%;
    gap: 30px;
    padding: 15px 25px;
  }

  @media (max-width: 768px) {
    width: 100%;
    left: 0;
    gap: 20px;
    padding: 15px 20px;
  }

  @media (max-width: 480px) {
    gap: 15px;
    padding: 10px 15px;
  }
`;

const Frame = styled(motion.div)<{ $isVertical: boolean }>`
  position: relative;
  width: ${props => props.$isVertical ? '180px' : '240px'};
  height: ${props => props.$isVertical ? '240px' : '180px'};
  margin: 15px;
  cursor: pointer;
  transform-origin: center;
  transition: transform 0.3s ease;

  @media (max-width: 1024px) {
    width: ${props => props.$isVertical ? '160px' : '220px'};
    height: ${props => props.$isVertical ? '220px' : '160px'};
    margin: 12px;
  }

  @media (max-width: 768px) {
    width: ${props => props.$isVertical ? '140px' : '180px'};
    height: ${props => props.$isVertical ? '180px' : '140px'};
    margin: 10px;
  }

  @media (max-width: 480px) {
    width: ${props => props.$isVertical ? '120px' : '160px'};
    height: ${props => props.$isVertical ? '160px' : '120px'};
    margin: 8px;
  }

  &:hover {
    transform: scale(1.05);
    z-index: 2;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 2px solid var(--dark-gold);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
`;

interface FilmStripProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  isVertical?: boolean;
}

const FilmStrip: React.FC<FilmStripProps> = ({ photos, onPhotoClick, isVertical = false }) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <StripWrapper $isVertical={isVertical}>
      <Strip
        ref={stripRef}
        $isVertical={isVertical}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotate: isVertical ? (isHovered ? 2 : 0) : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        {photos.map((photo, index) => (
          <Frame
            key={photo.id}
            $isVertical={isVertical}
            onClick={() => onPhotoClick(photo)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, zIndex: 2 }}
          >
            <Image
              src={photo.image.url}
              alt={photo.title}
              loading="lazy"
            />
          </Frame>
        ))}
      </Strip>
    </StripWrapper>
  );
};

export default FilmStrip; 
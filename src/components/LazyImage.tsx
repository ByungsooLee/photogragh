import { useState } from 'react';
import Image from 'next/image';
import { ImageData } from '@/types/microcms';

interface LazyImageProps {
  imageData: ImageData;
  alt: string;
  className?: string;
}

export const LazyImage = ({ imageData, alt, className }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* ローディングプレースホルダー */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <Image
        src={imageData.url}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}; 
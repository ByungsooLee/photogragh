import Image from 'next/image';
import { ImageData } from '@/types/microcms';

interface ResponsiveImageProps {
  imageData: ImageData;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const ResponsiveImage = ({ imageData, alt, className, priority = false }: ResponsiveImageProps) => {
  return (
    <Image
      src={imageData.url}
      alt={alt}
      width={imageData.width || 1920}
      height={imageData.height || 1080}
      className={className}
      priority={priority}
      quality={90}
    />
  );
}; 
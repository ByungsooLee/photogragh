import { useRandomFilmImages } from '@/utils/randomImageSelector';
import { filmCategories } from '@/utils/imageData';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ImagePreloader from './ImagePreloader';
import useIsMobileOrTablet from '../hooks/useIsMobileOrTablet';
import Link from 'next/link';

/**
 * ホームページ用のギャラリーコンポーネント
 * Intersection Observerを使用した遅延読み込みを実装
 */
const HomeGallery = () => {
  // 表示する画像数を増やす（24枚）
  const randomImages = useRandomFilmImages(filmCategories, 24);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [visibleImages, setVisibleImages] = useState([]);
  
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // 画像の読み込み状態を更新するコールバック
  const handleImageLoad = useCallback((imgId) => {
    setLoadedImages(prev => new Set([...prev, imgId]));
  }, []);
  
  // Intersection Observerの設定
  useEffect(() => {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgId = entry.target.dataset.imageId;
            handleImageLoad(imgId);
            // 一度読み込まれた画像は監視を解除
            imageObserver.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '100px',
        threshold: 0.1
      }
    );
    
    // 画像要素を監視
    const images = document.querySelectorAll('[data-image-id]');
    images.forEach(img => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
  }, [handleImageLoad]);

  // 表示する画像を段階的に増やす
  useEffect(() => {
    const initialBatch = randomImages.slice(0, 12);
    setVisibleImages(initialBatch);

    const timer = setTimeout(() => {
      setVisibleImages(randomImages);
    }, 1000);

    return () => clearTimeout(timer);
  }, [randomImages]);
  
  // SP/タブレットのみ、画像リストの一部をランダムでロゴ画像に差し替える
  let displayImages = visibleImages;
  if (isMobileOrTablet && visibleImages.length > 0) {
    // 画像数分、必ずロゴ画像に差し替える（テスト用）
    displayImages = visibleImages.map((img) => {
      // ランダムでロゴ画像を選択
      const logo = logoImages[Math.floor(Math.random() * logoImages.length)];
      return { ...logo, id: `logo-${logo.type}-${Math.random()}` };
    });
  }
  
  return (
    <>
      {/* プリローダーの追加 */}
      <ImagePreloader 
        images={randomImages} 
        preloadCount={8}
        priority={true}
      />
      
      <div className="home-gallery grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {displayImages.map((image) => (
          <div 
            key={image.id} 
            className="gallery-item relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105"
            data-image-id={image.id}
          >
            {/* ロゴ画像の場合はリンク付きで表示 */}
            {image.link ? (
              <Link href={image.link} legacyBehavior>
                <a className="w-full h-full flex items-center justify-center bg-white">
                  <div style={{background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold'}}>LOGO</div>
                </a>
              </Link>
            ) : loadedImages.has(image.id) ? (
              <Image
                src={image.src}
                alt={image.alt || `Film photo ${image.id}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={image.thumbnail}
                loading="lazy"
                quality={85}
              />
            ) : (
              <div className="image-placeholder w-full h-full bg-gray-100 animate-pulse">
                <img 
                  src={image.thumbnail} 
                  alt=""
                  className="thumbnail-preview w-full h-full object-cover opacity-50"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

const logoImages = [
  {
    src: '/images/logo_about_01.png',
    alt: 'Aboutページへ',
    link: '/about',
    type: 'about',
  },
  {
    src: '/images/logo_gallery_01.jpg',
    alt: 'Galleryページへ',
    link: '/gallery',
    type: 'gallery',
  },
  {
    src: '/images/logo_gallery_02.jpg',
    alt: 'Galleryページへ',
    link: '/gallery',
    type: 'gallery',
  },
];

export default HomeGallery; 
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * 画像のプリロードを管理するコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Array} props.images - プリロードする画像の配列
 * @param {number} props.preloadCount - プリロードする画像の数（デフォルト: 4）
 * @param {boolean} props.priority - 優先的にプリロードするかどうか
 */
const ImagePreloader = ({ 
  images, 
  preloadCount = 4,
  priority = false 
}) => {
  const preloadedRef = useRef(new Set());
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);

  const processQueue = async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const image = queueRef.current.shift();

    if (!image || preloadedRef.current.has(image.src)) {
      isProcessingRef.current = false;
      processQueue();
      return;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image.src;
      
      if (priority) {
        link.fetchPriority = 'high';
      }

      await new Promise((resolve, reject) => {
        link.onload = () => {
          preloadedRef.current.add(image.src);
          resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
      });
    } catch (error) {
      console.error(`Failed to preload: ${image.src}`, error);
    }

    isProcessingRef.current = false;
    processQueue();
  };

  useEffect(() => {
    // プリロードする画像を選択
    const preloadImages = images.slice(0, preloadCount);
    
    // キューに追加
    queueRef.current = [...preloadImages];
    
    // キュー処理を開始
    processQueue();

    return () => {
      // クリーンアップ
      const links = document.querySelectorAll('link[rel="preload"][as="image"]');
      links.forEach(link => {
        if (preloadImages.some(img => img.src === link.href)) {
          link.remove();
        }
      });
      queueRef.current = [];
      isProcessingRef.current = false;
    };
  }, [images, preloadCount, priority]);

  return null;
};

ImagePreloader.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    })
  ).isRequired,
  preloadCount: PropTypes.number,
  priority: PropTypes.bool,
};

export default ImagePreloader; 
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

  useEffect(() => {
    // プリロードする画像を選択
    const preloadImages = images.slice(0, preloadCount);
    
    // プリロード処理
    const preloadImage = (image) => {
      if (preloadedRef.current.has(image.src)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image.src;
      
      // 優先度の設定
      if (priority) {
        link.fetchPriority = 'high';
      }

      // 画像の読み込み完了時の処理
      link.onload = () => {
        preloadedRef.current.add(image.src);
        console.log(`✓ Preloaded: ${image.src}`);
      };

      // エラー処理
      link.onerror = () => {
        console.error(`✗ Failed to preload: ${image.src}`);
      };

      document.head.appendChild(link);
    };

    // 画像のプリロードを実行
    preloadImages.forEach(preloadImage);

    // クリーンアップ関数
    return () => {
      // プリロードされたリンク要素を削除
      const links = document.querySelectorAll('link[rel="preload"][as="image"]');
      links.forEach(link => {
        if (preloadImages.some(img => img.src === link.href)) {
          link.remove();
        }
      });
    };
  }, [images, preloadCount, priority]);

  return null;
};

ImagePreloader.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired
    })
  ).isRequired,
  preloadCount: PropTypes.number,
  priority: PropTypes.bool
};

export default ImagePreloader; 
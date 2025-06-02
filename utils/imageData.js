/**
 * フィルムカテゴリごとの画像データを管理するユーティリティ
 */

export const filmCategories = {
  'Kodak400': [
    { 
      id: 'k400-1', 
      src: '/images/kodak400/img1.jpg', 
      thumbnail: '/images/kodak400/thumb1.jpg',
      alt: 'Kodak 400 - Image 1',
      category: 'Kodak400'
    },
    { 
      id: 'k400-2', 
      src: '/images/kodak400/img2.jpg', 
      thumbnail: '/images/kodak400/thumb2.jpg',
      alt: 'Kodak 400 - Image 2',
      category: 'Kodak400'
    }
  ],
  'Portra400': [
    { 
      id: 'p400-1', 
      src: '/images/portra400/img1.jpg', 
      thumbnail: '/images/portra400/thumb1.jpg',
      alt: 'Portra 400 - Image 1',
      category: 'Portra400'
    },
    { 
      id: 'p400-2', 
      src: '/images/portra400/img2.jpg', 
      thumbnail: '/images/portra400/thumb2.jpg',
      alt: 'Portra 400 - Image 2',
      category: 'Portra400'
    }
  ],
  'Gold200': [
    { 
      id: 'g200-1', 
      src: '/images/gold200/img1.jpg', 
      thumbnail: '/images/gold200/thumb1.jpg',
      alt: 'Gold 200 - Image 1',
      category: 'Gold200'
    }
  ]
};

/**
 * 画像データを取得するユーティリティ関数
 */
export const getImageData = (category) => {
  return filmCategories[category] || [];
};

/**
 * 特定の画像IDから画像データを取得する関数
 */
export const getImageById = (id) => {
  for (const category of Object.values(filmCategories)) {
    const image = category.find(img => img.id === id);
    if (image) return image;
  }
  return null;
};

/**
 * 利用可能なすべてのカテゴリを取得する関数
 */
export const getCategories = () => {
  return Object.keys(filmCategories);
}; 
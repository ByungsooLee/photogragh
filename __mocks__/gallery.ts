import type { GalleryItem } from '@/types/microcms';

// 開発用の最小モック。7月以前も含まれるよう複数月を用意
export const mockGallery: GalleryItem[] = [
  {
    id: 'mock-2025-09-01',
    title: 'Mock Sep Image',
    description: '',
    imageUrls: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=60'
    ],
    featured: true,
    tags: [],
    shootingDate: '2025-09-01',
    country2: 'JP',
    metadata: '',
    category3: 'person'
  },
  {
    id: 'mock-2025-07-01',
    title: 'Mock Jul Image',
    description: '',
    imageUrls: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=60'
    ],
    featured: false,
    tags: [],
    shootingDate: '2025-07-01',
    country2: 'JP',
    metadata: '',
    category3: 'portrait'
  },
  {
    id: 'mock-2025-05-01',
    title: 'Mock May Image',
    description: '',
    imageUrls: [
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=60'
    ],
    featured: false,
    tags: [],
    shootingDate: '2025-05-01',
    country2: 'JP',
    metadata: '',
    category3: 'bath'
  }
];



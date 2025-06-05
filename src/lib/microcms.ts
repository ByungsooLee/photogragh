import { createClient } from 'microcms-js-sdk';
import type { GalleryItem, MicroCMSResponse } from '@/types/microcms';
export type { GalleryItem } from '@/types/microcms';

const serviceDomain = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.NEXT_PUBLIC_MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error('microCMSの環境変数が設定されていません。');
  console.error('NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN:', serviceDomain);
  console.error('NEXT_PUBLIC_MICROCMS_API_KEY:', apiKey ? '設定済み' : '未設定');
}

const client = createClient({
  serviceDomain: serviceDomain || '',
  apiKey: apiKey || '',
});

const ENDPOINT = 'gallery';

const fields = [
  'id',
  'title',
  'description',
  'imageUrls',
  'featured',
  'tags',
  'shootingDate',
  'country2',
  'metadata',
  'category3'
];

export const getGallery = async (params?: { limit?: number; offset?: number; filters?: string }): Promise<{ items: GalleryItem[]; totalCount?: number }> => {
  try {
    const response = await client.get<MicroCMSResponse>({
      endpoint: ENDPOINT,
      queries: {
        fields,
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.offset ? { offset: params.offset } : {}),
        ...(params?.filters ? { filters: params.filters } : {})
      }
    });
    if (!response.contents || response.contents.length === 0) {
      return { items: [], totalCount: 0 };
    }
    console.log('imageUrls:', response.contents.map(p => p.imageUrls));
    return { items: response.contents, totalCount: response.totalCount };
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return { items: [], totalCount: 0 };
  }
}; 
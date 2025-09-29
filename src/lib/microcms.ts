import { createClient } from 'microcms-js-sdk';
import type { GalleryItem, MicroCMSResponse } from '@/types/microcms';
// 開発環境のためのモックデータ
// （本番ビルドで問題ないよう静的インポート）
import { mockGallery } from '../../__mocks__/gallery';
export type { GalleryItem } from '@/types/microcms';

const serviceDomain = process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.NEXT_PUBLIC_MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error('microCMSの環境変数が設定されていません。');
  console.error('NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN:', serviceDomain);
  console.error('NEXT_PUBLIC_MICROCMS_API_KEY:', apiKey ? '設定済み' : '未設定');
}

const hasMicrocmsEnv = Boolean(serviceDomain && apiKey);

let client: ReturnType<typeof createClient> | null = null;
if (hasMicrocmsEnv) {
  client = createClient({
    serviceDomain: serviceDomain || '',
    apiKey: apiKey || '',
  });
}

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
  // 環境変数が無い場合はモックにフォールバック
  if (!hasMicrocmsEnv || !client) {
    const limit = params?.limit ?? mockGallery.length;
    const offset = params?.offset ?? 0;
    const items = applyFiltersForMock(mockGallery, params?.filters).slice(offset, offset + limit);
    return { items, totalCount: mockGallery.length };
  }
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
    return { items: response.contents, totalCount: response.totalCount };
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return { items: [], totalCount: 0 };
  }
};

// 全件取得（ページング）
export const getAllGallery = async (params?: { filters?: string; pageSize?: number }): Promise<GalleryItem[]> => {
  const limit = params?.pageSize ?? 100;
  let offset = 0;
  const allItems: GalleryItem[] = [];
  let totalCount: number | undefined = undefined;

  // 1回目の取得でtotalCountを把握し、以降はoffsetでページング
  while (true) {
    const { items, totalCount: tc } = await getGallery({ limit, offset, filters: params?.filters });
    if (typeof totalCount === 'undefined' && typeof tc === 'number') {
      totalCount = tc;
    }
    if (items.length === 0) break;
    allItems.push(...items);
    if (items.length < limit) break; // 最終ページ
    offset += limit;
    if (typeof totalCount === 'number' && offset >= totalCount) break;
  }

  return allItems;
};

function applyFiltersForMock(items: GalleryItem[], filters?: string): GalleryItem[] {
  if (!filters) return items;
  let result = items;
  // featured[equals]true を簡易対応
  if (filters.includes('featured[equals]true')) {
    result = result.filter((i) => i.featured === true);
  }
  return result;
}
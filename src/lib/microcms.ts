import 'server-only';

import { createClient } from 'microcms-js-sdk';
import type { GalleryItem, MicroCMSResponse } from '@/types/microcms';
// Mock data for local development.
// Statically imported so production builds remain safe.
import { mockGallery } from '../../__mocks__/gallery';
export type { GalleryItem } from '@/types/microcms';

const serviceDomain =
  process.env.MICROCMS_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY || process.env.NEXT_PUBLIC_MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error('microCMS environment variables are not configured.');
  console.error('MICROCMS_SERVICE_DOMAIN:', serviceDomain ? 'configured' : 'not configured');
  console.error('MICROCMS_API_KEY:', apiKey ? 'configured' : 'not configured');
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
  // Fall back to mock data when environment variables are missing.
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

// Fetch all items with pagination.
export const getAllGallery = async (params?: { filters?: string; pageSize?: number }): Promise<GalleryItem[]> => {
  const limit = params?.pageSize ?? 100;
  let offset = 0;
  const allItems: GalleryItem[] = [];
  let totalCount: number | undefined = undefined;

  // Read totalCount on the first request, then page with offset.
  while (true) {
    const { items, totalCount: tc } = await getGallery({ limit, offset, filters: params?.filters });
    if (typeof totalCount === 'undefined' && typeof tc === 'number') {
      totalCount = tc;
    }
    if (items.length === 0) break;
    allItems.push(...items);
    if (items.length < limit) break; // Last page
    offset += limit;
    if (typeof totalCount === 'number' && offset >= totalCount) break;
  }

  return allItems;
};

function applyFiltersForMock(items: GalleryItem[], filters?: string): GalleryItem[] {
  if (!filters) return items;
  let result = items;
  // Minimal support for featured[equals]true.
  if (filters.includes('featured[equals]true')) {
    result = result.filter((i) => i.featured === true);
  }
  return result;
}
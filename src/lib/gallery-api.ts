import type { GalleryItem } from '@/types/microcms';

export type GalleryCategoryCount = {
  key: string;
  label: string;
  count: number;
};

export type GalleryApiResponse = {
  items: GalleryItem[];
  totalCount: number;
  categoryCounts: GalleryCategoryCount[];
  hasMore: boolean;
  nextOffset: number | null;
};

type FetchGalleryPageOptions = {
  limit?: number;
  offset?: number;
  category?: string;
  all?: boolean;
};

export async function fetchGalleryPage(options: FetchGalleryPageOptions = {}): Promise<GalleryApiResponse> {
  const params = new URLSearchParams();

  if (typeof options.limit === 'number') params.set('limit', String(options.limit));
  if (typeof options.offset === 'number') params.set('offset', String(options.offset));
  if (options.category && options.category !== 'all') params.set('category', options.category);
  if (options.all) params.set('all', '1');

  const query = params.toString();
  const response = await fetch(`/api/gallery${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gallery: ${response.status}`);
  }

  return response.json() as Promise<GalleryApiResponse>;
}

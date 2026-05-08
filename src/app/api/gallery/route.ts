import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { getAllGallery } from '@/lib/microcms';
import { buildCategoryKey, getCategoryCounts, normalizeCategory } from '@/lib/gallery-images';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 120;
const REVALIDATE_SECONDS = 60 * 30;

const getCachedGallery = unstable_cache(
  async () => getAllGallery({ pageSize: 100 }),
  ['gallery-all-items'],
  { revalidate: REVALIDATE_SECONDS }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get('limit') || DEFAULT_LIMIT);
  const requestedOffset = Number(searchParams.get('offset') || 0);
  const category = searchParams.get('category');
  const requestAll = searchParams.get('all') === '1';

  const limit = requestAll
    ? MAX_LIMIT * 100
    : Math.max(1, Math.min(MAX_LIMIT, Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT));
  const offset = Math.max(0, Number.isFinite(requestedOffset) ? requestedOffset : 0);

  try {
    const allItems = await getCachedGallery();
    const categoryCounts = getCategoryCounts(allItems);
    const filteredItems = category
      ? allItems.filter((photo) => buildCategoryKey(normalizeCategory(photo)) === category.toLowerCase())
      : allItems;

    const items = requestAll ? filteredItems : filteredItems.slice(offset, offset + limit);
    const totalCount = filteredItems.length;
    const nextOffset = requestAll || offset + limit >= totalCount ? null : offset + limit;

    return NextResponse.json(
      {
        items,
        totalCount,
        categoryCounts,
        hasMore: nextOffset !== null,
        nextOffset,
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS}`,
        },
      }
    );
  } catch (error) {
    console.error('Failed to serve gallery API:', error);

    return NextResponse.json(
      {
        items: [],
        totalCount: 0,
        categoryCounts: [],
        hasMore: false,
        nextOffset: null,
      },
      { status: 500 }
    );
  }
}

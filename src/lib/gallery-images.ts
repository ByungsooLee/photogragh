import type { GalleryItem } from '@/types/microcms';

export type ImageSet = {
  original?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumb?: string;
};

type GalleryImageVariant = keyof ImageSet;

const categoryFallbackMap = {
  work: 'Work',
  home: 'Interior',
} as const;

function firstValidUrl(...candidates: Array<string | undefined>) {
  return candidates.find((candidate) => isValidUrl(candidate)) || '';
}

export function parseImageUrls(imageUrls: string | string[] | undefined): ImageSet {
  const raw = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;
  if (!raw) return {};

  try {
    const obj = JSON.parse(raw);
    return {
      original: obj['オリジナル画像'],
      large: obj['大サイズ'],
      medium: obj['中サイズ'],
      small: obj['小サイズ'],
      thumb: obj['サムネイル'],
    };
  } catch {
    return { original: raw, large: raw, medium: raw, small: raw, thumb: raw };
  }
}

export function isValidUrl(url?: string): url is string {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getImageVariant(urls: ImageSet, preferred: GalleryImageVariant[]) {
  return firstValidUrl(...preferred.map((variant) => urls[variant]));
}

export function getGalleryGridImage(urls: ImageSet) {
  return getImageVariant(urls, ['small', 'thumb', 'medium', 'large', 'original']);
}

export function getGalleryCardPriorityImage(urls: ImageSet) {
  return getImageVariant(urls, ['medium', 'small', 'large', 'original', 'thumb']);
}

export function getModalPreviewImage(urls: ImageSet, isMobileViewport: boolean) {
  return isMobileViewport
    ? getImageVariant(urls, ['medium', 'small', 'large', 'original', 'thumb'])
    : getImageVariant(urls, ['large', 'medium', 'original', 'small', 'thumb']);
}

export function getModalFullImage(urls: ImageSet, isMobileViewport: boolean) {
  return isMobileViewport
    ? getImageVariant(urls, ['large', 'medium', 'original', 'small', 'thumb'])
    : getImageVariant(urls, ['original', 'large', 'medium', 'small', 'thumb']);
}

export function getPhotoImageByPreference(
  photo: GalleryItem | null | undefined,
  preferred: GalleryImageVariant[]
) {
  if (!photo) return '';
  return getImageVariant(parseImageUrls(photo.imageUrls), preferred);
}

export function normalizeCategory(photo: GalleryItem, fallback: string = categoryFallbackMap.work) {
  const raw = Array.isArray(photo.category3) ? photo.category3[0] : photo.category3;
  const value = (raw || photo.tags?.[0] || fallback).trim();

  if (!value) return fallback;

  const normalized = value.toLowerCase();
  if (normalized.includes('portrait') || normalized.includes('person')) return 'Portrait';
  if (normalized.includes('landscape')) return 'Landscape';
  if (normalized.includes('bath')) return 'Interior';

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildCategoryKey(label: string) {
  return label.trim().toLowerCase();
}

export function getCategoryCounts(photos: GalleryItem[], fallback: string = categoryFallbackMap.work) {
  const counts = new Map<string, { key: string; label: string; count: number }>();

  photos.forEach((photo) => {
    const label = normalizeCategory(photo, fallback);
    const key = buildCategoryKey(label);
    const current = counts.get(key);

    if (current) {
      current.count += 1;
      return;
    }

    counts.set(key, { key, label, count: 1 });
  });

  return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label));
}

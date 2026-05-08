'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Header, { HeaderFlowSpacer } from '@/components/Header';
import Modal from '@/components/Modal';
import { getAllGallery, type GalleryItem } from '@/lib/microcms';

type ImageSet = {
  original?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumb?: string;
};

const Page = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.08), transparent 32vw),
    radial-gradient(circle at 84% 12%, rgba(92, 106, 118, 0.16), transparent 28vw),
    linear-gradient(180deg, #111216 0%, var(--paper) 64%, #020203 100%);
`;

const Toolbar = styled.section`
  position: sticky;
  top: 76px;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 20px;
  padding: 22px clamp(18px, 4vw, 56px);
  background: rgba(8, 9, 11, 0.86);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px) saturate(1.05);

  @media (max-width: 760px) {
    top: 103px;
    grid-template-columns: 1fr;
    padding: 18px;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  color: rgba(248, 245, 239, 0.58);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  margin-bottom: 7px;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(3.1rem, 6.6vw, 7.4rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 0.82;
  text-transform: uppercase;
  color: var(--ink);
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.58);
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 14px;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  border: 0;
  border: 1px solid ${props => props.$active ? 'var(--ink)' : 'var(--line)'};
  border-left-color: var(--ink);
  border-right-color: var(--ink);
  background: ${props => props.$active ? 'rgba(248, 245, 239, 0.12)' : 'transparent'};
  color: ${props => props.$active ? 'var(--ink)' : 'var(--muted)'};
  cursor: pointer;
  padding: 6px 10px 5px;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &:hover,
  &:focus-visible {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  &:focus-visible {
    outline: none;
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(10px, 1.8vw, 24px);
  padding: clamp(18px, 3vw, 42px) clamp(12px, 3vw, 42px) clamp(56px, 8vw, 112px);

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const WorkItem = styled.button<{ $wide?: boolean; $tall?: boolean }>`
  grid-column: span ${props => props.$wide ? 6 : 4};
  position: relative;
  aspect-ratio: ${props => props.$tall ? '3 / 4' : props.$wide ? '16 / 10' : '4 / 3'};
  border: 1px solid rgba(248, 245, 239, 0.14);
  background: #050506;
  cursor: zoom-in;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-column: span 6;
  }

  @media (max-width: 760px) {
    grid-column: span ${props => props.$wide ? 2 : 1};
  }

  img {
    filter: saturate(0.9) contrast(1.05) brightness(0.94);
    transition: transform 700ms ease, filter 700ms ease;
  }

  &:hover img,
  &:focus-visible img {
    transform: scale(1.035);
    filter: saturate(1.02) contrast(1.08) brightness(1.02);
  }

  &:focus-visible {
    outline: 1px solid var(--gold);
    outline-offset: 4px;
  }
`;

const Overlay = styled.span`
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  gap: 4px;
  padding: 36px 14px 14px;
  color: #fff;
  text-align: left;
  background: linear-gradient(180deg, transparent, rgba(2, 2, 3, 0.84));
  opacity: 0;
  transition: opacity 220ms ease;

  ${WorkItem}:hover &,
  ${WorkItem}:focus-visible & {
    opacity: 1;
  }
`;

const WorkTitle = styled.span`
  color: var(--paper-soft);
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: 1.25rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const WorkMeta = styled.span`
  opacity: 0.78;
  color: rgba(248, 245, 239, 0.7);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StateMessage = styled.div`
  grid-column: 1 / -1;
  padding: 72px 24px;
  color: var(--muted);
  text-align: center;
`;

function parseImageUrls(imageUrls: string | string[] | undefined): ImageSet {
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

function isValidUrl(url?: string): url is string {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function normalizeCategory(photo: GalleryItem) {
  const raw = Array.isArray(photo.category3) ? photo.category3[0] : photo.category3;
  return raw || photo.tags?.[0] || 'Work';
}

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalPhoto, setModalPhoto] = useState<GalleryItem | null>(null);
  const [modalSession, setModalSession] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const items = await getAllGallery();
        setPhotos(items);
      } catch {
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) setSelectedCategory(category.toLowerCase());
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach((photo) => {
      const category = normalizeCategory(photo);
      counts.set(category.toLowerCase(), (counts.get(category.toLowerCase()) || 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return photos;
    return photos.filter((photo) => normalizeCategory(photo).toLowerCase() === selectedCategory);
  }, [photos, selectedCategory]);

  const modalUrls = parseImageUrls(modalPhoto?.imageUrls);
  const modalImage = modalUrls.original || modalUrls.large || modalUrls.medium || '';
  const isModalOpen = Boolean(modalPhoto && isValidUrl(modalImage));

  const openPhoto = (photo: GalleryItem) => {
    setModalSession((session) => session + 1);
    setModalPhoto(photo);
  };

  return (
    <Page>
      <Header fixed />
      <HeaderFlowSpacer aria-hidden="true" />
      <Toolbar>
        <TitleBlock>
          <Eyebrow>/{filteredPhotos.length || photos.length || 100} Photos</Eyebrow>
          <Title>Work</Title>
        </TitleBlock>
        <Filters aria-label="Category filters">
          <FilterButton
            type="button"
            $active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </FilterButton>
          {categories.map(([category, count]) => (
            <FilterButton
              key={category}
              type="button"
              $active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({count})
            </FilterButton>
          ))}
        </Filters>
      </Toolbar>

      <Grid aria-busy={isLoading}>
        {isLoading && <StateMessage>Loading...</StateMessage>}
        {!isLoading && filteredPhotos.length === 0 && <StateMessage>No photos in this category.</StateMessage>}
        {filteredPhotos.map((photo, index) => {
          const urls = parseImageUrls(photo.imageUrls);
          const src = urls.large || urls.medium || urls.original;
          if (!isValidUrl(src)) return null;
          return (
            <WorkItem
              key={photo.id}
              type="button"
              onClick={() => openPhoto(photo)}
              $wide={index % 9 === 0 || index % 9 === 5}
              $tall={index % 7 === 2 || index % 7 === 4}
              aria-label={`${photo.title}を表示`}
            >
              <Image
                src={src}
                alt={photo.title || ''}
                fill
                sizes="(max-width: 760px) 50vw, (max-width: 980px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={index < 6}
                quality={88}
              />
              <Overlay>
                <WorkTitle>{photo.title}</WorkTitle>
                <WorkMeta>{normalizeCategory(photo)} {photo.shootingDate ? `/ ${photo.shootingDate.slice(0, 4)}` : ''}</WorkMeta>
              </Overlay>
            </WorkItem>
          );
        })}
      </Grid>

      {isModalOpen && (
        <Modal
          key={`gallery-modal-${modalSession}`}
          isOpen
          onClose={() => setModalPhoto(null)}
          imageUrl={modalImage}
          title={modalPhoto?.title || ''}
          caption={modalPhoto?.description || ''}
        />
      )}
    </Page>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import Header, { HeaderFlowSpacer } from '@/components/Header';
import Modal from '@/components/Modal';
import { useIsMaxWidth } from '@/hooks/useIsMaxWidth';
import { MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from '@/lib/breakpoints';
import { getAllGallery, type GalleryItem } from '@/lib/microcms';

type ImageSet = {
  original?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumb?: string;
};

const MOBILE_COMPACT_THRESHOLD = 88;

const Page = styled.main`
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.08), transparent 32vw),
    radial-gradient(circle at 84% 12%, rgba(92, 106, 118, 0.16), transparent 28vw),
    linear-gradient(180deg, #111216 0%, var(--paper) 64%, #020203 100%);

  @supports (height: 100svh) {
    height: 100svh;
  }
`;

const DesktopFixedHeader = styled.div`
  flex-shrink: 0;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: none;
  }
`;

const ScrollViewport = styled.div<{ $menuOpen: boolean }>`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    overflow-y: ${props => props.$menuOpen ? 'hidden' : 'auto'};
  }
`;

const MobileIntro = styled.section`
  display: none;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: grid;
    gap: 16px;
    padding:
      calc(env(safe-area-inset-top, 0px) + 12px)
      16px
      18px;
    background: linear-gradient(180deg, rgba(8, 9, 11, 0.92), rgba(8, 9, 11, 0.84));
    border-bottom: 1px solid var(--line);
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    gap: 14px;
    padding:
      calc(env(safe-area-inset-top, 0px) + 10px)
      22px
      16px;
  }
`;

const MobileBrand = styled(Link)`
  display: grid;
  gap: 4px;
  color: var(--ink);
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(1.9rem, 10vw, 3.2rem);
  font-weight: 400;
  letter-spacing: 0.035em;
  line-height: 0.8;
  text-transform: uppercase;
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.62);

  small {
    font-family: var(--font-inter), sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: rgba(248, 245, 239, 0.62);
    text-shadow: none;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: clamp(1.7rem, 4.4vw, 2.4rem);
    letter-spacing: 0.04em;

    small {
      font-size: 0.58rem;
      letter-spacing: 0.2em;
    }
  }
`;

const MobileNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
`;

const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  color: var(--ink);
  opacity: ${props => props.$active ? 1 : 0.78};
  border: 1px solid ${props => props.$active ? 'currentColor' : 'transparent'};
  border-left-color: currentColor;
  border-right-color: currentColor;
  padding: 7px 12px 5px;
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(0.98rem, 3.8vw, 1.18rem);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  transition: color 180ms ease, border-color 180ms ease, opacity 180ms ease;

  &:hover,
  &:focus-visible {
    opacity: 1;
    border-color: currentColor;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    padding: 6px 10px 4px;
    font-size: 0.96rem;
  }
`;

const MobileCompactBar = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 56;
  display: none;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding:
      calc(env(safe-area-inset-top, 0px) + 12px)
      16px
      12px;
    background: color-mix(in srgb, #050506 90%, transparent);
    border-bottom: 1px solid rgba(248, 245, 239, 0.12);
    backdrop-filter: blur(16px) saturate(1.05);
    -webkit-backdrop-filter: blur(16px) saturate(1.05);
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: ${props => props.$visible ? 'auto' : 'none'};
    transform: translateY(${props => props.$visible ? '0' : '-120%'});
    transition: opacity 220ms ease, transform 220ms ease;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    padding:
      calc(env(safe-area-inset-top, 0px) + 10px)
      22px
      10px;
  }
`;

const CompactBrand = styled(Link)`
  min-width: 0;
  color: var(--ink);
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(1.4rem, 7vw, 2rem);
  letter-spacing: 0.05em;
  line-height: 0.9;
  text-transform: uppercase;

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: 1.55rem;
  }
`;

const CompactMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(248, 245, 239, 0.18);
  background: rgba(248, 245, 239, 0.06);
  color: var(--ink);
  padding: 10px 12px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:focus-visible {
    outline: 1px solid var(--ink);
    outline-offset: 3px;
  }

  span:last-child {
    font-size: 0.72rem;
    font-weight: 700;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    gap: 8px;
    padding: 8px 10px;

    span:last-child {
      font-size: 0.68rem;
    }
  }
`;

const CompactMenuIcon = styled.span<{ $open: boolean }>`
  display: inline-grid;
  gap: 4px;

  i {
    display: block;
    width: 16px;
    height: 1px;
    background: currentColor;
    transition: transform 180ms ease, opacity 180ms ease;
  }

  i:nth-child(1) {
    transform: ${props => props.$open ? 'translateY(5px) rotate(45deg)' : 'none'};
  }

  i:nth-child(2) {
    opacity: ${props => props.$open ? 0 : 1};
  }

  i:nth-child(3) {
    transform: ${props => props.$open ? 'translateY(-5px) rotate(-45deg)' : 'none'};
  }
`;

const MobileMenuBackdrop = styled.button<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 54;
  display: none;
  border: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.52);
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: block;
    opacity: ${props => props.$open ? 1 : 0};
    pointer-events: ${props => props.$open ? 'auto' : 'none'};
  }
`;

const MobileMenuPanel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 74px);
  right: 12px;
  left: 12px;
  z-index: 55;
  display: none;
  padding: 18px;
  background: rgba(8, 9, 11, 0.96);
  border: 1px solid rgba(248, 245, 239, 0.12);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(18px) saturate(1.05);
  -webkit-backdrop-filter: blur(18px) saturate(1.05);
  transform: translateY(${props => props.$open ? '0' : '-10px'});
  opacity: ${props => props.$open ? 1 : 0};
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
  transition: opacity 200ms ease, transform 200ms ease;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: grid;
    gap: 18px;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    top: calc(env(safe-area-inset-top, 0px) + 58px);
    right: 18px;
    left: auto;
    width: min(380px, calc(100vw - 36px));
    padding: 15px;
    gap: 14px;
  }
`;

const MobileMenuSection = styled.section`
  display: grid;
  gap: 10px;

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    gap: 8px;
  }
`;

const MobileMenuLabel = styled.span`
  color: rgba(248, 245, 239, 0.56);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: 0.62rem;
  }
`;

const MobileMenuTitle = styled.h2`
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(2.2rem, 12vw, 3.4rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 0.84;
  text-transform: uppercase;
  color: var(--ink);

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: clamp(2rem, 5vw, 2.7rem);
  }
`;

const MobileMenuCount = styled.div`
  color: var(--paper-soft);
  font-size: 0.86rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: 0.78rem;
  }
`;

const Toolbar = styled.section`
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 20px;
  padding: 22px clamp(18px, 4vw, 56px);
  background: rgba(8, 9, 11, 0.86);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px) saturate(1.05);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    position: relative;
    top: auto;
    z-index: 1;
    padding: 18px;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    gap: 16px;
    padding: 16px 20px 14px;
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

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: 0.66rem;
    margin-bottom: 4px;
  }
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

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: clamp(2.4rem, 5.8vw, 3.8rem);
    line-height: 0.86;
  }
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 14px;

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    justify-content: flex-start;
  }

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    gap: 8px 10px;
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
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

  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) and (max-width: ${TABLET_BREAKPOINT}px) {
    padding: 5px 9px 4px;
    font-size: 0.74rem;
  }
`;

const DesktopOnly = styled.div`
  @media (max-width: ${TABLET_BREAKPOINT}px) {
    display: none;
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(10px, 1.8vw, 24px);
  padding: clamp(18px, 3vw, 42px) clamp(12px, 3vw, 42px) clamp(56px, 8vw, 112px);

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
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

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
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
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const isMobileViewport = useIsMaxWidth(TABLET_BREAKPOINT);

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

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const syncCompactHeader = () => {
      if (!isMobileViewport) {
        setIsCompactHeader(false);
        return;
      }
      setIsCompactHeader(viewport.scrollTop > MOBILE_COMPACT_THRESHOLD);
    };

    syncCompactHeader();
    viewport.addEventListener('scroll', syncCompactHeader, { passive: true });
    return () => viewport.removeEventListener('scroll', syncCompactHeader);
  }, [isMobileViewport]);

  useEffect(() => {
    if (!isMobileViewport || !isCompactHeader) {
      setIsMobileMenuOpen(false);
    }
  }, [isCompactHeader, isMobileViewport]);

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
  const photoCount = selectedCategory === 'all' ? (photos.length || 100) : filteredPhotos.length;

  const openPhoto = (photo: GalleryItem) => {
    setModalSession((session) => session + 1);
    setModalPhoto(photo);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsMobileMenuOpen(false);
  };

  return (
    <Page>
      <DesktopFixedHeader>
        <Header fixed />
        <HeaderFlowSpacer aria-hidden="true" />
      </DesktopFixedHeader>

      <MobileCompactBar $visible={isCompactHeader && !isModalOpen}>
        <CompactBrand href="/" aria-label="L.MARK home">L.MARK</CompactBrand>
        <CompactMenuButton
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="gallery-mobile-menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <CompactMenuIcon $open={isMobileMenuOpen} aria-hidden="true">
            <i />
            <i />
            <i />
          </CompactMenuIcon>
          <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
        </CompactMenuButton>
      </MobileCompactBar>

      <MobileMenuBackdrop
        type="button"
        $open={isMobileMenuOpen}
        aria-label="Close gallery menu"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <MobileMenuPanel
        id="gallery-mobile-menu"
        $open={isMobileMenuOpen}
        aria-hidden={!isMobileMenuOpen}
      >
        <MobileMenuSection>
          <MobileMenuLabel>Navigation</MobileMenuLabel>
          <MobileNav aria-label="Gallery mobile navigation">
            <MobileNavLink href="/gallery" $active onClick={() => setIsMobileMenuOpen(false)}>
              Work
            </MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </MobileNavLink>
          </MobileNav>
        </MobileMenuSection>

        <MobileMenuSection>
          <MobileMenuLabel>Overview</MobileMenuLabel>
          <MobileMenuCount>/{photoCount} Photos</MobileMenuCount>
          <MobileMenuTitle>Work</MobileMenuTitle>
        </MobileMenuSection>

        <MobileMenuSection>
          <MobileMenuLabel>Categories</MobileMenuLabel>
          <Filters aria-label="Category filters">
            <FilterButton
              type="button"
              $active={selectedCategory === 'all'}
              onClick={() => handleCategorySelect('all')}
            >
              All
            </FilterButton>
            {categories.map(([category, count]) => (
              <FilterButton
                key={category}
                type="button"
                $active={selectedCategory === category}
                onClick={() => handleCategorySelect(category)}
              >
                {category} ({count})
              </FilterButton>
            ))}
          </Filters>
        </MobileMenuSection>
      </MobileMenuPanel>

      <ScrollViewport ref={scrollViewportRef} $menuOpen={isMobileMenuOpen}>
        <MobileIntro>
          <MobileBrand href="/" aria-label="L.MARK home">
            <span>L.MARK</span>
            <small>Photo Picture Archive</small>
          </MobileBrand>
          <MobileNav aria-label="Gallery navigation">
            <MobileNavLink href="/gallery" $active>
              Work
            </MobileNavLink>
            <MobileNavLink href="/about">
              About
            </MobileNavLink>
          </MobileNav>
        </MobileIntro>

        <Toolbar>
          <TitleBlock>
            <Eyebrow>/{photoCount} Photos</Eyebrow>
            <Title>Work</Title>
          </TitleBlock>
          <DesktopOnly>
            <Filters aria-label="Category filters">
              <FilterButton
                type="button"
                $active={selectedCategory === 'all'}
                onClick={() => handleCategorySelect('all')}
              >
                All
              </FilterButton>
              {categories.map(([category, count]) => (
                <FilterButton
                  key={category}
                  type="button"
                  $active={selectedCategory === category}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category} ({count})
                </FilterButton>
              ))}
            </Filters>
          </DesktopOnly>
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
                aria-label={`View ${photo.title || 'photo'}`}
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
      </ScrollViewport>

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

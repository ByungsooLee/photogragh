"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styled, { css, keyframes } from 'styled-components';
import Header from './Header';
import Modal from './Modal';
import { getAllGallery, type GalleryItem } from '../lib/microcms';

type ImageSet = {
  original?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumb?: string;
};

type Mode = 'grid' | 'full';

type Viewport = {
  width: number;
  height: number;
};

type RandomPhoto = {
  photo: GalleryItem;
  category: string;
  mediumSrc: string;
  largeSrc: string;
  originalSrc: string;
};

const referenceCategories = ['Interior', 'Landscape', 'Portrait'];
const copies = [-1, 0, 1];
const slotLayout = [
  { shift: 3, left: 46, top: 5, scale: 0.92, rotate: -0.8, shape: 'portrait', primary: false },
  { shift: 2, left: 57, top: 20, scale: 0.94, rotate: 0.6, shape: 'wide', primary: false },
  { shift: 1, left: 45, top: 35, scale: 0.94, rotate: -0.4, shape: 'square', primary: false },
  { shift: 0, left: 54, top: 50, scale: 0.98, rotate: 0.3, shape: 'portrait', primary: false },
  { shift: -1, left: 43, top: 65, scale: 0.94, rotate: 0.9, shape: 'wide', primary: false },
  { shift: -2, left: 56, top: 80, scale: 0.94, rotate: -0.6, shape: 'square', primary: false },
  { shift: -3, left: 47, top: 95, scale: 0.92, rotate: 0.7, shape: 'wide', primary: false },
] as const;

const splashReveal = keyframes`
  0% { clip-path: inset(28vh 42vw 28vh 42vw); opacity: 1; }
  45% { clip-path: inset(20vh 38vw 20vh 38vw); opacity: 1; }
  100% { clip-path: inset(0 0 0 0); opacity: 0; }
`;

const titleIn = keyframes`
  from { transform: translateY(1.1em); }
  to { transform: translateY(0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const singeFlicker = keyframes`
  0% { opacity: 0.14; transform: scale(1) translate3d(0, 0, 0); }
  35% { opacity: 0.28; transform: scale(1.015) translate3d(1px, -1px, 0); }
  60% { opacity: 0.2; transform: scale(1.025) translate3d(-1px, 1px, 0); }
  100% { opacity: 0.3; transform: scale(1.03) translate3d(0, 0, 0); }
`;

const Page = styled.main`
  position: fixed;
  inset: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--film-black);
  color: var(--paper-soft);
  touch-action: none;
`;

const Stage = styled.section<{ $tone: 'light' | 'dark' }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(circle at 50% 42%, #2a2219 0%, #17120d 48%, #080604 100%);
  color: var(--paper-soft);
  transition: background 520ms ease;

  ${props => props.$tone === 'dark' && css`
    color: var(--paper-soft);
  `}

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
  }

  &::before {
    background:
      radial-gradient(circle at 50% 42%, transparent 0 38%, rgba(0, 0, 0, 0.3) 72%, rgba(0, 0, 0, 0.7) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.68) 0 3.2vw, transparent 3.2vw calc(100% - 3.2vw), rgba(0, 0, 0, 0.68) calc(100% - 3.2vw));
    opacity: 0.52;
  }

  &::after {
    inset: 1.2vw;
    border: 1px solid rgba(246, 235, 207, 0.16);
    box-shadow: inset 0 0 0 1px rgba(201, 154, 52, 0.14);
  }
`;

const VirtualCanvas = styled.div<{ $mode: Mode }>`
  position: absolute;
  inset: 0;
  opacity: ${props => props.$mode === 'grid' ? 1 : 0.22};
  pointer-events: ${props => props.$mode === 'grid' ? 'auto' : 'none'};
  transition: opacity 420ms ease;
`;

const CategorySection = styled.div<{ $baseX: number; $width: number; $active: boolean }>`
  position: absolute;
  top: clamp(112px, 11.5vh, 138px);
  left: 0;
  width: ${props => props.$width}px;
  height: clamp(660px, 89vh, 760px);
  transform: translate3d(calc(${props => props.$baseX}px - var(--scroll-offset, 0px)), 0, 0);
  will-change: transform;
  pointer-events: ${props => props.$active ? 'auto' : 'none'};
`;

const PhotoSlot = styled.div<{
  $shift?: number;
  $left: number;
  $top: number;
  $scale: number;
  $rotate: number;
}>`
  position: absolute;
  display: grid;
  place-items: center;
  left: ${props => props.$left}%;
  top: ${props => props.$top}%;
  transform: translate3d(
    calc(-50% + ${props => (props.$shift || 0) * -12}px * var(--scroll-velocity, 0)),
    calc(-50% + ${props => (props.$shift || 0) * 34}px * var(--scroll-velocity, 0)),
    0
  ) rotate(${props => props.$rotate}deg) scale(${props => props.$scale});
  transition: z-index 180ms ease, transform 180ms ease;
  will-change: transform, z-index;

  &:hover,
  &:focus-within {
    z-index: 8;
  }
`;

const PhotoButton = styled.button<{
  $active: boolean;
  $shape: 'square' | 'wide' | 'portrait';
  $primary: boolean;
}>`
  position: relative;
  width: ${props => {
    if (props.$shape === 'wide') return 'clamp(142px, 11.8vw, 188px)';
    if (props.$shape === 'portrait') return 'clamp(82px, 6.8vw, 110px)';
    return 'clamp(108px, 8.9vw, 144px)';
  }};
  aspect-ratio: ${props => {
    if (props.$shape === 'wide') return '16 / 9';
    if (props.$shape === 'portrait') return '2 / 3';
    return '1 / 1';
  }};
  border: 1px solid rgba(226, 190, 103, 0.34);
  background:
    linear-gradient(135deg, #0a0705 0%, #24180f 50%, #050403 100%);
  cursor: zoom-in;
  overflow: hidden;
  opacity: ${props => props.$active ? 0.98 : 0.18};
  filter: ${props => props.$active ? 'sepia(0.12) saturate(0.95) contrast(1.03)' : 'grayscale(0.86) sepia(0.24) brightness(0.74)'};
  box-shadow:
    inset 0 0 0 4px #050403,
    inset 0 0 0 5px rgba(246, 235, 207, 0.16),
    0 0 0 1px rgba(201, 154, 52, 0.22),
    0 10px 18px rgba(0, 0, 0, 0.34);
  transform: translate3d(calc(var(--scroll-velocity, 0) * 10px), 0, 0)
    skewY(calc(var(--scroll-velocity, 0) * -1.2deg))
    scaleX(calc(1 + (var(--scroll-speed, 0) * 0.07)))
    scale(0.98);
  transform-origin: 50% 50%;
  transition: opacity 180ms ease, filter 180ms ease, box-shadow 180ms ease;
  will-change: transform, opacity, filter;

  &:hover,
  &:focus-visible {
    opacity: 1;
    filter: sepia(0.08) saturate(1.12) contrast(1.08) brightness(1.2);
    box-shadow:
      inset 0 0 0 6px #050403,
      inset 0 0 0 7px rgba(246, 235, 207, 0.24),
      0 0 0 1px rgba(246, 235, 207, 0.64),
      0 14px 24px rgba(0, 0, 0, 0.46);
  }

  &:focus-visible {
    outline: 1px solid var(--gold);
    outline-offset: 5px;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    ${props => props.$shape === 'wide' ? css`
      left: 10px;
      right: 10px;
      height: 5px;
      width: auto;
      background:
        radial-gradient(circle, rgba(246, 235, 207, 0.78) 0 1.55px, transparent 1.8px) left center / 9px 5px repeat-x;
    ` : css`
      top: 8px;
      bottom: 8px;
      width: 5px;
      background:
        radial-gradient(circle, rgba(246, 235, 207, 0.78) 0 1.55px, transparent 1.8px) center top / 5px 9px repeat-y;
    `}
    z-index: 2;
    pointer-events: none;
    opacity: ${props => props.$active ? 0.86 : 0.42};
  }

  &::before {
    ${props => props.$shape === 'wide' ? 'top: 4px;' : 'left: 4px;'}
  }

  &::after {
    ${props => props.$shape === 'wide' ? 'bottom: 4px;' : 'right: 4px;'}
  }

  & > span::before {
    content: "";
    position: absolute;
    inset: ${props => props.$shape === 'wide' ? '9px 8px' : '8px 10px'};
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      radial-gradient(circle at 50% 12%, rgba(255, 214, 120, 0.28) 0%, rgba(255, 162, 72, 0.18) 18%, rgba(0, 0, 0, 0) 42%),
      radial-gradient(circle at 18% 50%, rgba(255, 120, 44, 0.14) 0%, rgba(0, 0, 0, 0) 34%),
      radial-gradient(circle at 82% 50%, rgba(255, 120, 44, 0.14) 0%, rgba(0, 0, 0, 0) 34%),
      linear-gradient(180deg, rgba(255, 220, 140, 0.06), rgba(33, 8, 0, 0.22) 66%, rgba(0, 0, 0, 0.4));
    transition: opacity 220ms ease;
  }

  & > span::after {
    content: "";
    position: absolute;
    inset: ${props => props.$shape === 'wide' ? '9px 8px' : '8px 10px'};
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      repeating-linear-gradient(
        180deg,
        rgba(255, 213, 133, 0.03) 0 2px,
        rgba(72, 24, 4, 0.08) 2px 4px,
        rgba(0, 0, 0, 0) 4px 7px
      );
    filter: blur(0.4px);
    transition: opacity 220ms ease;
  }

  img {
    object-fit: cover;
    opacity: 1;
    inset: ${props => props.$shape === 'wide' ? '9px 8px' : '8px 10px'} !important;
    width: ${props => props.$shape === 'wide' ? 'calc(100% - 16px)' : 'calc(100% - 20px)'} !important;
    height: ${props => props.$shape === 'wide' ? 'calc(100% - 18px)' : 'calc(100% - 16px)'} !important;
    border: 1px solid rgba(246, 235, 207, 0.18);
    transform: translate3d(calc(var(--scroll-velocity, 0) * -12px), 0, 0)
      scale(calc(1 + (var(--scroll-speed, 0) * 0.045)));
    transform-origin: center;
    will-change: transform;
    transition: filter 220ms ease, opacity 220ms ease, transform 220ms ease;
  }

  @media (max-width: 760px) {
    width: ${props => {
      if (props.$shape === 'wide') return '42vw';
      if (props.$shape === 'portrait') return '26vw';
      return '33vw';
    }};
  }

  &:hover,
  &:focus-visible {
    & > span::before,
    & > span::after {
      opacity: 1;
    }

    & > span::before {
      animation: ${singeFlicker} 560ms ease-out forwards;
    }

    img {
      filter: sepia(0.24) saturate(1.16) contrast(1.08) brightness(1.02);
    }
  }
`;

const FullLayer = styled.div<{ $mode: Mode }>`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: radial-gradient(circle at center, #2f2118 0%, #120e0a 72%);
  opacity: ${props => props.$mode === 'full' ? 1 : 0};
  pointer-events: ${props => props.$mode === 'full' ? 'auto' : 'none'};
  transition: opacity 520ms ease;
`;

const FullPanel = styled.button<{
  $x: number;
  $width: number;
  $active: boolean;
  $side: boolean;
}>`
  position: absolute;
  top: 0;
  left: 50%;
  height: 100vh;
  width: ${props => props.$width}px;
  border: 1px solid rgba(246, 235, 207, 0.18);
  background: #050403;
  overflow: hidden;
  cursor: ${props => props.$active ? 'zoom-in' : 'pointer'};
  opacity: ${props => props.$active ? 1 : 0.24};
  filter: ${props => props.$active ? 'sepia(0.12) saturate(0.95)' : 'grayscale(1) sepia(0.3) brightness(0.68)'};
  box-shadow:
    0 0 0 1px rgba(246, 235, 207, 0.22),
    0 26px 70px rgba(0, 0, 0, 0.45);
  transform: translate3d(
      calc(-50% + ${props => props.$x}px + (var(--scroll-velocity, 0) * ${props => props.$active ? 30 : 15}px)),
      0,
      0
    )
    skewY(calc(var(--scroll-velocity, 0) * ${props => props.$active ? -1.65 : -0.72}deg))
    scaleX(calc(1 + (var(--scroll-speed, 0) * ${props => props.$active ? 0.065 : 0.032})))
    scale(${props => props.$active ? 1 : 0.98});
  transform-origin: 50% 50%;
  transition: opacity 420ms ease, filter 420ms ease;
  will-change: transform;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 20px;
    bottom: 20px;
    z-index: 2;
    width: 7px;
    pointer-events: none;
    background:
      radial-gradient(circle, rgba(246, 235, 207, 0.78) 0 2.1px, transparent 2.3px) center top / 7px 18px repeat-y;
    opacity: ${props => props.$active ? 0.76 : 0.3};
  }

  &::before {
    left: 10px;
  }

  &::after {
    right: 10px;
  }

  &:hover {
    opacity: ${props => props.$side ? 0.36 : 1};
  }

  img {
    object-fit: cover;
    opacity: 1;
    inset: ${props => props.$active ? '20px 24px' : '14px 18px'} !important;
    width: ${props => props.$active ? 'calc(100% - 48px)' : 'calc(100% - 36px)'} !important;
    height: ${props => props.$active ? 'calc(100% - 40px)' : 'calc(100% - 28px)'} !important;
    border: 1px solid rgba(246, 235, 207, 0.16);
    transform: translate3d(calc(var(--scroll-velocity, 0) * ${props => props.$active ? -22 : -10}px), 0, 0)
      scale(calc(1 + (var(--scroll-speed, 0) * ${props => props.$active ? 0.055 : 0.025})));
    transform-origin: center;
    will-change: transform;
  }

  @media (max-width: 760px) {
    display: ${props => props.$side ? 'none' : 'block'};
    left: 0;
    top: 0;
    width: 100vw;
    height: 100dvh;
    border: none;
    box-shadow: none;
    opacity: 1;
    filter: none;
    transform: none;

    &::before,
    &::after {
      display: none;
    }

    img {
      object-fit: contain;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      border: none;
      transform: none;
    }
  }
`;

const FixedUi = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
`;

const Cross = styled.div`
  position: absolute;
  top: 3.2vh;
  left: 50%;
  width: 13px;
  height: 13px;
  transform: translateX(-50%);

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: var(--gold);
    opacity: 0.86;
  }

  &::before {
    left: 6px;
    top: 0;
    width: 1px;
    height: 13px;
  }

  &::after {
    left: 0;
    top: 6px;
    width: 13px;
    height: 1px;
  }
`;

const ModeSwitch = styled.div`
  position: absolute;
  right: 1.35vw;
  bottom: 1.25vw;
  display: flex;
  gap: 10px;
  pointer-events: auto;

  @media (max-width: 760px) {
    right: 2.2vw;
    bottom: 2vh;
    gap: 8px;
  }
`;

const ModeButton = styled.button<{ $active: boolean; $variant: Mode }>`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${props => props.$active ? 'currentColor' : 'color-mix(in srgb, currentColor 28%, transparent)'};
  background: rgba(8, 6, 4, 0.58);
  color: inherit;
  opacity: ${props => props.$active ? 0.96 : 0.38};
  cursor: ${props => props.$active ? 'default' : 'pointer'};
  transition: opacity 240ms ease, border-color 240ms ease;

  &:hover {
    opacity: 1;
  }

  span {
    display: grid;
    gap: ${props => props.$variant === 'grid' ? '2px' : '3px'};
    width: ${props => props.$variant === 'grid' ? '19px' : '22px'};
    height: 19px;
    grid-template-columns: ${props => props.$variant === 'grid' ? 'repeat(3, 1fr)' : '4px 1fr 4px'};
  }

  i {
    display: block;
    background: currentColor;
    min-height: ${props => props.$variant === 'grid' ? '4px' : '19px'};
  }
`;

const Splash = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: ${props => props.$hidden ? 'none' : 'block'};
  background:
    radial-gradient(circle at 50% 45%, #48301e 0%, #17120d 72%),
    var(--film-black);
  color: var(--paper-soft);
  pointer-events: none;
`;

const SplashImage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  animation: ${splashReveal} 1900ms cubic-bezier(.65,0,.35,1) forwards;

  > div {
    position: relative;
    width: min(22vw, 280px);
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border: 1px solid rgba(246, 235, 207, 0.32);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);

    img {
      filter: sepia(0.35) saturate(0.82) contrast(1.06);
    }
  }
`;

const SplashTitle = styled.div`
  position: absolute;
  top: 1.5vh;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(86px, 18vw, 320px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 0.72;
  text-transform: uppercase;
  color: var(--gold);
  text-shadow:
    0 3px 0 var(--blood-red),
    0 14px 34px rgba(0, 0, 0, 0.42);

  span {
    display: inline-block;
    transform: translateY(1.1em);
    animation: ${titleIn} 1100ms cubic-bezier(.32,.94,.6,1) forwards;
    animation-delay: 220ms;
  }
`;

const SplashBottom = styled.div`
  position: absolute;
  left: 1.7vw;
  right: 1.7vw;
  bottom: 1.4vw;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  gap: 20px;
  opacity: 0;
  animation: ${fadeUp} 900ms cubic-bezier(.32,.94,.6,1) 420ms forwards;

  p {
    grid-column: 2;
    color: rgba(246, 235, 207, 0.8);
    font-size: clamp(12px, 0.82vw, 15px);
    line-height: 1.55;
    letter-spacing: 0.1em;
    text-align: left;
    text-transform: uppercase;
  }

  strong {
    justify-self: end;
    color: var(--gold);
    font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
    font-size: clamp(46px, 5.4vw, 96px);
    font-weight: 400;
    line-height: 0.78;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    left: 5vw;
    right: 5vw;

    p,
    strong {
      grid-column: 1;
      justify-self: start;
    }
  }
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
  const value = raw || photo.tags?.[0] || 'Interior';
  if (value.toLowerCase().includes('portrait') || value.toLowerCase().includes('person')) return 'Portrait';
  if (value.toLowerCase().includes('landscape')) return 'Landscape';
  if (value.toLowerCase().includes('bath')) return 'Interior';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function photoSrc(photo?: GalleryItem | null, size: keyof ImageSet = 'medium') {
  if (!photo) return '';
  const urls = parseImageUrls(photo.imageUrls);
  return urls[size] || urls.large || urls.medium || urls.original || '';
}

function positiveModulo(value: number, length: number) {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

function getLoopIndex(scroll: number, sectionWidth: number, groupCount: number) {
  if (sectionWidth <= 0 || groupCount <= 0) return 0;
  const loopWidth = sectionWidth * groupCount;
  return positiveModulo(Math.round(positiveModulo(scroll, loopWidth) / sectionWidth), groupCount);
}

function getSectionPhoto<T>(photos: T[], index: number) {
  if (!photos.length) return null;
  return photos[index % photos.length];
}

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function pickRandomPhoto(pool: RandomPhoto[], seed: number, recentIds: Set<string>, preferredCategory?: string) {
  if (!pool.length) return null;

  const categoryCandidates = preferredCategory
    ? pool.filter((item) => item.category === preferredCategory && !recentIds.has(item.photo.id))
    : [];
  const freshCandidates = pool.filter((item) => !recentIds.has(item.photo.id));
  const candidates = categoryCandidates.length ? categoryCandidates : freshCandidates.length ? freshCandidates : pool;
  const index = Math.floor(seededRandom(seed) * candidates.length);
  return candidates[index] || null;
}

export default function HomeClient() {
  const pageRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollTargetRef = useRef(0);
  const scrollCurrentRef = useRef(0);
  const seedRef = useRef(12437);
  const activeStreamSectionRef = useRef(0);
  const fullIndexRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; scroll: number } | null>(null);

  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<Mode>('grid');
  const [activeStreamSection, setActiveStreamSection] = useState(0);
  const [fullIndex, setFullIndex] = useState(0);
  const [viewport, setViewport] = useState<Viewport>({ width: 1440, height: 900 });
  const [modalPhoto, setModalPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    seedRef.current = Math.floor(Date.now() % 100000);

    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const items = await getAllGallery({ pageSize: 100 });
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
    const timeout = window.setTimeout(() => setShowSplash(false), 2300);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      document.documentElement.style.setProperty('--grid-home', `${window.innerWidth / 60}px`);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const photoPool = useMemo<RandomPhoto[]>(() => {
    return photos
      .map((photo) => {
        const src = photoSrc(photo, 'medium');
        if (!isValidUrl(src)) return null;
        const largeSrc = photoSrc(photo, 'large');
        const originalSrc = photoSrc(photo, 'original');
        const category = normalizeCategory(photo);
        const fallback = referenceCategories.includes(category) ? category : referenceCategories[0];
        return {
          photo,
          category: fallback,
          mediumSrc: src,
          largeSrc: isValidUrl(largeSrc) ? largeSrc : src,
          originalSrc: isValidUrl(originalSrc) ? originalSrc : largeSrc || src,
        };
      })
      .filter((item): item is RandomPhoto => Boolean(item));
  }, [photos]);

  const sectionWidth = viewport.width < 760
    ? Math.max(138, viewport.width * 0.31)
    : Math.min(Math.max(164, viewport.width * 0.17), 232);
  const streamSectionCount = Math.max(18, Math.min(42, Math.ceil(Math.max(photoPool.length, 1) / slotLayout.length)));
  const loopWidth = sectionWidth * streamSectionCount;
  const randomSections = useMemo(() => {
    const recentIds = new Set<string>();
    const recentQueue: string[] = [];
    const recentLimit = Math.max(slotLayout.length, Math.min(72, Math.floor(photoPool.length * 0.72)));

    return Array.from({ length: streamSectionCount }, (_, sectionIndex) => {
      const photosForSection = slotLayout.map((_, slotIndex) => {
        const preferredCategory = referenceCategories[(sectionIndex + slotIndex) % referenceCategories.length];
        const photo = pickRandomPhoto(
          photoPool,
          seedRef.current + activeStreamSection * 101 + sectionIndex * 37 + slotIndex * 13,
          recentIds,
          preferredCategory
        );
        if (photo) {
          recentIds.add(photo.photo.id);
          recentQueue.push(photo.photo.id);
          if (recentQueue.length > recentLimit) {
            const expired = recentQueue.shift();
            if (expired) recentIds.delete(expired);
          }
        }
        return photo;
      });

      return {
        key: `${activeStreamSection}-${sectionIndex}`,
        photos: photosForSection,
      };
    });
  }, [activeStreamSection, photoPool, streamSectionCount]);
  const fullPhotos = useMemo(() => {
    const flattened = randomSections.flatMap((section) => section.photos).filter((photo): photo is RandomPhoto => Boolean(photo));
    return flattened.length ? flattened : photoPool;
  }, [photoPool, randomSections]);
  const currentPhoto = getSectionPhoto(fullPhotos, fullIndex);
  const prevPhoto = getSectionPhoto(fullPhotos, fullIndex - 1 + Math.max(fullPhotos.length, 1));
  const nextPhoto = getSectionPhoto(fullPhotos, fullIndex + 1);
  const modalImage = photoSrc(modalPhoto, 'original');
  const tone = 'dark';
  const isImmersiveMobile = viewport.width < 760 && Boolean(modalPhoto && isValidUrl(modalImage));

  useEffect(() => {
    const tick = () => {
      const current = scrollCurrentRef.current;
      const target = scrollTargetRef.current;
      const next = current + (target - current) * 0.16;
      const velocity = next - current;
      const wrappedScroll = positiveModulo(next, loopWidth);
      const easedVelocity = Math.max(-1, Math.min(1, velocity / 38));

      scrollCurrentRef.current = Math.abs(velocity) < 0.001 ? target : next;
      if (pageRef.current) {
        pageRef.current.style.setProperty('--scroll-offset', `${wrappedScroll}px`);
        pageRef.current.style.setProperty('--scroll-velocity', `${easedVelocity}`);
        pageRef.current.style.setProperty('--scroll-speed', `${Math.abs(easedVelocity)}`);
      }

      const streamSection = Math.floor(scrollCurrentRef.current / Math.max(sectionWidth, 1));
      const nextFullIndex = getLoopIndex(scrollCurrentRef.current, sectionWidth, Math.max(fullPhotos.length, 1));

      if (streamSection !== activeStreamSectionRef.current) {
        activeStreamSectionRef.current = streamSection;
        setActiveStreamSection(streamSection);
      }

      if (nextFullIndex !== fullIndexRef.current) {
        fullIndexRef.current = nextFullIndex;
        setFullIndex(nextFullIndex);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [fullPhotos.length, loopWidth, sectionWidth]);

  useEffect(() => {
    const node = pageRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      scrollTargetRef.current += axis * (viewport.width < 760 ? 1.45 : 1.18);
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [viewport.width]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    touchStartRef.current = { x: event.clientX, y: event.clientY, scroll: scrollTargetRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!touchStartRef.current) return;
    const dx = touchStartRef.current.x - event.clientX;
    const dy = touchStartRef.current.y - event.clientY;
    scrollTargetRef.current = touchStartRef.current.scroll + (Math.abs(dx) > Math.abs(dy) ? dx : dy) * 1.65;
  };

  const handlePointerUp = () => {
    touchStartRef.current = null;
  };

  const openPhoto = (photo?: GalleryItem | null) => {
    if (photo) setModalPhoto(photo);
  };

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    scrollTargetRef.current += sectionWidth * (viewport.width < 760 ? 1.15 : 2.5);
  };

  return (
    <Page
      ref={pageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {!isImmersiveMobile && <Header variant={tone} workHref="/" />}
      <Stage $tone={tone}>
        <VirtualCanvas $mode={mode}>
          {copies.map((copy) => randomSections.map((section, sectionIndex) => {
            const x = viewport.width / 2 - sectionWidth / 2 + copy * loopWidth + sectionIndex * sectionWidth;
            const visibleX = x - positiveModulo(scrollCurrentRef.current, loopWidth);
            const renderMargin = sectionWidth * 2;
            if (visibleX < -renderMargin || visibleX > viewport.width + renderMargin) return null;
            const activeIndex = positiveModulo(activeStreamSection, streamSectionCount);
            const distance = Math.abs(sectionIndex - activeIndex);
            const loopDistance = Math.min(distance, streamSectionCount - distance);
            const active = loopDistance <= 4;
            return (
              <CategorySection
                key={`${copy}-${section.key}`}
                $baseX={x}
                $width={sectionWidth}
                $active={active}
                aria-hidden={!active}
              >
                {slotLayout.map((layout, slot) => {
                      const photo = section.photos[slot];
                      if (!photo || !isValidUrl(photo.mediumSrc)) {
                        return (
                          <PhotoSlot
                            key={slot}
                            $shift={layout.shift}
                            $left={layout.left}
                            $top={layout.top}
                            $scale={layout.scale}
                            $rotate={layout.rotate}
                          />
                        );
                      }
                      return (
                        <PhotoSlot
                          key={`${photo.photo.id}-${slot}`}
                          $shift={layout.shift}
                          $left={layout.left}
                          $top={layout.top}
                          $scale={layout.scale}
                          $rotate={layout.rotate}
                        >
                          <PhotoButton
                            type="button"
                            $active={active}
                            $shape={layout.shape}
                            $primary={false}
                            onClick={() => openPhoto(photo.photo)}
                            aria-label={`${photo.photo.title || 'Photo'}を表示`}
                          >
                            <Image
                              src={photo.mediumSrc}
                              alt={photo.photo.title || ''}
                              fill
                              sizes="(max-width: 760px) 32vw, 12vw"
                              quality={70}
                              priority={copy === 0 && loopDistance <= 1 && slot < 2}
                            />
                          </PhotoButton>
                        </PhotoSlot>
                      );
                })}
              </CategorySection>
            );
          }))}
        </VirtualCanvas>

        <FullLayer $mode={mode}>
          {[
            { photo: prevPhoto, x: -viewport.width * 0.54, active: false, label: 'Previous photo' },
            { photo: currentPhoto, x: 0, active: true, label: `${currentPhoto?.photo.title || 'Photo'}を表示` },
            { photo: nextPhoto, x: viewport.width * 0.54, active: false, label: 'Next photo' },
          ].map((panel) => {
            if (!panel.photo || !isValidUrl(panel.photo.largeSrc)) return null;
            return (
              <FullPanel
                key={`${panel.photo.photo.id}-${panel.x}`}
                $x={panel.x}
                $width={panel.active ? Math.min(viewport.width * 0.58, 920) : Math.min(viewport.width * 0.48, 760)}
                $active={panel.active}
                $side={!panel.active}
                onClick={() => panel.active ? openPhoto(panel.photo?.photo) : (scrollTargetRef.current += panel.x > 0 ? sectionWidth : -sectionWidth)}
                aria-label={panel.label}
              >
                <Image src={panel.photo.largeSrc} alt={panel.active ? panel.photo.photo.title || '' : ''} fill sizes={panel.active ? '60vw' : '40vw'} quality={90} priority={panel.active} />
              </FullPanel>
            );
          })}
        </FullLayer>

        {!isImmersiveMobile && (
          <FixedUi>
            <Cross />
            <ModeSwitch aria-label="Display mode">
              <ModeButton type="button" $active={mode === 'grid'} $variant="grid" onClick={() => switchMode('grid')} aria-label="Grid mode">
                <span>{Array.from({ length: 9 }).map((_, index) => <i key={index} />)}</span>
              </ModeButton>
              <ModeButton type="button" $active={mode === 'full'} $variant="full" onClick={() => switchMode('full')} aria-label="Full mode">
                <span><i /><i /><i /></span>
              </ModeButton>
            </ModeSwitch>
          </FixedUi>
        )}
      </Stage>

      <Splash $hidden={!showSplash && !isLoading}>
        <SplashImage>
          <div>
            <Image
              src="/images/logo_about_01.jpg"
              alt=""
              fill
              sizes="30vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </SplashImage>
        <SplashTitle>
          <span>L.MARK</span>
        </SplashTitle>
        <SplashBottom>
          <p>Original motion picture stills, portraits, and city fragments from the L.MARK archive.</p>
          <strong>{isLoading ? '0' : '100'}</strong>
        </SplashBottom>
      </Splash>

      <Modal
        isOpen={Boolean(modalPhoto && isValidUrl(modalImage))}
        onClose={() => setModalPhoto(null)}
        imageUrl={modalImage}
        title={modalPhoto?.title || ''}
        caption={modalPhoto?.description || ''}
      />
    </Page>
  );
}

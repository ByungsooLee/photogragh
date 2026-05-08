"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import styled, { css, keyframes } from 'styled-components';
import { useHomeCanvasPointerScroll } from '@/hooks/useHomeCanvasPointerScroll';
import { MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from '@/lib/breakpoints';
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

/** Treat movement below this threshold as a tap, restoring scroll so the modal can open. */
const FULL_MOBILE_TAP_MAX_PX = 14;
/** Fling threshold (scrollTarget / ms). Higher values make next/previous snapping less eager. */
const FULL_MOBILE_FLING_PX_PER_MS = 0.38;
const PROJECTOR_HANDLE_SCROLL_PER_DEGREE = 5.2;
const copies = [-1, 0, 1];
const desktopSlotLayout = [
  { shift: 4, left: 14, top: 16, scale: 1.04, rotate: -5.2, shape: 'portrait', primary: false },
  { shift: 2, left: 36, top: 9, scale: 1.28, rotate: 2.6, shape: 'wide', primary: true },
  { shift: -2, left: 63, top: 18, scale: 0.96, rotate: -2.8, shape: 'square', primary: false },
  { shift: 3, left: 84, top: 11, scale: 1.08, rotate: 4.4, shape: 'portrait', primary: false },
  { shift: -4, left: 24, top: 47, scale: 1.08, rotate: 3.8, shape: 'square', primary: false },
  { shift: 1, left: 54, top: 43, scale: 1.34, rotate: -3.2, shape: 'portrait', primary: true },
  { shift: -1, left: 80, top: 52, scale: 1.1, rotate: 2.2, shape: 'wide', primary: false },
  { shift: 4, left: 12, top: 79, scale: 1.16, rotate: -2.4, shape: 'wide', primary: false },
  { shift: -3, left: 45, top: 78, scale: 0.98, rotate: 4.8, shape: 'square', primary: false },
  { shift: 2, left: 72, top: 82, scale: 1.22, rotate: -4.2, shape: 'wide', primary: true },
  { shift: -5, left: 8, top: 39, scale: 0.92, rotate: 5.6, shape: 'portrait', primary: false },
  { shift: 5, left: 38, top: 58, scale: 1.02, rotate: -5.4, shape: 'wide', primary: false },
  { shift: -2, left: 63, top: 63, scale: 0.94, rotate: 3.6, shape: 'square', primary: false },
  { shift: 3, left: 92, top: 72, scale: 0.98, rotate: -6.2, shape: 'portrait', primary: false },
  { shift: -4, left: 27, top: 93, scale: 0.9, rotate: 2.8, shape: 'square', primary: false },
] as const;
const tabletSlotLayout = [
  { shift: 4, left: 12, top: 15, scale: 1.04, rotate: -5.8, shape: 'portrait', primary: false },
  { shift: 1, left: 43, top: 12, scale: 1.26, rotate: 2.8, shape: 'wide', primary: true },
  { shift: -3, left: 78, top: 19, scale: 1.06, rotate: -3.8, shape: 'square', primary: false },
  { shift: 3, left: 24, top: 44, scale: 1.18, rotate: 4.2, shape: 'wide', primary: false },
  { shift: -1, left: 58, top: 44, scale: 1.28, rotate: -2.6, shape: 'portrait', primary: true },
  { shift: 2, left: 87, top: 50, scale: 0.98, rotate: 5.2, shape: 'portrait', primary: false },
  { shift: -4, left: 15, top: 76, scale: 1.08, rotate: -2.2, shape: 'square', primary: false },
  { shift: 1, left: 48, top: 78, scale: 1.2, rotate: 4.8, shape: 'wide', primary: true },
  { shift: -2, left: 78, top: 80, scale: 1.02, rotate: -4.4, shape: 'square', primary: false },
] as const;
const mobileSlotLayout = [
  { shift: 4, left: 14, top: 12, scale: 1.08, rotate: -6.4, shape: 'portrait', primary: false },
  { shift: -2, left: 52, top: 15, scale: 1.22, rotate: 3.8, shape: 'wide', primary: true },
  { shift: 3, left: 82, top: 27, scale: 1.02, rotate: -4.6, shape: 'square', primary: false },
  { shift: -4, left: 25, top: 43, scale: 1.1, rotate: 4.8, shape: 'square', primary: false },
  { shift: 1, left: 62, top: 48, scale: 1.22, rotate: -3.4, shape: 'portrait', primary: true },
  { shift: 2, left: 86, top: 60, scale: 1.06, rotate: 5.4, shape: 'portrait', primary: false },
  { shift: -1, left: 17, top: 75, scale: 1.1, rotate: -3.2, shape: 'wide', primary: false },
  { shift: 4, left: 57, top: 81, scale: 1.2, rotate: 4.6, shape: 'wide', primary: true },
] as const;

const splashReveal = keyframes`
  0% { opacity: 1; transform: scale(0.982); filter: brightness(0.58) blur(8px); }
  52% { opacity: 1; transform: scale(1); filter: brightness(0.9) blur(0); }
  100% { opacity: 0; transform: scale(1.018); filter: brightness(0.76) blur(12px); }
`;

const titleIn = keyframes`
  from { opacity: 0; transform: translateY(0.72em); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const screenLine = keyframes`
  0% { transform: scaleX(0); opacity: 0; }
  38% { opacity: 0.88; }
  100% { transform: scaleX(1); opacity: 0.2; }
`;

const projectorDrift = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
`;

const projectorSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const projectorFlicker = keyframes`
  0%, 100% { opacity: 0.16; }
  45% { opacity: 0.24; }
  65% { opacity: 0.19; }
`;

const projectorHandleGlow = keyframes`
  0%, 100% {
    border-color: rgba(200, 204, 210, 0.78);
    box-shadow:
      0 0 0 1px rgba(8, 6, 4, 0.58),
      0 0 14px rgba(232, 238, 244, 0.16),
      inset 0 0 0 2px rgba(8, 6, 4, 0.62);
    filter: brightness(1);
  }
  45% {
    border-color: rgba(246, 235, 207, 0.98);
    box-shadow:
      0 0 0 1px rgba(8, 6, 4, 0.58),
      0 0 26px rgba(246, 235, 207, 0.42),
      0 0 42px rgba(248, 245, 239, 0.14),
      inset 0 0 0 2px rgba(8, 6, 4, 0.62);
    filter: brightness(1.18);
  }
`;

const projectorGripGlow = keyframes`
  0%, 100% {
    box-shadow:
      inset 0 0 0 2px rgba(8, 6, 4, 0.72),
      0 5px 12px rgba(0, 0, 0, 0.42);
  }
  45% {
    box-shadow:
      inset 0 0 0 2px rgba(8, 6, 4, 0.72),
      0 0 14px rgba(246, 235, 207, 0.62),
      0 5px 12px rgba(0, 0, 0, 0.42);
  }
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
  height: 100dvh;
  min-height: 100svh;
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
  background: radial-gradient(circle at 50% 42%, #181a1e 0%, #090a0c 52%, #020203 100%);
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
    border: 1px solid rgba(248, 245, 239, 0.14);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    &::before {
      background:
        radial-gradient(circle at 50% 42%, transparent 0 34%, rgba(0, 0, 0, 0.24) 68%, rgba(0, 0, 0, 0.62) 100%),
        linear-gradient(90deg, rgba(0, 0, 0, 0.52) 0 2vw, transparent 2vw calc(100% - 2vw), rgba(0, 0, 0, 0.52) calc(100% - 2vw));
      opacity: 0.42;
    }

    &::after {
      inset: 10px;
    }
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    &::after {
      inset: 7px;
    }
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
  top: clamp(92px, 10vh, 124px);
  left: 0;
  width: ${props => props.$width}px;
  height: clamp(610px, 78dvh, 780px);
  transform: translate3d(calc(${props => props.$baseX}px - var(--scroll-offset, 0px)), 0, 0);
  will-change: transform;
  pointer-events: ${props => props.$active ? 'auto' : 'none'};

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    top: clamp(116px, 13vh, 150px);
    height: clamp(520px, 70dvh, 680px);
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    top: clamp(118px, 14vh, 154px);
    height: clamp(430px, 64dvh, 580px);
  }
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

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    transform: translate3d(
      calc(-50% + ${props => (props.$shift || 0) * -10}px * var(--scroll-velocity, 0)),
      calc(-50% + ${props => (props.$shift || 0) * 26}px * var(--scroll-velocity, 0)),
      0
    ) rotate(${props => props.$rotate}deg) scale(${props => props.$scale * 0.96});
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    transform: translate3d(
      calc(-50% + ${props => (props.$shift || 0) * -8}px * var(--scroll-velocity, 0)),
      calc(-50% + ${props => (props.$shift || 0) * 18}px * var(--scroll-velocity, 0)),
      0
    ) rotate(${props => props.$rotate}deg) scale(${props => props.$scale * 0.9});
  }
`;

const PhotoButton = styled.button<{
  $active: boolean;
  $shape: 'square' | 'wide' | 'portrait';
  $primary: boolean;
}>`
  position: relative;
  width: ${props => {
    if (props.$primary && props.$shape === 'wide') return 'clamp(210px, 19vw, 320px)';
    if (props.$primary && props.$shape === 'portrait') return 'clamp(132px, 11vw, 188px)';
    if (props.$primary) return 'clamp(156px, 13vw, 220px)';
    if (props.$shape === 'wide') return 'clamp(166px, 14vw, 236px)';
    if (props.$shape === 'portrait') return 'clamp(96px, 8vw, 140px)';
    return 'clamp(124px, 10vw, 176px)';
  }};
  aspect-ratio: ${props => {
    if (props.$shape === 'wide') return '16 / 9';
    if (props.$shape === 'portrait') return '2 / 3';
    return '1 / 1';
  }};
  border: 1px solid rgba(248, 245, 239, 0.18);
  background:
    linear-gradient(135deg, #050506 0%, #14161a 50%, #020203 100%);
  cursor: zoom-in;
  overflow: hidden;
  opacity: ${props => props.$active ? 0.98 : 0.18};
  filter: ${props => props.$active ? 'saturate(0.92) contrast(1.06)' : 'grayscale(0.9) saturate(0.72) brightness(0.66)'};
  box-shadow:
    inset 0 0 0 4px #020203,
    inset 0 0 0 5px rgba(248, 245, 239, 0.14),
    0 0 0 1px rgba(255, 255, 255, 0.12),
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
    filter: saturate(1.02) contrast(1.1) brightness(1.12);
    box-shadow:
      inset 0 0 0 6px #020203,
      inset 0 0 0 7px rgba(248, 245, 239, 0.22),
      0 0 0 1px rgba(248, 245, 239, 0.58),
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
      radial-gradient(circle at 50% 12%, rgba(248, 245, 239, 0.2) 0%, rgba(205, 212, 220, 0.12) 18%, rgba(0, 0, 0, 0) 42%),
      radial-gradient(circle at 18% 50%, rgba(180, 190, 198, 0.1) 0%, rgba(0, 0, 0, 0) 34%),
      radial-gradient(circle at 82% 50%, rgba(180, 190, 198, 0.1) 0%, rgba(0, 0, 0, 0) 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(8, 10, 12, 0.24) 66%, rgba(0, 0, 0, 0.42));
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
        rgba(255, 255, 255, 0.026) 0 2px,
        rgba(96, 108, 118, 0.06) 2px 4px,
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

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    width: ${props => {
      if (props.$primary && props.$shape === 'wide') return 'clamp(206px, 30vw, 300px)';
      if (props.$primary && props.$shape === 'portrait') return 'clamp(126px, 18vw, 174px)';
      if (props.$primary) return 'clamp(160px, 22vw, 220px)';
      if (props.$shape === 'wide') return 'clamp(166px, 24vw, 238px)';
      if (props.$shape === 'portrait') return 'clamp(98px, 13vw, 134px)';
      return 'clamp(126px, 17vw, 172px)';
    }};
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: ${props => {
      if (props.$primary && props.$shape === 'wide') return '52vw';
      if (props.$primary && props.$shape === 'portrait') return '34vw';
      if (props.$primary) return '42vw';
      if (props.$shape === 'wide') return '44vw';
      if (props.$shape === 'portrait') return '28vw';
      return '34vw';
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
      filter: saturate(1.04) contrast(1.1) brightness(1.02);
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
  background: radial-gradient(circle at center, #17191d 0%, #050506 72%);
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
  height: 100dvh;
  width: ${props => props.$width}px;
  border: 1px solid rgba(246, 235, 207, 0.18);
  background: #020203;
  overflow: hidden;
  cursor: ${props => props.$active ? 'zoom-in' : 'pointer'};
  opacity: ${props => props.$active ? 1 : 0.24};
  filter: ${props => props.$active ? 'saturate(0.94) contrast(1.04)' : 'grayscale(1) saturate(0.7) brightness(0.62)'};
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

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
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
    touch-action: ${props => (props.$active ? 'none' : 'auto')};

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
  top: max(18px, calc(env(safe-area-inset-top, 0px) + 18px));
  left: 50%;
  width: 13px;
  height: 13px;
  transform: translateX(-50%);

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 9px;
    height: 9px;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: rgba(248, 245, 239, 0.84);
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

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    &::before {
      left: 4px;
      height: 9px;
    }

    &::after {
      top: 4px;
      width: 9px;
    }
  }
`;

const ModeSwitch = styled.div`
  position: absolute;
  right: max(16px, calc(env(safe-area-inset-right, 0px) + 16px));
  bottom: max(16px, calc(env(safe-area-inset-bottom, 0px) + 16px));
  display: flex;
  gap: 10px;
  pointer-events: auto;
  z-index: 2;

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
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

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    width: 46px;
    height: 46px;
    background: rgba(8, 6, 4, 0.72);
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

const ProjectorAccent = styled.div<{ $compact: boolean; $dragging: boolean }>`
  position: absolute;
  left: clamp(72px, 14vw, 180px);
  bottom: max(22px, calc(env(safe-area-inset-bottom, 0px) + 22px));
  width: ${props => props.$compact ? '178px' : '232px'};
  height: ${props => props.$compact ? '140px' : '162px'};
  z-index: 1;
  opacity: ${props => props.$dragging ? 1 : 0.9};
  transform: translate3d(0, calc(var(--scroll-speed, 0) * -5px), 0);
  transform-origin: left bottom;
  animation: ${projectorDrift} 4.8s ease-in-out infinite;
  pointer-events: auto;
  cursor: ${props => props.$dragging ? 'grabbing' : 'grab'};
  touch-action: none;
  user-select: none;

  &:focus-visible {
    outline: 1px solid rgba(246, 235, 207, 0.74);
    outline-offset: 6px;
  }

  @media (min-width: ${TABLET_BREAKPOINT + 1}px) {
    left: clamp(48px, 5vw, 92px);
    bottom: max(32px, calc(env(safe-area-inset-bottom, 0px) + 32px));
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    left: max(26px, calc(env(safe-area-inset-left, 0px) + 26px));
    bottom: max(26px, calc(env(safe-area-inset-bottom, 0px) + 26px));
    transform: translate3d(0, calc(var(--scroll-speed, 0) * -5px), 0);
  }
`;

const ProjectorBeam = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: ${props => props.$compact ? '72px' : '92px'};
  bottom: ${props => props.$compact ? '44px' : '58px'};
  width: min(${props => props.$compact ? '54vw' : '48vw'}, ${props => props.$compact ? '250px' : '390px'});
  height: ${props => props.$compact ? '104px' : '148px'};
  transform-origin: left center;
  transform:
    rotate(calc(-11deg + (var(--scroll-velocity, 0) * -7deg)))
    skewY(calc(var(--scroll-velocity, 0) * -1.6deg));
  opacity: calc(0.16 + (var(--scroll-speed, 0) * 0.16));
  filter: blur(1px);
  mix-blend-mode: screen;
  animation: ${projectorFlicker} 1.8s ease-in-out infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }

  &::before {
    clip-path: polygon(0 47%, 100% 0, 100% 100%);
    background:
      linear-gradient(90deg, rgba(246, 235, 207, 0.22) 0%, rgba(246, 235, 207, 0.11) 42%, rgba(246, 235, 207, 0) 100%),
      radial-gradient(circle at 0% 50%, rgba(232, 238, 244, 0.24), rgba(232, 238, 244, 0) 34%);
  }

  &::after {
    width: ${props => props.$compact ? '56px' : '84px'};
    height: ${props => props.$compact ? '56px' : '84px'};
    right: -6%;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 999px;
    background: radial-gradient(circle, rgba(246, 235, 207, 0.16), rgba(246, 235, 207, 0) 72%);
    filter: blur(2px);
  }
`;

const ProjectorMachine = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: 0;
  bottom: 0;
  width: ${props => props.$compact ? '136px' : '164px'};
  height: ${props => props.$compact ? '102px' : '116px'};
  filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.34));
`;

const ProjectorBody = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: ${props => props.$compact ? '24px' : '24px'};
  bottom: ${props => props.$compact ? '18px' : '22px'};
  width: ${props => props.$compact ? '74px' : '88px'};
  height: ${props => props.$compact ? '42px' : '48px'};
  border: 1px solid rgba(246, 235, 207, 0.32);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(28, 30, 34, 0.96), rgba(8, 9, 11, 0.96)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0));
  box-shadow:
    inset 0 0 0 1px rgba(246, 235, 207, 0.08),
    0 8px 18px rgba(0, 0, 0, 0.28);

  &::before {
    content: "";
    position: absolute;
    left: 8px;
    right: 8px;
    top: 9px;
    height: 1px;
    background: rgba(246, 235, 207, 0.18);
  }

  &::after {
    content: "";
    position: absolute;
    right: -18px;
    top: 11px;
    width: 24px;
    height: 12px;
    border: 1px solid rgba(246, 235, 207, 0.28);
    border-radius: 0 999px 999px 0;
    background: linear-gradient(90deg, rgba(31, 24, 16, 0.98), rgba(8, 6, 4, 0.92));
    box-shadow: inset 0 0 0 1px rgba(246, 235, 207, 0.08);
  }
`;

const ProjectorPanel = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: ${props => props.$compact ? '34px' : '34px'};
  bottom: ${props => props.$compact ? '33px' : '40px'};
  width: ${props => props.$compact ? '38px' : '44px'};
  height: ${props => props.$compact ? '16px' : '18px'};
  border: 1px solid rgba(248, 245, 239, 0.22);
  border-radius: 7px;
  background: rgba(8, 6, 4, 0.5);

  &::before {
    content: "";
    position: absolute;
    left: 6px;
    right: 6px;
    top: 50%;
    height: 1px;
    background: rgba(246, 235, 207, 0.18);
    transform: translateY(-50%);
  }
`;

const ProjectorLeg = styled.div<{ $left: number; $compact: boolean }>`
  position: absolute;
  left: ${props => props.$left}px;
  bottom: 0;
  width: 2px;
  height: ${props => props.$compact ? '24px' : '30px'};
  background: linear-gradient(180deg, rgba(248, 245, 239, 0.24), rgba(88, 94, 102, 0.62));
  transform-origin: top center;
  transform: rotate(${props => props.$left < 40 ? '-18deg' : props.$left > 70 ? '18deg' : '0deg'});
`;

const ProjectorReel = styled.div<{ $size: number; $left: number; $top: number }>`
  position: absolute;
  left: ${props => props.$left}px;
  top: ${props => props.$top}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 999px;
  border: 1px solid rgba(246, 235, 207, 0.34);
  background:
    radial-gradient(circle at center, rgba(246, 235, 207, 0.18) 0 14%, transparent 15%),
    radial-gradient(circle at center, transparent 0 35%, rgba(246, 235, 207, 0.12) 36% 41%, transparent 42%),
    linear-gradient(180deg, rgba(36, 28, 19, 0.95), rgba(8, 6, 4, 0.96));
  box-shadow:
    inset 0 0 0 1px rgba(246, 235, 207, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.22);
  transform: rotate(calc(var(--projector-handle-angle, 18deg) + (var(--scroll-velocity, 0) * 18deg)));

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 14%;
    border-radius: inherit;
    border: 1px solid rgba(246, 235, 207, 0.18);
  }

  &::after {
    inset: 21%;
    border: 0;
    background:
      conic-gradient(
        from 0deg,
        rgba(246, 235, 207, 0.18) 0deg 18deg,
        transparent 18deg 72deg,
        rgba(246, 235, 207, 0.15) 72deg 90deg,
        transparent 90deg 144deg,
        rgba(246, 235, 207, 0.18) 144deg 162deg,
        transparent 162deg 216deg,
        rgba(246, 235, 207, 0.15) 216deg 234deg,
        transparent 234deg 288deg,
        rgba(246, 235, 207, 0.18) 288deg 306deg,
        transparent 306deg 360deg
      );
    animation: ${projectorSpin} calc(9s - (var(--scroll-speed, 0) * 4s)) linear infinite;
  }
`;

const ProjectorHandle = styled.div<{ $compact: boolean; $dragging: boolean }>`
  position: absolute;
  left: ${props => props.$compact ? '-6px' : '-4px'};
  top: ${props => props.$compact ? '25px' : '36px'};
  z-index: 5;
  width: ${props => props.$compact ? '48px' : '54px'};
  height: ${props => props.$compact ? '48px' : '54px'};
  border-radius: 999px;
  border: 3px solid ${props => props.$dragging ? 'rgba(248, 245, 239, 0.96)' : 'rgba(200, 204, 210, 0.78)'};
  background:
    radial-gradient(circle at center, rgba(246, 235, 207, 0.72) 0 9%, rgba(8, 6, 4, 0.92) 10% 18%, transparent 19%),
    conic-gradient(
      from 10deg,
      transparent 0deg 28deg,
      rgba(246, 235, 207, 0.58) 28deg 35deg,
      transparent 35deg 88deg,
      rgba(246, 235, 207, 0.5) 88deg 95deg,
      transparent 95deg 148deg,
      rgba(246, 235, 207, 0.58) 148deg 155deg,
      transparent 155deg 208deg,
      rgba(246, 235, 207, 0.5) 208deg 215deg,
      transparent 215deg 268deg,
      rgba(246, 235, 207, 0.58) 268deg 275deg,
      transparent 275deg 360deg
    ),
    rgba(12, 9, 6, 0.94);
  box-shadow:
    0 0 0 1px rgba(8, 6, 4, 0.58),
    0 0 18px rgba(232, 238, 244, 0.18),
    inset 0 0 0 2px rgba(8, 6, 4, 0.62);
  transform-origin: center;
  transform: rotate(calc(var(--projector-handle-angle, 18deg) + (var(--scroll-velocity, 0) * 14deg)));
  transition: border-color 160ms ease, box-shadow 160ms ease;

  ${props => !props.$dragging && css`
    animation: ${projectorHandleGlow} 2.8s ease-in-out infinite;
  `}

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2px;
    height: 50%;
    border-radius: 999px;
    background:
      linear-gradient(180deg, rgba(248, 245, 239, 0.88), rgba(200, 204, 210, 0.38));
    transform: translate(-50%, -100%);
    transform-origin: center bottom;
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: ${props => props.$compact ? '-13px' : '-15px'};
    width: ${props => props.$compact ? '18px' : '21px'};
    height: ${props => props.$compact ? '18px' : '21px'};
    border-radius: 999px;
    border: 2px solid ${props => props.$dragging ? 'rgba(248, 245, 239, 0.98)' : 'rgba(200, 204, 210, 0.78)'};
    background:
      radial-gradient(circle at 35% 35%, rgba(248, 245, 239, 0.92), rgba(200, 204, 210, 0.28) 38%, rgba(10, 11, 13, 0.96) 70%);
    box-shadow:
      inset 0 0 0 2px rgba(8, 6, 4, 0.72),
      0 5px 12px rgba(0, 0, 0, 0.42);
    transform: translateX(-50%);

    ${props => !props.$dragging && css`
      animation: ${projectorGripGlow} 2.8s ease-in-out infinite;
    `}
  }
`;

const ProjectorLabel = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: ${props => props.$compact ? '76px' : '86px'};
  bottom: ${props => props.$compact ? '70px' : '76px'};
  color: rgba(246, 235, 207, 0.66);
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: ${props => props.$compact ? '0.56rem' : '0.7rem'};
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const Splash = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: ${props => props.$hidden ? 'none' : 'block'};
  background:
    radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.12) 0 1px, transparent 2px),
    radial-gradient(circle at 50% 45%, rgba(95, 103, 112, 0.24) 0%, rgba(10, 11, 13, 0.92) 42%, #020203 82%),
    linear-gradient(180deg, #0c0d10, #020203 76%);
  color: var(--paper-soft);
  pointer-events: none;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 8vw;
    right: 8vw;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(248, 245, 239, 0.72), transparent);
    transform-origin: center;
    animation: ${screenLine} 1800ms cubic-bezier(.32,.94,.6,1) 180ms forwards;
    opacity: 0;
  }

  &::after {
    top: calc(50% + clamp(84px, 13vw, 180px));
    animation-delay: 360ms;
    opacity: 0;
  }
`;

const SplashImage = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  animation: ${splashReveal} 1900ms cubic-bezier(.65,0,.35,1) forwards;

  > div {
    position: relative;
    width: min(48vw, 620px);
    aspect-ratio: 21 / 9;
    overflow: hidden;
    border: 1px solid rgba(248, 245, 239, 0.2);
    background: #030304;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.04),
      0 32px 90px rgba(0, 0, 0, 0.58),
      0 0 70px rgba(210, 218, 224, 0.1);

    img {
      filter: grayscale(0.24) saturate(0.72) contrast(1.08) brightness(0.72);
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 50%, transparent 0 42%, rgba(0, 0, 0, 0.5) 100%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 34%, rgba(0, 0, 0, 0.4));
      pointer-events: none;
    }
  }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    > div {
      width: min(68vw, 520px);
    }
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    > div {
      width: min(82vw, 360px);
      box-shadow: 0 24px 56px rgba(0, 0, 0, 0.52);
    }
  }
`;

const SplashTitle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
  font-size: clamp(68px, 12vw, 220px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 0.84;
  text-transform: uppercase;
  color: rgba(248, 245, 239, 0.94);
  text-shadow:
    0 18px 52px rgba(0, 0, 0, 0.72),
    0 0 44px rgba(255, 255, 255, 0.12);

  span {
    display: inline-block;
    opacity: 0;
    transform: translateY(0.72em);
    animation: ${titleIn} 1100ms cubic-bezier(.32,.94,.6,1) forwards;
    animation-delay: 220ms;
  }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    font-size: clamp(74px, 16vw, 180px);
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    font-size: clamp(54px, 20vw, 112px);
    letter-spacing: 0.02em;
    line-height: 0.8;
  }
`;

const SplashBottom = styled.div`
  position: absolute;
  left: clamp(18px, 4vw, 56px);
  right: clamp(18px, 4vw, 56px);
  bottom: max(22px, calc(env(safe-area-inset-bottom, 0px) + 22px));
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  gap: 20px;
  opacity: 0;
  animation: ${fadeUp} 900ms cubic-bezier(.32,.94,.6,1) 420ms forwards;

  p {
    grid-column: 2;
    color: rgba(248, 245, 239, 0.66);
    font-size: clamp(12px, 0.82vw, 15px);
    line-height: 1.55;
    letter-spacing: 0.14em;
    text-align: center;
    text-transform: uppercase;
  }

  strong {
    justify-self: end;
    color: rgba(248, 245, 239, 0.86);
    font-family: var(--font-bebas-neue), var(--font-inter), sans-serif;
    font-size: clamp(22px, 2.2vw, 38px);
    font-weight: 400;
    letter-spacing: 0.18em;
    line-height: 1;
    text-transform: uppercase;
  }

  @media (max-width: ${TABLET_BREAKPOINT}px) {
    left: 24px;
    right: 24px;
    gap: 14px;

    p {
      font-size: clamp(11px, 1.2vw, 14px);
      line-height: 1.45;
      letter-spacing: 0.08em;
    }

    strong {
      font-size: clamp(40px, 7vw, 76px);
    }
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    grid-template-columns: 1fr;
    left: 18px;
    right: 18px;
    gap: 10px;

    p,
    strong {
      grid-column: 1;
      justify-self: start;
    }

    p {
      max-width: 19rem;
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

function normalizeAngleDelta(delta: number) {
  return ((delta + 180) % 360 + 360) % 360 - 180;
}

function getProjectorHandleAngle(event: ReactPointerEvent<HTMLElement>, compact: boolean) {
  const rect = event.currentTarget.getBoundingClientRect();
  const pivotX = rect.left + (compact ? 18 : 23);
  const pivotY = rect.bottom - (compact ? 102 : 116) + (compact ? 49 : 63);
  return Math.atan2(event.clientY - pivotY, event.clientX - pivotX) * 180 / Math.PI;
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
  const fullMobileGestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startScrollTarget: number;
    lastTime: number;
    lastScrollTarget: number;
    velocity: number;
    maxAbsDelta: number;
  } | null>(null);
  const projectorGestureRef = useRef<{
    pointerId: number;
    lastAngle: number;
    lastMoveTime: number;
  } | null>(null);
  const suppressFullCenterClickRef = useRef(false);

  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<Mode>('grid');
  const [activeStreamSection, setActiveStreamSection] = useState(0);
  const [fullIndex, setFullIndex] = useState(0);
  const [viewport, setViewport] = useState<Viewport>({ width: 1440, height: 900 });
  const [modalPhoto, setModalPhoto] = useState<GalleryItem | null>(null);
  const [modalSession, setModalSession] = useState(0);
  const [projectorHandleAngle, setProjectorHandleAngle] = useState(18);
  const [isProjectorDragging, setIsProjectorDragging] = useState(false);
  const isMobileViewport = viewport.width < MOBILE_BREAKPOINT;
  const isTabletViewport = viewport.width < TABLET_BREAKPOINT;
  const currentSlotLayout = isMobileViewport
    ? mobileSlotLayout
    : isTabletViewport
      ? tabletSlotLayout
      : desktopSlotLayout;

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

  const sectionWidth = isMobileViewport
    ? Math.min(Math.max(320, viewport.width * 0.88), 520)
    : isTabletViewport
      ? Math.min(Math.max(560, viewport.width * 0.78), 840)
      : Math.min(Math.max(760, viewport.width * 0.58), 1080);
  const streamSectionCount = Math.max(18, Math.min(42, Math.ceil(Math.max(photoPool.length, 1) / currentSlotLayout.length)));
  const loopWidth = sectionWidth * streamSectionCount;
  const randomSections = useMemo(() => {
    const recentIds = new Set<string>();
    const recentQueue: string[] = [];
    const recentLimit = Math.max(currentSlotLayout.length, Math.min(72, Math.floor(photoPool.length * 0.72)));

    return Array.from({ length: streamSectionCount }, (_, sectionIndex) => {
      const photosForSection = currentSlotLayout.map((_, slotIndex) => {
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
  }, [activeStreamSection, currentSlotLayout, photoPool, streamSectionCount]);
  const fullPhotos = useMemo(() => {
    const flattened = randomSections.flatMap((section) => section.photos).filter((photo): photo is RandomPhoto => Boolean(photo));
    return flattened.length ? flattened : photoPool;
  }, [photoPool, randomSections]);
  const currentPhoto = getSectionPhoto(fullPhotos, fullIndex);
  const prevPhoto = getSectionPhoto(fullPhotos, fullIndex - 1 + Math.max(fullPhotos.length, 1));
  const nextPhoto = getSectionPhoto(fullPhotos, fullIndex + 1);
  const modalImage = photoSrc(modalPhoto, 'original');
  const isModalOpen = Boolean(modalPhoto && isValidUrl(modalImage));
  const tone = 'dark';
  const isImmersiveMobile = isMobileViewport && isModalOpen;
  const thumbnailSizes = isMobileViewport ? '38vw' : isTabletViewport ? '18vw' : '12vw';
  const showProjectorAccent = !isImmersiveMobile;

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
    if (!isModalOpen) return;
    fullMobileGestureRef.current = null;
    projectorGestureRef.current = null;
    setIsProjectorDragging(false);
  }, [isModalOpen]);

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useHomeCanvasPointerScroll({
    pageRef,
    isModalOpen,
    isMobileViewport,
    isTabletViewport,
    mode,
    scrollTargetRef,
  });

  const handleProjectorPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isModalOpen) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      const angle = getProjectorHandleAngle(event, isMobileViewport);
      projectorGestureRef.current = {
        pointerId: event.pointerId,
        lastAngle: angle,
        lastMoveTime: performance.now(),
      };
      setProjectorHandleAngle(angle);
      setIsProjectorDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isMobileViewport, isModalOpen]
  );

  const handleProjectorPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const gesture = projectorGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      const nextAngle = getProjectorHandleAngle(event, isMobileViewport);
      const delta = normalizeAngleDelta(nextAngle - gesture.lastAngle);
      const now = performance.now();
      const elapsed = Math.max(now - gesture.lastMoveTime, 16);

      scrollTargetRef.current += delta * PROJECTOR_HANDLE_SCROLL_PER_DEGREE * (isMobileViewport ? 0.86 : 1);
      // Add a little inertia only on fast turns so the crank feels mechanical.
      scrollTargetRef.current += (delta / elapsed) * sectionWidth * 0.18;
      gesture.lastAngle = nextAngle;
      gesture.lastMoveTime = now;
      setProjectorHandleAngle(nextAngle);
    },
    [isMobileViewport, sectionWidth]
  );

  const handleProjectorPointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = projectorGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    projectorGestureRef.current = null;
    setIsProjectorDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Some environments may not have an active capture. */
    }
  }, []);

  const handleProjectorKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (isModalOpen) return;
      const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (direction === 0) return;

      event.preventDefault();
      const angleDelta = direction * 28;
      setProjectorHandleAngle((angle) => angle + angleDelta);
      scrollTargetRef.current += angleDelta * PROJECTOR_HANDLE_SCROLL_PER_DEGREE;
    },
    [isModalOpen]
  );

  const handleFullMobileActivePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (isModalOpen || !isMobileViewport || mode !== 'full') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const startScrollTarget = scrollTargetRef.current;
      const now = performance.now();
      fullMobileGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScrollTarget,
        lastTime: now,
        lastScrollTarget: startScrollTarget,
        velocity: 0,
        maxAbsDelta: 0,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isModalOpen, isMobileViewport, mode]
  );

  const handleFullMobileActivePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const g = fullMobileGestureRef.current;
    if (!g || event.pointerId !== g.pointerId) return;

    const dx = g.startX - event.clientX;
    const dy = g.startY - event.clientY;
    g.maxAbsDelta = Math.max(g.maxAbsDelta, Math.hypot(dx, dy));

    const axisDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    const nextTarget = g.startScrollTarget + axisDelta * 1.65;
    const now = performance.now();
    const dt = now - g.lastTime;
    if (dt > 0) {
      g.velocity = (nextTarget - g.lastScrollTarget) / dt;
    }
    g.lastTime = now;
    g.lastScrollTarget = nextTarget;
    scrollTargetRef.current = nextTarget;
  }, []);

  const handleFullMobileActivePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const g = fullMobileGestureRef.current;
      if (!g || event.pointerId !== g.pointerId) return;

      const { maxAbsDelta, velocity, startScrollTarget } = g;
      fullMobileGestureRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* Some environments may not have an active capture. */
      }

      const w = sectionWidth;
      if (maxAbsDelta <= FULL_MOBILE_TAP_MAX_PX) {
        scrollTargetRef.current = startScrollTarget;
        return;
      }

      suppressFullCenterClickRef.current = true;
      if (w <= 0) return;

      const r = scrollTargetRef.current / w;
      let n: number;
      if (velocity > FULL_MOBILE_FLING_PX_PER_MS) n = Math.ceil(r - 1e-6);
      else if (velocity < -FULL_MOBILE_FLING_PX_PER_MS) n = Math.floor(r + 1e-6);
      else n = Math.round(r);
      scrollTargetRef.current = n * w;
    },
    [sectionWidth]
  );

  const openPhoto = (photo?: GalleryItem | null) => {
    if (!photo) return;
    setModalSession((session) => session + 1);
    setModalPhoto(photo);
  };

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    scrollTargetRef.current += sectionWidth * (isMobileViewport ? 1.05 : isTabletViewport ? 1.7 : 2.5);
  };

  const projectorStyle = {
    '--projector-handle-angle': `${projectorHandleAngle.toFixed(2)}deg`,
  } as CSSProperties & Record<'--projector-handle-angle', string>;

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
                {currentSlotLayout.map((layout, slot) => {
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
                            $primary={layout.primary}
                            onClick={() => openPhoto(photo.photo)}
                            aria-label={`View ${photo.photo.title || 'photo'}`}
                          >
                            <Image
                              src={photo.mediumSrc}
                              alt={photo.photo.title || ''}
                              fill
                              sizes={thumbnailSizes}
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
            { photo: currentPhoto, x: 0, active: true, label: `View ${currentPhoto?.photo.title || 'photo'}` },
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
                onPointerDown={panel.active && isMobileViewport && mode === 'full' ? handleFullMobileActivePointerDown : undefined}
                onPointerMove={panel.active && isMobileViewport && mode === 'full' ? handleFullMobileActivePointerMove : undefined}
                onPointerUp={panel.active && isMobileViewport && mode === 'full' ? handleFullMobileActivePointerEnd : undefined}
                onPointerCancel={panel.active && isMobileViewport && mode === 'full' ? handleFullMobileActivePointerEnd : undefined}
                onClick={() => {
                  if (!panel.active) {
                    scrollTargetRef.current += panel.x > 0 ? sectionWidth : -sectionWidth;
                    return;
                  }
                  if (isMobileViewport && mode === 'full' && suppressFullCenterClickRef.current) {
                    suppressFullCenterClickRef.current = false;
                    return;
                  }
                  openPhoto(panel.photo?.photo);
                }}
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
            {showProjectorAccent && (
              <ProjectorAccent
                $compact={isMobileViewport}
                $dragging={isProjectorDragging}
                aria-label="Turn the projector handle to move through photos"
                aria-valuemax={180}
                aria-valuemin={-180}
                aria-valuenow={Math.round(projectorHandleAngle)}
                onPointerCancel={handleProjectorPointerEnd}
                onPointerDown={handleProjectorPointerDown}
                onPointerMove={handleProjectorPointerMove}
                onPointerUp={handleProjectorPointerEnd}
                onKeyDown={handleProjectorKeyDown}
                role="slider"
                style={projectorStyle}
                tabIndex={0}
              >
                <ProjectorBeam $compact={isMobileViewport} />
                <ProjectorMachine $compact={isMobileViewport}>
                  <ProjectorLabel $compact={isMobileViewport}>Hand Crank Cinema</ProjectorLabel>
                  <ProjectorReel $size={isMobileViewport ? 30 : 42} $left={isMobileViewport ? 12 : 16} $top={isMobileViewport ? 10 : 12} />
                  <ProjectorReel $size={isMobileViewport ? 24 : 34} $left={isMobileViewport ? 48 : 64} $top={isMobileViewport ? 2 : 4} />
                  <ProjectorHandle $compact={isMobileViewport} $dragging={isProjectorDragging} />
                  <ProjectorBody $compact={isMobileViewport} />
                  <ProjectorPanel $compact={isMobileViewport} />
                  <ProjectorLeg $compact={isMobileViewport} $left={isMobileViewport ? 28 : 40} />
                  <ProjectorLeg $compact={isMobileViewport} $left={isMobileViewport ? 54 : 74} />
                  <ProjectorLeg $compact={isMobileViewport} $left={isMobileViewport ? 80 : 108} />
                </ProjectorMachine>
              </ProjectorAccent>
            )}
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
          <p>Lights down. A quiet passage into the L.MARK archive.</p>
          <strong>{isLoading ? 'Opening' : 'Now Showing'}</strong>
        </SplashBottom>
      </Splash>

      {isModalOpen && (
        <Modal
          key={`home-modal-${modalSession}`}
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

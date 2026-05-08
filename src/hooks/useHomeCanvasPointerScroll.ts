'use client';

import type { MutableRefObject, PointerEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

type Options = {
  pageRef: RefObject<HTMLElement | null>;
  isModalOpen: boolean;
  isMobileViewport: boolean;
  isTabletViewport: boolean;
  mode?: 'grid' | 'full';
  scrollTargetRef: MutableRefObject<number>;
};

/**
 * トップの横スクロールキャンバス用: モーダル表示中は wheel / pointer によるスクロールを無効化する。
 * Portal 越しにイベントが親へ伝播するケースを想定し、isModalOpen で明示的にガードする。
 */
export function useHomeCanvasPointerScroll({
  pageRef,
  isModalOpen,
  isMobileViewport,
  isTabletViewport,
  mode = 'grid',
  scrollTargetRef,
}: Options) {
  const touchStartRef = useRef<{ x: number; y: number; scroll: number } | null>(null);

  useEffect(() => {
    const node = pageRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isModalOpen) return;
      const axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      scrollTargetRef.current +=
        axis * (isMobileViewport ? 1.32 : isTabletViewport ? 1.22 : 1.18);
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [isMobileViewport, isModalOpen, isTabletViewport, pageRef, scrollTargetRef]);

  useEffect(() => {
    if (!isModalOpen) return;
    touchStartRef.current = null;
  }, [isModalOpen]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (isModalOpen) return;
      if (isTabletViewport && mode === 'grid') return;
      if ((event.target as HTMLElement).closest('button, a')) return;
      touchStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        scroll: scrollTargetRef.current,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isModalOpen, isTabletViewport, mode, scrollTargetRef]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (isModalOpen) return;
      if (!touchStartRef.current) return;
      const dx = touchStartRef.current.x - event.clientX;
      const dy = touchStartRef.current.y - event.clientY;
      scrollTargetRef.current =
        touchStartRef.current.scroll + (Math.abs(dx) > Math.abs(dy) ? dx : dy) * 1.65;
    },
    [isModalOpen, scrollTargetRef]
  );

  const handlePointerUp = useCallback(() => {
    if (isModalOpen) return;
    touchStartRef.current = null;
  }, [isModalOpen]);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}

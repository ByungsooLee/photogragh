'use client';

import { useEffect, useState } from 'react';

/**
 * `(max-width: maxWidthPx px)` を matchMedia で購読する。
 * SSR 初回は false（クライアントで同期後に更新）。
 */
export function useIsMaxWidth(maxWidthPx: number): boolean {
  const query = `(max-width: ${maxWidthPx}px)`;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

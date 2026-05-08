'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to `(max-width: maxWidthPx px)` with matchMedia.
 * The first SSR pass returns false, then syncs on the client.
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
